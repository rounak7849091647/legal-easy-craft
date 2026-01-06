import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768): Uint8Array {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

// Detect language from text using character patterns
function detectLanguageFromText(text: string): string {
  if (!text) return 'en-IN';
  
  // Hindi/Devanagari
  if (/[\u0900-\u097F]/.test(text)) return 'hi-IN';
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN';
  // Telugu  
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN';
  // Bengali
  if (/[\u0980-\u09FF]/.test(text)) return 'bn-IN';
  // Gujarati
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu-IN';
  // Kannada
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN';
  // Malayalam
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml-IN';
  // Punjabi (Gurmukhi)
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa-IN';
  // Marathi uses Devanagari, check for common Marathi words
  if (/[\u0900-\u097F]/.test(text)) return 'hi-IN'; // Will be handled as Hindi
  // Odia
  if (/[\u0B00-\u0B7F]/.test(text)) return 'or-IN';
  
  return 'en-IN';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, mimeType } = await req.json();
    
    if (!audio) {
      throw new Error("No audio data provided");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Processing audio transcription, mimeType: ${mimeType || 'audio/webm'}`);

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    
    // Determine file extension based on mime type
    const audioMimeType = mimeType || 'audio/webm';
    let extension = 'webm';
    if (audioMimeType.includes('mp4') || audioMimeType.includes('m4a')) {
      extension = 'm4a';
    } else if (audioMimeType.includes('wav')) {
      extension = 'wav';
    } else if (audioMimeType.includes('ogg')) {
      extension = 'ogg';
    }
    
    // Prepare form data for OpenAI Whisper
    const formData = new FormData();
    const blob = new Blob([binaryAudio as unknown as ArrayBuffer], { type: audioMimeType });
    formData.append('file', blob, `audio.${extension}`);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json'); // Get language detection
    // Don't set language - Whisper will auto-detect and transcribe in original language

    // Use OpenAI's Whisper API
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Whisper API error:", response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          text: "", 
          detectedLanguage: "en-IN",
          error: "Voice transcription not available. Please type your message.",
          fallback: true
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const result = await response.json();
    const transcribedText = result.text || "";
    
    // Get language from Whisper's detection or detect from text
    let detectedLanguage = 'en-IN';
    const whisperLang = result.language;
    
    // Map Whisper language codes to our language codes
    const langMap: Record<string, string> = {
      'hindi': 'hi-IN',
      'hi': 'hi-IN',
      'tamil': 'ta-IN',
      'ta': 'ta-IN',
      'telugu': 'te-IN',
      'te': 'te-IN',
      'bengali': 'bn-IN',
      'bn': 'bn-IN',
      'gujarati': 'gu-IN',
      'gu': 'gu-IN',
      'kannada': 'kn-IN',
      'kn': 'kn-IN',
      'malayalam': 'ml-IN',
      'ml': 'ml-IN',
      'punjabi': 'pa-IN',
      'pa': 'pa-IN',
      'marathi': 'mr-IN',
      'mr': 'mr-IN',
      'odia': 'or-IN',
      'or': 'or-IN',
      'assamese': 'as-IN',
      'as': 'as-IN',
      'english': 'en-IN',
      'en': 'en-IN'
    };
    
    if (whisperLang && langMap[whisperLang.toLowerCase()]) {
      detectedLanguage = langMap[whisperLang.toLowerCase()];
    } else {
      // Fallback to text-based detection
      detectedLanguage = detectLanguageFromText(transcribedText);
    }
    
    console.log(`Transcription successful: "${transcribedText.slice(0, 50)}...", whisper lang: ${whisperLang}, detected: ${detectedLanguage}`);

    return new Response(
      JSON.stringify({ 
        text: transcribedText,
        detectedLanguage: detectedLanguage
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Voice-to-text error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Transcription failed",
        text: "",
        detectedLanguage: "en-IN"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
