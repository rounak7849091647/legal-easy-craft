import { useState, useCallback, useRef, useEffect } from 'react';
import { prepareTextForVoice } from '@/lib/textToVoice';

interface OpenAITTSHook {
  isSpeaking: boolean;
  speak: (text: string, language?: string) => Promise<void>;
  stop: () => void;
  isSupported: boolean;
  isLoading: boolean;
}

// Indian languages list
const INDIAN_LANGUAGES = [
  'hi-IN', 'hinglish', 'ta-IN', 'te-IN', 'bn-IN', 
  'mr-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'pa-IN', 'or-IN', 'as-IN'
];

// Voice preferences for browser TTS fallback
const VOICE_PREFERENCES: Record<string, string[]> = {
  'hi-IN': ['Google हिन्दी', 'Microsoft Swara', 'Hindi India', 'hi-IN', 'Hindi', 'Lekha'],
  'hinglish': ['Google हिन्दी', 'Microsoft Swara', 'Hindi India', 'hi-IN', 'Hindi'],
  'ta-IN': ['Google தமிழ்', 'Microsoft Valluvar', 'Tamil India', 'ta-IN', 'Tamil'],
  'te-IN': ['Google తెలుగు', 'Microsoft Chitra', 'Telugu India', 'te-IN', 'Telugu'],
  'bn-IN': ['Google বাংলা', 'Microsoft Tanishaa', 'Bengali India', 'bn-IN', 'Bengali'],
  'mr-IN': ['Google मराठी', 'Microsoft Aarohi', 'Marathi India', 'mr-IN', 'Marathi'],
  'gu-IN': ['Google ગુજરાતી', 'Microsoft Dhwani', 'Gujarati India', 'gu-IN', 'Gujarati'],
  'kn-IN': ['Google ಕನ್ನಡ', 'Microsoft Sapna', 'Kannada India', 'kn-IN', 'Kannada'],
  'ml-IN': ['Google മലയാളം', 'Microsoft Sobhana', 'Malayalam India', 'ml-IN', 'Malayalam'],
  'pa-IN': ['Google ਪੰਜਾਬੀ', 'Punjabi India', 'pa-IN', 'Punjabi'],
  'or-IN': ['Odia India', 'or-IN', 'Odia'],
  'as-IN': ['Assamese India', 'as-IN', 'Assamese', 'Bengali'],
  'en-IN': ['Google UK English Female', 'Google US English', 'en-IN', 'English India'],
  'en-US': ['Google US English', 'Microsoft Zira', 'en-US', 'English'],
};

const findBestVoice = (voices: SpeechSynthesisVoice[], language: string): SpeechSynthesisVoice | null => {
  const preferences = VOICE_PREFERENCES[language] || VOICE_PREFERENCES['en-IN'];
  
  for (const pref of preferences) {
    const match = voices.find(v => 
      v.name.toLowerCase().includes(pref.toLowerCase()) ||
      v.lang.toLowerCase() === pref.toLowerCase()
    );
    if (match) return match;
  }
  
  // Try by language code
  const langCode = language.split('-')[0];
  const langMatch = voices.find(v => v.lang.startsWith(langCode));
  if (langMatch) return langMatch;
  
  // Fallback to English
  return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
};

// Browser TTS fallback
const speakWithBrowserTTS = (
  text: string, 
  language: string, 
  voices: SpeechSynthesisVoice[],
  onStart: () => void,
  onEnd: () => void,
  onError: () => void
): void => {
  if (!('speechSynthesis' in window)) {
    onError();
    return;
  }

  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  
  const bestVoice = findBestVoice(voices, language);
  if (bestVoice) {
    utterance.voice = bestVoice;
    console.log(`Browser TTS: Using ${bestVoice.name} for ${language}`);
  }
  
  const langMap: Record<string, string> = { 'hinglish': 'hi-IN' };
  utterance.lang = langMap[language] || language;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  utterance.onstart = onStart;
  utterance.onend = onEnd;
  utterance.onerror = onError;

  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
  
  window.speechSynthesis.speak(utterance);
};

export const useOpenAITTS = (): OpenAITTSHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const isSupported = typeof window !== 'undefined' && 
    ('speechSynthesis' in window || 'Audio' in window);

  // Load browser voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
      console.log(`Loaded ${voicesRef.current.length} browser voices`);
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const speak = useCallback(async (rawText: string, language: string = 'en-IN') => {
    if (!rawText?.trim() || !isSupported) return;

    stop();
    setIsLoading(true);

    const text = prepareTextForVoice(rawText, language);
    if (!text.trim()) {
      setIsLoading(false);
      return;
    }

    abortRef.current = new AbortController();
    const isIndianLanguage = INDIAN_LANGUAGES.includes(language);

    try {
      // For Indian languages, try Murf first (high quality)
      if (isIndianLanguage) {
        console.log(`Trying Murf TTS for ${language}...`);
        
        try {
          const murfResponse = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/murf-tts`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({ text, language }),
              signal: abortRef.current.signal,
            }
          );

          if (murfResponse.ok) {
            const data = await murfResponse.json();
            if (data.audioContent) {
              console.log(`Murf TTS success for ${language}`);
              const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
              audio.preload = 'auto';
              audioRef.current = audio;

              audio.onended = () => {
                setIsSpeaking(false);
                audioRef.current = null;
              };

              audio.onerror = () => {
                console.log('Murf audio playback failed, using browser TTS');
                audioRef.current = null;
                speakWithBrowserTTS(
                  text, language, voicesRef.current,
                  () => setIsSpeaking(true),
                  () => setIsSpeaking(false),
                  () => setIsSpeaking(false)
                );
              };

              setIsLoading(false);
              setIsSpeaking(true);
              await audio.play();
              return;
            }
          }
        } catch (murfError) {
          if ((murfError as Error).name === 'AbortError') throw murfError;
          console.log('Murf request failed:', murfError);
        }
      }

      // Fallback to browser TTS (works for all languages)
      console.log(`Using browser TTS for ${language}`);
      setIsLoading(false);
      
      speakWithBrowserTTS(
        text, language, voicesRef.current,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => {
          console.error('Browser TTS failed');
          setIsSpeaking(false);
        }
      );

    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('TTS request cancelled');
      } else {
        console.error('TTS error:', error);
        // Last resort: try browser TTS
        setIsLoading(false);
        speakWithBrowserTTS(
          text, language, voicesRef.current,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false),
          () => setIsSpeaking(false)
        );
      }
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
