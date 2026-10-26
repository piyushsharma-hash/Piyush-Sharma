/**
 * SmartGuard AI – Smart Car Security & Driver Safety
 * Pure Vanilla JavaScript Application Controller
 */

// --- 1. APPLICATION DATA STATE ---
const INITIAL_VEHICLE_STATE = {
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

const INITIAL_LOCATION_STATE = {
  address: 'DLF Cyber City, Sector 24, Gurugram, India',
  latitude: 28.4986,
  longitude: 77.0894,
  altitudeM: 224,
  accuracyM: 2.1,
  parkingBay: 'Level B2 · Bay 07 (EV Charging)',
  lastUpdated: 'Just now',
  geofenceRadiusM: 250,
  isWithinGeofence: true
};

const INITIAL_SETTINGS = {
  soundEnabled: true,
  voiceAlertsEnabled: true,
  preferredLang: 'en-US', // 'en-US' or 'hi-IN'
  drowsinessSensitivity: 'standard',
  demoMode: true
};

const NOMINAL_METRICS = {
  perclos: 8,
  blinkRatePerMin: 18,
  gazeDirection: 'Forward',
  attentionScore: 98,
  yawnDetected: false,
  fatigueLevel: 'Normal'
};

const INITIAL_PROFILE_STATE = {
  ownerName: 'Piyush Sharma',
  carBrand: 'SmartGuard',
  carModel: 'EV-9 CyberSedan',
  plateNumber: 'SG-2026-AI',
  vinNumber: 'SG9EV-2026-X8849',
  contactNumber: '+91 98765 43210',
  registrationDate: '2026-03-15',
  isConfigured: true
};

// Global reactive state
let state = {
  vehicle: { ...INITIAL_VEHICLE_STATE },
  profile: { ...INITIAL_PROFILE_STATE },
  profileEditMode: false,
  location: { ...INITIAL_LOCATION_STATE },
  settings: { ...INITIAL_SETTINGS },
  drowsinessMetrics: { ...NOMINAL_METRICS },
  alerts: [
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
  ],
  activities: [
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
  ],
  activeTab: 'dashboard',
  notificationFilter: 'all',
  voiceModalOpen: false,
  criticalModal: null, // { title, message, severity, timestamp }
  toastMessage: null,
  toastTimer: null,
  isListening: false
};

// Load saved state from LocalStorage if available
try {
  const savedV = localStorage.getItem('sg_vehicle_state');
  if (savedV) state.vehicle = { ...INITIAL_VEHICLE_STATE, ...JSON.parse(savedV) };
  const savedS = localStorage.getItem('sg_settings');
  if (savedS) state.settings = { ...INITIAL_SETTINGS, ...JSON.parse(savedS) };
  const savedA = localStorage.getItem('sg_alerts');
  if (savedA) state.alerts = JSON.parse(savedA);
  const savedP = localStorage.getItem('sg_user_profile');
  if (savedP) {
    state.profile = { ...INITIAL_PROFILE_STATE, ...JSON.parse(savedP) };
  }
  // Synchronize vehicle plate and model with profile
  if (state.profile.plateNumber) {
    state.vehicle.plateNumber = state.profile.plateNumber;
  }
  if (state.profile.carBrand && state.profile.carModel) {
    state.vehicle.carModel = `${state.profile.carBrand} ${state.profile.carModel}`.trim();
  }
} catch (e) {
  console.warn('Storage restore error:', e);
}

function persistState() {
  try {
    localStorage.setItem('sg_vehicle_state', JSON.stringify(state.vehicle));
    localStorage.setItem('sg_settings', JSON.stringify(state.settings));
    localStorage.setItem('sg_alerts', JSON.stringify(state.alerts));
    localStorage.setItem('sg_user_profile', JSON.stringify(state.profile));
  } catch (e) {}
}

// --- 2. WEB AUDIO API SYNTHESIZER ---
class SoundSynthesizer {
  constructor() {
    this.ctx = null;
  }

  getContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playClick() {
    if (!state.settings.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {}
  }

  playLock() {
    if (!state.settings.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Pulse 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(520, now);
      osc1.frequency.exponentialRampToValueAtTime(740, now + 0.06);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.06);

      // Pulse 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(1040, now + 0.16);
      gain2.gain.setValueAtTime(0.15, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.16);
    } catch (e) {}
  }

  playUnlock() {
    if (!state.settings.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.14);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch (e) {}
  }

  playArm() {
    if (!state.settings.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  playDisarm() {
    if (!state.settings.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playHorn() {
    if (!state.settings.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(370, now);
      osc2.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.28);
      osc2.stop(now + 0.28);
    } catch (e) {}
  }

  playAlarm() {
    if (!state.settings.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        const startT = now + i * 0.15;
        osc.frequency.setValueAtTime(900, startT);
        osc.frequency.linearRampToValueAtTime(1400, startT + 0.07);
        gain.gain.setValueAtTime(0.16, startT);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startT);
        osc.stop(startT + 0.12);
      }
    } catch (e) {}
  }

  playDrowsinessAlert() {
    if (!state.settings.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [800, 1000, 1200, 1000, 1200].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        const t = now + idx * 0.1;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
      });
    } catch (e) {}
  }
}

const soundFx = new SoundSynthesizer();

// --- 3. SPOKEN VOICE ALERTS ENGINE ---
const VOICE_ALERT_MESSAGES = {
  securityArmed: {
    en: 'Alert: Master car security armed. Sentry perimeter active.',
    hi: 'चेतावनी: मास्टर कार सुरक्षा सक्रिय। सेंट्री सर्विलांस चालू है।'
  },
  securityDisarmed: {
    en: 'Alert: Master car security disarmed. Perimeter standby.',
    hi: 'चेतावनी: मास्टर कार सुरक्षा निष्क्रिय कर दी गई है।'
  },
  driverSafetyOn: {
    en: 'Alert: Driver safety monitoring activated. Eye tracking online.',
    hi: 'चेतावनी: ड्राइवर सुरक्षा निगरानी सक्रिय। आई-ट्रैकिंग चालू है।'
  },
  driverSafetyOff: {
    en: 'Alert: Driver safety monitoring disabled.',
    hi: 'चेतावनी: ड्राइवर सुरक्षा निगरानी बंद कर दी गई है।'
  },
  doorsLocked: {
    en: 'Alert: All vehicle doors securely locked.',
    hi: 'चेतावनी: गाड़ी के सभी दरवाज़े सुरक्षित लॉक कर दिए गए हैं।'
  },
  doorsUnlocked: {
    en: 'Alert: Vehicle doors unlocked. Access granted.',
    hi: 'चेतावनी: गाड़ी के दरवाज़े अनलॉक कर दिए गए हैं।'
  },
  headlightsOn: {
    en: 'Alert: Matrix LED headlights activated.',
    hi: 'चेतावनी: मैट्रिक्स एलईडी हेडलाइट्स चालू कर दी गई हैं।'
  },
  headlightsOff: {
    en: 'Alert: Matrix LED headlights turned off.',
    hi: 'चेतावनी: हेडलाइट्स बंद कर दी गई हैं।'
  },
  windowsOpen: {
    en: 'Alert: Power windows opened for cabin ventilation.',
    hi: 'चेतावनी: खिड़कियाँ वेंटिलेशन मोड में खोल दी गई हैं।'
  },
  windowsClosed: {
    en: 'Alert: Power windows closed and sealed.',
    hi: 'चेतावनी: खिड़कियाँ बंद और सील कर दी गई हैं।'
  },
  trunkOpen: {
    en: 'Alert: Powered trunk hatch opened.',
    hi: 'चेतावनी: गाड़ी की डिक्की खोल दी गई है।'
  },
  trunkClosed: {
    en: 'Alert: Powered trunk closed and latched.',
    hi: 'चेतावनी: डिक्की बंद और लॉक कर दी गई है।'
  },
  gpsOn: {
    en: 'Alert: Satellite GPS telemetry broadcast active.',
    hi: 'चेतावनी: जीपीएस ट्रैकिंग सक्रिय है।'
  },
  gpsOff: {
    en: 'Alert: GPS telemetry tracking paused.',
    hi: 'चेतावनी: जीपीएस ट्रैकिंग रोक दी गई है।'
  },
  findMyCar: {
    en: 'Alert: Vehicle locator beacon flashing and horn chiming.',
    hi: 'चेतावनी: गाड़ी लोकेटर बीकन और हॉर्न सक्रिय।'
  },
  intrusion: {
    en: 'Emergency Warning: Perimeter intrusion detected! Siren armed.',
    hi: 'आपातकालीन चेतावनी: कार में अनधिकृत घुसपैठ का प्रयास!',
    isEmergency: true
  },
  impact: {
    en: 'Emergency Warning: High shock impact detected on vehicle body.',
    hi: 'आपातकालीन चेतावनी: कार पर भारी प्रभाव या झटका महसूस हुआ।',
    isEmergency: true
  },
  suspicious: {
    en: 'Warning: Loitering person detected in sentry perimeter blindspot.',
    hi: 'चेतावनी: कार के पास संदिग्ध गतिविधि देखी गई।',
    isEmergency: true
  },
  drowsiness: {
    en: 'Critical Warning: Driver drowsiness detected. Please stop safely and take a break.',
    hi: 'अति-महत्वपूर्ण चेतावनी: ड्राइवर को नींद आने का संकेत। कृपया गाड़ी रोकें और विश्राम लें।',
    isEmergency: true
  },
  profileSaved: {
    en: 'Alert: Vehicle owner profile saved and registration number updated.',
    hi: 'चेतावनी: वाहन प्रोफ़ाइल सुरक्षित की गई और नंबर प्लेट अपडेट की गई।'
  }
};

function playButtonVoiceAlert(messageKey, isCustom = null) {
  if (!state.settings.voiceAlertsEnabled) return;
  const msg = isCustom || VOICE_ALERT_MESSAGES[messageKey];
  if (!msg) return;

  const lang = state.settings.preferredLang || 'en-US';
  const textToSpeak = lang === 'hi-IN' ? msg.hi : msg.en;

  showVoiceToast(textToSpeak, msg.isEmergency);

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang;
    utterance.rate = msg.isEmergency ? 1.0 : 1.05;
    utterance.pitch = msg.isEmergency ? 1.15 : 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const prefix = lang.slice(0, 2);
      const matched = voices.find(v => v.lang.startsWith(prefix) && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Female')));
      if (matched) utterance.voice = matched;
    }
    window.speechSynthesis.speak(utterance);
  } catch (e) {}
}

function showVoiceToast(text, isEmergency = false) {
  state.toastMessage = { text, isEmergency };
  renderToast();
  if (state.toastTimer) clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => {
    state.toastMessage = null;
    renderToast();
  }, 4500);
}

// --- 4. BILINGUAL VOICE ASSISTANT NLU ENGINE ---
function normalizeInput(input) {
  let text = input.toLowerCase().trim();
  text = text.replace(/[?!.,;:_#@*&^%$]/g, ' ');
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\b(dikky|diki|dickie|dicki|diggy|diggi|dikee)\b/g, 'dicky');
  text = text.replace(/\b(khidkee|khidkiya|khidkiyan|khidkiyo)\b/g, 'khidki');
  text = text.replace(/\b(gadi|gaadi|gaddi|gadii)\b/g, 'gaadi');
  text = text.replace(/\b(darwaza|darwaze|darwaje|darwaja|darwazo)\b/g, 'darwaza');
  text = text.replace(/\b(headlight|headlights|lighte|lighten|lights|batti|battiya|roshni)\b/g, 'light');
  text = text.replace(/\b(sheesha|shisha|sheeshe)\b/g, 'glass');
  text = text.replace(/\b(chalu|jalao|start|jalado|chalao)\b/g, 'on');
  text = text.replace(/\b(bujhao|band|bujha|rok|bandkaro|bandkar)\b/g, 'off');
  text = text.replace(/\b(khol|kholo|kholna|kholdo)\b/g, 'open');
  text = text.replace(/\b(kidhar|kaha|kahan|kahapar|kaha hai)\b/g, 'kahan');
  return text.trim();
}

function hasAny(text, words) {
  return words.some(w => text.includes(w));
}

function parseVoiceCommand(rawInput) {
  if (!rawInput || !rawInput.trim()) {
    return {
      understood: false,
      actionTaken: 'No Input Provided',
      responseTextEn: 'Please speak or type a vehicle command.',
      responseTextHi: 'कृपया कोई कार कमांड बोलें या टाइप करें।',
      category: 'controls',
      rawCommand: '',
      intent: 'EMPTY',
      confidence: 0,
      needsClarification: true,
      clarificationSuggestions: ['light on karo', 'car lock karo', 'window kholo', 'dicky kholo', 'security on karo']
    };
  }

  const rawLower = rawInput.toLowerCase().trim();
  const norm = normalizeInput(rawInput);

  // 1. HEADLIGHTS
  const isLightEntity = hasAny(norm, ['light', 'beam', 'lamp', 'रोशनी', 'बत्ती', 'हेडलाइट']);
  const isOffAction = hasAny(norm, ['off', 'close', 'shut', 'deactivate', 'disarm', 'disable', 'bujha', 'band', 'ऑफ', 'बंद', 'बुझाओ']);
  const isOnAction = hasAny(norm, ['on', 'open', 'activate', 'arm', 'enable', 'start', 'chalu', 'jalao', 'शुरू', 'चालू', 'ऑन', 'जलाओ', 'खोलो']);

  if (
    hasAny(rawLower, [
      'light off karo', 'lights off karo', 'headlight off karo', 'headlights off karo',
      'light off', 'lights off', 'headlight off', 'headlights off',
      'turn off headlight', 'turn off headlights', 'turn off light', 'turn off lights', 'turn off the lights',
      'light band karo', 'headlight band karo', 'batti bujhao', 'batti band karo',
      'headlights band karo', 'लाइट बंद करो', 'हेडलाइट बंद करो', 'बत्ती बुझाओ'
    ]) || (isLightEntity && isOffAction)
  ) {
    return {
      understood: true,
      actionTaken: 'Headlights Turned OFF',
      responseTextEn: 'Matrix LED headlights turned off.',
      responseTextHi: 'मैट्रिक्स एलईडी हेडलाइट्स बंद कर दी गई हैं।',
      appliedChanges: { headlightsOn: false },
      category: 'controls',
      rawCommand: rawInput,
      intent: 'HEADLIGHTS_OFF',
      confidence: 0.98
    };
  }

  if (
    hasAny(rawLower, [
      'light on karo', 'lights on karo', 'headlight on karo', 'headlights on karo',
      'light on', 'lights on', 'headlight on', 'headlights on',
      'turn on headlight', 'turn on headlights', 'turn on light', 'turn on lights', 'turn on the lights',
      'light jalao', 'headlight jalao', 'headlights jalao', 'batti jalao', 'light chalu karo',
      'high beam on', 'headlights on please', 'can you turn on headlights',
      'लाइट ऑन करो', 'लाइट जलाओ', 'हेडलाइट ऑन करो', 'बत्ती जलाओ'
    ]) || (isLightEntity && isOnAction)
  ) {
    return {
      understood: true,
      actionTaken: 'Headlights Turned ON',
      responseTextEn: 'Matrix LED headlights visibly illuminated with forward laser projection.',
      responseTextHi: 'मैट्रिक्स एलईडी हेडलाइट्स चालू कर दी गई हैं।',
      appliedChanges: { headlightsOn: true },
      category: 'controls',
      rawCommand: rawInput,
      intent: 'HEADLIGHTS_ON',
      confidence: 0.98
    };
  }

  // 2. WINDOWS
  const isWindowEntity = hasAny(norm, ['window', 'khidki', 'glass', 'ventilation', 'sheesha', 'खिड़की', 'विंडो', 'शीशा']);
  if (
    hasAny(rawLower, [
      'window kholo', 'windows kholo', 'khidki kholo', 'khidkiyan kholo', 'open window', 'open windows',
      'window open karo', 'windows open karo', 'roll down windows', 'lower windows',
      'sheesha niche karo', 'glass down karo', 'vent windows', 'विंडो खोलो', 'खिड़की खोलो'
    ]) || (isWindowEntity && (isOnAction || hasAny(norm, ['open', 'niche', 'down', 'vent'])))
  ) {
    return {
      understood: true,
      actionTaken: 'Opened Power Windows',
      responseTextEn: 'Power windows lowered into cabin ventilation mode.',
      responseTextHi: 'सभी खिड़कियाँ वेंटिलेशन मोड में खोल दी गई हैं।',
      appliedChanges: { windowsOpen: true },
      category: 'controls',
      rawCommand: rawInput,
      intent: 'WINDOWS_OPEN',
      confidence: 0.98
    };
  }

  if (
    hasAny(rawLower, [
      'window band karo', 'windows band karo', 'khidki band karo', 'khidkiyan band karo', 'close window', 'close windows',
      'window close karo', 'windows close karo', 'roll up windows', 'seal windows',
      'sheesha upar karo', 'glass up karo', 'विंडो बंद करो', 'खिड़की बंद करो'
    ]) || (isWindowEntity && (isOffAction || hasAny(norm, ['close', 'upar', 'up', 'seal'])))
  ) {
    return {
      understood: true,
      actionTaken: 'Closed Power Windows',
      responseTextEn: 'Power windows fully raised and sealed.',
      responseTextHi: 'सभी खिड़कियाँ पूरी तरह बंद और सील कर दी गई हैं।',
      appliedChanges: { windowsOpen: false },
      category: 'controls',
      rawCommand: rawInput,
      intent: 'WINDOWS_CLOSE',
      confidence: 0.98
    };
  }

  // 3. TRUNK / DICKEY
  const isTrunkEntity = hasAny(norm, ['trunk', 'dicky', 'boot', 'hatch', 'डिक्की', 'डिग्गी', 'ट्रंक', 'बूट']);
  if (
    hasAny(rawLower, [
      'dicky kholo', 'dickie kholo', 'diki kholo', 'diggi kholo', 'diggy kholo', 'trunk kholo', 'boot kholo',
      'open trunk', 'open dicky', 'open dickie', 'open boot', 'dicky open karo', 'trunk open karo',
      'pichhe ka gate kholo', 'lift trunk hatch', 'डिक्की खोलो', 'ट्रंक खोलो', 'डिग्गी खोलो'
    ]) || (isTrunkEntity && (isOnAction || hasAny(norm, ['open', 'lift'])))
  ) {
    return {
      understood: true,
      actionTaken: 'Opened Powered Trunk (Dicky)',
      responseTextEn: 'Powered trunk hatch opened with cargo illumination.',
      responseTextHi: 'गाड़ी की डिक्की (ट्रंक) खोल दी गई है।',
      appliedChanges: { trunkOpen: true },
      category: 'controls',
      rawCommand: rawInput,
      intent: 'TRUNK_OPEN',
      confidence: 0.98
    };
  }

  if (
    hasAny(rawLower, [
      'dicky band karo', 'dickie band karo', 'diki band karo', 'diggi band karo', 'trunk band karo', 'boot band karo',
      'close trunk', 'close dicky', 'close boot', 'dicky close karo', 'trunk close karo',
      'pichhe ka gate band karo', 'latch trunk hatch', 'डिक्की बंद करो', 'ट्रंक बंद करो', 'डिग्गी बंद करो'
    ]) || (isTrunkEntity && (isOffAction || hasAny(norm, ['close', 'latch'])))
  ) {
    return {
      understood: true,
      actionTaken: 'Closed Powered Trunk (Dicky)',
      responseTextEn: 'Powered trunk hatch closed and latched.',
      responseTextHi: 'डिक्की बंद और सुरक्षित लॉक कर दी गई है।',
      appliedChanges: { trunkOpen: false },
      category: 'controls',
      rawCommand: rawInput,
      intent: 'TRUNK_CLOSE',
      confidence: 0.98
    };
  }

  // 4. SECURITY SENTRY
  const isSecurityEntity = hasAny(norm, ['security', 'sentry', 'suraksha', 'anti-theft', 'alarm', 'guard', 'protection', 'सुरक्षा', 'सिक्योरिटी']);
  if (
    hasAny(rawLower, [
      'security off karo', 'security band karo', 'security deactivate karo', 'security disarm karo',
      'turn off security', 'disarm security', 'deactivate security', 'security off',
      'suraksha band karo', 'sentry off karo', 'sentry mode off', 'सिक्योरिटी ऑफ करो', 'सुरक्षा बंद करो'
    ]) || (isSecurityEntity && isOffAction)
  ) {
    return {
      understood: true,
      actionTaken: 'Disarmed Master Car Security',
      responseTextEn: 'Master car security disarmed. 360° sentry shield stand down.',
      responseTextHi: 'कार सुरक्षा निष्क्रिय कर दी गई है। सेंट्री स्टैंडबाय पर है।',
      appliedChanges: { masterSecurityArmed: false },
      category: 'security',
      rawCommand: rawInput,
      intent: 'SECURITY_DISARM',
      confidence: 0.98
    };
  }

  if (
    hasAny(rawLower, [
      'security on karo', 'security chalu karo', 'security activate karo', 'security arm karo',
      'activate security', 'arm security', 'turn on security', 'security on',
      'suraksha chalu karo', 'sentry on karo', 'sentry mode on', 'enable car security',
      'सिक्योरिटी ऑन करो', 'सुरक्षा चालू करो'
    ]) || (isSecurityEntity && isOnAction)
  ) {
    return {
      understood: true,
      actionTaken: 'Armed Master Car Security',
      responseTextEn: 'Master car security armed. Holographic 360° sentry perimeter active and doors secured.',
      responseTextHi: 'मास्टर कार सुरक्षा सक्रिय कर दी गई है। 360° सेंट्री शील्ड और दरवाज़े सुरक्षित हैं।',
      appliedChanges: { masterSecurityArmed: true, doorsLocked: true },
      category: 'security',
      rawCommand: rawInput,
      intent: 'SECURITY_ARM',
      confidence: 0.98
    };
  }

  // 5. DRIVER SAFETY
  const isSafetyEntity = hasAny(norm, ['safety', 'drowsiness', 'driver', 'fatigue', 'sleep', 'neend', 'dms', 'नींद', 'ड्राइवर', 'सेफ्टी']);
  if (
    hasAny(rawLower, [
      'driver safety off karo', 'driver safety band karo', 'disable driver safety', 'turn off driver safety',
      'drowsiness off karo', 'safety off karo', 'safety band karo', 'ड्राइवर सेफ्टी बंद करो'
    ]) || (isSafetyEntity && isOffAction)
  ) {
    return {
      understood: true,
      actionTaken: 'Disabled Driver Safety Monitoring',
      responseTextEn: 'Driver safety eye-tracking and drowsiness monitoring disabled.',
      responseTextHi: 'ड्राइवर सुरक्षा और आई-ट्रैकिंग प्रणाली बंद कर दी गई है।',
      appliedChanges: { driverSafetyActive: false },
      category: 'safety',
      rawCommand: rawInput,
      intent: 'DRIVER_SAFETY_OFF',
      confidence: 0.97
    };
  }

  if (
    hasAny(rawLower, [
      'driver safety on karo', 'driver safety chalu karo', 'enable driver safety', 'turn on driver safety',
      'drowsiness on karo', 'safety on karo', 'safety chalu karo', 'activate driver monitoring',
      'ड्राइवर सेफ्टी ऑन करो', 'ड्राइवर सुरक्षा चालू करो'
    ]) || (isSafetyEntity && isOnAction)
  ) {
    return {
      understood: true,
      actionTaken: 'Enabled Driver Safety Monitoring',
      responseTextEn: 'Driver Safety AI initialized. Infrared steering-column gaze and PERCLOS tracking active.',
      responseTextHi: 'ड्राइवर सुरक्षा प्रणाली सक्रिय कर दी गई है। इन्फ्रारेड आई-ट्रैकिंग चालू है।',
      appliedChanges: { driverSafetyActive: true },
      category: 'safety',
      rawCommand: rawInput,
      intent: 'DRIVER_SAFETY_ON',
      confidence: 0.97
    };
  }

  // 6. DOORS LOCK / UNLOCK
  const isDoorOrCarEntity = hasAny(norm, ['door', 'doors', 'car', 'gaadi', 'darwaza', 'gate', 'lock', 'unlock', 'vehicle', 'ताला', 'दरवाजा', 'कार', 'गाड़ी']);
  if (
    hasAny(rawLower, [
      'car unlock karo', 'gaadi unlock karo', 'unlock my car', 'unlock car', 'unlock the car', 'unlock doors',
      'gaadi kholo', 'car kholo', 'darwaza kholo', 'darwaze kholo', 'gate kholo', 'unlock', 'open car',
      'गाड़ी अनलॉक करो', 'कार अनलॉक करो', 'गाड़ी खोलो', 'दरवाज़ा खोलो'
    ]) || (hasAny(norm, ['unlock', 'access']) && isDoorOrCarEntity) ||
    (hasAny(norm, ['open', 'kholo']) && hasAny(norm, ['car', 'gaadi', 'darwaza', 'gate', 'door']))
  ) {
    return {
      understood: true,
      actionTaken: 'Unlocked All Vehicle Doors',
      responseTextEn: 'All vehicle doors unlocked. Solenoids disengaged and access granted.',
      responseTextHi: 'गाड़ी अनलॉक कर दी गई है। सभी दरवाज़े खुल गए हैं।',
      appliedChanges: {
        doorsLocked: false,
        doorDetails: { frontLeft: false, frontRight: false, rearLeft: false, rearRight: false }
      },
      category: 'controls',
      rawCommand: rawInput,
      intent: 'DOORS_UNLOCK',
      confidence: 0.98
    };
  }

  if (
    hasAny(rawLower, [
      'car lock karo', 'gaadi lock karo', 'lock my car', 'lock car', 'lock the car', 'lock doors', 'lock all doors',
      'darwaza lock karo', 'darwaze lock karo', 'darwaza band karo', 'gate lock karo', 'lock', 'lock car please',
      'गाड़ी लॉक करो', 'कार लॉक करो', 'दरवाज़ा बंद करो', 'ताला लगाओ'
    ]) || (hasAny(norm, ['lock', 'taala']) && isDoorOrCarEntity) ||
    (hasAny(norm, ['close', 'band']) && hasAny(norm, ['car', 'gaadi', 'darwaza', 'gate', 'door']))
  ) {
    return {
      understood: true,
      actionTaken: 'Locked All Vehicle Doors',
      responseTextEn: 'All vehicle doors are now securely locked with central solenoids engaged.',
      responseTextHi: 'गाड़ी के सभी दरवाज़े सुरक्षित रूप से लॉक कर दिए गए हैं।',
      appliedChanges: {
        doorsLocked: true,
        doorDetails: { frontLeft: true, frontRight: true, rearLeft: true, rearRight: true }
      },
      category: 'controls',
      rawCommand: rawInput,
      intent: 'DOORS_LOCK',
      confidence: 0.98
    };
  }

  // 7. WHERE IS MY CAR
  if (
    hasAny(rawLower, [
      'where is my car', 'where is car', 'where is the car', 'find my car', 'locate my car', 'locate car',
      'gaadi kahan hai', 'car kahan hai', 'meri car kahan hai', 'meri gaadi kahan hai', 'gaadi dhundo', 'car dhundo',
      'where parked', 'car location', 'gaadi kahan par hai', 'गाड़ी कहाँ है', 'मेरी कार कहाँ है', 'गाड़ी ढूंढो'
    ]) || hasAny(norm, ['kahan', 'where', 'locate', 'find', 'dhundo'])
  ) {
    return {
      understood: true,
      actionTaken: 'Located Vehicle via GPS Beacon',
      responseTextEn: `Your ${state.vehicle.carModel} is stationed at ${state.location.address}, ${state.location.parkingBay}. Flashing locator beacon and sounding horn chime.`,
      responseTextHi: `आपकी गाड़ी ${state.location.address} में पार्क है। लोकेटर बीकन और हॉर्न सक्रिय कर दिया गया है।`,
      triggerFindMyCar: true,
      category: 'location',
      rawCommand: rawInput,
      intent: 'FIND_MY_CAR',
      confidence: 0.98
    };
  }

  // 8. CLIMATE / AC
  const isClimateEntity = hasAny(norm, ['ac', 'climate', 'temperature', 'heater', 'hvac', 'thand', 'garmi', 'एसी', 'क्लाइमेट']);
  if (isClimateEntity) {
    if (isOffAction) {
      return {
        understood: true,
        actionTaken: 'Turned OFF Cabin Climate (AC)',
        responseTextEn: 'Cabin climate control turned off.',
        responseTextHi: 'केबिन एसी और क्लाइमेट कंट्रोल बंद कर दिया गया है।',
        appliedChanges: { climateOn: false },
        category: 'controls',
        rawCommand: rawInput,
        intent: 'CLIMATE_OFF',
        confidence: 0.95
      };
    }
    return {
      understood: true,
      actionTaken: 'Turned ON Cabin Climate (AC)',
      responseTextEn: `Cabin climate started. Target setpoint ${state.vehicle.cabinTempC.toFixed(1)}°C.`,
      responseTextHi: 'केबिन एसी चालू कर दिया गया है।',
      appliedChanges: { climateOn: true },
      category: 'controls',
      rawCommand: rawInput,
      intent: 'CLIMATE_ON',
      confidence: 0.95
    };
  }

  // 9. HORN
  if (hasAny(norm, ['horn', 'honk', 'beep', 'हॉर्न', 'हॉन'])) {
    return {
      understood: true,
      actionTaken: 'Sounded Locator Horn',
      responseTextEn: 'Acoustic vehicle locator horn sounded.',
      responseTextHi: 'गाड़ी का हॉर्न बजाया गया।',
      appliedChanges: { hornActive: true },
      category: 'controls',
      rawCommand: rawInput,
      intent: 'HORN_SOUND',
      confidence: 0.96
    };
  }

  // 10. HAZARDS
  if (hasAny(norm, ['hazard', 'flasher', 'emergency light', 'हैजर्ड'])) {
    if (isOffAction) {
      return {
        understood: true,
        actionTaken: 'Turned OFF Hazard Flashers',
        responseTextEn: 'Emergency hazard flashers turned off.',
        responseTextHi: 'इमरजेंसी हैज़र्ड लाइट्स बंद कर दी गई हैं।',
        appliedChanges: { hazardLightsOn: false },
        category: 'controls',
        rawCommand: rawInput,
        intent: 'HAZARDS_OFF',
        confidence: 0.95
      };
    }
    return {
      understood: true,
      actionTaken: 'Turned ON Hazard Flashers',
      responseTextEn: 'Emergency hazard warning flashers blinking.',
      responseTextHi: 'इमरजेंसी हैज़र्ड लाइट्स चालू कर दी गई हैं।',
      appliedChanges: { hazardLightsOn: true },
      category: 'controls',
      rawCommand: rawInput,
      intent: 'HAZARDS_ON',
      confidence: 0.95
    };
  }

  // 11. TELEMETRY STATUS
  if (hasAny(norm, ['status', 'battery', 'range', 'percentage', 'charge', 'haal', 'stat', 'स्थिति', 'बैटरी', 'रेंज'])) {
    return {
      understood: true,
      actionTaken: 'Reported Vehicle Telemetry Status',
      responseTextEn: `Battery is at ${state.vehicle.batteryPercent}%, estimated range is ${state.vehicle.estimatedRangeKm} km. Security is ${state.vehicle.masterSecurityArmed ? 'Armed' : 'Disarmed'}.`,
      responseTextHi: `बैटरी ${state.vehicle.batteryPercent}% है, रेंज ${state.vehicle.estimatedRangeKm} किमी है। सुरक्षा ${state.vehicle.masterSecurityArmed ? 'सक्रिय' : 'निष्क्रिय'} है।`,
      category: 'controls',
      rawCommand: rawInput,
      intent: 'STATUS_QUERY',
      confidence: 0.95
    };
  }

  // 12. OWNER PROFILE & REGISTRATION QUERY
  if (hasAny(norm, ['owner', 'profile', 'malik', 'registration', 'plate number', 'gadi number', 'registration number', 'मालिक', 'प्रोफ़ाइल', 'नंबर'])) {
    return {
      understood: true,
      actionTaken: 'Reported Vehicle Ownership Profile',
      responseTextEn: `Vehicle ${state.vehicle.carModel} with registration plate ${state.vehicle.plateNumber} is registered to ${state.profile.ownerName}.`,
      responseTextHi: `गाड़ी ${state.vehicle.carModel} (नंबर: ${state.vehicle.plateNumber}) श्री/सुश्री ${state.profile.ownerName} के नाम पर पंजीकृत है।`,
      category: 'controls',
      rawCommand: rawInput,
      intent: 'PROFILE_QUERY',
      confidence: 0.96
    };
  }

  // 12. CLARIFICATIONS
  if (rawLower === 'kholo' || rawLower === 'open' || rawLower === 'open karo' || rawLower === 'khol do') {
    return {
      understood: false,
      needsClarification: true,
      actionTaken: 'Clarification Needed: Component Unspecified',
      responseTextEn: 'What would you like to open? You can open the windows, open the trunk (dicky), or unlock the car doors.',
      responseTextHi: 'आप क्या खोलना चाहते हैं? आप खिड़की खोल सकते हैं, डिक्की खोल सकते हैं, या कार अनलॉक कर सकते हैं।',
      category: 'controls',
      rawCommand: rawInput,
      intent: 'AMBIGUOUS_OPEN',
      confidence: 0.5,
      clarificationSuggestions: ['window kholo', 'dicky kholo', 'car unlock karo']
    };
  }

  if (rawLower === 'band karo' || rawLower === 'close' || rawLower === 'close karo' || rawLower === 'band kar do') {
    return {
      understood: false,
      needsClarification: true,
      actionTaken: 'Clarification Needed: Component Unspecified',
      responseTextEn: 'What would you like to close? You can close the windows, close the trunk (dicky), turn off headlights, or lock the car doors.',
      responseTextHi: 'आप क्या बंद करना चाहते हैं? आप खिड़की बंद कर सकते हैं, डिक्की बंद कर सकते हैं, हेडलाइट्स बंद कर सकते हैं, या कार लॉक कर सकते हैं।',
      category: 'controls',
      rawCommand: rawInput,
      intent: 'AMBIGUOUS_CLOSE',
      confidence: 0.5,
      clarificationSuggestions: ['window band karo', 'dicky band karo', 'light off karo', 'car lock karo']
    };
  }

  // 13. UNKNOWN / FALLBACK
  return {
    understood: false,
    needsClarification: true,
    actionTaken: 'Unrecognized Command',
    responseTextEn: `I couldn't identify the intent in "${rawInput}". SmartGuard AI controls headlights, door locks, windows, trunk (dicky), 360° security, and driver safety. Try one of the suggested commands below.`,
    responseTextHi: `माफ़ करें, मैं "${rawInput}" का मतलब नहीं समझ पाया। SmartGuard AI केवल हेडलाइट्स, दरवाज़े, खिड़कियाँ, डिक्की, और सुरक्षा को नियंत्रित करता है। नीचे दिए गए सुझावों में से चुनें।`,
    category: 'controls',
    rawCommand: rawInput,
    intent: 'UNKNOWN',
    confidence: 0.1,
    clarificationSuggestions: ['light on karo', 'car lock karo', 'window kholo', 'dicky kholo', 'security on karo', 'gaadi kahan hai']
  };
}

// Execute voice command and update all states
function executeVoiceCommand(rawText) {
  const result = parseVoiceCommand(rawText);
  
  if (result.understood && result.appliedChanges) {
    // Apply changes
    Object.assign(state.vehicle, result.appliedChanges);
    persistState();
    
    // Play appropriate sound feedback
    if (result.appliedChanges.doorsLocked !== undefined) {
      if (result.appliedChanges.doorsLocked) soundFx.playLock();
      else soundFx.playUnlock();
    } else if (result.appliedChanges.masterSecurityArmed !== undefined) {
      if (result.appliedChanges.masterSecurityArmed) soundFx.playArm();
      else soundFx.playDisarm();
    } else if (result.appliedChanges.hornActive) {
      soundFx.playHorn();
      setTimeout(() => {
        state.vehicle.hornActive = false;
        renderAll();
      }, 1500);
    } else {
      soundFx.playClick();
    }

    // Add activity log
    addActivityLog(result.actionTaken, result.category, 'voice', `Command: "${result.rawCommand}" [Intent: ${result.intent}]`);
  }

  if (result.triggerFindMyCar) {
    triggerFindMyCarAnimation();
  }

  // Speak aloud in user preference
  const lang = state.settings.preferredLang || 'en-US';
  const spoken = lang === 'hi-IN' ? result.responseTextHi : result.responseTextEn;
  playButtonVoiceAlert(null, { en: result.responseTextEn, hi: result.responseTextHi });

  // Update Voice Modal output
  renderVoiceResult(result);
  renderAll();
  return result;
}

// --- 5. LOGS & ALERTS HANDLERS ---
function addActivityLog(action, category, source, details) {
  const newLog = {
    id: 'act-' + Date.now(),
    timestamp: 'Just now',
    action,
    category,
    source,
    details
  };
  state.activities.unshift(newLog);
  if (state.activities.length > 30) state.activities.pop();
  renderActivities();
}

function addSecurityAlert(severity, title, description, category = 'security') {
  const newAlert = {
    id: 'alt-' + Date.now(),
    timestamp: 'Just now',
    category,
    severity,
    title,
    description,
    read: false,
    acknowledged: false
  };
  state.alerts.unshift(newAlert);
  persistState();
  updateAlertBadge();
  renderNotifications();
}

function updateAlertBadge() {
  const unreadCount = state.alerts.filter(a => !a.read).length;
  const badges = document.querySelectorAll('.unread-badge');
  badges.forEach(b => {
    if (unreadCount > 0) {
      b.textContent = unreadCount;
      b.classList.remove('hidden');
    } else {
      b.classList.add('hidden');
    }
  });
}

// --- 6. VEHICLE ACTION HANDLERS ---
function toggleMasterSecurity() {
  const next = !state.vehicle.masterSecurityArmed;
  state.vehicle.masterSecurityArmed = next;
  if (next) {
    state.vehicle.doorsLocked = true;
    soundFx.playArm();
    playButtonVoiceAlert('securityArmed');
    addActivityLog('Master Security Armed', 'security', 'manual', '360° perimeter sentry online; central locks secured');
    addSecurityAlert('info', 'Master Sentry Shield Armed', 'Perimeter guard active with 360-degree acoustic and radar surveillance.');
  } else {
    soundFx.playDisarm();
    playButtonVoiceAlert('securityDisarmed');
    addActivityLog('Master Security Disarmed', 'security', 'manual', 'Perimeter sentry standing down');
    addSecurityAlert('warning', 'Security Standby', 'Vehicle master sentry shield disarmed by operator.');
  }
  persistState();
  renderAll();
}

function toggleDriverSafety() {
  const next = !state.vehicle.driverSafetyActive;
  state.vehicle.driverSafetyActive = next;
  if (next) {
    soundFx.playClick();
    playButtonVoiceAlert('driverSafetyOn');
    addActivityLog('Driver Safety Activated', 'safety', 'manual', 'Infrared eye tracking & PERCLOS baseline active');
  } else {
    soundFx.playClick();
    playButtonVoiceAlert('driverSafetyOff');
    addActivityLog('Driver Safety Disabled', 'safety', 'manual', 'Operator paused drowsiness monitoring');
  }
  persistState();
  renderAll();
}

function toggleHeadlights() {
  const next = !state.vehicle.headlightsOn;
  state.vehicle.headlightsOn = next;
  soundFx.playClick();
  playButtonVoiceAlert(next ? 'headlightsOn' : 'headlightsOff');
  addActivityLog(next ? 'Headlights ON' : 'Headlights OFF', 'controls', 'manual', next ? 'Matrix LED projection glowing forward' : 'Headlights shut down');
  persistState();
  renderAll();
}

function toggleDoors() {
  const next = !state.vehicle.doorsLocked;
  state.vehicle.doorsLocked = next;
  state.vehicle.doorDetails = {
    frontLeft: next,
    frontRight: next,
    rearLeft: next,
    rearRight: next
  };
  if (next) {
    soundFx.playLock();
    playButtonVoiceAlert('doorsLocked');
    addActivityLog('Central Doors Locked', 'controls', 'manual', 'All 4 motorized latches locked');
  } else {
    soundFx.playUnlock();
    playButtonVoiceAlert('doorsUnlocked');
    addActivityLog('Central Doors Unlocked', 'controls', 'manual', 'All motorized latches released');
  }
  persistState();
  renderAll();
}

function toggleWindows() {
  const next = !state.vehicle.windowsOpen;
  state.vehicle.windowsOpen = next;
  soundFx.playClick();
  playButtonVoiceAlert(next ? 'windowsOpen' : 'windowsClosed');
  addActivityLog(next ? 'Windows Lowered' : 'Windows Sealed', 'controls', 'manual', next ? 'Ventilation mode activated' : 'All power glass raised');
  persistState();
  renderAll();
}

function toggleTrunk() {
  const next = !state.vehicle.trunkOpen;
  state.vehicle.trunkOpen = next;
  soundFx.playClick();
  playButtonVoiceAlert(next ? 'trunkOpen' : 'trunkClosed');
  addActivityLog(next ? 'Trunk Opened' : 'Trunk Closed', 'controls', 'manual', next ? 'Rear cargo compartment hatch lifted' : 'Powered hatch latched');
  persistState();
  renderAll();
}

function toggleGps() {
  const next = !state.vehicle.gpsTrackingOn;
  state.vehicle.gpsTrackingOn = next;
  soundFx.playClick();
  playButtonVoiceAlert(next ? 'gpsOn' : 'gpsOff');
  addActivityLog(next ? 'GPS Tracking ON' : 'GPS Tracking Paused', 'location', 'manual', next ? 'GNSS multi-constellation satellite fix active' : 'Location beacon halted');
  persistState();
  renderAll();
}

function adjustCabinTemp(delta) {
  soundFx.playClick();
  state.vehicle.cabinTempC = Math.min(28, Math.max(16, +(state.vehicle.cabinTempC + delta).toFixed(1)));
  persistState();
  renderAll();
}

function triggerFindMyCarAnimation() {
  soundFx.playHorn();
  state.vehicle.hazardLightsOn = true;
  playButtonVoiceAlert('findMyCar');
  addActivityLog('Find My Car Triggered', 'location', 'manual', 'Horn chirped and hazard flashers blinking');
  renderAll();
  setTimeout(() => {
    state.vehicle.hazardLightsOn = false;
    renderAll();
  }, 4000);
}

// --- 7. SIMULATION ENGINES ---
function simulateIntrusion() {
  if (!state.vehicle.masterSecurityArmed) {
    showVoiceToast('Master Security is OFF. Arm security to run intrusion simulation.', true);
    return;
  }
  soundFx.playAlarm();
  playButtonVoiceAlert('intrusion');
  addSecurityAlert('critical', 'Unauthorized Intrusion Attempt', 'Rear right door forced open while sentry armed. GPS coordinates locked.');
  addActivityLog('Intrusion Alarm Triggered', 'security', 'simulated', 'Solenoid tamper sensor alert at Level B2');
  
  state.vehicle.hazardLightsOn = true;
  state.criticalModal = {
    title: '🚨 CRITICAL SECURITY ALERT',
    message: 'Perimeter intrusion detected! Rear door sensor triggered while Master Sentry was armed. Audible siren activated.',
    severity: 'critical',
    timestamp: 'Just now'
  };
  renderCriticalModal();
  renderAll();
}

function simulateImpact() {
  if (!state.vehicle.masterSecurityArmed) {
    showVoiceToast('Master Security is OFF. Arm security to run impact simulation.', true);
    return;
  }
  soundFx.playAlarm();
  playButtonVoiceAlert('impact');
  addSecurityAlert('critical', 'Heavy Impact & Glass Break Sensor', 'G-force spike 4.2G detected on rear quarter panel. Shock wave recorded.');
  addActivityLog('Vehicle Impact Detected', 'security', 'simulated', '3-axis accelerometer triggered event recording');
  
  state.criticalModal = {
    title: '💥 HIGH SHOCK IMPACT DETECTED',
    message: 'Acoustic glass sensor and 3-axis accelerometer registered a severe impact. Video buffers committed to secure cloud storage.',
    severity: 'critical',
    timestamp: 'Just now'
  };
  renderCriticalModal();
  renderAll();
}

function simulateSuspicious() {
  if (!state.vehicle.masterSecurityArmed) {
    showVoiceToast('Master Security is OFF. Arm security to run perimeter simulation.', true);
    return;
  }
  soundFx.playArm();
  playButtonVoiceAlert('suspicious');
  addSecurityAlert('warning', 'Perimeter Loitering Detected', 'Human figure recognized in blindspot for >45 seconds. Floodlight primed.');
  addActivityLog('Suspicious Person Flagged', 'security', 'simulated', 'AI object tracking confirmed stationary subject within 1.5m');
  
  state.criticalModal = {
    title: '⚠️ SUSPICIOUS ACTIVITY IN BLINDSPOT',
    message: 'AI perimeter camera flagged an unidentified subject lingering near driver-side door. Courtesy lights illuminated.',
    severity: 'warning',
    timestamp: 'Just now'
  };
  renderCriticalModal();
  renderAll();
}

function simulateDrowsiness() {
  if (!state.vehicle.driverSafetyActive) {
    showVoiceToast('Driver Safety is OFF. Enable Driver AI to test drowsiness detection.', true);
    return;
  }
  
  // Elevate fatigue telemetry
  state.drowsinessMetrics = {
    perclos: 74,
    blinkRatePerMin: 4,
    gazeDirection: 'Downward / Closed',
    attentionScore: 32,
    yawnDetected: true,
    fatigueLevel: 'Critical'
  };

  soundFx.playDrowsinessAlert();
  playButtonVoiceAlert('drowsiness');
  addSecurityAlert('critical', 'Driver Drowsiness Alert', 'PERCLOS exceeded 70% threshold (Eyes closed >2.4s). Immediate rest advisory issued.', 'safety');
  addActivityLog('Driver Drowsiness Detected', 'safety', 'simulated', 'Steering column infrared DMS triggered warning chime');

  state.criticalModal = {
    title: '💤 CRITICAL DRIVER DROWSINESS ALERT',
    message: 'Driver drowsiness detected. Please stop safely and take a break.',
    severity: 'critical',
    timestamp: 'Just now',
    disclaimer: 'Demonstration simulation: Real detection requires a compatible infrared steering-column camera and automotive-grade AI model.'
  };
  renderCriticalModal();
  renderAll();
}

function resetDriverBaseline() {
  soundFx.playClick();
  state.drowsinessMetrics = { ...NOMINAL_METRICS };
  showVoiceToast('Driver DMS baseline recalibrated to Normal.', false);
  addActivityLog('Driver DMS Recalibrated', 'safety', 'manual', 'Infrared eye tracking metrics returned to nominal baseline');
  renderAll();
}

// --- 8. DOM RENDERING ---
function renderCarVisualOverlays() {
  const container = document.getElementById('car-visual-container');
  if (!container) return;

  // Headlights overlay
  const hlOverlay = document.getElementById('overlay-headlights');
  if (hlOverlay) {
    hlOverlay.style.display = state.vehicle.headlightsOn ? 'block' : 'none';
  }

  // Doors lock overlay
  const doorsOverlay = document.getElementById('overlay-doors');
  if (doorsOverlay) {
    if (state.vehicle.doorsLocked) {
      doorsOverlay.innerHTML = `
        <div class="absolute top-[38%] left-[51%] w-[180px] h-[100px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-emerald-400/50 opacity-80"
             style="background: radial-gradient(ellipse at center, rgba(16, 185, 129, 0.12) 0%, transparent 70%); box-shadow: inset 0 0 20px rgba(16, 185, 129, 0.25);">
        </div>
      `;
    } else {
      doorsOverlay.innerHTML = `
        <div class="absolute top-[38%] left-[51%] w-[190px] h-[110px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-amber-400/80 animate-pulse"
             style="background: radial-gradient(ellipse at center, rgba(245, 158, 11, 0.2) 0%, transparent 75%); box-shadow: 0 0 25px rgba(245, 158, 11, 0.4), inset 0 0 20px rgba(245, 158, 11, 0.3);">
        </div>
      `;
    }
  }

  // Windows overlay
  const winOverlay = document.getElementById('overlay-windows');
  if (winOverlay) {
    winOverlay.style.display = state.vehicle.windowsOpen ? 'block' : 'none';
  }

  // Trunk overlay
  const trunkOverlay = document.getElementById('overlay-trunk');
  if (trunkOverlay) {
    trunkOverlay.style.display = state.vehicle.trunkOpen ? 'block' : 'none';
  }

  // Sentry Holographic Dome
  const sentryOverlay = document.getElementById('overlay-sentry');
  if (sentryOverlay) {
    sentryOverlay.style.display = state.vehicle.masterSecurityArmed ? 'flex' : 'none';
  }

  // Hazard Flashers
  const hazardOverlay = document.getElementById('overlay-hazards');
  if (hazardOverlay) {
    hazardOverlay.style.display = state.vehicle.hazardLightsOn ? 'block' : 'none';
  }

  // Interactive Hotspot Buttons labels & styling
  const btnHeadlights = document.getElementById('hotspot-btn-headlights');
  if (btnHeadlights) {
    btnHeadlights.className = `flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md text-[11px] font-mono border transition-all ${
      state.vehicle.headlightsOn 
        ? 'bg-cyan-500/40 border-cyan-300 text-white font-bold neon-glow-cyan scale-105' 
        : 'bg-slate-950/85 border-slate-700 text-slate-300 hover:border-cyan-500/50'
    }`;
    btnHeadlights.innerHTML = `
      <i data-lucide="lightbulb" class="w-3.5 h-3.5 ${state.vehicle.headlightsOn ? 'text-cyan-200 animate-pulse' : 'text-slate-400'}"></i>
      <span>Headlights: <strong class="${state.vehicle.headlightsOn ? 'text-cyan-200' : 'text-slate-400'}">${state.vehicle.headlightsOn ? 'ON (GLOWING)' : 'OFF'}</strong></span>
    `;
  }

  const btnDoors = document.getElementById('hotspot-btn-doors');
  if (btnDoors) {
    btnDoors.className = `flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md text-[11px] font-mono border transition-all ${
      state.vehicle.doorsLocked 
        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 font-bold' 
        : 'bg-amber-500/35 border-amber-400 text-amber-200 font-bold animate-pulse scale-105'
    }`;
    btnDoors.innerHTML = `
      <i data-lucide="${state.vehicle.doorsLocked ? 'lock' : 'unlock'}" class="w-3.5 h-3.5 ${state.vehicle.doorsLocked ? 'text-emerald-400' : 'text-amber-400'}"></i>
      <span>Doors: <strong class="${state.vehicle.doorsLocked ? 'text-emerald-300' : 'text-amber-300'}">${state.vehicle.doorsLocked ? 'LOCKED' : 'UNLOCKED'}</strong></span>
    `;
  }

  const btnWindows = document.getElementById('hotspot-btn-windows');
  if (btnWindows) {
    btnWindows.className = `flex items-center gap-1.5 px-2.5 py-1 rounded-xl backdrop-blur-md text-[11px] font-mono border transition-all ${
      state.vehicle.windowsOpen 
        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 font-bold neon-glow-cyan' 
        : 'bg-slate-950/85 border-slate-700 text-slate-300 hover:border-slate-500'
    }`;
    btnWindows.innerHTML = `
      <i data-lucide="wind" class="w-3.5 h-3.5 text-cyan-400"></i>
      <span>Windows: <strong class="${state.vehicle.windowsOpen ? 'text-cyan-300' : 'text-slate-400'}">${state.vehicle.windowsOpen ? 'OPEN (VENT)' : 'CLOSED'}</strong></span>
    `;
  }

  const btnTrunk = document.getElementById('hotspot-btn-trunk');
  if (btnTrunk) {
    btnTrunk.className = `flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md text-[11px] font-mono border transition-all ${
      state.vehicle.trunkOpen 
        ? 'bg-amber-500/40 border-amber-400 text-amber-100 font-bold animate-pulse scale-105' 
        : 'bg-slate-950/85 border-slate-700 text-slate-300 hover:border-slate-500'
    }`;
    btnTrunk.innerHTML = `
      <i data-lucide="layers" class="w-3.5 h-3.5 text-amber-400"></i>
      <span>Trunk/Dicky: <strong class="${state.vehicle.trunkOpen ? 'text-amber-300' : 'text-slate-400'}">${state.vehicle.trunkOpen ? 'OPEN' : 'CLOSED'}</strong></span>
    `;
  }
}

function renderDashboardQuickCards() {
  // Master Security Card
  const secCard = document.getElementById('card-master-security');
  if (secCard) {
    secCard.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center ${state.vehicle.masterSecurityArmed ? 'bg-cyan-500/20 text-cyan-400 neon-glow-cyan' : 'bg-slate-800 text-slate-400'}">
            <i data-lucide="${state.vehicle.masterSecurityArmed ? 'shield-check' : 'shield-alert'}" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="text-xs font-mono uppercase text-slate-400">Master Sentry</div>
            <div class="text-sm font-bold ${state.vehicle.masterSecurityArmed ? 'text-cyan-300' : 'text-slate-400'}">
              ${state.vehicle.masterSecurityArmed ? 'ARMED & ACTIVE' : 'DISARMED'}
            </div>
          </div>
        </div>
        <button id="btn-toggle-sec-dash" class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
          state.vehicle.masterSecurityArmed 
            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 hover:bg-cyan-500/30' 
            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-cyan-500/50'
        }">
          ${state.vehicle.masterSecurityArmed ? 'DISARM' : 'ARM SENTRY'}
        </button>
      </div>
    `;
    document.getElementById('btn-toggle-sec-dash')?.addEventListener('click', toggleMasterSecurity);
  }

  // Driver Safety Card
  const dmsCard = document.getElementById('card-driver-safety');
  if (dmsCard) {
    dmsCard.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center ${state.vehicle.driverSafetyActive ? 'bg-emerald-500/20 text-emerald-400 neon-glow-emerald' : 'bg-slate-800 text-slate-500'}">
            <i data-lucide="${state.vehicle.driverSafetyActive ? 'eye' : 'eye-off'}" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="text-xs font-mono uppercase text-slate-400">Driver AI (DMS)</div>
            <div class="text-sm font-bold ${state.vehicle.driverSafetyActive ? 'text-emerald-300' : 'text-slate-400'}">
              ${state.vehicle.driverSafetyActive ? 'EYE TRACKING ON' : 'STANDBY'}
            </div>
          </div>
        </div>
        <button id="btn-toggle-dms-dash" class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
          state.vehicle.driverSafetyActive 
            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 hover:bg-emerald-500/30' 
            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-emerald-500/50'
        }">
          ${state.vehicle.driverSafetyActive ? 'DISABLE' : 'ENABLE'}
        </button>
      </div>
    `;
    document.getElementById('btn-toggle-dms-dash')?.addEventListener('click', toggleDriverSafety);
  }

  // Central Doors Card
  const doorsCard = document.getElementById('card-doors-dash');
  if (doorsCard) {
    doorsCard.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center ${state.vehicle.doorsLocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}">
            <i data-lucide="${state.vehicle.doorsLocked ? 'lock' : 'unlock'}" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="text-xs font-mono uppercase text-slate-400">Central Doors</div>
            <div class="text-sm font-bold ${state.vehicle.doorsLocked ? 'text-emerald-300' : 'text-amber-300'}">
              ${state.vehicle.doorsLocked ? '4 DOORS LOCKED' : 'DOORS UNLOCKED'}
            </div>
          </div>
        </div>
        <button id="btn-toggle-doors-dash" class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
          state.vehicle.doorsLocked 
            ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-amber-500/50' 
            : 'bg-amber-500/20 border-amber-400 text-amber-300 hover:bg-amber-500/30'
        }">
          ${state.vehicle.doorsLocked ? 'UNLOCK' : 'LOCK'}
        </button>
      </div>
    `;
    document.getElementById('btn-toggle-doors-dash')?.addEventListener('click', toggleDoors);
  }

  // Matrix Headlights Card
  const lightsCard = document.getElementById('card-lights-dash');
  if (lightsCard) {
    lightsCard.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center ${state.vehicle.headlightsOn ? 'bg-cyan-500/20 text-cyan-400 neon-glow-cyan' : 'bg-slate-800 text-slate-400'}">
            <i data-lucide="lightbulb" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="text-xs font-mono uppercase text-slate-400">Headlights</div>
            <div class="text-sm font-bold ${state.vehicle.headlightsOn ? 'text-cyan-300' : 'text-slate-400'}">
              ${state.vehicle.headlightsOn ? 'MATRIX LED ON' : 'OFF'}
            </div>
          </div>
        </div>
        <button id="btn-toggle-lights-dash" class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
          state.vehicle.headlightsOn 
            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 hover:bg-cyan-500/30' 
            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-cyan-500/50'
        }">
          ${state.vehicle.headlightsOn ? 'TURN OFF' : 'TURN ON'}
        </button>
      </div>
    `;
    document.getElementById('btn-toggle-lights-dash')?.addEventListener('click', toggleHeadlights);
  }

  // Cabin Temperature Card
  const tempVal = document.getElementById('dash-temp-val');
  if (tempVal) tempVal.textContent = state.vehicle.cabinTempC.toFixed(1) + '°C';
}

function renderActivities() {
  const container = document.getElementById('activities-list');
  if (!container) return;
  if (state.activities.length === 0) {
    container.innerHTML = '<div class="text-xs text-slate-500 py-4 text-center">No recent activities logged.</div>';
    return;
  }
  container.innerHTML = state.activities.slice(0, 5).map(act => `
    <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/25 transition-all">
      <div class="flex items-center gap-3">
        <div class="w-2 h-2 rounded-full ${
          act.category === 'security' ? 'bg-cyan-400' : act.category === 'safety' ? 'bg-emerald-400' : 'bg-blue-400'
        }"></div>
        <div>
          <div class="text-xs font-bold text-slate-200">${act.action}</div>
          <div class="text-[11px] text-slate-400 font-mono">${act.details}</div>
        </div>
      </div>
      <div class="text-right">
        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">${act.source}</span>
        <div class="text-[10px] text-slate-500 mt-1">${act.timestamp}</div>
      </div>
    </div>
  `).join('');
}

function renderControlsView() {
  const container = document.getElementById('view-controls');
  if (!container) return;

  // Sync all switch toggles in Controls tab
  const secToggle = document.getElementById('ctrl-toggle-security');
  if (secToggle) secToggle.checked = state.vehicle.masterSecurityArmed;

  const dmsToggle = document.getElementById('ctrl-toggle-dms');
  if (dmsToggle) dmsToggle.checked = state.vehicle.driverSafetyActive;

  const hlToggle = document.getElementById('ctrl-toggle-headlights');
  if (hlToggle) hlToggle.checked = state.vehicle.headlightsOn;

  const doorToggle = document.getElementById('ctrl-toggle-doors');
  if (doorToggle) doorToggle.checked = state.vehicle.doorsLocked;

  const winToggle = document.getElementById('ctrl-toggle-windows');
  if (winToggle) winToggle.checked = state.vehicle.windowsOpen;

  const trunkToggle = document.getElementById('ctrl-toggle-trunk');
  if (trunkToggle) trunkToggle.checked = state.vehicle.trunkOpen;

  const gpsToggle = document.getElementById('ctrl-toggle-gps');
  if (gpsToggle) gpsToggle.checked = state.vehicle.gpsTrackingOn;

  const tempVal = document.getElementById('ctrl-temp-val');
  if (tempVal) tempVal.textContent = state.vehicle.cabinTempC.toFixed(1) + '°C';
}

function renderTrackingView() {
  const addrElem = document.getElementById('track-address');
  if (addrElem) addrElem.textContent = state.location.address;

  const bayElem = document.getElementById('track-bay');
  if (bayElem) bayElem.textContent = state.location.parkingBay;

  const coordElem = document.getElementById('track-coords');
  if (coordElem) coordElem.textContent = `${state.location.latitude.toFixed(4)}° N, ${state.location.longitude.toFixed(4)}° E`;

  const updatedElem = document.getElementById('track-updated');
  if (updatedElem) updatedElem.textContent = state.location.lastUpdated;
}

function renderSecurityView() {
  const badge = document.getElementById('security-status-badge');
  if (badge) {
    badge.className = `px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-mono font-bold ${
      state.vehicle.masterSecurityArmed 
        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
        : 'bg-slate-800 border-slate-700 text-slate-400'
    }`;
    badge.innerHTML = `
      <i data-lucide="${state.vehicle.masterSecurityArmed ? 'shield-check' : 'shield-alert'}" class="w-4 h-4 ${state.vehicle.masterSecurityArmed ? 'text-cyan-400' : 'text-amber-400'}"></i>
      ${state.vehicle.masterSecurityArmed ? 'SENTRY ARMED · 360° SENSORS ACTIVE' : 'SENTRY DISARMED'}
    `;
  }
}

function renderDriverSafetyView() {
  const dms = state.drowsinessMetrics;
  
  const scoreElem = document.getElementById('dms-attention-score');
  if (scoreElem) scoreElem.textContent = dms.attentionScore + '%';

  const perclosElem = document.getElementById('dms-perclos');
  if (perclosElem) perclosElem.textContent = dms.perclos + '%';

  const blinkElem = document.getElementById('dms-blink-rate');
  if (blinkElem) blinkElem.textContent = dms.blinkRatePerMin + ' / min';

  const gazeElem = document.getElementById('dms-gaze');
  if (gazeElem) gazeElem.textContent = dms.gazeDirection;

  const fatigueBadge = document.getElementById('dms-fatigue-badge');
  if (fatigueBadge) {
    fatigueBadge.className = `px-3 py-1 rounded-full text-xs font-bold font-mono border ${
      dms.fatigueLevel === 'Normal' 
        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
        : 'bg-red-500/20 border-red-500/40 text-red-300 animate-pulse'
    }`;
    fatigueBadge.textContent = dms.fatigueLevel.toUpperCase();
  }
}

function renderNotifications() {
  const container = document.getElementById('notifications-list');
  if (!container) return;

  let filtered = state.alerts;
  if (state.notificationFilter !== 'all') {
    filtered = state.alerts.filter(a => a.category === state.notificationFilter);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-slate-500 cyber-panel rounded-2xl">
        <i data-lucide="check-circle" class="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60"></i>
        <div class="text-sm font-bold text-slate-300">All Clear</div>
        <div class="text-xs text-slate-500 mt-1">No alerts recorded in this filter.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="p-4 rounded-xl border transition-all ${
      item.read 
        ? 'bg-slate-900/50 border-slate-800' 
        : 'bg-slate-900/90 border-cyan-500/40 neon-border-cyan'
    }">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            item.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
            item.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'
          }">
            <i data-lucide="${item.severity === 'critical' ? 'alert-octagon' : item.severity === 'warning' ? 'alert-triangle' : 'info'}" class="w-4 h-4"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-200">${item.title}</span>
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase ${
                item.severity === 'critical' ? 'bg-red-950 text-red-300 border border-red-800' :
                item.severity === 'warning' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-800 text-slate-400'
              }">${item.severity}</span>
            </div>
            <p class="text-xs text-slate-400 mt-1">${item.description}</p>
            <div class="text-[10px] font-mono text-slate-500 mt-2">${item.timestamp} · Category: ${item.category}</div>
          </div>
        </div>
        <div class="flex flex-col gap-1 items-end shrink-0">
          ${!item.read ? `
            <button onclick="markAlertRead('${item.id}')" class="px-2 py-1 rounded bg-slate-800 text-[10px] font-mono text-cyan-300 border border-slate-700 hover:border-cyan-400">
              Mark Read
            </button>
          ` : `
            <span class="text-[10px] font-mono text-slate-600">Acknowledged</span>
          `}
        </div>
      </div>
    </div>
  `).join('');
}

window.markAlertRead = function(id) {
  const alert = state.alerts.find(a => a.id === id);
  if (alert) {
    alert.read = true;
    alert.acknowledged = true;
    persistState();
    updateAlertBadge();
    renderNotifications();
  }
};

function renderSettingsView() {
  const snd = document.getElementById('setting-sound');
  if (snd) snd.checked = state.settings.soundEnabled;

  const vce = document.getElementById('setting-voice');
  if (vce) vce.checked = state.settings.voiceAlertsEnabled;

  const langSel = document.getElementById('setting-lang');
  if (langSel) langSel.value = state.settings.preferredLang;

  const sensSel = document.getElementById('setting-sens');
  if (sensSel) sensSel.value = state.settings.drowsinessSensitivity;
}

function renderToast() {
  const toast = document.getElementById('voice-feedback-toast');
  if (!toast) return;
  if (!state.toastMessage) {
    toast.classList.add('hidden');
    return;
  }
  toast.classList.remove('hidden');
  toast.innerHTML = `
    <div class="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border backdrop-blur-xl shadow-2xl ${
      state.toastMessage.isEmergency 
        ? 'bg-red-950/90 border-red-500/80 text-red-200 neon-glow-red animate-pulse' 
        : 'bg-slate-900/90 border-cyan-500/60 text-cyan-100 neon-glow-cyan'
    }">
      <i data-lucide="${state.toastMessage.isEmergency ? 'alert-triangle' : 'volume-2'}" class="w-4 h-4 ${state.toastMessage.isEmergency ? 'text-red-400' : 'text-cyan-400'} shrink-0"></i>
      <span class="text-xs font-mono font-medium">${state.toastMessage.text}</span>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();
}

function renderCriticalModal() {
  const modal = document.getElementById('critical-alert-modal');
  if (!modal) return;
  if (!state.criticalModal) {
    modal.classList.add('hidden');
    return;
  }
  modal.classList.remove('hidden');
  const cm = state.criticalModal;
  modal.innerHTML = `
    <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="max-w-md w-full cyber-panel rounded-2xl border-2 ${
        cm.severity === 'critical' ? 'border-red-500 neon-glow-red' : 'border-amber-500 neon-glow-amber'
      } p-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <i data-lucide="alert-octagon" class="w-6 h-6 ${cm.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}"></i>
            <h3 class="text-base font-extrabold text-white font-mono">${cm.title}</h3>
          </div>
          <button id="btn-close-critical" class="text-slate-400 hover:text-white p-1">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        <div class="py-5 text-sm text-slate-200 font-medium">
          ${cm.message}
        </div>
        ${cm.disclaimer ? `
          <div class="p-3 mb-4 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
            ℹ️ ${cm.disclaimer}
          </div>
        ` : ''}
        <div class="flex items-center justify-end gap-3 pt-2">
          <button id="btn-ack-critical" class="w-full py-2.5 rounded-xl text-xs font-mono font-bold ${
            cm.severity === 'critical' 
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30' 
              : 'bg-amber-600 hover:bg-amber-500 text-black'
          }">
            ACKNOWLEDGE & DISMISS ALERT
          </button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('btn-close-critical')?.addEventListener('click', dismissCriticalModal);
  document.getElementById('btn-ack-critical')?.addEventListener('click', dismissCriticalModal);
  if (window.lucide) window.lucide.createIcons();
}

function dismissCriticalModal() {
  state.criticalModal = null;
  renderCriticalModal();
}

function renderVoiceResult(res) {
  const container = document.getElementById('voice-output-container');
  if (!container) return;
  container.innerHTML = `
    <div class="p-4 rounded-xl border ${
      res.understood ? 'bg-cyan-950/30 border-cyan-500/40' : 'bg-amber-950/30 border-amber-500/40'
    }">
      <div class="flex items-center justify-between text-xs font-mono mb-2">
        <span class="text-slate-400">Command: <strong class="text-white">"${res.rawCommand}"</strong></span>
        <span class="px-2 py-0.5 rounded ${res.understood ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'}">
          ${res.intent} · ${(res.confidence * 100).toFixed(0)}%
        </span>
      </div>
      <div class="text-sm font-bold text-white mb-1">${res.actionTaken}</div>
      <div class="text-xs text-slate-300 mb-1">🇺🇸 ${res.responseTextEn}</div>
      <div class="text-xs text-cyan-300">🇮🇳 ${res.responseTextHi}</div>
      ${res.clarificationSuggestions ? `
        <div class="mt-3 pt-3 border-t border-slate-800/80">
          <div class="text-[11px] font-mono text-slate-400 mb-1.5">Suggested valid commands:</div>
          <div class="flex flex-wrap gap-1.5">
            ${res.clarificationSuggestions.map(s => `
              <button class="voice-chip px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950 hover:border-cyan-400 border border-slate-700 text-[11px] font-mono text-cyan-200">
                ${s}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  // Attach chip click listeners
  container.querySelectorAll('.voice-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      executeVoiceCommand(btn.textContent.trim());
    });
  });
}

// --- 8.1 PROFILE & NUMBER PLATE HANDLERS ---
function validatePlateNumber(rawPlate) {
  if (!rawPlate || typeof rawPlate !== 'string' || !rawPlate.trim()) {
    return {
      isValid: false,
      message: 'Registration plate cannot be empty. Please enter plate number.',
      formatted: ''
    };
  }

  const cleaned = rawPlate.trim().toUpperCase();
  const sanitized = cleaned.replace(/[^A-Z0-9 -]/g, '').replace(/\s+/g, ' ');
  const alphanumericOnly = sanitized.replace(/[^A-Z0-9]/g, '');

  if (alphanumericOnly.length < 4) {
    return {
      isValid: false,
      message: 'Plate number is too short (minimum 4 alphanumeric characters).',
      formatted: sanitized
    };
  }

  if (alphanumericOnly.length > 14) {
    return {
      isValid: false,
      message: 'Plate number is too long (maximum 14 characters).',
      formatted: sanitized
    };
  }

  const hasLetter = /[A-Z]/.test(alphanumericOnly);
  const hasDigit = /[0-9]/.test(alphanumericOnly);

  if (!hasLetter || !hasDigit) {
    return {
      isValid: false,
      message: 'Plate must include letters and numbers (e.g. SG-2026-AI or DL-01-AB-1234).',
      formatted: sanitized
    };
  }

  return {
    isValid: true,
    message: 'Valid vehicle registration number format (HSRP compliant).',
    formatted: sanitized
  };
}

function renderVehiclePlateAndBadges() {
  const plate = state.profile?.plateNumber || state.vehicle.plateNumber || 'SG-2026-AI';
  const brand = state.profile?.carBrand || 'SmartGuard';
  const model = state.profile?.carModel || 'EV-9 CyberSedan';
  const fullName = `${brand} ${model}`.trim();
  const owner = state.profile?.ownerName || 'Piyush Sharma';
  const initial = (owner.trim() || 'P').charAt(0).toUpperCase();

  // 1. On-Car Visualizer Front Number Plate
  const onCarPlate = document.getElementById('on-car-plate-number');
  if (onCarPlate) onCarPlate.textContent = plate;

  // 2. Dashboard Top HUD Plate Badge
  const dashPlate = document.getElementById('dashboard-plate-badge');
  if (dashPlate) dashPlate.textContent = plate;

  // 3. Header Top HUD Plate Badge
  const headerPlate = document.getElementById('header-plate-badge');
  if (headerPlate) headerPlate.textContent = plate;

  // 4. Dashboard Car Model text
  const dashModel = document.getElementById('dashboard-car-model');
  if (dashModel) dashModel.textContent = fullName;

  // 5. Header Owner Name & Avatar
  const headerOwner = document.getElementById('header-owner-name');
  if (headerOwner) headerOwner.textContent = owner;
  const headerAvatar = document.getElementById('header-avatar-circle');
  if (headerAvatar) headerAvatar.textContent = initial;
}

function updateLiveProfilePreview() {
  const inputName = document.getElementById('input-profile-name')?.value || state.profile.ownerName || 'Piyush Sharma';
  const inputBrand = document.getElementById('input-profile-brand')?.value || state.profile.carBrand || 'SmartGuard';
  const inputModel = document.getElementById('input-profile-model')?.value || state.profile.carModel || 'EV-9 CyberSedan';
  const rawPlate = document.getElementById('input-profile-plate')?.value || state.profile.plateNumber || 'SG-2026-AI';

  const validation = validatePlateNumber(rawPlate);
  const formattedPlate = validation.formatted || rawPlate.toUpperCase() || 'SG-2026-AI';
  const initial = (inputName.trim() || 'P').charAt(0).toUpperCase();
  const fullName = `${inputBrand} ${inputModel}`.trim();

  // Update Live Preview elements
  const prevPlate = document.getElementById('preview-plate-number');
  if (prevPlate) prevPlate.textContent = formattedPlate;

  const prevCar = document.getElementById('preview-car-fullname');
  if (prevCar) prevCar.textContent = fullName;

  const prevBadge = document.getElementById('preview-plate-badge');
  if (prevBadge) prevBadge.textContent = formattedPlate;

  const prevOwner = document.getElementById('preview-owner-name');
  if (prevOwner) prevOwner.textContent = inputName;

  const prevAvatar = document.getElementById('preview-avatar');
  if (prevAvatar) prevAvatar.textContent = initial;

  // Validation message box
  const valMsg = document.getElementById('plate-validation-msg');
  if (valMsg) {
    if (validation.isValid) {
      valMsg.className = 'mt-2 p-2.5 rounded-xl border bg-emerald-950/40 border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2';
      valMsg.innerHTML = `
        <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0"></i>
        <span>${validation.message}</span>
      `;
    } else {
      valMsg.className = 'mt-2 p-2.5 rounded-xl border bg-amber-950/40 border-amber-500/50 text-amber-300 text-xs font-mono flex items-center gap-2';
      valMsg.innerHTML = `
        <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-400 shrink-0"></i>
        <span>${validation.message}</span>
      `;
    }
    if (window.lucide) window.lucide.createIcons();
  }
}

function renderProfileView() {
  const p = state.profile;
  const initial = (p.ownerName || 'P').charAt(0).toUpperCase();
  const fullName = `${p.carBrand} ${p.carModel}`.trim();

  // Mode cards visibility
  const viewCard = document.getElementById('profile-view-card');
  const editCard = document.getElementById('profile-edit-card');

  if (viewCard && editCard) {
    if (state.profileEditMode) {
      viewCard.classList.add('hidden');
      editCard.classList.remove('hidden');
    } else {
      viewCard.classList.remove('hidden');
      editCard.classList.add('hidden');
    }
  }

  // Update View Card displays
  const dispOwner = document.getElementById('profile-display-owner');
  if (dispOwner) dispOwner.textContent = p.ownerName;

  const dispBrand = document.getElementById('profile-display-brand');
  if (dispBrand) dispBrand.textContent = p.carBrand;

  const dispModel = document.getElementById('profile-display-model');
  if (dispModel) dispModel.textContent = p.carModel;

  const dispFull = document.getElementById('profile-display-fullname');
  if (dispFull) dispFull.textContent = fullName;

  const dispPlate = document.getElementById('profile-display-plate');
  if (dispPlate) dispPlate.textContent = p.plateNumber;

  const dispVin = document.getElementById('profile-display-vin');
  if (dispVin) dispVin.textContent = p.vinNumber || 'SG9EV-2026-X8849';

  const viewAvatar = document.getElementById('profile-view-avatar');
  if (viewAvatar) viewAvatar.textContent = initial;

  // Sync Input Fields if in Edit Mode
  const inputName = document.getElementById('input-profile-name');
  const inputBrand = document.getElementById('input-profile-brand');
  const inputModel = document.getElementById('input-profile-model');
  const inputPlate = document.getElementById('input-profile-plate');

  if (state.profileEditMode) {
    if (inputName && !inputName.value) inputName.value = p.ownerName;
    if (inputBrand && !inputBrand.value) inputBrand.value = p.carBrand;
    if (inputModel && !inputModel.value) inputModel.value = p.carModel;
    if (inputPlate && !inputPlate.value) inputPlate.value = p.plateNumber;
    updateLiveProfilePreview();
  }
}

function handleSaveProfile() {
  const inputName = document.getElementById('input-profile-name')?.value.trim();
  const inputBrand = document.getElementById('input-profile-brand')?.value.trim();
  const inputModel = document.getElementById('input-profile-model')?.value.trim();
  const inputPlate = document.getElementById('input-profile-plate')?.value.trim();

  if (!inputName) {
    showVoiceToast('Please enter the owner full name.', true);
    soundFx.playClick();
    return;
  }
  if (!inputBrand) {
    showVoiceToast('Please enter the vehicle brand.', true);
    soundFx.playClick();
    return;
  }
  if (!inputModel) {
    showVoiceToast('Please enter the vehicle model.', true);
    soundFx.playClick();
    return;
  }

  const validation = validatePlateNumber(inputPlate);
  if (!validation.isValid) {
    showVoiceToast(validation.message, true);
    soundFx.playClick();
    return;
  }

  const cleanPlate = validation.formatted;

  // Update State
  state.profile.ownerName = inputName;
  state.profile.carBrand = inputBrand;
  state.profile.carModel = inputModel;
  state.profile.plateNumber = cleanPlate;
  state.profile.isConfigured = true;

  // Synchronize Vehicle State
  state.vehicle.plateNumber = cleanPlate;
  state.vehicle.carModel = `${inputBrand} ${inputModel}`.trim();

  // Persist
  persistState();

  // Sound and Voice feedback
  soundFx.playLock();
  playButtonVoiceAlert('profileSaved');

  // Activity Log
  addActivityLog(
    'Profile & Registration Saved',
    'controls',
    'manual',
    `${cleanPlate} (${state.vehicle.carModel}) registered to ${inputName}`
  );

  showVoiceToast(`Vehicle profile saved. License plate ${cleanPlate} active.`, false);

  // Switch back to view mode
  state.profileEditMode = false;
  renderAll();
}

function renderAll() {
  renderVehiclePlateAndBadges();
  renderCarVisualOverlays();
  renderDashboardQuickCards();
  renderActivities();
  renderControlsView();
  renderTrackingView();
  renderSecurityView();
  renderDriverSafetyView();
  renderNotifications();
  renderSettingsView();
  renderProfileView();
  updateAlertBadge();
  if (window.lucide) window.lucide.createIcons();
}

// --- 9. TAB SWITCHING ---
function switchTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('bg-cyan-500/20', 'text-cyan-300', 'border-cyan-500/50');
      btn.classList.remove('text-slate-400', 'border-transparent');
    } else {
      btn.classList.remove('bg-cyan-500/20', 'text-cyan-300', 'border-cyan-500/50');
      btn.classList.add('text-slate-400', 'border-transparent');
    }
  });

  document.querySelectorAll('.tab-content').forEach(view => {
    if (view.id === `view-${tabId}`) {
      view.classList.remove('hidden');
      view.classList.add('flex');
    } else {
      view.classList.add('hidden');
      view.classList.remove('flex');
    }
  });

  renderAll();
}

// --- 10. SPEECH RECOGNITION SETUP ---
let recognition = null;
if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRec();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = state.settings.preferredLang === 'hi-IN' ? 'hi-IN' : 'en-US';

  recognition.onstart = () => {
    state.isListening = true;
    updateMicStatus(true);
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('voice-input-text').value = transcript;
    executeVoiceCommand(transcript);
  };

  recognition.onerror = () => {
    state.isListening = false;
    updateMicStatus(false);
  };

  recognition.onend = () => {
    state.isListening = false;
    updateMicStatus(false);
  };
}

function updateMicStatus(listening) {
  const micBtn = document.getElementById('btn-mic-toggle');
  const micIndicator = document.getElementById('mic-listening-indicator');
  if (micBtn) {
    if (listening) {
      micBtn.classList.add('bg-red-500', 'neon-glow-red', 'animate-pulse');
      micBtn.classList.remove('bg-cyan-500');
    } else {
      micBtn.classList.remove('bg-red-500', 'neon-glow-red', 'animate-pulse');
      micBtn.classList.add('bg-cyan-500');
    }
  }
  if (micIndicator) {
    micIndicator.textContent = listening ? 'Listening... Speak in Hindi or English' : 'Tap Mic to Speak or type below';
  }
}

function toggleMicRecognition() {
  if (!recognition) {
    showVoiceToast('Browser speech recognition not supported. Use typed input below.', false);
    return;
  }
  try {
    if (state.isListening) {
      recognition.stop();
    } else {
      recognition.lang = state.settings.preferredLang === 'hi-IN' ? 'hi-IN' : 'en-US';
      recognition.start();
    }
  } catch (e) {
    recognition.stop();
  }
}

// --- 11. INITIALIZATION & EVENT BINDINGS ---
document.addEventListener('DOMContentLoaded', () => {
  // Navigation tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (tab) switchTab(tab);
    });
  });

  // Hotspots directly on car image
  document.getElementById('hotspot-btn-headlights')?.addEventListener('click', toggleHeadlights);
  document.getElementById('hotspot-btn-doors')?.addEventListener('click', toggleDoors);
  document.getElementById('hotspot-btn-windows')?.addEventListener('click', toggleWindows);
  document.getElementById('hotspot-btn-trunk')?.addEventListener('click', toggleTrunk);

  // Quick Action Dashboard Bar
  document.getElementById('btn-quick-security')?.addEventListener('click', toggleMasterSecurity);
  document.getElementById('btn-quick-dms')?.addEventListener('click', toggleDriverSafety);
  document.getElementById('btn-quick-lock')?.addEventListener('click', toggleDoors);
  document.getElementById('btn-quick-lights')?.addEventListener('click', toggleHeadlights);
  document.getElementById('btn-quick-windows')?.addEventListener('click', toggleWindows);
  document.getElementById('btn-quick-trunk')?.addEventListener('click', toggleTrunk);

  // Cabin Temp controls
  document.getElementById('btn-dash-temp-minus')?.addEventListener('click', () => adjustCabinTemp(-0.5));
  document.getElementById('btn-dash-temp-plus')?.addEventListener('click', () => adjustCabinTemp(0.5));
  document.getElementById('btn-ctrl-temp-minus')?.addEventListener('click', () => adjustCabinTemp(-0.5));
  document.getElementById('btn-ctrl-temp-plus')?.addEventListener('click', () => adjustCabinTemp(0.5));

  // Controls Page Toggles
  document.getElementById('ctrl-toggle-security')?.addEventListener('change', toggleMasterSecurity);
  document.getElementById('ctrl-toggle-dms')?.addEventListener('change', toggleDriverSafety);
  document.getElementById('ctrl-toggle-headlights')?.addEventListener('change', toggleHeadlights);
  document.getElementById('ctrl-toggle-doors')?.addEventListener('change', toggleDoors);
  document.getElementById('ctrl-toggle-windows')?.addEventListener('change', toggleWindows);
  document.getElementById('ctrl-toggle-trunk')?.addEventListener('change', toggleTrunk);
  document.getElementById('ctrl-toggle-gps')?.addEventListener('change', toggleGps);

  // Emergency Horn / Hazards in Controls
  document.getElementById('btn-ctrl-horn')?.addEventListener('click', () => {
    soundFx.playHorn();
    playButtonVoiceAlert(null, { en: 'Acoustic horn sounded.', hi: 'गाड़ी का हॉर्न बजाया गया।' });
  });
  document.getElementById('btn-ctrl-hazards')?.addEventListener('click', () => {
    state.vehicle.hazardLightsOn = !state.vehicle.hazardLightsOn;
    soundFx.playClick();
    renderAll();
  });

  // Tracking Actions
  document.getElementById('btn-find-my-car')?.addEventListener('click', triggerFindMyCarAnimation);
  document.getElementById('btn-refresh-location')?.addEventListener('click', () => {
    soundFx.playClick();
    state.location.lastUpdated = 'Just now';
    showVoiceToast('GNSS satellite fix refreshed. Accuracy 2.1m.', false);
    renderTrackingView();
  });

  // Security Simulation Actions
  document.getElementById('btn-sim-intrusion')?.addEventListener('click', simulateIntrusion);
  document.getElementById('btn-sim-impact')?.addEventListener('click', simulateImpact);
  document.getElementById('btn-sim-suspicious')?.addEventListener('click', simulateSuspicious);
  document.getElementById('btn-toggle-security-page')?.addEventListener('click', toggleMasterSecurity);

  // Driver Safety Actions
  document.getElementById('btn-sim-drowsiness')?.addEventListener('click', simulateDrowsiness);
  document.getElementById('btn-reset-dms')?.addEventListener('click', resetDriverBaseline);
  document.getElementById('btn-toggle-dms-page')?.addEventListener('click', toggleDriverSafety);

  // Notifications Actions
  document.querySelectorAll('.notif-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.notificationFilter = btn.getAttribute('data-filter') || 'all';
      document.querySelectorAll('.notif-filter-btn').forEach(b => b.classList.remove('bg-cyan-500/20', 'text-cyan-300'));
      btn.classList.add('bg-cyan-500/20', 'text-cyan-300');
      renderNotifications();
      if (window.lucide) window.lucide.createIcons();
    });
  });

  document.getElementById('btn-mark-all-read')?.addEventListener('click', () => {
    state.alerts.forEach(a => { a.read = true; a.acknowledged = true; });
    persistState();
    updateAlertBadge();
    renderNotifications();
    showVoiceToast('All alerts marked as acknowledged.', false);
  });

  document.getElementById('btn-clear-demo-events')?.addEventListener('click', () => {
    state.alerts = [];
    persistState();
    updateAlertBadge();
    renderNotifications();
    showVoiceToast('Demo alert history cleared.', false);
  });

  // Settings Actions
  document.getElementById('setting-sound')?.addEventListener('change', (e) => {
    state.settings.soundEnabled = e.target.checked;
    persistState();
  });
  document.getElementById('setting-voice')?.addEventListener('change', (e) => {
    state.settings.voiceAlertsEnabled = e.target.checked;
    persistState();
  });
  document.getElementById('setting-lang')?.addEventListener('change', (e) => {
    state.settings.preferredLang = e.target.value;
    if (recognition) recognition.lang = e.target.value === 'hi-IN' ? 'hi-IN' : 'en-US';
    persistState();
    showVoiceToast(`Voice language switched to ${e.target.value === 'hi-IN' ? 'Hindi' : 'English'}`, false);
  });
  document.getElementById('setting-sens')?.addEventListener('change', (e) => {
    state.settings.drowsinessSensitivity = e.target.value;
    persistState();
  });
  document.getElementById('btn-reset-demo-state')?.addEventListener('click', () => {
    localStorage.clear();
    state.vehicle = { ...INITIAL_VEHICLE_STATE };
    state.settings = { ...INITIAL_SETTINGS };
    state.drowsinessMetrics = { ...NOMINAL_METRICS };
    state.profile = { ...INITIAL_PROFILE_STATE };
    state.alerts = [];
    state.activities = [];
    persistState();
    showVoiceToast('All demo states and profile reset to factory baseline.', false);
    renderAll();
  });

  // Profile View & Edit Actions
  const enterProfileEdit = () => {
    state.profileEditMode = true;
    soundFx.playClick();
    renderProfileView();
    const inputName = document.getElementById('input-profile-name');
    const inputBrand = document.getElementById('input-profile-brand');
    const inputModel = document.getElementById('input-profile-model');
    const inputPlate = document.getElementById('input-profile-plate');
    if (inputName) inputName.value = state.profile.ownerName;
    if (inputBrand) inputBrand.value = state.profile.carBrand;
    if (inputModel) inputModel.value = state.profile.carModel;
    if (inputPlate) inputPlate.value = state.profile.plateNumber;
    updateLiveProfilePreview();
    if (window.lucide) window.lucide.createIcons();
  };

  const exitProfileEdit = () => {
    state.profileEditMode = false;
    soundFx.playClick();
    renderProfileView();
    if (window.lucide) window.lucide.createIcons();
  };

  document.getElementById('btn-start-edit-profile')?.addEventListener('click', enterProfileEdit);
  document.getElementById('btn-edit-profile-card')?.addEventListener('click', enterProfileEdit);
  document.getElementById('btn-cancel-edit-profile')?.addEventListener('click', exitProfileEdit);
  document.getElementById('btn-cancel-edit-x')?.addEventListener('click', exitProfileEdit);

  // Live input events for real-time preview and validation
  ['input-profile-name', 'input-profile-brand', 'input-profile-model', 'input-profile-plate'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateLiveProfilePreview);
  });

  // Quick brand selection pills
  document.querySelectorAll('.brand-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const brand = chip.getAttribute('data-brand');
      const inputBrand = document.getElementById('input-profile-brand');
      if (inputBrand && brand) {
        inputBrand.value = brand;
        updateLiveProfilePreview();
        soundFx.playClick();
      }
    });
  });

  // Save profile button
  document.getElementById('btn-save-profile')?.addEventListener('click', handleSaveProfile);

  // Voice Assistant Modal Actions
  const voiceModal = document.getElementById('voice-assistant-modal');
  const openVoiceBtns = [document.getElementById('btn-open-voice-header'), document.getElementById('btn-open-voice-fab')];
  openVoiceBtns.forEach(b => {
    b?.addEventListener('click', () => {
      voiceModal.classList.remove('hidden');
      voiceModal.classList.add('flex');
      if (window.lucide) window.lucide.createIcons();
    });
  });

  document.getElementById('btn-close-voice-modal')?.addEventListener('click', () => {
    voiceModal.classList.add('hidden');
    voiceModal.classList.remove('flex');
    if (state.isListening && recognition) recognition.stop();
  });

  document.getElementById('btn-mic-toggle')?.addEventListener('click', toggleMicRecognition);

  document.getElementById('btn-submit-voice-text')?.addEventListener('click', () => {
    const text = document.getElementById('voice-input-text').value;
    if (text) {
      executeVoiceCommand(text);
      document.getElementById('voice-input-text').value = '';
    }
  });

  document.getElementById('voice-input-text')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const text = e.target.value;
      if (text) {
        executeVoiceCommand(text);
        e.target.value = '';
      }
    }
  });

  // Quick suggestion chips inside voice modal
  document.querySelectorAll('.preset-command-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      executeVoiceCommand(chip.getAttribute('data-cmd'));
    });
  });

  // Initial render
  renderAll();
  if (window.lucide) window.lucide.createIcons();
});
