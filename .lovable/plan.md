

# Plan: Realistische kosten + omzetopbouw in Groeimodel mock data

Update de mock data in `src/data/groeimodelData.ts` zodat de financiële cijfers in het Synsel Groeimodel een realistisch beeld geven van een nieuwe sales consultant.

## Wijzigingen

### 1. Maandelijkse kosten per consultant
- Bruto maandsalaris: **€ 3.276,49**
- Werkgeverslasten-factor: **× 1,30**
- **Maandkosten = 3.276,49 × 1,30 ≈ € 4.260**

Toegepast als nieuwe basis `BASE_MONTHLY_COST = 4260`. Per consultant blijft er een lichte variatie mogelijk (±5–10%) zodat senioren/medioren iets verschillen, maar het anker is € 4.260/maand.

### 2. Realistische omzetopbouw (marge per maand)
Doel: een **gemiddelde** consultant haalt **€ 150k cumulatieve omzet (= marge in dit model) binnen 12–18 maanden**, met een **niet-rechte, hortende opbouw**.

Curve-vorm per consultant (in plaats van lineair):
```text
   Maand:   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18
   Marge:   2k  3k  5k  4k  7k  9k  8k  12k 14k 11k 16k 18k 17k 20k 22k 19k 24k 26k
                ↑ramp-up    ↑eerste deals   ↑terugval     ↑pijplijn vol
```
Implementatie:
- Basisgroeicurve (S-curve / logistisch) tot een plateau van **±€ 22–26k marge per maand** richting maand 18
- Op die curve een **noise-laag** (±20–30%) en af en toe een **dip** (–40% in 1 maand) zodat het hortend voelt
- Cumulatief over de eerste 12 maanden ≈ € 130k–€ 170k, gemiddeld op **€ 150k**
- Per consultant een eigen profiel via een seed-functie (`seededRandom(consultantId)`) zodat curves verschillen maar deterministisch blijven

### 3. Profielvariatie per archetype
Naast de basis "gemiddelde" curve houden we 3 archetypes (al aanwezig in de data) intact:
- **High performer** — sneller break-even, hoger plateau (~€ 30k/m)
- **Average** — bovenstaande standaard (€ 150k in jaar 1–1,5)
- **Slow starter / terminated** — lagere plateau, eventueel uit dienst vóór break-even

Alle drie gebruiken dezelfde noise/dip-logica, alleen schalingsfactor verschilt.

### 4. Doorwerking
Geen UI-wijzigingen nodig. Alle bestaande tegels (KPI's, CohortChart met pulserende break-even punten, BreakEvenHistogram, Opstartkosten per unit, consultant-tabel) lezen direct uit deze functies en updaten automatisch:
- Opstartkosten dalen/stijgen mee met de nieuwe cost vs marge balans
- Break-even maand komt voor de gemiddelde consultant typisch rond **maand 7–10** uit
- Cohort-grafiek toont een duidelijk hortende lijn i.p.v. rechte trend

## Bestanden

| Bestand | Wijziging |
|---|---|
| `src/data/groeimodelData.ts` | Nieuwe constanten `BASE_GROSS_SALARY = 3276.49`, `EMPLOYER_LOAD = 1.30`, `BASE_MONTHLY_COST ≈ 4260`. Helper `buildMarginCurve(consultantId, archetype)` met S-curve + seeded noise + occasionele dip. Bestaande lifecycle-generator gebruikt deze nieuwe helpers; archetype-schaling behouden. |

Geen wijzigingen aan componenten of routes — puur data-laag.

