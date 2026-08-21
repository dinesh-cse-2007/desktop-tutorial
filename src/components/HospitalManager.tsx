import React, { useState } from 'react';
import { Hospital } from '../types';
import { Building2, ShieldAlert, Plus, Edit2, Save, X, Phone, CheckCircle, Bed, Clock } from 'lucide-react';

interface HospitalManagerProps {
  hospitals: Hospital[];
  onUpdateHospital: (updated: Partial<Hospital> & { id: number }) => Promise<void>;
  onCreateHospital: (newHosp: Omit<Hospital, 'id'>) => Promise<void>;
}

export const HospitalManager: React.FC<HospitalManagerProps> = ({
  hospitals,
  onUpdateHospital,
  onCreateHospital
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Hospital>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newForm, setNewForm] = useState<Omit<Hospital, 'id'>>({
    name: '',
    lat: 41.8781,
    lng: -87.6298,
    address: '',
    city: 'Chicago',
    state: 'IL',
    phone: '(312) 555-0100',
    trauma_level: 'Level 1',
    er_capacity_pct: 65,
    icu_beds_available: 5,
    total_icu_beds: 20,
    specialties: ['Trauma', 'Cardiology'],
    accepting_emergency: true,
    avg_wait_minutes: 20,
    helipad: true,
    rating: 4.8,
    status: 'Optimal'
  });

  const handleStartEdit = (hosp: Hospital) => {
    setEditingId(hosp.id);
    setEditForm(hosp);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    await onUpdateHospital({ id: editingId, ...editForm });
    setEditingId(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateHospital(newForm);
    setIsCreating(false);
  };

  const toggleDivert = async (hosp: Hospital) => {
    const newStatus = hosp.status === 'Critical / Divert' ? 'Optimal' : 'Critical / Divert';
    const accepting = newStatus !== 'Critical / Divert';
    await onUpdateHospital({
      id: hosp.id,
      status: newStatus,
      accepting_emergency: accepting
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-rose-500" />
            <span>Hospital Command Center & Live Capacity</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time ER bed availability, ICU capacity control, diversion toggles, and trauma level configurations.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-rose-950/40"
        >
          {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isCreating ? 'Cancel' : 'Add New Hospital Facility'}</span>
        </button>
      </div>

      {/* Add New Hospital Drawer */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 space-y-4 shadow-2xl">
          <h3 className="text-base font-extrabold text-white">Register Emergency Healthcare Facility</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Hospital Name</label>
              <input
                type="text"
                value={newForm.name}
                onChange={e => setNewForm({ ...newForm, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Trauma Level</label>
              <select
                value={newForm.trauma_level}
                onChange={e => setNewForm({ ...newForm, trauma_level: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
              >
                <option value="Level 1">Level 1</option>
                <option value="Level 2">Level 2</option>
                <option value="Level 3">Level 3</option>
                <option value="Community">Community</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Address</label>
              <input
                type="text"
                value={newForm.address}
                onChange={e => setNewForm({ ...newForm, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={newForm.lat}
                onChange={e => setNewForm({ ...newForm, lat: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={newForm.lng}
                onChange={e => setNewForm({ ...newForm, lng: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Phone</label>
              <input
                type="text"
                value={newForm.phone}
                onChange={e => setNewForm({ ...newForm, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs"
          >
            Save Hospital Record
          </button>
        </form>
      )}

      {/* Hospital Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hospitals.map(hosp => {
          const isEditing = editingId === hosp.id;

          return (
            <div
              key={hosp.id}
              className={`bg-slate-900 border rounded-2xl p-5 space-y-4 shadow-xl transition-all ${
                hosp.status === 'Critical / Divert'
                  ? 'border-red-600/80 bg-slate-950'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    hosp.status === 'Optimal'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : hosp.status === 'High Load'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                  }`}>
                    {hosp.status}
                  </span>
                  <h3 className="font-extrabold text-slate-100 text-base mt-1.5">{hosp.name}</h3>
                  <p className="text-xs text-slate-400">{hosp.address}, {hosp.city}</p>
                </div>

                <button
                  onClick={() => toggleDivert(hosp)}
                  title="Toggle Emergency Diversion"
                  className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                    hosp.status === 'Critical / Divert'
                      ? 'bg-red-600 text-white border-red-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-red-400'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              </div>

              {/* Editing Mode Controls */}
              {isEditing ? (
                <div className="space-y-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <label className="text-slate-400">ER Capacity Occupancy (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editForm.er_capacity_pct ?? hosp.er_capacity_pct}
                      onChange={e => setEditForm({ ...editForm, er_capacity_pct: Number(e.target.value) })}
                      className="w-full accent-rose-500"
                    />
                    <span className="font-bold text-rose-400">{editForm.er_capacity_pct ?? hosp.er_capacity_pct}%</span>
                  </div>

                  <div>
                    <label className="text-slate-400">ICU Beds Available</label>
                    <input
                      type="number"
                      value={editForm.icu_beds_available ?? hosp.icu_beds_available}
                      onChange={e => setEditForm({ ...editForm, icu_beds_available: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400">Avg ER Wait (Minutes)</label>
                    <input
                      type="number"
                      value={editForm.avg_wait_minutes ?? hosp.avg_wait_minutes}
                      onChange={e => setEditForm({ ...editForm, avg_wait_minutes: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-white"
                    />
                  </div>

                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={handleSaveEdit}
                      className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded text-xs flex items-center space-x-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-slate-800 text-slate-300 font-bold px-3 py-1.5 rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Stats View */
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px] font-bold uppercase">ER Capacity</div>
                    <div className="font-black text-sm text-slate-100">{hosp.er_capacity_pct}%</div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full ${hosp.er_capacity_pct > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${hosp.er_capacity_pct}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px] font-bold uppercase">ICU Beds</div>
                    <div className="font-black text-sm text-sky-400">
                      {hosp.icu_beds_available} / {hosp.total_icu_beds}
                    </div>
                  </div>
                </div>
              )}

              {/* Specialties */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 mb-1">Specialties:</div>
                <div className="flex flex-wrap gap-1">
                  {hosp.specialties.map(spec => (
                    <span key={spec} className="bg-slate-950 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-800">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[10px]">{hosp.phone}</span>
                <button
                  onClick={() => handleStartEdit(hosp)}
                  className="text-rose-400 hover:text-rose-300 font-semibold flex items-center space-x-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Adjust Capacity</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
