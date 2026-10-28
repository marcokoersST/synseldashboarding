# Periode vergelijking gelijk aan screenshot

Alleen de bovenkant van beide panelen (A en B) op "Omzet dashboard - vernieuwde versie" wordt aangepast. Tabellen eronder blijven zoals ze zijn.

## Wat verandert
- **Titel** "Periode vergelijking A/B" vetter en iets groter, bovenaan in een witte kaart met zachte rand.
- **Selectieregel:** "Groep 1" en "Groep 2" naast elkaar, elk over de halve breedte. Per groep:
  - een kleine keuzelijst **jaar** (2026, 2025, 2024), standaard 2026
  - een brede keuzelijst met de gekozen periodes ("P6, P7, P8") met pijltje rechts, over de rest van de breedte
- **Drie cijferblokken** naast elkaar, wit met rand en ronde hoeken (geen grijze vlakken meer):
  - Groep 1-label (bijv. "P6+P7+P8") klein en grijs, bedrag groot en vet
  - Groep 2 idem
  - **Verschil:** bedrag in een gekleurd pilletje met pijltje — rood met pijl omlaag bij daling, groen met pijl omhoog bij stijging

## Technische details
- `src/pages/concepts/OmzetDashboardVernieuwd.tsx`: `PeriodeMultiSelect` krijgt een jaar-`Select` (w-24) + volle-breedte periode-trigger; panelstate krijgt `jaar1`/`jaar2`. Jaar verschuift de mock-bedragen deterministisch (2026 = huidige cijfers) zodat wisselen zichtbaar effect heeft.
- KPI-blokken: `border bg-card rounded-xl p-4`, label `text-xs text-muted-foreground`, bedrag `text-2xl font-bold`; verschil als badge `bg-destructive/10 text-destructive` resp. emerald-variant met `ArrowDownRight`/`ArrowUpRight`.
- Nieuwe labels ("Jaar") toevoegen aan vertalingen.
