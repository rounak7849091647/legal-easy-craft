

## What You're Asking For

You want to integrate the OpenAI Agents SDK (`@openai/agents`) with `gpt-4.1-nano` into your legal chat. There is no "lyzr agent" in the codebase -- your project already uses the Lovable AI Gateway with `google/gemini-2.5-flash`.

## The Problem

The `@openai/agents` SDK is a **Node.js package** that cannot run in this project's backend environment (Deno-based edge functions). The models `gpt-4.1-nano` and the Agent/Runner pattern from that SDK are not compatible with Lovable Cloud.

## What We Can Do Instead

Your current `legal-chat` edge function already implements the **exact same behavior** described in the agent config you shared -- same system prompt, same BNS knowledge, same voice guidelines, same lawyer referral logic. The only differences are:

| Your Agent Config | Current Implementation |
|---|---|
| `gpt-4.1-nano` | `google/gemini-2.5-flash` (available via Lovable AI) |
| `temperature: 0.87` | `temperature: 0.3` |
| `maxTokens: 2048` | `max_tokens: 500` |
| OpenAI Agents SDK | Direct API call (works in Deno) |

## Proposed Changes

Update the existing `legal-chat` edge function to match your desired agent settings:

1. **Increase `max_tokens` from 500 to 2048** -- allows much longer, more detailed responses
2. **Adjust `temperature` from 0.3 to 0.87** -- makes responses more creative/conversational (note: this is quite high and may reduce accuracy for legal advice; recommend 0.5-0.6 as a middle ground)
3. **Keep `google/gemini-2.5-flash`** since `gpt-4.1-nano` is not available on the Lovable AI Gateway; alternatively switch to `google/gemini-3-flash-preview` (latest model)
4. **System prompt stays the same** -- it already matches what you defined in the agent instructions

### Files to Edit
- `supabase/functions/legal-chat/index.ts` -- update model parameters (temperature, max_tokens, optionally model name)

### No Changes Needed
- No new packages or SDKs
- No database changes
- Client-side code stays the same
- BNS knowledge base stays the same

