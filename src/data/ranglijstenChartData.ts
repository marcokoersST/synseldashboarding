import { getRanglijstenData, type RankingColumn } from "./ranglijstenData";

export interface TimeSeriesPoint {
  label: string; // "W1", "P2", etc.
  num: number;
  [consultantName: string]: number | string;
}

export interface ColumnTimeSeries {
  title: string;
  primaryLabel: string;
  secondaryLabel?: string;
  primaryData: TimeSeriesPoint[];
  secondaryData?: TimeSeriesPoint[];
}

const COLUMN_META: { title: string; primary: string; secondary?: string }[] = [
  { title: "Inschrijvingen", primary: "Op naam", secondary: "Gedaan" },
  { title: "Acquisities", primary: "Acquisities", secondary: "Voorstellen" },
  { title: "Gesprekken", primary: "Gesprekken", secondary: "Uitnodigingen" },
  { title: "Intakes", primary: "Intakes", secondary: "% van acq." },
  { title: "Plaatsingen", primary: "Plaatsingen", secondary: "Detachering" },
  { title: "Niet begonnen", primary: "Niet begonnen" },
];

export function getRanglijstenTimeSeries(
  year: number,
  mode: "week" | "periode",
  fromNum: number,
  toNum: number,
  unitFilter?: string[]
): ColumnTimeSeries[] {
  const rangeNums: number[] = [];
  for (let n = fromNum; n <= toNum; n++) rangeNums.push(n);

  // Collect all data points
  const allData: { num: number; label: string; columns: RankingColumn[] }[] = rangeNums.map(num => ({
    num,
    label: mode === "week" ? `W${num}` : `P${num}`,
    columns: getRanglijstenData(year, mode, num),
  }));

  return COLUMN_META.map((meta, colIdx) => {
    const primaryData: TimeSeriesPoint[] = [];
    const secondaryData: TimeSeriesPoint[] = [];

    allData.forEach(({ num, label, columns }) => {
      const col = columns[colIdx];
      if (!col) return;

      const filteredEntries = unitFilter && unitFilter.length > 0
        ? col.entries.filter(e => unitFilter.includes(e.unit))
        : col.entries;

      const primaryPoint: TimeSeriesPoint = { label, num };
      const secondaryPoint: TimeSeriesPoint = { label, num };

      filteredEntries.forEach(entry => {
        primaryPoint[entry.name] = entry.value;
        if (entry.valueDone !== undefined) {
          secondaryPoint[entry.name] = entry.valueDone;
        }
      });

      primaryData.push(primaryPoint);
      if (meta.secondary) secondaryData.push(secondaryPoint);
    });

    return {
      title: meta.title,
      primaryLabel: meta.primary,
      secondaryLabel: meta.secondary,
      primaryData,
      secondaryData: meta.secondary ? secondaryData : undefined,
    };
  });
}

export function getAllConsultantNames(year: number, mode: "week" | "periode", num: number): string[] {
  const columns = getRanglijstenData(year, mode, num);
  const names = new Set<string>();
  columns.forEach(col => col.entries.forEach(e => { if (e.value > 0) names.add(e.name); }));
  return Array.from(names).sort();
}

export function getTopConsultants(
  year: number,
  mode: "week" | "periode",
  num: number,
  colIdx: number,
  count: number = 5,
  unitFilter?: string[]
): string[] {
  const columns = getRanglijstenData(year, mode, num);
  const col = columns[colIdx];
  if (!col) return [];
  let entries = col.entries.filter(e => e.value > 0);
  if (unitFilter && unitFilter.length > 0) {
    entries = entries.filter(e => unitFilter.includes(e.unit));
  }
  return entries.slice(0, count).map(e => e.name);
}

export function getAllUnits(): string[] {
  return ["Early Performers", "Engineering", "Monteurs", "Operators", "Trainingsunit"];
}

export const CHART_COLORS = [
  "hsl(220, 70%, 50%)",  // blue
  "hsl(0, 70%, 50%)",    // red
  "hsl(142, 70%, 40%)",  // green
  "hsl(45, 90%, 50%)",   // gold
  "hsl(280, 60%, 50%)",  // purple
  "hsl(200, 80%, 45%)",  // cyan
  "hsl(25, 85%, 55%)",   // orange
  "hsl(330, 65%, 50%)",  // pink
  "hsl(170, 60%, 40%)",  // teal
  "hsl(60, 70%, 45%)",   // olive
];
