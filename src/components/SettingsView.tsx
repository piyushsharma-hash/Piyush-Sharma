import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Volume2, 
  VolumeX, 
  Bell, 
  Radio, 
  RotateCcw, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle,
  FileCode,
  HardDrive,
  Info,
  Car
} from 'lucide-react';
import { AppSettings, VehicleState } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  vehicle: VehicleState;
  onUpdateVehicleMeta: (updates: Partial<VehicleState>) => void;
  onResetDemoState: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  vehicle,
  onUpdateVehicleMeta,
  onResetDemoState
}) => {
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setRequestStatus('Notification permission granted.');
        onUpdateSettings({ demoMode: true });
      } else {
        setRequestStatus('Notification permission was declined in browser.');
      }
    } else {
      setRequestStatus('Browser notifications not supported in this environment.');
    }
    setTimeout(() => setRequestStatus(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Settings Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 cyber-panel rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              System Preferences &amp; Telematics Configuration
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Audio feedback synthesis, connection simulation, and hardware compliance.
            </p>
          </div>
        </div>

        <button
          onClick={onResetDemoState}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/40 border border-red-500/40 hover:bg-red-900/60 text-red-300 text-xs font-bold transition-all self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo State
        </button>
      </div>

      {/* Main Settings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Audio & Voice Settings */}
        <div className="cyber-panel p-5 rounded-2xl flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            Audio &amp; Voice Synthesis
          </h3>

          <div className="flex flex-col gap-3">
            {/* Sound FX Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">UI Sound Effects</span>
                <span className="text-[11px] text-slate-400">
                  Synthesized locks, alarms, chimes, and button clicks
                </span>
              </div>
              <button
                onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  settings.soundEnabled 
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 neon-glow-cyan' 
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {settings.soundEnabled ? 'ENABLED' : 'MUTED'}
              </button>
            </div>

            {/* Button Voice Alerts Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  Button Voice Alerts (अलर्ट आवाज़)
                </span>
                <span className="text-[11px] text-slate-400">
                  Speaks audible warnings &amp; state changes on every button click
                </span>
              </div>
              <button
                onClick={() => onUpdateSettings({ voiceAlertsEnabled: !settings.voiceAlertsEnabled })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  settings.voiceAlertsEnabled 
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 neon-glow-cyan' 
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {settings.voiceAlertsEnabled ? 'VOICE ON' : 'VOICE OFF'}
              </button>
            </div>

            {/* Alert Speech Language */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Voice Alert Language</span>
                <span className="text-[11px] text-slate-400">Language for spoken button notifications</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdateSettings({ speechLanguage: 'en-US' })}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    settings.speechLanguage === 'en-US' 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => onUpdateSettings({ speechLanguage: 'hi-IN' })}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    settings.speechLanguage === 'hi-IN' 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  हिंदी (Hindi)
                </button>
              </div>
            </div>

            {/* Voice Feedback TTS */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Voice Copilot Speech (TTS)</span>
                <span className="text-[11px] text-slate-400">
                  AI reads voice command responses out loud
                </span>
              </div>
              <button
                onClick={() => onUpdateSettings({ voiceFeedbackEnabled: !settings.voiceFeedbackEnabled })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  settings.voiceFeedbackEnabled 
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {settings.voiceFeedbackEnabled ? 'ACTIVE' : 'OFF'}
              </button>
            </div>

            {/* Drowsiness Sensitivity */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Drowsiness Sensitivity</span>
                <span className="text-[11px] text-slate-400">PERCLOS fatigue trigger threshold</span>
              </div>
              <select
                value={settings.drowsinessSensitivity}
                onChange={(e) => onUpdateSettings({ drowsinessSensitivity: e.target.value as any })}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-mono outline-none"
              >
                <option value="standard">Standard (800ms)</option>
                <option value="high">High (600ms)</option>
                <option value="maximum">Maximum (400ms)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Connectivity & Demo Simulation Modes */}
        <div className="cyber-panel p-5 rounded-2xl flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            Network Link &amp; Telematics
          </h3>

          <div className="flex flex-col gap-3">
            {/* Connection Mode Simulation */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Uplink Connectivity</span>
                <span className="text-[11px] text-slate-400">Simulate cloud data connectivity status</span>
              </div>
              <div className="flex items-center gap-1">
                {(['5G Ultra', 'Satellite', 'Offline'] as const).map(net => (
                  <button
                    key={net}
                    onClick={() => {
                      onUpdateVehicleMeta({
                        networkType: net,
                        connectionStatus: net === 'Offline' ? 'offline' : 'connected'
                      });
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                      vehicle.networkType === net
                        ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>

            {/* Browser Push Notifications */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">System Push Notifications</span>
                <span className="text-[11px] text-slate-400">Prompt for browser alert notifications</span>
              </div>
              <button
                onClick={requestNotificationPermission}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all"
              >
                Request
              </button>
            </div>

            {requestStatus && (
              <span className="text-xs text-cyan-400 font-mono px-1">
                {requestStatus}
              </span>
            )}

            {/* Vehicle Profile Customization */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
              <span className="text-xs font-bold text-white block">Vehicle Model Identifier</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={vehicle.carModel}
                  onChange={(e) => onUpdateVehicleMeta({ carModel: e.target.value })}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white outline-none"
                  placeholder="Car Model Name"
                />
                <input
                  type="text"
                  value={vehicle.plateNumber}
                  onChange={(e) => onUpdateVehicleMeta({ plateNumber: e.target.value })}
                  className="w-28 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white font-mono uppercase outline-none"
                  placeholder="Plate"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Required Hardware & Production Architecture Disclosure */}
      <div className="cyber-panel p-6 rounded-2xl flex flex-col gap-4 border border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Production Telematics &amp; Hardware Requirements Architecture
            </h3>
            <span className="text-xs text-slate-400">
              Technical specification for transitioning SmartGuard AI from prototype to real-world automotive hardware
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-bold text-white block mb-1 text-sm flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              1. On-Board Telematics (OBD-II / CAN)
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Direct communication with the Controller Area Network (CAN-bus) via an automotive ECU telematics gateway. Enforces encrypted cryptographic handshakes for door actuation, high-beam control, and tire pressure sensor (TPMS) broadcast.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-bold text-white block mb-1 text-sm flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              2. Edge Computer Vision NPU
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Near-Infrared (NIR 940nm) steering-column driver camera with integrated illumination. On-device NPU calculates 68 facial landmarks to evaluate Eye Aspect Ratio (EAR), PERCLOS eyelid closure, and head yaw in pitch dark or sunglasses.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-bold text-white block mb-1 text-sm flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-cyan-400" />
              3. 360° Sentry &amp; Cloud Telemetry
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              4-camera perimeter surround vision with acoustic glass-break sensors and 6-axis MEMS accelerometer. Cellular eSIM maintains low-power MQTT/WebSocket connection to securely transmit tamper notifications and live GPS coordinates.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Simulation Note:</strong> All commands, sensor readouts, GPS telemetry, and simulated camera feeds are running client-side within this prototype for competitive presentation and safe testing without requiring live vehicle access.
          </span>
        </div>
      </div>
    </div>
  );
};
