import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TextToSpeechHook {
  isSpeaking: boolean;
  speak: (text: string, language?: string) => Promise<void>;
  stop: () => void;
  isSupported: boolean;
}

// Voice selection based on language - using a pleasant female voice
const getVoiceForLanguage = (_lang: string): string => {
  return 'shimmer';
};

export const useTextToSpeech = (): TextToSpeechHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cache last generated audio so replay is instant
  const lastKeyRef = useRef<string | null>(null);
  const lastAudioDataUriRef = useRef<string | null>(null);

  const isSupported = true;

  const stop = useCallback(() => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // ignore
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setIsSpeaking(false);
  }, []);

  const playDataUri = useCallback(async (dataUri: string) => {
    const audio = new Audio(dataUri);
    audioRef.current = audio;

    audio.onended = () => {
      setIsSpeaking(false);
      audioRef.current = null;
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      audioRef.current = null;
      toast.error('Voice playback failed', {
        description: 'Please tap the speaker button again to retry.',
      });
    };

    try {
      await audio.play();
    } catch (e) {
      setIsSpeaking(false);
      audioRef.current = null;

      // Autoplay policies may block programmatic play until the user clicks something.
      toast('Tap the speaker to hear the reply', {
        description: 'Your browser requires a user action to play audio.',
      });

      throw e;
    }
  }, []);

  const speak = useCallback(
    async (text: string, language: string = 'en-IN') => {
      if (!text?.trim()) return;

      stop();

      const voice = getVoiceForLanguage(language);
      const key = `${voice}::${language}::${text}`;

      try {
        setIsSpeaking(true);

        // Use cached audio if available
        if (lastKeyRef.current === key && lastAudioDataUriRef.current) {
          await playDataUri(lastAudioDataUriRef.current);
          return;
        }

        const { data, error } = await supabase.functions.invoke('text-to-speech', {
          body: { text, voice },
        });

        if (error) {
          throw error;
        }

        if (!data?.audioContent) {
          throw new Error('No audio content received');
        }

        const dataUri = `data:audio/mpeg;base64,${data.audioContent}`;
        lastKeyRef.current = key;
        lastAudioDataUriRef.current = dataUri;

        await playDataUri(dataUri);
      } catch (error) {
        console.error('TTS error:', error);
        setIsSpeaking(false);

        // Fallback to browser Web Speech (still useful on some devices)
        if ('speechSynthesis' in window) {
          try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language;
            utterance.rate = 0.92;
            utterance.pitch = 1.1;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
          } catch {
            // ignore
          }
        }
      }
    },
    [playDataUri, stop]
  );

  return {
    isSpeaking,
    speak,
    stop,
    isSupported,
  };
};
