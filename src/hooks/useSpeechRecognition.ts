import { useState, useCallback, useRef, useEffect } from 'react';

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  detectedLanguage: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
}

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Indian language detection patterns
const detectIndianLanguage = (text: string): string => {
  // Hindi/Devanagari script
  if (/[\u0900-\u097F]/.test(text)) return 'hi-IN';
  // Tamil script
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN';
  // Telugu script
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN';
  // Kannada script
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN';
  // Malayalam script
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml-IN';
  // Bengali script
  if (/[\u0980-\u09FF]/.test(text)) return 'bn-IN';
  // Gujarati script
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu-IN';
  // Marathi uses Devanagari, detected above as Hindi
  // Punjabi/Gurmukhi script
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa-IN';
  // Odia script
  if (/[\u0B00-\u0B7F]/.test(text)) return 'or-IN';
  // Default to English (India)
  return 'en-IN';
};

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('en-IN');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();
    
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    // Use a broad language setting that works with multiple Indian languages
    recognition.lang = 'hi-IN'; // Start with Hindi which works well for multiple Indian languages

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event);
      setIsListening(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const newTranscript = finalTranscript + interimTranscript;
      if (newTranscript) {
        // Detect language from the transcript
        const detected = detectIndianLanguage(newTranscript);
        setDetectedLanguage(detected);
      }

      setTranscript(prev => prev + finalTranscript + interimTranscript);
    };

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setDetectedLanguage('en-IN');
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    detectedLanguage,
    startListening,
    stopListening,
    resetTranscript,
    isSupported
  };
};
