import { useState, useCallback, useRef } from 'react';

interface TextToSpeechHook {
  isSpeaking: boolean;
  speak: (text: string, language?: string) => Promise<void>;
  stop: () => void;
  isSupported: boolean;
}

export const useTextToSpeech = (): TextToSpeechHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

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
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;
        
        // Set language based on detected language
        utterance.lang = language;
        utterance.rate = 0.95; // Slightly slower for clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to find a good voice for the language
        const voices = window.speechSynthesis.getVoices();
        const langCode = language.split('-')[0]; // e.g., 'en' from 'en-IN'
        
        // Find a voice that matches the language
        const matchingVoice = voices.find(
          (v) => v.lang.startsWith(langCode) || v.lang === language
        );
        
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

        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
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
