export interface Language {
  code: string;
  name: string;
  nativeName: string;
  voiceNames: string[];
  ttsLang: string;
}

export const SUPPORTED_LANGUAGES: Record<string, Language> = {
  'en-IN': {
    code: 'en-IN',
    name: 'English (India)',
    nativeName: 'English',
    voiceNames: ['google', 'microsoft', 'samantha', 'karen', 'moira'],
    ttsLang: 'en-IN',
  },
  'hi-IN': {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    voiceNames: ['google', 'microsoft', 'lekha', 'veena', 'hindi'],
    ttsLang: 'hi-IN',
  },
  'hinglish': {
    code: 'hinglish',
    name: 'Hinglish',
    nativeName: 'Hinglish',
    voiceNames: ['google', 'microsoft', 'lekha', 'veena', 'hindi'],
    ttsLang: 'hi-IN',
  },
  'ta-IN': {
    code: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    voiceNames: ['google', 'microsoft', 'tamil'],
    ttsLang: 'ta-IN',
  },
  'te-IN': {
    code: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    voiceNames: ['google', 'microsoft', 'telugu'],
    ttsLang: 'te-IN',
  },
  'bn-IN': {
    code: 'bn-IN',
    name: 'Bengali',
    nativeName: 'বাংলা',
    voiceNames: ['google', 'microsoft', 'bengali'],
    ttsLang: 'bn-IN',
  },
  'mr-IN': {
    code: 'mr-IN',
    name: 'Marathi',
    nativeName: 'मराठी',
    voiceNames: ['google', 'microsoft', 'marathi'],
    ttsLang: 'mr-IN',
  },
  'gu-IN': {
    code: 'gu-IN',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    voiceNames: ['google', 'microsoft', 'gujarati'],
    ttsLang: 'gu-IN',
  },
  'kn-IN': {
    code: 'kn-IN',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    voiceNames: ['google', 'microsoft', 'kannada'],
    ttsLang: 'kn-IN',
  },
  'ml-IN': {
    code: 'ml-IN',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    voiceNames: ['google', 'microsoft', 'malayalam'],
    ttsLang: 'ml-IN',
  },
  'pa-IN': {
    code: 'pa-IN',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    voiceNames: ['google', 'microsoft', 'punjabi'],
    ttsLang: 'pa-IN',
  },
  'or-IN': {
    code: 'or-IN',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    voiceNames: ['google', 'microsoft', 'odia'],
    ttsLang: 'or-IN',
  },
  'as-IN': {
    code: 'as-IN',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    voiceNames: ['google', 'microsoft', 'assamese'],
    ttsLang: 'as-IN',
  },
};

export const DEFAULT_LANGUAGE = 'en-IN';

export const getLanguageByCode = (code: string): Language => {
  return SUPPORTED_LANGUAGES[code] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
};
