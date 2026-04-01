

# Plan: Responsive layout fixes en overlap-preventie voor Ranglijsten

## Problemen uit screenshot
1. **Raket-icoon overlapt naam** (bijv. Falco Zegveld bij Intakes) — icoon en naam zitten te dicht op elkaar
2. **Cijfers tegen naam geplakt** (bijv. Jonah Waterborg "1" bij Plaatsingen) — geen ruimte tussen naam en waarde
3. **Top-3 inconsistente grootte** (Ruben Zoet te groot vs. anderen) — font-sizing logica maakt sommige korte namen te groot
4. **Geen mobiele responsiviteit** — grid is altijd horizontaal, nooit kolommen onder elkaar

## Wijzigingen — `src/pages/TVRanglijsten.tsx`

### 1. EntryRow: spacing en overlap fixes
- Verhoog `gap` van `gap-1.5` naar `gap-2` in de row container
- Geef de naam-span een `max-w` met `truncate` zodat deze nooit in de cijfers drukt
- Iconen (Rocket, Flame) krijgen `shrink-0` en staan al vóór de value — controleer dat ze niet in de naam-ruimte staan
- Voor top-3 entries: **uniformiseer font-sizing**. Verwijder de huidige conditie-boom (die op naamlengte checkt) en gebruik één consistente `text-[clamp(9px,0.9vw,13px)]` voor alle top-3 namen. Dit voorkomt dat korte namen (Ruben Zoet) veel groter zijn dan lange namen

### 2. Value/cijfer sizing in EntryRow
- Top-3 value: gebruik `text-[clamp(11px,1.1vw,16px)]` i.p.v. vaste `text-base`/`text-sm`
- Niet-top-3: houd `text-[10px]` maar met `shrink-0`
- valueDone (groene cijfers): zelfde clamp-schaal als value

### 3. Responsief grid — desktop, tablet, mobiel
Huidige grid: `repeat(N, minmax(200px, 1fr))` — scrollt horizontaal, nooit wrappen.

**Nieuw** (niet-compact modus):
- **≥1280px (xl)**: huidige grid, alle kolommen naast elkaar
- **768px–1279px (md)**: `grid-cols-3` met wrapping, kolommen gaan naar 2e rij
- **<768px (sm)**: `grid-cols-1`, kolommen gestapeld onder elkaar, volledig leesbaar

Implementatie: vervang de inline `gridTemplateColumns` door Tailwind responsive classes:
```
grid grid-cols-1 md:grid-cols-3 xl:grid-cols-[repeat(var(--col-count),minmax(0,1fr))]
```
Met een CSS variable `--col-count` gezet op `columns.length`.

### 4. Kolomkaart min-width verwijderen
De huidige `minmax(200px, 1fr)` in het non-compact grid forceert horizontaal scrollen. Op kleinere schermen moet de kaart de volledige breedte pakken. De `min-w-0` op de kaart-div blijft.

## Bestanden
- `src/pages/TVRanglijsten.tsx` — EntryRow spacing, uniforme top-3 fonts, responsive grid breakpoints

