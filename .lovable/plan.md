
# Forecast Doelen Tegel - Implementatieplan

## Overzicht

Er komt een nieuwe tegel rechts van "Welkom terug, Jouw naam" waarmee je drie onderling verbonden doelen kunt instellen:
- **Omzet forecast** (bijv. €50.000)
- **Plaatsingen** (bijv. 5 plaatsingen)
- **Sollicitatiegesprekken** (bijv. 20 gesprekken)

Deze doelen beïnvloeden elkaar via een "triage calculatie": wanneer je slechts één doel invult, worden de andere twee automatisch berekend.

---

## Visueel Ontwerp

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  Welkom terug, Jouw naam                    ┌─────────────────────────────┐ │
│  woensdag 29 januari 2026                   │ 🎯 Forecast Doelen         │ │
│                                             │                             │ │
│                                             │  Omzet:        € 50.000 ✏️  │ │
│                                             │  Plaatsingen:  5        ✏️  │ │
│                                             │  Gesprekken:   20       ✏️  │ │
│                                             │                             │ │
│                                             │  [AI berekend label]        │ │
│                                             └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Triage Calculatie Logica

De drie doelen zijn onderling verbonden via conversieratio's:

| Conversie | Beschrijving | Standaard Ratio |
|-----------|-------------|-----------------|
| Gesprekken → Plaatsingen | Hoeveel gesprekken per plaatsing | 4:1 (25% conversie) |
| Plaatsingen → Omzet | Gemiddelde omzet per plaatsing | €10.000 per plaatsing |

### Rekenvoorbeelden

**Als alleen Gesprekken wordt ingevuld (bijv. 20):**
- Plaatsingen = 20 / 4 = 5
- Omzet = 5 × €10.000 = €50.000

**Als alleen Plaatsingen wordt ingevuld (bijv. 5):**
- Gesprekken = 5 × 4 = 20
- Omzet = 5 × €10.000 = €50.000

**Als alleen Omzet wordt ingevuld (bijv. €80.000):**
- Plaatsingen = €80.000 / €10.000 = 8
- Gesprekken = 8 × 4 = 32

---

## State Management

Er wordt een nieuwe React Context gemaakt (`ForecastGoalsContext`) die de doelen en berekende waarden beschikbaar maakt voor alle dashboard-tegels.

### Context Interface

```text
ForecastGoalsContext
├── revenueGoal: number | null      (handmatig ingesteld)
├── placementsGoal: number | null   (handmatig ingesteld)
├── interviewsGoal: number | null   (handmatig ingesteld)
├── calculatedValues: {
│   ├── revenue: number
│   ├── placements: number
│   └── interviews: number
│   }
├── lastEditedField: 'revenue' | 'placements' | 'interviews' | null
└── setGoal: (field, value) => void
```

---

## Inzichten in Andere Tegels

Wanneer doelen zijn ingesteld, verschijnen er inzichten in de volgende tegels:

| Tegel | Type Inzicht |
|-------|-------------|
| **SalaryProgressCard** | Projectie: "Met dit doel bereik je je volgende salarisstap" |
| **PlacementsCard** | Doel indicator op de grafiek + progress naar doel |
| **RevenueChart** | Extra doel-lijn met het ingestelde forecast target |
| **RevenueTargetCard** | Vergelijking met forecast doel |

Inzichten worden visueel onderscheiden met een subtiele achtergrondkleur en een "AI Inzicht" label.

---

## Technische Details

### Nieuwe Bestanden

1. **`src/contexts/ForecastGoalsContext.tsx`**
   - React Context voor het delen van forecast doelen
   - Triage calculatie logica
   - LocalStorage persistentie voor doelen

2. **`src/components/dashboard/ForecastGoalsCard.tsx`**
   - Compacte tegel met drie invoervelden
   - Inline editing met visuele feedback
   - Indicator welke velden automatisch berekend zijn

### Aanpassingen Bestaande Bestanden

1. **`src/pages/Index.tsx`**
   - WelcomeHeader en ForecastGoalsCard naast elkaar in een flex container
   - Wrap dashboard in ForecastGoalsProvider

2. **`src/components/dashboard/WelcomeHeader.tsx`**
   - Flexbox aanpassing voor naast-elkaar layout

3. **Diverse dashboard cards** (optioneel, fase 2)
   - Inzichten tonen gebaseerd op context waarden

### Styling

De tegel volgt het bestaande design systeem:
- `bg-card rounded-xl p-4 border border-border`
- Glassmorphism header effect
- Hover effect met `hover-lift`
- Entrance animatie met `AnimatedCard`
