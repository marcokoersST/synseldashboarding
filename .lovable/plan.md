

# Plan: DateFilterPanel upgraden naar referentie-design

## Wat verandert

De huidige DateFilterPanel wordt visueel en functioneel aangepast om overeen te komen met het referentiebeeld. De kernfunctionaliteit (presets, kalender, vergelijking) is al aanwezig — dit is primair een UI-herstructurering.

## Wijzigingen in `src/components/marketing/DateFilterPanel.tsx`

### Presets
- Voeg ontbrekende presets toe: **"Vandaag en gisteren"** en **"Afgelopen 28 dagen"** (tussen 14 en 30)
- Voeg **"Aangepast"** preset toe onderaan (selecteert custom modus, geen actie op kalender)
- Vervang huidige knoppen door **radio buttons** (visueel als cirkel/bullet, één actief tegelijk)
- Actieve preset krijgt filled radio indicator ipv achtergrondkleur

### Vergelijkingssectie
- Vervang Switch door **checkbox** met label "Vergelijken"
- Wanneer vergelijken aan:
  - **Rij 1**: Radio + dropdown preset (bijv. "Afgelopen 30 dagen") + datum labels `9 maart 2026 - 7 april 2026`
  - **Rij 2**: Radio + dropdown "Aangepast" + datum labels
  - Gebruiker kiest tussen standaard periode of custom via radio selectie
- Voeg **"Overlap data"** toggle toe (filled circle indicator) — puur visuele state, doorsturen als prop voor toekomstig gebruik in charts

### Footer
- Voeg tekst toe: `Datums worden weergegeven in Amsterdam`
- Rename knoppen: "Annuleren" (blijft) + "Bijwerken" (was "Toepassen")

### Props uitbreiding
- Voeg `overlapData` + `onOverlapDataChange` toe aan interface (optioneel, default false)

## Visuele aanpassingen
- Presets: radio circles links van labels
- Vergelijkings-rij: horizontale layout met dropdown + datum-tekst
- Compactere spacing conform referentie
- Kalender styling ongewijzigd (al correct met 2 maanden + today ring)

## Bestanden

| Bestand | Wijziging |
|---|---|
| `src/components/marketing/DateFilterPanel.tsx` | UI herstructurering: radio presets, checkbox vergelijken, overlap toggle, dropdown compare, footer tekst |
| `src/pages/marketing/MarketingHub.tsx` | Optioneel: overlap state toevoegen (kan later) |

