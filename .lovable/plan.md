

# Gesprekken & E-mail: Twee Losse Tegels + Calls per Plaatsing KPI

## Wat wordt er gedaan

De huidige gecombineerde `CommunicationStatsCard` (met up/down navigatie) wordt opgesplitst in **twee aparte tegels**: een Gesprekken-tegel en een E-mail-tegel. Elk krijgt een eigen overview/detail schakelaar. Daarnaast wordt in de **detail modus van Gesprekken** een nieuwe KPI toegevoegd: **"Calls per plaatsing"**.

## Layout wijziging op Index pagina

```text
VOOR:
[CommunicationStats (2 kolommen)]  [ChatWidget]

NA:
[Gesprekken]  [E-mail]  [ChatWidget]
```

Drie kolommen, elk 1 kolom breed.

## Tegel 1: Gesprekken (CallsStatsCard)

### Overview modus
- Inkomend (47), Uitgaand (89), Totale duur (4:32:15)

### Detail modus
- Vergelijkingsmatrix huidige vs beste periode (Inkomend, Uitgaand, Gemist, Bounced)
- Contact Status breakdown (Warme relatie, Voorkeurs CP, Nieuw contact)
- **NIEUW: Calls per plaatsing** — toont hoeveel calls er gemiddeld nodig zijn voor 1 plaatsing, huidige periode vs beste periode, met vergelijkingsbadge

## Tegel 2: E-mail (EmailStatsCard)

### Overview modus
- Verstuurd (156), Ontvangen (243)

### Detail modus (uitgebreid)
- Verstuurd, Ontvangen, TTFR Score, Volgende actie
- **Emails per procedure**: Gemiddeld aantal mails per lopende procedure
- **Emails per acquisitie**: Gemiddeld aantal mails per acquisitie
- **Benchmark geplaatste kandidaten**: Gem. emails bij geplaatste kandidaten vs jouw gemiddelde
- **Reply rate**: % mails met antwoord
- **Gem. reactietijd**: Tijd tot jouw reply

## Technische details

### Bestanden

| Bestand | Wijziging |
|---------|-----------|
| `src/components/dashboard/CommunicationStatsCard.tsx` | Refactor naar twee exports: `CallsStatsCard` en `EmailStatsCard`. Elk met eigen toggle (Maximize/Minimize). Up/down navigatie verwijderd. Calls detail krijgt extra "Calls per plaatsing" KPI. Mail detail krijgt extra verdiepende KPI's. |
| `src/pages/Index.tsx` | Grid aanpassen van `col-span-2 + 1` naar `3 losse kolommen`. Importeert `CallsStatsCard` en `EmailStatsCard` i.p.v. `CommunicationStatsCard`. |

### Nieuwe mock data

**Calls — calls per plaatsing:**
- Huidige periode: 34 calls per plaatsing (136 totaal calls / 4 plaatsingen)
- Beste periode: 16 calls per plaatsing (131 totaal calls / 8 plaatsingen)

**E-mail detail:**
- Emails per procedure: 12.4
- Emails per acquisitie: 8.7
- Benchmark geplaatst: 18.2
- Jouw gemiddelde: 14.6
- Reply rate: 68%
- Gem. reactietijd: 0:32:00

