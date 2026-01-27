import { useState, useCallback, useRef, useEffect } from 'react';
import { prepareTextForVoice } from '@/lib/textToVoice';

interface OpenAITTSHook {
  isSpeaking: boolean;
  speak: (text: string, language?: string) => Promise<void>;
  stop: () => void;
  isSupported: boolean;
  isLoading: boolean;
}

// Voice preferences for browser TTS (prioritized list)
const VOICE_PREFERENCES: Record<string, string[]> = {
  'hi-IN': ['Google हिन्दी', 'Microsoft Swara', 'Hindi India', 'hi-IN', 'Hindi'],
  'hinglish': ['Google हिन्दी', 'Microsoft Swara', 'Hindi India', 'hi-IN', 'Hindi'],
  'ta-IN': ['Google தமிழ்', 'Microsoft Valluvar', 'Tamil India', 'ta-IN', 'Tamil'],
  'te-IN': ['Google తెలుగు', 'Microsoft Chitra', 'Telugu India', 'te-IN', 'Telugu'],
  'bn-IN': ['Google বাংলা', 'Microsoft Tanishaa', 'Bengali India', 'bn-IN', 'Bengali'],
  'mr-IN': ['Google मराठी', 'Microsoft Aarohi', 'Marathi India', 'mr-IN', 'Marathi'],
  'gu-IN': ['Google ગુજરાતી', 'Microsoft Dhwani', 'Gujarati India', 'gu-IN', 'Gujarati'],
  'kn-IN': ['Google ಕನ್ನಡ', 'Microsoft Sapna', 'Kannada India', 'kn-IN', 'Kannada'],
  'ml-IN': ['Google മലയാളം', 'Microsoft Sobhana', 'Malayalam India', 'ml-IN', 'Malayalam'],
  'pa-IN': ['Google ਪੰਜਾਬੀ', 'Microsoft Neerja', 'Punjabi India', 'pa-IN', 'Punjabi'],
  'or-IN': ['Odia India', 'or-IN', 'Odia'],
  'as-IN': ['Assamese India', 'as-IN', 'Assamese'],
  'en-IN': ['Google UK English Female', 'Microsoft Neerja', 'Google US English', 'en-IN', 'English India'],
  'en-US': ['Google US English', 'Microsoft Zira', 'en-US', 'English'],
};

// Find best matching voice for a language
const findBestVoice = (voices: SpeechSynthesisVoice[], language: string): SpeechSynthesisVoice | null => {
  const preferences = VOICE_PREFERENCES[language] || VOICE_PREFERENCES['en-IN'];
  
  for (const pref of preferences) {
    const match = voices.find(v => 
      v.name.toLowerCase().includes(pref.toLowerCase()) ||
      v.lang.toLowerCase() === pref.toLowerCase()
    );
    if (match) return match;
  }
  
  const langCode = language.split('-')[0];
  const langMatch = voices.find(v => v.lang.startsWith(langCode));
  if (langMatch) return langMatch;
  
  const englishVoice = voices.find(v => v.lang.startsWith('en'));
  return englishVoice || voices[0] || null;
};

export const useOpenAITTS = (): OpenAITTSHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load voices on mount
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        voicesRef.current = availableVoices;
        console.log(`TTS: Loaded ${availableVoices.length} voices`);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, [isSupported]);

  const speak = useCallback(async (rawText: string, language: string = 'en-IN') => {
    if (!rawText?.trim() || !isSupported) return;

    // Stop any current speech
    window.speechSynthesis.cancel();
    setIsLoading(true);
    setIsSpeaking(false);

    const text = prepareTextForVoice(rawText, language);
    if (!text.trim()) {
      setIsLoading(false);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);

      // Find and set the best voice
      const bestVoice = findBestVoice(voicesRef.current, language);
      if (bestVoice) {
        utterance.voice = bestVoice;
        console.log(`TTS: Using ${bestVoice.name} for ${language}`);
      }

      // Set language
      const langMap: Record<string, string> = { 'hinglish': 'hi-IN' };
      utterance.lang = langMap[language] || language;

      // Natural speech settings
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsLoading(false);
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.error('TTS error:', event.error);
        setIsSpeaking(false);
        setIsLoading(false);
      };

      // Resume if paused (Chrome bug workaround)
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error('TTS error:', error);
      setIsLoading(false);
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    isSpeaking,
    speak,
    stop,
    isSupported,
    isLoading,
  };
};
