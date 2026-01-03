import { useState, useRef, useCallback } from 'react';
import { prepareTextForVoice } from '@/lib/textToVoice';

interface OpenAITTSHook {
  isSpeaking: boolean;
  speak: (text: string, language?: string) => Promise<void>;
  stop: () => void;
  isSupported: boolean;
  isLoading: boolean;
}

// Priority languages that MUST use Bhashini (native Indian voices)
const BHASHINI_PRIORITY_LANGUAGES = [
  'hi-IN', 'hinglish', 'ta-IN', 'te-IN', 'bn-IN', 
  'mr-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'pa-IN', 'or-IN', 'as-IN'
];

// Preferred Indian female voices for browser TTS fallback
// These voices are available on Android/Chrome and sound natural for Indian languages
const INDIAN_FEMALE_VOICE_PREFERENCES: Record<string, string[]> = {
  'en-IN': ['Microsoft Heera', 'Google India English Female', 'Heera', 'Veena', 'en-IN-Standard-A'],
  'hi-IN': ['Microsoft Kalpana', 'Google हिन्दी', 'Kalpana', 'Lekha', 'hi-IN-Wavenet-A', 'hi-IN-Standard-A'],
  'hinglish': ['Microsoft Kalpana', 'Google हिन्दी', 'Kalpana', 'hi-IN-Wavenet-A'],
  'ta-IN': ['Google தமிழ்', 'ta-IN-Wavenet-A', 'ta-IN-Standard-A', 'Tamil Female'],
  'te-IN': ['Google తెలుగు', 'te-IN-Wavenet-A', 'te-IN-Standard-A', 'Telugu Female'],
  'bn-IN': ['Google বাংলা', 'bn-IN-Wavenet-A', 'bn-IN-Standard-A', 'Bengali Female'],
  'mr-IN': ['Google मराठी', 'mr-IN-Wavenet-A', 'mr-IN-Standard-A', 'Marathi Female'],
  'gu-IN': ['Google ગુજરાતી', 'gu-IN-Wavenet-A', 'gu-IN-Standard-A', 'Gujarati Female'],
  'kn-IN': ['Google ಕನ್ನಡ', 'kn-IN-Wavenet-A', 'kn-IN-Standard-A', 'Kannada Female'],
  'ml-IN': ['Google മലയാളം', 'ml-IN-Wavenet-A', 'ml-IN-Standard-A', 'Malayalam Female'],
  'pa-IN': ['Google ਪੰਜਾਬੀ', 'pa-IN-Wavenet-A', 'pa-IN-Standard-A', 'Punjabi Female'],
  'or-IN': ['or-IN-Standard-A', 'Odia Female'],
  'as-IN': ['as-IN-Standard-A', 'Assamese Female'],
};

// Find the best FEMALE Indian voice for natural pronunciation
const findBestIndianVoice = (language: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  const preferences = INDIAN_FEMALE_VOICE_PREFERENCES[language] || INDIAN_FEMALE_VOICE_PREFERENCES['en-IN'];
  const langCode = language === 'hinglish' ? 'hi' : language.split('-')[0];
  
  // First priority: Find exact match from preferences (female voices)
  for (const pref of preferences) {
    const voice = voices.find(v => 
      v.name.toLowerCase().includes(pref.toLowerCase()) ||
      v.name.includes(pref)
    );
    if (voice) {
      console.log(`Found preferred Indian voice: ${voice.name}`);
      return voice;
    }
  }
  
  // Second priority: Find any female voice for this language
  const femaleVoice = voices.find(v => 
    v.lang.startsWith(langCode) && 
    (v.name.toLowerCase().includes('female') || 
     v.name.toLowerCase().includes('woman') ||
     !v.name.toLowerCase().includes('male'))
  );
  if (femaleVoice) {
    console.log(`Found female voice for ${language}: ${femaleVoice.name}`);
    return femaleVoice;
  }
  
  // Third priority: Any voice for this language
  const anyVoice = voices.find(v => v.lang.startsWith(langCode));
  if (anyVoice) {
    console.log(`Using any available voice for ${language}: ${anyVoice.name}`);
    return anyVoice;
  }
  
  // Last resort for Hindi/Hinglish: try en-IN as pronunciation is similar
  if (language === 'hi-IN' || language === 'hinglish') {
    const englishIndiaVoice = voices.find(v => v.lang === 'en-IN');
    if (englishIndiaVoice) return englishIndiaVoice;
  }
  
  return null;
};

// Browser TTS with optimized settings for Indian regional languages
const speakWithBrowserTTS = (text: string, language: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Browser TTS not supported'));
      return;
    }

    window.speechSynthesis.cancel();
    
    const speak = () => {
      const voices = window.speechSynthesis.getVoices();
      const voice = findBestIndianVoice(language, voices);
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        // Set language code directly
        const langMap: Record<string, string> = {
          'hinglish': 'hi-IN',
        };
        utterance.lang = langMap[language] || language;
      }
      
      // Optimized speech parameters for natural Indian pronunciation
      // Slower rate for better clarity and proper word pronunciation
      const isRegionalLanguage = BHASHINI_PRIORITY_LANGUAGES.includes(language);
      utterance.rate = isRegionalLanguage ? 0.85 : 0.9; // Even slower for regional languages
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        console.error('Browser TTS error:', e);
        reject(e);
      };

      window.speechSynthesis.speak(utterance);
    };

    // Wait for voices to load
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      speak();
    } else {
      const onVoicesChanged = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        speak();
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      
      // Timeout fallback
      setTimeout(() => {
        if (window.speechSynthesis.getVoices().length > 0) {
          speak();
        } else {
          reject(new Error('No voices available'));
        }
      }, 1000);
    }
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

    const isRegionalLanguage = BHASHINI_PRIORITY_LANGUAGES.includes(language);
    abortControllerRef.current = new AbortController();

    try {
      // STRATEGY: For Indian regional languages, ALWAYS try Bhashini first
      // Bhashini has native Indian voices that sound natural and pronounce correctly
      
      if (isRegionalLanguage) {
        console.log(`Using Bhashini TTS for ${language} (native Indian voice)`);
        
        const bhashiniResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bhashini-tts`,
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

        if (bhashiniResponse.ok) {
          const contentType = bhashiniResponse.headers.get('content-type') || '';
          
          if (contentType.includes('audio')) {
            const audioBlob = await bhashiniResponse.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
              setIsSpeaking(false);
              URL.revokeObjectURL(audioUrl);
              audioRef.current = null;
            };

            audio.onerror = async () => {
              console.log('Bhashini audio error, falling back to browser TTS');
              URL.revokeObjectURL(audioUrl);
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
        
        // Bhashini failed - try ElevenLabs for Hindi/Telugu/Tamil (premium voices)
        const premiumLanguages = ['hi-IN', 'hinglish', 'te-IN', 'ta-IN'];
        if (premiumLanguages.includes(language)) {
          console.log(`Trying ElevenLabs for ${language}`);
          
          try {
            const elevenLabsResponse = await fetch(
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

            if (elevenLabsResponse.ok) {
              const data = await elevenLabsResponse.json();
              if (data.audioContent) {
                const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
                const audio = new Audio(audioUrl);
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
          } catch (e) {
            console.log('ElevenLabs unavailable:', e);
          }
        }
        
        // All cloud services failed - use browser TTS as last resort
        console.log(`Using browser TTS fallback for ${language}`);
        setIsLoading(false);
        setIsSpeaking(true);
        await speakWithBrowserTTS(text, language);
        setIsSpeaking(false);
        return;
      }

      // For English (en-IN), use ElevenLabs (OpenAI quota exceeded)
      console.log(`Using ElevenLabs for English: ${language}`);
      
      try {
        const elevenLabsResponse = await fetch(
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

        if (elevenLabsResponse.ok) {
          const data = await elevenLabsResponse.json();
          if (data.audioContent) {
            const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
            const audio = new Audio(audioUrl);
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
      } catch (e) {
        console.log('ElevenLabs unavailable for English:', e);
      }

      // ElevenLabs failed - use browser TTS
      console.log('Using browser TTS fallback for English');
      setIsLoading(false);
      setIsSpeaking(true);
      try {
        await speakWithBrowserTTS(text, language);
      } catch (e) {
        console.error('Browser TTS also failed:', e);
      }
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
