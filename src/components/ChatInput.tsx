import { useState, useEffect, forwardRef, useRef } from 'react';
import { Send, Mic, Square, Paperclip, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { toast } from 'sonner';

interface ChatInputProps {
  onSend: (message: string, documentContent?: string) => void;
  isLoading?: boolean;
  isSpeaking?: boolean;
  onVoiceTranscript?: (transcript: string, language: string) => void;
  continuousMode?: boolean;
  onContinuousModeChange?: (active: boolean) => void;
}

interface UploadedDocument {
  name: string;
  content: string;
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
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
              onSend(transcript.trim(), uploadedDoc?.content);
            }
            setMessage('');
            resetTranscript();
            lastTranscriptRef.current = '';
            // Don't stop listening - keep voice mode active
          }
        }, 2500);
      }
    }
  }, [transcript, detectedLanguage, onSend, onVoiceTranscript, resetTranscript, voiceMode, uploadedDoc]);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB for text extraction)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 2MB.');
      return;
    }

    // Supported file types
    const supportedTypes = ['text/plain', 'application/pdf', 'text/markdown', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const supportedExtensions = ['.txt', '.md', '.pdf', '.doc', '.docx'];
    
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const isSupported = supportedTypes.includes(file.type) || supportedExtensions.includes(fileExt);
    
    if (!isSupported) {
      toast.error('Unsupported file type. Please upload TXT, MD, PDF, or DOC files.');
      return;
    }

    setIsUploading(true);

    try {
      let content = '';
      
      // For text files, read directly
      if (file.type === 'text/plain' || fileExt === '.txt' || fileExt === '.md') {
        content = await file.text();
      } else {
        // For PDF/DOC, read as text (basic extraction)
        // In production, you'd use a proper parser
        content = await file.text().catch(() => '');
        if (!content) {
          // Try reading as array buffer and extract text
          const arrayBuffer = await file.arrayBuffer();
          const decoder = new TextDecoder('utf-8');
          content = decoder.decode(arrayBuffer);
          // Basic cleanup for binary garbage
          content = content.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
        }
      }

      if (!content || content.length < 10) {
        toast.error('Could not extract text from file. Try a plain text file.');
        return;
      }

      // Limit content to first 8000 characters for AI processing
      const truncatedContent = content.slice(0, 8000);
      
      setUploadedDoc({
        name: file.name,
        content: truncatedContent
      });
      
      toast.success(`Document "${file.name}" uploaded. Ask any question about it!`);
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to read file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeDocument = () => {
    setUploadedDoc(null);
    toast.info('Document removed');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
    
    if (message.trim() && !isLoading) {
      onSend(message.trim(), uploadedDoc?.content);
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
          onSend(transcript.trim(), uploadedDoc?.content);
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
    : uploadedDoc 
    ? 'Ask about the document...'
    : isLoading
    ? 'Processing...'
    : 'Type or tap mic to speak...';

  return (
    <div ref={ref} className="w-full max-w-lg mx-auto px-2 sm:px-0">
      {/* Uploaded document indicator */}
      {uploadedDoc && (
        <div className="mb-2 flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 text-sm">
          <FileText size={16} className="text-primary shrink-0" />
          <span className="text-foreground truncate flex-1">{uploadedDoc.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={removeDocument}
            className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
          >
            <X size={14} />
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`relative ${voiceMode && isSpeaking ? 'jarvis-speaking rounded-full' : ''}`}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
        />

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
          className={`w-full ${voiceMode ? 'pl-10' : 'pl-11 sm:pl-12'} py-3 sm:py-3.5 pr-24 sm:pr-28 rounded-full bg-white/10 border ${
            isSpeaking 
              ? 'border-primary/50' 
              : voiceMode 
              ? 'border-green-500/50' 
              : uploadedDoc
              ? 'border-primary/30'
              : 'border-white/30'
          } text-foreground placeholder:text-white/50 focus:outline-none focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all disabled:opacity-50 text-sm sm:text-base`}
        />

        {/* File upload button on left */}
        {!voiceMode && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isUploading}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 rounded-full"
            aria-label="Upload document"
          >
            <Paperclip size={18} className={isUploading ? 'animate-spin' : ''} />
          </Button>
        )}

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
        {uploadedDoc 
          ? '📄 Document attached • Ask questions about it'
          : voiceMode 
          ? '🎙️ Jarvis Mode ON • Continuous conversation • Tap square to stop' 
          : '📎 Attach documents • 🎙️ Tap mic for voice mode'}
      </p>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
