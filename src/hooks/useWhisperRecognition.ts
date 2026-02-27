import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isIOSDevice } from '@/lib/device/isIOSDevice';
import { unlockAudioContext } from '@/hooks/useMobileAudio';

interface WhisperRecognitionHook {
  isRecording: boolean;
  transcript: string;
  detectedLanguage: string;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<{ text: string; language: string }>;
  resetTranscript: () => void;
  isSupported: boolean;
  isProcessing: boolean;
}

export const useWhisperRecognition = (): WhisperRecognitionHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('en-IN');
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const isSupported = typeof window !== 'undefined' && 
    typeof navigator !== 'undefined' && 
    !!navigator.mediaDevices?.getUserMedia;

  // Start recording - MUST be called directly from user gesture (click/tap)
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      const msg = 'Audio recording not supported';
      setError(msg);
      throw new Error(msg);
    }

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      const msg = 'Requires HTTPS';
      setError(msg);
      throw new Error(msg);
    }

    setError(null);
    audioChunksRef.current = [];

    const isIOS = isIOSDevice();

    try {
      // Unlock AudioContext within the same user gesture (critical for iOS)
      await unlockAudioContext();

      // CRITICAL: getUserMedia MUST be called within user gesture
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      streamRef.current = stream;

      // iOS Safari does NOT support audio/webm - prioritize audio/mp4
      const mimeTypes = isIOS
        ? ['audio/mp4', 'audio/wav', 'audio/webm', '']
        : ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', ''];
      
      const mimeType = mimeTypes.find(type => 
        type === '' || MediaRecorder.isTypeSupported(type)
      ) || '';

      const mediaRecorder = new MediaRecorder(
        stream, 
        mimeType ? { mimeType } : undefined
      );
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = () => {
        setError('Recording error');
        setIsRecording(false);
      };

      // Start immediately - timeslice helps mobile browsers
      mediaRecorder.start(500);
      setIsRecording(true);
      
    } catch (err) {
      console.error('Recording start failed:', err);
      
      let msg = 'Microphone access denied';
      if (err instanceof Error) {
        if (err.name === 'NotFoundError') {
          msg = 'No microphone found';
        } else if (err.name === 'NotAllowedError' && isIOS) {
          msg = 'Microphone blocked. Enable in Settings > Safari > Microphone';
        }
      }

      setError(msg);
      throw new Error(msg);
    }
  }, [isSupported]);

  const stopRecording = useCallback(async (): Promise<{ text: string; language: string }> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve({ text: '', language: 'en-IN' });
        return;
      }

      const mediaRecorder = mediaRecorderRef.current;
      
      mediaRecorder.onstop = async () => {
        // Clean up stream immediately
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        if (audioChunksRef.current.length === 0) {
          resolve({ text: '', language: 'en-IN' });
          return;
        }

        setIsProcessing(true);

        try {
          const mimeType = mediaRecorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          if (audioBlob.size < 1000) {
            setIsProcessing(false);
            resolve({ text: '', language: 'en-IN' });
            return;
          }

          // Convert to base64
          const arrayBuffer = await audioBlob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          let binary = '';
          const chunkSize = 8192;
          for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.slice(i, i + chunkSize);
            binary += String.fromCharCode.apply(null, Array.from(chunk));
          }
          const base64Audio = btoa(binary);

          const { data, error: fnError } = await supabase.functions.invoke('voice-to-text', {
            body: { audio: base64Audio, mimeType }
          });

          if (fnError || !data?.text) {
            setError(data?.error || 'Transcription failed');
            resolve({ text: '', language: 'en-IN' });
          } else {
            const lang = data.detectedLanguage || 'en-IN';
            setTranscript(data.text);
            setDetectedLanguage(lang);
            resolve({ text: data.text, language: lang });
          }
        } catch (err) {
          setError('Processing failed');
          resolve({ text: '', language: 'en-IN' });
        } finally {
          setIsProcessing(false);
          audioChunksRef.current = [];
        }
      };

      setIsRecording(false);
      mediaRecorder.stop();
    });
  }, [isRecording]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setDetectedLanguage('en-IN');
    setError(null);
  }, []);

  return {
    isRecording,
    transcript,
    detectedLanguage,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
    isSupported,
    isProcessing
  };
};
