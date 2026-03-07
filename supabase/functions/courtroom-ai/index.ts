import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CourtroomRequest {
  action: 'analyze' | 'simulate_phase' | 'judgment' | 'user_input';
  documentContent?: string;
  caseAnalysis?: any;
  phase?: string;
  previousArguments?: any[];
  userRole?: 'accused' | 'complainant';
  userMessage?: string;
}

const PHASES = [
  'case_introduction',
  'opening_prosecution',
  'opening_defense',
  'evidence_presentation',
  'prosecution_argument',
  'defense_argument',
  'judge_questions',
  'closing_prosecution',
  'closing_defense',
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CourtroomRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const callAI = async (messages: any[], maxTokens = 1500) => {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
          max_tokens: maxTokens,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return { error: "Rate limit exceeded. Please wait a moment.", status: 429 };
        }
        if (response.status === 402) {
          return { error: "Payment required. Please add credits.", status: 402 };
        }
        const text = await response.text();
        console.error("AI error:", response.status, text);
        throw new Error("AI gateway error");
      }

      const data = await response.json();
      return { content: data.choices?.[0]?.message?.content || "" };
    };

    // ACTION: ANALYZE CASE
    if (body.action === 'analyze') {
      const docContent = (body.documentContent || '').slice(0, 15000);
      
      const result = await callAI([
        {
          role: "system",
          content: `You are an expert Indian legal case analyzer. Analyze the provided legal documents and extract structured information. You must respond in valid JSON format only, no markdown.`
        },
        {
          role: "user",
          content: `Analyze these legal documents and return a JSON object with these exact keys:
{
  "caseType": "string - type of case (criminal/civil/family/property/etc)",
  "caseTitle": "string - brief title for the case",
  "parties": {
    "complainant": "string - name/description of complainant",
    "accused": "string - name/description of accused"
  },
  "keyIssues": ["array of key legal issues"],
  "evidenceSummary": ["array of key evidence points"],
  "claims": ["array of claims by complainant"],
  "counterClaims": ["array of potential counterclaims"],
  "applicableLaws": ["array of relevant laws/sections"],
  "caseSummary": "string - 3-4 sentence summary of the case"
}

Documents:
${docContent}`
        }
      ], 2000);

      if (result.error) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: result.status, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      let parsed;
      try {
        const jsonStr = result.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsed = JSON.parse(jsonStr);
      } catch {
        parsed = { caseSummary: result.content, caseType: "General", caseTitle: "Case Analysis", parties: { complainant: "Party A", accused: "Party B" }, keyIssues: [], evidenceSummary: [], claims: [], counterClaims: [], applicableLaws: [] };
      }

      return new Response(JSON.stringify({ analysis: parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ACTION: SIMULATE PHASE
    if (body.action === 'simulate_phase') {
      const { caseAnalysis, phase, previousArguments, userRole } = body;
      const analysis = JSON.stringify(caseAnalysis);
      const prevArgs = previousArguments?.map(a => `[${a.speaker}]: ${a.content}`).join('\n') || 'None yet.';

      let phasePrompt = '';
      let speaker = '';

      switch (phase) {
        case 'case_introduction':
          speaker = 'Judge';
          phasePrompt = `You are an AI Judge in an Indian courtroom. Introduce the case formally. State the case type, parties involved, and the charges/claims. Set the tone for a fair hearing. Be authoritative but neutral. Address both counsels. Keep it to 4-6 sentences.`;
          break;
        case 'opening_prosecution':
          speaker = 'Prosecution Lawyer';
          phasePrompt = `You are the Prosecution/Complainant's Lawyer in an Indian courtroom. Deliver your opening statement. Present the key claims, outline the evidence you will present, and state what you aim to prove. Be persuasive but factual. 5-7 sentences.`;
          break;
        case 'opening_defense':
          speaker = 'Defense Lawyer';
          phasePrompt = `You are the Defense Lawyer in an Indian courtroom. Deliver your opening statement. Challenge the prosecution's claims, outline your defense strategy, and state your client's position. Be assertive and logical. 5-7 sentences.`;
          break;
        case 'evidence_presentation':
          speaker = 'Judge';
          phasePrompt = `You are the AI Judge. Review and present the key evidence from both sides. Summarize what each piece of evidence suggests, note any gaps or inconsistencies. Be thorough and neutral. 6-8 sentences.`;
          break;
        case 'prosecution_argument':
          speaker = 'Prosecution Lawyer';
          phasePrompt = `You are the Prosecution Lawyer. Present your main legal arguments. Cite relevant Indian laws and sections. Connect evidence to your claims. Build a compelling case. 6-8 sentences.`;
          break;
        case 'defense_argument':
          speaker = 'Defense Lawyer';
          phasePrompt = `You are the Defense Lawyer. Present your counter-arguments. Challenge the prosecution's legal reasoning. Cite defense-favorable laws and precedents. Highlight weaknesses in the prosecution's case. 6-8 sentences.`;
          break;
        case 'judge_questions':
          speaker = 'Judge';
          phasePrompt = `You are the AI Judge. Ask 3-4 critical questions to both sides that address key uncertainties in the case. These should be probing questions that would help clarify the facts and legal positions. Format as numbered questions addressed to specific parties.`;
          break;
        case 'closing_prosecution':
          speaker = 'Prosecution Lawyer';
          phasePrompt = `You are the Prosecution Lawyer. Deliver your closing statement. Summarize your strongest points, remind the court of key evidence, and make your final plea. Be passionate but grounded in law. 5-7 sentences.`;
          break;
        case 'closing_defense':
          speaker = 'Defense Lawyer';
          phasePrompt = `You are the Defense Lawyer. Deliver your closing statement. Summarize why the defense should prevail, address any weak points raised, and make your final appeal. Be convincing and empathetic. 5-7 sentences.`;
          break;
        default:
          speaker = 'Judge';
          phasePrompt = 'Provide a brief court proceeding update.';
      }

      const result = await callAI([
        {
          role: "system",
          content: `${phasePrompt}

Case Analysis: ${analysis}

Previous proceedings:
${prevArgs}

IMPORTANT: Do NOT use any markdown formatting (no **, ##, bullets). Write in plain conversational court language. Stay strictly within Indian legal framework. Do not fabricate laws or sections.`
        },
        {
          role: "user",
          content: `Proceed with the ${phase?.replace(/_/g, ' ')} phase of this courtroom hearing.`
        }
      ], 800);

      if (result.error) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: result.status, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({
        speaker,
        phase,
        content: result.content,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ACTION: JUDGMENT
    if (body.action === 'judgment') {
      const { caseAnalysis, previousArguments } = body;
      const analysis = JSON.stringify(caseAnalysis);
      const allArgs = previousArguments?.map(a => `[${a.speaker}]: ${a.content}`).join('\n\n') || '';

      const result = await callAI([
        {
          role: "system",
          content: `You are an AI Judge delivering a final judgment in an Indian courtroom simulation. You must be completely neutral and base your judgment strictly on law, evidence, and logical reasoning.

Structure your judgment as follows (use plain text, no markdown):

CASE SUMMARY:
[2-3 sentences summarizing the case]

LEGAL ANALYSIS:
[Analysis of the legal issues and applicable laws]

EVALUATION OF EVIDENCE:
[Assessment of evidence presented by both sides]

APPLICATION OF LAW:
[How the relevant laws apply to the facts]

REASONING:
[Your logical reasoning for the decision]

FINAL DECISION:
[Clear statement of the judgment]

SUGGESTED NEXT STEPS:
[2-3 practical steps for the parties]

Case Analysis: ${analysis}

Full proceedings:
${allArgs}

IMPORTANT: Be fair, neutral, and thorough. Do not fabricate legal sections. Base everything on the evidence and arguments presented.`
        },
        {
          role: "user",
          content: "Deliver the final judgment for this case."
        }
      ], 2500);

      if (result.error) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: result.status, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({
        judgment: result.content,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Courtroom AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
