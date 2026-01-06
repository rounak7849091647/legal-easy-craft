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

    // Language-specific prompts optimized for natural voice output
    const getLanguageInstructions = (lang: string): string => {
      const voiceGuidelines = `
VOICE OUTPUT GUIDELINES (CRITICAL):
- Write in a conversational, warm, and friendly tone as if speaking to a friend
- Use simple, everyday words - avoid jargon
- NEVER use markdown formatting (no **, ##, *, _, etc.)
- NEVER use bullet points or numbered lists in voice responses
- Write complete sentences that flow naturally when spoken aloud
- Use natural transitions like "Also," "By the way," "Another thing," etc.
- Speak politely and respectfully, address the user warmly
- Keep sentences short and easy to follow
- Use pauses naturally by using commas and periods appropriately`;

      switch (lang) {
        case 'hi-IN':
          return `${voiceGuidelines}
LANGUAGE: Respond in pure Hindi (Devanagari script). 
TONE: Speak like a caring, knowledgeable friend - warm and respectful. 
Use polite forms like "आप", "जी", "कृपया". 
Example: "जी, आपका सवाल बहुत अच्छा है। देखिए, इस मामले में कानून कहता है कि..."
Pronounce clearly and use everyday Hindi that everyone understands.`;
        
        case 'hinglish':
          return `${voiceGuidelines}
LANGUAGE: Respond in natural Hinglish (Roman script mix of Hindi-English).
TONE: Speak like a friendly expert who mixes Hindi and English naturally.
Example: "Dekho, aapka case actually quite strong hai. Main samjhata hoon ki aapko kya karna chahiye..."
Use common Hindi words with English legal terms. Be warm and approachable.`;
        
        case 'ta-IN':
          return `${voiceGuidelines}
LANGUAGE: Respond in Tamil (தமிழ்).
TONE: Speak respectfully and warmly, like a trusted advisor.
Use polite forms like "நீங்கள்", "உங்கள்". 
Speak clearly with proper Tamil pronunciation. Use everyday Tamil that is easy to understand.
Example: "நல்ல கேள்வி. பாருங்கள், இந்த விஷயத்தில்..."`;
        
        case 'te-IN':
          return `${voiceGuidelines}
LANGUAGE: Respond in Telugu (తెలుగు).
TONE: Speak warmly and respectfully, like a helpful friend.
Use polite forms like "మీరు", "మీ".
Speak clearly with natural Telugu that flows well when heard.
Example: "చాలా మంచి ప్రశ్న. చూడండి, ఈ విషయంలో..."`;
        
        case 'bn-IN':
          return `${voiceGuidelines}
LANGUAGE: Respond in Bengali (বাংলা).
TONE: Speak warmly like a caring advisor.
Use polite forms like "আপনি", "আপনার".
Example: "দেখুন, আপনার প্রশ্নটি খুবই গুরুত্বপূর্ণ..."`;
        
        case 'mr-IN':
          return `${voiceGuidelines}
LANGUAGE: Respond in Marathi (मराठी).
TONE: Speak respectfully and warmly.
Use polite forms like "आपण", "तुमचा".
Example: "बघा, तुमचा प्रश्न खूप चांगला आहे..."`;
        
        case 'gu-IN':
          return `${voiceGuidelines}
LANGUAGE: Respond in Gujarati (ગુજરાતી).
TONE: Speak warmly and friendly.
Use polite forms like "તમે", "તમારું".
Example: "જુઓ, તમારો સવાલ ખૂબ સારો છે..."`;
        
        case 'kn-IN':
          return `${voiceGuidelines}
LANGUAGE: Respond in Kannada (ಕನ್ನಡ).
TONE: Speak respectfully and clearly.
Use polite forms like "ನೀವು", "ನಿಮ್ಮ".
Example: "ನೋಡಿ, ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಬಹಳ ಒಳ್ಳೆಯದು..."`;
        
        case 'ml-IN':
          return `${voiceGuidelines}
LANGUAGE: Respond in Malayalam (മലയാളം).
TONE: Speak warmly and respectfully.
Use polite forms like "നിങ്ങൾ", "നിങ്ങളുടെ".
Example: "നോക്കൂ, നിങ്ങളുടെ ചോദ്യം വളരെ നല്ലതാണ്..."`;
        
        case 'pa-IN':
          return `${voiceGuidelines}
LANGUAGE: Respond in Punjabi (ਪੰਜਾਬੀ).
TONE: Speak warmly like a helpful friend.
Use polite forms like "ਤੁਸੀਂ", "ਤੁਹਾਡਾ".
Example: "ਦੇਖੋ ਜੀ, ਤੁਹਾਡਾ ਸਵਾਲ ਬਹੁਤ ਵਧੀਆ ਹੈ..."`;
        
        default:
          return `${voiceGuidelines}
LANGUAGE: Respond in simple, clear Indian English.
TONE: Speak like a friendly, helpful legal advisor. Be warm and approachable.
Example: "That's a great question. Let me explain this clearly for you..."`;
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
    
    // Generate English display version if response is in Indian language
    let displayResponse = aiResponse;
    let voiceResponse = aiResponse;
    
    // Check if the response is in a non-English Indian language (has Indic script)
    const isIndicScript = /[\u0900-\u0D7F]/.test(aiResponse);
    
    if (isIndicScript && detectedLanguage !== 'en-IN') {
      // Translate to English for display
      console.log("Translating response to English for display...");
      
      const translateResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { 
              role: "system", 
              content: "You are a translator. Translate the following text to simple English. Keep the meaning intact. Only output the translation, nothing else." 
            },
            { role: "user", content: aiResponse }
          ],
          max_tokens: 800,
          temperature: 0.3,
        }),
      });
      
      if (translateResponse.ok) {
        const translateData = await translateResponse.json();
        displayResponse = translateData.choices?.[0]?.message?.content || aiResponse;
        console.log("Translation successful");
      }
    }
    
    return new Response(
      JSON.stringify({ 
        response: displayResponse, // English for display
        voiceResponse: voiceResponse, // Original language for TTS
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
