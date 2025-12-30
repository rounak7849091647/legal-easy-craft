import { useState, useEffect, forwardRef, useRef } from 'react';
import { Send, Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  isSpeaking?: boolean;
  onVoiceTranscript?: (transcript: string, language: string) => void;
  continuousMode?: boolean;
  onContinuousModeChange?: (active: boolean) => void;
}

const ChatInput = forwardRef<HTMLDivElement, ChatInputProps>(({
  onSend,
  isLoading = false,
  isSpeaking = false,
  onVoiceTranscript,
  continuousMode = false,
  onContinuousModeChange,
}, ref) => {
  const [message, setMessage] = useState('');
  const [voiceMode, setVoiceMode] = useState(false);
  const { isListening, transcript, detectedLanguage, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition();
  const autoSendTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef<string>('');
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wasSpeakingRef = useRef<boolean>(false);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    };
  }, []);

  // Update message with transcript and auto-send after pause
  useEffect(() => {
    if (transcript && voiceMode) {
      setMessage(transcript);
      
      // Auto-send after 2.5 seconds of pause
      if (transcript !== lastTranscriptRef.current) {
        lastTranscriptRef.current = transcript;
        
        if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
        
        autoSendTimerRef.current = setTimeout(() => {
          if (transcript.trim()) {
            // Send the message
            if (onVoiceTranscript) {
              onVoiceTranscript(transcript.trim(), detectedLanguage);
            } else {
              onSend(transcript.trim());
            }
            setMessage('');
            resetTranscript();
            lastTranscriptRef.current = '';
            // Don't stop listening - keep voice mode active
          }
        }, 2500);
      }
    }
  }, [transcript, detectedLanguage, onSend, onVoiceTranscript, resetTranscript, voiceMode]);

  // Restart listening when it stops (browser auto-stops after silence)
  // Only if voiceMode is active and not currently speaking
  useEffect(() => {
    if (voiceMode && !isListening && isSupported && !isSpeaking && !isLoading) {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      
      restartTimerRef.current = setTimeout(async () => {
        if (voiceMode && !isSpeaking && !isLoading) {
          try {
            await startListening();
          } catch (e) {
            console.log('Auto-restart blocked, user interaction needed');
          }
        }
      }, 300);
    }
    
    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    };
  }, [isListening, voiceMode, isSupported, startListening, isSpeaking, isLoading]);

  // Jarvis-style: Auto-resume listening after AI finishes speaking
  useEffect(() => {
    if (isSpeaking) {
      wasSpeakingRef.current = true;
      // Pause listening while AI is speaking
      if (isListening) {
        stopListening();
      }
    }
    
    // When AI stops speaking and we were in voice mode, resume listening
    if (!isSpeaking && wasSpeakingRef.current && voiceMode && isSupported && !isLoading) {
      wasSpeakingRef.current = false;
      
      // Small delay to let audio fully stop
      const timer = setTimeout(async () => {
        if (voiceMode && !isListening && !isLoading) {
          try {
            await startListening();
          } catch (e) {
            console.log('Failed to auto-resume listening:', e);
          }
        }
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, voiceMode, isSupported, isLoading, isListening, startListening, stopListening]);

  // Notify parent about voice mode changes
  useEffect(() => {
    onContinuousModeChange?.(voiceMode);
  }, [voiceMode, onContinuousModeChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
    
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
      resetTranscript();
      lastTranscriptRef.current = '';
    }
  };

  const handleMicClick = async () => {
    if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    
    if (voiceMode) {
      // Turn off voice mode
      setVoiceMode(false);
      stopListening();
      
      // Send any pending transcript
      if (transcript.trim()) {
        if (onVoiceTranscript) {
          onVoiceTranscript(transcript.trim(), detectedLanguage);
        } else {
          onSend(transcript.trim());
        }
      }
      setMessage('');
      resetTranscript();
      lastTranscriptRef.current = '';
    } else {
      // Turn on voice mode
      setVoiceMode(true);
      resetTranscript();
      setMessage('');
      lastTranscriptRef.current = '';
      try {
        await startListening();
      } catch (error) {
        console.error('Failed to start listening:', error);
        setVoiceMode(false);
      }
    }
  };

  const placeholder = voiceMode
    ? (isSpeaking ? 'AI speaking...' : isListening ? 'Listening...' : isLoading ? 'Processing...' : 'Ready to listen')
    : isLoading
    ? 'Processing...'
    : 'Type or tap mic to speak...';

  return (
    <div ref={ref} className="w-full max-w-lg mx-auto px-2 sm:px-0">
      <form onSubmit={handleSubmit} className={`relative ${voiceMode && isSpeaking ? 'jarvis-speaking rounded-full' : ''}`}>
        {/* Voice mode indicator */}
        {voiceMode && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-0.5 rounded-full transition-all ${
                    isSpeaking 
                      ? 'bg-primary waveform-bar' 
                      : isListening 
                      ? 'bg-green-500 waveform-bar' 
                      : 'bg-muted-foreground/50 h-2'
                  }`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading || isSpeaking}
          className={`w-full ${voiceMode ? 'pl-10' : 'px-4 sm:px-5'} py-3 sm:py-3.5 pr-24 sm:pr-28 rounded-full bg-white/10 border ${
            isSpeaking 
              ? 'border-primary/50' 
              : voiceMode 
              ? 'border-green-500/50' 
              : 'border-white/30'
          } text-foreground placeholder:text-white/50 focus:outline-none focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all disabled:opacity-50 text-sm sm:text-base`}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 sm:gap-1">
          {isSupported && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleMicClick}
              className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-all ${
                voiceMode 
                  ? isSpeaking 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-green-500 text-white hover:bg-green-600' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              aria-label={voiceMode ? 'Stop voice mode' : 'Start voice mode'}
            >
              {voiceMode ? (
                <Square size={14} className="fill-current" />
              ) : (
                <Mic size={18} />
              )}
            </Button>
          )}
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || isLoading}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white text-black hover:bg-white/90 disabled:opacity-50"
            aria-label="Send message"
          >
            <Send size={16} />
          </Button>
        </div>
      </form>
      
      {voiceMode && (
        <p className={`text-center text-xs mt-2 ${
          isSpeaking ? 'text-primary' : isListening ? 'text-green-400 animate-pulse' : 'text-muted-foreground'
        }`}>
          {isSpeaking ? 'AI speaking... will resume listening after' : 
           isListening && transcript ? 'Auto-sending after pause...' :
           isListening ? 'Listening...' : 
           isLoading ? 'Processing...' : 'Ready'}
        </p>
      )}
      
      <p className="text-center text-[10px] sm:text-xs text-muted-foreground/60 mt-2 sm:mt-3 px-2">
        {voiceMode ? '🎙️ Jarvis Mode ON • Continuous conversation • Tap square to stop' : 'Tap mic for Jarvis-style voice mode'}
      </p>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
