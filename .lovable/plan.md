

# Plan: Top 3 namen volledig tonen zonder afkorting

## Probleem
De `truncate` CSS-class op regel 115 knipt top 3 namen af met "...". De gebruiker wil volledige namen (met achternaam afgekort als "B." etc.) zonder ellipsis, en een automatisch kleinere font als de naam lang is.

## Wijzigingen — `src/pages/TVRanglijsten.tsx`

### 1. Verwijder `truncate` voor top 3
Regel 115: maak `truncate` conditioneel — alleen toepassen als het GEEN top 3 entry is.

### 2. Automatisch kleinere font voor lange namen in top 3
Voeg een dynamische font-size toe voor top 3 namen op basis van naamlengte:
- Naam ≤ 10 tekens → huidige font (`text-sm font-bold` / `text-xs font-semibold`)
- Naam > 10 tekens → één stap kleiner (`text-xs font-semibold` / `text-[10px] font-semibold`)
- Naam > 15 tekens → nog kleiner (`text-[10px] font-medium`)

Dit zorgt ervoor dat namen als "Christiaan van K." of "Xander Blok" volledig zichtbaar zijn zonder te wrappen of af te knippen.

### 3. Toevoeg `whitespace-nowrap` voor top 3
Zodat de naam altijd op één regel blijft, maar dan met kleinere font i.p.v. afknippen.

### Bestand
- `src/pages/TVRanglijsten.tsx` — regels 109-116

