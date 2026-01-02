import { useState, useRef, useCallback } from 'react';

interface OpenAITTSHook {
  isSpeaking: boolean;
  speak: (text: string, language?: string) => Promise<void>;
  stop: () => void;
  isSupported: boolean;
  isLoading: boolean;
}

// Browser TTS fallback
const speakWithBrowser = (text: string, language: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Browser TTS not supported'));
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map language codes for all supported Indian languages
    const langMap: Record<string, string> = {
      'en-IN': 'en-IN',
      'hi-IN': 'hi-IN',
      'hinglish': 'en-IN',
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
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    window.speechSynthesis.speak(utterance);
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
      abortControllerRef.current = new AbortController();

      const response = await fetch(
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

      if (!response.ok) {
        // Rate limit or other error - fallback to browser TTS
        console.log('OpenAI TTS unavailable, using browser fallback');
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
        console.log('OpenAI TTS error, using browser fallback:', error);
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
