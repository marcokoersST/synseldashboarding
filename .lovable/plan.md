# Bonus Tabel Overzicht (Concepts)

## Wat je krijgt
Een nieuwe pagina "Bonus Tabel Overzicht" in het menu onder Concepts, met de bonustabel uit de afbeelding in dezelfde stijl als de andere ranglijsten.

## Opbouw van de pagina
- **Kop**: "Bonus periode 8 (week 29, 30, 31 & 32)" — titel past zich aan de gekozen periode aan.
- **Periodeselector** bovenaan: periodes P1–P13 (elk 4 weken) met vorige/volgende-knoppen; standaard periode 8. Cijfers wisselen per periode (demodata).
- **Kolommen aan/uit**: knop "Kolommen" met een lijst van vinkjes per kolom en "Alles aan/uit". Keuze blijft bewaard. Consultant blijft altijd zichtbaar.
- **Tabel** met alle kolommen uit de afbeelding: Consultant, Datum in dienst, Uitbetaling, Targetbonus, Prijzen, Periodes F, Forecastbonus, Yellow Card, HPC/FG, Omzet detachering, Omzet margefactuur, Omzet Please, Totaal marge, Omzetbonus, Totaal uit te keren, Totale bonus 2026.
  - Bedragen als € met Nederlandse notatie, lege waarden als "–".
  - Gesorteerd op Totale bonus 2026 (aflopend), alle kolommen klikbaar sorteerbaar.
  - Kolom Consultant blijft vast staan bij horizontaal scrollen; Totale bonus vetgedrukt.
  - Totaalrij onderaan.
- Rode "Dev info"-knop (Engels), zoals op de andere ranglijsten.

## Gegevens
De 20 consultants en bedragen uit de afbeelding voor periode 8; andere periodes krijgen vaste afgeleide demowaarden. Totaal marge = som van de drie omzetkolommen.

## Technisch
- `src/data/bonusTabelData.ts` (records per periode), `src/pages/concepts/BonusTabelOverzicht.tsx`.
- Route `/concepts/bonus-tabel` in `App.tsx`, menu-item in `Sidebar.tsx` onder Concepts.
- Nieuwe labels toevoegen aan de vertaalwoordenboeken (en/pl/uk).
