import { useState, useCallback, useRef, useEffect } from 'react';

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  detectedLanguage: string;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
  error: string | null;
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
  onerror: ((this: SpeechRecognition, ev: Event & { error: string }) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Indian language detection patterns - supports mixed Hindi+English (Hinglish)
const detectIndianLanguage = (text: string): string => {
  // Count Devanagari characters for Hindi detection
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const latinCount = (text.match(/[a-zA-Z]/g) || []).length;
  
  // If mostly Devanagari, it's Hindi
  if (devanagariCount > 0 && devanagariCount >= latinCount * 0.3) {
    return 'hi-IN'; // Hindi (works for Hinglish too)
  }
  
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
  // Punjabi/Gurmukhi script
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa-IN';
  // Odia script
  if (/[\u0B00-\u0B7F]/.test(text)) return 'or-IN';
  
  // Default to English (India) for pure English or Romanized Hindi
  return 'en-IN';
};

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('en-IN');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Cleanup media stream
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Request microphone permission - mobile compatible
  const requestMicrophonePermission = async (): Promise<void> => {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      const msg = 'Microphone requires HTTPS. Open the site over https:// (not http://).';
      setError(msg);
      throw new Error(msg);
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      const msg = 'Microphone not supported in this browser.';
      setError(msg);
      throw new Error(msg);
    }

    try {
      // Use simpler audio constraints for better mobile compatibility
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      streamRef.current = stream;
    } catch (err) {
      console.error('Microphone permission denied:', err);
      const msg = 'Microphone access denied. Please allow microphone access in your browser settings.';
      setError(msg);
      throw new Error(msg);
    }
  };

  useEffect(() => {
    return () => {
      cleanupStream();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [cleanupStream]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      const msg = 'Speech recognition not supported in this browser.';
      setError(msg);
      throw new Error(msg);
    }

    setError(null);

    try {
      // On desktop, Web Speech API handles mic access internally
      // Only request explicit permission on mobile where it may be needed
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        await requestMicrophonePermission();
      }

      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      
      const recognition = recognitionRef.current;
      
      // Mobile-optimized settings
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Use Indian English for better recognition

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onend = () => {
        setIsListening(false);
        cleanupStream();
      };

      recognition.onerror = (event: Event & { error: string }) => {
        console.error('Speech recognition error:', event.error);
        
        // Handle specific errors
        switch (event.error) {
          case 'not-allowed':
          case 'permission-denied':
            setError('Microphone access denied');
            break;
          case 'no-speech':
            // Not an error, just no speech detected
            break;
          case 'network':
            setError('Network error. Check your connection.');
            break;
          case 'audio-capture':
            setError('No microphone found or access denied');
            break;
          case 'aborted':
            // User or system aborted, not an error
            break;
          default:
            setError(`Speech error: ${event.error}`);
        }
        
        setIsListening(false);
        cleanupStream();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let fullTranscript = '';

        // Build complete transcript from all results
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          fullTranscript += result[0].transcript;
        }

        if (fullTranscript) {
          const detected = detectIndianLanguage(fullTranscript);
          setDetectedLanguage(detected);
        }

        setTranscript(fullTranscript);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      const msg = err instanceof Error ? err.message : 'Failed to start voice input';
      setError(msg);
      cleanupStream();
      throw new Error(msg);
    }
  }, [isSupported, cleanupStream]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors when stopping
      }
    }
    cleanupStream();
    setIsListening(false);
  }, [cleanupStream]);

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
    isSupported,
    error
  };
};
