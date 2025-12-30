import { useState, useEffect, useRef } from 'react';
import AiOrb from './AiOrb';
import ChatInput from './ChatInput';
import ChatMessages from './ChatMessages';

import { useLegalChat } from '@/hooks/useLegalChat';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import supremeCourtBg from '@/assets/supreme-court-bg.jpg';

interface MainContentProps {
  isMobile?: boolean;
}

const MainContent = ({ isMobile = false }: MainContentProps) => {
  const { messages, isLoading, sendMessage, lastLanguage, lastVoiceResponse } = useLegalChat();
  const { isSpeaking, speak, stop } = useTextToSpeech();
  const [lastResponseLanguage, setLastResponseLanguage] = useState<string>('en-IN');
  const lastSpokenIdRef = useRef<string | null>(null);

  // Auto-speak new assistant responses (Jarvis-style)
  // Uses voiceContent (native language) for TTS, while display shows English
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage?.role === 'assistant' &&
      lastMessage.id !== lastSpokenIdRef.current &&
      !isLoading
    ) {
      setLastResponseLanguage(lastMessage.language || lastLanguage);
      lastSpokenIdRef.current = lastMessage.id;
      // Use voiceContent for TTS (native language), fallback to content
      const textToSpeak = lastMessage.voiceContent || lastMessage.content;
      if (textToSpeak) {
        speak(textToSpeak, lastMessage.language || lastLanguage);
      }
    }
  }, [messages, isLoading, lastLanguage, speak]);

  const handleVoiceTranscript = async (transcript: string, language: string) => {
    if (transcript.trim()) {
      await sendMessage(transcript, language);
    }
  };

  const handleSendMessage = async (message: string) => {
    // Stop any ongoing speech when user sends a new message
    if (isSpeaking) {
      stop();
    }
    // For typed messages, default to English
    await sendMessage(message, 'en-IN');
  };

  const hasMessages = messages.length > 0;

  return (
    <main className="flex-1 relative overflow-hidden flex flex-col h-full">
      {/* Fixed Background image with overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${supremeCourtBg})` }}
      >
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px]" />
      </div>

      {/* Content - ChatGPT style layout */}
      <div className="relative z-10 flex-1 flex flex-col h-full">
        {hasMessages ? (
          // Chat mode - messages scroll, input fixed at bottom
          <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto w-full px-4">
                <ChatMessages messages={messages} isLoading={isLoading} />
              </div>
            </div>
            <div className="sticky bottom-0 w-full bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4">
              <div className="max-w-3xl mx-auto w-full px-4">
                <ChatInput
                  onSend={handleSendMessage}
                  isLoading={isLoading}
                  isSpeaking={isSpeaking}
                  onVoiceTranscript={handleVoiceTranscript}
                />
              </div>
            </div>
          </div>
        ) : (
          // Initial orb mode - centered
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="flex flex-col items-center gap-8 md:gap-10 animate-fade-in w-full max-w-2xl">
              <AiOrb 
                onTranscript={handleVoiceTranscript}
                isProcessing={isLoading}
                responseText={lastVoiceResponse}
                responseLanguage={lastResponseLanguage}
              />
              <div className="w-full max-w-3xl">
                <ChatInput
                  onSend={handleSendMessage}
                  isLoading={isLoading}
                  isSpeaking={isSpeaking}
                  onVoiceTranscript={handleVoiceTranscript}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainContent;
