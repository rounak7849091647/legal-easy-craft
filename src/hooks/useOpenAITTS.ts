import { useState, useCallback, useRef, useEffect } from 'react';
import { prepareTextForVoice } from '@/lib/textToVoice';

interface OpenAITTSHook {
  isSpeaking: boolean;
  speak: (text: string, language?: string) => Promise<void>;
  stop: () => void;
  isSupported: boolean;
  isLoading: boolean;
}

// Indian language voice preferences (prioritized - best voices first)
const INDIAN_VOICE_PREFERENCES: Record<string, string[]> = {
  'hi-IN': [
    'Google हिन्दी', 'Microsoft Swara Online', 'Microsoft Swara', 
    'Lekha', 'Hindi India Female', 'Hindi India', 'hi-IN', 'Hindi'
  ],
  'hinglish': [
    'Google हिन्दी', 'Microsoft Swara Online', 'Microsoft Swara',
    'Lekha', 'Hindi India', 'hi-IN', 'Hindi'
  ],
  'ta-IN': [
    'Google தமிழ்', 'Microsoft Valluvar Online', 'Microsoft Valluvar',
    'Tamil India Female', 'Tamil India', 'ta-IN', 'Tamil'
  ],
  'te-IN': [
    'Google తెలుగు', 'Microsoft Chitra Online', 'Microsoft Chitra',
    'Telugu India Female', 'Telugu India', 'te-IN', 'Telugu'
  ],
  'bn-IN': [
    'Google বাংলা', 'Microsoft Tanishaa Online', 'Microsoft Tanishaa',
    'Bengali India Female', 'Bengali India', 'bn-IN', 'Bengali', 'Bangla'
  ],
  'mr-IN': [
    'Google मराठी', 'Microsoft Aarohi Online', 'Microsoft Aarohi',
    'Marathi India Female', 'Marathi India', 'mr-IN', 'Marathi'
  ],
  'gu-IN': [
    'Google ગુજરાતી', 'Microsoft Dhwani Online', 'Microsoft Dhwani',
    'Gujarati India Female', 'Gujarati India', 'gu-IN', 'Gujarati'
  ],
  'kn-IN': [
    'Google ಕನ್ನಡ', 'Microsoft Sapna Online', 'Microsoft Sapna',
    'Kannada India Female', 'Kannada India', 'kn-IN', 'Kannada'
  ],
  'ml-IN': [
    'Google മലയാളം', 'Microsoft Sobhana Online', 'Microsoft Sobhana',
    'Malayalam India Female', 'Malayalam India', 'ml-IN', 'Malayalam'
  ],
  'pa-IN': [
    'Google ਪੰਜਾਬੀ', 'Microsoft Neerja Online', 'Punjabi India Female',
    'Punjabi India', 'pa-IN', 'Punjabi'
  ],
  'or-IN': [
    'Odia India Female', 'Odia India', 'or-IN', 'Odia', 'Oriya'
  ],
  'as-IN': [
    'Assamese India Female', 'Assamese India', 'as-IN', 'Assamese',
    'Bengali India', 'bn-IN' // Fallback to Bengali (similar)
  ],
  'en-IN': [
    'Google UK English Female', 'Microsoft Ravi Online', 'Microsoft Ravi',
    'Google US English Female', 'English India', 'en-IN', 'en-GB', 'en-US'
  ],
  'en-US': [
    'Google US English Female', 'Google US English', 'Microsoft Zira',
    'en-US', 'English United States'
  ],
};

// Find the best available voice for a language
const findBestVoice = (voices: SpeechSynthesisVoice[], language: string): SpeechSynthesisVoice | null => {
  const preferences = INDIAN_VOICE_PREFERENCES[language] || INDIAN_VOICE_PREFERENCES['en-IN'];
  
  // Try exact preference matches
  for (const pref of preferences) {
    const match = voices.find(v => 
      v.name.toLowerCase().includes(pref.toLowerCase()) ||
      v.lang.toLowerCase() === pref.toLowerCase() ||
      v.lang.toLowerCase().startsWith(pref.toLowerCase().split('-')[0])
    );
    if (match) {
      return match;
    }
  }
  
  // Try matching by primary language code
  const langCode = language.split('-')[0].toLowerCase();
  const langMatch = voices.find(v => v.lang.toLowerCase().startsWith(langCode));
  if (langMatch) return langMatch;
  
  // For Indian languages, try Hindi as fallback (widely supported)
  if (['hinglish', 'mr-IN', 'gu-IN', 'pa-IN', 'or-IN', 'as-IN'].includes(language)) {
    const hindiVoice = voices.find(v => v.lang.toLowerCase().startsWith('hi'));
    if (hindiVoice) return hindiVoice;
  }
  
  // Final fallback to any English voice
  const englishVoice = voices.find(v => v.lang.toLowerCase().startsWith('en'));
  return englishVoice || voices[0] || null;
};

// Get language display name for logging
const getLanguageName = (code: string): string => {
  const names: Record<string, string> = {
    'hi-IN': 'Hindi', 'hinglish': 'Hinglish', 'ta-IN': 'Tamil',
    'te-IN': 'Telugu', 'bn-IN': 'Bengali', 'mr-IN': 'Marathi',
    'gu-IN': 'Gujarati', 'kn-IN': 'Kannada', 'ml-IN': 'Malayalam',
    'pa-IN': 'Punjabi', 'or-IN': 'Odia', 'as-IN': 'Assamese',
    'en-IN': 'English (India)', 'en-US': 'English (US)'
  };
  return names[code] || code;
};

export const useOpenAITTS = (): OpenAITTSHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        voicesRef.current = availableVoices;
        
        // Log available Indian language voices
        const indianVoices = availableVoices.filter(v => 
          v.lang.match(/^(hi|ta|te|bn|mr|gu|kn|ml|pa|or|as|en-IN)/i)
        );
        console.log(`TTS: Loaded ${availableVoices.length} voices (${indianVoices.length} Indian)`);
      }
    };

    // Load immediately and also on voiceschanged event
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    // Some browsers need a delay
    setTimeout(loadVoices, 100);
    
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setIsSpeaking(false);
    setIsLoading(false);
  }, [isSupported]);

  const speak = useCallback(async (rawText: string, language: string = 'en-IN') => {
    if (!rawText?.trim() || !isSupported) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsLoading(true);
    setIsSpeaking(false);

    // Prepare text for natural voice output
    const text = prepareTextForVoice(rawText, language);
    if (!text.trim()) {
      setIsLoading(false);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Find and set the best voice for this language
      const bestVoice = findBestVoice(voicesRef.current, language);
      if (bestVoice) {
        utterance.voice = bestVoice;
        console.log(`TTS [${getLanguageName(language)}]: Using "${bestVoice.name}" (${bestVoice.lang})`);
      } else {
        console.log(`TTS [${getLanguageName(language)}]: No specific voice found, using default`);
      }

      // Map language codes
      const langMap: Record<string, string> = { 
        'hinglish': 'hi-IN',
        'as-IN': 'bn-IN' // Assamese fallback to Bengali
      };
      utterance.lang = langMap[language] || language;

      // Optimized speech settings for Indian languages
      // Slightly slower rate for better clarity in Indian languages
      const isIndianLang = ['hi-IN', 'hinglish', 'ta-IN', 'te-IN', 'bn-IN', 
        'mr-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'pa-IN', 'or-IN', 'as-IN'].includes(language);
      
      utterance.rate = isIndianLang ? 0.85 : 0.95; // Slower for Indian languages
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Event handlers
      utterance.onstart = () => {
        setIsLoading(false);
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        // Ignore 'interrupted' errors (happens when stop() is called)
        if (event.error !== 'interrupted') {
          console.error(`TTS Error [${getLanguageName(language)}]:`, event.error);
        }
        setIsSpeaking(false);
        setIsLoading(false);
        utteranceRef.current = null;
      };

      // Chrome bug workarounds
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // Speak!
      window.speechSynthesis.speak(utterance);

      // Chrome sometimes gets stuck - force end after timeout
      const textLength = text.length;
      const estimatedDuration = Math.max(5000, textLength * 100); // ~100ms per character
      
      setTimeout(() => {
        if (utteranceRef.current === utterance && !window.speechSynthesis.speaking) {
          setIsSpeaking(false);
          setIsLoading(false);
        }
      }, estimatedDuration);

    } catch (error) {
      console.error('TTS error:', error);
      setIsLoading(false);
      setIsSpeaking(false);
    }
  }, [isSupported, stop]);

  return {
    isSpeaking,
    speak,
    stop,
    isSupported,
    isLoading,
  };
};
