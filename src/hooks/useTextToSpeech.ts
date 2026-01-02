import { useState, useCallback, useRef, useEffect } from 'react';

interface TextToSpeechHook {
  isSpeaking: boolean;
  speak: (text: string, language?: string) => Promise<void>;
  stop: () => void;
  isSupported: boolean;
  isLoading: boolean;
}

// Split text into chunks for better mobile compatibility
const splitTextIntoChunks = (text: string, maxLength: number = 200): string[] => {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
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

  return chunks;
};

export const useTextToSpeech = (): TextToSpeechHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceQueueRef = useRef<SpeechSynthesisUtterance[]>([]);
  const currentIndexRef = useRef(0);
  const isCancelledRef = useRef(false);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load voices - essential for mobile browsers
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    // Load immediately
    loadVoices();

    // Chrome loads voices asynchronously
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    // Fallback: retry loading voices
    const retryTimeout = setTimeout(loadVoices, 500);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      clearTimeout(retryTimeout);
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    isCancelledRef.current = true;
    utteranceQueueRef.current = [];
    currentIndexRef.current = 0;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const findBestVoice = useCallback((language: string): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;

    // Handle Hinglish - use Hindi voice
    const effectiveLang = language === 'hinglish' ? 'hi-IN' : language;
    const langCode = effectiveLang.split('-')[0];
    
    // Language-specific preferred voice names
    const languageVoicePreferences: Record<string, string[]> = {
      'en': ['google us', 'microsoft', 'samantha', 'karen', 'moira', 'female', 'woman'],
      'hi': ['google india', 'hindi', 'lekha', 'veena', 'microsoft', 'female'],
      'ta': ['google india', 'tamil', 'microsoft', 'female'],
      'te': ['google india', 'telugu', 'microsoft', 'female'],
    };

    const preferredNames = languageVoicePreferences[langCode] || languageVoicePreferences['en'];

    // First try: exact language match with preferred voice
    let voice = voices.find(v => {
      const isLangMatch = v.lang === effectiveLang || v.lang.startsWith(langCode);
      const isPreferred = preferredNames.some(name => 
        v.name.toLowerCase().includes(name)
      );
      return isLangMatch && isPreferred;
    });

    // Second try: any voice matching the language
    if (!voice) {
      voice = voices.find(v => v.lang === effectiveLang || v.lang.startsWith(langCode));
    }

    // Third try: Hindi fallback for Hinglish if no Hindi voice found
    if (!voice && language === 'hinglish') {
      voice = voices.find(v => v.lang.startsWith('en') && v.lang.includes('IN'));
    }

    // Fourth try: English fallback with preferred voice
    if (!voice) {
      voice = voices.find(v => {
        const isEnglish = v.lang.startsWith('en');
        const isPreferred = preferredNames.some(name => 
          v.name.toLowerCase().includes(name)
        );
        return isEnglish && isPreferred;
      });
    }

    // Last resort: any available voice
    return voice || voices[0] || null;
  }, [voices]);

  const speakChunk = useCallback((text: string, voice: SpeechSynthesisVoice | null, onEnd: () => void) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = onEnd;
    utterance.onerror = (e) => {
      console.error('Speech error:', e.error);
      onEnd();
    };

    // Mobile Safari fix
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(
    async (text: string, language: string = 'en-IN') => {
      if (!text?.trim() || !isSupported) return;

      stop();
      isCancelledRef.current = false;
      setIsLoading(true);

      // Wait for voices to load (mobile compatibility)
      let attempts = 0;
      while (voices.length === 0 && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (isCancelledRef.current) return;

      const voice = findBestVoice(language);
      const chunks = splitTextIntoChunks(text);
      
      setIsLoading(false);
      setIsSpeaking(true);
      currentIndexRef.current = 0;

      const speakNext = () => {
        if (isCancelledRef.current) {
          setIsSpeaking(false);
          return;
        }

        if (currentIndexRef.current >= chunks.length) {
          setIsSpeaking(false);
          return;
        }

        const chunk = chunks[currentIndexRef.current];
        currentIndexRef.current++;

        speakChunk(chunk, voice, speakNext);
      };

      // Start speaking
      speakNext();

      // Mobile Chrome/Safari fix: Keep synthesis active
      const keepAliveInterval = setInterval(() => {
        if (!isCancelledRef.current && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else if (!window.speechSynthesis.speaking) {
          clearInterval(keepAliveInterval);
        }
      }, 5000);

      // Cleanup interval when cancelled
      const checkCancelled = setInterval(() => {
        if (isCancelledRef.current || !window.speechSynthesis.speaking) {
          clearInterval(keepAliveInterval);
          clearInterval(checkCancelled);
        }
      }, 100);
    },
    [isSupported, stop, voices, findBestVoice, speakChunk]
  );

  return {
    isSpeaking,
    speak,
    stop,
    isSupported,
    isLoading,
  };
};
