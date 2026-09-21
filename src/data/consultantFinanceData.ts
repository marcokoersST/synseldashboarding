export type FinanceCategory = "detachering" | "margeFacturatie" | "vervroegdeOvername" | "wervingSelectie";

export interface ConsultantFinancePeriod {
  period: number;
  label: string;
  dateRange: string;
  gedetacheerden: number;
  detachering: number;
  margeFacturatie: number;
  vervroegdeOvername: number;
  opgelegdeWS: number;
  starts: number;
  gesprekken: number;
  isVakantieperiode?: boolean;
}

export interface CandidateFinanceRow {
  id: string;
  period: number;
  kandidaat: string;
  klant: string;
  status: string;
  categorie: FinanceCategory;
  startdatum: string;
  einddatum: string | null;
  factuurdatum: string;
  looptijdUren: number;
  salarisPercentage: number | null;
  omzet: number;
  potentieleMarge: number;
  voorwaarden: string;
}

export type ConsultantBonusType = "omzetbonus" | "targetbonus" | "forecastbonus" | "hpc" | "bokalen";

export interface ConsultantBonusEntry {
  id: string;
  type: ConsultantBonusType;
  label: string;
  maand: string;
  period: number;
  amount: number;
  basisAmount: number;
  status: "Behaald" | "Forecast" | "Club" | "Bokaal";
  explanation: string;
  rule: string;
  includes: string[];
  excludes: string[];
}

export const consultantFinancePeriods: ConsultantFinancePeriod[] = [
  { period: 10, label: "P10", dateRange: "2025-10-06 t/m 2025-11-02", gedetacheerden: 5, detachering: 12340, margeFacturatie: 0, vervroegdeOvername: 0, opgelegdeWS: 0, starts: 2, gesprekken: 18, isVakantieperiode: false },
  { period: 11, label: "P11", dateRange: "2025-11-03 t/m 2025-11-30", gedetacheerden: 6, detachering: 15034, margeFacturatie: 0, vervroegdeOvername: 0, opgelegdeWS: 0, starts: 2, gesprekken: 20, isVakantieperiode: false },
  { period: 12, label: "P12", dateRange: "2025-12-01 t/m 2025-12-28", gedetacheerden: 7, detachering: 17684, margeFacturatie: 2000, vervroegdeOvername: 0, opgelegdeWS: 0, starts: 3, gesprekken: 22, isVakantieperiode: false },
  { period: 13, label: "P13", dateRange: "2025-12-29 t/m 2026-01-25", gedetacheerden: 8, detachering: 21345, margeFacturatie: 2000, vervroegdeOvername: 0, opgelegdeWS: 3000, starts: 2, gesprekken: 17, isVakantieperiode: true },
  { period: 1, label: "P1", dateRange: "2026-01-26 t/m 2026-02-22", gedetacheerden: 5, detachering: 12304, margeFacturatie: 2000, vervroegdeOvername: 0, opgelegdeWS: 3000, starts: 1, gesprekken: 16, isVakantieperiode: true },
  { period: 2, label: "P2", dateRange: "2026-02-23 t/m 2026-03-22", gedetacheerden: 7, detachering: 18506, margeFacturatie: 2000, vervroegdeOvername: 0, opgelegdeWS: 3000, starts: 2, gesprekken: 19, isVakantieperiode: false },
  { period: 3, label: "P3", dateRange: "2026-03-23 t/m 2026-04-19", gedetacheerden: 9, detachering: 25342, margeFacturatie: 2000, vervroegdeOvername: 0, opgelegdeWS: 3000, starts: 3, gesprekken: 25, isVakantieperiode: false },
  { period: 4, label: "P4", dateRange: "2026-04-20 t/m 2026-05-17", gedetacheerden: 10, detachering: 15943, margeFacturatie: 2000, vervroegdeOvername: 0, opgelegdeWS: 3000, starts: 3, gesprekken: 26, isVakantieperiode: false },
  { period: 5, label: "P5", dateRange: "2026-05-18 t/m 2026-06-14", gedetacheerden: 11, detachering: 30421, margeFacturatie: 2000, vervroegdeOvername: 0, opgelegdeWS: 0, starts: 4, gesprekken: 24, isVakantieperiode: false },
  { period: 6, label: "P6", dateRange: "2026-06-15 t/m 2026-07-12", gedetacheerden: 15, detachering: 42342, margeFacturatie: 2000, vervroegdeOvername: 2500, opgelegdeWS: 0, starts: 5, gesprekken: 28, isVakantieperiode: false },
  { period: 7, label: "P7", dateRange: "2026-07-13 t/m 2026-08-09", gedetacheerden: 16, detachering: 42345, margeFacturatie: 2000, vervroegdeOvername: 2500, opgelegdeWS: 0, starts: 6, gesprekken: 31, isVakantieperiode: false },
  { period: 8, label: "P8", dateRange: "2026-08-10 t/m 2026-09-06", gedetacheerden: 16, detachering: 42345, margeFacturatie: 2000, vervroegdeOvername: 0, opgelegdeWS: 0, starts: 2, gesprekken: 18, isVakantieperiode: true },
  { period: 9, label: "P9", dateRange: "2026-09-07 t/m 2026-10-04", gedetacheerden: 14, detachering: 38703, margeFacturatie: 2000, vervroegdeOvername: 0, opgelegdeWS: 0, starts: 2, gesprekken: 19, isVakantieperiode: true },
];

export const consultantFinanceRows: CandidateFinanceRow[] = [
  { id: "P7-001", period: 7, kandidaat: "Michel Bakker", klant: "Arendsen Plaatwerk B.V.", status: "5 | Momenteel gedetacheerd", categorie: "detachering", startdatum: "2026-07-15", einddatum: "2027-01-15", factuurdatum: "2026-07-31", looptijdUren: 920, salarisPercentage: 1.8, omzet: 12684, potentieleMarge: 20584, voorwaarden: "Detachering · factor 1,80 · 40 uur per week" },
  { id: "P7-002", period: 7, kandidaat: "Beruica Vali Christinel", klant: "Minkels BV", status: "5 | Momenteel gedetacheerd", categorie: "detachering", startdatum: "2026-07-20", einddatum: "2027-02-20", factuurdatum: "2026-07-31", looptijdUren: 860, salarisPercentage: 1.75, omzet: 11891, potentieleMarge: 20000, voorwaarden: "Detachering · factor 1,75 · 38 uur per week" },
  { id: "P7-003", period: 7, kandidaat: "Ceyhun Kisa", klant: "Linthorst installatietechniek - Apeldoorn", status: "Afgevallen tijdens detacheringsperiode", categorie: "detachering", startdatum: "2026-07-01", einddatum: "2026-08-02", factuurdatum: "2026-08-04", looptijdUren: 160, salarisPercentage: 1.65, omzet: 5220, potentieleMarge: 13410, voorwaarden: "Detachering · korte looptijd · marge gecorrigeerd" },
  { id: "P7-004", period: 7, kandidaat: "François Reinier van Lingen", klant: "DAEL Technisch Beheer B.V.", status: "Afgevallen tijdens detacheringsperiode", categorie: "margeFacturatie", startdatum: "2026-06-24", einddatum: "2026-07-18", factuurdatum: "2026-07-20", looptijdUren: 120, salarisPercentage: null, omzet: 2000, potentieleMarge: 9102, voorwaarden: "Marge facturatie · nacalculatie verwerkt" },
  { id: "P7-005", period: 7, kandidaat: "Murat Serin", klant: "Kampen Industrial Care", status: "Afgevallen tijdens detacheringsperiode", categorie: "vervroegdeOvername", startdatum: "2026-05-18", einddatum: "2026-07-24", factuurdatum: "2026-07-26", looptijdUren: 300, salarisPercentage: null, omzet: 2500, potentieleMarge: 3777, voorwaarden: "Vervroegde overname · vaste fee" },
  { id: "P7-006", period: 7, kandidaat: "Martijn Hilster", klant: "Van Hoorn Machining BV", status: "Afgevallen tijdens detacheringsperiode", categorie: "detachering", startdatum: "2026-07-07", einddatum: "2026-07-28", factuurdatum: "2026-07-31", looptijdUren: 92, salarisPercentage: 1.55, omzet: 4050, potentieleMarge: 1360, voorwaarden: "Detachering · proefperiode vroegtijdig gestopt" },
  { id: "P6-001", period: 6, kandidaat: "Dyon Makel", klant: "MechTech Noord", status: "5 | Momenteel gedetacheerd", categorie: "detachering", startdatum: "2026-06-17", einddatum: "2027-01-30", factuurdatum: "2026-06-30", looptijdUren: 1080, salarisPercentage: 1.8, omzet: 14950, potentieleMarge: 23200, voorwaarden: "Detachering · factor 1,80 · 40 uur per week" },
  { id: "P6-002", period: 6, kandidaat: "Joey Vries", klant: "AquaHeat Systems", status: "5 | Momenteel gedetacheerd", categorie: "detachering", startdatum: "2026-06-21", einddatum: "2027-02-12", factuurdatum: "2026-06-30", looptijdUren: 1010, salarisPercentage: 1.72, omzet: 13624, potentieleMarge: 19550, voorwaarden: "Detachering · factor 1,72 · 36 uur per week" },
  { id: "P5-001", period: 5, kandidaat: "Sanne Koops", klant: "Hydroline Services", status: "5 | Momenteel gedetacheerd", categorie: "detachering", startdatum: "2026-05-20", einddatum: "2026-12-18", factuurdatum: "2026-05-31", looptijdUren: 880, salarisPercentage: 1.7, omzet: 10180, potentieleMarge: 17400, voorwaarden: "Detachering · factor 1,70 · 32 uur per week" },
  { id: "P5-002", period: 5, kandidaat: "Niels Visser", klant: "InstallPro Midden", status: "W&S fee gefactureerd", categorie: "wervingSelectie", startdatum: "2026-05-27", einddatum: null, factuurdatum: "2026-05-28", looptijdUren: 0, salarisPercentage: 0.18, omzet: 0, potentieleMarge: 0, voorwaarden: "W&S · uitgesloten voor RF/HPC" },
];

export const consultantBonusEntries: ConsultantBonusEntry[] = [
  { id: "bonus-p7-omzet", type: "omzetbonus", label: "Omzetbonus", maand: "juli", period: 7, amount: 500, basisAmount: 46845, status: "Behaald", explanation: "P7 komt boven de bonusdrempel van €40.000 periode-omzet uit.", rule: "Periode omzet vanaf €40.000 geeft €500 omzetbonus.", includes: ["Detachering", "Marge facturatie", "Vervroegde overname"], excludes: ["W&S voor RF/HPC"] },
  { id: "bonus-p7-hpc", type: "hpc", label: "HPC 7,5 Ton", maand: "juli", period: 7, amount: 500, basisAmount: 40512, status: "Club", explanation: "De rolling 3-periode basis blijft in de HPC-zone, maar nog onder Million.", rule: "HPC 7,5 Ton kijkt naar een RF-niveau van €750.000 en behoudsvoorwaarden op starts.", includes: ["Detachering", "Marge facturatie", "Vervroegde overname"], excludes: ["W&S", "Vakantieperiodes als referentie"] },
  { id: "bonus-p6-omzet", type: "omzetbonus", label: "Omzetbonus", maand: "juni", period: 6, amount: 500, basisAmount: 46842, status: "Behaald", explanation: "P6 haalt opnieuw de omzetbonusdrempel.", rule: "Periode omzet vanaf €40.000 geeft €500 omzetbonus.", includes: ["Detachering", "Marge facturatie", "Vervroegde overname"], excludes: ["W&S voor RF/HPC"] },
  { id: "bonus-p5-target", type: "targetbonus", label: "Targetbonus", maand: "mei", period: 5, amount: 1000, basisAmount: 32421, status: "Forecast", explanation: "Jaarforecast ligt boven de eerste targetbonusstap.", rule: "Targetbonus loopt via jaaromzetdrempels uit de bonusladder.", includes: ["Alle bewezen omzet in jaarforecast"], excludes: ["Niet-bevestigde pipeline"] },
  { id: "bonus-p5-bokaal", type: "bokalen", label: "Margebaas bokaal", maand: "mei", period: 5, amount: 500, basisAmount: 17400, status: "Bokaal", explanation: "Hoogste potentiële marge op gestarte plaatsingen in de periode.", rule: "Bokaal wordt uitgekeerd als de ondergrens wordt gehaald.", includes: ["Gestarte plaatsingen", "Potentiële marge"], excludes: ["Afgezegd vóór start"] },
  { id: "bonus-p4-forecast", type: "forecastbonus", label: "Forecastbonus", maand: "april", period: 4, amount: 500, basisAmount: 20520, status: "Forecast", explanation: "De drieperiodetrend laat voldoende groei zien voor een forecastbonus.", rule: "Rolling forecast bonus kijkt naar structureel hoger jaarniveau.", includes: ["Laatste 3 niet-vakantieperiodes"], excludes: ["Vakantieperiodes", "W&S"] },
];

export const omzetBonusLadder = [
  { omzet: 10000, bonus: 200 },
  { omzet: 20000, bonus: 300 },
  { omzet: 30000, bonus: 400 },
  { omzet: 40000, bonus: 500 },
  { omzet: 50000, bonus: 700 },
  { omzet: 60000, bonus: 900 },
  { omzet: 70000, bonus: 1250 },
  { omzet: 80000, bonus: 1750 },
  { omzet: 90000, bonus: 2250 },
  { omzet: 100000, bonus: 2750 },
  { omzet: 110000, bonus: 3250 },
  { omzet: 120000, bonus: 4000 },
  { omzet: 130000, bonus: 5000 },
  { omzet: 140000, bonus: 6000 },
  { omzet: 150000, bonus: 8000 },
  { omzet: 160000, bonus: 10000 },
];

export function periodTotal(period: ConsultantFinancePeriod) {
  return period.detachering + period.margeFacturatie + period.vervroegdeOvername + period.opgelegdeWS;
}

export function bonusTotalForPeriod(period: number) {
  return consultantBonusEntries
    .filter((entry) => entry.period === period)
    .reduce((sum, entry) => sum + entry.amount, 0);
}