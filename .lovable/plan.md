

# TV Ranglijsten: Uitgebreide upgrade

## Overzicht van wijzigingen

### 1. Echte consultantnamen uit het werknemersbestand
Alle 65 consultants uit de PDF worden opgenomen in de data, inclusief hun unit. De huidige 25 dummy-namen worden vervangen.

**Units uit het bestand:**
Accountmanagement, Customer Success, Early Performers, Engineering, Instroom, Monteurs, Operators, Suriname, Synsel Techniek, Trainingsunit

### 2. Consultants met 0 blijven zichtbaar
De huidige `.filter(e => e.value > 0)` wordt verwijderd zodat iedereen in elke kolom verschijnt, ook met een score van 0.

### 3. Auto-scroll in TV modus
Wanneer de lijst te lang is voor het scherm, scrollt de lijst automatisch langzaam naar beneden en weer terug (marquee-stijl animatie via een `useEffect` met `scrollTop` interval).

### 4. Kolom-selector voor TV modus
Een multi-select dropdown (beschikbaar in de normale/overzichtsmodus) waarmee je kiest welke kolommen zichtbaar zijn in TV modus. Standaard: alle 6 kolommen. Het grid past zich dynamisch aan op basis van het aantal geselecteerde kolommen.

### 5. Vuur-icoon voor "HOT" consultants
Bepaalde consultants worden gemarkeerd als "hot" (mock data: bijv. top performers met hoge groei). Deze krijgen:
- Een vlammetje (Flame icoon) links naast hun score
- Een subtiele highlight achtergrond (warm oranje tint)

### 6. Top 3 iconen
- Rank 1: Trofee-icoon (Trophy) in goud
- Rank 2: Medaille-icoon (Medal) in zilver  
- Rank 3: Medaille-icoon (Medal) in brons

### 7. Periode-selector
Een extra filter dropdown om specifieke periodes te kiezen (P1 t/m P13 + Jaar). Dit werkt samen met de bestaande Week/Periode toggle.

### 8. Grotere vergelijkingsbalk tekst + iconen
- Tekst vergroot van `text-[10px]` naar `text-xs`
- TrendingUp icoon bij positieve delta, TrendingDown bij negatieve delta
- Balk iets hoger (van `h-1.5` naar `h-2`)

### 9. Filters verborgen in TV modus
De filters zijn al verborgen in TV modus. Dit wordt gehandhaafd. De kolom-selector wordt ook alleen in de normale modus getoond; de geselecteerde keuze wordt onthouden wanneer TV modus wordt geactiveerd.

## Technische aanpak

### `src/data/ranglijstenData.ts`
- Vervang de `names` array door alle 65 echte consultantnamen uit de PDF, elk met hun unit
- Voeg een `unit` veld toe aan `RankingEntry`
- Voeg een `isHot` boolean veld toe aan `RankingEntry`
- Verwijder alle `.filter(e => e.value > 0)` aanroepen
- Genereer rankings voor alle 65 consultants (veel met waarde 0)
- Markeer 5-8 consultants als "hot" in de mock data
- Update `ranglijstenFilters.units` met alle units uit de PDF
- Voeg periodes toe: `["P1", "P2", ..., "P13"]`

### `src/pages/TVRanglijsten.tsx`
- **Imports**: Voeg `Trophy, Medal, Flame, TrendingUp, TrendingDown` toe uit lucide-react, plus `Checkbox` uit UI components
- **State**: Voeg `selectedColumns` state toe (array van kolom-titels, standaard alle 6)
- **State**: Voeg `selectedPeriode` state toe voor periode-selector
- **ComparisonBar**: Vergroot tekst, voeg trending iconen toe
- **getRankStyle**: Behoud huidige logica
- **Top 3 iconen**: Toon Trophy (rank 1) en Medal (rank 2, 3) iconen naast het ranknummer
- **HOT indicator**: Toon Flame icoon + highlight achtergrond voor hot consultants
- **Auto-scroll**: `useEffect` in TV modus die de ScrollArea langzaam scrollt (2px per 50ms), pauzeert bovenaan en onderaan
- **Kolom-selector**: Popover met checkboxes voor elke kolom (alleen zichtbaar buiten TV modus)
- **Periode-selector**: Extra Select dropdown in de filterrij
- **Grid**: Filter `columns` op basis van `selectedColumns` en pas `gridTemplateColumns` aan
- **TV modus**: Verberg alle filters, toon alleen Week/Periode badge indicator

### Samenvatting bestanden

| Bestand | Actie |
|---------|-------|
| `src/data/ranglijstenData.ts` | Wijzig - echte namen, units, isHot, geen filtering op 0, periodes |
| `src/pages/TVRanglijsten.tsx` | Wijzig - auto-scroll, kolom-selector, iconen, grotere vergelijkingsbalk, periode-selector |

