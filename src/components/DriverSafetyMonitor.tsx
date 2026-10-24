import React, { useState, useRef, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Activity, 
  Camera, 
  Coffee, 
  ShieldCheck, 
  ShieldAlert, 
  RotateCcw,
  Volume2,
  Info,
  CheckCircle2
} from 'lucide-react';
import { VehicleState, SecurityAlert, DrowsinessMetrics } from '../types';

interface DriverSafetyMonitorProps {
  vehicle: VehicleState;
  onToggleDriverSafety: () => void;
  onSimulateDrowsiness: () => void;
  drowsinessAlerts: SecurityAlert[];
  onAcknowledgeAlert: (id: string) => void;
  metrics: DrowsinessMetrics;
  onResetMetrics: () => void;
}

export const DriverSafetyMonitor: React.FC<DriverSafetyMonitorProps> = ({
  vehicle,
  onToggleDriverSafety,
  onSimulateDrowsiness,
  drowsinessAlerts,
  onAcknowledgeAlert,
  metrics,
  onResetMetrics
}) => {
  const [useWebcam, setUseWebcam] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Toggle user webcam stream
  const handleToggleWebcam = async () => {
    if (useWebcam) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setUseWebcam(false);
      setWebcamError(null);
    } else {
      try {
        setWebcamError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false
        });
        setUseWebcam(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: unknown) {
        setWebcamError('Unable to access webcam. Camera permission was denied or device not found. Using IR telemetry mode.');
        setUseWebcam(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const isDrowsyDanger = metrics.fatigueLevel === 'High Drowsiness Danger';

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Independent Switch */}
      <div className={`p-5 rounded-2xl border transition-all ${
        vehicle.driverSafetyActive 
          ? isDrowsyDanger 
            ? 'bg-red-950/60 border-red-500/60 shadow-xl shadow-red-950/50' 
            : 'bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 border-cyan-500/40 shadow-lg' 
          : 'bg-slate-950/80 border-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-xl border ${
              !vehicle.driverSafetyActive 
                ? 'bg-slate-900 border-slate-800 text-slate-500' 
                : isDrowsyDanger
                  ? 'bg-red-500/20 border-red-500 text-red-400 neon-glow-red animate-pulse'
                  : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 neon-glow-cyan'
            }`}>
              {vehicle.driverSafetyActive ? <Eye className="w-7 h-7" /> : <EyeOff className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Driver Attention &amp; Drowsiness AI Monitor
                </h2>
                <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                  vehicle.driverSafetyActive 
                    ? isDrowsyDanger
                      ? 'bg-red-500/20 text-red-300 border border-red-500 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {vehicle.driverSafetyActive ? (isDrowsyDanger ? 'CRITICAL DROWSINESS' : 'MONITORING ACTIVE') : 'STANDBY / DISABLED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Near-Infrared (NIR) Eye Aspect Ratio (EAR) · PERCLOS Fatigue Analysis · Gaze Divergence Tracker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleDriverSafety}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all tracking-wide uppercase ${
                vehicle.driverSafetyActive 
                  ? 'bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black neon-glow-cyan'
              }`}
            >
              {vehicle.driverSafetyActive ? 'Turn OFF Driver Safety' : 'Turn ON Driver Safety'}
            </button>
          </div>
        </div>
      </div>

      {/* Drowsiness Warning Modal / Callout if Drowsy */}
      {isDrowsyDanger && (
        <div className="p-5 rounded-2xl bg-red-950/80 border-2 border-red-500 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500 text-black rounded-xl">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-extrabold uppercase tracking-wide text-red-200">
                Driver Drowsiness Detected!
              </h3>
              <p className="text-sm font-semibold text-red-100 mt-0.5">
                “Driver drowsiness detected. Please stop safely and take a break.”
              </p>
              <p className="text-xs text-red-300/80 mt-1">
                PERCLOS eyelid closure duration exceeded 800ms threshold · Attention Score dropped to {metrics.attentionScore}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetMetrics}
              className="px-4 py-2 text-xs font-bold bg-white text-black hover:bg-slate-200 rounded-xl transition-all"
            >
              Reset / Driver Alert
            </button>
          </div>
        </div>
      )}

      {/* Main Monitoring Section: Video & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Driver Cabin Video Feed (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-cyan-500/20 bg-slate-950 shadow-2xl">
            {useWebcam ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <img
                src="/src/assets/images/driver_monitoring_feed_1792818526816.jpg"
                alt="Infrared Driver Monitoring Feed"
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-all ${
                  !vehicle.driverSafetyActive ? 'brightness-35 grayscale' : isDrowsyDanger ? 'contrast-125 sepia-[0.3]' : 'brightness-100'
                }`}
              />
            )}

            {/* Inactive overlay */}
            {!vehicle.driverSafetyActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs p-6 text-center">
                <EyeOff className="w-12 h-12 text-slate-500 mb-3" />
                <h3 className="text-base font-bold text-white">Driver Safety AI is Disabled</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                  Enable Driver Safety to initiate fatigue pattern recognition, attention scoring, and drowsiness alarms.
                </p>
                <button
                  onClick={onToggleDriverSafety}
                  className="px-4 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg transition-all"
                >
                  Activate Driver Safety
                </button>
              </div>
            )}

            {/* Active HUD Overlays */}
            {vehicle.driverSafetyActive && (
              <>
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-cyan-300 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isDrowsyDanger ? 'bg-red-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`}></span>
                    <span>IR STEERING-COLUMN DMS</span>
                    <span>·</span>
                    <span>{useWebcam ? 'LIVE CAMERA STREAM' : 'SIMULATED IR FEED'}</span>
                  </div>
                  <div>
                    STATUS: <span className={isDrowsyDanger ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>{metrics.fatigueLevel}</span>
                  </div>
                </div>

                {/* Facial Landmark Tracking Box Visual */}
                <div className={`absolute top-[18%] right-[14%] w-[210px] h-[260px] border-2 rounded-lg pointer-events-none transition-all ${
                  isDrowsyDanger ? 'border-red-500 shadow-lg shadow-red-500/30' : 'border-cyan-400/80'
                }`}>
                  <div className={`absolute -top-6 left-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isDrowsyDanger ? 'bg-red-600 text-white' : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                  }`}>
                    {isDrowsyDanger ? 'EYES CLOSED / DROWSY' : 'EYE ASPECT: OPEN (0.34)'}
                  </div>
                </div>

                {/* Bottom Video Switcher */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-cyan-500/20 text-xs">
                  <button
                    onClick={handleToggleWebcam}
                    className="flex items-center gap-1.5 text-cyan-300 hover:text-white transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    {useWebcam ? 'Switch to Simulated IR Feed' : 'Test with Your Web Camera'}
                  </button>

                  <span className="text-[11px] font-mono text-slate-400">
                    Blink Rate: {metrics.blinkRatePerMin} / min
                  </span>
                </div>
              </>
            )}
          </div>

          {webcamError && (
            <div className="p-2.5 rounded-lg bg-amber-950/50 border border-amber-500/30 text-xs text-amber-300">
              {webcamError}
            </div>
          )}

          {/* Technical Hardware Disclaimer Requirement */}
          <div className="p-4 cyber-panel-subtle rounded-xl text-xs text-slate-400 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              Real-World Hardware &amp; AI Architecture Disclosure:
            </div>
            <p>
              This is a functional demonstration prototype. In an automotive deployment, real driver drowsiness detection requires a dedicated <strong>NIR (Near-Infrared 940nm) interior camera</strong> with infrared illuminators (functioning in pitch darkness and through sunglasses), combined with a certified automotive edge NPU executing validated facial landmark and gaze tracking models (ISO 26262 ASIL-B compliance).
            </p>
          </div>
        </div>

        {/* Right: Telemetry & Simulation Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Action Simulation Card */}
          <div className="cyber-panel p-5 rounded-2xl flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Coffee className="w-4 h-4 text-cyan-400" />
                Driver State Simulation
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Trigger drowsiness events to test cabin alarms, notification pushes, and rest stop advisories.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={onSimulateDrowsiness}
                disabled={!vehicle.driverSafetyActive}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-red-950/80 to-slate-900 border border-red-500/40 hover:border-red-500 hover:from-red-900/60 text-left transition-all disabled:opacity-40 group"
              >
                <div>
                  <div className="text-xs font-bold text-red-300 group-hover:text-red-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-400" /> Simulate Drowsiness Alert
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Simulates microsleep, 3+ sec eye closure &amp; head tilt
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/30 text-red-200 border border-red-500/50">
                  TRIGGER
                </span>
              </button>

              <button
                onClick={onResetMetrics}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset to Nominal Alert Driver State
              </button>
            </div>
          </div>

          {/* Live Driver Telemetry Gauges */}
          <div className="cyber-panel p-5 rounded-2xl flex flex-col gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Biometric Telemetry Gauges
            </span>

            {/* Attention Score Progress Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Driver Attention Score</span>
                <span className={`font-mono font-bold ${
                  metrics.attentionScore < 50 ? 'text-red-400' : metrics.attentionScore < 80 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {metrics.attentionScore}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    metrics.attentionScore < 50 ? 'bg-red-500' : metrics.attentionScore < 80 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${metrics.attentionScore}%` }}
                />
              </div>
            </div>

            {/* PERCLOS Eyelid Closure */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">PERCLOS (Eyelid Closure %)</span>
                <span className="font-mono font-bold text-cyan-300">{metrics.perclos}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    metrics.perclos > 40 ? 'bg-red-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${metrics.perclos}%` }}
                />
              </div>
            </div>

            {/* Metric grid */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Gaze Focus</span>
                <span className="text-xs font-bold text-slate-200 mt-0.5 block">{metrics.gazeDirection}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Fatigue Rating</span>
                <span className={`text-xs font-bold mt-0.5 block ${
                  metrics.fatigueLevel === 'Normal' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {metrics.fatigueLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Drowsiness History Log */}
          <div className="cyber-panel p-4 rounded-2xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Driver Fatigue Event Log
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                {drowsinessAlerts.length} logged
              </span>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-[160px] pr-1">
              {drowsinessAlerts.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  No drowsiness events recorded. Driver is alert.
                </div>
              ) : (
                drowsinessAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-red-500/30 flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> {alert.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{alert.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{alert.description}</p>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="self-end mt-1 text-[10px] text-cyan-400 hover:text-cyan-300 underline"
                      >
                        Acknowledge &amp; Clear Tone
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
