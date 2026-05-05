## Update Tabelkolommen defaults & add missing sub-columns

Apply the user-specified default selection and add the columns that are missing from `unitFunnelColumns.ts` and the underlying data model.

### 1. Data model — `src/data/tvData.ts`

Add `voorstellenViaTelefoon: number` to `UnitFunnelRow`. Populate plausible values for every row in `weekUnitBreakdown`, `periodUnitBreakdown` and `consultantFunnelData` (≈ 60% of `voorstellenViaEmail`, rounded). Add `"voorstellenViaTelefoon"` to the `numericKeys` array in `buildConsultantRowsForUnit` so consultant-level data distributes automatically.

### 2. Column definitions — `src/data/unitFunnelColumns.ts`

Rebuild `columnGroups` to match the full spec:

```
1. Inschrijvingen
   - value  toegewezen
   - value  ingeschreven
   - conv   ingeschreven ÷ toegewezen
   - conv   intakes ÷ ingeschreven

2. Acquisitie
   - value  acquisities
   - conv   acquisities ÷ ingeschreven
   - conv   acquisities ÷ toegewezen

3. Voorstellen
   - value  voorstellenPerKandidaat   (Per kandidaat)
   - value  voorstellenViaEmail       (Via email)
   - value  voorstellenViaTelefoon    (Via telefoon)   NEW
   - conv   voorstellenViaEmail ÷ ingeschreven
   - conv   voorstellenViaTelefoon ÷ ingeschreven      NEW

4. Uitnodigingen
   - value  uitnodigingenTotaal
   - value  nietUitgenodigd
   - value  welUitgenodigd
   - conv   uitnodigingenTotaal ÷ acquisities

5. Gesprekken
   - value  eersteGesprek
   - value  geenEersteGesprek
   - value  welEersteGesprek
   - conv   eersteGesprek ÷ acquisities

6. Vervolg
   - value  vervolgGesprek
   - value  dealsluiter
   - conv   welEersteGesprek ÷ vervolgGesprek

7. Geplaatst
   - value  geplaatst
   - value  gemDagenTotPlaatsing
   - conv   geplaatst ÷ ingeschreven
   - conv   geplaatst ÷ toegewezen
```

Drop the existing "Voorst. totaal ÷ …" placeholder — spec leaves it open. Keep existing keys; only **Voorstellen** gains the new telefoon entries.

### 3. Default selection — `DEFAULT_VISIBLE_SUBKEYS`

Switch from "all on except `toegewezen`" to an explicit allow-list matching the spec:

- Inschrijvingen: `ingeschreven`, `ingeschreven÷toegewezen`, `intakes÷ingeschreven`
- Acquisitie: `acquisities`, `acquisities÷ingeschreven`
- Voorstellen: `voorstellenPerKandidaat`, `voorstellenViaEmail`, `voorstellenViaEmail÷ingeschreven`
- Uitnodigingen: `uitnodigingenTotaal`, `nietUitgenodigd`, `uitnodigingenTotaal÷acquisities`
- Gesprekken: `eersteGesprek`, `geenEersteGesprek`, `eersteGesprek÷acquisities`
- Vervolg: `vervolgGesprek`, `dealsluiter`, `welEersteGesprek÷vervolgGesprek`
- Geplaatst: `geplaatst`, `gemDagenTotPlaatsing`, `geplaatst÷ingeschreven`, `geplaatst÷toegewezen`

All other sub-keys (e.g. `toegewezen`, `acquisities÷toegewezen`, `welUitgenodigd`, `welEersteGesprek`, `voorstellenViaTelefoon`, both telefoon conversies) remain available in the popover but **off** by default.

### 4. No other changes

- `UnitFunnelBreakdown.tsx` already renders any sub-key that's visible — no edits needed.
- `SalesFunnelFilterBar.tsx` already iterates `columnGroups` — picks up the new group entries automatically.
- Consultant-level data inherits the new field via `numericKeys`.

### Files

- Edit: `src/data/tvData.ts`, `src/data/unitFunnelColumns.ts`