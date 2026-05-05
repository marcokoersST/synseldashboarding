## Toon % Nieuw / % Bestaand per kanaal (en campagne) in Bron-treeview

Op het Funnel Operations dashboard (tab Instroom) toont de Bron-treeview nu alleen op het hoofdbron-niveau (bv. Reactivation, Paid social) hoeveel % nieuw en bestaand is. Op de uitgeklapte sub-rijen (platforms zoals Brevo, Bird en hun campagnes) staat momenteel `—`. We breiden dit uit zodat % nieuw/bestaand óók per platform en per campagne wordt getoond.

### Wijzigingen

**1. `src/data/funnelOperationsData.ts`**
- `SourcePlatform` en `SourceCampaign` interfaces: velden `nieuw: number` en `bestaand: number` toevoegen.
- Aggregatieloop in `sourceTree`: `nieuw`/`bestaand` ook op `PlatAgg` en `CampAgg` bijhouden (op basis van `c.type`).
- Outputmapping: deze waarden meenemen in de geretourneerde objects.

**2. `src/components/funnel-ops/SourceTreeView.tsx`**
- Voor platform-rijen en campagne-rijen: vervang de twee `—` cellen door berekende `pctNew` / `100 - pctNew` waarden (zelfde formule als hoofdbron-rij).
- Bij `total === 0` blijft `—` staan om deling door nul te voorkomen.
- Geen wijziging aan kolomstructuur, layout of styling.

### Buiten scope
- Geen wijziging aan score/conversie kolommen.
- Geen wijziging aan andere tabs of tegels.
