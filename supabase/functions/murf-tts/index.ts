import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Voice mapping for Indian languages - using Murf's FALCON model voices
// Using native Indian voices for best pronunciation
const VOICE_MAP: Record<string, { voiceId: string; multiNativeLocale?: string }> = {
  // English - India (native Indian English voices)
  'en-IN': { voiceId: 'Anisha' },
  'en-US': { voiceId: 'Natalie' },
  
  // Hindi - India (native Hindi voices)
  'hi-IN': { voiceId: 'Namrita' },
  'hinglish': { voiceId: 'Namrita' },
  
  // Tamil - India
  'ta-IN': { voiceId: 'Alicia', multiNativeLocale: 'ta-IN' },
  
  // Telugu - India  
  'te-IN': { voiceId: 'Josie', multiNativeLocale: 'te-IN' },
  
  // Bengali/Bangla - India
  'bn-IN': { voiceId: 'Lia', multiNativeLocale: 'bn-IN' },
  
  // Marathi - India
  'mr-IN': { voiceId: 'Rujuta' },
  
  // Gujarati - India
  'gu-IN': { voiceId: 'Lia', multiNativeLocale: 'gu-IN' },
  
  // Kannada - India
  'kn-IN': { voiceId: 'Julia', multiNativeLocale: 'kn-IN' },
  
  // Malayalam - India
  'ml-IN': { voiceId: 'Alicia', multiNativeLocale: 'ml-IN' },
  
  // Punjabi - India
  'pa-IN': { voiceId: 'Harman' },
  
  // Odia - India (fallback to English India)
  'or-IN': { voiceId: 'Anisha' },
  
  // Assamese - India (fallback to Bengali voice)
  'as-IN': { voiceId: 'Lia', multiNativeLocale: 'bn-IN' },
};

const DEFAULT_VOICE = { voiceId: 'Anisha' };

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language } = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('MURF_API_KEY');
    if (!apiKey) {
      console.error('MURF_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Murf API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const voiceConfig = VOICE_MAP[language] || DEFAULT_VOICE;
    console.log(`Generating speech with Murf AI FALCON - voice: ${voiceConfig.voiceId}, language: ${language}, multiNativeLocale: ${voiceConfig.multiNativeLocale || 'none'}`);

    // Build request body
    const requestBody: Record<string, unknown> = {
      text: text,
      voiceId: voiceConfig.voiceId,
      format: 'MP3',
      encodeAsBase64: true,
      model: 'FALCON',
      sampleRate: 24000,
      style: 'Conversation',
    };

    // Add multiNativeLocale for cross-language voices
    if (voiceConfig.multiNativeLocale) {
      requestBody.multiNativeLocale = voiceConfig.multiNativeLocale;
    }

    // Call Murf API
    const response = await fetch('https://api.murf.ai/v1/speech/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Murf API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Murf API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Murf API response received, audio length:', data.audioLengthInSeconds);

    // Return base64 encoded audio
    if (data.encodedAudio) {
      return new Response(
        JSON.stringify({ audioContent: data.encodedAudio }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (data.audioFile) {
      // If we got a URL instead, fetch it and convert to base64
      const audioResponse = await fetch(data.audioFile);
      const audioBuffer = await audioResponse.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
      
      return new Response(
        JSON.stringify({ audioContent: base64Audio }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'No audio content in response' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in murf-tts function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
