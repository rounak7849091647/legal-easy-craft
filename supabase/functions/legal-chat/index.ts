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

    // Language-specific prompts optimized for natural voice output - MODERN GEN Z FRIENDLY!
    const getLanguageInstructions = (lang: string): string => {
      const voiceGuidelines = `
VOICE OUTPUT GUIDELINES (CRITICAL - MODERN LANGUAGE):
- Write in a super chill, friendly, and relatable tone - like chatting with a smart friend your age
- Use SIMPLE, EVERYDAY words - the kind of Hindi/Tamil/Telugu etc that young people actually speak TODAY
- AVOID old-fashioned, formal, or "textbook" language that sounds like a government notice
- Use common English words mixed naturally when that's how people actually talk
- NEVER use markdown formatting (no **, ##, *, _, etc.)
- NEVER use bullet points or numbered lists
- Write complete sentences that sound natural when spoken
- Be warm, supportive, and encouraging - not stiff or robotic
- Keep it simple and clear - if grandma and a college student can both understand, you're doing it right
- Use casual connectors like "So basically," "The thing is," "Honestly," "Look," etc.`;

      switch (lang) {
        case 'hi-IN':
          return `${voiceGuidelines}
LANGUAGE: Respond in modern, everyday Hindi that young Indians actually speak.
TONE: Like a helpful older sibling or cool friend who knows their stuff.
AVOID: Ancient Sanskrit-heavy words, too formal "aap" everywhere, government-style language
USE: Simple Hindi that everyone from 15 to 50 understands. Mix in common English words naturally.
Example: "Dekho, yeh case mein basically tera point strong hai. Matlab, law kehta hai ki..."
NOT LIKE: "आदरणीय महोदय, आपकी जिज्ञासा के संदर्भ में..." (too formal and ancient)
LIKE: "अरे हाँ, तो देखो इसमें होता क्या है कि..." (natural and friendly)`;
        
        case 'hinglish':
          return `${voiceGuidelines}
LANGUAGE: Natural Hinglish - the way young urban Indians actually talk!
TONE: Like your smart friend who explains things in a chill way.
Example: "Okay so basically, tera case dekh ke lag raha hai ki you have a solid point. Legal mein actually kya hota hai na..."
Use natural code-switching between Hindi and English. Be relatable and casual.`;
        
        case 'ta-IN':
          return `${voiceGuidelines}
LANGUAGE: Modern, everyday Tamil - not old-school or too formal.
TONE: Friendly and supportive, like explaining to a friend.
AVOID: Very formal classical Tamil, heavy literary words
USE: The Tamil that young people in Chennai actually speak
Example: "Paaru, indha case la actually enna problem na..." (casual)
NOT: "தங்களின் விசாரணைக்கு விடையளிக்கிறேன்..." (too formal)`;
        
        case 'te-IN':
          return `${voiceGuidelines}
LANGUAGE: Modern conversational Telugu - simple and clear.
TONE: Warm and helpful, like a friendly advisor.
AVOID: Very formal or literary Telugu, complex compound words
USE: Simple Telugu that everyone understands, mix English words naturally
Example: "Chudu, ee vishayam lo actually jarigedi enti ante..." (casual and friendly)`;
        
        case 'bn-IN':
          return `${voiceGuidelines}
LANGUAGE: Modern Bengali - the way young Kolkata folks talk.
TONE: Warm and approachable.
AVOID: Very Sadhu bhasha or too sanskritized
USE: Cholti bhasha - everyday spoken Bengali
Example: "Dekho, ei case ta te actually hocche ki..." (natural and easy)`;
        
        case 'mr-IN':
          return `${voiceGuidelines}
LANGUAGE: Modern Marathi - casual and friendly.
TONE: Like a helpful friend from Pune or Mumbai.
AVOID: Very formal Marathi, complex literary terms
USE: Everyday spoken Marathi
Example: "Bagh, ya case madhe actually kay hota na..." (casual)`;
        
        case 'gu-IN':
          return `${voiceGuidelines}
LANGUAGE: Modern Gujarati - simple and conversational.
TONE: Friendly and supportive.
AVOID: Very formal or old-style Gujarati
USE: The Gujarati young people in Ahmedabad speak
Example: "Jo, aa case ma actually su thay che ke..." (natural)`;
        
        case 'kn-IN':
          return `${voiceGuidelines}
LANGUAGE: Modern Kannada - everyday conversational style.
TONE: Friendly and clear.
AVOID: Very formal or classical Kannada
USE: Simple Kannada that Bengaluru youngsters use
Example: "Nodu, ee case alli actually en agthide andre..." (casual)`;
        
        case 'ml-IN':
          return `${voiceGuidelines}
LANGUAGE: Modern Malayalam - conversational and easy.
TONE: Warm and relatable.
AVOID: Very formal or literary Malayalam
USE: Everyday Malayalam, mix English naturally
Example: "Nokku, ee case il actually enthaanu karyam ennu vachaal..." (friendly)`;
        
        case 'pa-IN':
          return `${voiceGuidelines}
LANGUAGE: Modern Punjabi - friendly and energetic.
TONE: Like a supportive family member.
AVOID: Very formal or literary Punjabi
USE: Everyday spoken Punjabi
Example: "Vekh, is case vich actually ki ho reha hai ki..." (natural)`;
        
        case 'or-IN':
          return `${voiceGuidelines}
LANGUAGE: Modern Odia - simple and conversational.
TONE: Warm and helpful, like a friend from Bhubaneswar.
AVOID: Very formal or classical Odia, complex literary terms
USE: Everyday spoken Odia that young people use
Example: "Dekh, ei case re actually kana heuchi na..." (casual and friendly)
Keep it simple and relatable!`;
        
        default:
          return `${voiceGuidelines}
LANGUAGE: Simple, clear Indian English - the way young Indians talk.
TONE: Like a smart, friendly college senior explaining stuff.
Example: "Okay so basically, here's the thing about your case..."
Keep it casual, relatable, and easy to understand!`;
      }
    };

    const languageInstructions = getLanguageInstructions(detectedLanguage);

    // Handle document summarization request
    if (action === 'summarize' && hasDocument) {
      console.log(`Summarizing document (${documentContent.length} chars), language: ${detectedLanguage}`);
      
      const summaryPrompt = `You are CARE, a friendly Indian legal document expert. Analyze this document and explain it in a warm, conversational way as if speaking to a friend.

${languageInstructions}

DOCUMENT:
${documentContent.slice(0, 6000)}

Explain this document naturally and conversationally. Cover these points but speak them as flowing conversation, not as a formal list:
- What type of document is this
- Who are the people or parties involved
- What are the main terms and obligations
- Any important dates or deadlines to remember
- Things to be careful about or potential concerns
- What I would recommend checking or discussing

Remember: Write as if you're explaining to a friend over chai. No markdown formatting, no bullet points in the spoken version. Just clear, warm, helpful explanation.`;

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
