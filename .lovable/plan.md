

# Data Synchronisatie: E-mail & Gesprekken Tegels

## Probleem

De cijfers in de **Kernactiviteiten** tegel en de **Gesprekken/E-mail** tegels spreken elkaar tegen:

| Metric | Kernactiviteiten | Communicatie tegel |
|--------|------------------|--------------------|
| Emails verstuurd | 245 | 156 |
| Gesprekken | 89 | 136 (47 in + 89 uit) |

## Oplossing

De mock data in `CoreActivitiesCard.tsx` wordt aangepast zodat de waarden overeenkomen met de communicatietegels:

- **Emails verstuurd**: 245 wordt **156** (komt overeen met `mailData.passive.sent`)
- **Gesprekken**: 89 wordt **136** (komt overeen met `callsData.passive.totalCalls`, inkomend + uitgaand)
- De dagelijkse barchart-data (7 dagen) wordt proportioneel aangepast zodat de som overeenkomt met de nieuwe totalen

## Technische details

### Bestand: `src/components/dashboard/CoreActivitiesCard.tsx`

**Emails verstuurd** (regel 12-16):
- `value`: 245 naar 156
- `data`: Nieuwe dagwaarden die optellen tot 156, bijv. `[20, 25, 18, 30, 27, 16, 20]`

**Gesprekken** (regel 22-26):
- `value`: 89 naar 136
- `data`: Nieuwe dagwaarden die optellen tot 136, bijv. `[18, 22, 16, 25, 21, 14, 20]`

