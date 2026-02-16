

# Conversieformules verbeteren

## Problemen
1. **Dubbel "Inschrijvingen"**: De groepsnaam toont twee keer "1. Inschrijvingen" voor zowel Inschr. % als Intake %. Dit moet duidelijker met een specifiekere label per rij.
2. **Deelteken**: Het `/` symbool wordt gebruikt als deelteken in formules, maar moet `÷` zijn.
3. **Tekst afgekapt in TV-modus**: De groepsnamen worden ingekort (truncated) met `80px` breedte terwijl er genoeg ruimte is.

## Wijzigingen

### `src/components/tv/ConversionLegend.tsx`

1. **Specifiekere groepslabels** -- Geef elke rij een uniek, beschrijvend label in de `group` kolom zodat het niet twee keer "1. Inschrijvingen" toont:
   - "1. Inschrijvingen" + "Inschr. %" wordt groep "Inschrijving"
   - "1. Inschrijvingen" + "Intake %" wordt groep "Intake"
   - "2. Acquisitie" + "Acq. %" wordt groep "Acquisitie"
   - "2. Acquisitie" + "Acq. ratio" wordt groep "Acq. ratio"
   - "3. Voorstellen" blijft "Voorstellen"
   - "4. Uitnodigingen" blijft "Uitnodigingen"
   - "5. Gesprekken" blijft "Gesprekken"
   - "6. Vervolg" blijft "Vervolg"
   - "7. Geplaatst" + "Plts. %" wordt "Plaatsing"
   - "7. Geplaatst" + "Hit rate" wordt "Hit rate"

2. **Deelteken** -- Vervang alle `/` in formule-strings door `÷`:
   - "Ingeschreven / Toegewezen" wordt "Ingeschreven ÷ Toegewezen"
   - Idem voor alle andere formules

3. **Popover formules** -- Dezelfde wijzigingen gelden automatisch voor de popover (gebruikt dezelfde `conversionFormulas` array)

### `src/components/tv/ConversionFormulasCard.tsx`

4. **Bredere groepskolom in TV-modus** -- Vergroot de groepskolom van `80px` naar `110px` in compact mode en van `100px` naar `130px` in normaal mode. Verwijder `truncate` class van de groepsnaam zodat tekst niet wordt afgekapt.

## Technisch detail

Alleen de `conversionFormulas` array en de grid-template in `ConversionFormulasCard` worden aangepast. Geen wijzigingen nodig in `UnitFunnelBreakdown.tsx` omdat die component zijn eigen `columnGroups` gebruikt (met genummerde groepen voor de tabelkop).

