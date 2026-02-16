

# Uitbreiding Sales Funnel: Conversiekolommen, Labels, en Acquisitie Conversie pagina

## Overzicht van alle wijzigingen

### 1. Vijf conversiekolommen toevoegen aan UnitFunnelBreakdown (TV pagina)

Nieuwe `#` kolommen worden toegevoegd aan de bestaande tabel:

| Groep | Conversie | Berekening |
|-------|-----------|-----------|
| 3. Voorstellen | Vrst/Inschr | voorstellenPerKandidaat / ingeschreven |
| 4. Uitnodigingen | Uitn/Acq | uitnodigingenTotaal / acquisities |
| 5. Gesprekken | Gespr/Acq | eersteGesprek / acquisities |
| 6. Vervolg | Gespr/Verv | welEersteGesprek / vervolgGesprek |
| 7. Geplaatst | Gepl/Inschr | geplaatst / ingeschreven |

Bestand: `src/components/tv/UnitFunnelBreakdown.tsx`

### 2. Labels "g" / "m" verduidelijken in CallStats

- `7g` wordt `7 gespr.`
- `42m` wordt `42 mails`

Bestand: `src/components/tv/CallStats.tsx` (regel 82-84)

### 3. Kolom "Voorstellen via email" toevoegen

Een nieuw dataveld `voorstellenViaEmail` wordt toegevoegd aan `UnitFunnelRow` en de mock data. Dit verschijnt als extra kolom in groep "3. Voorstellen".

Bestanden: `src/data/tvData.ts`, `src/components/tv/UnitFunnelBreakdown.tsx`

### 4. Nieuwe pagina: Acquisitie Conversie (Manager Dashboard)

Route: `/manager-dashboard/acquisitie-conversie`

Bevat dezelfde funnel-tabel als de TV versie, maar met:

- **Interactieve filters**: Jaar, Week/Periode toggle, weeknummer/periodenummer dropdown, unit dropdown
- **Kolomsortering**: Klikbare kolomheaders om te sorteren van hoog naar laag en vice versa (met pijltjesiconen)
- **Uitklapbare unit-rijen**: Klik op een unit-rij om individuele consultants te zien met hun eigen funnel-cijfers
- **Voorstellen via email kolom** is ook hier aanwezig
- Gebruikt `ConsultantLayout` voor sidebar-integratie

### Technisch overzicht

| Bestand | Actie |
|---------|-------|
| `src/data/tvData.ts` | `voorstellenViaEmail` toevoegen aan `UnitFunnelRow` interface en mock data; consultant-level funnel data per unit toevoegen |
| `src/components/tv/UnitFunnelBreakdown.tsx` | 5 conversiekolommen (`#`) + "Via email" kolom toevoegen aan `columnGroups` |
| `src/components/tv/CallStats.tsx` | `g` -> `gespr.`, `m` -> `mails` |
| `src/pages/manager/AcquisitieConversie.tsx` | Nieuwe pagina met filters, sorteerbare kolommen, en uitklapbare unit-rijen met consultant-details |
| `src/App.tsx` | Route `/manager-dashboard/acquisitie-conversie` toevoegen |
| `src/components/dashboard/Sidebar.tsx` | Sub-item "Acquisitie Conversie" toevoegen onder Manager Dashboard |

