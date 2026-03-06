import { useState, useCallback, useRef } from 'react';

interface OpenAITTSHook {
  isSpeaking: boolean;
  speak: (text: string, language?: string) => Promise<void>;
  stop: () => void;
  isSupported: boolean;
  isLoading: boolean;
}

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`;

export const useOpenAITTS = (): OpenAITTSHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isSupported = typeof window !== 'undefined';

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // Also stop any browser TTS fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const speak = useCallback(
    async (text: string, language: string = 'en-IN') => {
      if (!text?.trim() || !isSupported) return;

      stop();

      try {
        setIsLoading(true);
        abortControllerRef.current = new AbortController();

        const response = await fetch(TTS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: text.substring(0, 4096), language }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            const errorData = await response.json();
            console.warn('OpenAI TTS unavailable, using browser fallback:', errorData.error);
            setIsLoading(false);
            fallbackSpeak(text, language);
            return;
          }
          throw new Error(`TTS request failed: ${response.status}`);
        }

        setIsLoading(false);

        // Response is raw audio/mpeg binary from OpenAI TTS API
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = audioUrl;
        audioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };

        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };

        audio.onplay = () => {
          setIsSpeaking(true);
        };

        try {
          await audio.play();
        } catch (playError) {
          console.warn('Autoplay blocked:', playError);
          setIsSpeaking(false);
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        console.error('OpenAI TTS error, using browser fallback:', error);
        setIsLoading(false);
        fallbackSpeak(text, language);
      }
    },
    [isSupported, stop]
  );

  return { isSpeaking, speak, stop, isSupported, isLoading };
};

// Browser TTS fallback when OpenAI API is unavailable
function fallbackSpeak(text: string, language: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.substring(0, 500));
  utterance.lang = language === 'hinglish' ? 'hi-IN' : language;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}
