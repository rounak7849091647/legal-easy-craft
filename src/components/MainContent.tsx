import { useState, useEffect } from 'react';
import AiOrb from './AiOrb';
import ChatInput from './ChatInput';
import ChatMessages from './ChatMessages';
import { Button } from '@/components/ui/button';
import { useLegalChat } from '@/hooks/useLegalChat';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import supremeCourtBg from '@/assets/supreme-court-bg.jpg';

interface MainContentProps {
  onLoginClick?: () => void;
}

const MainContent = ({ onLoginClick }: MainContentProps) => {
  const { messages, isLoading, sendMessage } = useLegalChat();
  const { speak } = useTextToSpeech();
  const [lastResponse, setLastResponse] = useState<string>('');

  // Track last assistant response for TTS
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && lastMessage.content !== lastResponse) {
      setLastResponse(lastMessage.content);
    }
  }, [messages, lastResponse]);

  const handleVoiceTranscript = async (transcript: string) => {
    if (transcript.trim()) {
      await sendMessage(transcript);
    }
  };

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  const hasMessages = messages.length > 0;

  return (
    <main className="flex-1 relative overflow-hidden flex flex-col">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${supremeCourtBg})` }}
      >
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px]" />
      </div>

      {/* Login button */}
      <div className="absolute top-4 right-4 z-20">
        <Button 
          variant="outline" 
          onClick={onLoginClick}
          className="bg-muted/50 border-border/50 text-foreground hover:bg-muted"
        >
          Login
        </Button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        {hasMessages ? (
          // Chat mode
          <div className="flex-1 w-full max-w-3xl flex flex-col">
            <ChatMessages messages={messages} isLoading={isLoading} />
            <div className="py-4">
              <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            </div>
          </div>
        ) : (
          // Initial orb mode
          <div className="flex flex-col items-center gap-8 animate-fade-in">
            <AiOrb 
              onTranscript={handleVoiceTranscript}
              isProcessing={isLoading}
              responseText={lastResponse}
            />
            <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
          </div>
        )}
      </div>
    </main>
  );
};

export default MainContent;
