export const BONUS_UNITS = ["Engineering", "Monteurs", "Operators", "Trainingsunit", "Early Performers"] as const;

export interface BonusRecord {
  consultant: string;
  unit: string;
  datumInDienst: string;
  uitbetaling: string;
  targetbonus: number | null;
  prijzen: number | null;
  periodesF: number | null;
  forecastbonus: number | null;
  yellowCard: string | null;
  hpcFg: number | null;
  omzetDetachering: number;
  omzetWns: number;
  omzetMargefactuur: number;
  omzetPlease: number;
  totaalMarge: number;
  omzetbonus: number;
  totaalUitTeKeren: number;
  totaleBonus: number;
}

type Base = [string, string, string, string, number | null, number | null, number | null, string | null, number | null, number, number, number, number, number, number];
// consultant, unit, datum, uitbetaling, target, prijzen, forecast, yellow, hpc, det, marge, please, omzetbonus, uit te keren, totale bonus
const BASE: Base[] = [
  ["Robin van Bruggen", "Engineering", "11-2-2025", "Maart", null, null, null, null, 1000, 43567.76, 0, 0, 500, 1500, 24250],
  ["Sijmen Bossenbroek", "Engineering", "20-6-2022", "Mei", null, null, null, null, null, 23732.46, 0, 2642.62, 300, 300, 16800],
  ["Lars van Suntenmaartensdijk", "Monteurs", "1-6-2023", "Oktober", 3000, null, null, null, null, 36111.34, 0, 1866.73, 400, 3400, 15200],
  ["Jort Koggel", "Operators", "1-10-2024", "Februari", null, 500, 500, null, null, 24584.92, 2560, 2188.02, 300, 1300, 8600],
  ["Robin Jansen", "Monteurs", "3-5-2021", "Mei", null, null, null, null, null, 6465.54, 0, 0, 0, 0, 6800],
  ["Bas de Ruiter", "Trainingsunit", "15-2-2023", "Mei", null, 1000, null, null, null, 10992.5, 0, 622.4, 200, 1200, 6700],
  ["Robert Zielhuis", "Engineering", "4-4-2022", "Mei", null, null, null, null, null, 17549.66, 0, 2197.44, 200, 200, 5700],
  ["Falco Zegveld", "Operators", "3-2-2025", "Juni", null, null, null, null, 500, 30510.57, 0, 0, 400, 900, 5600],
  ["Joey de Vries", "Monteurs", "6-1-2025", "Mei", null, null, null, "1 van 2", 500, 26489.28, 2250, 0, 300, 800, 5300],
  ["Nino Boot", "Trainingsunit", "2-12-2024", "April", null, null, null, null, null, 9967.35, 2824, 1027.59, 200, 200, 3400],
  ["Dyon Mäkel", "Early Performers", "1-4-2026", "Mei", null, null, null, "1 van 2", 500, 10007.11, 2400, 0, 200, 700, 3200],
  ["Kaylee van den Berg", "Early Performers", "7-7-2025", "November", null, null, null, null, 500, 11172.45, 0, 0, 200, 700, 2600],
  ["Toby Bruinier", "Operators", "6-1-2025", "Mei", null, null, null, null, null, 9190.99, 0, 1988.93, 200, 200, 2500],
  ["Senna Ekkers", "Early Performers", "3-11-2026", "Maart", null, null, null, null, 500, 8822.74, 0, 0, 0, 500, 1900],
  ["Amer Faraman", "Trainingsunit", "15-1-2026", "Mei", null, null, null, null, null, 6987.14, 1500, 0, 0, 0, 1400],
  ["Tim Kuik", "Engineering", "1-7-2026", "November", null, null, null, null, 500, 8754.05, 0, 0, 0, 500, 500],
  ["Rick Karssen", "Monteurs", "13-7-2026", "November", null, null, null, null, null, 3123.22, 0, 1675.67, 0, 0, 0],
  ["Jelle van Enck", "Operators", "3-11-2026", "Maart", null, null, null, null, null, 3683.11, 0, 0, 0, 0, 0],
  ["Mart van Offeren", "Early Performers", "4-5-2026", "December", null, null, null, null, null, 0, 0, 2108.95, 0, 0, 0],
];

export const PERIODES = Array.from({ length: 13 }, (_, i) => i + 1);
export const DEFAULT_PERIODE = 8;

export function periodeWeeks(p: number) {
  return [1, 2, 3, 4].map((k) => (p - 1) * 4 + k);
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Totaal uit te keren = Omzetbonus + HPC/FG + Forecastbonus + Periodes forecastbonus + Targetbonus + Prijzen */
export function sumUitTeKeren(r: Pick<BonusRecord, "omzetbonus" | "hpcFg" | "forecastbonus" | "periodesF" | "targetbonus" | "prijzen">) {
  return (r.omzetbonus || 0) + (r.hpcFg || 0) + (r.forecastbonus || 0) + (r.periodesF || 0) + (r.targetbonus || 0) + (r.prijzen || 0);
}

export function bonusRecordsForPeriode(p: number): BonusRecord[] {
  return BASE.map((b, i) => {
    // Periode 8 = exact uit de bron; andere periodes deterministisch afgeleid.
    const f = p === DEFAULT_PERIODE ? 1 : 0.7 + (((i * 37 + p * 53) % 61) / 100);
    const cum = p === DEFAULT_PERIODE ? 1 : p / DEFAULT_PERIODE;
    const det = round(b[9] * f);
    const marge = round(b[10] * f);
    const please = round(b[11] * f);
    // Omzet W&S: geen bronwaarde, deterministisch mockbedrag (ca. 0–6 k per periode).
    const wns = b[9] === 0 && b[11] === 0 ? 0 : round(((i * 71 + p * 29) % 7) * 850 * f);
    return {
      consultant: b[0],
      unit: b[1],
      datumInDienst: b[2],
      uitbetaling: b[3],
      targetbonus: b[4],
      prijzen: b[5],
      periodesF: null,
      forecastbonus: b[6],
      yellowCard: b[7],
      hpcFg: b[8],
      omzetDetachering: det,
      omzetWns: wns,
      omzetMargefactuur: marge,
      omzetPlease: please,
      totaalMarge: round(det + wns + marge + please),
      omzetbonus: Math.round((b[12] * f) / 100) * 100,
      totaalUitTeKeren: 0,
      totaleBonus: Math.round((b[14] * cum) / 100) * 100,
    };
  }).map((r) => ({ ...r, totaalUitTeKeren: sumUitTeKeren(r) }));
}
