
# Fix: Flame icoon alleen bij waarde > 0

## Probleem
Het vuur-icoon (Flame) verschijnt ook bij consultants met een score van 0 (zoals "Vincent Maas" op positie 54 met waarde 0). Dit moet alleen zichtbaar zijn wanneer de waarde groter is dan 0.

## Technische aanpak

### `src/pages/TVRanglijsten.tsx`
- **Regel 280**: Wijzig de conditie van `entry.isHot` naar `entry.isHot && entry.value > 0` voor het Flame icoon
- **Regel 259**: Wijzig de highlight achtergrond conditie van `entry.isHot` naar `entry.isHot && entry.value > 0`
- **Regel 271**: Wijzig de naam highlight conditie van `entry.isHot` naar `entry.isHot && entry.value > 0`

Concreet worden drie plekken aangepast:

| Wat | Oud | Nieuw |
|-----|-----|-------|
| Achtergrond highlight | `entry.isHot && "bg-orange-50/60"` | `entry.isHot && entry.value > 0 && "bg-orange-50/60"` |
| Naam styling | `entry.isHot && "text-orange-700 font-medium"` | `entry.isHot && entry.value > 0 && "text-orange-700 font-medium"` |
| Flame icoon | `entry.isHot && <Flame .../>` | `entry.isHot && entry.value > 0 && <Flame .../>` |

### Samenvatting

| Bestand | Actie |
|---------|-------|
| `src/pages/TVRanglijsten.tsx` | Wijzig - 3 condities aanpassen voor Flame/highlight |
