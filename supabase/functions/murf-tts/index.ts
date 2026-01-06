import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Voice mapping for Indian languages - using Murf's voice IDs
const VOICE_MAP: Record<string, string> = {
  'en-IN': 'en-IN-isha',
  'en-US': 'en-US-natalie',
  'hi-IN': 'hi-IN-vani',
  'hinglish': 'hi-IN-vani',
  'ta-IN': 'ta-IN-ananya',
  'te-IN': 'te-IN-keerthi',
  'bn-IN': 'bn-IN-ananya',
  'mr-IN': 'mr-IN-swara',
  'gu-IN': 'gu-IN-riddhi',
  'kn-IN': 'kn-IN-deepa',
  'ml-IN': 'ml-IN-meera',
  'pa-IN': 'pa-IN-simran',
};

const DEFAULT_VOICE = 'en-IN-isha';

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

    const voiceId = VOICE_MAP[language] || DEFAULT_VOICE;
    console.log(`Generating speech with Murf AI - voice: ${voiceId}, language: ${language}`);

    // Call Murf API
    const response = await fetch('https://api.murf.ai/v1/speech/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        text: text,
        voiceId: voiceId,
        format: 'MP3',
        encodeAsBase64: true,
        modelVersion: 'GEN2',
        sampleRate: 44100,
      }),
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
