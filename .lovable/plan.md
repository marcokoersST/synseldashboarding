
# Plan: Einddatum kolom toevoegen aan "Per consultant" tabel

## Wijziging
In de "Per consultant" tabel op de Synsel Groeimodel pagina komt een nieuwe **Einddatum** kolom direct na **Startdatum**. De gecombineerde weergave (`startDate → endDate`) in de Startdatum-cel wordt opgesplitst.

## Gedrag
- **In dienst** (geen `endDate`): toont badge/tekst `In dienst` (subtiel, muted-foreground).
- **Uit dienst** (`endDate` aanwezig): toont de datum (bv. `mrt 2025`) in dezelfde stijl als de startdatum.

## Bestanden
1. **`src/components/groeimodel/ConsultantTimelineRow.tsx`**
   - Startdatum-cel: verwijder de `→ formatDate(endDate)` regel; alleen `formatDate(startDate)` blijft.
   - Nieuwe `<td>` direct erna: 
     - `endDate ? formatDate(endDate) : <span className="text-muted-foreground italic">In dienst</span>`
   - Sorteerbaar maken via dezelfde patroon als andere kolommen (indien tabel sorteerlogica heeft).

2. **`src/pages/super-admin/Groeimodel.tsx`** (of waar de tabel-header staat)
   - Voeg `<th>EINDDATUM ↕</th>` toe tussen `STARTDATUM` en `VERLOOP`.
   - Indien sorteerbaar: voeg `endDate` toe aan de sort-key opties; consultants in dienst sorteren als "laatste" bij oplopend / "eerste" bij aflopend (of altijd onderaan — te bevestigen tijdens implementatie via huidige sort-conventie).

## Validatie
- Tabel toont 8 kolommen i.p.v. 7.
- Daan Jacobs (uit dienst): toont `mrt 2024` in Startdatum, `mrt 2025` in Einddatum.
- Alle andere consultants: tonen `In dienst` in muted styling in Einddatum kolom.
- Layout blijft passen (kolombreedtes herverdelen automatisch).
