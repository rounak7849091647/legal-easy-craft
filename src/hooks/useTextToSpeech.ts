import { useState, useCallback, useRef, useEffect } from 'react';
import { isMobileDevice } from './useMobileAudio';

interface TextToSpeechHook {
  isSpeaking: boolean;
  speak: (text: string, language?: string) => Promise<void>;
  stop: () => void;
  isSupported: boolean;
  isLoading: boolean;
}

// Shorter chunks for mobile reliability
const splitTextIntoChunks = (text: string, maxLength: number = 150): string[] => {
  const sentences = text.match(/[^.!?।]+[.!?।]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());

  return chunks.filter(c => c.length > 0);
};

export const useTextToSpeech = (): TextToSpeechHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const currentIndexRef = useRef(0);
  const isCancelledRef = useRef(false);
  const chunksRef = useRef<string[]>([]);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) setVoices(available);
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    // Mobile sometimes needs a delay
    const timer = setTimeout(loadVoices, 300);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      clearTimeout(timer);
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    isCancelledRef.current = true;
    chunksRef.current = [];
    currentIndexRef.current = 0;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const findBestVoice = useCallback((language: string): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;

    const effectiveLang = language === 'hinglish' ? 'hi-IN' : language;
    const langCode = effectiveLang.split('-')[0];
    
    // Find exact match first
    let voice = voices.find(v => v.lang === effectiveLang);
    
    // Then partial match
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith(langCode));
    }
    
    // English fallback
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith('en'));
    }

    return voice || voices[0] || null;
  }, [voices]);

  const speak = useCallback(
    async (text: string, language: string = 'en-IN') => {
      if (!text?.trim() || !isSupported) return;

      stop();
      isCancelledRef.current = false;
      setIsLoading(true);

      // Wait for voices (mobile needs this)
      let attempts = 0;
      while (voices.length === 0 && attempts < 15) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (isCancelledRef.current) return;

      const voice = findBestVoice(language);
      const chunks = splitTextIntoChunks(text, isMobileDevice() ? 100 : 150);
      chunksRef.current = chunks;
      
      setIsLoading(false);
      setIsSpeaking(true);
      currentIndexRef.current = 0;

      const speakNext = () => {
        if (isCancelledRef.current || currentIndexRef.current >= chunksRef.current.length) {
          setIsSpeaking(false);
          return;
        }

        const chunk = chunksRef.current[currentIndexRef.current];
        currentIndexRef.current++;

        const utterance = new SpeechSynthesisUtterance(chunk);
        
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        }
        
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onend = speakNext;
        utterance.onerror = (e) => {
          if (e.error !== 'interrupted') {
            console.error('Speech error:', e.error);
          }
          speakNext();
        };

        // Resume if paused (mobile Safari fix)
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        window.speechSynthesis.speak(utterance);
      };

      speakNext();

      // Mobile keep-alive workaround
      if (isMobileDevice()) {
        const keepAlive = setInterval(() => {
          if (!isCancelledRef.current && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          } else if (!window.speechSynthesis.speaking) {
            clearInterval(keepAlive);
          }
        }, 3000);
      }
    },
    [isSupported, stop, voices, findBestVoice]
  );

  return {
    isSpeaking,
    speak,
    stop,
    isSupported,
    isLoading,
  };
};
