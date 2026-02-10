
# Omzet Overzicht Chart - Uitbreiding met Career Lanes en Best Performer

## Overzicht

De "Omzet Overzicht" grafiek op het hoofddashboard wordt uitgebreid met 4 extra lijnen naast de bestaande "Werkelijk" en "Geprojecteerd":

1. **Minimum Norm** - De bestaande horizontale referentielijn wordt een echte oplopende lijn
2. **Fast Lane** - Een pad dat boven de huidige consultant ligt (ambitieniveau)
3. **Executive Lane** - Een nog hoger pad (top-performer niveau)
4. **Best Performer (Sophie de Vries)** - De werkelijke + geprojecteerde lijn van de best presterende consultant

Bij hover over de "Best Performer" lijn verschijnt een tooltip met een klikbare link naar de vergelijkingspagina (`/vergelijking/1`).

---

## Visueel Ontwerp

```text
 euro60k |                                          ....Executive Lane
         |                                    .....
 euro50k |                              ..... ---- Best Performer (proj.)
         |                        .....  ----
 euro45k |                  ..... ----          ---- Fast Lane
         |            .....  ----
 euro40k |       ....  ----                    ..... Minimum Norm
         |  .... ----                    .....
 euro35k | ----                    .....
         |~~~~~ Werkelijk (teal) ~~~~~
 euro30k |............................
         |
         mei  jun  jul  aug  sep  okt  nov  dec  jan  feb  mrt  apr
```

### Kleuren

| Lijn | Kleur | Stijl |
|------|-------|-------|
| Werkelijk (jij) | Teal | Solid, dik |
| Geprojecteerd (jij) | Goud/primary | Dashed, dik |
| Minimum Norm | Grijs (muted) | Dotted, dun |
| Fast Lane | Oranje (`#f59e0b`) | Dotted, dun |
| Executive Lane | Paars (`#8b5cf6`) | Dotted, dun |
| Best Performer werkelijk | Roze/rood (`#ec4899`) | Solid, medium |
| Best Performer geprojecteerd | Roze/rood (`#ec4899`) | Dashed, medium |

---

## Interactie

- Hover over de **Best Performer lijn** toont een custom tooltip met naam + "Hoe kom ik op deze plek?" link
- Klikken op de lijn of de link navigeert naar `/vergelijking/1` (Sophie's vergelijkingspagina)
- De legenda toont alle 5 lijncategorieen met bijbehorende kleuren

---

## Technische Details

### Aanpassingen

| Bestand | Wijziging |
|---------|-----------|
| `src/components/dashboard/RevenueChart.tsx` | Data uitbreiden met `minimumNorm`, `fastLane`, `executiveLane`, `bestPerformer`, `bestPerformerProj` velden. 5 extra `<Line>` componenten toevoegen. Custom tooltip met navigatie. Legenda uitbreiden. |

### Data Uitbreiding

Het `data` array krijgt extra velden per maand:

- `minimumNorm`: Geleidelijk oplopend van euro20k naar euro28k
- `fastLane`: Ligt circa 20-30% boven de huidige consultant, oplopend van euro34k naar euro52k
- `executiveLane`: Ligt nog hoger, oplopend van euro40k naar euro62k
- `bestPerformer`: Sophie's werkelijke omzet (hoger dan de huidige user), bijv. euro32k-euro44k
- `bestPerformerProj`: Sophie's projectie voor toekomstige maanden (euro46k-euro55k)

### Custom Tooltip

Er wordt een custom Recharts tooltip component gemaakt dat:
- Standaard alle waarden toont bij hover
- Bij hover specifiek over de Best Performer lijn een extra "Hoe kom ik op deze plek?" knop toont
- `useNavigate` gebruikt om naar `/vergelijking/1` te navigeren bij klik

### Legenda Uitbreiding

De legenda rechtsboven wordt uitgebreid met de nieuwe lijnen, in twee rijen als er niet genoeg ruimte is:
- Rij 1: Werkelijk, Geprojecteerd, Minimum Norm
- Rij 2: Fast Lane, Executive Lane, Best Performer
