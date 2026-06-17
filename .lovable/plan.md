## Goal
Restyle the call transcript shown in the LC-B communication pane (`CommunicationPane.tsx`) to match the richer layout in the first screenshot: per-line rows with timestamp gutter, speaker name + role badge (Ontvanger/Beller), color-coded utterance text, and a "Kopiëren" header action.

## Changes

### 1. `src/data/lcbMarketData.ts` — structured transcript
- Replace `transcript?: string` on `ActivityItem` with `transcript?: TranscriptLine[]` where:
  ```ts
  interface TranscriptLine { t: string; speaker: string; role: "Ontvanger" | "Beller"; text: string; }
  ```
- Update `buildTranscript(rnd)` to return an array of 6–12 lines with:
  - Incrementing `t` mm:ss timestamps (random 1–8s gaps)
  - Alternating roles starting with consultant as "Ontvanger" and candidate/contact as "Beller"
  - Speaker names derived from the activity's contact (passed in) and a fixed consultant pool name
  - More varied Dutch utterances (greeting, smalltalk, voorstel, planning, afsluiting)
- Pass `item.contact` and a chosen consultant name into `buildTranscript` at the two call sites.

### 2. `src/components/manager/lcb/CommunicationPane.tsx` — new visual
Replace the current `<div className="rounded-md border ... font-mono whitespace-pre-wrap">` block with a card matching the screenshot:

- Header row inside the card:
  - Left: speech-bubble icon + bold "Transcriptie"
  - Right: ghost button "Kopiëren" (copy icon) that copies the joined transcript text to clipboard
- Body: list of rows, each row a 3-column grid `[timestamp | speaker block | utterance]`
  - Timestamp: `text-[10px] text-muted-foreground tabular-nums` (e.g. `00:00`)
  - Speaker block: bold name + small role badge
    - `Ontvanger`: neutral muted badge (`bg-muted text-muted-foreground border-border`)
    - `Beller`: amber badge (`bg-amber-500/10 text-amber-600 border-amber-500/30`)
  - Utterance text colored per role:
    - `Ontvanger`: `text-blue-600 dark:text-blue-400`
    - `Beller`: `text-amber-600 dark:text-amber-400`
  - Row separators via `border-b border-border/60`, last row no border
- Fallback "Transcript niet beschikbaar." preserved when array is empty/missing.

No changes to the email branch, the call-header metadata, or the "link to call" button.

## Out of scope
- Email body styling
- The Pane chrome / split overlay
- Real data wiring; this remains mock data
