

# Fix iOS Audio Input Issues

## Problem Analysis

iOS devices (Safari/WebKit) have several strict restrictions that cause audio input failures:

1. **MediaRecorder codec support**: iOS Safari does NOT support `audio/webm`. The current code tries `audio/webm;codecs=opus` first, which fails silently on iOS.
2. **AudioContext not unlocked**: The `useMobileAudio` hook exists but is never called before starting recording on iOS, meaning the AudioContext may remain suspended.
3. **getUserMedia constraints**: iOS works better with explicit audio constraints (`echoCancellation`, `noiseSuppression`).
4. **Missing error handling for iOS-specific failures**: No specific detection or recovery for iOS permission/codec issues.
5. **Auto-restart logic leaking into iOS**: Some `useEffect` hooks may attempt to call `startListening` outside a user gesture, which iOS blocks.

## Solution

### 1. Fix `useWhisperRecognition.ts` - iOS-first codec detection

Reorder MIME type priority to try `audio/mp4` before `audio/webm` on iOS, add better audio constraints, and improve error messages for iOS-specific failures.

```text
Changes:
- Import isIOSDevice helper
- Reorder mimeTypes: prioritize 'audio/mp4' on iOS
- Add echoCancellation/noiseSuppression to getUserMedia constraints
- Add iOS-specific error messages (e.g., "Enable microphone in Settings > Safari")
- Add a safety check: if MediaRecorder is not available, throw a clear error
```

### 2. Fix `useMobileAudio.ts` - Integrate audio unlock into recording flow

Ensure `unlockAudio()` is called as part of the recording start flow on iOS, within the same user gesture.

```text
Changes:
- Export a standalone unlockAudioContext() function
- Call it at the top of startRecording in useWhisperRecognition
```

### 3. Fix `AiOrb.tsx` - Unlock audio on first iOS tap

Call `unlockAudio()` at the start of `handleOrbClick` before any recording starts, ensuring it happens within the user gesture context.

```text
Changes:
- Import useMobileAudio hook
- Call unlockAudio() at the beginning of handleOrbClick
```

### 4. Fix `ChatInput.tsx` - Same audio unlock for mic button

Apply the same audio unlock pattern to the ChatInput mic button handler.

```text
Changes:
- Import useMobileAudio hook
- Call unlockAudio() at the beginning of handleMicClick
```

### 5. Fix `voice-to-text` Edge Function - Handle iOS audio format

Ensure the edge function correctly handles `audio/mp4` MIME type from iOS recordings.

```text
This already handles mp4 - just verify the mapping is correct (it is).
No changes needed here.
```

## Technical Details

### MIME Type Priority (iOS vs Android/Desktop)

```text
iOS:     ['audio/mp4', 'audio/wav', 'audio/webm', '']
Others:  ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', '']
```

### Audio Unlock Flow (iOS)

```text
User taps mic button
  -> unlockAudioContext() [creates/resumes AudioContext, plays silent buffer]
  -> getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
  -> new MediaRecorder(stream, { mimeType: 'audio/mp4' })
  -> recorder.start(500)
```

### Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useWhisperRecognition.ts` | iOS-first codec detection, better constraints, clearer errors |
| `src/hooks/useMobileAudio.ts` | Export standalone unlock function for use in recording flow |
| `src/components/AiOrb.tsx` | Call audio unlock on first tap |
| `src/components/ChatInput.tsx` | Call audio unlock on mic click |

