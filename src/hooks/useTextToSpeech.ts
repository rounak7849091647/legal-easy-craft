import { useState, useCallback, useRef, useEffect } from 'react';

interface TextToSpeechHook {
  isSpeaking: boolean;
  speak: (text: string, language?: string) => Promise<void>;
  stop: () => void;
  isSupported: boolean;
}

export const useTextToSpeech = (): TextToSpeechHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesLoadedRef = useRef(false);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Preload voices on mount (required for some mobile browsers)
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesLoadedRef.current = true;
      }
    };

    // Load voices immediately
    loadVoices();

    // Also listen for voiceschanged event (Chrome mobile)
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    async (text: string, language: string = 'en-IN') => {
      if (!text?.trim() || !isSupported) return;

      stop();

      try {
        // Wait for voices to load (mobile compatibility)
        let attempts = 0;
        while (!voicesLoadedRef.current && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            voicesLoadedRef.current = true;
          }
          attempts++;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;
        
        // Set language based on detected language
        utterance.lang = language;
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to find a suitable voice
        const voices = window.speechSynthesis.getVoices();
        const langCode = language.split('-')[0];
        
        // Prefer female voices
        const femaleVoiceNames = ['female', 'woman', 'zira', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'veena', 'lekha', 'priya', 'heera', 'google us english', 'google uk english female'];
        
        // Find a female voice that matches the language
        const matchingVoice = voices.find(
          (v) => {
            const isLangMatch = v.lang.startsWith(langCode) || v.lang === language;
            const isFemale = femaleVoiceNames.some(name => v.name.toLowerCase().includes(name));
            return isLangMatch && isFemale;
          }
        ) || voices.find(
          (v) => v.lang.startsWith(langCode) || v.lang === language
        ) || voices[0]; // Fallback to first available voice
        
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          utteranceRef.current = null;
        };
        utterance.onerror = (e) => {
          console.error('Speech synthesis error:', e);
          setIsSpeaking(false);
          utteranceRef.current = null;
        };

        // Mobile Safari fix: Resume speech synthesis if it's paused
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);

        // Mobile Chrome/Safari fix: Keep synthesis active
        // Some mobile browsers pause synthesis when tab is backgrounded
        const keepAlive = setInterval(() => {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          } else {
            clearInterval(keepAlive);
          }
        }, 10000);

        utterance.onend = () => {
          clearInterval(keepAlive);
          setIsSpeaking(false);
          utteranceRef.current = null;
        };

      } catch (error) {
        console.error('TTS error:', error);
        setIsSpeaking(false);
      }
    },
    [isSupported, stop]
  );

  return {
    isSpeaking,
    speak,
    stop,
    isSupported,
  };
};
