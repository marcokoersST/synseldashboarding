

# Plan: Voorstellen/Acquisities ratio corrigeren in mockdata

## Probleem

De huidige mockdata heeft voorstellen als 40-80% van acquisities (dus minder voorstellen dan acquisities). In werkelijkheid zijn er ~15 voorstellen nodig per acquisitie. Voorstellen is dus het grotere getal, acquisities het kleinere (de conversie).

## Wat verandert

### Data — `src/data/ranglijstenData.ts`

**Flip de relatie in de Acquisities kolom:**
- `value` wordt nu het aantal **voorstellen** (het grotere getal)
- `valueDone` wordt het aantal **acquisities** (het kleinere getal, de conversie)
- Ratio: `valueDone` = ca. 1/15 van `value` (5-10% conversie), met variatie per consultant
- Sommige consultants krijgen bewust een heel lage ratio (<5%) zodat ze opvallen
- `baseWeekTopValues[1]` en `basePeriodeTopValues[1]` moeten omhoog (want voorstellen zijn nu het hoofdgetal) — bijv. periode top: 310, 280, 260... i.p.v. huidige 31, 25, 25...
- `totalDone` en `previousTotalDone` worden mee aangepast

### Header — `src/pages/TVRanglijsten.tsx`

**Aanpassen labels in de Acquisities header:**

```text
┌─────────────────────────────┐
│  ACQUISITIES / VOORSTELLEN  │  ← titel
│                             │
│  1590  voorstellen          │  ← groot getal + "voorstellen" in muted kleur
│  ✅ 106  acquisities  (7%)  │  ← groen vinkje + groen getal + "acquisities" groen + % grijs
│                             │
│  ████████████░░░░           │  ← comparison bar
│  ↗ +7% t.o.v. vorige periode│
└─────────────────────────────┘
```

**Entry-rij voorbeeld:**
```text
1.  Jort Koggel    150  ✅ 10  (7%)
```

Sommige consultants met lage conversie (<5%):
```text
8.  Dees B.    95  ✅ 3  (3%)
```

### Bestanden
- `src/data/ranglijstenData.ts` — verhoog base values voor Acquisities kolom (nu voorstellen), genereer valueDone als ~1/15 ratio met variatie
- `src/pages/TVRanglijsten.tsx` — flip labels: "voorstellen" (muted) bij hoofdgetal, "acquisities" (groen) bij valueDone

