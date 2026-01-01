import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WhisperRecognitionHook {
  isRecording: boolean;
  transcript: string;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  resetTranscript: () => void;
  isSupported: boolean;
  isProcessing: boolean;
}

export const useWhisperRecognition = (): WhisperRecognitionHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // MediaRecorder is supported on all modern browsers including iOS Safari
  const isSupported = typeof window !== 'undefined' && 
    typeof navigator !== 'undefined' && 
    !!navigator.mediaDevices?.getUserMedia;

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Audio recording not supported on this device');
      return;
    }

    setError(null);
    audioChunksRef.current = [];

    try {
      // Request microphone with iOS-compatible settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      streamRef.current = stream;

      // Find supported mime type (iOS Safari prefers mp4/aac)
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/wav';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            // Fallback to default
            mimeType = '';
          }
        }
      }

      console.log('Using audio mimeType:', mimeType || 'default');

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording error occurred');
        setIsRecording(false);
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      
    } catch (err) {
      console.error('Failed to start recording:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found on this device.');
        } else {
          setError(`Could not access microphone: ${err.message}`);
        }
      } else {
        setError('Could not access microphone');
      }
    }
  }, [isSupported]);

  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve('');
        return;
      }

      const mediaRecorder = mediaRecorderRef.current;
      
      mediaRecorder.onstop = async () => {
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        if (audioChunksRef.current.length === 0) {
          console.log('No audio data recorded');
          resolve('');
          return;
        }

        setIsProcessing(true);

        try {
          // Combine audio chunks
          const mimeType = mediaRecorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          // Check if we have enough audio (at least 0.5 seconds worth)
          if (audioBlob.size < 1000) {
            console.log('Audio too short');
            setIsProcessing(false);
            resolve('');
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

          console.log('Sending audio for transcription, size:', audioBlob.size);

          // Send to edge function for transcription
          const { data, error: fnError } = await supabase.functions.invoke('voice-to-text', {
            body: { 
              audio: base64Audio,
              mimeType: mimeType
            }
          });

          if (fnError) {
            console.error('Transcription error:', fnError);
            setError('Could not transcribe audio. Please try again.');
            resolve('');
          } else if (data?.text) {
            setTranscript(data.text);
            resolve(data.text);
          } else if (data?.fallback) {
            setError(data.error || 'Transcription not available');
            resolve('');
          } else {
            console.log('No transcription returned');
            resolve('');
          }
        } catch (err) {
          console.error('Failed to process audio:', err);
          setError('Failed to process audio');
          resolve('');
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
    setError(null);
  }, []);

  return {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
    isSupported,
    isProcessing
  };
};
