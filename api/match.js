import supabase from './db-client.js';

// Haversine formula to calculate distance in miles between two lat/lng coordinates
function getDistanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
      patient_lat,
      patient_lng,
      condition_severity, // 'Critical / Life-Threatening', 'Severe / Urgent', 'Moderate', 'Low'
      required_specialties = [],
      transport_mode = 'Ambulance', // 'Ambulance', 'Helicopter', 'Self-Drive'
      patient_age,
      vitals = {}
    } = req.body;

    if (patient_lat == null || patient_lng == null) {
      return res.status(400).json({ error: 'Patient coordinates (lat, lng) are required' });
    }

    // Fetch all active hospitals
    const { data: hospitals, error } = await supabase
      .from('hospitals')
      .select('*');

    if (error) throw error;

    const scoredHospitals = hospitals.map(h => {
      const distance = getDistanceMiles(patient_lat, patient_lng, h.lat, h.lng);

      // Estimate travel time in minutes based on transport mode & traffic factor
      let avgSpeedMph = transport_mode === 'Helicopter' ? 140 : (transport_mode === 'Ambulance' ? 45 : 35);
      let travelMinutes = Math.max(2, Math.round((distance / avgSpeedMph) * 60));

      // 1. Distance & Travel Score (0-30 pts)
      // Max score if under 3 miles, diminishing after 25 miles
      let distanceScore = 0;
      if (distance <= 3) distanceScore = 30;
      else if (distance <= 10) distanceScore = 30 - ((distance - 3) * 1.5);
      else if (distance <= 25) distanceScore = 19.5 - ((distance - 10) * 0.9);
      else distanceScore = Math.max(2, 6 - ((distance - 25) * 0.1));

      // 2. Specialty Match Score (0-30 pts)
      let matchedSpecialties = [];
      let missingSpecialties = [];
      let specialtyScore = 0;

      if (required_specialties.length === 0) {
        specialtyScore = 30; // Default case
      } else {
        const hSpecs = Array.isArray(h.specialties) ? h.specialties : [];
        required_specialties.forEach(spec => {
          if (hSpecs.includes(spec)) {
            matchedSpecialties.push(spec);
          } else {
            missingSpecialties.push(spec);
          }
        });
        const ratio = matchedSpecialties.length / required_specialties.length;
        specialtyScore = Math.round(ratio * 30);
      }

      // 3. Capacity & Availability Score (0-20 pts)
      let capacityScore = 0;
      const erAvailablePct = 100 - (h.er_capacity_pct || 0);
      const icuAvailable = h.icu_beds_available || 0;

      if (!h.accepting_emergency || h.status === 'Critical / Divert') {
        capacityScore = 0; // Heavy penalty for diversion
      } else {
        // Higher availability = higher score
        const erScorePart = (erAvailablePct / 100) * 12;
        const icuScorePart = Math.min(8, icuAvailable * 2);
        capacityScore = erScorePart + icuScorePart;
      }

      // 4. Trauma & Facility Capabilities Score (0-10 pts)
      let traumaScore = 5;
      if (condition_severity === 'Critical / Life-Threatening') {
        if (h.trauma_level === 'Level 1') traumaScore = 10;
        else if (h.trauma_level === 'Level 2') traumaScore = 8;
        else if (h.trauma_level === 'Level 3') traumaScore = 5;
        else traumaScore = 2;
      } else if (condition_severity === 'Severe / Urgent') {
        if (h.trauma_level === 'Level 1' || h.trauma_level === 'Level 2') traumaScore = 10;
        else traumaScore = 7;
      } else {
        traumaScore = 8; // Community or regional is fine for moderate/low
      }

      // Helipad bonus if helicopter transport requested
      if (transport_mode === 'Helicopter') {
        if (h.helipad) traumaScore += 2;
        else traumaScore -= 5; // cannot land without helipad
      }

      // 5. ER Wait Time Score (0-10 pts)
      let waitScore = 10;
      const wait = h.avg_wait_minutes || 0;
      if (wait <= 10) waitScore = 10;
      else if (wait <= 30) waitScore = 8;
      else if (wait <= 60) waitScore = 5;
      else waitScore = 2;

      // Calculate overall score (0 - 100%)
      let totalRaw = distanceScore + specialtyScore + capacityScore + traumaScore + waitScore;

      // Penalties:
      if (h.status === 'Critical / Divert') totalRaw *= 0.3; // 70% drop if on divert
      if (!h.accepting_emergency) totalRaw *= 0.1; // 90% drop if not accepting emergency

      const totalScore = Math.min(99.8, Math.max(5.0, Number(totalRaw.toFixed(1))));

      // Generate AI rationale breakdown
      const reasoning = [];
      if (matchedSpecialties.length > 0) {
        reasoning.push(`Offers required key specialty: ${matchedSpecialties.join(', ')}.`);
      }
      if (missingSpecialties.length > 0) {
        reasoning.push(`Lacks: ${missingSpecialties.join(', ')}.`);
      }
      if (distance <= 5) {
        reasoning.push(`Very close proximity (${distance.toFixed(1)} miles, ~${travelMinutes} min).`);
      } else {
        reasoning.push(`Distance: ${distance.toFixed(1)} miles (~${travelMinutes} min ETA).`);
      }

      if (h.icu_beds_available > 0) {
        reasoning.push(`${h.icu_beds_available} ICU beds currently available.`);
      } else {
        reasoning.push(`ICU capacity is currently full.`);
      }

      if (h.status === 'Critical / Divert') {
        reasoning.push(`WARNING: Hospital currently on Emergency Diversion.`);
      } else {
        reasoning.push(`ER capacity load is at ${h.er_capacity_pct}%.`);
      }

      return {
        hospital: h,
        distance_miles: Number(distance.toFixed(1)),
        eta_minutes: travelMinutes,
        match_score: totalScore,
        matched_specialties: matchedSpecialties,
        missing_specialties: missingSpecialties,
        breakdown: {
          distance: Number(distanceScore.toFixed(1)),
          specialty: Number(specialtyScore.toFixed(1)),
          capacity: Number(capacityScore.toFixed(1)),
          trauma: Number(traumaScore.toFixed(1)),
          wait: Number(waitScore.toFixed(1))
        },
        reasoning
      };
    });

    // Sort by match score descending
    scoredHospitals.sort((a, b) => b.match_score - a.match_score);

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      patient_input: {
        patient_lat,
        patient_lng,
        condition_severity,
        required_specialties,
        transport_mode
      },
      matches: scoredHospitals
    });

  } catch (err) {
    console.error('API match error:', err);
    res.status(500).json({ error: err.message });
  }
}
