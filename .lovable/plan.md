

# Plan: Herstructureer Inschrijvingen kolom header

## Gewenst design

```text
┌─────────────────────────────┐
│  INSCHRIJVINGEN             │  ← titel (klein, uppercase, grijs)
│                             │
│  340  op naam               │  ← groot getal + "op naam" in normale/muted kleur
│  ✅ 251  gedaan  (73.8%)    │  ← groen vinkje + groen getal + "gedaan" groen + percentage grijs
│                             │
│  ████████████░░░░           │  ← comparison bar
│  ↗ +7% t.o.v. vorige periode│
└─────────────────────────────┘
```

## Wijzigingen — `src/pages/TVRanglijsten.tsx`

Twee plekken (site-modus en compact-modus headers):

1. **Titel**: Wijzig van `"Inschrijvingen op naam"` naar `"Inschrijvingen"`
2. **Groot getal regel**: Voeg rechts naast het getal (340) een klein label toe: `op naam` in **normale muted kleur** (text-muted-foreground)
3. **Gedaan regel**: Wijzig volgorde naar: groen vinkje → groen getal → groene tekst "gedaan" → grijs percentage `(73.8%)`

### Bestanden
- `src/pages/TVRanglijsten.tsx` — header structuur aanpassen op beide plekken (site + compact mode)

