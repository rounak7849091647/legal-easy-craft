import { useState, useRef, useCallback, useEffect } from 'react';

interface OpenAITTSHook {
  isSpeaking: boolean;
  speak: (text: string, language?: string) => Promise<void>;
  stop: () => void;
  isSupported: boolean;
  isLoading: boolean;
}

// Language to voice mapping with preferred voice names for Indian languages
const INDIAN_VOICE_PREFERENCES: Record<string, string[]> = {
  'en-IN': ['Google UK English Female', 'Microsoft Heera', 'Veena', 'en-IN', 'English India'],
  'hi-IN': ['Google हिन्दी', 'Microsoft Hemant', 'Lekha', 'hi-IN', 'Hindi'],
  'hinglish': ['Google हिन्दी', 'Microsoft Hemant', 'hi-IN', 'en-IN'],
  'ta-IN': ['Google தமிழ்', 'ta-IN', 'Tamil'],
  'te-IN': ['Google తెలుగు', 'te-IN', 'Telugu'],
  'bn-IN': ['Google বাংলা', 'bn-IN', 'Bengali'],
  'mr-IN': ['Google मराठी', 'mr-IN', 'Marathi'],
  'gu-IN': ['Google ગુજરાતી', 'gu-IN', 'Gujarati'],
  'kn-IN': ['Google ಕನ್ನಡ', 'kn-IN', 'Kannada'],
  'ml-IN': ['Google മലയാളം', 'ml-IN', 'Malayalam'],
  'pa-IN': ['Google ਪੰਜਾਬੀ', 'pa-IN', 'Punjabi'],
  'or-IN': ['or-IN', 'Odia'],
  'as-IN': ['as-IN', 'Assamese'],
};

// Find the best voice for a language
const findBestVoice = (language: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  const preferences = INDIAN_VOICE_PREFERENCES[language] || INDIAN_VOICE_PREFERENCES['en-IN'];
  
  // Try to find a voice matching preferences
  for (const pref of preferences) {
    const voice = voices.find(v => 
      v.name.includes(pref) || 
      v.lang.includes(pref) ||
      v.lang.startsWith(pref.split('-')[0])
    );
    if (voice) return voice;
  }
  
  // Fallback: try to find any voice for this language
  const langCode = language.split('-')[0];
  const fallback = voices.find(v => v.lang.startsWith(langCode));
  if (fallback) return fallback;
  
  // Last resort: use default or first available
  return voices.find(v => v.default) || voices[0] || null;
};

// Enhanced browser TTS with better Indian language support
const speakWithBrowser = (text: string, language: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Browser TTS not supported'));
      return;
    }

    window.speechSynthesis.cancel();
    
    const speak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      // Find the best voice for this language
      const bestVoice = findBestVoice(language, voices);
      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang;
        console.log(`Using voice: ${bestVoice.name} (${bestVoice.lang})`);
      } else {
        // Fallback language mapping
        const langMap: Record<string, string> = {
          'en-IN': 'en-IN',
          'hi-IN': 'hi-IN',
          'hinglish': 'hi-IN',
          'ta-IN': 'ta-IN',
          'te-IN': 'te-IN',
          'bn-IN': 'bn-IN',
          'mr-IN': 'mr-IN',
          'gu-IN': 'gu-IN',
          'kn-IN': 'kn-IN',
          'ml-IN': 'ml-IN',
          'pa-IN': 'pa-IN',
          'or-IN': 'or-IN',
          'as-IN': 'as-IN',
        };
        utterance.lang = langMap[language] || 'en-IN';
      }
      
      // Optimized speech parameters for clarity
      utterance.rate = 0.95; // Slightly slower for better pronunciation
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        console.error('Speech error:', e);
        reject(e);
      };

      window.speechSynthesis.speak(utterance);
    };

    // Voices may not be loaded immediately
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      speak();
    } else {
      // Wait for voices to load
      window.speechSynthesis.onvoiceschanged = () => {
        speak();
      };
      // Timeout fallback
      setTimeout(() => {
        if (window.speechSynthesis.getVoices().length > 0) {
          speak();
        } else {
          reject(new Error('No voices available'));
        }
      }, 500);
    }
  });
};

export const useOpenAITTS = (): OpenAITTSHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isSupported = typeof window !== 'undefined' && ('Audio' in window || 'speechSynthesis' in window);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const speak = useCallback(async (text: string, language: string = 'en-IN') => {
    if (!text || !text.trim()) return;

    stop();
    setIsLoading(true);

    try {
      // For regional Indian languages, use browser TTS first (better pronunciation, no API needed)
      // Browser TTS on Android/Chrome has excellent Indian language support
      const isRegionalLanguage = language !== 'en-IN' && language !== 'hinglish';
      
      if (isRegionalLanguage && 'speechSynthesis' in window) {
        // Check if browser has a voice for this language
        const voices = window.speechSynthesis.getVoices();
        const langCode = language.split('-')[0];
        const hasVoice = voices.some(v => v.lang.startsWith(langCode));
        
        if (hasVoice) {
          console.log(`Using browser TTS for ${language} (native voice available)`);
          setIsLoading(false);
          setIsSpeaking(true);
          await speakWithBrowser(text, language);
          setIsSpeaking(false);
          return;
        }
      }

      abortControllerRef.current = new AbortController();

      // Try cloud TTS for English/Hinglish or when browser doesn't have the voice
      let response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bhashini-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, language }),
          signal: abortControllerRef.current.signal,
        }
      );

      // If Bhashini fails, try OpenAI TTS as fallback
      if (!response.ok) {
        console.log('Bhashini TTS unavailable, trying OpenAI TTS...');
        response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ text, language }),
            signal: abortControllerRef.current.signal,
          }
        );
      }

      if (!response.ok) {
        // Both APIs failed - fallback to browser TTS
        console.log('Cloud TTS unavailable, using browser fallback');
        setIsLoading(false);
        setIsSpeaking(true);
        await speakWithBrowser(text, language);
        setIsSpeaking(false);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = () => {
        console.error('Audio playback error, using browser fallback');
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        setIsSpeaking(true);
        speakWithBrowser(text, language).finally(() => setIsSpeaking(false));
      };

      setIsLoading(false);
      setIsSpeaking(true);
      
      await audio.play();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('TTS request aborted');
        setIsLoading(false);
        setIsSpeaking(false);
      } else {
        console.log('Cloud TTS error, using browser fallback:', error);
        setIsLoading(false);
        setIsSpeaking(true);
        try {
          await speakWithBrowser(text, language);
        } catch (e) {
          console.error('Browser TTS also failed:', e);
        }
        setIsSpeaking(false);
      }
    }
  }, [stop]);

  return {
    isSpeaking,
    speak,
    stop,
    isSupported,
    isLoading,
  };
};
