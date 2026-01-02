import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Voice IDs optimized for different languages
const VOICE_MAP: Record<string, string> = {
  'en-IN': 'EXAVITQu4vr4xnSDxMaL', // Sarah - clear American English, great pronunciation
  'hi-IN': 'nPczCjzI2devNBz1zQrb', // Brian - deep male voice, works well with Hindi
  'hinglish': 'EXAVITQu4vr4xnSDxMaL', // Sarah - clear for mixed language
  'ta-IN': 'onwK4e9ZLuTAKqWW03F9', // Daniel - British voice, handles Tamil
  'te-IN': 'onwK4e9ZLuTAKqWW03F9', // Daniel - British voice, handles Telugu
};

const DEFAULT_VOICE = 'EXAVITQu4vr4xnSDxMaL'; // Sarah - default

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    if (!text || !text.trim()) {
      throw new Error("Text is required");
    }

    // Select voice based on language
    const voiceId = VOICE_MAP[language] || DEFAULT_VOICE;
    
    console.log(`TTS - Language: ${language}, Voice: ${voiceId}, Text length: ${text.length}`);

    // Use multilingual v2 model for all languages - best quality
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.substring(0, 5000),
          model_id: "eleven_multilingual_v2",
          output_format: "mp3_44100_128",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = base64Encode(audioBuffer);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
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
