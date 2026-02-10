
# Data-notificatie toevoegen op Geld & Bonus pagina

## Wat wordt er gedaan

Op de Geld & Bonus pagina (`/consultant/geld-bonus`) wordt bij elke kaart die financiele data toont een subtiele notificatiebanner toegevoegd met de tekst:

> "Deze data is afhankelijk van Jigler BV. Wordt dagelijks geüpdatet. Zie je iets misgaan?"
> [Help-knop]

## Welke kaarten krijgen de notificatie

Alle 8 kaarten op deze pagina tonen financiele data, dus allemaal:

1. Bonusmeter
2. Salarisstap
3. Totale Verdiensten
4. Scenario Calculator
5. Detavast-waarde Indicator
6. Marge per Plaatsing
7. No-Regret Lijst
8. Bonusranglijst

## Visueel ontwerp

De notificatie verschijnt als een compact bannerje onderaan elke kaart:

```text
+------------------------------------------+
|  Bonusmeter                              |
|  ... kaart inhoud ...                    |
|                                          |
|  [i] Data via Jigler BV - dagelijks      |
|      geüpdatet. Iets misgaan? [? Help]   |
+------------------------------------------+
```

- Lichtblauwe/grijze achtergrond (`bg-muted/50`)
- Klein info-icoontje (`Info` uit lucide-react)
- Tekst in `text-xs text-muted-foreground`
- "Help" knop als kleine pill-button met `HelpCircle` icoon
- De Help-knop opent een dialog met contactinformatie / instructies om een probleem te melden

## Technische details

### Bestanden

| Bestand | Wijziging |
|---------|-----------|
| `src/components/consultant/JiglerDataNotice.tsx` | **Nieuw** - Herbruikbaar notificatie-component met help-dialog |
| `src/pages/consultant/GeldBonus.tsx` | Import en plaatsing van `JiglerDataNotice` in elke `CardContent` |

### JiglerDataNotice component

Een compact, herbruikbaar component dat:
- De info-tekst toont over Jigler BV en dagelijkse updates
- Een "Help" knop bevat die een Dialog opent
- De Dialog bevat instructies zoals "Neem contact op met je manager" of "Mail support@synsel.nl"
- Gebruikt bestaande `Dialog` en `Button` UI componenten
