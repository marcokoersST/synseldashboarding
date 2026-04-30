# Ranglijsten op consultant dashboard

## Doel
Bovenaan het consultant dashboard (`/`) tonen waar de ingelogde consultant in de ranglijsten van zijn/haar **eigen unit** staat — met dezelfde 6 kolommen als de bestaande Ranglijsten-pagina (Inschrijvingen, Acquisities/Voorstellen, Gesprekken/Uitnodigingen, Intakes, Plaatsingen/Detachering, Niet begonnen). De eigen rij krijgt een gouden achtergrondgloed + dikgedrukte naam, zodat het oog er direct heen wordt getrokken. De gebruiker zit standaard "in beeld" met een paar consultants boven en onder zich, en kan binnen een beperkt scrollvenster naar boven/onder scrollen.

De `FunnelCalculatorCard` verhuist voor nu naar de onderkant van de pagina (niet verwijderd).

## Layout op `/` (Index.tsx)
```text
WelcomeHeader   |   ForecastGoalsCard
─────────────────────────────────────
[NIEUW]  Mijn positie in mijn unit — Ranglijsten card (6 kolommen)
─────────────────────────────────────
Section title: Doelen & Projecties (3 maanden)
SalaryProgressCard
PlacementsCard | GoalsCard
RevenueChart
... (rest ongewijzigd) ...
Bottom row (CoreActivities | VacancyActivities | RecruitmentFunnel)
─────────────────────────────────────
[VERPLAATST] FunnelCalculatorCard  (helemaal onderaan)
```

## Nieuwe component: `UnitRanglijstenCard`
Bestand: `src/components/dashboard/UnitRanglijstenCard.tsx`

### Data
- Gebruik `getRanglijstenData(year, mode, num)` uit `src/data/ranglijstenData.ts`.
- Default: huidige periode (mode `"periode"`, `getCurrentPeriodNumber()`, year 2026 — passend bij rest van mock-data).
- Filter elke kolom's `entries` op de unit van de huidige consultant, hersorteer op `value` desc, en hernummer `rank` binnen de unit.
- Huidige consultant: hardcoded mock-identiteit, consistent met `WelcomeHeader`. Voorstel: **"Robin Jansen" (Monteurs)** (komt voor in `allConsultantsList` en in de screenshot). Eén centrale const `CURRENT_CONSULTANT_NAME` bovenin het bestand voor makkelijke wijziging later.

### Kolomweergave (per kolom)
Kop bovenaan kolom (klein, uppercase, zoals screenshot):
- Titel (bv. "INSCHRIJVINGEN", "ACQUISITIES / VOORSTELLEN", "GESPREKKEN / UITNODIGINGEN", "INTAKES", "PLAATSINGEN / DETACHERING", "NIET BEGONNEN").
- Daaronder de unit-totalen (groot getal + sublabel + delta vs vorige periode), in vereenvoudigde vorm.

Lijst van consultants binnen de unit:
- Kolommen: `rank.`, naam (afgekort als "Robin J." behalve eigen naam = volledige naam), waarde rechts, optioneel `valueDone` (✓-getal) en `×ratio` of `(%)` zoals op de TV Ranglijsten.
- Iconen: 🏆 voor #1 (Trophy), 🥈/🥉 voor #2/#3 (Medal), Flame voor `isHot`, Rocket voor `isRocket` — exact patroon van `OmzetRankingCard`/`TVRanglijsten`.

### Eigen-rij highlight (gouden gloed)
- Achtergrond: `bg-gradient-to-r from-gold/30 via-gold/20 to-gold/10` met `ring-1 ring-gold/40` en zachte `shadow-[0_0_12px_-2px_hsl(var(--gold)/0.45)]`.
- Naam: `font-bold text-foreground` (rest van rijen: `font-normal`).
- Eigen rij krijgt links een dunne gouden bar (`before:` pseudo of gewoon border-l-2 border-gold).
- `gold` token bestaat al in tailwind theme (zie `bg-gold` in `ConsultantTimelineRow`).

### Scroll-window gedrag
- Vaste hoogte per kolomlijst: `max-h-[320px]` met `overflow-y-auto` en custom dunne scrollbar (`scrollbar-thin` of bestaande utility).
- Bij mount: voor élke kolom auto-scroll zodat de eigen rij **gecentreerd** in beeld staat (`ref.current?.scrollIntoView({ block: 'center' })` per kolom, in `useLayoutEffect`).
- Resultaat: gebruiker ziet bij eerste blik enkele namen boven en enkele namen onder zichzelf en kan vrij omhoog/omlaag scrollen binnen die viewport. Geen virtualisatie nodig (units max ~12 consultants).
- Sticky-header binnen scrollcontainer is niet nodig (kolomkop staat boven het scrollvenster).

### Card-shell
- Standaard `Card` uit `@/components/ui/card`.
- Header: titel "Mijn positie — {unit}" links, klein subkopje "Periode P{n} 2026" rechts. Optioneel kleine toggle Week/Periode (later); voor v1 alleen Periode.
- Body: `grid grid-cols-2 lg:grid-cols-6 gap-3` met de 6 kolommen.
- Animatie via bestaande `AnimatedCard` of `animate-fade-in-up` met `delay={75}`.

## Wijzigingen in `src/pages/Index.tsx`
- Importeer nieuwe `UnitRanglijstenCard`.
- Verwijder `FunnelCalculatorCard` block direct na de header.
- Plaats `<UnitRanglijstenCard delay={75} />` direct boven de "Doelen & Projecties (3 maanden)"-titel.
- Voeg `FunnelCalculatorCard` als laatste blok toe, ná de huidige bottom row, met een eigen `mt-6` en delay `1100`.

## Niet in scope
- Geen wijzigingen aan TV Ranglijsten of de algemene Ranglijsten-pagina.
- Geen Week/Jaar-toggle (kan later).
- Geen back-end koppeling — pure mock-data via bestaande generator.

## Bestanden
- Nieuw: `src/components/dashboard/UnitRanglijstenCard.tsx`
- Aanpassen: `src/pages/Index.tsx`
