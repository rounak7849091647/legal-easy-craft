import { useState, useRef, useCallback, useEffect } from 'react';

interface InactivityPromptState {
  promptIndex: number; // 0 = none, 1 = "Are you there?", 2 = "Need more assistance?", 3 = "Need more help?"
  isWaitingForResponse: boolean;
}

const INACTIVITY_PROMPTS = [
  "Are you there?",
  "Do you need any more assistance?",
  "Do you need any more help?"
];

const INACTIVITY_TIMEOUT = 60000; // 60 seconds
const PROMPT_RESPONSE_TIMEOUT = 15000; // 15 seconds to respond to each prompt

interface UseInactivityPromptOptions {
  onPrompt: (message: string) => void;
  onClose: () => void;
  isActive: boolean; // voice mode is active
  isListening: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
}

export const useInactivityPrompt = ({
  onPrompt,
  onClose,
  isActive,
  isListening,
  isSpeaking,
  isLoading
}: UseInactivityPromptOptions) => {
  const [state, setState] = useState<InactivityPromptState>({
    promptIndex: 0,
    isWaitingForResponse: false
  });
  
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const promptTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // Reset prompt state
    setState({ promptIndex: 0, isWaitingForResponse: false });
    
    // Clear existing timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (promptTimerRef.current) {
      clearTimeout(promptTimerRef.current);
      promptTimerRef.current = null;
    }
    
    // Only set new timer if voice mode is active and not loading/speaking
    if (isActive && !isSpeaking && !isLoading) {
      inactivityTimerRef.current = setTimeout(() => {
        // Start the prompt sequence
        triggerNextPrompt(0);
      }, INACTIVITY_TIMEOUT);
    }
  }, [isActive, isSpeaking, isLoading]);

  // Trigger the next prompt in sequence
  const triggerNextPrompt = useCallback((currentIndex: number) => {
    if (currentIndex >= INACTIVITY_PROMPTS.length) {
      // All prompts exhausted, close mic
      console.log('No response after all prompts, closing voice mode');
      onClose();
      setState({ promptIndex: 0, isWaitingForResponse: false });
      return;
    }

    const prompt = INACTIVITY_PROMPTS[currentIndex];
    console.log(`Inactivity prompt ${currentIndex + 1}: ${prompt}`);
    
    setState({ 
      promptIndex: currentIndex + 1, 
      isWaitingForResponse: true 
    });
    
    onPrompt(prompt);
    
    // Wait for response
    promptTimerRef.current = setTimeout(() => {
      // No response, try next prompt
      triggerNextPrompt(currentIndex + 1);
    }, PROMPT_RESPONSE_TIMEOUT);
  }, [onPrompt, onClose]);

  // Called when user provides any input (voice or otherwise)
  const onUserActivity = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Effect to manage timers based on state changes
  useEffect(() => {
    if (!isActive) {
      // Clear all timers when voice mode is off
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      if (promptTimerRef.current) {
        clearTimeout(promptTimerRef.current);
        promptTimerRef.current = null;
      }
      setState({ promptIndex: 0, isWaitingForResponse: false });
      return;
    }

    // Reset timer when AI finishes speaking (conversation just happened)
    if (!isSpeaking && !isLoading && isActive) {
      resetInactivityTimer();
    }
  }, [isActive, isSpeaking, isLoading, resetInactivityTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
    };
  }, []);

  return {
    currentPromptIndex: state.promptIndex,
    isWaitingForResponse: state.isWaitingForResponse,
    onUserActivity,
    resetInactivityTimer
  };
};
