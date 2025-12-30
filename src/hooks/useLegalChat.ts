import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string; // Display text (always English for assistant)
  voiceContent?: string; // Voice text (in user's language for TTS)
  timestamp: Date;
  language?: string;
}

interface LegalChatHook {
  messages: Message[];
  isLoading: boolean;
  sessionId: string;
  lastLanguage: string;
  lastVoiceResponse: string;
  documentContext: string | null;
  sendMessage: (message: string, detectedLanguage?: string, documentContent?: string) => Promise<void>;
  clearMessages: () => void;
  setDocumentContext: (content: string | null) => void;
}

export const useLegalChat = (): LegalChatHook => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLanguage, setLastLanguage] = useState('en-IN');
  const [lastVoiceResponse, setLastVoiceResponse] = useState('');
  const [documentContext, setDocumentContext] = useState<string | null>(null);
  const documentContextRef = useRef<string | null>(null);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Keep ref in sync for callbacks
  const updateDocumentContext = useCallback((content: string | null) => {
    setDocumentContext(content);
    documentContextRef.current = content;
  }, []);

  const sendMessage = useCallback(async (message: string, detectedLanguage: string = 'en-IN', documentContent?: string) => {
    if (!message.trim() || isLoading) return;

    // If document content is passed, store it
    if (documentContent) {
      documentContextRef.current = documentContent;
      setDocumentContext(documentContent);
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
      language: detectedLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setLastLanguage(detectedLanguage);

    try {
      const { data, error } = await supabase.functions.invoke('legal-chat', {
        body: { 
          message: message.trim(),
          sessionId,
          detectedLanguage,
          documentContent: documentContextRef.current || undefined
        }
      });

      if (error) {
        throw error;
      }

      // Get both display (English) and voice (native language) responses
      const displayContent = data.response || 'I apologize, but I could not generate a response. Please try again.';
      const voiceContent = data.voiceResponse || displayContent;

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: displayContent,
        voiceContent: voiceContent,
        timestamp: new Date(),
        language: data.language || detectedLanguage
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLastLanguage(data.language || detectedLanguage);
      setLastVoiceResponse(voiceContent);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but there was an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setDocumentContext(null);
    documentContextRef.current = null;
  }, []);

  return {
    messages,
    isLoading,
    sessionId,
    lastLanguage,
    lastVoiceResponse,
    documentContext,
    sendMessage,
    clearMessages,
    setDocumentContext: updateDocumentContext
  };
};
