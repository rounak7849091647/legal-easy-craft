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
    const { message, sessionId } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Lyzr AI Agent
    const response = await fetch("https://agent-prod.studio.lyzr.ai/v3/inference/chat/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "sk-default-JSM3itvTdVOAC09TNO9aFFBYi0fei3uQ",
      },
      body: JSON.stringify({
        user_id: "legalcareai-user",
        agent_id: "693a859a1a5f30753c13afa1",
        session_id: sessionId || `session-${Date.now()}`,
        message: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lyzr API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get response from AI agent" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ 
        response: data.response || data.message || data.text || JSON.stringify(data),
        sessionId: sessionId || `session-${Date.now()}`
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
