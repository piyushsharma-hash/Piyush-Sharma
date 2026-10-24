import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Lightbulb, 
  MapPin, 
  BatteryCharging, 
  Thermometer, 
  Gauge, 
  Radio, 
  Clock, 
  ChevronRight,
  Zap,
  Wind,
  Layers,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { VehicleState, LocationState, ActivityLog } from '../types';

interface MainDashboardProps {
  vehicle: VehicleState;
  location: LocationState;
  activities: ActivityLog[];
  unreadAlertCount: number;
  onNavigateTab: (tab: 'dashboard' | 'controls' | 'tracking' | 'security' | 'driver' | 'notifications' | 'settings') => void;
  onToggleMasterSecurity: () => void;
  onToggleDriverSafety: () => void;
  onToggleHeadlights: () => void;
  onToggleDoors: () => void;
  onToggleWindows: () => void;
  onToggleTrunk: () => void;
  onToggleGps: () => void;
  onAdjustTemp: (delta: number) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  vehicle,
  location,
  activities,
  unreadAlertCount,
  onNavigateTab,
  onToggleMasterSecurity,
  onToggleDriverSafety,
  onToggleHeadlights,
  onToggleDoors,
  onToggleWindows,
  onToggleTrunk,
  onToggleGps,
  onAdjustTemp
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero Vehicle Visualizer & Interactive Telemetry Hotspot Canvas */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-cyan-500/25 bg-[#060913] shadow-2xl">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 cyber-grid-bg opacity-40 pointer-events-none" />

        {/* Header HUD Bar on Hero */}
        <div className="relative z-10 p-5 pb-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-white tracking-wider font-mono">
                  {vehicle.carModel}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  {vehicle.plateNumber}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {vehicle.networkType} · {vehicle.connectionStatus.toUpperCase()}
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline font-mono">Gear: [{vehicle.gear}] · 0 km/h</span>
              </div>
            </div>
          </div>

          {/* Master Armed Status Badge */}
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-mono font-bold ${
              vehicle.masterSecurityArmed 
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' 
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}>
              {vehicle.masterSecurityArmed ? <ShieldCheck className="w-4 h-4 text-cyan-400" /> : <ShieldAlert className="w-4 h-4 text-amber-400" />}
              {vehicle.masterSecurityArmed ? 'PERIMETER SENTRY ON' : 'SECURITY STANDBY'}
            </div>

            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-mono font-bold ${
              vehicle.driverSafetyActive 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}>
              {vehicle.driverSafetyActive ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
              {vehicle.driverSafetyActive ? 'DRIVER AI ACTIVE' : 'DRIVER AI OFF'}
            </div>
          </div>
        </div>

        {/* Car Visual Centerpiece with Dynamic Reactive Overlays */}
        <div className="relative w-full aspect-21/9 md:aspect-24/10 min-h-[300px] max-h-[460px] flex items-center justify-center overflow-hidden select-none">
          {/* Base Isometric Car Image */}
          <img
            src="/src/assets/images/car_wireframe_cyber_1792818525279.jpg"
            alt="Futuristic Smart Car Isometric Schematic"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center brightness-105"
          />

          {/* 1. DYNAMIC HEADLIGHTS VISUAL GLOW & LASER BEAMS OVERLAY */}
          {vehicle.headlightsOn && (
            <div className="absolute inset-0 pointer-events-none z-15">
              {/* Massive forward projection beam 1 (Front Left) */}
              <div 
                className="absolute top-[52%] left-[24%] w-[380px] h-[180px] transform -translate-x-[60%] -translate-y-[10%] rotate-[-28deg] opacity-75 mix-blend-screen"
                style={{
                  background: 'conic-gradient(from 190deg at 90% 40%, rgba(0, 229, 255, 0.45) 0deg, rgba(56, 189, 248, 0.25) 25deg, transparent 55deg)',
                  filter: 'blur(10px)'
                }}
              />
              {/* Massive forward projection beam 2 (Front Right) */}
              <div 
                className="absolute top-[60%] left-[34%] w-[420px] h-[200px] transform -translate-x-[65%] -translate-y-[10%] rotate-[-26deg] opacity-80 mix-blend-screen"
                style={{
                  background: 'conic-gradient(from 190deg at 90% 40%, rgba(0, 229, 255, 0.55) 0deg, rgba(14, 165, 233, 0.3) 30deg, transparent 60deg)',
                  filter: 'blur(12px)'
                }}
              />

              {/* Intense Glowing Lens Flares directly on car's twin headlight pods */}
              <div 
                className="absolute top-[62%] left-[36%] w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse"
                style={{
                  background: 'radial-gradient(circle, #ffffff 15%, #00e5ff 60%, transparent 90%)',
                  boxShadow: '0 0 25px #00e5ff, 0 0 50px #00b0ff, 0 0 90px #00e5ff'
                }}
              />
              <div 
                className="absolute top-[50%] left-[26%] w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse"
                style={{
                  background: 'radial-gradient(circle, #ffffff 15%, #00e5ff 60%, transparent 90%)',
                  boxShadow: '0 0 20px #00e5ff, 0 0 40px #00b0ff'
                }}
              />

              {/* Floor illuminated pool */}
              <div 
                className="absolute bottom-[10%] left-[8%] w-[260px] h-[90px] rounded-full opacity-60 mix-blend-screen pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(0,229,255,0.4) 0%, rgba(6,182,212,0.15) 50%, transparent 80%)',
                  filter: 'blur(16px)'
                }}
              />
            </div>
          )}

          {/* 2. DYNAMIC DOOR LOCK / UNLOCK VISUAL OVERLAY */}
          <div className="absolute inset-0 pointer-events-none z-15">
            {vehicle.doorsLocked ? (
              /* Green Secure Lock Barrier Contour */
              <div 
                className="absolute top-[38%] left-[51%] w-[180px] h-[100px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-emerald-400/50 opacity-80"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
                  boxShadow: 'inset 0 0 20px rgba(16, 185, 129, 0.25)'
                }}
              />
            ) : (
              /* Amber Pulsing Warning Barrier when Unlocked */
              <div 
                className="absolute top-[38%] left-[51%] w-[190px] h-[110px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-amber-400/80 animate-pulse"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.2) 0%, transparent 75%)',
                  boxShadow: '0 0 25px rgba(245, 158, 11, 0.4), inset 0 0 20px rgba(245, 158, 11, 0.3)'
                }}
              />
            )}
          </div>

          {/* 3. DYNAMIC WINDOWS VENTILATION / AIRFLOW STREAM OVERLAY */}
          {vehicle.windowsOpen && (
            <div className="absolute inset-0 pointer-events-none z-16">
              {/* Animated cyan air streamlines across roof and side glass */}
              <div 
                className="absolute top-[33%] left-[45%] w-[130px] h-[45px] -translate-x-1/2 -translate-y-1/2 border border-cyan-400/60 rounded-xl"
                style={{
                  background: 'linear-gradient(90deg, rgba(0,229,255,0.2) 0%, rgba(56,189,248,0.05) 100%)',
                  boxShadow: '0 0 15px rgba(0,229,255,0.4)'
                }}
              >
                <div className="absolute inset-0 flex items-center justify-around opacity-75">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          {/* 4. DYNAMIC POWERED TRUNK HATCH OPEN OVERLAY */}
          {vehicle.trunkOpen && (
            <div className="absolute inset-0 pointer-events-none z-16">
              {/* Amber Cargo Compartment Light & Lifted Hatch Outline */}
              <div 
                className="absolute top-[27%] left-[73%] w-[110px] h-[80px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-amber-400/90 animate-pulse"
                style={{
                  background: 'radial-gradient(circle at center, rgba(245, 158, 11, 0.4) 0%, rgba(245, 158, 11, 0.1) 70%, transparent 100%)',
                  boxShadow: '0 0 30px rgba(245, 158, 11, 0.6), inset 0 0 15px rgba(245, 158, 11, 0.4)'
                }}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-amber-500 text-black text-[9px] font-mono font-bold whitespace-nowrap">
                  HATCH OPEN ▲
                </div>
              </div>
            </div>
          )}

          {/* 5. 360° SENTRY SECURITY HOLOGRAPHIC PERIMETER DOME OVERLAY */}
          {vehicle.masterSecurityArmed && (
            <div className="absolute inset-0 pointer-events-none z-14 flex items-center justify-center">
              <div 
                className="w-[82%] h-[80%] rounded-full border border-cyan-400/35 border-dashed animate-spin"
                style={{ 
                  animationDuration: '30s',
                  boxShadow: '0 0 40px rgba(6, 182, 212, 0.15)'
                }}
              />
              <div 
                className="absolute w-[86%] h-[84%] rounded-full border border-cyan-500/15"
              />
            </div>
          )}

          {/* 6. HAZARD FLASHERS / FIND MY CAR BEACONS */}
          {vehicle.hazardLightsOn && (
            <div className="absolute inset-0 pointer-events-none z-18">
              {/* Corner 1: Front Left */}
              <div className="absolute top-[52%] left-[24%] w-6 h-6 rounded-full bg-amber-400 animate-ping opacity-90 shadow-lg shadow-amber-500" />
              {/* Corner 2: Front Right */}
              <div className="absolute top-[65%] left-[38%] w-6 h-6 rounded-full bg-amber-400 animate-ping opacity-90 shadow-lg shadow-amber-500" style={{ animationDelay: '100ms' }} />
              {/* Corner 3: Rear Left */}
              <div className="absolute top-[28%] left-[72%] w-6 h-6 rounded-full bg-amber-400 animate-ping opacity-90 shadow-lg shadow-amber-500" style={{ animationDelay: '200ms' }} />
              {/* Corner 4: Rear Right */}
              <div className="absolute top-[40%] left-[84%] w-6 h-6 rounded-full bg-amber-400 animate-ping opacity-90 shadow-lg shadow-amber-500" style={{ animationDelay: '300ms' }} />
            </div>
          )}

          {/* Interactive Floating Hotspots Overlay with Live State Badges */}
          {/* Headlights Hotspot (Front) */}
          <div className="absolute top-[54%] left-[22%] transform -translate-x-1/2 -translate-y-1/2 z-20">
            <button
              onClick={onToggleHeadlights}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md text-[11px] font-mono border transition-all ${
                vehicle.headlightsOn 
                  ? 'bg-cyan-500/40 border-cyan-300 text-white font-bold neon-glow-cyan scale-105' 
                  : 'bg-slate-950/85 border-slate-700 text-slate-300 hover:border-cyan-500/50'
              }`}
              title="Toggle Matrix Headlights (or say 'light on karo')"
            >
              <Lightbulb className={`w-3.5 h-3.5 ${vehicle.headlightsOn ? 'text-cyan-200 animate-pulse' : 'text-slate-400'}`} />
              <span>Headlights: <strong className={vehicle.headlightsOn ? 'text-cyan-200' : 'text-slate-400'}>{vehicle.headlightsOn ? 'ON (GLOWING)' : 'OFF'}</strong></span>
            </button>
          </div>

          {/* Doors Hotspot (Cabin) */}
          <div className="absolute top-[44%] left-[52%] transform -translate-x-1/2 -translate-y-1/2 z-20">
            <button
              onClick={onToggleDoors}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md text-[11px] font-mono border transition-all ${
                vehicle.doorsLocked 
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 font-bold' 
                  : 'bg-amber-500/35 border-amber-400 text-amber-200 font-bold animate-pulse scale-105'
              }`}
              title="Toggle Door Lock State (or say 'car lock karo')"
            >
              {vehicle.doorsLocked ? <Lock className="w-3.5 h-3.5 text-emerald-400" /> : <Unlock className="w-3.5 h-3.5 text-amber-400" />}
              <span>Doors: <strong className={vehicle.doorsLocked ? 'text-emerald-300' : 'text-amber-300'}>{vehicle.doorsLocked ? 'LOCKED' : 'UNLOCKED'}</strong></span>
            </button>
          </div>

          {/* Windows Hotspot */}
          <div className="absolute top-[32%] left-[43%] transform -translate-x-1/2 -translate-y-1/2 z-20 hidden sm:block">
            <button
              onClick={onToggleWindows}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl backdrop-blur-md text-[11px] font-mono border transition-all ${
                vehicle.windowsOpen 
                  ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 font-bold neon-glow-cyan' 
                  : 'bg-slate-950/85 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
              title="Toggle Power Windows (or say 'window kholo')"
            >
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>Windows: <strong className={vehicle.windowsOpen ? 'text-cyan-300' : 'text-slate-400'}>{vehicle.windowsOpen ? 'OPEN (VENT)' : 'CLOSED'}</strong></span>
            </button>
          </div>

          {/* Trunk Hotspot (Rear) */}
          <div className="absolute top-[26%] left-[74%] transform -translate-x-1/2 -translate-y-1/2 z-20">
            <button
              onClick={onToggleTrunk}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md text-[11px] font-mono border transition-all ${
                vehicle.trunkOpen 
                  ? 'bg-amber-500/40 border-amber-400 text-amber-100 font-bold animate-pulse scale-105' 
                  : 'bg-slate-950/85 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
              title="Toggle Trunk (or say 'dicky kholo')"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Trunk/Dicky: <strong className={vehicle.trunkOpen ? 'text-amber-300' : 'text-slate-400'}>{vehicle.trunkOpen ? 'OPEN' : 'CLOSED'}</strong></span>
            </button>
          </div>
        </div>

        {/* Quick Action Button Strip under Car visual */}
        <div className="relative z-10 p-4 border-t border-cyan-500/15 bg-slate-950/85 backdrop-blur-md flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onToggleMasterSecurity}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                vehicle.masterSecurityArmed 
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 neon-glow-cyan' 
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Master Security: {vehicle.masterSecurityArmed ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={onToggleDriverSafety}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                vehicle.driverSafetyActive 
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200' 
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Driver Safety: {vehicle.driverSafetyActive ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={onToggleDoors}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                vehicle.doorsLocked 
                  ? 'bg-slate-900 border-slate-700 text-slate-300' 
                  : 'bg-amber-500/20 border-amber-400 text-amber-300'
              }`}
            >
              {vehicle.doorsLocked ? 'Unlock Doors' : 'Lock Doors'}
            </button>

            <button
              onClick={onToggleHeadlights}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                vehicle.headlightsOn 
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              Headlights: {vehicle.headlightsOn ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={onToggleGps}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                vehicle.gpsTrackingOn 
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              GPS Tracking: {vehicle.gpsTrackingOn ? 'ON' : 'OFF'}
            </button>
          </div>

          <button
            onClick={() => onNavigateTab('controls')}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors ml-auto"
          >
            All Vehicle Controls <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4-Card Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Battery & Range */}
        <div className="cyber-panel p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase font-mono">Battery &amp; Range</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-white tabular-nums">
                {vehicle.batteryPercent}%
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                {vehicle.estimatedRangeKm} km left
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                style={{ width: `${vehicle.batteryPercent}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            100 kWh Ultium Battery Pack
          </span>
        </div>

        {/* Card 2: Cabin Climate */}
        <div className="cyber-panel p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase font-mono">Cabin Climate</span>
            <Thermometer className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2 flex items-center justify-between">
            <div>
              <span className="text-2xl font-black font-mono text-white tabular-nums">
                {vehicle.cabinTempC.toFixed(1)}°C
              </span>
              <span className="block text-[11px] text-cyan-300">
                {vehicle.climateOn ? 'Auto Climate Active' : 'Climate Standby'}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => onAdjustTemp(-0.5)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                title="Decrease Temp"
              >
                -
              </button>
              <button
                onClick={() => onAdjustTemp(0.5)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                title="Increase Temp"
              >
                +
              </button>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Dual-zone Heat Pump Climate
          </span>
        </div>

        {/* Card 3: Tire Pressure Monitoring (TPMS) */}
        <div className="cyber-panel p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase font-mono">Tire Pressure (TPMS)</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2 grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex justify-between p-1.5 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">FL</span>
              <span className="text-emerald-400 font-bold">{vehicle.tirePressure.frontLeft} PSI</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">FR</span>
              <span className="text-emerald-400 font-bold">{vehicle.tirePressure.frontRight} PSI</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">RL</span>
              <span className="text-emerald-400 font-bold">{vehicle.tirePressure.rearLeft} PSI</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500">RR</span>
              <span className="text-emerald-400 font-bold">{vehicle.tirePressure.rearRight} PSI</span>
            </div>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> All 4 Tires Nominal
          </span>
        </div>

        {/* Card 4: GPS Parking Location */}
        <div className="cyber-panel p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase font-mono">Parked Location</span>
            <MapPin className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="text-sm font-bold text-white line-clamp-1">
              {location.parkingBay}
            </div>
            <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
              {location.address}
            </div>
            <div className="text-[11px] font-mono text-cyan-400 mt-1">
              {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('tracking')}
            className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            Open Live Interactive Map <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Bottom Split: Recent Activities Feed + System Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Activity Feed (7 cols) */}
        <div className="lg:col-span-7 cyber-panel p-5 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Vehicle Event Log
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {activities.length} total entries
            </span>
          </div>

          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[300px] pr-1">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No recent activity recorded.
              </div>
            ) : (
              activities.slice(0, 8).map(act => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <div>
                      <span className="font-semibold text-slate-200">{act.action}</span>
                      {act.details && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{act.details}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                      {act.source}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {act.timestamp}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Security & Safety Quick Health Matrix (5 cols) */}
        <div className="lg:col-span-5 cyber-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-cyan-400" />
              SmartGuard Protection Matrix
            </h3>

            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">360° Sentry Surveillance</span>
                    <span className="text-[11px] text-slate-400">Perimeter camera threat detection</span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab('security')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Inspect
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Driver Attentiveness DMS</span>
                    <span className="text-[11px] text-slate-400">Infrared facial fatigue monitoring</span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab('driver')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  Inspect
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Geofence Guard</span>
                    <span className="text-[11px] text-slate-400">250m safe perimeter boundary</span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab('tracking')}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  View
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Alerts in Queue: <strong className="text-white">{unreadAlertCount}</strong></span>
            <button
              onClick={() => onNavigateTab('notifications')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Open Notification Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
