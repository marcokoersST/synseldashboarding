

# Top 3 volledige breedte per tegel

## Wijziging

In `src/pages/TVRanglijsten.tsx` — het **compact (TV) blok** (~regel 497-540):

Momenteel gaan alle entries (inclusief top 3) in de `AutoColumnsWrapper`. Aanpassing: splits de entries op in top 3 en rest, net zoals al gedaan wordt in het niet-compact blok.

- **Top 3**: apart renderen boven de `AutoColumnsWrapper`, volledige breedte van de tegel (gele rijen in de mockup)
- **Rest (4+)**: in `AutoColumnsWrapper` die ze over 2 kolommen verdeelt (paars in de mockup)
- Bij `isPlain` kolommen: geen top 3 splitsing (alles in wrapper)

Alleen `src/pages/TVRanglijsten.tsx` wijzigen.

