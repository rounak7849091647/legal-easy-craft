import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Voice mapping for Indian languages - using Murf's GEN2 model voices
// Using native Indian voices for best pronunciation
const VOICE_MAP: Record<string, { voiceId: string; multiNativeLocale?: string; style?: string }> = {
  // English - India (native Indian English voices from GEN2)
  'en-IN': { voiceId: 'en-IN-priya', style: 'Conversational' },
  'en-US': { voiceId: 'en-US-natalie', style: 'Conversational' },
  
  // Hindi - India (using Ruby with hi-IN locale - supports Hindi natively)
  'hi-IN': { voiceId: 'en-UK-ruby', multiNativeLocale: 'hi-IN', style: 'Conversational' },
  'hinglish': { voiceId: 'en-UK-ruby', multiNativeLocale: 'hi-IN', style: 'Conversational' },
  
  // Tamil - India (using Iniya or Suresh)
  'ta-IN': { voiceId: 'ta-IN-suresh', style: 'Conversational' },
  
  // Telugu - India (using Ruby with te-IN locale)
  'te-IN': { voiceId: 'en-UK-ruby', multiNativeLocale: 'te-IN', style: 'Conversational' },
  
  // Bengali/Bangla - India (using Ishani)
  'bn-IN': { voiceId: 'bn-IN-ishani', style: 'Conversational' },
  
  // Marathi - India (using Ruby with mr-IN locale)
  'mr-IN': { voiceId: 'en-UK-ruby', multiNativeLocale: 'mr-IN', style: 'Conversational' },
  
  // Gujarati - India (using Ruby with gu-IN locale)
  'gu-IN': { voiceId: 'en-UK-ruby', multiNativeLocale: 'gu-IN', style: 'Conversational' },
  
  // Kannada - India (using Ruby with kn-IN locale)
  'kn-IN': { voiceId: 'en-UK-ruby', multiNativeLocale: 'kn-IN', style: 'Conversational' },
  
  // Malayalam - India (using Ruby with ml-IN locale)
  'ml-IN': { voiceId: 'en-UK-ruby', multiNativeLocale: 'ml-IN', style: 'Conversational' },
  
  // Punjabi - India (using Ruby with pa-IN locale)
  'pa-IN': { voiceId: 'en-UK-ruby', multiNativeLocale: 'pa-IN', style: 'Conversational' },
  
  // Odia - India (fallback to English India)
  'or-IN': { voiceId: 'en-IN-priya', style: 'Conversational' },
  
  // Assamese - India (fallback to Bengali voice)
  'as-IN': { voiceId: 'bn-IN-ishani', style: 'Conversational' },
};

const DEFAULT_VOICE = { voiceId: 'en-IN-priya', style: 'Conversational' };

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
    console.log(`Generating speech with Murf AI GEN2 - voice: ${voiceConfig.voiceId}, language: ${language}, multiNativeLocale: ${voiceConfig.multiNativeLocale || 'none'}`);

    // Build request body for GEN2 model
    const requestBody: Record<string, unknown> = {
      text: text,
      voiceId: voiceConfig.voiceId,
      format: 'MP3',
      encodeAsBase64: true,
      modelVersion: 'GEN2',
      sampleRate: 44100,
    };

    // Add style if specified
    if (voiceConfig.style) {
      requestBody.style = voiceConfig.style;
    }

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
