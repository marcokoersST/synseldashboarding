// Ranglijsten TV Dashboard Mock Data

export interface RankingEntry {
  rank: number;
  name: string;
  value: number;
}

export interface RankingColumn {
  title: string;
  total: number;
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

export const ranglijstenColumns: RankingColumn[] = [
  {
    title: "Inschrijvingen",
    total: 1830,
    entries: generateRanking([125, 95, 93, 88, 73, 70, 69, 69, 65, 65, 63, 61, 60, 58, 55, 52, 48, 45, 42, 38]),
  },
  {
    title: "Acquisities",
    total: 609,
    entries: generateRanking([31, 25, 25, 24, 24, 24, 21, 21, 21, 21, 20, 20, 19, 18, 17, 16, 15, 14, 13, 12]),
  },
  {
    title: "Gesprekken",
    total: 416,
    entries: generateRanking([43, 40, 36, 28, 23, 21, 19, 18, 16, 16, 14, 14, 12, 11, 10, 9, 8, 8, 7, 6]),
  },
  {
    title: "Intakes",
    total: 210,
    entries: generateRanking([18, 16, 14, 13, 12, 12, 11, 11, 10, 10, 9, 8, 8, 7, 7, 6, 6, 5, 4, 3]),
  },
  {
    title: "Plaatsingen",
    total: 43,
    entries: generateRanking([6, 4, 4, 4, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]),
  },
  {
    title: "Niet begonnen",
    total: 4,
    entries: generateRanking([2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).filter(e => e.value > 0),
  },
];

export const ranglijstenFilters = {
  jaren: [2024, 2025, 2026],
  periodes: ["Week", "Periode", "Jaar"],
  units: ["Unit", "Engineering", "Operators", "Monteurs"],
};
