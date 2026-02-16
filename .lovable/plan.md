
# ConversionFormulasCard -- Kolom Headers & Meer Ruimte

## Probleem
De "Actueel" en "Benchmark" waarden staan te dicht op elkaar zonder kolomheaders, waardoor het onduidelijk is welke kolom wat voorstelt. De data ziet er "crammed" uit.

## Wijzigingen

### `src/components/tv/ConversionFormulasCard.tsx`

1. **Kolomheaders toevoegen** -- Een header-rij boven de data met labels: "Groep", "Formule", "Actueel" en "Doel"
2. **Kolom breedtes vergroten** -- De grid template aanpassen:
   - Compact: `grid-cols-[14px_80px_1fr_32px_32px]` wordt `grid-cols-[16px_80px_1fr_48px_48px]`
   - Normaal: `grid-cols-[16px_100px_1fr_50px_50px]` wordt `grid-cols-[16px_100px_1fr_60px_60px]`
3. **Gap vergroten** -- `gap-1.5` naar `gap-2` (compact) en `gap-2` naar `gap-3` (normaal) voor meer horizontale ruimte
4. **Header styling** -- Headers in `text-[10px] text-muted-foreground font-medium uppercase tracking-wide` met een subtiele border-bottom

### Technisch detail

```text
Huidige grid:
  [icon 14px] [groep 80px] [formule 1fr] [actueel 32px] [doel 32px]  gap-1.5

Nieuwe grid:
  Header rij:  [—] [Groep] [Formule] [Actueel] [Doel]
  Data rijen:  [icon 16px] [groep 80px] [formule 1fr] [actueel 48px] [doel 48px]  gap-2
```

Bestand dat gewijzigd wordt:
- `src/components/tv/ConversionFormulasCard.tsx`
