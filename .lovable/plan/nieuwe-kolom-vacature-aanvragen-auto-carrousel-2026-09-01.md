# Nieuwe kolom "Vacature aanvragen" + auto-carrousel

## 1. Nieuwe kolom: Vacature aanvragen

Een zevende ranglijstkolom op `/tv/ranglijsten`, met dezelfde opbouw als de bestaande kolommen (totaal bovenaan, top-3 met trofee/medailles, daaronder de volledige ranglijst).

- **Primaire waarde:** aantal toegevoegde vacature-aanvragen (label `aanvragen`).
- **Secundaire waarde:** aantal kandidaten dat de consultant vanuit pre-matching heeft toegestuurd gekregen — weergegeven onder het totaal als bijvoorbeeld `10 kandidaten vanuit pre-matching`, in dezelfde stijl als "258 gedaan" bij Inschrijvingen.
- **Ranglijst:** gesorteerd op aantal aanvragen (aflopend), met per consultant het aantal pre-matching kandidaten ernaast.
- **Sorteeropties** via het bestaande sorteericoon: "Op aanvragen" / "Op kandidaten pre-matching".
- Kolom is aan/uit te zetten in de bestaande "Kolommen"-popover en volgt de actieve jaar-, week/periode-, unit- en consultantfilters.
- Werkt zowel in de normale weergave als in TV-modus (compact).

## 2. Kolommen als langzame carrousel

De kolommenrij schuift automatisch en continu van rechts naar links, in een lage, rustige snelheid (geschikt voor TV). Kolommen die links uit beeld verdwijnen komen rechts weer terug, zodat alle kolommen blijvend in rotatie zijn.

- Zichtbaar aantal kolommen tegelijk blijft afgestemd op de schermbreedte; de rest schuift in beeld.
- Beweging pauzeert bij hover/interactie (filters, dropdowns) en gaat daarna verder.
- Respecteert "reduced motion": dan geen automatische beweging, wel de bestaande handmatige scrollpijlen.

## Technisch

- `src/data/ranglijstenData.ts`: nieuwe kolomtitel `"Vacature aanvragen"` toevoegen aan `columnTitles`/`allColumnTitles` met eigen basiswaarden voor week en periode; `valueDone` = pre-matching kandidaten (deterministisch afgeleid, ~30-70% van aanvragen), inclusief `totalDone`/`previousTotalDone` en een minimum voor Robin Jansen zoals bij de andere kolommen.
- `src/pages/TVRanglijsten.tsx`:
  - `COLUMN_CONFIG` en `SORT_OPTIONS` uitbreiden met de nieuwe kolom (`primaryLabel: "aanvragen"`, `doneLabel: "kandidaten vanuit pre-matching"`).
  - Standaard `selectedColumns` en `sortModes` uitbreiden.
  - Carrousel: de bestaande `scrollRef`-container krijgt een `requestAnimationFrame`-loop die `scrollLeft` traag verhoogt; de kolomlijst wordt gedupliceerd (2×) zodat de scroll naadloos terugspringt bij de helft. Pauzeren via `onMouseEnter`/`onMouseLeave` en `useReducedMotion`.
