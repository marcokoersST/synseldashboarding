

# Plan: Merge Year + Period filters into one popover

Combineer de huidige twee filterknoppen (Jaar / Periode) tot **één popover "Periode"** in de header van het Synsel Groeimodel dashboard, met een logische volgorde: eerst jaren kiezen, dan de periode-range binnen die jaren. En zorg dat **2025 en 2026** altijd selecteerbaar zijn.

## 1. Eén gecombineerde popover

Vervang de twee aparte triggers door **één knop**:

- Icoon: `CalendarRange`
- Label-logica:
  - Geen selectie → `"Periode"`
  - Alleen jaren → `"2024, 2025"` (max 2 getoond, daarna `+N`)
  - Alleen perioderange → `"P1–P5"`
  - Beide → `"2025 · P1–P5"`
- `ChevronDown` chevron blijft

PopoverContent (`w-72`, align end), twee secties onder elkaar:

**Sectie 1 — Jaren** (bovenaan, want logisch eerste keuze)
- Header: `Jaar` + mini "Alles aan / Uit" toggles (bestaand pattern)
- Checkbox-lijst met alle beschikbare jaren

**Visuele scheidingslijn**

**Sectie 2 — Periode binnen jaar** (onder)
- Header: `Periode (P1–P13)` + `Reset`-knop
- Twee `Select` dropdowns naast elkaar: `Van` → `Tot`
- Subtiele uitleg eronder: *"Filtert consultants die in deze periode binnen de gekozen jaren zijn gestart"*

Onderin een `Toepassen`/`Sluiten` knop is niet nodig — wijzigingen werken direct door (consistent met andere popovers in het project).

## 2. Jaren 2025 & 2026 zichtbaar maken

Huidige `getAvailableCohortYears()` levert alleen jaren waarin consultants daadwerkelijk gestart zijn. Update deze helper in `src/data/groeimodelData.ts` zodat de lijst **altijd** minimaal de range `[min(startjaar), 2026]` bevat — dus 2025 en 2026 verschijnen ook als er nog geen consultants in die jaren startten.

```text
   afgeleide jaren uit data  ∪  { 2025, 2026 }   →  gesorteerd
```

## 3. Filterlogica blijft hetzelfde

State (`filterYears`, `filterPeriodRange`) en de bestaande filtering in `filteredRows` worden niet aangepast — alleen de UI-presentatie. `FilterSummary` in elke tegel blijft de twee dimensies tonen.

## Bestanden

| Bestand | Wijziging |
|---|---|
| `src/pages/super-admin/Groeimodel.tsx` | Twee popovers (Jaar + Periode) vervangen door één gecombineerde "Periode"-popover met sectie Jaar bovenaan en Periode-range onderaan; één gedeelde `open`-state; samengestelde label-logica op de trigger |
| `src/data/groeimodelData.ts` | `getAvailableCohortYears()` uitbreiden zodat 2025 en 2026 altijd in de lijst zitten (union met `{2025, 2026}`) |

Geen wijzigingen aan filterlogica, KPI's, charts of overige tegels — puur header-UX en jaarlijst-uitbreiding.

