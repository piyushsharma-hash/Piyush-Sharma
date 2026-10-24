import React, { useState } from 'react';
import { 
  Navigation, 
  RotateCw, 
  Volume2, 
  ZoomIn, 
  ZoomOut, 
  LocateFixed, 
  MapPin, 
  Crosshair, 
  Compass,
  Radio,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { LocationState, VehicleState } from '../types';

interface CarTrackingMapProps {
  location: LocationState;
  vehicle: VehicleState;
  onRefreshLocation: () => void;
  onFindMyCar: () => void;
  onToggleGps: () => void;
  findingCar: boolean;
}

export const CarTrackingMap: React.FC<CarTrackingMapProps> = ({
  location,
  vehicle,
  onRefreshLocation,
  onFindMyCar,
  onToggleGps,
  findingCar
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(14);
  const [showGeofence, setShowGeofence] = useState<boolean>(true);
  const [radarActive, setRadarActive] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefreshLocation();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 cyber-panel rounded-xl">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg border ${vehicle.gpsTrackingOn ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white tracking-wide">High-Precision GPS Telemetry</h2>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${vehicle.gpsTrackingOn ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'}`}>
                {vehicle.gpsTrackingOn ? 'TRACKING ACTIVE' : 'GPS STANDBY'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{location.address} · {location.parkingBay}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onToggleGps}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              vehicle.gpsTrackingOn 
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25' 
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            GPS: {vehicle.gpsTrackingOn ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={handleRefresh}
            disabled={!vehicle.gpsTrackingOn || isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/40 text-slate-200 hover:text-white transition-all disabled:opacity-40"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            Refresh Location
          </button>

          <button
            onClick={onFindMyCar}
            disabled={!vehicle.gpsTrackingOn}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              findingCar
                ? 'bg-amber-500 text-black neon-glow-amber'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold hover:from-cyan-400 hover:to-blue-500 neon-glow-cyan'
            } disabled:opacity-40`}
          >
            <Volume2 className={`w-3.5 h-3.5 ${findingCar ? 'animate-bounce' : ''}`} />
            {findingCar ? 'Sounding Horn & Beacons...' : 'Find My Car'}
          </button>
        </div>
      </div>

      {/* Main Map Canvas Display */}
      <div className="relative w-full h-[480px] rounded-2xl overflow-hidden border border-cyan-500/20 bg-[#060912] shadow-2xl">
        {/* Interactive Vector Grid Map */}
        <svg className="w-full h-full select-none" viewBox="0 0 1000 600">
          <defs>
            {/* Grid Pattern */}
            <pattern id="streetGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" />
              <path d="M 30 0 L 30 60 M 0 30 L 60 30" fill="none" stroke="rgba(56, 189, 248, 0.03)" strokeWidth="0.5" />
            </pattern>

            {/* Radar Gradient */}
            <linearGradient id="radarSweep" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.35)" />
              <stop offset="50%" stopColor="rgba(6, 182, 212, 0.08)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Glowing dot filter */}
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background & Grid */}
          <rect width="1000" height="600" fill="#04060c" />
          <rect width="1000" height="600" fill="url(#streetGrid)" />

          {/* Simulated Major Roads and Expressways */}
          <path d="M -50 320 L 1050 320" stroke="rgba(30, 41, 59, 0.9)" strokeWidth="26" />
          <path d="M -50 320 L 1050 320" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="2" strokeDasharray="8 6" />

          <path d="M 480 -50 L 480 650" stroke="rgba(30, 41, 59, 0.9)" strokeWidth="22" />
          <path d="M 480 -50 L 480 650" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="2" strokeDasharray="8 6" />

          {/* Secondary Arteries */}
          <path d="M 120 -20 C 220 180, 240 380, 260 620" stroke="rgba(30, 41, 59, 0.6)" strokeWidth="12" fill="none" />
          <path d="M 780 -20 C 720 220, 750 420, 840 620" stroke="rgba(30, 41, 59, 0.6)" strokeWidth="12" fill="none" />

          {/* Building footprints / Blocks */}
          <rect x="180" y="80" width="120" height="180" rx="6" fill="#0c1220" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" />
          <text x="240" y="175" fill="#475569" fontSize="10" textAnchor="middle" fontFamily="monospace">CYBER TOWER 1</text>

          <rect x="540" y="90" width="160" height="160" rx="6" fill="#0c1220" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" />
          <text x="620" y="175" fill="#475569" fontSize="10" textAnchor="middle" fontFamily="monospace">TECH PARK B2</text>

          <rect x="160" y="380" width="220" height="140" rx="6" fill="#0c1220" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" />
          <text x="270" y="455" fill="#475569" fontSize="10" textAnchor="middle" fontFamily="monospace">RETAIL DISTRICT</text>

          <rect x="560" y="380" width="180" height="150" rx="6" fill="#0c1220" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" />
          <text x="650" y="460" fill="#475569" fontSize="10" textAnchor="middle" fontFamily="monospace">INNOVATION HUB</text>

          {/* Road Labels */}
          <text x="320" y="310" fill="#38bdf8" fontSize="10" opacity="0.7" fontFamily="sans-serif">CYBER BOULEVARD</text>
          <text x="495" y="140" fill="#38bdf8" fontSize="10" opacity="0.7" fontFamily="sans-serif" transform="rotate(90, 495, 140)">AVENUE 4</text>

          {/* Nearby POIs */}
          <g transform="translate(680, 140)">
            <circle r="14" fill="#06202a" stroke="#00e5ff" strokeWidth="1" />
            <text x="0" y="4" fill="#00e5ff" fontSize="10" textAnchor="middle">⚡</text>
            <text x="0" y="26" fill="#94a3b8" fontSize="9" textAnchor="middle">Fast EV Hub</text>
          </g>

          {/* Geofence Boundary Circle (Center is at vehicle 480, 320) */}
          {showGeofence && vehicle.gpsTrackingOn && (
            <g>
              <circle
                cx="480"
                cy="320"
                r="160"
                fill="rgba(6, 182, 212, 0.04)"
                stroke="rgba(6, 182, 212, 0.45)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x="480" y="152" fill="#06b6d4" fontSize="10" textAnchor="middle" opacity="0.8">
                Geofence Radius ({location.geofenceRadiusM}m) · Secure Perimeter
              </text>
            </g>
          )}

          {/* Radar Sweep Arc if active */}
          {radarActive && vehicle.gpsTrackingOn && (
            <g className="animate-radar" style={{ transformOrigin: '480px 320px' }}>
              <path
                d="M 480 320 L 680 200 A 240 240 0 0 1 720 320 Z"
                fill="url(#radarSweep)"
              />
            </g>
          )}

          {/* Concentric distance rings */}
          {vehicle.gpsTrackingOn && (
            <g opacity="0.25">
              <circle cx="480" cy="320" r="80" fill="none" stroke="#00e5ff" strokeWidth="0.8" />
              <circle cx="480" cy="320" r="160" fill="none" stroke="#00e5ff" strokeWidth="0.8" />
              <circle cx="480" cy="320" r="240" fill="none" stroke="#00e5ff" strokeWidth="0.8" />
            </g>
          )}

          {/* VEHICLE PINPOINT MARKER */}
          {vehicle.gpsTrackingOn ? (
            <g transform="translate(480, 320)">
              {/* Finding car ping waves */}
              {findingCar && (
                <>
                  <circle r="30" fill="none" stroke="#f59e0b" strokeWidth="2.5" className="animate-ping" />
                  <circle r="60" fill="none" stroke="#f59e0b" strokeWidth="1.5" className="animate-ping-slow" />
                  <circle r="90" fill="none" stroke="#f59e0b" strokeWidth="1" className="animate-ping" />
                </>
              )}

              {/* Outer pulsing ring */}
              <circle r="22" fill="rgba(6, 182, 212, 0.2)" className="animate-pulse" />
              <circle r="14" fill="#083344" stroke="#00e5ff" strokeWidth="2" filter="url(#neonGlow)" />

              {/* Car Icon Representation */}
              <g transform="translate(-8, -8) scale(0.7)">
                <path
                  d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <circle cx="7" cy="17" r="2" fill="#00e5ff" />
                <circle cx="17" cy="17" r="2" fill="#00e5ff" />
              </g>

              {/* Badge above car */}
              <g transform="translate(0, -32)">
                <rect x="-65" y="-14" width="130" height="22" rx="4" fill="#091322" stroke="#00e5ff" strokeWidth="1" opacity="0.95" />
                <text x="0" y="1" fill="#e0f2fe" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                  {vehicle.carModel}
                </text>
              </g>
            </g>
          ) : (
            <g transform="translate(480, 320)">
              <circle r="16" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
              <text x="0" y="4" fill="#94a3b8" fontSize="10" textAnchor="middle">OFF</text>
            </g>
          )}
        </svg>

        {/* Map Overlays: Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))}
            className="p-2 rounded-lg bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-white hover:border-cyan-500/50 transition-all shadow-lg"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 1, 10))}
            className="p-2 rounded-lg bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-white hover:border-cyan-500/50 transition-all shadow-lg"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowGeofence(!showGeofence)}
            className={`p-2 rounded-lg border transition-all shadow-lg ${
              showGeofence 
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300' 
                : 'bg-slate-900/90 border-slate-700 text-slate-400'
            }`}
            title="Toggle Geofence Visualizer"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRadarActive(!radarActive)}
            className={`p-2 rounded-lg border transition-all shadow-lg ${
              radarActive 
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300' 
                : 'bg-slate-900/90 border-slate-700 text-slate-400'
            }`}
            title="Toggle Radar Sweep"
          >
            <Radio className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Location Telemetry Bar */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/85 backdrop-blur-md rounded-xl border border-cyan-500/20 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Coordinates</span>
              <span className="text-cyan-300 font-mono font-medium">
                {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
              </span>
            </div>
            <div className="hidden sm:block border-l border-slate-800 pl-4">
              <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Altitude / Precision</span>
              <span className="text-slate-200 font-mono font-medium">
                {location.altitudeM}m MSL · ±{location.accuracyM}m HDOP
              </span>
            </div>
            <div className="hidden md:block border-l border-slate-800 pl-4">
              <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Geofence Status</span>
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Inside Safe Zone
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <span>Last Sync: {location.lastUpdated}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          </div>
        </div>

        {/* "Finding Car" Warning Overlay if active */}
        {findingCar && (
          <div className="absolute top-4 left-4 p-3 bg-amber-950/90 border border-amber-500/60 rounded-xl flex items-center gap-3 backdrop-blur-md shadow-2xl animate-pulse">
            <Volume2 className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-xs font-bold text-amber-200">Vehicle Locator Emitting Signal</div>
              <div className="text-[11px] text-amber-300/80">Hazard flashers activated &amp; horn chirp sounding at spot {location.parkingBay}</div>
            </div>
          </div>
        )}
      </div>

      {/* Geofence & Anti-Theft Guard Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="cyber-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-mono">Geofence Perimeter</span>
            <div className="text-base font-bold text-white mt-0.5">{location.geofenceRadiusM} Meters</div>
            <span className="text-[11px] text-cyan-400">Virtual boundary around parking spot</span>
          </div>
          <Crosshair className="w-8 h-8 text-cyan-500/40" />
        </div>

        <div className="cyber-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-mono">Parking Spot Security</span>
            <div className="text-base font-bold text-emerald-400 mt-0.5">Protected &amp; Stationed</div>
            <span className="text-[11px] text-slate-400">Zero unauthorized movement detected</span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
        </div>

        <div className="cyber-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-mono">GNSS Constellation</span>
            <div className="text-base font-bold text-cyan-300 mt-0.5">GPS + GLONASS + Galileo</div>
            <span className="text-[11px] text-slate-400">18 Satellites in Direct Lock</span>
          </div>
          <Zap className="w-8 h-8 text-cyan-500/40" />
        </div>
      </div>
    </div>
  );
};
