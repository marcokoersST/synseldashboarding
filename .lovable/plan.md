# Plaatsingen ranglijst — meer data & iets meer lucht

## Doel
De compacte Plaatsingen-ranglijst krijgt iets meer visuele ruimte tussen de rijen en minstens 25 consultants tonen mockdata in de standaardselectie (Week 42 / Periode 11 / 2026).

## Wijzigingen

### 1. Iets meer padding tussen rijen
- Bestand: `src/pages/PlaatsingenRanglijst.tsx`
- Verhoog de rijhoogte en celpadding licht, bijvoorbeeld van `h-8` + `py-1` naar `h-9`/`h-10` + `py-2`, zodat de tabel luchtiger oogt zonder de compacte dichtheid te verliezen.

### 2. Minstens 25 consultants met mockdata
- Bestand: `src/data/plaatsingenRankingData.ts`
- De huidige generator maakt voor elk actieve consultant uit `allConsultantsList` 2–5 plaatsingen, verdeeld over het jaar. In week 42 levert dat maar een handvol consultants op.
- Los dit op door:
  - Het basisaantal plaatsingen per consultant te verhogen (bijv. 4–8 in plaats van 2–5), zodat periode/jaar-zichten automatisch veel consultants bevatten.
- En een gerichte aanvulling toe te voegen: een extra set van minimaal 20 plaatsingen in week 42 / periode 11 voor verschillende consultants uit `allConsultantsList`, zodat de standaard week-weergave minimaal 25 consultants toont.
- De aanvulling hergebruikt de bestaande helpers (`buildDetachering`, `buildWS`, kandidaten/klanten pools) en houdt de mix Detavast / W&S / Marge Fac realistisch.

### 3. Afronding
- `bun run build` controleren.
- Playwright-check op `/plaatsingen-ranglijst` om te bevestigen dat:
  - De badge "XX consultants" >= 25 toont voor Week 42.
  - De rijen iets meer ruimte hebben dan in de huidige screenshot.
