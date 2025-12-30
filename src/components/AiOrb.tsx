import { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface AiOrbProps {
  onTranscript?: (transcript: string, language: string) => void;
  isProcessing?: boolean;
  responseText?: string;
  responseLanguage?: string;
}

const AiOrb = ({ onTranscript, isProcessing = false, responseText, responseLanguage = 'en-IN' }: AiOrbProps) => {
  const [isActive, setIsActive] = useState(false);
  const [continuousMode, setContinuousMode] = useState(true); // Auto-listen after speaking
  const { isListening, transcript, detectedLanguage, startListening, stopListening, resetTranscript, isSupported: speechSupported } = useSpeechRecognition();
  const { isSpeaking, speak, stop: stopSpeaking, isSupported: ttsSupported } = useTextToSpeech();
  
  // Auto-send timer ref
  const autoSendTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef<string>('');
  const hasSpokenRef = useRef<boolean>(false);
  const wasSpeakingRef = useRef<boolean>(false);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (autoSendTimerRef.current) {
        clearTimeout(autoSendTimerRef.current);
      }
    };
  }, []);

  // Auto-send after 2 seconds of pause while listening
  useEffect(() => {
    if (isListening && transcript && transcript !== lastTranscriptRef.current) {
      lastTranscriptRef.current = transcript;
      
      // Clear existing timer
      if (autoSendTimerRef.current) {
        clearTimeout(autoSendTimerRef.current);
      }
      
      // Set new timer for 2 seconds
      autoSendTimerRef.current = setTimeout(() => {
        if (transcript.trim() && onTranscript) {
          stopListening();
          setIsActive(false);
          onTranscript(transcript.trim(), detectedLanguage);
          resetTranscript();
          lastTranscriptRef.current = '';
        }
      }, 2000);
    }
  }, [transcript, isListening, onTranscript, stopListening, resetTranscript, detectedLanguage]);

  // Auto-speak response when received (Jarvis-style)
  useEffect(() => {
    if (responseText && !isProcessing && ttsSupported && !hasSpokenRef.current) {
      hasSpokenRef.current = true;
      speak(responseText, responseLanguage);
    }
    
    // Reset the spoken flag when we start processing a new message
    if (isProcessing) {
      hasSpokenRef.current = false;
    }
  }, [responseText, isProcessing, speak, ttsSupported, responseLanguage]);

  // Continuous conversation: auto-start listening when speaking ends
  useEffect(() => {
    // Track when speaking starts
    if (isSpeaking) {
      wasSpeakingRef.current = true;
    }
    
    // When speaking ends and we were speaking, auto-start listening
    if (!isSpeaking && wasSpeakingRef.current && continuousMode && speechSupported && !isProcessing) {
      wasSpeakingRef.current = false;
      // Small delay before starting to listen (gives audio time to fully stop)
      const timer = setTimeout(async () => {
        if (!isListening && !isProcessing) {
          try {
            await startListening();
            setIsActive(true);
          } catch (e) {
            console.error('Failed to auto-start listening:', e);
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, continuousMode, speechSupported, isProcessing, isListening, startListening]);

  const handleOrbClick = async () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (isListening) {
      // Manual stop - send immediately if there's a transcript
      if (autoSendTimerRef.current) {
        clearTimeout(autoSendTimerRef.current);
      }
      if (transcript.trim() && onTranscript) {
        onTranscript(transcript.trim(), detectedLanguage);
        resetTranscript();
        lastTranscriptRef.current = '';
      }
      stopListening();
      setIsActive(false);
    } else if (speechSupported) {
      await startListening();
      setIsActive(true);
    }
  };

  const displayState = isProcessing ? 'thinking' : isSpeaking ? 'speaking' : isListening ? 'listening' : 'idle';

  // Language display names
  const languageNames: Record<string, string> = {
    'hi-IN': 'हिंदी',
    'ta-IN': 'தமிழ்',
    'te-IN': 'తెలుగు',
    'kn-IN': 'ಕನ್ನಡ',
    'ml-IN': 'മലയാളം',
    'bn-IN': 'বাংলা',
    'gu-IN': 'ગુજરાતી',
    'pa-IN': 'ਪੰਜਾਬੀ',
    'mr-IN': 'मराठी',
    'or-IN': 'ଓଡ଼ିଆ',
    'en-IN': 'English'
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleOrbClick}
        disabled={isProcessing}
        className="relative group cursor-pointer disabled:cursor-wait"
      >
      {/* Outer glow ring */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          displayState !== 'idle' 
            ? 'scale-150 opacity-100' 
            : 'scale-100 opacity-60'
        } ${
          displayState === 'speaking' 
            ? 'bg-primary/40 blur-xl' 
            : displayState === 'thinking'
            ? 'bg-accent/30 blur-xl'
            : displayState === 'listening'
            ? 'bg-green-400/30 blur-xl'
            : 'bg-white/20 blur-xl'
        }`} />
        
        {/* Main orb */}
        <div className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full backdrop-blur-sm border flex items-center justify-center orb-glow orb-pulse transition-all duration-300 ${
          displayState !== 'idle' ? 'scale-110' : 'scale-100'
        } ${
          displayState === 'speaking' 
            ? 'bg-gradient-to-br from-primary/40 to-primary/20 border-primary/60' 
            : displayState === 'thinking'
            ? 'bg-gradient-to-br from-accent/30 to-accent/10 border-accent/40'
            : displayState === 'listening'
            ? 'bg-gradient-to-br from-green-400/30 to-green-400/10 border-green-400/50'
            : 'bg-gradient-to-br from-white/20 to-white/5 border-white/30'
        }`}>
          {/* Inner glow */}
          <div className={`absolute inset-4 rounded-full bg-gradient-to-br to-transparent ${
            displayState === 'speaking' 
              ? 'from-primary/30' 
              : displayState === 'thinking'
              ? 'from-accent/20'
              : displayState === 'listening'
              ? 'from-green-400/20'
              : 'from-white/20'
          }`} />
          
          {/* Waveform animation */}
          <div className="flex items-center justify-center gap-1 z-10">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all ${
                  displayState === 'speaking' ? 'bg-primary' :
                  displayState === 'listening' ? 'bg-green-400' :
                  'bg-white/80'
                } ${
                  displayState !== 'idle' ? 'waveform-bar' : 'h-1'
                }`}
                style={{ 
                  height: displayState !== 'idle' ? undefined : '4px',
                  animationDelay: `${i * 0.1}s` 
                }}
              />
            ))}
          </div>
        </div>

        {/* Hover ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/0 group-hover:border-primary/30 transition-all duration-300 scale-110" />
      </button>

      {/* Text labels */}
      <div className="text-center">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground tracking-wider">
          CARE
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          {displayState === 'thinking' && 'Thinking...'}
          {displayState === 'speaking' && 'Speaking...'}
          {displayState === 'listening' && `Listening... (${languageNames[detectedLanguage] || 'English'})`}
          {displayState === 'idle' && (speechSupported ? 'Tap to speak in any language' : 'Voice not supported')}
        </p>
      </div>

      {/* Live transcript */}
      {isListening && transcript && (
        <div className="text-center max-w-xs sm:max-w-md px-4 animate-fade-in">
          <p className="text-foreground/80 text-xs sm:text-sm italic">"{transcript}"</p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Auto-sending in 2 seconds...
          </p>
        </div>
      )}

      <p className="text-muted-foreground/70 text-xs sm:text-sm hidden sm:block">
        {isSpeaking ? 'Tap to stop' : 'Speak in Hindi, Tamil, Telugu, or any Indian language'}
      </p>
    </div>
  );
};

export default AiOrb;
