import React, { useState, useEffect } from 'react';
import { Hospital, MatchResult, Referral } from './types';
import { Navbar } from './components/Navbar';
import { MapView } from './components/MapView';
import { TriageForm } from './components/TriageForm';
import { HospitalManager } from './components/HospitalManager';
import { ReferralLogs } from './components/ReferralLogs';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'triage' | 'hospitals' | 'referrals' | 'analytics'>('map');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [patientLocation, setPatientLocation] = useState<{ lat: number; lng: number; label?: string } | null>({
    lat: 41.8781,
    lng: -87.6298,
    label: 'Downtown Emergency Dispatch'
  });
  const [matchedResults, setMatchedResults] = useState<MatchResult[] | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);

  // Fetch Hospitals
  const fetchHospitals = async () => {
    try {
      const res = await fetch('/api/hospitals');
      if (res.ok) {
        const data = await res.json();
        setHospitals(data);
      }
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
    }
  };

  // Fetch Referrals
  const fetchReferrals = async () => {
    try {
      const res = await fetch('/api/referrals');
      if (res.ok) {
        const data = await res.json();
        setReferrals(data);
      }
    } catch (err) {
      console.error('Failed to fetch referrals:', err);
    }
  };

  useEffect(() => {
    fetchHospitals();
    fetchReferrals();
  }, []);

  // Run AI Match
  const handleRunMatch = async (params: any) => {
    setIsMatching(true);
    setPatientLocation({
      lat: params.patient_lat,
      lng: params.patient_lng,
      label: params.chief_complaint?.slice(0, 30) + '...'
    });

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (res.ok) {
        const data = await res.json();
        setMatchedResults(data.matches);
        if (data.matches && data.matches.length > 0) {
          setSelectedHospital(data.matches[0].hospital);
        }
      }
    } catch (err) {
      console.error('Failed to run match:', err);
    } finally {
      setIsMatching(false);
    }
  };

  // Dispatch Referral
  const handleDispatchReferral = async (hospital: Hospital, patientData?: any) => {
    const matchInfo = matchedResults?.find(m => m.hospital.id === hospital.id);

    const referralPayload = {
      patient_name: patientData?.patientName || 'Emergency Referral',
      age: patientData?.age || 50,
      gender: patientData?.gender || 'Unspecified',
      condition_severity: patientData?.severity || 'Critical / Life-Threatening',
      chief_complaint: patientData?.chiefComplaint || 'Acute Emergency Dispatch',
      required_specialties: patientData?.selectedSpecialties || hospital.specialties,
      patient_lat: patientLocation?.lat || 41.8781,
      patient_lng: patientLocation?.lng || -87.6298,
      assigned_hospital_id: hospital.id,
      assigned_hospital_name: hospital.name,
      match_score: matchInfo ? matchInfo.match_score : 95,
      eta_minutes: matchInfo ? matchInfo.eta_minutes : 12,
      transport_mode: patientData?.transportMode || 'Ambulance',
      status: 'Dispatched'
    };

    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(referralPayload)
      });

      if (res.ok) {
        await fetchReferrals();
        await fetchHospitals(); // Refresh capacity
        setActiveTab('referrals');
      }
    } catch (err) {
      console.error('Dispatch error:', err);
    }
  };

  // Hospital Capacity Updates
  const handleUpdateHospital = async (updated: Partial<Hospital> & { id: number }) => {
    try {
      const res = await fetch('/api/hospitals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        await fetchHospitals();
      }
    } catch (err) {
      console.error('Update hospital failed:', err);
    }
  };

  // Create Hospital
  const handleCreateHospital = async (newHosp: Omit<Hospital, 'id'>) => {
    try {
      const res = await fetch('/api/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHosp)
      });
      if (res.ok) {
        await fetchHospitals();
      }
    } catch (err) {
      console.error('Create hospital failed:', err);
    }
  };

  // Referral Status Update
  const handleUpdateReferralStatus = async (id: number, status: Referral['status']) => {
    try {
      const res = await fetch('/api/referrals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        await fetchReferrals();
      }
    } catch (err) {
      console.error('Update referral status failed:', err);
    }
  };

  const activeReferralsCount = referrals.filter(r => r.status !== 'Completed' && r.status !== 'Cancelled').length;
  const divertCount = hospitals.filter(h => h.status === 'Critical / Divert').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-rose-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeReferralsCount={activeReferralsCount}
        divertCount={divertCount}
      />

      <main className="flex-1">
        {activeTab === 'map' && (
          <MapView
            hospitals={hospitals}
            patientLocation={patientLocation}
            matchedHospitals={matchedResults || undefined}
            selectedHospital={selectedHospital}
            onSelectHospital={setSelectedHospital}
            onDispatchReferral={(h) => handleDispatchReferral(h)}
            isPickingLocation={isPickingLocation}
            onLocationPick={(lat, lng) => {
              setPatientLocation({ lat, lng, label: 'Picked Pin Location' });
              setIsPickingLocation(false);
              setActiveTab('triage');
            }}
          />
        )}

        {activeTab === 'triage' && (
          <TriageForm
            onRunMatch={handleRunMatch}
            isLoading={isMatching}
            matchedResults={matchedResults}
            onDispatch={(match, data) => handleDispatchReferral(match.hospital, data)}
            onSetLocationFromMap={() => {
              setIsPickingLocation(true);
              setActiveTab('map');
            }}
          />
        )}

        {activeTab === 'hospitals' && (
          <HospitalManager
            hospitals={hospitals}
            onUpdateHospital={handleUpdateHospital}
            onCreateHospital={handleCreateHospital}
          />
        )}

        {activeTab === 'referrals' && (
          <ReferralLogs
            referrals={referrals}
            onUpdateStatus={handleUpdateReferralStatus}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            hospitals={hospitals}
            referrals={referrals}
          />
        )}
      </main>
    </div>
  );
}
