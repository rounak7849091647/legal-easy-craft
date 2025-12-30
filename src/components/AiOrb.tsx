import { useState, useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface AiOrbProps {
  onTranscript?: (transcript: string) => void;
  isProcessing?: boolean;
  responseText?: string;
}

const AiOrb = ({ onTranscript, isProcessing = false, responseText }: AiOrbProps) => {
  const [isActive, setIsActive] = useState(false);
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported: speechSupported } = useSpeechRecognition();
  const { isSpeaking, speak, stop: stopSpeaking, isSupported: ttsSupported } = useTextToSpeech();

  // Handle transcript changes
  useEffect(() => {
    if (transcript && !isListening && onTranscript) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, onTranscript, resetTranscript]);

  // Speak response when received
  useEffect(() => {
    if (responseText && !isProcessing && ttsSupported) {
      speak(responseText);
    }
  }, [responseText, isProcessing, speak, ttsSupported]);

  const handleOrbClick = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (isListening) {
      stopListening();
      setIsActive(false);
    } else if (speechSupported) {
      startListening();
      setIsActive(true);
    }
  };

  const displayState = isProcessing ? 'thinking' : isSpeaking ? 'speaking' : isListening ? 'listening' : 'idle';

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
            ? 'bg-white/30 blur-xl' 
            : displayState === 'thinking'
            ? 'bg-white/20 blur-xl'
            : 'bg-white/20 blur-xl'
        }`} />
        
        {/* Main orb */}
        <div className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full backdrop-blur-sm border flex items-center justify-center orb-glow orb-pulse transition-all duration-300 ${
          displayState !== 'idle' ? 'scale-110' : 'scale-100'
        } ${
          displayState === 'speaking' 
            ? 'bg-gradient-to-br from-white/30 to-white/10 border-white/50' 
            : displayState === 'thinking'
            ? 'bg-gradient-to-br from-white/20 to-white/5 border-white/30'
            : 'bg-gradient-to-br from-white/20 to-white/5 border-white/30'
        }`}>
          {/* Inner glow */}
          <div className={`absolute inset-4 rounded-full bg-gradient-to-br to-transparent ${
            displayState === 'speaking' 
              ? 'from-white/30' 
              : displayState === 'thinking'
              ? 'from-white/20'
              : 'from-white/20'
          }`} />
          
          {/* Waveform animation */}
          <div className="flex items-center justify-center gap-1 z-10">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all bg-white/80 ${
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
          {displayState === 'listening' && 'Listening...'}
          {displayState === 'idle' && (speechSupported ? 'Tap to speak' : 'Voice not supported')}
        </p>
      </div>

      {/* Live transcript */}
      {isListening && transcript && (
        <div className="text-center max-w-xs sm:max-w-md px-4">
          <p className="text-foreground/80 text-xs sm:text-sm italic">"{transcript}"</p>
        </div>
      )}

      <p className="text-muted-foreground/70 text-xs sm:text-sm hidden sm:block">
        {isSpeaking ? 'Tap to stop' : 'Tap the orb to start speaking'}
      </p>
    </div>
  );
};

export default AiOrb;
