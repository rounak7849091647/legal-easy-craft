import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, detectedLanguage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Determine the language instruction based on detected language
    const languageMap: Record<string, string> = {
      'hi-IN': 'Hindi (हिंदी)',
      'ta-IN': 'Tamil (தமிழ்)',
      'te-IN': 'Telugu (తెలుగు)',
      'kn-IN': 'Kannada (ಕನ್ನಡ)',
      'ml-IN': 'Malayalam (മലയാളം)',
      'bn-IN': 'Bengali (বাংলা)',
      'gu-IN': 'Gujarati (ગુજરાતી)',
      'pa-IN': 'Punjabi (ਪੰਜਾਬੀ)',
      'mr-IN': 'Marathi (मराठी)',
      'or-IN': 'Odia (ଓଡ଼ିଆ)',
      'en-IN': 'English'
    };

    const userLanguage = languageMap[detectedLanguage || 'en-IN'] || 'English';
    const isHindi = detectedLanguage === 'hi-IN';
    const isEnglish = detectedLanguage === 'en-IN' || !detectedLanguage;

    // System prompt that generates both versions
    const systemPrompt = `You are CARE (Comprehensive Assistance for Rights and Empowerment), a warm, empathetic, and knowledgeable Indian legal assistant. You speak in a friendly, conversational tone like a caring friend who happens to be a legal expert.

CRITICAL RESPONSE FORMAT:
You MUST respond with a JSON object containing two fields:
1. "voiceResponse": Your response in the USER'S LANGUAGE (${userLanguage}) - this will be spoken aloud
2. "displayResponse": The SAME response translated to English - this will be shown as text

${isEnglish ? `Since the user is speaking English, both voiceResponse and displayResponse should be the same English text.` : 
`The user is speaking ${userLanguage}. 
- voiceResponse: Respond in ${userLanguage} (use native script like Devanagari for Hindi)
- displayResponse: The same content but in clear, simple English`}

PERSONALITY & TONE:
- Be warm, friendly, and approachable - like a caring elder sister or friend
- Use simple, easy-to-understand language
- Be encouraging and supportive
- Show empathy for the user's situation
- Keep responses conversational, not like reading from a textbook
- Use gentle phrases like "I understand", "Don't worry", "Let me help you"

RESPONSE STYLE:
- Keep responses concise but complete (2-4 sentences when possible)
- For complex topics, break down into simple steps
- Always provide actionable advice
- Mention relevant Indian laws, acts, or articles when helpful
- If you don't know something, be honest and suggest consulting a local lawyer

LEGAL EXPERTISE AREAS:
- Consumer rights and NCDRC procedures
- Property and land disputes
- Family law (marriage, divorce, custody, maintenance)
- Criminal law basics
- Labor and employment laws
- RTI (Right to Information)
- Women's rights and protection laws
- Senior citizen rights
- Tenant and landlord disputes
- Document drafting guidance

EXAMPLE RESPONSE FORMAT:
{
  "voiceResponse": "नमस्ते! मैं आपकी मदद करने के लिए यहाँ हूँ। आपका सवाल बहुत अच्छा है।",
  "displayResponse": "Hello! I'm here to help you. That's a great question."
}

Remember: Always respond with valid JSON containing both voiceResponse and displayResponse fields.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    const aiResponseRaw = data.choices?.[0]?.message?.content || "";
    
    // Parse the JSON response
    let voiceResponse = aiResponseRaw;
    let displayResponse = aiResponseRaw;
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponseRaw.match(/\{[\s\S]*"voiceResponse"[\s\S]*"displayResponse"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        voiceResponse = parsed.voiceResponse || aiResponseRaw;
        displayResponse = parsed.displayResponse || aiResponseRaw;
      } else {
        // If no JSON found, try parsing the whole response
        const parsed = JSON.parse(aiResponseRaw);
        voiceResponse = parsed.voiceResponse || aiResponseRaw;
        displayResponse = parsed.displayResponse || aiResponseRaw;
      }
    } catch (e) {
      // If JSON parsing fails, use the raw response for both
      console.log("Could not parse JSON response, using raw text");
      // Clean up any markdown code blocks if present
      const cleanResponse = aiResponseRaw.replace(/```json\n?|\n?```/g, '').trim();
      try {
        const parsed = JSON.parse(cleanResponse);
        voiceResponse = parsed.voiceResponse || cleanResponse;
        displayResponse = parsed.displayResponse || cleanResponse;
      } catch {
        // Still failed, use as-is
        voiceResponse = aiResponseRaw;
        displayResponse = aiResponseRaw;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        response: displayResponse, // English text for display
        voiceResponse: voiceResponse, // Native language for TTS
        sessionId: sessionId || `session-${Date.now()}`,
        language: detectedLanguage || 'en-IN'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Legal chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
