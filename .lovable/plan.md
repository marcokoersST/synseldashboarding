# Bonus Tabel Overzicht: standaardkolommen, Totaal uit te keren, Dev info

## Wat verandert
1. **Standaard uitgevinkt:** Datum in dienst, Uitbetaling, Omzet Jigler, Omzet margefactuur, Omzet Please. Ze blijven aan te zetten via "Kolommen".
2. **Hernoemen:** "Omzet detachering" heet voortaan "Omzet Jigler" (ook in vertalingen).
3. **Totaal uit te keren** wordt berekend als: Omzetbonus + HPC/FG + Forecastbonus + Periodes forecastbonus + Targetbonus + Prijzen (lege waarden tellen als 0). Periode 8 blijft gelijk aan de afbeelding (de bronwaarden kloppen al met deze som).
4. **Periodes F** wordt een bedragkolom "Periodes forecastbonus" (nu leeg/"–", zoals in de bron), zodat hij in de som en het totaal meetelt.
5. **Dev info** uitgebreid (Engels) met per kolom de herkomst en formule: o.a. Omzet Jigler = secondment revenue from Jigler, Total margin = Jigler + margin invoice + Please, Total payout = sum of the six bonus components, Total bonus 2026 = cumulative year bonus, plus welke kolommen standaard verborgen zijn.

## Technisch
- `src/data/bonusTabelData.ts`: `periodesF: number | null`; `totaalUitTeKeren` berekend uit de componenten i.p.v. vaste waarde.
- `src/pages/concepts/BonusTabelOverzicht.tsx`: `DEFAULT_HIDDEN`-lijst; localStorage-sleutel naar `bonus-tabel-columns-v2` zodat de nieuwe standaard ook geldt voor wie al eerder keek; label/kind aanpassingen; `RankingDevInfo` calculations uitgebreid.
- Vertaling "Omzet Jigler" / "Periodes forecastbonus" toevoegen aan `src/lib/translations.ts`.
- Test: Totaal uit te keren = som van de zes componenten (Robin P8 = 1.500, Lars = 3.400, Jort = 1.300).
