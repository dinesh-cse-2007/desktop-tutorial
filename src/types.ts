export interface Hospital {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  phone: string;
  trauma_level: 'Level 1' | 'Level 2' | 'Level 3' | 'Community';
  er_capacity_pct: number;
  icu_beds_available: number;
  total_icu_beds: number;
  specialties: string[];
  accepting_emergency: boolean;
  avg_wait_minutes: number;
  helipad: boolean;
  rating: number;
  status: 'Optimal' | 'High Load' | 'Critical / Divert';
}

export interface MatchResult {
  hospital: Hospital;
  distance_miles: number;
  eta_minutes: number;
  match_score: number;
  matched_specialties: string[];
  missing_specialties: string[];
  breakdown: {
    distance: number;
    specialty: number;
    capacity: number;
    trauma: number;
    wait: number;
  };
  reasoning: string[];
}

export interface Referral {
  id: number;
  patient_name: string;
  age: number;
  gender: string;
  condition_severity: 'Critical / Life-Threatening' | 'Severe / Urgent' | 'Moderate' | 'Low';
  chief_complaint: string;
  required_specialties: string[];
  patient_lat: number;
  patient_lng: number;
  assigned_hospital_id: number;
  assigned_hospital_name: string;
  match_score: number;
  eta_minutes: number;
  transport_mode: 'Ambulance' | 'Helicopter' | 'Self-Drive';
  status: 'Dispatched' | 'En Route' | 'Accepted' | 'Completed' | 'Cancelled';
  created_at: string;
}

export interface PatientVitals {
  heart_rate?: number;
  blood_pressure?: string;
  spo2?: number;
  gcs_score?: number;
}
