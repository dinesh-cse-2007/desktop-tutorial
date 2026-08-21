import React, { useEffect, useRef } from 'react';
import { Hospital, MatchResult } from '../types';
import { MapPin, Navigation, Activity, ShieldAlert, Phone, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

interface MapViewProps {
  hospitals: Hospital[];
  patientLocation?: { lat: number; lng: number; label?: string } | null;
  matchedHospitals?: MatchResult[];
  selectedHospital?: Hospital | null;
  onSelectHospital: (hospital: Hospital) => void;
  onDispatchReferral?: (hospital: Hospital) => void;
  onLocationPick?: (lat: number, lng: number) => void;
  isPickingLocation?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  hospitals,
  patientLocation,
  matchedHospitals,
  selectedHospital,
  onSelectHospital,
  onDispatchReferral,
  onLocationPick,
  isPickingLocation
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Dynamically load Leaflet if not present
    if (typeof window !== 'undefined' && !(window as any).L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      const L = (window as any).L;
      if (!L || leafletMapRef.current) return;

      // Default center: Chicago metropolitan emergency cluster
      const map = L.map(mapRef.current, {
        zoomControl: false
      }).setView([41.8781, -87.6298], 11);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap & &copy; CARTO',
        maxZoom: 19
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;

      // Click to pick location
      map.on('click', (e: any) => {
        if (onLocationPick) {
          onLocationPick(e.latlng.lat, e.latlng.lng);
        }
      });
    }
  }, []);

  // Update map markers whenever hospitals, matchedHospitals, or patientLocation changes
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !leafletMapRef.current || !markersGroupRef.current) return;

    const map = leafletMapRef.current;
    const layerGroup = markersGroupRef.current;
    layerGroup.clearLayers();

    const bounds: any[] = [];

    // Add Patient / Emergency Marker if present
    if (patientLocation) {
      const patientIcon = L.divIcon({
        className: 'custom-patient-marker',
        html: `
          <div class="relative flex items-center justify-center w-10 h-10">
            <span class="absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75 animate-ping"></span>
            <div class="relative w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const pMarker = L.marker([patientLocation.lat, patientLocation.lng], { icon: patientIcon }).addTo(layerGroup);
      pMarker.bindPopup(`
        <div class="p-2 text-slate-900 font-sans">
          <div class="font-extrabold text-xs text-rose-600 tracking-wide uppercase">EMERGENCY PATIENT CASE</div>
          <div class="font-bold text-sm mt-0.5">${patientLocation.label || 'Triage Dispatch Point'}</div>
          <div class="text-xs text-slate-500 mt-1">Lat: ${patientLocation.lat.toFixed(4)}, Lng: ${patientLocation.lng.toFixed(4)}</div>
        </div>
      `);
      bounds.push([patientLocation.lat, patientLocation.lng]);
    }

    // Add Hospital Markers
    hospitals.forEach(hosp => {
      // Find if hospital is in matched list
      const match = matchedHospitals?.find(m => m.hospital.id === hosp.id);
      const isTopMatch = match && matchedHospitals && matchedHospitals[0]?.hospital.id === hosp.id;
      const isSelected = selectedHospital?.id === hosp.id;

      let bgColor = 'bg-emerald-500';
      let borderColor = 'border-emerald-700';
      if (hosp.status === 'High Load') {
        bgColor = 'bg-amber-500';
        borderColor = 'border-amber-700';
      } else if (hosp.status === 'Critical / Divert') {
        bgColor = 'bg-red-600';
        borderColor = 'border-red-800';
      }

      const iconHtml = `
        <div class="relative group cursor-pointer">
          ${isTopMatch ? '<span class="absolute -top-2 -right-2 bg-rose-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded-full z-20 shadow">#1 BEST</span>' : ''}
          <div class="w-9 h-9 rounded-xl ${bgColor} border-2 ${isSelected ? 'border-sky-400 ring-4 ring-sky-300 ring-opacity-60 scale-110 z-30' : 'border-white'} shadow-lg flex items-center justify-center text-white transition-all transform hover:scale-110">
            <span class="font-extrabold text-xs">${hosp.trauma_level === 'Level 1' ? 'L1' : hosp.trauma_level === 'Level 2' ? 'L2' : 'H'}</span>
          </div>
          ${match ? `<div class="mt-0.5 text-[10px] bg-slate-900 text-white font-bold px-1 rounded text-center opacity-90">${match.match_score}%</div>` : ''}
        </div>
      `;

      const hospIcon = L.divIcon({
        className: 'custom-hospital-marker',
        html: iconHtml,
        iconSize: [36, 44],
        iconAnchor: [18, 22]
      });

      const marker = L.marker([hosp.lat, hosp.lng], { icon: hospIcon }).addTo(layerGroup);

      marker.on('click', () => {
        onSelectHospital(hosp);
      });

      bounds.push([hosp.lat, hosp.lng]);

      // If patient location exists and this is top match, draw route polyline
      if (patientLocation && match) {
        const routeColor = isTopMatch ? '#e11d48' : '#94a3b8';
        const polyline = L.polyline(
          [[patientLocation.lat, patientLocation.lng], [hosp.lat, hosp.lng]],
          {
            color: routeColor,
            weight: isTopMatch ? 4 : 2,
            dashArray: isTopMatch ? undefined : '5, 8',
            opacity: isTopMatch ? 0.9 : 0.4
          }
        ).addTo(layerGroup);

        if (isTopMatch) {
          polyline.bindTooltip(`${match.eta_minutes} min ETA (${match.distance_miles} mi)`, {
            permanent: true,
            direction: 'center',
            className: 'bg-rose-900 text-white font-bold text-xs px-2 py-1 rounded shadow-lg border border-rose-500'
          });
        }
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [hospitals, patientLocation, matchedHospitals, selectedHospital]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-slate-950 overflow-hidden">
      
      {/* Map Canvas */}
      <div className="relative flex-1 h-full w-full">
        <div ref={mapRef} className="w-full h-full z-0" />

        {/* Picking Location Overlay Banner */}
        {isPickingLocation && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-rose-600 text-white font-bold text-sm px-4 py-2 rounded-full shadow-2xl flex items-center space-x-2 animate-bounce">
            <MapPin className="w-5 h-5" />
            <span>Click anywhere on the map to set patient emergency location</span>
          </div>
        )}

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md text-slate-200 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-2 max-w-xs">
          <div className="font-extrabold text-slate-100 flex items-center justify-between border-b border-slate-700/60 pb-1">
            <span>Hospital Status</span>
            <span className="text-[10px] text-slate-400">{hospitals.length} Connected</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Optimal</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>High Load</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              <span>Divert</span>
            </div>
          </div>
        </div>
      </div>

      {/* Side Detail Panel / Selection Drawer */}
      <div className="w-full md:w-96 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col h-1/2 md:h-full z-10 shadow-2xl">
        
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-100 text-base flex items-center space-x-2">
              <Activity className="w-5 h-5 text-rose-500" />
              <span>{matchedHospitals ? 'AI Match Recommendations' : 'Emergency Hospital Network'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {matchedHospitals
                ? `${matchedHospitals.length} facilities ranked by urgency & capacity`
                : 'Select a facility on map to inspect details'}
            </p>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          
          {/* If AI Matching was run */}
          {matchedHospitals && matchedHospitals.length > 0 ? (
            matchedHospitals.map((m, index) => {
              const isSelected = selectedHospital?.id === m.hospital.id;
              const isTop = index === 0;

              return (
                <div
                  key={m.hospital.id}
                  onClick={() => onSelectHospital(m.hospital)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isTop
                      ? 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/80 shadow-lg shadow-rose-950/50'
                      : isSelected
                      ? 'bg-slate-800 border-sky-500'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      {isTop && (
                        <span className="inline-flex items-center space-x-1 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">
                          <Zap className="w-3 h-3 fill-current" />
                          <span>Top Recommended Match</span>
                        </span>
                      )}
                      <h3 className="font-bold text-slate-100 text-sm">{m.hospital.name}</h3>
                      <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span>{m.hospital.trauma_level} Trauma</span>
                        <span>•</span>
                        <span>{m.distance_miles} miles</span>
                        <span>•</span>
                        <span className="text-rose-400 font-semibold">{m.eta_minutes} min ETA</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-rose-400 leading-tight">
                        {m.match_score}%
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase">Match Score</div>
                    </div>
                  </div>

                  {/* Specialty badges */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {m.matched_specialties.map(spec => (
                      <span key={spec} className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 inline" />
                        <span>{spec}</span>
                      </span>
                    ))}
                    {m.missing_specialties.map(spec => (
                      <span key={spec} className="bg-red-950/60 text-red-400 border border-red-900/40 text-[10px] px-1.5 py-0.5 rounded font-medium line-through">
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Key Reason snippet */}
                  <p className="mt-2 text-xs text-slate-300 bg-slate-950/50 p-2 rounded border border-slate-800/80">
                    {m.reasoning[0]} {m.reasoning[1]}
                  </p>

                  {/* Dispatch CTA */}
                  {onDispatchReferral && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDispatchReferral(m.hospital);
                      }}
                      className={`mt-3 w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                        isTop
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Dispatch Patient to this ER</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                    </button>
                  )}
                </div>
              );
            })
          ) : selectedHospital ? (
            /* Selected Single Hospital Card */
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                    selectedHospital.status === 'Optimal'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : selectedHospital.status === 'High Load'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-red-600/20 text-red-400 border border-red-600/30'
                  }`}>
                    {selectedHospital.status}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{selectedHospital.trauma_level} Center</span>
                </div>
                <h3 className="font-extrabold text-slate-100 text-lg mt-2">{selectedHospital.name}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 inline" />
                  <span>{selectedHospital.address}, {selectedHospital.city}, {selectedHospital.state}</span>
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">ER Occupancy</div>
                  <div className={`font-black text-base ${selectedHospital.er_capacity_pct > 85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {selectedHospital.er_capacity_pct}%
                  </div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">ICU Beds Open</div>
                  <div className="font-black text-base text-sky-400">
                    {selectedHospital.icu_beds_available} / {selectedHospital.total_icu_beds}
                  </div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Avg ER Wait</div>
                  <div className="font-black text-base text-amber-400">
                    ~{selectedHospital.avg_wait_minutes} min
                  </div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Helipad Access</div>
                  <div className="font-black text-base text-indigo-400">
                    {selectedHospital.helipad ? 'AVAILABLE' : 'NONE'}
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <div className="text-xs font-bold text-slate-300 mb-1.5">Specialized Medical Capabilities:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedHospital.specialties.map(spec => (
                    <span key={spec} className="bg-slate-800 text-slate-200 text-[11px] px-2 py-0.5 rounded border border-slate-700">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Call CTA */}
              <div className="pt-2">
                <a
                  href={`tel:${selectedHospital.phone}`}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-xs flex items-center justify-center space-x-2 border border-slate-700"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Call Emergency Desk ({selectedHospital.phone})</span>
                </a>
              </div>
            </div>
          ) : (
            /* Default List of Facilities */
            hospitals.map(hosp => (
              <div
                key={hosp.id}
                onClick={() => onSelectHospital(hosp)}
                className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl hover:border-slate-700 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs">{hosp.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    hosp.status === 'Optimal' ? 'bg-emerald-950 text-emerald-400' : hosp.status === 'High Load' ? 'bg-amber-950 text-amber-400' : 'bg-red-950 text-red-400'
                  }`}>
                    {hosp.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
                  <span>{hosp.trauma_level}</span>
                  <span>•</span>
                  <span>ER Load: {hosp.er_capacity_pct}%</span>
                  <span>•</span>
                  <span>ICU Beds: {hosp.icu_beds_available}</span>
                </div>
              </div>
            ))
          )}

        </div>

      </div>

    </div>
  );
};
