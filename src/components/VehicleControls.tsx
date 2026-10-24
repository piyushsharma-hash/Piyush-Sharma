import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Lightbulb, 
  Wind, 
  Layers, 
  Navigation, 
  Thermometer, 
  AlertTriangle, 
  Volume2, 
  Zap, 
  Power,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { VehicleState } from '../types';

interface VehicleControlsProps {
  vehicle: VehicleState;
  onToggleMasterSecurity: () => void;
  onToggleDriverSafety: () => void;
  onToggleHeadlights: () => void;
  onToggleDoors: () => void;
  onToggleDoorIndividual: (door: 'frontLeft' | 'frontRight' | 'rearLeft' | 'rearRight') => void;
  onToggleWindows: () => void;
  onToggleTrunk: () => void;
  onToggleGps: () => void;
  onToggleClimate: () => void;
  onAdjustTemp: (delta: number) => void;
  onToggleHazardLights: () => void;
  onTriggerHorn: () => void;
}

export const VehicleControls: React.FC<VehicleControlsProps> = ({
  vehicle,
  onToggleMasterSecurity,
  onToggleDriverSafety,
  onToggleHeadlights,
  onToggleDoors,
  onToggleDoorIndividual,
  onToggleWindows,
  onToggleTrunk,
  onToggleGps,
  onToggleClimate,
  onAdjustTemp,
  onToggleHazardLights,
  onTriggerHorn
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 cyber-panel rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-wide">Vehicle Control Deck</h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              DIRECT CAN-BUS DISPATCH
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time biometric actuators, perimeter sentry switches, and auxiliary cabin controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Response Latency:</span>
          <span className="text-xs font-mono text-emerald-400 font-bold">12ms (Direct Cloud Relay)</span>
        </div>
      </div>

      {/* Primary Master Switches (Two Dominant Safety Toggles) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Master Car Security */}
        <div className={`p-5 rounded-2xl border transition-all ${
          vehicle.masterSecurityArmed 
            ? 'bg-gradient-to-br from-cyan-950/60 to-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-950/30' 
            : 'bg-slate-950/80 border-slate-800'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl border ${
                vehicle.masterSecurityArmed 
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 neon-glow-cyan' 
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}>
                {vehicle.masterSecurityArmed ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Master Car Security</h3>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Perimeter sentry radar, acoustic glass sensors &amp; intrusion lock
                </span>
              </div>
            </div>

            <button
              onClick={onToggleMasterSecurity}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all uppercase ${
                vehicle.masterSecurityArmed 
                  ? 'bg-cyan-500 text-black font-extrabold neon-glow-cyan' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {vehicle.masterSecurityArmed ? 'ARMED' : 'DISARMED'}
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Status: <strong className={vehicle.masterSecurityArmed ? 'text-cyan-300' : 'text-slate-400'}>
              {vehicle.masterSecurityArmed ? 'Sentry Active (All 4 Cameras)' : 'Standby / Disabled'}
            </strong></span>
            <span className="text-[11px] font-mono">Immediate State Sync</span>
          </div>
        </div>

        {/* Independent Driver Safety Toggle */}
        <div className={`p-5 rounded-2xl border transition-all ${
          vehicle.driverSafetyActive 
            ? 'bg-gradient-to-br from-blue-950/60 to-slate-900 border-cyan-500/50 shadow-lg' 
            : 'bg-slate-950/80 border-slate-800'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl border ${
                vehicle.driverSafetyActive 
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 neon-glow-emerald' 
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}>
                {vehicle.driverSafetyActive ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Driver Safety System</h3>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Near-Infrared DMS, eye-closure PERCLOS &amp; attention alert
                </span>
              </div>
            </div>

            <button
              onClick={onToggleDriverSafety}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all uppercase ${
                vehicle.driverSafetyActive 
                  ? 'bg-emerald-500 text-black font-extrabold neon-glow-emerald' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {vehicle.driverSafetyActive ? 'ACTIVE' : 'DISABLED'}
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Status: <strong className={vehicle.driverSafetyActive ? 'text-emerald-300' : 'text-slate-400'}>
              {vehicle.driverSafetyActive ? 'Real-Time Attentiveness Guard' : 'Monitoring Disabled'}
            </strong></span>
            <span className="text-[11px] font-mono">Independent Circuit</span>
          </div>
        </div>
      </div>

      {/* Grid of Peripheral & Hardware Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Control 1: Master Door Locks */}
        <div className="cyber-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${vehicle.doorsLocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {vehicle.doorsLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-sm font-bold text-white block">Central Door Lock</span>
                <span className="text-xs text-slate-400">Solenoid latches</span>
              </div>
            </div>

            <button
              onClick={onToggleDoors}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                vehicle.doorsLocked
                  ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
                  : 'bg-amber-500/20 border border-amber-400 text-amber-300'
              }`}
            >
              {vehicle.doorsLocked ? 'LOCKED' : 'UNLOCKED'}
            </button>
          </div>

          {/* Individual door statuses */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <button
              onClick={() => onToggleDoorIndividual('frontLeft')}
              className={`p-1.5 rounded border text-left flex justify-between ${vehicle.doorDetails.frontLeft ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-amber-950/30 border-amber-500/40 text-amber-300'}`}
            >
              <span>Driver (FL)</span>
              <span>{vehicle.doorDetails.frontLeft ? 'LOCKED' : 'OPEN'}</span>
            </button>
            <button
              onClick={() => onToggleDoorIndividual('frontRight')}
              className={`p-1.5 rounded border text-left flex justify-between ${vehicle.doorDetails.frontRight ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-amber-950/30 border-amber-500/40 text-amber-300'}`}
            >
              <span>Pass (FR)</span>
              <span>{vehicle.doorDetails.frontRight ? 'LOCKED' : 'OPEN'}</span>
            </button>
            <button
              onClick={() => onToggleDoorIndividual('rearLeft')}
              className={`p-1.5 rounded border text-left flex justify-between ${vehicle.doorDetails.rearLeft ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-amber-950/30 border-amber-500/40 text-amber-300'}`}
            >
              <span>Rear (RL)</span>
              <span>{vehicle.doorDetails.rearLeft ? 'LOCKED' : 'OPEN'}</span>
            </button>
            <button
              onClick={() => onToggleDoorIndividual('rearRight')}
              className={`p-1.5 rounded border text-left flex justify-between ${vehicle.doorDetails.rearRight ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-amber-950/30 border-amber-500/40 text-amber-300'}`}
            >
              <span>Rear (RR)</span>
              <span>{vehicle.doorDetails.rearRight ? 'LOCKED' : 'OPEN'}</span>
            </button>
          </div>
        </div>

        {/* Control 2: Headlights */}
        <div className="cyber-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${vehicle.headlightsOn ? 'bg-cyan-500/20 text-cyan-300 neon-glow-cyan' : 'bg-slate-900 text-slate-500'}`}>
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">Matrix LED Headlights</span>
                <span className="text-xs text-slate-400">High-beam projector &amp; DRLs</span>
              </div>
            </div>

            <button
              onClick={onToggleHeadlights}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                vehicle.headlightsOn 
                  ? 'bg-cyan-500 text-black font-extrabold neon-glow-cyan' 
                  : 'bg-slate-900 border border-slate-700 text-slate-400'
              }`}
            >
              {vehicle.headlightsOn ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Adaptive Curve Illumination</span>
            <span className="font-mono text-cyan-300">{vehicle.headlightsOn ? 'Active Beam' : 'Standby'}</span>
          </div>
        </div>

        {/* Control 3: Windows */}
        <div className="cyber-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${vehicle.windowsOpen ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-900 text-slate-500'}`}>
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">Power Windows</span>
                <span className="text-xs text-slate-400">All 4 passenger windows</span>
              </div>
            </div>

            <button
              onClick={onToggleWindows}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                vehicle.windowsOpen 
                  ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200' 
                  : 'bg-slate-900 border border-slate-700 text-slate-400'
              }`}
            >
              {vehicle.windowsOpen ? 'OPEN' : 'CLOSED'}
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Ventilation Mode</span>
            <span className="font-mono">{vehicle.windowsOpen ? 'Vented 50mm' : 'Fully Sealed'}</span>
          </div>
        </div>

        {/* Control 4: Powered Trunk */}
        <div className="cyber-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${vehicle.trunkOpen ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-900 text-slate-500'}`}>
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">Powered Trunk / Boot</span>
                <span className="text-xs text-slate-400">Rear liftgate actuator</span>
              </div>
            </div>

            <button
              onClick={onToggleTrunk}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                vehicle.trunkOpen 
                  ? 'bg-amber-500/25 border border-amber-400 text-amber-200' 
                  : 'bg-slate-900 border border-slate-700 text-slate-400'
              }`}
            >
              {vehicle.trunkOpen ? 'OPEN' : 'CLOSED'}
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Trunk Capacity: 490 Liters</span>
            <span className="font-mono">{vehicle.trunkOpen ? 'Hatch Lifted' : 'Latched'}</span>
          </div>
        </div>

        {/* Control 5: GPS Tracking */}
        <div className="cyber-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${vehicle.gpsTrackingOn ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-900 text-slate-500'}`}>
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">Continuous GPS Tracking</span>
                <span className="text-xs text-slate-400">GNSS multi-band uplink</span>
              </div>
            </div>

            <button
              onClick={onToggleGps}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                vehicle.gpsTrackingOn 
                  ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300' 
                  : 'bg-slate-900 border border-slate-700 text-slate-400'
              }`}
            >
              {vehicle.gpsTrackingOn ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Telemetry Ping Interval</span>
            <span className="font-mono text-cyan-300">{vehicle.gpsTrackingOn ? '1.0s Rate' : 'Offline'}</span>
          </div>
        </div>

        {/* Control 6: Cabin Climate & Temp */}
        <div className="cyber-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${vehicle.climateOn ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-900 text-slate-500'}`}>
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">HVAC Pre-Conditioning</span>
                <span className="text-xs text-slate-400">{vehicle.cabinTempC.toFixed(1)}°C Setpoint</span>
              </div>
            </div>

            <button
              onClick={onToggleClimate}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                vehicle.climateOn 
                  ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300' 
                  : 'bg-slate-900 border border-slate-700 text-slate-400'
              }`}
            >
              {vehicle.climateOn ? 'ACTIVE' : 'OFF'}
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Cabin Temp:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAdjustTemp(-0.5)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs"
              >
                -
              </button>
              <span className="text-sm font-bold font-mono text-white">{vehicle.cabinTempC.toFixed(1)}°C</span>
              <button
                onClick={() => onAdjustTemp(0.5)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency & Audio Horn Controls */}
      <div className="p-5 cyber-panel rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Emergency Warning &amp; Signal Actuators</h4>
            <p className="text-xs text-slate-400">Manual hazard beacon flashing and perimeter locator horn test</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleHazardLights}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
              vehicle.hazardLightsOn 
                ? 'bg-amber-500 text-black border-amber-400 animate-pulse font-extrabold' 
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {vehicle.hazardLightsOn ? 'Stop Hazards' : 'Flash Hazard Lights'}
          </button>

          <button
            onClick={onTriggerHorn}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white transition-all"
          >
            <Volume2 className="w-4 h-4 text-cyan-400" />
            Sound Locator Horn
          </button>
        </div>
      </div>
    </div>
  );
};
