## Three fixes to Outreach Historie list (`CandidateDetailPane.tsx`) + 1 data tweak (`lcbMarketData.ts`)

### 1. Status badge no longer expands row height
Cause: "Geen contactpersoon" wraps to two lines inside the pill.
Fix: add `whitespace-nowrap` to the status badge in the Outreach Historie row (and align header). Badges stay one line, so the row stays one line tall.

### 2. Onderwerp for calls
`getCandidateActivity` currently leaves `subject` undefined for `kind === "call"`. Add a separate `callSubjects` pool with call reasons (e.g. "Telefonische intake", "Opvolging beschikbaarheid", "Pitch nieuwe rol", "Salaris-/voorwaarden bespreken", "Status update kandidaat", "No-show navragen") and assign it to `subject` when `kind === "call"`. The summary "latest activity" strip already falls back to `subject`, so it benefits too. No type change needed.

### 3. New "Contact" link column
Add a 7th column at the right of the Outreach Historie table: a small external-link icon linking to `https://app.recruitcrm.io/v2/contacts` (target=_blank, rel=noopener, stopPropagation). Update the grid template:
`16px 140px 110px minmax(0,1fr) 64px 110px 24px`
Add header label "Link" (or empty) and a matching cell with an `ExternalLink` icon.

### Out of scope
EmailsTab / CallsTab tables (already have a Link column) — no changes.
