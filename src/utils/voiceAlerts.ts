// Voice alert engine for announcing button actions and security warnings in English & Hindi
export interface VoiceAlertMessage {
  en: string;
  hi: string;
  isEmergency?: boolean;
}

type VoiceAlertListener = (announcement: { text: string; lang: string; isEmergency?: boolean }) => void;

let listeners: VoiceAlertListener[] = [];

export function subscribeToVoiceAlerts(listener: VoiceAlertListener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

// Speak voice announcement aloud
export function playButtonVoiceAlert(
  message: VoiceAlertMessage,
  enabled = true,
  preferredLang: 'en-US' | 'hi-IN' = 'en-US'
) {
  if (!enabled) return;

  const textToSpeak = preferredLang === 'hi-IN' ? message.hi : message.en;

  // Notify visual subscribers for UI banner
  listeners.forEach(cb => cb({ text: textToSpeak, lang: preferredLang, isEmergency: message.isEmergency }));

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    // If speaking, cancel previous
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = preferredLang;
    utterance.rate = message.isEmergency ? 1.0 : 1.05;
    utterance.pitch = message.isEmergency ? 1.15 : 1.0;

    // Pick appropriate voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const langPrefix = preferredLang.slice(0, 2);
      const matchedVoice = voices.find(v => v.lang.startsWith(langPrefix) && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Female')));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Graceful fallback if speech synthesis is blocked
  }
}

// Pre-configured voice alert strings for all buttons & actions
export const VOICE_ALERTS = {
  // Master Security
  securityArmed: {
    en: 'Alert: Master car security armed. Sentry perimeter active.',
    hi: 'चेतावनी: मास्टर कार सुरक्षा सक्रिय। सेंट्री सर्विलांस चालू है।'
  },
  securityDisarmed: {
    en: 'Alert: Master car security disarmed. Perimeter standby.',
    hi: 'चेतावनी: मास्टर कार सुरक्षा निष्क्रिय कर दी गई है।'
  },

  // Driver Safety
  driverSafetyOn: {
    en: 'Alert: Driver safety monitoring activated. Eye tracking online.',
    hi: 'चेतावनी: ड्राइवर सुरक्षा निगरानी सक्रिय। आई-ट्रैकिंग चालू है।'
  },
  driverSafetyOff: {
    en: 'Alert: Driver safety monitoring disabled.',
    hi: 'चेतावनी: ड्राइवर सुरक्षा निगरानी बंद कर दी गई है।'
  },

  // Doors
  doorsLocked: {
    en: 'Alert: All vehicle doors securely locked.',
    hi: 'चेतावनी: गाड़ी के सभी दरवाज़े सुरक्षित लॉक कर दिए गए हैं।'
  },
  doorsUnlocked: {
    en: 'Alert: Vehicle doors unlocked. Access granted.',
    hi: 'चेतावनी: गाड़ी के दरवाज़े अनलॉक कर दिए गए हैं।'
  },
  doorSingle: (door: string, locked: boolean) => ({
    en: `Alert: ${door} door ${locked ? 'locked' : 'unlocked'}.`,
    hi: `चेतावनी: ${door} दरवाज़ा ${locked ? 'लॉक' : 'अनलॉक'} हुआ।`
  }),

  // Headlights
  headlightsOn: {
    en: 'Alert: Matrix LED headlights activated.',
    hi: 'चेतावनी: मैट्रिक्स एलईडी हेडलाइट्स चालू कर दी गई हैं।'
  },
  headlightsOff: {
    en: 'Alert: Matrix LED headlights turned off.',
    hi: 'चेतावनी: हेडलाइट्स बंद कर दी गई हैं।'
  },

  // Windows
  windowsOpen: {
    en: 'Alert: Power windows lowered in ventilation mode.',
    hi: 'चेतावनी: सभी खिड़कियाँ वेंटिलेशन मोड में खोल दी गई हैं।'
  },
  windowsClosed: {
    en: 'Alert: Power windows fully sealed.',
    hi: 'चेतावनी: सभी खिड़कियाँ पूरी तरह बंद कर दी गई हैं।'
  },

  // Trunk
  trunkOpen: {
    en: 'Alert: Powered trunk hatch opened.',
    hi: 'चेतावनी: पावर्ड डिक्की खोल दी गई है।'
  },
  trunkClosed: {
    en: 'Alert: Powered trunk hatch closed and latched.',
    hi: 'चेतावनी: डिक्की बंद और लॉक कर दी गई है।'
  },

  // GPS
  gpsOn: {
    en: 'Alert: GPS tracking uplink enabled. High precision active.',
    hi: 'चेतावनी: जीपीएस लाइव ट्रैकिंग चालू कर दी गई है।'
  },
  gpsOff: {
    en: 'Alert: GPS tracking uplink disabled.',
    hi: 'चेतावनी: जीपीएस ट्रैकिंग बंद कर दी गई है।'
  },

  // Locator / Map
  findMyCar: {
    en: 'Alert: Locating vehicle. Beacon flashing and acoustic horn active.',
    hi: 'चेतावनी: गाड़ी की लोकेशन खोजी जा रही है। बीकन और हॉर्न सक्रिय हैं।'
  },
  refreshLocation: {
    en: 'Alert: GPS location synchronized with satellite constellation.',
    hi: 'चेतावनी: जीपीएस लोकेशन सैटेलाइट से अपडेट कर दी गई है।'
  },

  // Emergency simulations
  simulateIntrusion: {
    en: 'Critical Security Alert! Unauthorized perimeter intrusion detected! Sounding alarm!',
    hi: 'गंभीर सुरक्षा चेतावनी! अनाधिकृत प्रवेश का प्रयास पकड़ा गया! अलार्म बज रहा है!',
    isEmergency: true
  },
  simulateImpact: {
    en: 'Critical Security Alert! Physical impact and 3.8G shock detected on rear bumper!',
    hi: 'गंभीर सुरक्षा चेतावनी! गाड़ी पर टक्कर का प्रभाव दर्ज किया गया!',
    isEmergency: true
  },
  simulateSuspicious: {
    en: 'Warning Alert: Suspicious loitering detected near driver perimeter.',
    hi: 'सावधान: गाड़ी के पास संदिग्ध व्यक्ति की गतिविधि देखी गई है।',
    isEmergency: true
  },
  simulateDrowsiness: {
    en: 'Emergency Warning! Driver drowsiness detected! Please stop safely and take a break!',
    hi: 'आपातकालीन चेतावनी! ड्राइवर को नींद आ रही है! कृपया सुरक्षित रूप से गाड़ी रोकें और आराम करें!',
    isEmergency: true
  },

  // Climate & Horn
  climateOn: {
    en: 'Alert: Cabin HVAC pre-conditioning active.',
    hi: 'चेतावनी: केबिन क्लाइमेट कंट्रोल चालू कर दिया गया है।'
  },
  climateOff: {
    en: 'Alert: Cabin climate turned off.',
    hi: 'चेतावनी: क्लाइमेट कंट्रोल बंद कर दिया गया है।'
  },
  hazardOn: {
    en: 'Alert: Emergency hazard flashers activated.',
    hi: 'चेतावनी: इमरजेंसी हैज़र्ड लाइट्स चालू कर दी गई हैं।'
  },
  hazardOff: {
    en: 'Alert: Emergency hazard flashers stopped.',
    hi: 'चेतावनी: हैज़र्ड लाइट्स बंद कर दी गई हैं।'
  },
  horn: {
    en: 'Alert: Acoustic locator horn sounded.',
    hi: 'चेतावनी: गाड़ी का हॉर्न बजाया गया।'
  },
  resetState: {
    en: 'Alert: SmartGuard AI restored to baseline prototype state.',
    hi: 'चेतावनी: सिस्टम स्टेट रीसेट कर दिया गया है।'
  }
};
