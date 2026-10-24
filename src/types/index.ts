export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertCategory = 'security' | 'safety' | 'controls' | 'location';

export interface SecurityAlert {
  id: string;
  timestamp: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  description: string;
  read: boolean;
  acknowledged: boolean;
  actionRequired?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  category: AlertCategory;
  source: 'manual' | 'voice' | 'security_ai' | 'safety_ai' | 'system';
  details?: string;
}

export interface DoorStates {
  frontLeft: boolean; // true = locked, false = unlocked
  frontRight: boolean;
  rearLeft: boolean;
  rearRight: boolean;
}

export interface VehicleState {
  // Master ON/OFF Toggles
  masterSecurityArmed: boolean;
  driverSafetyActive: boolean;
  
  // Peripheral Controls
  headlightsOn: boolean;
  doorsLocked: boolean;
  doorDetails: DoorStates;
  windowsOpen: boolean;
  trunkOpen: boolean;
  gpsTrackingOn: boolean;
  
  // Auxiliary & Telemetry
  climateOn: boolean;
  cabinTempC: number;
  batteryPercent: number;
  estimatedRangeKm: number;
  hazardLightsOn: boolean;
  hornActive: boolean;
  speedKmh: number;
  gear: 'P' | 'D' | 'R' | 'N';
  
  // Tire Pressure in PSI
  tirePressure: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  
  // Network & Meta
  carModel: string;
  plateNumber: string;
  connectionStatus: 'connected' | 'reconnecting' | 'offline';
  networkType: '5G Ultra' | 'Satellite' | 'Offline';
  lastPingTime: string;
}

export interface LocationState {
  address: string;
  latitude: number;
  longitude: number;
  altitudeM: number;
  accuracyM: number;
  parkingBay: string;
  lastUpdated: string;
  geofenceRadiusM: number;
  isWithinGeofence: boolean;
}

export interface AppSettings {
  soundEnabled: boolean;
  voiceAlertsEnabled: boolean;
  voiceFeedbackEnabled: boolean;
  demoMode: boolean;
  speechLanguage: 'en-US' | 'hi-IN';
  drowsinessSensitivity: 'standard' | 'high' | 'maximum';
}

export interface DrowsinessMetrics {
  perclos: number; // Percentage of eyelid closure (0-100%)
  blinkRatePerMin: number; // Blinks per minute (normal 15-20)
  gazeDirection: 'Forward' | 'Distracted Left' | 'Distracted Right' | 'Downward (Eyes Closed)';
  attentionScore: number; // 0 - 100%
  yawnDetected: boolean;
  fatigueLevel: 'Normal' | 'Slight Fatigue' | 'High Drowsiness Danger';
}
