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
    const { message, sessionId, detectedLanguage, documentContent } = await req.json();
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

    const isHindi = detectedLanguage === 'hi-IN';
    const hasDocument = documentContent && documentContent.length > 0;

    // Build system prompt based on context
    let systemPrompt = '';
    
    if (hasDocument) {
      // Document analysis mode
      systemPrompt = isHindi 
        ? `You are CARE, an expert Indian legal document analyzer. A document has been provided for analysis. 
           
DOCUMENT CONTENT:
${documentContent.slice(0, 6000)}

Analyze this document and answer questions about it in Hindi (Devanagari script). Be thorough but concise. Focus on:
- Key legal clauses and terms
- Rights and obligations of parties
- Important dates and deadlines
- Potential risks or concerns
- Suggestions for improvement`
        : `You are CARE, an expert Indian legal document analyzer. A document has been provided for analysis.

DOCUMENT CONTENT:
${documentContent.slice(0, 6000)}

Analyze this document and answer questions about it in simple English. Be thorough but concise. Focus on:
- Key legal clauses and terms
- Rights and obligations of parties
- Important dates and deadlines
- Potential risks or concerns
- Suggestions for improvement`;
    } else {
      // Normal legal chat mode
      systemPrompt = isHindi 
        ? `You are CARE, a friendly Indian legal assistant. Respond in Hindi (Devanagari script). Be warm, concise (2-3 sentences). Provide helpful legal guidance on Indian laws.`
        : `You are CARE, a friendly Indian legal assistant. Respond in simple English. Be warm, concise (2-3 sentences). Provide helpful legal guidance on Indian laws.`;
    }

    console.log(`Language: ${detectedLanguage}, hasDocument: ${hasDocument}, message: ${message.substring(0, 50)}...`);

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
        max_tokens: hasDocument ? 1000 : 500, // More tokens for document analysis
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please wait a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";
    
    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        voiceResponse: aiResponse,
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
