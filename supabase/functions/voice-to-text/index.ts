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
    
    // Prepare form data for OpenAI Whisper via Lovable AI Gateway
    const formData = new FormData();
    const blob = new Blob([binaryAudio as unknown as ArrayBuffer], { type: audioMimeType });
    formData.append('file', blob, `audio.${extension}`);
    formData.append('model', 'whisper-1');
    // Use verbose_json to get detected language info AND keep original script
    // IMPORTANT: Using transcriptions endpoint (NOT translations) to keep original language
    // This ensures Hindi stays in Devanagari, Tamil in Tamil script, etc.
    formData.append('response_format', 'verbose_json');
    // Add prompt hint to preserve native scripts for Indian languages
    formData.append('prompt', 'Transcribe in the original language script. हिंदी में देवनागरी लिपि। தமிழில் தமிழ் எழுத்துக்கள். తెలుగులో తెలుగు లిపి. বাংলায় বাংলা লিপি. ಕನ್ನಡದಲ್ಲಿ ಕನ್ನಡ ಲಿಪಿ. മലയാളത്തിൽ മലയാളം ലിപി. ગુજરાતીમાં ગુજરાતી લિપિ. ਪੰਜਾਬੀ ਵਿੱਚ ਗੁਰਮੁਖੀ. ଓଡ଼ିଆରେ ଓଡ଼ିଆ ଲିପି. অসমীয়াত অসমীয়া লিপি.');

    console.log("Calling Whisper transcriptions API with native script prompt...");

    // Use OpenAI's TRANSCRIPTIONS API (not translations) - keeps original language text
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
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
    console.log("Transcription result - Text sample:", result.text?.slice(0, 100), "| Detected language:", result.language);

    // Map Whisper language codes to our Indian language codes
    // All 14 supported languages including Hinglish detection
    const languageMap: Record<string, string> = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'bn': 'bn-IN',
      'mr': 'mr-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'pa': 'pa-IN',
      'or': 'or-IN',
      'as': 'as-IN',
      // Fallbacks for any variations
      'ory': 'or-IN', // Odia alternate code
      'ori': 'or-IN', // Odia alternate code
      'asm': 'as-IN', // Assamese alternate code
      'punjabi': 'pa-IN',
      'hindi': 'hi-IN',
      'tamil': 'ta-IN',
      'telugu': 'te-IN',
      'bengali': 'bn-IN',
      'marathi': 'mr-IN',
      'gujarati': 'gu-IN',
      'kannada': 'kn-IN',
      'malayalam': 'ml-IN',
      'odia': 'or-IN',
      'assamese': 'as-IN'
    };

    const whisperLang = (result.language || 'en').toLowerCase();
    let detectedLanguage = languageMap[whisperLang] || 'en-IN';
    
    // Check if it's Hinglish (Hindi words in Roman script mixed with English)
    // Detect by checking if language is 'en' but text contains Hindi patterns
    if (whisperLang === 'en' && result.text) {
      const hinglishPatterns = /\b(kya|hai|hain|nahi|aur|mein|toh|kaise|kyun|kab|kaun|kaha|ho|kar|raha|rahe|tha|thi|the)\b/i;
      if (hinglishPatterns.test(result.text)) {
        detectedLanguage = 'hinglish';
        console.log("Detected Hinglish based on text patterns");
      }
    }

    console.log("Final detected language:", detectedLanguage);

    return new Response(
      JSON.stringify({ 
        text: result.text || "",
        detectedLanguage
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Voice-to-text error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Transcription failed",
        text: ""
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
