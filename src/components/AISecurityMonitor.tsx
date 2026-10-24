import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Eye, 
  AlertOctagon, 
  Zap, 
  Camera, 
  Crosshair, 
  Maximize2, 
  BellRing,
  CheckCircle2,
  Clock,
  Info
} from 'lucide-react';
import { VehicleState, SecurityAlert } from '../types';

interface AISecurityMonitorProps {
  vehicle: VehicleState;
  onToggleMasterSecurity: () => void;
  onSimulateIntrusion: () => void;
  onSimulateImpact: () => void;
  onSimulateSuspicious: () => void;
  recentAlerts: SecurityAlert[];
  onAcknowledgeAlert: (id: string) => void;
}

export const AISecurityMonitor: React.FC<AISecurityMonitorProps> = ({
  vehicle,
  onToggleMasterSecurity,
  onSimulateIntrusion,
  onSimulateImpact,
  onSimulateSuspicious,
  recentAlerts,
  onAcknowledgeAlert
}) => {
  const [activeCamera, setActiveCamera] = useState<'front' | 'rear' | 'left' | 'right'>('front');
  const [hudScanY, setHudScanY] = useState<number>(20);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toTimeString().split(' ')[0] + ' UTC+5:30');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Subtle HUD scanner animation
  useEffect(() => {
    const scanInterval = setInterval(() => {
      setHudScanY(prev => (prev >= 90 ? 10 : prev + 2));
    }, 120);
    return () => clearInterval(scanInterval);
  }, []);

  const securityAlerts = recentAlerts.filter(a => a.category === 'security');

  return (
    <div className="flex flex-col gap-6">
      {/* Top Security Banner & Master Switch */}
      <div className={`p-5 rounded-2xl border transition-all ${
        vehicle.masterSecurityArmed 
          ? 'bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 border-cyan-500/40 shadow-lg' 
          : 'bg-slate-950/80 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-xl border ${
              vehicle.masterSecurityArmed 
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 neon-glow-cyan' 
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              {vehicle.masterSecurityArmed ? <ShieldCheck className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Autonomous Sentry &amp; Anti-Theft AI
                </h2>
                <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                  vehicle.masterSecurityArmed 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}>
                  {vehicle.masterSecurityArmed ? 'ARMED &amp; GUARDING' : 'DISARMED / STANDBY'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                360° Computer Vision Perimeter Radar · Glass-break acoustic sensor · 6-axis Tilt/Shock G-sensor
              </p>
            </div>
          </div>

          <button
            onClick={onToggleMasterSecurity}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all tracking-wide uppercase ${
              vehicle.masterSecurityArmed 
                ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-900/40' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black neon-glow-cyan'
            }`}
          >
            {vehicle.masterSecurityArmed ? 'Disarm Master Security' : 'Arm Master Security'}
          </button>
        </div>
      </div>

      {/* Main Sentry Camera Preview & Interactive Simulation Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live 360° Sentry Feed (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-cyan-500/20 bg-slate-950 shadow-2xl group">
            {/* Real generated sentry preview image */}
            <img
              src="/src/assets/images/sentry_perimeter_camera_1792818526033.jpg"
              alt="Live 360 Sentry Mode Camera Feed"
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-all duration-700 ${
                vehicle.masterSecurityArmed ? 'brightness-100 contrast-105' : 'brightness-40 grayscale'
              }`}
            />

            {/* If Disarmed, show large warning overlay */}
            {!vehicle.masterSecurityArmed && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-xs p-6 text-center">
                <ShieldAlert className="w-12 h-12 text-amber-400 mb-3" />
                <h3 className="text-base font-bold text-white">Sentry Monitoring Inactive</h3>
                <p className="text-xs text-slate-400 max-w-md mt-1 mb-4">
                  Master Car Security is currently OFF. Turn ON Master Security to activate AI perimeter surveillance, video recording, and trigger simulation alerts.
                </p>
                <button
                  onClick={onToggleMasterSecurity}
                  className="px-4 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg transition-all"
                >
                  Activate Master Security Now
                </button>
              </div>
            )}

            {/* Live Camera HUD Telemetry Overlays when Armed */}
            {vehicle.masterSecurityArmed && (
              <>
                {/* Top HUD Bar */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-cyan-300 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="font-bold text-red-400">REC</span>
                    <span>·</span>
                    <span>CAM-01 [BAY PERIMETER]</span>
                    <span className="hidden sm:inline">· 1080p 30FPS</span>
                  </div>
                  <div>{currentTimeStr || '22:12:00 UTC'}</div>
                </div>

                {/* Target Detection Bounding Boxes */}
                <div className="absolute top-[28%] left-[26%] w-[260px] h-[160px] border border-cyan-400/80 rounded pointer-events-none">
                  <div className="absolute -top-5 left-0 bg-cyan-950/90 text-cyan-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-cyan-500/50">
                    PROTECTED ASSET: {vehicle.plateNumber} [PARKED]
                  </div>
                  {/* Corner marks */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-300"></div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-cyan-300"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-cyan-300"></div>
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-cyan-300"></div>
                </div>

                {/* Simulated scan line */}
                <div
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent pointer-events-none"
                  style={{ top: `${hudScanY}%` }}
                />

                {/* Bottom Camera Selector Bar */}
                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 bg-slate-950/80 backdrop-blur-md p-2 rounded-xl border border-cyan-500/20">
                  <div className="flex items-center gap-1.5">
                    {(['front', 'rear', 'left', 'right'] as const).map(cam => (
                      <button
                        key={cam}
                        onClick={() => setActiveCamera(cam)}
                        className={`px-2.5 py-1 text-[11px] font-mono rounded-md uppercase transition-all ${
                          activeCamera === cam
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {cam} Lens
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300 px-2">
                    <span className="flex items-center gap-1">
                      <Crosshair className="w-3.5 h-3.5 text-cyan-400" /> Perimeter: Clear
                    </span>
                    <span className="text-cyan-400 font-bold">AI Threat Index: 0.02 (Nominal)</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Camera Feed Disclaimer */}
          <div className="p-3 cyber-panel-subtle rounded-xl flex items-start gap-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Simulated Camera Feed:</strong> In production environments, SmartGuard AI interfaces with vehicle onboard cameras via RTSP / WebRTC hardware encoders, running edge neural networks (YOLO-Auto/MobileNet) to flag loitering and glass tampering.
            </span>
          </div>
        </div>

        {/* Right Column: Threat Simulation Triggers & Event Deck (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="cyber-panel p-5 rounded-2xl flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Security Simulation Lab
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Trigger simulated real-world security threats to test the response system and alert pipelines.
              </p>
            </div>

            {/* Simulation Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={onSimulateIntrusion}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-red-500/30 hover:border-red-500 hover:bg-red-950/30 text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-red-400 group-hover:text-red-300 flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5" /> Simulate Intrusion
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Forced door handle pull / Glass break sensor
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                  HIGH
                </span>
              </button>

              <button
                onClick={onSimulateImpact}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-500 hover:bg-amber-950/30 text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-amber-400 group-hover:text-amber-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Simulate Impact
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Parking bump / 3.8G lateral shock sensor
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  CRITICAL
                </span>
              </button>

              <button
                onClick={onSimulateSuspicious}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-950/30 text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Simulate Suspicious Activity
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Perimeter loitering detected (&gt;45s within 1.2m)
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  WARN
                </span>
              </button>
            </div>

            {/* Note about Master Security state */}
            {!vehicle.masterSecurityArmed && (
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300/90">
                ⚠️ Security is currently OFF. Simulation triggers will automatically prompt you that security must be enabled to generate threat events.
              </div>
            )}
          </div>

          {/* Recent Security Incidents */}
          <div className="cyber-panel p-4 rounded-2xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Recent Security Logs
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                {securityAlerts.length} events
              </span>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-[220px] pr-1">
              {securityAlerts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No security incidents recorded. System nominal.
                </div>
              ) : (
                securityAlerts.slice(0, 5).map(alert => (
                  <div
                    key={alert.id}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${
                        alert.severity === 'critical' ? 'text-red-400' :
                        alert.severity === 'warning' ? 'text-amber-400' : 'text-cyan-400'
                      }`}>
                        {alert.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{alert.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">{alert.description}</p>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="self-end mt-1 text-[10px] text-cyan-400 hover:text-cyan-300 underline"
                      >
                        Acknowledge Event
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
