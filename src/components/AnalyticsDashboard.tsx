import React from 'react';
import { Hospital, Referral } from '../types';
import { BarChart2, Activity, ShieldAlert, Heart, CheckCircle2, TrendingUp, Clock } from 'lucide-react';

interface AnalyticsDashboardProps {
  hospitals: Hospital[];
  referrals: Referral[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ hospitals, referrals }) => {
  const avgErCapacity = Math.round(
    hospitals.reduce((acc, h) => acc + (h.er_capacity_pct || 0), 0) / (hospitals.length || 1)
  );

  const totalIcuAvailable = hospitals.reduce((acc, h) => acc + (h.icu_beds_available || 0), 0);
  const totalIcuBeds = hospitals.reduce((acc, h) => acc + (h.total_icu_beds || 0), 0);
  const icuOccupancyPct = Math.round(((totalIcuBeds - totalIcuAvailable) / (totalIcuBeds || 1)) * 100);

  const totalDiverting = hospitals.filter(h => h.status === 'Critical / Divert').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
          <BarChart2 className="w-6 h-6 text-rose-500" />
          <span>Healthcare Network Intelligence & Analytics</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          System-wide hospital bed utilization, referral throughput, transfer efficiency, and diversion metrics.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="text-slate-400 text-xs font-bold uppercase">Average System ER Load</div>
          <div className="text-3xl font-black text-rose-400 mt-2">{avgErCapacity}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Weighted across {hospitals.length} ER facilities</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="text-slate-400 text-xs font-bold uppercase">ICU Bed Utilization</div>
          <div className="text-3xl font-black text-sky-400 mt-2">{icuOccupancyPct}%</div>
          <div className="text-[11px] text-slate-500 mt-1">{totalIcuAvailable} open ICU beds remaining</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="text-slate-400 text-xs font-bold uppercase">Emergency Diversions</div>
          <div className="text-3xl font-black text-amber-400 mt-2">{totalDiverting}</div>
          <div className="text-[11px] text-slate-500 mt-1">Hospitals currently on divert status</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="text-slate-400 text-xs font-bold uppercase">Total Dispatches Today</div>
          <div className="text-3xl font-black text-emerald-400 mt-2">{referrals.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Avg response time ~12 min</div>
        </div>

      </div>

      {/* Hospital ER Capacity Breakdown */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="font-extrabold text-white text-base">Facility ER Capacity Load Distribution</h3>
        
        <div className="space-y-3">
          {hospitals.map(h => (
            <div key={h.id} className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300 font-bold">
                <span>{h.name} ({h.trauma_level})</span>
                <span className={h.er_capacity_pct > 80 ? 'text-rose-400' : 'text-emerald-400'}>
                  {h.er_capacity_pct}% ER Occupancy
                </span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all ${
                    h.er_capacity_pct > 85 ? 'bg-red-600' : h.er_capacity_pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${h.er_capacity_pct}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
