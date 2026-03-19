// Ranglijsten TV Dashboard Mock Data

export interface RankingEntry {
  rank: number;
  name: string;
  firstName: string;
  lastName: string;
  value: number;
  valueDone?: number;
  unit: string;
  isHot: boolean;
  isRocket: boolean;
}

export interface RankingColumn {
  title: string;
  total: number;
  previousTotal: number;
  totalDone?: number;
  previousTotalDone?: number;
  entries: RankingEntry[];
}

interface ConsultantInfo {
  firstName: string;
  infix: string;
  lastName: string;
  unit: string;
  fullName: string;
}

function buildConsultant(first: string, infix: string, last: string, unit: string): ConsultantInfo {
  const fullName = infix ? `${first} ${infix} ${last}` : `${first} ${last}`;
  return { firstName: first, infix, lastName: last, unit, fullName };
}

const consultants: ConsultantInfo[] = [
  buildConsultant("Amer", "", "Faraman", "Early Performers"),
  buildConsultant("Bart", "van", "Vliet", "Monteurs"),
  buildConsultant("Bas", "de", "Ruiter", "Operators"),
  buildConsultant("Christiaan", "van", "Krieken", "Operators"),
  buildConsultant("Daan", "", "Jacobs", "Monteurs"),
  buildConsultant("Dees", "", "Beeking", "Trainingsunit"),
  buildConsultant("Delano", "", "Nikkels", "Engineering"),
  buildConsultant("Dyon", "", "Mäkel", "Early Performers"),
  buildConsultant("Elianne", "van", "Lohuizen", "Operators"),
  buildConsultant("Elmar", "", "Koopman", "Monteurs"),
  buildConsultant("Emily", "", "Huigens", "Trainingsunit"),
  buildConsultant("Eric", "", "Hutchison", "Engineering"),
  buildConsultant("Falco", "", "Zegveld", "Engineering"),
  buildConsultant("Ian", "", "Schaufeli", "Operators"),
  buildConsultant("Jelle", "van", "Enck", "Early Performers"),
  buildConsultant("Joey", "", "Pol", "Monteurs"),
  buildConsultant("Joey", "de", "Vries", "Monteurs"),
  buildConsultant("Jonah", "", "Waterborg", "Engineering"),
  buildConsultant("Joost", "", "Kloppers", "Monteurs"),
  buildConsultant("Jort", "", "Koggel", "Engineering"),
  buildConsultant("Kaylee", "van den", "Berg", "Monteurs"),
  buildConsultant("Lars", "van", "Suntenmaartensdijk", "Operators"),
  buildConsultant("Mahesh", "", "Behari", "Operators"),
  buildConsultant("Marco", "", "Schaap", "Monteurs"),
  buildConsultant("Marnix", "", "Miltenburg", "Trainingsunit"),
  buildConsultant("Mathijs", "", "Oskamp", "Engineering"),
  buildConsultant("Miguel", "", "Kraaijeveld", "Engineering"),
  buildConsultant("Niek", "", "Roufs", "Monteurs"),
  buildConsultant("Niels", "", "Eggens", "Engineering"),
  buildConsultant("Niels", "", "Florijn", "Engineering"),
  buildConsultant("Nino", "", "Boot", "Monteurs"),
  buildConsultant("Noa", "", "Treep", "Trainingsunit"),
  buildConsultant("Paul", "", "Geers", "Trainingsunit"),
  buildConsultant("Rick", "", "Karssen", "Early Performers"),
  buildConsultant("Robbert", "", "Dalhuisen", "Trainingsunit"),
  buildConsultant("Robert", "van", "Zielhuis", "Operators"),
  buildConsultant("Robin", "", "Jansen", "Monteurs"),
  buildConsultant("Robin", "van", "Bruggen", "Monteurs"),
  buildConsultant("Roel", "", "Linthorst", "Trainingsunit"),
  buildConsultant("Ruben", "", "Zoet", "Operators"),
  buildConsultant("Saleh", "", "Akhras", "Trainingsunit"),
  buildConsultant("Sander", "", "Beckker", "Engineering"),
  buildConsultant("Senna", "", "Ekkers", "Early Performers"),
  buildConsultant("Sijmen", "", "Bossenbroek", "Monteurs"),
  buildConsultant("Stijn", "", "Koldenhoven", "Engineering"),
  buildConsultant("Ted", "", "Bronkhorst", "Early Performers"),
  buildConsultant("Thijs", "", "Dirksen", "Engineering"),
  buildConsultant("Thijs", "", "Pisa", "Trainingsunit"),
  buildConsultant("Thijs", "", "Udink", "Operators"),
  buildConsultant("Thom", "auf der", "Masch", "Operators"),
  buildConsultant("Ties", "", "Ganzevles", "Trainingsunit"),
  buildConsultant("Tim", "", "Kuik", "Trainingsunit"),
  buildConsultant("Toby", "", "Bruinier", "Monteurs"),
  buildConsultant("Tom", "", "Tulen", "Engineering"),
  buildConsultant("Tomas", "", "Jansen", "Engineering"),
  buildConsultant("Xander", "", "Blok", "Engineering"),
];

const hotNames = new Set([
  "Joey de Vries", "Senna Ekkers", "Thijs Dirksen",
  "Christiaan van Krieken", "Dees Beeking",
]);

// Simple deterministic hash for seeded variation
function seedHash(year: number, mode: number, num: number): number {
  let h = (year * 31 + mode * 17 + num * 53) ^ 0x5f3759df;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = (h >> 16) ^ h;
  return Math.abs(h);
}

// Seeded pseudo-random (0-1) from index + seed
function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// Base top values for week view per column
const baseWeekTopValues: number[][] = [
  [28, 24, 22, 19, 17, 16, 15, 14, 13, 13, 12, 11, 10, 10, 9, 9, 8, 7, 6, 5, 4, 4, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1],
  [9, 8, 7, 7, 6, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 1],
  [7, 6, 6, 5, 5, 4, 4, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1],
  [8, 7, 6, 5, 5, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1],
  [5, 4, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1],
  [2, 1, 1, 1, 1, 1, 1],
  [1],
];

const basePeriodeTopValues: number[][] = [
  [125, 95, 93, 88, 73, 70, 69, 69, 65, 65, 63, 61, 60, 58, 55, 52, 48, 45, 42, 38, 35, 30, 28, 25, 22, 20, 18, 15, 12, 10, 8, 6, 5, 4, 3, 2, 1],
  [31, 25, 25, 24, 24, 24, 21, 21, 21, 21, 20, 20, 19, 18, 17, 16, 15, 14, 13, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  [28, 22, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  [43, 40, 36, 28, 23, 21, 19, 18, 16, 16, 14, 14, 12, 11, 10, 9, 8, 8, 7, 6, 5, 4, 3, 2, 1],
  [18, 16, 14, 13, 12, 12, 11, 11, 10, 10, 9, 8, 8, 7, 7, 6, 6, 5, 4, 3, 2, 1, 1],
  [6, 4, 4, 4, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [2, 1, 1],
];

const columnTitles = ["Inschrijvingen", "Acquisities", "Voorstellen", "Gesprekken", "Intakes", "Plaatsingen", "Niet begonnen"];

function generateVariedRanking(baseValues: number[], seed: number): RankingEntry[] {
  // Apply variation: scale values by a factor between 0.7 and 1.3
  const factor = 0.7 + (seedHash(seed, 1, 0) % 60) / 100;
  const shuffleOffset = seed % consultants.length;

  const allValues: number[] = [];
  for (let i = 0; i < consultants.length; i++) {
    const baseVal = i < baseValues.length ? baseValues[i] : 0;
    const varied = Math.round(baseVal * factor * (0.85 + seededRandom(seed, i) * 0.3));
    allValues.push(Math.max(0, varied));
  }

  // Shuffle consultant order deterministically using seed
  const indices = consultants.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = seedHash(seed, i, shuffleOffset) % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // Create entries and sort by value descending
  const entries = indices.map((ci, vi) => ({
    rank: 0,
    name: consultants[ci].fullName,
    firstName: consultants[ci].firstName,
    lastName: consultants[ci].lastName,
    unit: consultants[ci].unit,
    value: allValues[vi],
    isHot: hotNames.has(consultants[ci].fullName),
    isRocket: false,
  }));

  entries.sort((a, b) => b.value - a.value);
  entries.forEach((e, i) => { e.rank = i + 1; });

  // Rocket mode: simulate "overtook 3+ positions in last 5 days"
  // Deterministically pick ~10% of entries with value > 0 and rank > 3
  entries.forEach((e, i) => {
    if (e.value > 0 && e.rank > 3) {
      const rocketChance = seededRandom(seed + 999, i);
      if (rocketChance < 0.12) {
        e.isRocket = true;
      }
    }
  });

  return entries;
}

function generateColumns(baseTopValues: number[][], seed: number, prevSeed: number): RankingColumn[] {
  return columnTitles.map((title, colIdx) => {
    const entries = generateVariedRanking(baseTopValues[colIdx], seed + colIdx * 7);
    const total = entries.reduce((s, e) => s + e.value, 0);
    const prevEntries = generateVariedRanking(baseTopValues[colIdx], prevSeed + colIdx * 7);
    const previousTotal = prevEntries.reduce((s, e) => s + e.value, 0);
    return { title, total, previousTotal, entries };
  });
}

/**
 * Get ranking data for a specific year, view mode, and number.
 * Returns deterministically varied data per combination.
 */
export function getRanglijstenData(year: number, mode: "week" | "periode", num: number): RankingColumn[] {
  const modeNum = mode === "week" ? 0 : 1;
  const baseValues = mode === "week" ? baseWeekTopValues : basePeriodeTopValues;
  const seed = seedHash(year, modeNum, num);
  const prevSeed = seedHash(year, modeNum, Math.max(1, num - 1));
  return generateColumns(baseValues, seed, prevSeed);
}

// Legacy exports for backward compat
export const ranglijstenWeekColumns = getRanglijstenData(2026, "week", 9);
export const ranglijstenPeriodeColumns = getRanglijstenData(2026, "periode", 2);
export const ranglijstenColumns = ranglijstenWeekColumns;

export const allColumnTitles = columnTitles;

export function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
}

export function getCurrentPeriodNumber(): number {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000) + 1;
  return Math.min(13, Math.max(1, Math.ceil(dayOfYear / 28)));
}

export const ranglijstenFilters = {
  jaren: [2024, 2025, 2026],
  periodes: ["Week", "Periode", "Jaar"],
  periodenummers: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12", "P13"],
  weeknummers: Array.from({ length: 53 }, (_, i) => `W${i + 1}`),
  units: ["Alle units", "Early Performers", "Engineering", "Monteurs", "Operators", "Trainingsunit"],
};
