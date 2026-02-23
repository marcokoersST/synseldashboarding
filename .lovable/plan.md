

# Opvolging Tegel Aanpassingen

## Wijzigingen

### 1. Tegel groter maken in layout (`src/pages/ManagerDashboard.tsx`)
De Opvolging kaart staat nu in `col-span-1` (1/3 breedte) naast de Sales Funnel (`col-span-2`). De flowchart scorecards passen hier niet volledig in en vereisen horizontaal scrollen.

**Oplossing**: Opvolging verplaatsen naar een eigen rij onder de Sales Funnel, met `col-span-3` (volledige breedte). Hierdoor zijn alle 6 scorecards in overview-modus direct zichtbaar zonder scrollen.

### 2. Records lijst verbeteren (`src/components/manager/OpvolgingCard.tsx`)

**Huidige staat**: Elke record toont de deal ID inline als `{record.consultantName} · {record.id}` in klein formaat (text-[10px]).

**Wijzigingen**:
- Records omzetten van een compacte lijst naar een tabel-achtig formaat met duidelijke kolommen
- Kolommen: **Stage** | **Kandidaat** | **Consultant** | **Deal ID** | **Datum**
- Deal ID tonen als numeriek getal (bijv. `1011`) i.p.v. `DEAL-1011`
- Tekstformaat vergroten van `text-[10px]`/`text-xs` naar `text-xs`/`text-sm` voor betere leesbaarheid
- Kolomheaders toevoegen boven de records lijst

