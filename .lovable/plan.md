

# Plan: Naam-weergave fixen — altijd leesbaar, nooit afgekapt

## Probleem
De huidige aanpak (`smartName` met vaste `maxChars` + `whitespace-nowrap`) werkt niet: namen overlappen met iconen en cijfers, of worden alsnog afgekapt. De root cause is dat we proberen namen op één regel te forceren in een flexbox met `flex-1 min-w-0` maar zonder `truncate` — waardoor ze ofwel overlappen ofwel onzichtbaar worden.

## Nieuwe aanpak — `src/pages/TVRanglijsten.tsx`

### 1. Naam altijd tonen met CSS `text-overflow: clip` + font-shrink
Verwijder de `smartName` helper. Gebruik in plaats daarvan:
- **Voornaam + eerste letter achternaam** als standaard displayformaat voor top-3 entries (bijv. "Jort K.", "Christiaan K.")
- **Volledige naam** alleen in de niet-top-3 lijst (waar meer ruimte is), met fallback naar "Voornaam A." als het niet past
- Verwijder `whitespace-nowrap` van de naam-span; laat het op `overflow-hidden text-ellipsis` staan als uiterste fallback maar met agressievere font-scaling via kleinere clamp-waarden

### 2. Top-3 EntryRow: compactere layout
- Naam-span: `text-[clamp(8px,0.85vw,12px)]` (kleiner dan nu)
- Value-span: `text-[clamp(10px,1vw,14px)]` (kleiner dan nu)  
- Gebruik `gap-1` i.p.v. `gap-2` in top-3 rows
- Display format: altijd `firstName + " " + lastName[0] + "."` voor top-3

### 3. Rest-lijst: slimmere naam-afkorting
- Gebruik `firstName + " " + lastName[0] + "."` als standaard
- Font: `text-[9px]` (vast, geen clamp nodig voor de kleine lijst)

### 4. Kolom-gap en padding verder optimaliseren
- Non-compact grid gap: `gap-2` (was `gap-3`)
- Kolom padding: `p-1.5` (was `p-2`)
- Compact grid gap: `gap-1.5` (was `gap-2`)

## Bestanden
- `src/pages/TVRanglijsten.tsx` — naam-format logica, font-sizes, gaps

