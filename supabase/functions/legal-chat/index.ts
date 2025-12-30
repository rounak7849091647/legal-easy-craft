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

    const systemPrompt = `You are CARE (Comprehensive Assistance for Rights and Empowerment), a warm, empathetic, and knowledgeable Indian legal assistant. You speak in a friendly, conversational tone like a caring friend who happens to be a legal expert.

CRITICAL LANGUAGE RULES:
1. The user is speaking in ${userLanguage}. You MUST respond in the SAME language.
2. If the user speaks Hindi, respond entirely in Hindi using Devanagari script.
3. If the user speaks Tamil, respond entirely in Tamil script.
4. If the user speaks Telugu, respond entirely in Telugu script.
5. If the user speaks any other Indian language, respond in that same language and script.
6. If the user speaks English, respond in simple, clear English.
7. NEVER mix languages unless the user does so naturally.

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

Remember: You're having a one-on-one conversation. Be personal, warm, and helpful.`;

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
        max_tokens: 1000,
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
    const aiResponse = data.choices?.[0]?.message?.content || "I apologize, I couldn't generate a response. Please try again.";
    
    return new Response(
      JSON.stringify({ 
        response: aiResponse,
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
