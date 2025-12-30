import { useState, useEffect } from 'react';
import { Paperclip, Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

const ChatInput = ({ onSend, isLoading = false }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition();

  // Update message with transcript
  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  // Send message when stopped listening and has transcript
  useEffect(() => {
    if (!isListening && transcript) {
      // User stopped speaking, could auto-send here if desired
    }
  }, [isListening, transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
      resetTranscript();
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setMessage('');
      startListening();
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-2 sm:px-0">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isListening ? "Listening..." : "Type your legal question..."}
          disabled={isLoading}
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 pr-28 sm:pr-32 rounded-full bg-white/10 border border-white/30 text-foreground placeholder:text-white/50 focus:outline-none focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all disabled:opacity-50 text-sm sm:text-base"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 sm:gap-1">
          {isSupported && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleMicClick}
              className={`h-7 w-7 sm:h-8 sm:w-8 ${isListening ? 'text-white animate-pulse bg-white/20' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
            >
              <Mic size={16} className="sm:hidden" />
              <Mic size={18} className="hidden sm:block" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 text-white/60 hover:text-white hover:bg-white/10 hidden sm:flex"
          >
            <Paperclip size={18} />
          </Button>
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || isLoading}
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white text-black hover:bg-white/90 disabled:opacity-50"
          >
            <Send size={14} className="sm:hidden" />
            <Send size={16} className="hidden sm:block" />
          </Button>
        </div>
      </form>
      
      <p className="text-center text-[10px] sm:text-xs text-muted-foreground/60 mt-2 sm:mt-3 px-2">
        Ask about BNS, IPC, Civil Laws, Labour Law & more
      </p>
    </div>
  );
};

export default ChatInput;
