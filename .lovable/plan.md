

# Plan: Verwijder leidinggevende doelen uit consultant dashboard

## Wat verandert

### `src/components/dashboard/GoalsCard.tsx`

**Card view:**
- Verwijder de hele "Doelen van leidinggevende" sectie (regels 154-177)
- Verwijder het "Mijn doelen" sub-kopje (regels 133-137) — niet meer nodig als er maar één categorie is
- Vergroot de scroll-container van `h-[160px]` naar de volledige beschikbare hoogte zodat meer doelen zichtbaar zijn

**Management dialog:**
- Verwijder de rechter kolom "Doelen van leidinggevende" (regels 260-300)
- Verwijder de twee-koloms layout (`flex-row`) — maak er één centered kolom van
- Verwijder `border-r` van de persoonlijke doelen kolom
- Pas de dialog breedte aan van `max-w-[80vw]` naar `max-w-2xl` voor een strakker design met één kolom

**Data & types opschonen:**
- Verwijder alle `isManagerGoal: true` items uit `initialGoals` (regels 41-47)
- Verwijder `isManagerGoal` uit de `Goal` interface en alle referenties
- Verwijder `sortedManagerGoals` useMemo
- Verwijder `Shield` import en gerelateerde tooltip/styling in `GoalItemCompact` en `GoalItemFull`
- Verwijder `readOnly` prop logica uit `GoalItemFull`
- Verwijder gold-gerelateerde styling (`bg-gold/5`, `border-gold/30`, etc.)

## Resultaat
- Eén schone lijst met persoonlijke doelen op de card
- Eén-koloms dialog voor doelen beheren
- Alle manager-goal logica volledig verwijderd

