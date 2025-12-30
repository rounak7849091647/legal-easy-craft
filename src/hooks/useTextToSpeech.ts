import { useState, useCallback, useRef, useEffect } from 'react';

interface TextToSpeechHook {
  isSpeaking: boolean;
  speak: (text: string, language?: string) => void;
  stop: () => void;
  isSupported: boolean;
}

// Language to voice mapping for Indian languages
const getVoiceForLanguage = (voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null => {
  // Priority: Find female voice for the specific language
  const langCode = lang.split('-')[0];
  
  // Try to find a female voice for the specific language
  const femaleVoice = voices.find(voice => 
    voice.lang.startsWith(lang) && 
    (voice.name.toLowerCase().includes('female') || 
     voice.name.toLowerCase().includes('woman') ||
     voice.name.includes('Aditi') ||
     voice.name.includes('Raveena') ||
     voice.name.includes('Priya') ||
     voice.name.includes('Lekha') ||
     voice.name.includes('Veena'))
  );
  
  if (femaleVoice) return femaleVoice;

  // Try any voice for the specific language
  const langVoice = voices.find(voice => voice.lang.startsWith(lang));
  if (langVoice) return langVoice;

  // Try any voice matching just the language code
  const codeVoice = voices.find(voice => voice.lang.startsWith(langCode));
  if (codeVoice) return codeVoice;

  // Fallback to Indian English female voice
  const indianFemale = voices.find(voice => 
    voice.lang.includes('en-IN') && 
    (voice.name.toLowerCase().includes('female') || voice.name.includes('Raveena'))
  );
  if (indianFemale) return indianFemale;

  // Any Indian voice
  const indianVoice = voices.find(voice => voice.lang.includes('IN'));
  if (indianVoice) return indianVoice;

  // Any female voice
  const anyFemale = voices.find(voice =>
    voice.name.toLowerCase().includes('female') ||
    voice.name.toLowerCase().includes('woman') ||
    voice.name.includes('Samantha') ||
    voice.name.includes('Victoria') ||
    voice.name.includes('Karen') ||
    voice.name.includes('Zira')
  );
  if (anyFemale) return anyFemale;

  return voices[0] || null;
};

export const useTextToSpeech = (): TextToSpeechHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    // Load voices immediately and on change
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const speak = useCallback((text: string, language: string = 'en-IN') => {
    if (!isSupported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Get appropriate voice for language
    const voice = getVoiceForLanguage(voices, language);
    if (voice) {
      utterance.voice = voice;
    }

    // Voice settings for a smooth, sweet voice
    utterance.lang = language;
    utterance.rate = 0.92; // Slightly slower for clarity and sweetness
    utterance.pitch = 1.1; // Slightly higher for feminine, pleasant tone
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported, voices]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    isSpeaking,
    speak,
    stop,
    isSupported
  };
};
