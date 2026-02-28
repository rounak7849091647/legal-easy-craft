
### Clear result (what is actually broken)

Do I know what the issue is? **Yes.**

Your iPhone is **not blocking speech-to-text by itself**.  
Audio capture is working on iOS (the backend receives `audio/mp4`), but transcription fails afterward.

Evidence from backend logs:
- `Processing audio transcription, mimeType: audio/mp4; codecs=mp4a.40.2`
- then `Whisper API error: 401 ... invalid_api_key`

So the failure point is **backend transcription authentication**, not iOS mic capture.

---

### Why Android/desktop work but iPhone fails

- Android/desktop path uses browser speech recognition (`useSpeechRecognition`) and can work without the Whisper backend.
- iOS path is forced to Whisper recording/transcription (`useWhisperRecognition`), so it depends on backend STT API credentials.
- Therefore iOS fails first and hardest when backend STT auth is wrong.

---

### Implementation plan to fix all likely failure scenarios

## 1) Fix backend STT credential source and error classification
**File:** `supabase/functions/voice-to-text/index.ts`

- Switch Whisper auth to the correct key source for OpenAI transcription calls (`OPENAI_API_KEY`), instead of using the gateway key intended for chat completions.
- Keep strict validation: if STT key missing, return explicit error code (`stt_key_missing`) instead of generic fallback text.
- Add structured error mapping:
  - `401` -> `stt_auth_invalid`
  - `429` -> `stt_quota_exceeded`
  - `5xx` -> `stt_provider_unavailable`
  - malformed/unsupported audio -> `stt_audio_invalid`
- Return machine-readable payload:
  - `ok`, `errorCode`, `userMessage`, `retryable`, `detectedLanguage`, `text`
- Keep MIME and extension handling for iOS `audio/mp4` as-is (already correct).

## 2) Improve iOS client handling for every common failure mode
**File:** `src/hooks/useWhisperRecognition.ts`

- Preserve current iOS-safe capture flow (`getUserMedia` first in gesture chain).
- Improve MIME fallback order and logging of selected recorder MIME type.
- Reduce false “empty recording” drops by adjusting minimum blob threshold (current 1000 bytes is too aggressive for very short commands on some iPhones).
- Parse backend `errorCode` and surface specific messages:
  - invalid key
  - quota exceeded
  - temporary provider outage
  - invalid/too-short audio
- Add retry-safe behavior:
  - clear recorder/stream state consistently after failures
  - do not silently resolve empty text on backend hard errors

## 3) Add graceful fallback strategy in UI for iOS
**Files:** `src/components/ChatInput.tsx`, `src/components/AiOrb.tsx`

- If Whisper backend returns hard STT errors, show actionable guidance inline:
  - “Voice service unavailable right now. You can type, or retry in a moment.”
- If browser speech recognition is available on that iOS version, offer optional fallback path.
- Keep current push-to-talk UX but ensure stop/send always reflects latest hook error state.

## 4) Add lightweight STT diagnostics (non-invasive)
**Files:** `src/hooks/useWhisperRecognition.ts`, `src/components/ChatInput.tsx` (small UI hint)

- Track and expose:
  - `selectedMimeType`
  - `lastErrorCode`
  - `lastFailureStage` (`capture` | `upload` | `transcription`)
- This makes future troubleshooting immediate without guessing whether mic, codec, network, or provider failed.

## 5) Validate end-to-end with a strict device matrix
- iPhone Safari + iPhone Chrome:
  - first-time mic permission flow
  - short command (1–2 words)
  - normal sentence (3–8 seconds)
  - repeated attempts (3+ cycles)
- Confirm each step:
  - recording state starts
  - audio is sent
  - transcript returns
  - message is actually posted to chat

---

### Expected outcome after this fix

- iOS Safari/Chrome will no longer fail due to hidden backend auth mismatch.
- When STT provider has quota/outage issues, users get explicit error states and fallback behavior instead of “it’s not listening.”
- You’ll have deterministic diagnostics to identify any remaining edge cases quickly.

---

### Technical note on scope

- No database schema changes are needed.
- This is a backend-function + client voice-flow hardening update only.
