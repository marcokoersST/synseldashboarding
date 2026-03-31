

# Plan: Acquisities/Voorstellen integratie + afgeronde percentages

## Wat verandert

### 1. Percentages afronden (zonder decimaal)

**Bestand: `src/pages/TVRanglijsten.tsx`**

Regel 136: wijzig `.toFixed(1)` naar `Math.round(...)` zodat percentages als `59%` verschijnen i.p.v. `59.4%`. Dit geldt zowel voor de entry-rijen als de header-totalen.

### 2. Acquisities/Voorstellen kolom samenvoegen

**Gewenst header design:**
```text
┌─────────────────────────────┐
│  ACQUISITIES / VOORSTELLEN  │  ← titel
│                             │
│  106  acquisities           │  ← groot getal + "acquisities" in muted kleur
│  ✅ 62  voorstellen  (58%)  │  ← groen vinkje + groen getal + "voorstellen" groen + % grijs
│                             │
│  ████████████░░░░           │  ← comparison bar
│  ↗ +7% t.o.v. vorige periode│
└─────────────────────────────┘
```

**Gewenste entry-rij:**
```text
1.  Jort Koggel    10  ✅ 6  (60%)
```

### 3. Data — `src/data/ranglijstenData.ts`

- In `generateColumns`: voor de kolom "Acquisities", genereer `valueDone` per entry op basis van de corresponderende "Voorstellen"-waarden. Concreet: gebruik de Voorstellen-ranking voor dezelfde consultant om `valueDone` te vullen (of genereer een ratio 40-80% van acquisities).
- Voeg `totalDone` en `previousTotalDone` toe aan de Acquisities kolom.
- Verwijder de "Voorstellen" kolom uit `columnTitles` (van 7 naar 6 kolommen).
- Update `baseWeekTopValues` en `basePeriodeTopValues` arrays: verwijder de Voorstellen-index (index 2).
- Update `STATUS_ICON_COLUMNS` in TVRanglijsten.tsx: verwijder "Voorstellen".

### 4. UI — `src/pages/TVRanglijsten.tsx`

- **Header rendering**: Pas de `isInschrijvingen`-check aan naar een generieke check die ook "Acquisities" omvat. Beide kolommen krijgen dezelfde dual-value header structuur:
  - Acquisities: titel "ACQUISITIES / VOORSTELLEN", label "acquisities" (muted), "voorstellen" (groen)
  - Inschrijvingen: bestaande structuur blijft (titel "INSCHRIJVINGEN", "op naam", "gedaan")
- **Entry rows**: De bestaande `valueDone` rendering werkt al generiek — zodra de data `valueDone` bevat voor Acquisities-entries, verschijnt het groene vinkje + getal + percentage automatisch.

### Bestanden
- `src/data/ranglijstenData.ts` — Voorstellen kolom verwijderen, valueDone toevoegen aan Acquisities
- `src/pages/TVRanglijsten.tsx` — header dual-value voor Acquisities, percentages afronden

