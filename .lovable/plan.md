

# Plan: Fixes voor Ranglijsten — sortering, mockdata, responsive fonts

## 1. Sortering "op naam" fix — `TVRanglijsten.tsx`
De sorteeroptie "op naam" bij Inschrijvingen sorteert nu alfabetisch. Dat is verkeerd. "Op naam" betekent sorteren op het zwarte hoofdcijfer (`value` = "op naam"). "Op gedaan" sorteert op het groene cijfer (`valueDone`).

**Fix**: In `sortEntries`, wijzig `mode === "name"` van `a.name.localeCompare(...)` naar `b.value - a.value` (aflopend op value). Hernoemd intern naar `"value"` i.p.v. `"name"`. Default voor Inschrijvingen wordt `"value"`.

Dropdown-labels blijven: "Op naam" en "Op gedaan" — maar "Op naam" mapt nu naar sortering op `value`.

## 2. Mockdata Intakes logisch maken — `ranglijstenData.ts`
Probleem: Intakes en Acquisities worden onafhankelijk gegenereerd, waardoor iemand 4 intakes kan hebben maar 1 acquisitie (onmogelijk: intakes ≤ acquisities).

**Fix**: In de post-processing stap (regel 270-282), naast het zetten van `valueDone` op intakes, ook de intake-waarde zelf clampen: `entry.value = Math.min(entry.value, entry.valueDone)`. Zo kan het aantal intakes nooit hoger zijn dan het aantal acquisities. Herbereken daarna `total` en re-rank.

Ook: als `valueDone` (acquisities) 0 is, toon dan `0%` i.p.v. niets. Fix in `TVRanglijsten.tsx`: verwijder de conditie `entry.valueDone > 0` bij isRatioOnly rendering — toon altijd het percentage (0% als valueDone=0).

## 3. Responsive font-scaling — `TVRanglijsten.tsx`
Probleem: bij smallere schermen overlappen tekst en cijfers in de top-3, en kolomtitels worden afgekapt.

**Fix**: Gebruik CSS `clamp()` via Tailwind arbitrary values voor dynamische font-sizing:
- Kolomtitel (`headerTitle`): verwijder `truncate`, gebruik `text-[clamp(8px,1.1vw,12px)]` zodat de volledige titel altijd zichtbaar is
- Top-3 namen: gebruik `text-[clamp(8px,1vw,14px)]` i.p.v. vaste `text-[10px]`/`text-sm`
- Top-3 cijfers (value + valueDone): gebruik `text-[clamp(10px,1.2vw,16px)]` 
- Hoofd-totaal: `text-[clamp(20px,2.5vw,30px)]` i.p.v. vaste `text-3xl`
- Secundaire totalen: `text-[clamp(12px,1.5vw,18px)]`

Dit zorgt ervoor dat bij minder kolommen de font groter is, en bij meer kolommen alles proportioneel krimpt zonder overlap of afkapping.

## Bestanden
- `src/data/ranglijstenData.ts` — clamp intakes ≤ acquisities
- `src/pages/TVRanglijsten.tsx` — sort fix, ratioOnly 0% fix, responsive clamp fonts

