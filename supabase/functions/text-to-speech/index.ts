import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// OpenAI TTS voices optimized for Indian languages
// Using 'alloy' as default - it has good multilingual support
const VOICE_MAP: Record<string, string> = {
  'en-IN': 'nova',      // Clear female voice for Indian English
  'hi-IN': 'onyx',      // Deep male voice, works well with Hindi
  'hinglish': 'nova',   // Clear for mixed language
  'ta-IN': 'shimmer',   // Expressive female voice for Tamil
  'te-IN': 'shimmer',   // Expressive female voice for Telugu
  'bn-IN': 'alloy',     // Balanced voice for Bengali
  'mr-IN': 'alloy',     // Balanced voice for Marathi
  'gu-IN': 'alloy',     // Balanced voice for Gujarati
  'kn-IN': 'shimmer',   // Expressive for Kannada
  'ml-IN': 'shimmer',   // Expressive for Malayalam
  'pa-IN': 'onyx',      // Deep voice for Punjabi
  'or-IN': 'alloy',     // Balanced for Odia
  'as-IN': 'alloy',     // Balanced for Assamese
};

const DEFAULT_VOICE = 'alloy';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    if (!text || !text.trim()) {
      throw new Error("Text is required");
    }

    const voice = VOICE_MAP[language] || DEFAULT_VOICE;
    
    console.log(`TTS - Language: ${language}, Voice: ${voice}, Text length: ${text.length}`);

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1-hd",  // High definition model for best quality
        input: text.substring(0, 4096),
        voice: voice,
        response_format: "mp3",
        speed: 1.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI TTS API error:", response.status, errorText);
      
      // Return specific status codes for client-side handling
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded", fallback: true }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "TTS API error", fallback: true }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return audio directly as binary
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
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
