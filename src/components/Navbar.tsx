import React from 'react';
import { Activity, ShieldAlert, Navigation, Building2, BarChart2, Radio, HeartPulse } from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'triage' | 'hospitals' | 'referrals' | 'analytics';
  setActiveTab: (tab: 'map' | 'triage' | 'hospitals' | 'referrals' | 'analytics') => void;
  activeReferralsCount: number;
  divertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeReferralsCount,
  divertCount
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('map')}>
            <div className="p-2 bg-gradient-to-tr from-rose-600 to-red-500 rounded-xl shadow-lg shadow-rose-900/40 animate-pulse">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  MedMatch AI
                </span>
                <span className="bg-rose-500/20 text-rose-400 text-xs px-2 py-0.5 rounded-full font-semibold border border-rose-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span>EMERGENCY ROUTER</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Real-Time Hospital Capacity & Smart Triage Referral Engine
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'map'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>Emergency Map</span>
            </button>

            <button
              onClick={() => setActiveTab('triage')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'triage'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>AI Triage Matcher</span>
            </button>

            <button
              onClick={() => setActiveTab('referrals')}
              className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'referrals'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Dispatches</span>
              {activeReferralsCount > 0 && (
                <span className="bg-emerald-500 text-slate-950 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {activeReferralsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('hospitals')}
              className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'hospitals'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Hospitals</span>
              {divertCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center space-x-1">
                  <ShieldAlert className="w-3 h-3 inline" />
                  <span>{divertCount}</span>
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>System Analytics</span>
            </button>
          </nav>

          {/* Emergency Alert Stats Ticker */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-300">Live Telemetry:</span>
                <span className="font-semibold text-emerald-400">ACTIVE</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="text-slate-300">
                Diversions: <span className="font-bold text-amber-400">{divertCount}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('triage')}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-md hover:shadow-red-500/20 transition-all flex items-center space-x-1"
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden sm:inline">Dispatch Case</span>
            </button>
          </div>

        </div>

        {/* Mobile Tab Strip */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-800 py-2 text-xs">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'map' ? 'text-rose-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Map</span>
          </button>
          <button
            onClick={() => setActiveTab('triage')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'triage' ? 'text-rose-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Triage</span>
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'referrals' ? 'text-rose-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Dispatch</span>
          </button>
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'hospitals' ? 'text-rose-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Hospitals</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'analytics' ? 'text-rose-400 font-bold' : 'text-slate-400'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Stats</span>
          </button>
        </div>

      </div>
    </header>
  );
};
