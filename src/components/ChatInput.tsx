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
    <div className="w-full max-w-xl md:max-w-2xl mx-auto px-2 sm:px-0">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isListening ? "Listening..." : "Type your legal question..."}
          disabled={isLoading}
          className="w-full px-5 sm:px-6 md:px-8 py-3.5 sm:py-4 md:py-5 pr-28 sm:pr-32 md:pr-36 rounded-full bg-white/10 border border-white/30 text-foreground placeholder:text-white/50 focus:outline-none focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all disabled:opacity-50 text-sm sm:text-base md:text-lg"
        />
        <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-1.5 md:gap-2">
          {isSupported && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleMicClick}
              className={`h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 ${isListening ? 'text-white animate-pulse bg-white/20' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
            >
              <Mic size={18} className="sm:hidden" />
              <Mic size={20} className="hidden sm:block md:hidden" />
              <Mic size={22} className="hidden md:block" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-white/60 hover:text-white hover:bg-white/10 hidden sm:flex"
          >
            <Paperclip size={18} className="md:hidden" />
            <Paperclip size={20} className="hidden md:block" />
          </Button>
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || isLoading}
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full bg-white text-black hover:bg-white/90 disabled:opacity-50"
          >
            <Send size={16} className="sm:hidden" />
            <Send size={18} className="hidden sm:block md:hidden" />
            <Send size={20} className="hidden md:block" />
          </Button>
        </div>
      </form>
      
      <p className="text-center text-xs sm:text-sm md:text-base text-muted-foreground/60 mt-3 sm:mt-4 px-2">
        Ask about BNS, IPC, Civil Laws, Labour Law & more
      </p>
    </div>
  );
};

export default ChatInput;
