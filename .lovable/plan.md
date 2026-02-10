

# Toggle Modus: Salaris / Bonus in SalaryProgressCard

## Overzicht

De SalaryProgressCard krijgt een toggle waarmee je kunt wisselen tussen de bestaande **Salaris-modus** en een nieuwe **Bonus-modus**. Omdat de bonus afhankelijk is van de behaalde marge, draait de bonus-modus om marge-data in plaats van omzet.

## Bonus-structuur (uit screenshots)

Twee bonus-types, beide gebaseerd op marge:

**Omzetbonus (per 4-wekelijkse periode, op basis van marge):**

| Marge per periode | Bonus |
|---|---|
| 10.000 | 200 |
| 20.000 | 300 |
| 30.000 | 500 |
| 40.000 | 700 |
| 50.000 | 1.000 |
| 60.000 | 1.500 |
| 80.000 | 2.500 |
| 100.000 | 4.000 |
| 120.000 | 6.000 |
| 140.000 | 8.000 |
| 160.000 | 10.000 |

**Targetbonus (per jaar, op basis van jaarmarge):**

| Jaarmarge | Bonus per jaar |
|---|---|
| 250.000 | 1.000 |
| 500.000 | 3.000 |
| 750.000 | 7.500 |
| 1.000.000 | 15.000 |
| 1.250.000 | 22.500 |
| 1.500.000 | 30.000 |
| 2.000.000 | 40.000 |

## Wat verandert visueel

De card behoudt exact dezelfde layout (header, groot percentage, subtitel, drie kolommen, progress bar, onderste sectie), maar de inhoud wisselt:

### Header
- Toggle-pills "Salaris" / "Bonus" naast de titel
- Icoon wisselt: TrendingUp (salaris) vs DollarSign (bonus)
- Titel: "Voortgang naar volgende salarisstap" vs "Voortgang naar volgende bonusstap"

### Groot percentage + subtitel
- Salaris: "68.0% van de weg" + "Nog X omzet nodig"
- Bonus: "X% van de weg" + "Nog X marge nodig voor volgende bonusstap"

### Drie kolommen
- Salaris: Huidig salaris | Huidige omzet (13 periodes) | Volgend salaris
- Bonus: Huidige periodebonus | Huidige periodemarge | Volgende periodebonus

### Progress bar
- Salaris: omzet-drempels (250k - 500k)
- Bonus: marge-drempels van de huidige naar volgende omzetbonus-trede

### Onderste sectie (onder de streep)
- Salaris: Huidig jaarsalaris | Volgend jaarsalaris
- Bonus: Huidige targetbonus (jaar) | Volgende targetbonus (jaar) + bijbehorende marge-drempel

## Technische details

### Bestand: `src/components/dashboard/SalaryProgressCard.tsx`

1. **Imports toevoegen**: `useState` uit React, `DollarSign` uit lucide-react
2. **State**: `const [mode, setMode] = useState<'salary' | 'bonus'>('salary')`
3. **Bonus mock data** (hardcoded in component):
   - `omzetBonusTiers` array met de 11 tredes uit de tabel hierboven
   - `targetBonusTiers` array met de 7 tredes
   - Huidige periodemarge: 45.000 (past bij bestaande margin data in consultantData)
   - Huidige jaarmarge: 420.000 (consistent met bestaande omzetdata)
4. **Berekeningen bonus-modus**:
   - Zoek huidige en volgende omzetbonus-trede op basis van periodemarge
   - Bereken progress als percentage tussen de twee drempels
   - Zoek huidige en volgende targetbonus op basis van jaarmarge
5. **Toggle UI**: Twee kleine pill-buttons in de header, gestyled met bestaande Tailwind klassen (`bg-muted`, `bg-primary text-primary-foreground` voor actief)
6. **Conditioneel renderen**: Alle labels, waarden en iconen wisselen op basis van `mode`, de JSX structuur blijft identiek
7. **Progress bar gradient**: Salaris = `from-gold to-success` (bestaand), Bonus = `from-gold to-primary` (subtiel verschil)

### Geen andere bestanden worden gewijzigd

De data blijft consistent: de marge-gegevens in de bonus-modus sluiten aan bij de `marginPerPlacement` en `detavastValues` data die al bestaan in `consultantData.ts`.

