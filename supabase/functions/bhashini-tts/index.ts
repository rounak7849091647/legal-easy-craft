import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Bhashini language names mapping
const LANGUAGE_NAMES: Record<string, string> = {
  'en-IN': 'English',
  'hi-IN': 'Hindi',
  'hinglish': 'Hindi',
  'ta-IN': 'Tamil',
  'te-IN': 'Telugu',
  'bn-IN': 'Bengali',
  'mr-IN': 'Marathi',
  'gu-IN': 'Gujarati',
  'kn-IN': 'Kannada',
  'ml-IN': 'Malayalam',
  'pa-IN': 'Punjabi',
  'or-IN': 'Odia',
  'as-IN': 'Assamese',
};

// Voice options for Bhashini
const VOICE_MAP: Record<string, string> = {
  'en-IN': 'Female1',
  'hi-IN': 'Female1',
  'hinglish': 'Female1',
  'ta-IN': 'Female1',
  'te-IN': 'Female1',
  'bn-IN': 'Female1',
  'mr-IN': 'Female1',
  'gu-IN': 'Female1',
  'kn-IN': 'Female1',
  'ml-IN': 'Female1',
  'pa-IN': 'Female1',
  'or-IN': 'Female1',
  'as-IN': 'Female1',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language } = await req.json();

    if (!text || !text.trim()) {
      throw new Error("Text is required");
    }

    const languageName = LANGUAGE_NAMES[language] || 'English';
    const voiceName = VOICE_MAP[language] || 'Female1';
    
    console.log(`Bhashini TTS - Language: ${languageName}, Voice: ${voiceName}, Text length: ${text.length}`);

    // Call Bhashini TTS API (free, no API key required)
    const response = await fetch("https://tts.bhashini.ai/v1/synthesize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text: text.substring(0, 5000), // Limit text length
        language: languageName,
        voiceName: voiceName,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Bhashini TTS API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Bhashini TTS error", fallback: true }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return audio directly
    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage, fallback: true }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
