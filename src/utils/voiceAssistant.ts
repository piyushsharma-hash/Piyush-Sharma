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
    
    // Choose clear voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith(lang.slice(0, 2)) && (v.name.includes('Natural') || v.name.includes('Google')));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech failure
  }
}

// Helper to check if string contains any of the keywords
function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some(k => text.includes(k));
}

export function parseVoiceCommand(
  rawInput: string,
  currentState: VehicleState,
  locationState: LocationState
): CommandExecutionResult {
  // Normalize string: lowercase, remove punctuation except alphanumeric and spaces
  const clean = rawInput.toLowerCase().trim().replace(/[?!.,;]/g, '');

  // 1. HEADLIGHTS OFF (Check OFF first to avoid substring conflict with "on")
  if (
    containsAny(clean, [
      'light off karo',
      'lights off karo',
      'headlight off karo',
      'headlights off karo',
      'light off',
      'lights off',
      'headlight off',
      'headlights off',
      'turn off headlight',
      'turn off headlights',
      'turn off light',
      'turn off the lights',
      'turn off lights',
      'light band karo',
      'lights band karo',
      'headlight band karo',
      'headlights band karo',
      'light band kar',
      'headlight band kar',
      'batti bujhao',
      'batti band karo',
      'batti band',
      'लाइट बंद करो',
      'हेडलाइट बंद करो',
      'बत्ती बुझाओ',
      'लाइट ऑफ करो'
    ])
  ) {
    return {
      understood: true,
      actionTaken: 'Headlights Turned OFF',
      responseTextEn: 'Matrix LED headlights turned off.',
      responseTextHi: 'हेडलाइट्स बंद कर दी गई हैं।',
      appliedChanges: { headlightsOn: false },
      category: 'controls',
      rawCommand: rawInput
    };
  }

  // 2. HEADLIGHTS ON
  if (
    containsAny(clean, [
      'light on karo',
      'lights on karo',
      'headlight on karo',
      'headlights on karo',
      'light on',
      'lights on',
      'headlight on',
      'headlights on',
      'turn on headlight',
      'turn on headlights',
      'turn on light',
      'turn on the lights',
      'turn on lights',
      'headlight jalao',
      'headlights jalao',
      'light jalao',
      'lights jalao',
      'light chalu karo',
      'lights chalu karo',
      'headlight chalu karo',
      'headlights chalu karo',
      'batti jalao',
      'batti on karo',
      'batti on',
      'high beam on',
      'high beam karo',
      'लाइट ऑन करो',
      'लाइट जलाओ',
      'हेडलाइट ऑन करो',
      'बत्ती जलाओ',
      'लाइट चालू करो'
    ])
  ) {
    return {
      understood: true,
      actionTaken: 'Headlights Turned ON',
      responseTextEn: 'Matrix LED headlights illuminated.',
      responseTextHi: 'मैट्रिक्स एलईडी हेडलाइट्स चालू कर दी गई हैं।',
      appliedChanges: { headlightsOn: true },
      category: 'controls',
      rawCommand: rawInput
    };
  }

  // 3. CAR UNLOCK (Check unlock before lock to avoid substring collision)
  if (
    containsAny(clean, [
      'unlock my car',
      'unlock the car',
      'unlock car',
      'unlock doors',
      'unlock all doors',
      'unlock',
      'car unlock karo',
      'gaadi unlock karo',
      'gadi unlock karo',
      'car unlock',
      'gaadi unlock',
      'gadi unlock',
      'gaadi kholo',
      'gadi kholo',
      'car kholo',
      'darwaza kholo',
      'darwaze kholo',
      'gate kholo',
      'unlock karo',
      'khol do gaadi',
      'गाड़ी अनलॉक करो',
      'कार अनलॉक करो',
      'गाड़ी खोलो',
      'दरवाज़ा खोलो'
    ])
  ) {
    return {
      understood: true,
      actionTaken: 'Unlocked All Vehicle Doors',
      responseTextEn: 'Vehicle doors unlocked. Access granted.',
      responseTextHi: 'गाड़ी अनलॉक कर दी गई है। सभी दरवाज़े खुल गए हैं।',
      appliedChanges: {
        doorsLocked: false,
        doorDetails: { frontLeft: false, frontRight: false, rearLeft: false, rearRight: false }
      },
      category: 'controls',
      rawCommand: rawInput
    };
  }

  // 4. CAR LOCK
  if (
    containsAny(clean, [
      'lock my car',
      'lock the car',
      'lock car',
      'lock doors',
      'lock all doors',
      'lock',
      'car lock karo',
      'gaadi lock karo',
      'gadi lock karo',
      'car lock',
      'gaadi lock',
      'gadi lock',
      'darwaza lock karo',
      'darwaze lock karo',
      'darwaza band karo',
      'darwaze band karo',
      'car ko lock karo',
      'gaadi ko lock karo',
      'lock karo',
      'band kar do',
      'ताला लगाओ',
      'गाड़ी लॉक करो',
      'कार लॉक करो',
      'दरवाज़ा बंद करो'
    ])
  ) {
    return {
      understood: true,
      actionTaken: 'Locked All Vehicle Doors',
      responseTextEn: 'All vehicle doors are now securely locked.',
      responseTextHi: 'गाड़ी के सभी दरवाज़े सुरक्षित रूप से लॉक कर दिए गए हैं।',
      appliedChanges: {
        doorsLocked: true,
        doorDetails: { frontLeft: true, frontRight: true, rearLeft: true, rearRight: true }
      },
      category: 'controls',
      rawCommand: rawInput
    };
  }

  // 5. WINDOWS OPEN ("window kholo", etc.)
  if (
    containsAny(clean, [
      'window kholo',
      'windows kholo',
      'khidki kholo',
      'khidkiyan kholo',
      'khidkiya kholo',
      'open window',
      'open windows',
      'window open karo',
      'windows open karo',
      'window open',
      'windows open',
      'roll down windows',
      'roll down window',
      'sheesha niche karo',
      'glass down karo',
      'lower windows',
      'विंडो खोलो',
      'खिड़की खोलो',
      'खिड़कियाँ खोलो'
    ])
  ) {
    return {
      understood: true,
      actionTaken: 'Opened Power Windows',
      responseTextEn: 'All power windows lowered for cabin ventilation.',
      responseTextHi: 'सभी खिड़कियाँ वेंटिलेशन के लिए खोल दी गई हैं।',
      appliedChanges: { windowsOpen: true },
      category: 'controls',
      rawCommand: rawInput
    };
  }

  // 6. WINDOWS CLOSE ("window band karo", etc.)
  if (
    containsAny(clean, [
      'window band karo',
      'windows band karo',
      'khidki band karo',
      'khidkiyan band karo',
      'khidkiya band karo',
      'close window',
      'close windows',
      'window close karo',
      'windows close karo',
      'window close',
      'windows close',
      'roll up windows',
      'roll up window',
      'sheesha upar karo',
      'glass up karo',
      'seal windows',
      'विंडो बंद करो',
      'खिड़की बंद करो',
      'खिड़कियाँ बंद करो'
    ])
  ) {
    return {
      understood: true,
      actionTaken: 'Closed Power Windows',
      responseTextEn: 'All power windows sealed and latched.',
      responseTextHi: 'सभी खिड़कियाँ पूरी तरह बंद और सील कर दी गई हैं।',
      appliedChanges: { windowsOpen: false },
      category: 'controls',
      rawCommand: rawInput
    };
  }

  // 7. TRUNK / DICKEY OPEN ("dicky kholo", "diggi kholo", etc.)
  if (
    containsAny(clean, [
      'dicky kholo',
      'dickie kholo',
      'diki kholo',
      'diggi kholo',
      'diggy kholo',
      'trunk kholo',
      'boot kholo',
      'dicky open karo',
      'diggi open karo',
      'trunk open karo',
      'dicky open',
      'diggi open',
      'trunk open',
      'open trunk',
      'open boot',
      'open dicky',
      'open dickie',
      'open diki',
      'open diggi',
      'pichhe ka gate kholo',
      'डिक्की खोलो',
      'ट्रंक खोलो',
      'डिग्गी खोलो'
    ])
  ) {
    return {
      understood: true,
      actionTaken: 'Opened Powered Trunk (Dickey)',
      responseTextEn: 'Powered trunk hatch opened.',
      responseTextHi: 'गाड़ी की डिक्की खोल दी गई है।',
      appliedChanges: { trunkOpen: true },
      category: 'controls',
      rawCommand: rawInput
    };
  }

  // 8. TRUNK / DICKEY CLOSE ("dicky band karo", "diggi band karo", etc.)
  if (
    containsAny(clean, [
      'dicky band karo',
      'dickie band karo',
      'diki band karo',
      'diggi band karo',
      'diggy band karo',
      'trunk band karo',
      'boot band karo',
      'dicky close karo',
      'diggi close karo',
      'trunk close karo',
      'dicky close',
      'diggi close',
      'trunk close',
      'close trunk',
      'close boot',
      'close dicky',
      'close dickie',
      'close diki',
      'close diggi',
      'pichhe ka gate band karo',
      'डिक्की बंद करो',
      'ट्रंक बंद करो',
      'डिग्गी बंद करो'
    ])
  ) {
    return {
      understood: true,
      actionTaken: 'Closed Powered Trunk (Dickey)',
      responseTextEn: 'Powered trunk hatch closed and latched.',
      responseTextHi: 'डिक्की बंद और सुरक्षित लॉक कर दी गई है।',
      appliedChanges: { trunkOpen: false },
      category: 'controls',
      rawCommand: rawInput
    };
  }

  // 9. SECURITY OFF / DISARM
  if (
    containsAny(clean, [
      'security off karo',
      'security band karo',
      'security deactivate karo',
      'security disarm karo',
      'security off',
      'turn off security',
      'deactivate security',
      'disarm security',
      'suraksha band karo',
      'suraksha band',
      'sentry mode off karo',
      'sentry off',
      'सिक्योरिटी ऑफ करो',
      'सुरक्षा बंद करो'
    ])
  ) {
    return {
      understood: true,
      actionTaken: 'Disarmed Master Car Security',
      responseTextEn: 'Master car security disarmed. Perimeter sentry stand down.',
      responseTextHi: 'कार सुरक्षा निष्क्रिय कर दी गई है। सेंट्री स्टैंडबाय पर है।',
      appliedChanges: { masterSecurityArmed: false },
      category: 'security',
      rawCommand: rawInput
    };
  }

  // 10. SECURITY ON / ARM ("security on karo", etc.)
  if (
    containsAny(clean, [
      'security on karo',
      'security chalu karo',
      'security activate karo',
      'security arm karo',
      'security on',
      'turn on security',
      'activate security',
      'arm security',
      'suraksha chalu karo',
      'suraksha chalu',
      'sentry mode on karo',
      'sentry mode on',
      'sentry on',
      'सिक्योरिटी ऑन करो',
      'सुरक्षा चालू करो'
    ])
  ) {
    return {
      understood: true,
      actionTaken: 'Armed Master Car Security',
      responseTextEn: 'Master car security armed. 360-degree sentry and perimeter active.',
      responseTextHi: 'मास्टर कार सुरक्षा सक्रिय कर दी गई है। 360° सेंट्री सर्विलांस चालू है।',
      appliedChanges: { masterSecurityArmed: true, doorsLocked: true },
      category: 'security',
      rawCommand: rawInput
    };
  }

  // 11. DRIVER SAFETY OFF
  if (
    containsAny(clean, [
      'driver safety off karo',
      'driver safety band karo',
      'driver safety off',
      'turn off driver safety',
      'disable driver safety',
      'drowsiness off karo',
      'safety off karo',
      'safety band karo',
      'ड्राइवर सेफ्टी बंद करो'
    ])
  ) {
    return {
      understood: true,
      actionTaken: 'Disabled Driver Safety Monitoring',
      responseTextEn: 'Driver safety monitoring disabled.',
      responseTextHi: 'ड्राइवर सुरक्षा प्रणाली बंद कर दी गई है।',
      appliedChanges: { driverSafetyActive: false },
      category: 'safety',
      rawCommand: rawInput
    };
  }

  // 12. DRIVER SAFETY ON
  if (
    containsAny(clean, [
      'driver safety on karo',
      'driver safety chalu karo',
      'driver safety on',
      'turn on driver safety',
      'enable driver safety',
      'drowsiness on karo',
      'drowsiness on',
      'safety on karo',
      'safety chalu karo',
      'ड्राइवर सेफ्टी ऑन करो',
      'ड्राइवर सुरक्षा चालू करो'
    ])
  ) {
    return {
      understood: true,
      actionTaken: 'Enabled Driver Safety Monitoring',
      responseTextEn: 'Driver Safety AI initialized. Infrared cabin eye-tracking active.',
      responseTextHi: 'ड्राइवर सुरक्षा प्रणाली सक्रिय कर दी गई है। आई-ट्रैकिंग चालू है।',
      appliedChanges: { driverSafetyActive: true },
      category: 'safety',
      rawCommand: rawInput
    };
  }

  // 13. WHERE IS MY CAR / FIND MY CAR
  if (
    containsAny(clean, [
      'where is my car',
      'where is car',
      'where is the car',
      'find my car',
      'locate my car',
      'locate car',
      'gaadi kahan hai',
      'gadi kahan hai',
      'car kahan hai',
      'meri car kahan hai',
      'meri gaadi kahan hai',
      'gaadi dhundo',
      'car dhundo',
      'gaadi kahan par hai',
      'गाड़ी कहाँ है',
      'मेरी कार कहाँ है',
      'गाड़ी ढूंढो'
    ])
  ) {
    return {
      understood: true,
      actionTaken: 'Located Vehicle via GPS Beacon',
      responseTextEn: `Your ${currentState.carModel} is parked at ${locationState.address}, ${locationState.parkingBay}. Flashing locator beacon.`,
      responseTextHi: `आपकी गाड़ी ${locationState.address} में पार्क है। लोकेटर बीकन और हॉर्न सक्रिय कर दिया गया है।`,
      triggerFindMyCar: true,
      category: 'location',
      rawCommand: rawInput
    };
  }

  // 14. CLIMATE / AC ON
  if (containsAny(clean, ['ac on karo', 'ac chalu karo', 'climate on karo', 'climate on', 'turn on ac', 'turn on climate'])) {
    return {
      understood: true,
      actionTaken: 'Turned ON Cabin Climate (AC)',
      responseTextEn: `Cabin climate started at ${currentState.cabinTempC.toFixed(1)} degrees.`,
      responseTextHi: `केबिन एसी चालू कर दिया गया है।`,
      appliedChanges: { climateOn: true },
      category: 'controls',
      rawCommand: rawInput
    };
  }

  // 15. CLIMATE / AC OFF
  if (containsAny(clean, ['ac off karo', 'ac band karo', 'climate off karo', 'climate off', 'turn off ac', 'turn off climate'])) {
    return {
      understood: true,
      actionTaken: 'Turned OFF Cabin Climate (AC)',
      responseTextEn: 'Cabin climate control turned off.',
      responseTextHi: 'केबिन एसी बंद कर दिया गया है।',
      appliedChanges: { climateOn: false },
      category: 'controls',
      rawCommand: rawInput
    };
  }

  // 16. HORN
  if (containsAny(clean, ['horn bajao', 'horn maro', 'blow horn', 'sound horn', 'horn sound', 'हॉर्न बजाओ'])) {
    return {
      understood: true,
      actionTaken: 'Sounded Locator Horn',
      responseTextEn: 'Acoustic vehicle horn sounded.',
      responseTextHi: 'गाड़ी का हॉर्न बजाया गया।',
      appliedChanges: { hornActive: true },
      category: 'controls',
      rawCommand: rawInput
    };
  }

  // 17. STATUS QUERY
  if (containsAny(clean, ['status', 'battery', 'range', 'haal kya hai', 'range kitni hai', 'battery kitni hai', 'check car'])) {
    return {
      understood: true,
      actionTaken: 'Reported Vehicle Telemetry Status',
      responseTextEn: `Battery is at ${currentState.batteryPercent}%, range is ${currentState.estimatedRangeKm} km. Security is ${currentState.masterSecurityArmed ? 'Armed' : 'Disarmed'}.`,
      responseTextHi: `बैटरी ${currentState.batteryPercent}% है, रेंज ${currentState.estimatedRangeKm} किमी है। सुरक्षा ${currentState.masterSecurityArmed ? 'सक्रिय' : 'निष्क्रिय'} है।`,
      category: 'controls',
      rawCommand: rawInput
    };
  }

  // Unrecognized command - honest error handling with concrete guidance
  return {
    understood: false,
    actionTaken: 'Command Not Recognized',
    responseTextEn: `Unrecognized command: "${rawInput}". Try saying: "light on karo", "car lock karo", "window kholo", "dicky kholo", or "security on karo".`,
    responseTextHi: `माफ़ करें, मैं "${rawInput}" समझ नहीं पाया। आप बोल सकते हैं: "light on karo", "car lock karo", "window kholo", "dicky kholo", या "security on karo"।`,
    category: 'controls',
    rawCommand: rawInput
  };
}
