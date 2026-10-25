import { VehicleState, LocationState } from '../types';

export interface CommandExecutionResult {
  understood: boolean;
  actionTaken: string;
  responseTextEn: string;
  responseTextHi: string;
  appliedChanges?: Partial<VehicleState>;
  triggerFindMyCar?: boolean;
  category: 'controls' | 'security' | 'safety' | 'location';
  rawCommand: string;
  intent: string;
  confidence: number;
  needsClarification?: boolean;
  clarificationSuggestions?: string[];
}

// Speak response using SpeechSynthesis API if available
export function speakText(text: string, lang = 'en-US') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Choose clear natural voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const langPrefix = lang.slice(0, 2);
      const preferredVoice = voices.find(
        v => v.lang.startsWith(langPrefix) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Female'))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech synthesis failures
  }
}

// Normalize text for cross-lingual NLP intent matching
function normalizeInput(input: string): string {
  let text = input.toLowerCase().trim();
  // Strip common punctuation except letters and numbers
  text = text.replace(/[?!.,;:_#@*&^%$]/g, ' ');
  // Replace multiple spaces with single space
  text = text.replace(/\s+/g, ' ');
  
  // Normalize phonetics and spelling variations in Hinglish/Hindi speech
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

// Check presence of keywords
function hasAny(text: string, words: string[]): boolean {
  return words.some(w => text.includes(w));
}

export function parseVoiceCommand(
  rawInput: string,
  currentState: VehicleState,
  locationState: LocationState
): CommandExecutionResult {
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

  // 1. HEADLIGHTS INTENT DETECTION (Both OFF and ON)
  // HEADLIGHTS OFF
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
    ]) ||
    (isLightEntity && isOffAction)
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

  // HEADLIGHTS ON
  if (
    hasAny(rawLower, [
      'light on karo', 'lights on karo', 'headlight on karo', 'headlights on karo',
      'light on', 'lights on', 'headlight on', 'headlights on',
      'turn on headlight', 'turn on headlights', 'turn on light', 'turn on lights', 'turn on the lights',
      'light jalao', 'headlight jalao', 'headlights jalao', 'batti jalao', 'light chalu karo',
      'high beam on', 'headlights on please', 'can you turn on headlights',
      'लाइट ऑन करो', 'लाइट जलाओ', 'हेडलाइट ऑन करो', 'बत्ती जलाओ'
    ]) ||
    (isLightEntity && isOnAction)
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

  // 2. WINDOWS INTENT DETECTION (OPEN / CLOSE)
  const isWindowEntity = hasAny(norm, ['window', 'khidki', 'glass', 'ventilation', 'sheesha', 'खिड़की', 'विंडो', 'शीशा']);

  // WINDOWS OPEN
  if (
    hasAny(rawLower, [
      'window kholo', 'windows kholo', 'khidki kholo', 'khidkiyan kholo', 'open window', 'open windows',
      'window open karo', 'windows open karo', 'roll down windows', 'lower windows',
      'sheesha niche karo', 'glass down karo', 'vent windows', 'विंडो खोलो', 'खिड़की खोलो'
    ]) ||
    (isWindowEntity && (isOnAction || hasAny(norm, ['open', 'niche', 'down', 'vent'])))
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

  // WINDOWS CLOSE
  if (
    hasAny(rawLower, [
      'window band karo', 'windows band karo', 'khidki band karo', 'khidkiyan band karo', 'close window', 'close windows',
      'window close karo', 'windows close karo', 'roll up windows', 'seal windows',
      'sheesha upar karo', 'glass up karo', 'विंडो बंद करो', 'खिड़की बंद करो'
    ]) ||
    (isWindowEntity && (isOffAction || hasAny(norm, ['close', 'upar', 'up', 'seal'])))
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

  // 3. TRUNK / DICKEY INTENT DETECTION (OPEN / CLOSE)
  const isTrunkEntity = hasAny(norm, ['trunk', 'dicky', 'boot', 'hatch', 'डिक्की', 'डिग्गी', 'ट्रंक', 'बूट']);

  // TRUNK OPEN
  if (
    hasAny(rawLower, [
      'dicky kholo', 'dickie kholo', 'diki kholo', 'diggi kholo', 'diggy kholo', 'trunk kholo', 'boot kholo',
      'open trunk', 'open dicky', 'open dickie', 'open boot', 'dicky open karo', 'trunk open karo',
      'pichhe ka gate kholo', 'lift trunk hatch', 'डिक्की खोलो', 'ट्रंक खोलो', 'डिग्गी खोलो'
    ]) ||
    (isTrunkEntity && (isOnAction || hasAny(norm, ['open', 'lift'])))
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

  // TRUNK CLOSE
  if (
    hasAny(rawLower, [
      'dicky band karo', 'dickie band karo', 'diki band karo', 'diggi band karo', 'trunk band karo', 'boot band karo',
      'close trunk', 'close dicky', 'close boot', 'dicky close karo', 'trunk close karo',
      'pichhe ka gate band karo', 'latch trunk hatch', 'डिक्की बंद करो', 'ट्रंक बंद करो', 'डिग्गी बंद करो'
    ]) ||
    (isTrunkEntity && (isOffAction || hasAny(norm, ['close', 'latch'])))
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

  // 4. SECURITY SENTRY INTENT DETECTION (ARM / DISARM)
  const isSecurityEntity = hasAny(norm, ['security', 'sentry', 'suraksha', 'anti-theft', 'alarm', 'guard', 'protection', 'सुरक्षा', 'सिक्योरिटी']);

  // SECURITY DISARM / OFF
  if (
    hasAny(rawLower, [
      'security off karo', 'security band karo', 'security deactivate karo', 'security disarm karo',
      'turn off security', 'disarm security', 'deactivate security', 'security off',
      'suraksha band karo', 'sentry off karo', 'sentry mode off', 'सिक्योरिटी ऑफ करो', 'सुरक्षा बंद करो'
    ]) ||
    (isSecurityEntity && isOffAction)
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

  // SECURITY ARM / ON
  if (
    hasAny(rawLower, [
      'security on karo', 'security chalu karo', 'security activate karo', 'security arm karo',
      'activate security', 'arm security', 'turn on security', 'security on',
      'suraksha chalu karo', 'sentry on karo', 'sentry mode on', 'enable car security',
      'सिक्योरिटी ऑन करो', 'सुरक्षा चालू करो'
    ]) ||
    (isSecurityEntity && isOnAction)
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

  // 5. DRIVER SAFETY / DROWSINESS INTENT DETECTION
  const isSafetyEntity = hasAny(norm, ['safety', 'drowsiness', 'driver', 'fatigue', 'sleep', 'neend', 'dms', 'नींद', 'ड्राइवर', 'सेफ्टी']);

  // SAFETY OFF
  if (
    hasAny(rawLower, [
      'driver safety off karo', 'driver safety band karo', 'disable driver safety', 'turn off driver safety',
      'drowsiness off karo', 'safety off karo', 'safety band karo', 'ड्राइवर सेफ्टी बंद करो'
    ]) ||
    (isSafetyEntity && isOffAction)
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

  // SAFETY ON
  if (
    hasAny(rawLower, [
      'driver safety on karo', 'driver safety chalu karo', 'enable driver safety', 'turn on driver safety',
      'drowsiness on karo', 'safety on karo', 'safety chalu karo', 'activate driver monitoring',
      'ड्राइवर सेफ्टी ऑन करो', 'ड्राइवर सुरक्षा चालू करो'
    ]) ||
    (isSafetyEntity && isOnAction)
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

  // 6. CAR DOORS LOCK / UNLOCK
  const isDoorOrCarEntity = hasAny(norm, ['door', 'doors', 'car', 'gaadi', 'darwaza', 'gate', 'lock', 'unlock', 'vehicle', 'ताला', 'दरवाजा', 'कार', 'गाड़ी']);

  // UNLOCK DOORS (Check unlock first)
  if (
    hasAny(rawLower, [
      'car unlock karo', 'gaadi unlock karo', 'unlock my car', 'unlock car', 'unlock the car', 'unlock doors',
      'gaadi kholo', 'car kholo', 'darwaza kholo', 'darwaze kholo', 'gate kholo', 'unlock', 'open car',
      'गाड़ी अनलॉक करो', 'कार अनलॉक करो', 'गाड़ी खोलो', 'दरवाज़ा खोलो'
    ]) ||
    (hasAny(norm, ['unlock', 'access']) && isDoorOrCarEntity) ||
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

  // LOCK DOORS
  if (
    hasAny(rawLower, [
      'car lock karo', 'gaadi lock karo', 'lock my car', 'lock car', 'lock the car', 'lock doors', 'lock all doors',
      'darwaza lock karo', 'darwaze lock karo', 'darwaza band karo', 'gate lock karo', 'lock', 'lock car please',
      'गाड़ी लॉक करो', 'कार लॉक करो', 'दरवाज़ा बंद करो', 'ताला लगाओ'
    ]) ||
    (hasAny(norm, ['lock', 'taala']) && isDoorOrCarEntity) ||
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

  // 7. WHERE IS MY CAR / FIND MY CAR
  if (
    hasAny(rawLower, [
      'where is my car', 'where is car', 'where is the car', 'find my car', 'locate my car', 'locate car',
      'gaadi kahan hai', 'car kahan hai', 'meri car kahan hai', 'meri gaadi kahan hai', 'gaadi dhundo', 'car dhundo',
      'where parked', 'car location', 'gaadi kahan par hai', 'गाड़ी कहाँ है', 'मेरी कार कहाँ है', 'गाड़ी ढूंढो'
    ]) ||
    hasAny(norm, ['kahan', 'where', 'locate', 'find', 'dhundo'])
  ) {
    return {
      understood: true,
      actionTaken: 'Located Vehicle via GPS Beacon',
      responseTextEn: `Your ${currentState.carModel} is stationed at ${locationState.address}, ${locationState.parkingBay}. Flashing locator beacon and sounding horn chime.`,
      responseTextHi: `आपकी गाड़ी ${locationState.address} में पार्क है। लोकेटर बीकन और हॉर्न सक्रिय कर दिया गया है।`,
      triggerFindMyCar: true,
      category: 'location',
      rawCommand: rawInput,
      intent: 'FIND_MY_CAR',
      confidence: 0.98
    };
  }

  // 8. CLIMATE / AC (ON & OFF)
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
      responseTextEn: `Cabin climate started. Target setpoint ${currentState.cabinTempC.toFixed(1)}°C.`,
      responseTextHi: `केबिन एसी चालू कर दिया गया है।`,
      appliedChanges: { climateOn: true },
      category: 'controls',
      rawCommand: rawInput,
      intent: 'CLIMATE_ON',
      confidence: 0.95
    };
  }

  // 9. HORN BLOW
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

  // 10. HAZARD LIGHTS (ON & OFF)
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

  // 11. TELEMETRY STATUS QUERY
  if (hasAny(norm, ['status', 'battery', 'range', 'percentage', 'charge', 'haal', 'stat', 'स्थिति', 'बैटरी', 'रेंज'])) {
    return {
      understood: true,
      actionTaken: 'Reported Vehicle Telemetry Status',
      responseTextEn: `Battery is at ${currentState.batteryPercent}%, estimated range is ${currentState.estimatedRangeKm} km. Security is ${currentState.masterSecurityArmed ? 'Armed' : 'Disarmed'}.`,
      responseTextHi: `बैटरी ${currentState.batteryPercent}% है, रेंज ${currentState.estimatedRangeKm} किमी है। सुरक्षा ${currentState.masterSecurityArmed ? 'सक्रिय' : 'निष्क्रिय'} है।`,
      category: 'controls',
      rawCommand: rawInput,
      intent: 'STATUS_QUERY',
      confidence: 0.95
    };
  }

  // 12. AMBIGUOUS INTENT CLARIFICATION HANDLING (HONEST HANDLING)
  // If user only said generic action verbs like "open", "kholo", "band karo", "close", "on karo", "off karo" without naming the target:
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

  if (rawLower === 'on karo' || rawLower === 'turn on' || rawLower === 'chalu karo') {
    return {
      understood: false,
      needsClarification: true,
      actionTaken: 'Clarification Needed: System Unspecified',
      responseTextEn: 'Which system would you like to turn on? You can turn on headlights, arm security, enable driver safety, or start climate.',
      responseTextHi: 'आप कौन सा सिस्टम चालू करना चाहते हैं? आप हेडलाइट्स चालू कर सकते हैं, सिक्योरिटी ऑन कर सकते हैं, या ड्राइवर सेफ्टी चालू कर सकते हैं।',
      category: 'controls',
      rawCommand: rawInput,
      intent: 'AMBIGUOUS_ON',
      confidence: 0.5,
      clarificationSuggestions: ['light on karo', 'security on karo', 'driver safety on karo', 'ac on karo']
    };
  }

  if (rawLower === 'off karo' || rawLower === 'turn off') {
    return {
      understood: false,
      needsClarification: true,
      actionTaken: 'Clarification Needed: System Unspecified',
      responseTextEn: 'Which system would you like to turn off? You can turn off headlights, disarm security, or disable driver safety.',
      responseTextHi: 'आप कौन सा सिस्टम बंद करना चाहते हैं? आप हेडलाइट्स बंद कर सकते हैं, सिक्योरिटी बंद कर सकते हैं, या ड्राइवर सेफ्टी बंद कर सकते हैं।',
      category: 'controls',
      rawCommand: rawInput,
      intent: 'AMBIGUOUS_OFF',
      confidence: 0.5,
      clarificationSuggestions: ['light off karo', 'security off karo', 'driver safety off karo', 'ac off karo']
    };
  }

  // 13. COMPLETELY UNRECOGNIZED / UNSUPPORTED DOMAIN (HONEST FAILURE)
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
