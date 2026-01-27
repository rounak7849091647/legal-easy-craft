import { useState, useRef, useCallback } from 'react';
import { prepareTextForVoice } from '@/lib/textToVoice';

interface OpenAITTSHook {
  isSpeaking: boolean;
  speak: (text: string, language?: string) => Promise<void>;
  stop: () => void;
  isSupported: boolean;
  isLoading: boolean;
}

// Priority languages that need special handling
const INDIAN_LANGUAGES = [
  'hi-IN', 'hinglish', 'ta-IN', 'te-IN', 'bn-IN', 
  'mr-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'pa-IN', 'or-IN', 'as-IN'
];

// Browser TTS fallback for when cloud services fail
const speakWithBrowserTTS = (text: string, language: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Browser TTS not supported'));
      return;
    }

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = { 'hinglish': 'hi-IN' };
    utterance.lang = langMap[language] || language;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

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
      audioRef.current.src = '';
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

  const speak = useCallback(async (rawText: string, language: string = 'en-IN') => {
    if (!rawText || !rawText.trim()) return;

    stop();
    setIsLoading(true);

    // Clean and prepare text for natural voice output
    const text = prepareTextForVoice(rawText, language);
    
    if (!text.trim()) {
      setIsLoading(false);
      return;
    }

    abortControllerRef.current = new AbortController();

    const isIndianLanguage = INDIAN_LANGUAGES.includes(language);

    try {
      // PRIMARY: Use Murf for Indian languages (working well), ElevenLabs for English
      if (isIndianLanguage) {
        console.log(`Using Murf TTS for Indian language: ${language}`);
        
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
            signal: abortControllerRef.current.signal,
          }
        );

        if (murfResponse.ok) {
          const data = await murfResponse.json();
          if (data.audioContent) {
            const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
            const audio = new Audio(audioUrl);
            audio.preload = 'auto';
            audioRef.current = audio;

            audio.onended = () => {
              setIsSpeaking(false);
              audioRef.current = null;
            };

            audio.onerror = async () => {
              console.log('Murf audio error, falling back to browser TTS');
              audioRef.current = null;
              try {
                await speakWithBrowserTTS(text, language);
              } catch (e) {
                console.error('Browser TTS also failed:', e);
              }
              setIsSpeaking(false);
            };

            setIsLoading(false);
            setIsSpeaking(true);
            await audio.play();
            return;
          }
        }
        
        // Murf failed - try ElevenLabs as fallback
        console.log('Murf failed, trying ElevenLabs as fallback');
      }
      
      // SECONDARY: Try ElevenLabs (for English or as fallback)
      console.log(`Using ElevenLabs TTS for ${language}`);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
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

      if (response.ok) {
        const data = await response.json();
        if (data.audioContent) {
          const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
          const audio = new Audio(audioUrl);
          audio.preload = 'auto';
          audioRef.current = audio;

          audio.onended = () => {
            setIsSpeaking(false);
            audioRef.current = null;
          };

          audio.onerror = async () => {
            console.log('ElevenLabs audio error, falling back to browser TTS');
            audioRef.current = null;
            try {
              await speakWithBrowserTTS(text, language);
            } catch (e) {
              console.error('Browser TTS also failed:', e);
            }
            setIsSpeaking(false);
          };

          setIsLoading(false);
          setIsSpeaking(true);
          await audio.play();
          return;
        }
      }

      // All cloud services failed - use browser TTS
      console.log(`Using browser TTS fallback for ${language}`);
      setIsLoading(false);
      setIsSpeaking(true);
      await speakWithBrowserTTS(text, language);
      setIsSpeaking(false);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('TTS request aborted');
        setIsLoading(false);
        setIsSpeaking(false);
      } else {
        console.log('TTS error, using browser fallback:', error);
        setIsLoading(false);
        setIsSpeaking(true);
        try {
          await speakWithBrowserTTS(text, language);
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
