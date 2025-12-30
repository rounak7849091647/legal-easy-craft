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
    const { message, sessionId, detectedLanguage, documentContent, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const isHindi = detectedLanguage === 'hi-IN';
    const hasDocument = documentContent && documentContent.length > 0;

    // Handle document summarization request
    if (action === 'summarize' && hasDocument) {
      console.log(`Summarizing document (${documentContent.length} chars), language: ${detectedLanguage}`);
      
      const summaryPrompt = isHindi 
        ? `You are CARE, an expert Indian legal document analyzer. Analyze this document and provide a comprehensive summary in Hindi (Devanagari script).

DOCUMENT:
${documentContent.slice(0, 6000)}

Provide a structured summary including:
1. **दस्तावेज़ का प्रकार** (Document Type): What kind of legal document is this?
2. **पक्ष** (Parties): Who are the parties involved?
3. **मुख्य शर्तें** (Key Terms): Important clauses, obligations, and rights
4. **महत्वपूर्ण तिथियां** (Important Dates): Any deadlines or time periods
5. **संभावित जोखिम** (Potential Risks): Any concerning clauses or missing protections
6. **सिफारिशें** (Recommendations): What to verify or negotiate

Keep it concise but thorough.`
        : `You are CARE, an expert Indian legal document analyzer. Analyze this document and provide a comprehensive summary.

DOCUMENT:
${documentContent.slice(0, 6000)}

Provide a structured summary including:
1. **Document Type**: What kind of legal document is this?
2. **Parties Involved**: Who are the parties mentioned?
3. **Key Terms & Obligations**: Important clauses, rights, and responsibilities
4. **Important Dates/Deadlines**: Any time-sensitive information
5. **Potential Risks/Concerns**: Any concerning clauses or missing protections
6. **Recommendations**: What to verify, negotiate, or be aware of

Keep it concise but thorough.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "user", content: summaryPrompt }
          ],
          max_tokens: 1500,
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Gateway error during summarization:", response.status, errorText);
        throw new Error("Failed to summarize document");
      }

      const data = await response.json();
      const summary = data.choices?.[0]?.message?.content || "Could not generate summary.";
      
      return new Response(
        JSON.stringify({ 
          response: summary,
          voiceResponse: summary,
          sessionId: sessionId || `session-${Date.now()}`,
          language: detectedLanguage || 'en-IN',
          action: 'summary'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Regular chat message
    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build system prompt based on context
    let systemPrompt = '';
    
    if (hasDocument) {
      // Document Q&A mode
      systemPrompt = isHindi 
        ? `You are CARE, an expert Indian legal document analyzer. A document has been provided. Answer questions about it in Hindi (Devanagari script). Be precise and cite specific parts of the document when relevant.

DOCUMENT CONTENT:
${documentContent.slice(0, 6000)}

Answer the user's question based on this document.`
        : `You are CARE, an expert Indian legal document analyzer. A document has been provided. Answer questions about it in simple English. Be precise and cite specific parts of the document when relevant.

DOCUMENT CONTENT:
${documentContent.slice(0, 6000)}

Answer the user's question based on this document.`;
    } else {
      // Normal legal chat mode
      systemPrompt = isHindi 
        ? `You are CARE, a friendly Indian legal assistant. Respond in Hindi (Devanagari script). Be warm, concise (2-3 sentences). Provide helpful legal guidance on Indian laws.`
        : `You are CARE, a friendly Indian legal assistant. Respond in simple English. Be warm, concise (2-3 sentences). Provide helpful legal guidance on Indian laws.`;
    }

    console.log(`Chat - Language: ${detectedLanguage}, hasDocument: ${hasDocument}, message: ${message.substring(0, 50)}...`);

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
        max_tokens: hasDocument ? 1000 : 500,
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
