

# Plan: Percentage vervangen door ratio (×15.0) met kleurcodering

## Wat verandert

### 1. EntryRow aanpassen — `src/pages/TVRanglijsten.tsx`

**Nieuwe prop**: `isAcquisities?: boolean` toevoegen aan `EntryRowProps`.

**In de `valueDone` rendering (regels 128-139)**:
- Als `isAcquisities` en `entry.value > 0`: toon ratio i.p.v. percentage
  - Berekening: `(entry.valueDone / entry.value).toFixed(1)`
  - Format: `×14.2` (met ×-teken)
  - Kleurcodering:
    - `< 10×` → `text-red-500` (te weinig voorstellen)
    - `10× - 14×` → `text-orange-500` (onder target)
    - `≥ 15×` → huidige `text-muted-foreground` (op target)
- Anders (Inschrijvingen): bestaand percentage behouden

### 2. Prop doorgeven — `src/pages/TVRanglijsten.tsx`

Op 4 plekken waar `<EntryRow>` wordt aangeroepen (top3 + rest, in site- en compact-modus): `isAcquisities={isAcquisities}` toevoegen.

### 3. Header ratio — `src/pages/TVRanglijsten.tsx`

In de header voor Acquisities: percentage ook vervangen door gemiddelde ratio (`×` formaat) met dezelfde kleurcodering.

### Voorbeeld resultaat

```text
Header:   106  acquisities
          ✅ 1590  voorstellen  ×15.0

Rij:      1.  Jort Koggel    10  ✅ 150  ×15.0     (grijs)
          8.  Dees B.         3  ✅  18  ×6.0      (rood)
          5.  Nina V.         7  ✅  84  ×12.0     (oranje)
```

### Bestanden
- `src/pages/TVRanglijsten.tsx` — ratio logica, kleurcodering, prop doorgeven

