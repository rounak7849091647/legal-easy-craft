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
    name: 'English',
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
    ttsLang: 'hi-IN', // Use Hindi voice for Hinglish
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
};

export const DEFAULT_LANGUAGE = 'en-IN';

export const getLanguageByCode = (code: string): Language => {
  return SUPPORTED_LANGUAGES[code] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
};
