

# Wervingstrechter Calculator Tegel

## Wat
Een nieuwe tegel op het consultant dashboard (Index pagina) tussen de welkomstheader en "Doelen & Projecties". De tegel bevat een tabel met de wervingstrechter-stappen als kolommen en drie rijen:

1. **Kolomheaders**: Inschrijvingen, Intakes, Acquisities, Uitnodigingen, Gesprekken, Plaatsingen
2. **Rij 1 — "Jouw conversie"**: de actuele conversieratio's van de consultant (uit bestaande data), weergegeven als percentages tussen de kolommen
3. **Rij 2 — "Jouw funnel"**: de huidige aantallen per stap (uit data)
4. **Rij 3 — "Doel (input)"**: een bewerkbare rij waar de consultant een getal kan invullen bij elke stap (bijv. 5 bij Plaatsingen), waarna de tabel automatisch terugrekent hoeveel er nodig is bij elke voorgaande stap, op basis van de conversieratio's uit rij 1

### Voorbeeld
Consultant vult "5" in bij Plaatsingen → systeem rekent terug:
- 5 Plaatsingen ÷ 22% = 23 Gesprekken
- 23 Gesprekken ÷ 72% = 32 Uitnodigingen
- 32 Uitnodigingen ÷ 63% = 51 Acquisities
- 51 Acquisities ÷ 78% = 65 Inschrijvingen
- 65 Inschrijvingen × 62% = 40 Intakes

De consultant kan bij **elk** veld het getal aanpassen; de cellen links ervan (hogere funnel) worden dan herberekend.

## Technisch

### Nieuw bestand: `src/components/dashboard/FunnelCalculatorCard.tsx`
- Card-component met tabel (6 kolommen)
- Conversieratio's als constanten (afgeleid van bestaande data, bijv. `funnelSteps` uit consultantData)
- `useState` voor de input-rij; bij wijziging van een veld worden alle stappen links herberekend met `Math.ceil()`
- Tussen de kolomheaders kleine conversie-percentages tonen (pijltjes)
- Styling conform bestaande dashboard cards (`bg-card rounded-xl border`)

### Conversieratio's (hardcoded, gebaseerd op consultant data):
| Stap | Conversie naar volgende |
|------|------------------------|
| Inschrijvingen → Intakes | 62% |
| Intakes → Acquisities | 78% |  
| Acquisities → Uitnodigingen | 63% |
| Uitnodigingen → Gesprekken | 72% |
| Gesprekken → Plaatsingen | 22% |

### Wijziging: `src/pages/Index.tsx`
- Import `FunnelCalculatorCard`
- Plaatsen tussen de welkomstheader+ForecastGoalsCard en de "Doelen & Projecties" sectietitel
- Full-width (`mb-4`)

### Geen andere bestanden nodig

