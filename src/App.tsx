import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Sliders, 
  MapPin, 
  Camera, 
  Eye, 
  Bell, 
  Settings as SettingsIcon, 
  Mic, 
  AlertTriangle, 
  X, 
  Lock, 
  Unlock,
  Radio,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { 
  VehicleState, 
  LocationState, 
  SecurityAlert, 
  ActivityLog, 
  AppSettings, 
  DrowsinessMetrics 
} from './types';
import { soundFx } from './utils/audio';
import { playButtonVoiceAlert, VOICE_ALERTS, subscribeToVoiceAlerts } from './utils/voiceAlerts';
import { MainDashboard } from './components/MainDashboard';
import { VehicleControls } from './components/VehicleControls';
import { CarTrackingMap } from './components/CarTrackingMap';
import { AISecurityMonitor } from './components/AISecurityMonitor';
import { DriverSafetyMonitor } from './components/DriverSafetyMonitor';
import { NotificationsHub } from './components/NotificationsHub';
import { SettingsView } from './components/SettingsView';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';

const INITIAL_VEHICLE_STATE: VehicleState = {
  masterSecurityArmed: true,
  driverSafetyActive: true,
  headlightsOn: false,
  doorsLocked: true,
  doorDetails: { frontLeft: true, frontRight: true, rearLeft: true, rearRight: true },
  windowsOpen: false,
  trunkOpen: false,
  gpsTrackingOn: true,
  climateOn: true,
  cabinTempC: 21.5,
  batteryPercent: 86,
  estimatedRangeKm: 432,
  hazardLightsOn: false,
  hornActive: false,
  speedKmh: 0,
  gear: 'P',
  tirePressure: { frontLeft: 36, frontRight: 36, rearLeft: 35, rearRight: 36 },
  carModel: 'SmartGuard EV-9 CyberSedan',
  plateNumber: 'SG-2026-AI',
  connectionStatus: 'connected',
  networkType: '5G Ultra',
  lastPingTime: 'Just now'
};

const INITIAL_LOCATION_STATE: LocationState = {
  address: 'DLF Cyber City, Sector 24, Gurugram, India',
  latitude: 28.4986,
  longitude: 77.0894,
  altitudeM: 224,
  accuracyM: 2.1,
  parkingBay: 'Level B2 · Bay 07 (EV Charging)',
  lastUpdated: '22:15:00 UTC',
  geofenceRadiusM: 250,
  isWithinGeofence: true
};

const INITIAL_ALERTS: SecurityAlert[] = [
  {
    id: 'alt-1',
    timestamp: '10 mins ago',
    category: 'security',
    severity: 'info',
    title: 'Master Sentry Shield Armed',
    description: '360° perimeter sentry mode armed. All 4 cameras recording motion buffers.',
    read: true,
    acknowledged: true
  },
  {
    id: 'alt-2',
    timestamp: '25 mins ago',
    category: 'safety',
    severity: 'info',
    title: 'Driver Attention DMS Initialized',
    description: 'Infrared steering-column eye tracker calibrated for driver baseline.',
    read: true,
    acknowledged: true
  }
];

const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    timestamp: 'Just now',
    action: 'System Initialized',
    category: 'controls',
    source: 'system',
    details: 'CAN-bus link synchronized with 5G Ultra cellular relay'
  },
  {
    id: 'act-2',
    timestamp: '12 mins ago',
    action: 'Central Doors Locked',
    category: 'controls',
    source: 'manual',
    details: 'All 4 motorized latches secured'
  },
  {
    id: 'act-3',
    timestamp: '25 mins ago',
    action: 'Master Security Armed',
    category: 'security',
    source: 'manual',
    details: 'Sentry grid and acoustic glass sensors online'
  }
];

const INITIAL_SETTINGS: AppSettings = {
  soundEnabled: true,
  voiceAlertsEnabled: true,
  voiceFeedbackEnabled: true,
  demoMode: true,
  speechLanguage: 'en-US',
  drowsinessSensitivity: 'standard'
};

const NOMINAL_METRICS: DrowsinessMetrics = {
  perclos: 8,
  blinkRatePerMin: 18,
  gazeDirection: 'Forward',
  attentionScore: 98,
  yawnDetected: false,
  fatigueLevel: 'Normal'
};

export default function App() {
  const [vehicle, setVehicle] = useState<VehicleState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sg_vehicle_state');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return INITIAL_VEHICLE_STATE;
  });

  const [location, setLocation] = useState<LocationState>(INITIAL_LOCATION_STATE);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sg_alerts');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return INITIAL_ALERTS;
  });

  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [driverMetrics, setDriverMetrics] = useState<DrowsinessMetrics>(NOMINAL_METRICS);

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'controls' | 'tracking' | 'security' | 'driver' | 'notifications' | 'settings'
  >('dashboard');

  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState<boolean>(false);
  const [findingCar, setFindingCar] = useState<boolean>(false);
  const [activeSecurityModal, setActiveSecurityModal] = useState<SecurityAlert | null>(null);
  const [activeVoiceToast, setActiveVoiceToast] = useState<{ text: string; isEmergency?: boolean } | null>(null);

  // Subscribe to audible voice announcements
  useEffect(() => {
    return subscribeToVoiceAlerts((announcement) => {
      setActiveVoiceToast(announcement);
      const timer = setTimeout(() => {
        setActiveVoiceToast(prev => prev?.text === announcement.text ? null : prev);
      }, 4200);
      return () => clearTimeout(timer);
    });
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('sg_vehicle_state', JSON.stringify(vehicle));
    } catch {}
  }, [vehicle]);

  useEffect(() => {
    try {
      localStorage.setItem('sg_alerts', JSON.stringify(alerts));
    } catch {}
  }, [alerts]);

  // Log an activity entry
  const logActivity = (
    action: string,
    category: ActivityLog['category'],
    source: ActivityLog['source'],
    details?: string
  ) => {
    const newEntry: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action,
      category,
      source,
      details
    };
    setActivities(prev => [newEntry, ...prev.slice(0, 40)]);
  };

  // Add an alert entry
  const addAlert = (
    category: SecurityAlert['category'],
    severity: SecurityAlert['severity'],
    title: string,
    description: string
  ) => {
    const newAlert: SecurityAlert = {
      id: `alt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      category,
      severity,
      title,
      description,
      read: false,
      acknowledged: false
    };
    setAlerts(prev => [newAlert, ...prev]);
    return newAlert;
  };

  // 1. MASTER SECURITY ON/OFF
  const handleToggleMasterSecurity = () => {
    const nextState = !vehicle.masterSecurityArmed;
    setVehicle(prev => ({
      ...prev,
      masterSecurityArmed: nextState,
      doorsLocked: nextState ? true : prev.doorsLocked
    }));

    if (nextState) {
      soundFx.playArmSecurity(settings.soundEnabled);
      playButtonVoiceAlert(VOICE_ALERTS.securityArmed, settings.voiceAlertsEnabled, settings.speechLanguage);
      logActivity('Master Security Armed', 'security', 'manual', '360° Sentry mode & anti-theft sensors active');
      addAlert('security', 'info', 'Perimeter Sentry Armed', 'Vehicle sentry sensors active. Threat detection online.');
    } else {
      soundFx.playDisarmSecurity(settings.soundEnabled);
      playButtonVoiceAlert(VOICE_ALERTS.securityDisarmed, settings.voiceAlertsEnabled, settings.speechLanguage);
      logActivity('Master Security Disarmed', 'security', 'manual', 'Perimeter threat detection stands down');
    }
  };

  // 2. DRIVER SAFETY ON/OFF
  const handleToggleDriverSafety = () => {
    const nextState = !vehicle.driverSafetyActive;
    setVehicle(prev => ({ ...prev, driverSafetyActive: nextState }));
    soundFx.playClick(settings.soundEnabled);

    if (nextState) {
      playButtonVoiceAlert(VOICE_ALERTS.driverSafetyOn, settings.voiceAlertsEnabled, settings.speechLanguage);
      logActivity('Driver Safety Activated', 'safety', 'manual', 'NIR DMS eye-tracking & fatigue score online');
      addAlert('safety', 'info', 'Driver Safety DMS Online', 'Infrared attentiveness monitoring initialized.');
    } else {
      playButtonVoiceAlert(VOICE_ALERTS.driverSafetyOff, settings.voiceAlertsEnabled, settings.speechLanguage);
      logActivity('Driver Safety Deactivated', 'safety', 'manual', 'Driver monitoring disabled');
      setDriverMetrics(NOMINAL_METRICS);
    }
  };

  // 3. HEADLIGHTS ON/OFF
  const handleToggleHeadlights = () => {
    const nextState = !vehicle.headlightsOn;
    setVehicle(prev => ({ ...prev, headlightsOn: nextState }));
    soundFx.playClick(settings.soundEnabled);
    playButtonVoiceAlert(
      nextState ? VOICE_ALERTS.headlightsOn : VOICE_ALERTS.headlightsOff,
      settings.voiceAlertsEnabled,
      settings.speechLanguage
    );
    logActivity(
      nextState ? 'Matrix Headlights Turned ON' : 'Matrix Headlights Turned OFF',
      'controls',
      'manual'
    );
  };

  // 4. CENTRAL DOORS LOCK/UNLOCK
  const handleToggleDoors = () => {
    const nextLocked = !vehicle.doorsLocked;
    setVehicle(prev => ({
      ...prev,
      doorsLocked: nextLocked,
      doorDetails: {
        frontLeft: nextLocked,
        frontRight: nextLocked,
        rearLeft: nextLocked,
        rearRight: nextLocked
      }
    }));

    if (nextLocked) {
      soundFx.playLock(settings.soundEnabled);
      playButtonVoiceAlert(VOICE_ALERTS.doorsLocked, settings.voiceAlertsEnabled, settings.speechLanguage);
      logActivity('All Doors Locked', 'controls', 'manual', 'Solenoid central latches engaged');
    } else {
      soundFx.playUnlock(settings.soundEnabled);
      playButtonVoiceAlert(VOICE_ALERTS.doorsUnlocked, settings.voiceAlertsEnabled, settings.speechLanguage);
      logActivity('All Doors Unlocked', 'controls', 'manual', 'Doors unlatched');
    }
  };

  // Individual Door Toggle
  const handleToggleDoorIndividual = (door: keyof typeof vehicle.doorDetails) => {
    const current = vehicle.doorDetails[door];
    const nextDoorState = !current;
    soundFx.playClick(settings.soundEnabled);

    setVehicle(prev => {
      const updated = { ...prev.doorDetails, [door]: nextDoorState };
      const allLocked = Object.values(updated).every(Boolean);
      return {
        ...prev,
        doorDetails: updated,
        doorsLocked: allLocked
      };
    });

    playButtonVoiceAlert(
      VOICE_ALERTS.doorSingle(door, nextDoorState),
      settings.voiceAlertsEnabled,
      settings.speechLanguage
    );
    logActivity(`Door [${door}] ${nextDoorState ? 'Locked' : 'Unlocked'}`, 'controls', 'manual');
  };

  // 5. WINDOWS OPEN/CLOSE
  const handleToggleWindows = () => {
    const nextOpen = !vehicle.windowsOpen;
    setVehicle(prev => ({ ...prev, windowsOpen: nextOpen }));
    soundFx.playClick(settings.soundEnabled);
    playButtonVoiceAlert(
      nextOpen ? VOICE_ALERTS.windowsOpen : VOICE_ALERTS.windowsClosed,
      settings.voiceAlertsEnabled,
      settings.speechLanguage
    );
    logActivity(
      nextOpen ? 'Power Windows Lowered (Vent Mode)' : 'Power Windows Sealed',
      'controls',
      'manual'
    );
  };

  // 6. TRUNK OPEN/CLOSE
  const handleToggleTrunk = () => {
    const nextOpen = !vehicle.trunkOpen;
    setVehicle(prev => ({ ...prev, trunkOpen: nextOpen }));
    soundFx.playClick(settings.soundEnabled);
    playButtonVoiceAlert(
      nextOpen ? VOICE_ALERTS.trunkOpen : VOICE_ALERTS.trunkClosed,
      settings.voiceAlertsEnabled,
      settings.speechLanguage
    );
    logActivity(
      nextOpen ? 'Powered Trunk Hatch Opened' : 'Powered Trunk Hatch Closed & Latched',
      'controls',
      'manual'
    );
  };

  // 7. GPS TRACKING ON/OFF
  const handleToggleGps = () => {
    const nextGps = !vehicle.gpsTrackingOn;
    setVehicle(prev => ({ ...prev, gpsTrackingOn: nextGps }));
    soundFx.playClick(settings.soundEnabled);
    playButtonVoiceAlert(
      nextGps ? VOICE_ALERTS.gpsOn : VOICE_ALERTS.gpsOff,
      settings.voiceAlertsEnabled,
      settings.speechLanguage
    );
    logActivity(
      nextGps ? 'GPS Tracking Uplink Enabled' : 'GPS Tracking Uplink Disabled (Privacy Mode)',
      'location',
      'manual'
    );
  };

  // 8. CLIMATE & TEMP
  const handleToggleClimate = () => {
    const nextClimate = !vehicle.climateOn;
    setVehicle(prev => ({ ...prev, climateOn: nextClimate }));
    soundFx.playClick(settings.soundEnabled);
    playButtonVoiceAlert(
      nextClimate ? VOICE_ALERTS.climateOn : VOICE_ALERTS.climateOff,
      settings.voiceAlertsEnabled,
      settings.speechLanguage
    );
    logActivity(nextClimate ? 'HVAC Climate Started' : 'HVAC Climate Stopped', 'controls', 'manual');
  };

  const handleAdjustTemp = (delta: number) => {
    soundFx.playClick(settings.soundEnabled);
    setVehicle(prev => {
      const newTemp = Math.min(28, Math.max(16, prev.cabinTempC + delta));
      return { ...prev, cabinTempC: newTemp };
    });
  };

  // 9. HAZARD LIGHTS & HORN
  const handleToggleHazardLights = () => {
    const nextState = !vehicle.hazardLightsOn;
    setVehicle(prev => ({ ...prev, hazardLightsOn: nextState }));
    soundFx.playClick(settings.soundEnabled);
    playButtonVoiceAlert(
      nextState ? VOICE_ALERTS.hazardOn : VOICE_ALERTS.hazardOff,
      settings.voiceAlertsEnabled,
      settings.speechLanguage
    );
    logActivity(nextState ? 'Emergency Hazard Flashers ON' : 'Hazard Flashers OFF', 'controls', 'manual');
  };

  const handleTriggerHorn = () => {
    soundFx.playHorn(settings.soundEnabled);
    playButtonVoiceAlert(VOICE_ALERTS.horn, settings.voiceAlertsEnabled, settings.speechLanguage);
    logActivity('Audible Locator Horn Triggered', 'controls', 'manual');
  };

  // 10. FIND MY CAR
  const handleFindMyCar = () => {
    if (!vehicle.gpsTrackingOn) return;
    setFindingCar(true);
    soundFx.playHorn(settings.soundEnabled);
    playButtonVoiceAlert(VOICE_ALERTS.findMyCar, settings.voiceAlertsEnabled, settings.speechLanguage);
    setVehicle(prev => ({ ...prev, hazardLightsOn: true }));
    logActivity('Find My Car Activated', 'location', 'manual', 'Emitting horn acoustic chime and flashing hazard beacons');

    setTimeout(() => {
      soundFx.playHorn(settings.soundEnabled);
    }, 1200);

    setTimeout(() => {
      setFindingCar(false);
      setVehicle(prev => ({ ...prev, hazardLightsOn: false }));
    }, 3800);
  };

  // 11. REFRESH LOCATION
  const handleRefreshLocation = () => {
    soundFx.playClick(settings.soundEnabled);
    playButtonVoiceAlert(VOICE_ALERTS.refreshLocation, settings.voiceAlertsEnabled, settings.speechLanguage);
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC';
    // Subtle coordinate drift within 0.0001 for realism
    setLocation(prev => ({
      ...prev,
      lastUpdated: nowStr,
      latitude: 28.4986 + (Math.random() - 0.5) * 0.0002,
      longitude: 77.0894 + (Math.random() - 0.5) * 0.0002
    }));
    logActivity('GPS Location Synchronized', 'location', 'manual', 'Fresh ephemeris lock from 18 GNSS satellites');
  };

  // 12. SECURITY SIMULATIONS
  const handleSimulateIntrusion = () => {
    if (!vehicle.masterSecurityArmed) {
      alert('Master Security is OFF. Please turn ON Master Car Security first to simulate perimeter intrusion alerts.');
      return;
    }
    soundFx.playEmergencyAlert(settings.soundEnabled);
    playButtonVoiceAlert(VOICE_ALERTS.simulateIntrusion, settings.voiceAlertsEnabled, settings.speechLanguage);
    setVehicle(prev => ({ ...prev, hazardLightsOn: true }));
    const alertItem = addAlert(
      'security',
      'critical',
      'Perimeter Intrusion Detected!',
      'Front-left door handle forcibly agitated and acoustic glass vibration sensor triggered in Bay 07.'
    );
    setActiveSecurityModal(alertItem);
    logActivity('SECURITY ALARM: Intrusion Attempt', 'security', 'security_ai', 'Door tamper sensor exceeded threshold');

    setTimeout(() => {
      setVehicle(prev => ({ ...prev, hazardLightsOn: false }));
    }, 4000);
  };

  const handleSimulateImpact = () => {
    if (!vehicle.masterSecurityArmed) {
      alert('Master Security is OFF. Please turn ON Master Car Security first to simulate impact alerts.');
      return;
    }
    soundFx.playEmergencyAlert(settings.soundEnabled);
    playButtonVoiceAlert(VOICE_ALERTS.simulateImpact, settings.voiceAlertsEnabled, settings.speechLanguage);
    const alertItem = addAlert(
      'security',
      'critical',
      'Physical Impact Warning (3.8G Lateral Shock)',
      'High-G accelerometer detected sudden shock to rear quarter bumper. Sentry 360° video buffered to storage.'
    );
    setActiveSecurityModal(alertItem);
    logActivity('SECURITY ALARM: Vehicle Impact', 'security', 'security_ai', '3.8G accelerometer impulse registered');
  };

  const handleSimulateSuspicious = () => {
    if (!vehicle.masterSecurityArmed) {
      alert('Master Security is OFF. Please turn ON Master Car Security first to simulate suspicious activity.');
      return;
    }
    soundFx.playClick(settings.soundEnabled);
    playButtonVoiceAlert(VOICE_ALERTS.simulateSuspicious, settings.voiceAlertsEnabled, settings.speechLanguage);
    const alertItem = addAlert(
      'security',
      'warning',
      'Suspicious Loitering Near Perimeter',
      'Unidentified individual detected within 1.2m of driver side for greater than 45 seconds.'
    );
    setActiveSecurityModal(alertItem);
    logActivity('SECURITY WARNING: Perimeter Loitering', 'security', 'security_ai', 'Computer vision pedestrian proximity alert');
  };

  // 13. DROWSINESS SIMULATION
  const handleSimulateDrowsiness = () => {
    if (!vehicle.driverSafetyActive) return;

    soundFx.playEmergencyAlert(settings.soundEnabled);
    playButtonVoiceAlert(VOICE_ALERTS.simulateDrowsiness, settings.voiceAlertsEnabled, settings.speechLanguage);
    setDriverMetrics({
      perclos: 64,
      blinkRatePerMin: 6,
      gazeDirection: 'Downward (Eyes Closed)',
      attentionScore: 24,
      yawnDetected: true,
      fatigueLevel: 'High Drowsiness Danger'
    });

    const alertItem = addAlert(
      'safety',
      'critical',
      'Driver Drowsiness Detected!',
      '“Driver drowsiness detected. Please stop safely and take a break.” PERCLOS eyelid closure exceeded 800ms safety threshold.'
    );
    setActiveSecurityModal(alertItem);
    logActivity('DRIVER SAFETY: Drowsiness Alert Triggered', 'safety', 'safety_ai', 'PERCLOS 64% - Immediate rest advisory issued');
  };

  const handleResetMetrics = () => {
    soundFx.playClick(settings.soundEnabled);
    setDriverMetrics(NOMINAL_METRICS);
    logActivity('Driver Attention State Reset', 'safety', 'manual', 'Biometric metrics restored to nominal');
  };

  // 14. ALERT MANAGEMENT
  const handleMarkAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const handleMarkAllAsRead = () => {
    soundFx.playClick(settings.soundEnabled);
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const handleAcknowledge = (id: string) => {
    soundFx.playClick(settings.soundEnabled);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true, read: true } : a));
    if (activeSecurityModal?.id === id) {
      setActiveSecurityModal(null);
    }
  };

  const handleClearDemoEvents = () => {
    soundFx.playClick(settings.soundEnabled);
    setAlerts(INITIAL_ALERTS);
    logActivity('Demo Alert History Cleared', 'controls', 'manual');
  };

  // 15. RESET ALL STATE
  const handleResetDemoState = () => {
    soundFx.playClick(settings.soundEnabled);
    playButtonVoiceAlert(VOICE_ALERTS.resetState, settings.voiceAlertsEnabled, settings.speechLanguage);
    setVehicle(INITIAL_VEHICLE_STATE);
    setLocation(INITIAL_LOCATION_STATE);
    setAlerts(INITIAL_ALERTS);
    setActivities(INITIAL_ACTIVITIES);
    setDriverMetrics(NOMINAL_METRICS);
    localStorage.removeItem('sg_vehicle_state');
    localStorage.removeItem('sg_alerts');
    setActiveSecurityModal(null);
    logActivity('System State Reset to Default Prototype Baseline', 'controls', 'manual');
  };

  const unreadAlertCount = alerts.filter(a => !a.read).length;

  return (
    <div className="min-h-screen bg-[#05070D] text-slate-100 flex flex-col">
      {/* Top Bar Navigation (Strict 3-Zone Contract) */}
      <header className="sticky top-0 z-40 bg-[#060912]/90 backdrop-blur-md border-b border-cyan-500/20 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single Wordmark / Brand */}
          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group"
          >
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 neon-glow-cyan group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-base font-extrabold tracking-wider text-white">
              SMARTGUARD <span className="text-cyan-400">AI</span>
            </span>
          </div>

          {/* Zone 2: Nav Links (single-line, clean) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 ${activeTab === 'dashboard' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-0.5' : ''}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('controls')}
              className={`hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 ${activeTab === 'controls' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-0.5' : ''}`}
            >
              Controls
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 ${activeTab === 'tracking' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-0.5' : ''}`}
            >
              GPS Tracking
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 ${activeTab === 'security' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-0.5' : ''}`}
            >
              AI Security
            </button>
            <button
              onClick={() => setActiveTab('driver')}
              className={`hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 ${activeTab === 'driver' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-0.5' : ''}`}
            >
              Driver Safety
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'notifications' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-0.5' : ''}`}
            >
              Alerts
              {unreadAlertCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                  {unreadAlertCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 ${activeTab === 'settings' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-0.5' : ''}`}
            >
              Settings
            </button>
          </nav>

          {/* Zone 3: Actions (Voice Alert Toggle & Voice Assistant CTA) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Button Alert Voice Toggle */}
            <button
              onClick={() => setSettings(s => ({ ...s, voiceAlertsEnabled: !s.voiceAlertsEnabled }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                settings.voiceAlertsEnabled
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 neon-glow-cyan'
                  : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
              title="Toggle Button Alert Voice (बटन अलर्ट आवाज़)"
            >
              <Volume2 className={`w-3.5 h-3.5 ${settings.voiceAlertsEnabled ? 'text-cyan-300 animate-pulse' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Alert Voice:</span>
              <span>{settings.voiceAlertsEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Quick Language Switcher */}
            <button
              onClick={() => setSettings(s => ({ ...s, speechLanguage: s.speechLanguage === 'en-US' ? 'hi-IN' : 'en-US' }))}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-xs font-mono font-bold text-slate-300 hover:text-cyan-300 transition-colors"
              title="Switch Voice Alert Language (English / हिंदी)"
            >
              {settings.speechLanguage === 'hi-IN' ? 'हिंदी' : 'EN'}
            </button>

            {/* Voice Assistant Modal CTA */}
            <button
              onClick={() => setVoiceAssistantOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs transition-all neon-glow-cyan whitespace-nowrap shrink-0"
              title="Voice Assistant (Hindi & English)"
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Voice Assistant</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pt-3 border-t border-slate-800/80 mt-2 text-xs">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'controls', label: 'Controls' },
            { id: 'tracking', label: 'Tracking' },
            { id: 'security', label: 'Security' },
            { id: 'driver', label: 'Driver Safety' },
            { id: 'notifications', label: `Alerts (${unreadAlertCount})` },
            { id: 'settings', label: 'Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-lg whitespace-nowrap font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Spoken Alert Audio Wave Visualizer Toast */}
      {activeVoiceToast && (
        <div className="fixed top-18 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#0a1426]/95 border border-cyan-400 text-cyan-200 shadow-2xl neon-glow-cyan backdrop-blur-md transition-all animate-pulse">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
          </span>
          <div className="flex items-center gap-1">
            <span className="w-1 h-3 bg-cyan-400 animate-pulse rounded-full"></span>
            <span className="w-1 h-4 bg-cyan-300 animate-pulse rounded-full" style={{ animationDelay: '100ms' }}></span>
            <span className="w-1 h-2.5 bg-cyan-400 animate-pulse rounded-full" style={{ animationDelay: '200ms' }}></span>
          </div>
          <span className="text-xs font-mono font-bold tracking-wide">
            {activeVoiceToast.text}
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <MainDashboard
            vehicle={vehicle}
            location={location}
            activities={activities}
            unreadAlertCount={unreadAlertCount}
            onNavigateTab={setActiveTab}
            onToggleMasterSecurity={handleToggleMasterSecurity}
            onToggleDriverSafety={handleToggleDriverSafety}
            onToggleHeadlights={handleToggleHeadlights}
            onToggleDoors={handleToggleDoors}
            onToggleWindows={handleToggleWindows}
            onToggleTrunk={handleToggleTrunk}
            onToggleGps={handleToggleGps}
            onAdjustTemp={handleAdjustTemp}
          />
        )}

        {activeTab === 'controls' && (
          <VehicleControls
            vehicle={vehicle}
            onToggleMasterSecurity={handleToggleMasterSecurity}
            onToggleDriverSafety={handleToggleDriverSafety}
            onToggleHeadlights={handleToggleHeadlights}
            onToggleDoors={handleToggleDoors}
            onToggleDoorIndividual={handleToggleDoorIndividual}
            onToggleWindows={handleToggleWindows}
            onToggleTrunk={handleToggleTrunk}
            onToggleGps={handleToggleGps}
            onToggleClimate={handleToggleClimate}
            onAdjustTemp={handleAdjustTemp}
            onToggleHazardLights={handleToggleHazardLights}
            onTriggerHorn={handleTriggerHorn}
          />
        )}

        {activeTab === 'tracking' && (
          <CarTrackingMap
            location={location}
            vehicle={vehicle}
            onRefreshLocation={handleRefreshLocation}
            onFindMyCar={handleFindMyCar}
            onToggleGps={handleToggleGps}
            findingCar={findingCar}
          />
        )}

        {activeTab === 'security' && (
          <AISecurityMonitor
            vehicle={vehicle}
            onToggleMasterSecurity={handleToggleMasterSecurity}
            onSimulateIntrusion={handleSimulateIntrusion}
            onSimulateImpact={handleSimulateImpact}
            onSimulateSuspicious={handleSimulateSuspicious}
            recentAlerts={alerts}
            onAcknowledgeAlert={handleAcknowledge}
          />
        )}

        {activeTab === 'driver' && (
          <DriverSafetyMonitor
            vehicle={vehicle}
            onToggleDriverSafety={handleToggleDriverSafety}
            onSimulateDrowsiness={handleSimulateDrowsiness}
            drowsinessAlerts={alerts.filter(a => a.category === 'safety')}
            onAcknowledgeAlert={handleAcknowledge}
            metrics={driverMetrics}
            onResetMetrics={handleResetMetrics}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsHub
            alerts={alerts}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onAcknowledge={handleAcknowledge}
            onClearDemoEvents={handleClearDemoEvents}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={(newSet) => setSettings(prev => ({ ...prev, ...newSet }))}
            vehicle={vehicle}
            onUpdateVehicleMeta={(meta) => setVehicle(prev => ({ ...prev, ...meta }))}
            onResetDemoState={handleResetDemoState}
          />
        )}
      </main>

      {/* Floating Critical Alert / Warning Modal */}
      {activeSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg p-6 rounded-3xl cyber-panel border-2 border-red-500 shadow-2xl flex flex-col gap-4 animate-bounce">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-600 text-white rounded-xl">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/40">
                    CRITICAL SAFETY WARNING
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">
                    {activeSecurityModal.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveSecurityModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              {activeSecurityModal.description}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="font-mono text-[11px]">{activeSecurityModal.timestamp}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAcknowledge(activeSecurityModal.id)}
                  className="px-4 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl transition-all"
                >
                  Acknowledge &amp; Silence
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={voiceAssistantOpen}
        onClose={() => setVoiceAssistantOpen(false)}
        vehicle={vehicle}
        location={location}
        onApplyChanges={(changes, actLog) => {
          setVehicle(prev => ({ ...prev, ...changes }));
          logActivity(actLog.action, actLog.category, actLog.source, actLog.details);
        }}
        onTriggerFindMyCar={handleFindMyCar}
        soundEnabled={settings.soundEnabled}
        voiceFeedbackEnabled={settings.voiceFeedbackEnabled}
      />

      {/* Footer */}
      <footer className="border-t border-cyan-500/15 bg-[#04060b] py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>SmartGuard AI · Smart Car Security &amp; Driver Safety Prototype</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Simulation Mode Active</span>
            <span>·</span>
            <button onClick={() => setActiveTab('settings')} className="text-cyan-400 hover:underline">
              System Telematics Architecture
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
