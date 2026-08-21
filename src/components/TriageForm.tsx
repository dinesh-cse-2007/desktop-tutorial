import React, { useState } from 'react';
import { MatchResult, Hospital } from '../types';
import { Activity, ShieldAlert, Sparkles, Navigation, Heart, ArrowRight, MapPin, Compass, CheckCircle2, Clock } from 'lucide-react';

interface TriageFormProps {
  onRunMatch: (params: {
    patient_lat: number;
    patient_lng: number;
    patient_age: number;
    gender: string;
    condition_severity: 'Critical / Life-Threatening' | 'Severe / Urgent' | 'Moderate' | 'Low';
    chief_complaint: string;
    required_specialties: string[];
    transport_mode: 'Ambulance' | 'Helicopter' | 'Self-Drive';
  }) => void;
  isLoading: boolean;
  matchedResults: MatchResult[] | null;
  onDispatch: (match: MatchResult, patientData: any) => void;
  onSetLocationFromMap: () => void;
}

const EMERGENCY_PRESETS = [
  {
    title: 'Acute STEMI Heart Attack',
    severity: 'Critical / Life-Threatening',
    complaint: 'Severe crushing retrosternal chest pain radiating to left jaw, diaphoresis, ST-elevation on 12-lead ECG.',
    specialties: ['Cardiology', 'ECMO / Cardiac Surgery', 'Trauma'],
    age: 58,
    gender: 'Male',
    lat: 41.8781,
    lng: -87.6298,
    transport: 'Ambulance'
  },
  {
    title: 'Acute Ischemic Stroke (LVO)',
    severity: 'Critical / Life-Threatening',
    complaint: 'Sudden onset right-sided hemiparesis, expressive aphasia, NIHSS 18. Last known well 45 minutes ago.',
    specialties: ['Stroke / Neurology', 'Neurovascular Surgery'],
    age: 67,
    gender: 'Female',
    lat: 41.8902,
    lng: -87.6220,
    transport: 'Ambulance'
  },
  {
    title: 'Severe Multi-Trauma & Burns',
    severity: 'Critical / Life-Threatening',
    complaint: 'High-speed motor vehicle collision, flail chest, pelvic fracture, 30% TBSA 3rd degree burns.',
    specialties: ['Trauma', 'Burns Unit', 'Orthopedics'],
    age: 32,
    gender: 'Male',
    lat: 41.8310,
    lng: -87.6512,
    transport: 'Helicopter'
  },
  {
    title: 'Pediatric Respiratory Failure',
    severity: 'Severe / Urgent',
    complaint: '3-year-old child with severe croup, severe subcostal retractions, SpO2 88% on room air.',
    specialties: ['Pediatrics', 'Pediatric ICU'],
    age: 3,
    gender: 'Female',
    lat: 41.9214,
    lng: -87.6500,
    transport: 'Ambulance'
  }
];

const SPECIALTY_OPTIONS = [
  'Trauma',
  'Cardiology',
  'Stroke / Neurology',
  'Pediatrics',
  'Pediatric ICU',
  'Burns Unit',
  'Neurovascular Surgery',
  'ECMO / Cardiac Surgery',
  'Orthopedics',
  'Obstetrics / NICU',
  'Psychiatry'
];

export const TriageForm: React.FC<TriageFormProps> = ({
  onRunMatch,
  isLoading,
  matchedResults,
  onDispatch,
  onSetLocationFromMap
}) => {
  const [patientName, setPatientName] = useState('John Doe (Emergency)');
  const [age, setAge] = useState<number>(55);
  const [gender, setGender] = useState('Male');
  const [severity, setSeverity] = useState<'Critical / Life-Threatening' | 'Severe / Urgent' | 'Moderate' | 'Low'>('Critical / Life-Threatening');
  const [chiefComplaint, setChiefComplaint] = useState('Acute crushing chest pain with radiation to arm, BP 90/60, HR 115');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['Cardiology', 'Trauma']);
  const [transportMode, setTransportMode] = useState<'Ambulance' | 'Helicopter' | 'Self-Drive'>('Ambulance');
  const [lat, setLat] = useState<number>(41.8781);
  const [lng, setLng] = useState<number>(-87.6298);

  const toggleSpecialty = (spec: string) => {
    if (selectedSpecialties.includes(spec)) {
      setSelectedSpecialties(selectedSpecialties.filter(s => s !== spec));
    } else {
      setSelectedSpecialties([...selectedSpecialties, spec]);
    }
  };

  const loadPreset = (preset: typeof EMERGENCY_PRESETS[0]) => {
    setSeverity(preset.severity as any);
    setChiefComplaint(preset.complaint);
    setSelectedSpecialties(preset.specialties);
    setAge(preset.age);
    setGender(preset.gender);
    setLat(preset.lat);
    setLng(preset.lng);
    setTransportMode(preset.transport as any);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRunMatch({
      patient_lat: lat,
      patient_lng: lng,
      patient_age: age,
      gender,
      condition_severity: severity,
      chief_complaint: chiefComplaint,
      required_specialties: selectedSpecialties,
      transport_mode: transportMode
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-rose-500 font-bold text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>AI Triage & Emergency Referral Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Smart Hospital Emergency Matcher
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Input patient clinical state, vitals, and geographical location. Our multi-factor algorithm dynamically matches the best hospital based on specialty capability, real-time ICU/ER bed capacity, travel ETA, and trauma level.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-300">Live Hospital Grid Connected</span>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Quick Hackathon Emergency Simulations (Click to Load):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EMERGENCY_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadPreset(preset)}
              className="text-left bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/50 p-3.5 rounded-xl transition-all group shadow-md"
            >
              <div className="flex items-center justify-between text-xs font-bold text-rose-400 mb-1">
                <span>{preset.title}</span>
                <span className="bg-rose-950 text-rose-300 text-[10px] px-1.5 py-0.5 rounded border border-rose-800">
                  {preset.transport}
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-2">{preset.complaint}</p>
              <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                <span>{preset.age}y / {preset.gender}</span>
                <span className="text-rose-400 font-semibold group-hover:underline">Load Preset &rarr;</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Form Input */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-100 text-lg flex items-center space-x-2">
              <Activity className="w-5 h-5 text-rose-500" />
              <span>Patient Triage Assessment</span>
            </h2>
            <span className="text-xs text-slate-400">Step 1 of 2</span>
          </div>

          {/* Patient Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Patient Identifier / Name</label>
              <input
                type="text"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Condition Severity */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Emergency Severity Index</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                'Critical / Life-Threatening',
                'Severe / Urgent',
                'Moderate',
                'Low'
              ].map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev as any)}
                  className={`p-2 rounded-lg font-semibold border transition-all text-left ${
                    severity === sev
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/40'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Chief Complaint */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Chief Clinical Complaint / Vitals</label>
            <textarea
              rows={3}
              value={chiefComplaint}
              onChange={e => setChiefComplaint(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
              placeholder="Describe symptoms, vital signs, ECG findings..."
              required
            />
          </div>

          {/* Required Specialties */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Required Medical Specialties</label>
            <div className="flex flex-wrap gap-1.5">
              {SPECIALTY_OPTIONS.map(spec => {
                const isSelected = selectedSpecialties.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialty(spec)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      isSelected
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {spec}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transport Mode & Location */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Transport Mode</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['Ambulance', 'Helicopter', 'Self-Drive'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTransportMode(mode)}
                    className={`p-2 rounded-lg font-semibold border transition-all text-center ${
                      transportMode === mode
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Patient Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={e => setLat(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Patient Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={e => setLng(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={onSetLocationFromMap}
              className="w-full text-xs text-rose-400 hover:text-rose-300 font-semibold py-1 flex items-center justify-center space-x-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Pick Patient Location on Interactive Map</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            {isLoading ? (
              <span>AI Optimizing Referral...</span>
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-current" />
                <span>RUN AI HOSPITAL MATCH ALGORITHM</span>
              </>
            )}
          </button>
        </form>

        {/* Right: Results View */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="font-extrabold text-slate-100 text-lg flex items-center space-x-2 mb-4">
              <Navigation className="w-5 h-5 text-rose-500" />
              <span>AI Matching Rankings & Analysis</span>
            </h2>

            {!matchedResults ? (
              <div className="text-center py-16 px-4 bg-slate-950 rounded-xl border border-slate-800/80">
                <Compass className="w-12 h-12 text-slate-700 mx-auto mb-3 animate-spin" style={{ animationDuration: '12s' }} />
                <h3 className="text-slate-200 font-bold text-base">No Matching Run Yet</h3>
                <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                  Click a preset simulation above or submit the patient triage form to run the real-time hospital referral engine.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {matchedResults.map((match, idx) => {
                  const isTop = idx === 0;
                  const hosp = match.hospital;

                  return (
                    <div
                      key={hosp.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isTop
                          ? 'bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-900 border-rose-500 shadow-2xl ring-1 ring-rose-500/50'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            {isTop && (
                              <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1">
                                <Sparkles className="w-3 h-3 fill-current" />
                                <span>BEST AI MATCH</span>
                              </span>
                            )}
                            <span className="text-xs text-slate-400 font-bold">{hosp.trauma_level} Trauma</span>
                          </div>
                          <h3 className="text-lg font-black text-slate-100 mt-1">{hosp.name}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{hosp.address}, {hosp.city}</p>
                        </div>

                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center min-w-[110px]">
                          <div className="text-2xl font-black text-rose-400 leading-none">{match.match_score}%</div>
                          <div className="text-[10px] text-slate-400 font-extrabold uppercase mt-1">Match Index</div>
                        </div>
                      </div>

                      {/* Score Breakdown Bar */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                        <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                          <span>Factor Scoring Weight Rationale:</span>
                          <span className="text-slate-400 text-[11px]">{match.distance_miles} mi • <strong className="text-rose-400">{match.eta_minutes} min ETA</strong></span>
                        </div>

                        <div className="grid grid-cols-5 gap-1 text-[10px] text-slate-400 text-center">
                          <div className="bg-slate-900 p-1 rounded border border-slate-800">
                            <div>Distance</div>
                            <div className="font-bold text-slate-200">{match.breakdown.distance}/30</div>
                          </div>
                          <div className="bg-slate-900 p-1 rounded border border-slate-800">
                            <div>Specialty</div>
                            <div className="font-bold text-slate-200">{match.breakdown.specialty}/30</div>
                          </div>
                          <div className="bg-slate-900 p-1 rounded border border-slate-800">
                            <div>Capacity</div>
                            <div className="font-bold text-slate-200">{match.breakdown.capacity}/20</div>
                          </div>
                          <div className="bg-slate-900 p-1 rounded border border-slate-800">
                            <div>Trauma</div>
                            <div className="font-bold text-slate-200">{match.breakdown.trauma}/10</div>
                          </div>
                          <div className="bg-slate-900 p-1 rounded border border-slate-800">
                            <div>ER Wait</div>
                            <div className="font-bold text-slate-200">{match.breakdown.wait}/10</div>
                          </div>
                        </div>

                        {/* Reasoning bullets */}
                        <ul className="text-xs text-slate-300 space-y-1 mt-2 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                          {match.reasoning.map((r, rIdx) => (
                            <li key={rIdx} className="flex items-start space-x-1.5">
                              <span className="text-rose-500 font-bold">•</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Dispatch CTA */}
                      <div className="mt-4 flex items-center justify-end space-x-3">
                        <button
                          onClick={() => onDispatch(match, {
                            patientName,
                            age,
                            gender,
                            severity,
                            chiefComplaint,
                            selectedSpecialties,
                            transportMode,
                            lat,
                            lng
                          })}
                          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 ${
                            isTop
                              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/50'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Dispatch Emergency Referral ({match.eta_minutes}m ETA)</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
