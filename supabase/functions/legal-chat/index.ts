import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getBNSContext } from "./bns-knowledge.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConversationMessage {
  role: string;
  content: string;
}

// Language-specific prompts optimized for natural voice output
const getLanguageInstructions = (lang: string): string => {
  const voiceGuidelines = `
VOICE OUTPUT GUIDELINES (CRITICAL - MODERN LANGUAGE):
- Write in a super chill, friendly, and relatable tone - like chatting with a smart friend
- Use SIMPLE, EVERYDAY words - the kind young people actually speak TODAY
- AVOID old-fashioned, formal, or "textbook" language
- Mix common English words naturally when that's how people talk
- NEVER use markdown formatting (no **, ##, *, _, etc.)
- NEVER use bullet points or numbered lists
- Write complete sentences that sound natural when spoken
- Be warm, supportive, and encouraging
- Keep responses CONCISE - 2-4 sentences max for simple questions
- Use casual connectors like "So basically," "The thing is," "Look," etc.`;

  switch (lang) {
    case 'hi-IN':
      return `${voiceGuidelines}
LANGUAGE: Modern, everyday Hindi. Mix English naturally.
Example: "Dekho, yeh case mein basically tera point strong hai..."`;
    case 'hinglish':
      return `${voiceGuidelines}
LANGUAGE: Natural Hinglish - code-switch between Hindi and English.
Example: "Okay so basically, tera case dekh ke lag raha hai..."`;
    case 'ta-IN':
      return `${voiceGuidelines}
LANGUAGE: Modern conversational Tamil.
Example: "Paaru, indha case la actually enna problem na..."`;
    case 'te-IN':
      return `${voiceGuidelines}
LANGUAGE: Modern conversational Telugu.
Example: "Chudu, ee vishayam lo actually jarigedi enti ante..."`;
    case 'bn-IN':
      return `${voiceGuidelines}
LANGUAGE: Modern Bengali - Cholti bhasha.
Example: "Dekho, ei case ta te actually hocche ki..."`;
    case 'mr-IN':
      return `${voiceGuidelines}
LANGUAGE: Modern Marathi - casual and friendly.
Example: "Bagh, ya case madhe actually kay hota na..."`;
    case 'gu-IN':
      return `${voiceGuidelines}
LANGUAGE: Modern Gujarati - conversational.
Example: "Jo, aa case ma actually su thay che ke..."`;
    case 'kn-IN':
      return `${voiceGuidelines}
LANGUAGE: Modern Kannada - everyday style.
Example: "Nodu, ee case alli actually en agthide andre..."`;
    case 'ml-IN':
      return `${voiceGuidelines}
LANGUAGE: Modern Malayalam - conversational.
Example: "Nokku, ee case il actually enthaanu karyam..."`;
    case 'pa-IN':
      return `${voiceGuidelines}
LANGUAGE: Modern Punjabi - friendly.
Example: "Vekh, is case vich actually ki ho reha hai ki..."`;
    case 'or-IN':
      return `${voiceGuidelines}
LANGUAGE: Modern Odia - simple and conversational.
Example: "Dekh, ei case re actually kana heuchi na..."`;
    default:
      return `${voiceGuidelines}
LANGUAGE: Simple, clear Indian English.
Example: "Okay so basically, here's the thing about your case..."`;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, detectedLanguage, documentContent, action, conversationHistory, stream } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const hasDocument = documentContent && documentContent.length > 0;
    const hasHistory = conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0;
    const languageInstructions = getLanguageInstructions(detectedLanguage);
    const bnsKnowledge = getBNSContext();

    // Handle document summarization
    if (action === 'summarize' && hasDocument) {
      console.log(`Summarizing document (${documentContent.length} chars)`);
      
      const summaryPrompt = `You are CARE, a friendly Indian legal document expert. Analyze this document briefly and conversationally.

${languageInstructions}

DOCUMENT:
${documentContent.slice(0, 4000)}

Give a BRIEF summary (3-4 sentences) covering: what it is, key terms, and one important thing to watch out for.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "user", content: summaryPrompt }],
          max_tokens: 300,
          temperature: 0.3,
        }),
      });

      if (!response.ok) throw new Error("Failed to summarize document");

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

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build system prompt
    let systemPrompt = hasDocument
      ? `You are CARE, a friendly Indian legal assistant. A document is provided. Be BRIEF and cite specific parts when relevant.

LEGAL KNOWLEDGE: ${bnsKnowledge.slice(0, 2000)}

${languageInstructions}

DOCUMENT: ${documentContent.slice(0, 3000)}

Answer briefly in 2-4 sentences.`
      : `You are CARE, a friendly Indian legal assistant with knowledge of Indian laws including BNS 2023.

LEGAL KNOWLEDGE: ${bnsKnowledge.slice(0, 2000)}

${languageInstructions}

Keep answers BRIEF - 2-4 sentences. Cite BNS sections when relevant.`;

    // Build messages
    const messages: ConversationMessage[] = [{ role: "system", content: systemPrompt }];

    if (hasHistory) {
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        messages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content });
      }
    }

    messages.push({ role: "user", content: message });

    console.log(`Chat - Lang: ${detectedLanguage}, stream: ${stream}, msgs: ${messages.length}`);

    // STREAMING RESPONSE
    if (stream) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
          max_tokens: 400,
          temperature: 0.4,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Gateway streaming error:", response.status, errorText);
        throw new Error("Failed to get AI response");
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // NON-STREAMING RESPONSE
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 400,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please wait." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I couldn't generate a response.";
    
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
