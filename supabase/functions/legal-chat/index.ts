import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConversationMessage {
  role: string;
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, detectedLanguage, documentContent, action, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const hasDocument = documentContent && documentContent.length > 0;
    const hasHistory = conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0;

    // Language-specific prompts
    const getLanguageInstructions = (lang: string): string => {
      switch (lang) {
        case 'hi-IN':
          return 'Respond in Hindi (Devanagari script). Use formal Hindi suitable for legal contexts.';
        case 'hinglish':
          return 'Respond in Hinglish (a natural mix of Hindi and English, using Roman script). Example: "Aapka case strong hai, but aapko evidence collect karna hoga." Be conversational and friendly.';
        case 'ta-IN':
          return 'Respond in Tamil (தமிழ்). Use formal Tamil suitable for legal contexts.';
        case 'te-IN':
          return 'Respond in Telugu (తెలుగు). Use formal Telugu suitable for legal contexts.';
        default:
          return 'Respond in simple, clear English.';
      }
    };

    const languageInstructions = getLanguageInstructions(detectedLanguage);

    // Handle document summarization request
    if (action === 'summarize' && hasDocument) {
      console.log(`Summarizing document (${documentContent.length} chars), language: ${detectedLanguage}`);
      
      const summaryPrompt = `You are CARE, an expert Indian legal document analyzer. Analyze this document and provide a comprehensive summary.

${languageInstructions}

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
      systemPrompt = `You are CARE, an expert Indian legal assistant with memory of our conversation. A document has been provided. Be precise and cite specific parts of the document when relevant. Remember our previous conversation and refer to it when appropriate.

${languageInstructions}

DOCUMENT CONTENT:
${documentContent.slice(0, 6000)}

Answer the user's question based on this document and our conversation history.`;
    } else {
      // Normal legal chat mode with memory
      systemPrompt = `You are CARE, a friendly Indian legal assistant with perfect memory of our conversation. Be warm and helpful. Remember everything we discussed and refer to previous questions/answers when relevant. Provide helpful legal guidance on Indian laws. If the user refers to something from earlier in our conversation, acknowledge and build upon it.

${languageInstructions}`;
    }

    // Build messages array with conversation history
    const messages: ConversationMessage[] = [
      { role: "system", content: systemPrompt }
    ];

    // Add conversation history (limit to last 10 exchanges to manage token usage)
    if (hasHistory) {
      const recentHistory = conversationHistory.slice(-20); // Last 20 messages (10 exchanges)
      console.log(`Including ${recentHistory.length} messages from conversation history`);
      
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      }
    }

    // Add current user message
    messages.push({ role: "user", content: message });

    console.log(`Chat - Language: ${detectedLanguage}, hasDocument: ${hasDocument}, hasHistory: ${hasHistory}, totalMessages: ${messages.length}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: hasDocument ? 1000 : 600,
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
