

# Ranglijsten TV Dashboard: Top 10 highlight, vergelijkingsbalk & auto-swap

## Wat verandert er

### 1. Top 10 visueel markeren
De eerste 10 entries in elke kolom krijgen een subtiele achtergrondkleur en dikker lettertype om ze te onderscheiden van de rest. De top 3 krijgt extra nadruk (goud/zilver/brons accentkleur links).

### 2. Vergelijkingsbalk onder het scorecard-getal
Onder elk groot totaalgetal komt een compacte vergelijkingsbalk die het huidige weekcijfer vergelijkt met de vorige periode. Dit toont:
- Een horizontale balk (huidige waarde vs. vorige periode)
- Een delta-label (bijv. "+12%" of "-5%") met kleurcodering (groen/rood)
- Tekst "t.o.v. vorige periode"

### 3. Standaard filter op "deze week"
De pagina opent standaard op de huidige week in plaats van een generieke "Week" filter.

### 4. Auto-swap in TV modus
In fullscreen TV modus wisselt de pagina automatisch (elke ~10 seconden) tussen de "Week" en "Periode" weergave. Een indicator toont welke view actief is.

## Visueel ontwerp

```text
+------------------------------------------+
| Inschrijvingen                           |
|                                          |
|  1.830                                   |
|  [====== huidige ======]                 |
|  [==== vorige ====    ] +8% t.o.v. P5    |
|                                          |
|  1. Elmar Koopman          125  <-- goud |
|  2. Bas de Ruiter           95  <-- zilver|
|  3. Jort Koggel             93  <-- brons|
|  4. Thom Auf der Heide      88  <-- top10|
|  ...                                     |
| 10. Thijs Udink             65  <-- top10|
| 11. Joey Pol                63  <-- gewoon|
+------------------------------------------+
```

## Technische aanpak

### `src/data/ranglijstenData.ts`
- Voeg `previousTotal` toe aan `RankingColumn` interface (vergelijkingswaarde vorige periode)
- Voeg `ranglijstenWeekColumns` en `ranglijstenPeriodeColumns` toe als aparte datasets
- Voeg mock data toe voor beide views met realistische maar verschillende getallen

### `src/pages/TVRanglijsten.tsx`
- Importeer `useTVCompact` uit TVDashboardLayout
- Voeg state toe voor actieve view (`"week" | "periode"`)
- In TV modus: `useEffect` met `setInterval` (10s) die tussen week/periode wisselt
- In normale modus: toon week (standaard), periode switchen via filter
- Per ranking entry: conditionele styling voor top 3 (goud/zilver/brons linkerborder) en top 4-10 (lichte achtergrond)
- Onder het totaalgetal: vergelijkingsbalk component met `previousTotal` data
- Voeg een subtiele "Week / Periode" indicator toe in TV modus die toont welke view actief is

### Styling details
- Top 3: linkerborder 3px (rank 1: `border-l-amber-400`, rank 2: `border-l-slate-400`, rank 3: `border-l-orange-400`) + `bg-amber-50/50` achtergrond
- Top 4-10: `bg-muted/30` achtergrond
- Vergelijkingsbalk: twee geneste divs met `bg-primary/20` (vorige) en `bg-primary` (huidige), hoogte 6px, afgerond
- Auto-swap indicator: kleine pill/badge rechtsboven met "Week" of "Periode" + fade-transitie

### Samenvatting bestanden

| Bestand | Actie |
|---------|-------|
| `src/data/ranglijstenData.ts` | Wijzig - voeg previousTotal, week/periode datasets toe |
| `src/pages/TVRanglijsten.tsx` | Wijzig - top 10 styling, vergelijkingsbalk, auto-swap logica |

