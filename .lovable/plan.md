
# Intakes samenvoegen als subkolommen van Inschrijvingen

## Probleem
"Intakes" staat nog steeds als aparte kolomgroep "2. Intakes" in de tabel. Dit moet samengevoegd worden als subkolommen binnen "1. Inschrijvingen".

## Wijzigingen

### `src/components/tv/UnitFunnelBreakdown.tsx`

1. **Intakes verplaatsen** -- De twee sub-kolommen (`Intakes` en `Intake %`) worden toegevoegd aan het einde van de `subs` array van "1. Inschrijvingen"
2. **Aparte groep verwijderen** -- De "2. Intakes" groep (regels 28-34) wordt verwijderd
3. **Hernummeren** -- Alle volgende groepen schuiven een nummer op:
   - "3. Acquisitie" wordt "2. Acquisitie"
   - "4. Voorstellen" wordt "3. Voorstellen"
   - "5. Uitnodigingen" wordt "4. Uitnodigingen"
   - "6. Gesprekken" wordt "5. Gesprekken"
   - "7. Vervolg" wordt "6. Vervolg"
   - "8. Geplaatst" wordt "7. Geplaatst"

### Resultaat

De "1. Inschrijvingen" groep bevat dan 5 subkolommen:

```text
1. Inschrijvingen
  Toegewezen | Ingeschreven | Inschr. % | Intakes | Intake %
```

Alleen bestand `src/components/tv/UnitFunnelBreakdown.tsx` wordt aangepast.
