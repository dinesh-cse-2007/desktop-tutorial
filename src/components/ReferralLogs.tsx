import React from 'react';
import { Referral } from '../types';
import { Radio, Navigation, Clock, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface ReferralLogsProps {
  referrals: Referral[];
  onUpdateStatus: (id: number, status: Referral['status']) => void;
}

export const ReferralLogs: React.FC<ReferralLogsProps> = ({ referrals, onUpdateStatus }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <Radio className="w-6 h-6 text-rose-500" />
            <span>Live Emergency Dispatch & Referral Log</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time emergency referral status tracking, ambulance telemetry, and admission confirmation.
          </p>
        </div>

        <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 font-bold">
          Total Active Dispatches: <span className="text-rose-400">{referrals.filter(r => r.status !== 'Completed').length}</span>
        </div>
      </div>

      {/* Referrals Table / Cards */}
      <div className="space-y-3">
        {referrals.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
            No active emergency referrals currently in dispatch.
          </div>
        ) : (
          referrals.map(ref => (
            <div
              key={ref.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider ${
                    ref.status === 'Dispatched' ? 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse' :
                    ref.status === 'En Route' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    ref.status === 'Accepted' ? 'bg-sky-950 text-sky-400 border border-sky-800' :
                    'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    {ref.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(ref.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs bg-slate-950 text-slate-300 px-2 py-0.5 rounded font-bold border border-slate-800">
                    {ref.transport_mode}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-100 text-base">
                  {ref.patient_name} <span className="text-xs font-normal text-slate-400">({ref.age}y / {ref.gender})</span>
                </h3>

                <p className="text-xs text-slate-300 bg-slate-950 p-2 rounded border border-slate-800/80 max-w-xl">
                  {ref.chief_complaint}
                </p>

                <div className="text-xs text-slate-400 flex items-center space-x-2 pt-1">
                  <span>Assigned Hospital: <strong className="text-rose-400">{ref.assigned_hospital_name}</strong></span>
                  <span>•</span>
                  <span>ETA: <strong>{ref.eta_minutes} min</strong></span>
                  <span>•</span>
                  <span>AI Score: <strong>{ref.match_score}%</strong></span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center space-x-2 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
                <select
                  value={ref.status}
                  onChange={e => onUpdateStatus(ref.id, e.target.value as any)}
                  className="bg-slate-950 text-slate-200 text-xs font-bold border border-slate-800 rounded-lg p-2 focus:outline-none focus:border-rose-500"
                >
                  <option value="Dispatched">Dispatched</option>
                  <option value="En Route">En Route</option>
                  <option value="Accepted">Accepted at ER</option>
                  <option value="Completed">Patient Admitted / Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
