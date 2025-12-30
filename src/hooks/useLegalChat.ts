import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  voiceContent?: string;
  timestamp: Date;
  language?: string;
  isDocumentSummary?: boolean;
}

interface LegalChatHook {
  messages: Message[];
  isLoading: boolean;
  sessionId: string;
  lastLanguage: string;
  lastVoiceResponse: string;
  documentContext: string | null;
  sendMessage: (message: string, detectedLanguage?: string, documentContent?: string) => Promise<void>;
  summarizeDocument: (documentContent: string, documentName: string, detectedLanguage?: string) => Promise<void>;
  clearMessages: () => void;
  setDocumentContext: (content: string | null) => void;
}

// Format messages for AI context - only include role and content
const formatMessagesForAI = (messages: Message[]): { role: string; content: string }[] => {
  return messages
    .filter(msg => msg.role === 'user' || msg.role === 'assistant')
    .map(msg => ({
      role: msg.role,
      content: msg.voiceContent || msg.content
    }));
};

export const useLegalChat = (): LegalChatHook => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLanguage, setLastLanguage] = useState('en-IN');
  const [lastVoiceResponse, setLastVoiceResponse] = useState('');
  const [documentContext, setDocumentContext] = useState<string | null>(null);
  const documentContextRef = useRef<string | null>(null);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const updateDocumentContext = useCallback((content: string | null) => {
    setDocumentContext(content);
    documentContextRef.current = content;
  }, []);

  // Summarize document when uploaded
  const summarizeDocument = useCallback(async (documentContent: string, documentName: string, detectedLanguage: string = 'en-IN') => {
    if (!documentContent || isLoading) return;

    // Store document context
    documentContextRef.current = documentContent;
    setDocumentContext(documentContent);

    // Add a system message indicating document upload
    const uploadMessage: Message = {
      id: `upload-${Date.now()}`,
      role: 'user',
      content: `📄 Uploaded document: **${documentName}**`,
      timestamp: new Date(),
      language: detectedLanguage
    };

    setMessages(prev => [...prev, uploadMessage]);
    setIsLoading(true);
    setLastLanguage(detectedLanguage);

    try {
      const { data, error } = await supabase.functions.invoke('legal-chat', {
        body: { 
          sessionId,
          detectedLanguage,
          documentContent,
          action: 'summarize'
        }
      });

      if (error) {
        throw error;
      }

      const summaryContent = data.response || 'Could not generate summary. You can still ask questions about the document.';

      const summaryMessage: Message = {
        id: `summary-${Date.now()}`,
        role: 'assistant',
        content: `📋 **Document Summary**\n\n${summaryContent}\n\n---\n*Ask me any questions about this document!*`,
        voiceContent: summaryContent,
        timestamp: new Date(),
        language: data.language || detectedLanguage,
        isDocumentSummary: true
      };

      setMessages(prev => [...prev, summaryMessage]);
      setLastLanguage(data.language || detectedLanguage);
      setLastVoiceResponse(summaryContent);
    } catch (error) {
      console.error('Summarization error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I could not summarize the document, but you can still ask questions about it.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId]);

  const sendMessage = useCallback(async (message: string, detectedLanguage: string = 'en-IN', documentContent?: string) => {
    if (!message.trim() || isLoading) return;

    // If document content is passed without prior summarization, store it
    if (documentContent && !documentContextRef.current) {
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

    // Get current messages before adding new one for history
    const currentMessages = [...messages];
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setLastLanguage(detectedLanguage);

    try {
      // Include conversation history for context
      const conversationHistory = formatMessagesForAI(currentMessages);
      
      const { data, error } = await supabase.functions.invoke('legal-chat', {
        body: { 
          message: message.trim(),
          sessionId,
          detectedLanguage,
          documentContent: documentContextRef.current || undefined,
          conversationHistory // Send conversation history
        }
      });

      if (error) {
        throw error;
      }

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
  }, [isLoading, sessionId, messages]);

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
    summarizeDocument,
    clearMessages,
    setDocumentContext: updateDocumentContext
  };
};
