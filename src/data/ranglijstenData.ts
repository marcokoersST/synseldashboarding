// Ranglijsten TV Dashboard Mock Data

export interface RankingEntry {
  rank: number;
  name: string;
  value: number;
}

export interface RankingColumn {
  title: string;
  total: number;
  previousTotal: number;
  entries: RankingEntry[];
}

const names = [
  "Elmar Koopman", "Bas de Ruiter", "Jort Koggel", "Thom Auf der Heide",
  "Robert Zielhuis", "Lars van Summeren", "Bart van Vliet", "Robin van Brussel",
  "Elianne van Dalen", "Thijs Udink", "Joey Pol", "Eric Hutchison",
  "Falco Zegveld", "Amer Faraman", "Dyon Mäkel", "Toby Bruinier",
  "Kaylee van Houten", "Joey de Vries", "Mahesh Behari", "Sijmen Bos",
  "Niels Florijn", "Senna Ekkers", "Mathijs Oskar", "Robin Jansen",
  "Thijs Dirksen",
];

function generateRanking(values: number[]): RankingEntry[] {
  return values.map((value, i) => ({
    rank: i + 1,
    name: names[i % names.length],
    value,
  }));
}

// Week data (current week - default view)
export const ranglijstenWeekColumns: RankingColumn[] = [
  {
    title: "Inschrijvingen",
    total: 312,
    previousTotal: 289,
    entries: generateRanking([28, 24, 22, 19, 17, 16, 15, 14, 13, 13, 12, 11, 10, 10, 9, 9, 8, 7, 6, 5]),
  },
  {
    title: "Acquisities",
    total: 98,
    previousTotal: 104,
    entries: generateRanking([9, 8, 7, 7, 6, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 1]),
  },
  {
    title: "Gesprekken",
    total: 74,
    previousTotal: 68,
    entries: generateRanking([8, 7, 6, 5, 5, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1]),
  },
  {
    title: "Intakes",
    total: 38,
    previousTotal: 41,
    entries: generateRanking([5, 4, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0]),
  },
  {
    title: "Plaatsingen",
    total: 8,
    previousTotal: 6,
    entries: generateRanking([2, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).filter(e => e.value > 0),
  },
  {
    title: "Niet begonnen",
    total: 1,
    previousTotal: 2,
    entries: generateRanking([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).filter(e => e.value > 0),
  },
];

// Periode data (current period - used for auto-swap)
export const ranglijstenPeriodeColumns: RankingColumn[] = [
  {
    title: "Inschrijvingen",
    total: 1830,
    previousTotal: 1695,
    entries: generateRanking([125, 95, 93, 88, 73, 70, 69, 69, 65, 65, 63, 61, 60, 58, 55, 52, 48, 45, 42, 38]),
  },
  {
    title: "Acquisities",
    total: 609,
    previousTotal: 572,
    entries: generateRanking([31, 25, 25, 24, 24, 24, 21, 21, 21, 21, 20, 20, 19, 18, 17, 16, 15, 14, 13, 12]),
  },
  {
    title: "Gesprekken",
    total: 416,
    previousTotal: 438,
    entries: generateRanking([43, 40, 36, 28, 23, 21, 19, 18, 16, 16, 14, 14, 12, 11, 10, 9, 8, 8, 7, 6]),
  },
  {
    title: "Intakes",
    total: 210,
    previousTotal: 195,
    entries: generateRanking([18, 16, 14, 13, 12, 12, 11, 11, 10, 10, 9, 8, 8, 7, 7, 6, 6, 5, 4, 3]),
  },
  {
    title: "Plaatsingen",
    total: 43,
    previousTotal: 39,
    entries: generateRanking([6, 4, 4, 4, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]),
  },
  {
    title: "Niet begonnen",
    total: 4,
    previousTotal: 6,
    entries: generateRanking([2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).filter(e => e.value > 0),
  },
];

// Keep original export for backwards compat
export const ranglijstenColumns = ranglijstenWeekColumns;

export const ranglijstenFilters = {
  jaren: [2024, 2025, 2026],
  periodes: ["Week", "Periode", "Jaar"],
  units: ["Unit", "Engineering", "Operators", "Monteurs"],
};
