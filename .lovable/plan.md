
## Goal
Add red "Dev info" popover badges (using existing `TileInfo` component from `src/components/funnel-ops/TileInfo.tsx`) to several elements on `/reengagement` → Dashboard tab (`src/pages/reengagement/tabs/ReengagementDashboardTab.tsx`).

## Changes in `ReengagementDashboardTab.tsx`

1. **KPI cards (Verzonden, Reacties, Inschrijven)** — top-right of each card, render `<TileInfo>`:
   - Verzonden → `what: "count amount of send mail and whatsapp messages together"`
   - Reacties → `what: "count amount of reactions on mail and whatsapp messages together"`
   - Inschrijven → `what: "count unique (one candidate counts as 1 every 7 days) status changes from all statusses except 'acquisitie' and 'in procedure' to 'inschrijven'"`
   - Layout: wrap CardContent header in a flex row so the badge sits top-right while label/value remain left.

2. **Berichttype table** — add `<TileInfo>` in the `CardHeader`, left side (currently header only has the Show % switch on the right). Use a multi-line `what` (TileInfo supports plain text via `what`; preserve line breaks with `\n` — verify TileInfo renders `\n` correctly; if not, pass content via `notes` or extend rendering). Lines:
   ```
   gelezen = count amount of opened/read messages
   % gelezen = gelezen * 100 / verzonden
   % reactie = reactie * 100 / gelezen
   % inschrijven = inschrijven * 100 / reactie
   verzonden failed = amount of messages we tried to send but failed/bounced
   % failed = amount of failed messages * 100 / total amount of messages we tried to send
   ```
   Rendering note: TileInfo currently renders `what` inside a `<p>` with `leading-relaxed`. To preserve line breaks, add `whitespace-pre-line` to that `<p>` (small tweak to `TileInfo.tsx`) OR put the list into the `formula` field which uses a `<pre>` block. Plan: use `formula` field since it's already preformatted and monospaced — fits a rule list well. Set `what: "Berekeningen achter de kolommen van de berichttype-tabel."` and put the 6 lines in `formula`.

3. **Highlights card** — add `<TileInfo>` to the CardHeader (right side of the title row). Content:
   - Title: "Highlights"
   - `what` (multi-line, use `whitespace-pre-line` or put as `formula`):
     ```
     Niet kunnen spreken (18): show here the message flow name of the flow that generated the most amount of inschrijven + show the amount of inschrijven
     Bezig met studie (8,6%): show here the message flow name of the flow that generated the highest % reactie as calculated in the table above + show the % reactie number
     ZZP/Freelance (-6,4%): show the message flow name which showed the highest drop off rate if we compare the amount of inschrijven from the selected time period to the period before, show the drop off in %
     ```
   - Same rendering approach as the table dev info.

## Small tweak to `TileInfo.tsx`
Add `whitespace-pre-line` to the `<p>` that renders `what`, so multi-line strings render correctly. No API change.

## Out of scope
No data/business-logic changes; visual + popover content only.
