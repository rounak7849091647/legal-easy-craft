import { useState } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ChatInput = () => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Sending:', message);
      setMessage('');
    }
  };

  return (
    <div className="w-full max-w-lg">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Or type your question..."
          className="w-full px-5 py-3.5 pr-24 rounded-full bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Paperclip size={18} />
          </Button>
          <Button
            type="submit"
            size="icon"
            className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send size={16} />
          </Button>
        </div>
      </form>
      
      <p className="text-center text-xs text-muted-foreground/60 mt-3">
        Say "Hi Care" to wake me up • Hindi & English supported
      </p>
    </div>
  );
};

export default ChatInput;
