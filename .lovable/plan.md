

# Changes: Personal Dashboard URL + Email Detail Metrics

## 1. Personal Dashboard — Dedicated URL with user code

### Current state
The consultant dashboard is at `/` (Index page). No user identification in the URL.

### Change
- Add a new route: `/personal-dashboard/:userCode` that renders the same `Index` component
- Keep `/` as a redirect or default (redirects to `/personal-dashboard/user=default` or renders Index directly for backward compatibility)
- The `Index` component reads `userCode` from `useParams()` — for now it's cosmetic (no backend), but the URL structure is in place

### Files changed
- `src/App.tsx` — add route `/personal-dashboard/:userCode` pointing to `Index`
- `src/pages/Index.tsx` — optionally read `useParams().userCode` for future use

---

## 2. Email Detail Card — Replace TTFR + Volgende actie with Deal Stage Counters

### Current state (screenshot matches code)
The detail view shows a 2×2 grid at the top:
- Verstuurd | Ontvangen
- **TTFR Score** | **Volgende actie**

### Change
Replace the TTFR Score and Volgende actie cells with a new section showing email counts per deal stage. The 8 deal stages to display:

| Code | Label |
|------|-------|
| 2.0 | Kandidaat voorgesteld |
| 2.1 | Reminder verstuurd |
| 2.3 | Lopende zaak |
| 3.0 | 1e gesprek nog inplannen |
| 3.1 | 1e sollicitatiegesprek |
| 3.2 | Inplannen vervolggesprek |
| 3.3 | Vervolggesprek |
| 3.4 | Deal sluiter |

### Implementation
- In `mailData.active`, remove `ttfrScore` and `timeToNextAction`, add `emailsPerDealStage` array with `{ code, label, count }` entries (dummy counts)
- In `MailDetailView`, replace the TTFR/Volgende actie grid cells with a compact list or 2×4 grid showing each deal stage code + count
- Each cell: stage code as label (e.g. "2.0"), short name below, count as the big number
- Keep the rest of the detail view unchanged (Verstuurd, Ontvangen, Verdieping section, Reply rate, Gem. reactietijd)

### Layout in detail mode
```text
┌──────────────────────────────────────┐
│  Verstuurd        Ontvangen          │
│  156              243                │
├──────────────────────────────────────┤
│  EMAILS PER DEALSTAGE                │
│  2.0 Kand. voorgesteld    24         │
│  2.1 Reminder verstuurd   18         │
│  2.3 Lopende zaak          9         │
│  3.0 1e gesprek inplannen 15         │
│  3.1 1e sollicitatie      12         │
│  3.2 Inplan. vervolg       8         │
│  3.3 Vervolggesprek        6         │
│  3.4 Deal sluiter          4         │
├──────────────────────────────────────┤
│  VERDIEPING                          │
│  Per procedure | Per acquisitie | .. │
│  Reply rate    | Gem. reactietijd    │
└──────────────────────────────────────┘
```

### Files changed
- `src/components/dashboard/CommunicationStatsCard.tsx` — update `mailData.active`, rewrite top section of `MailDetailView`

