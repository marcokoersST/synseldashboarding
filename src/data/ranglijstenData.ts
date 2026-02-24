// Ranglijsten TV Dashboard Mock Data

export interface RankingEntry {
  rank: number;
  name: string;
  value: number;
  unit: string;
  isHot: boolean;
}

export interface RankingColumn {
  title: string;
  total: number;
  previousTotal: number;
  entries: RankingEntry[];
}

interface ConsultantInfo {
  name: string;
  unit: string;
}

const consultants: ConsultantInfo[] = [
  // Early Performers
  { name: "Amer Faraman", unit: "Early Performers" },
  { name: "Dyon Mäkel", unit: "Early Performers" },
  { name: "Jelle van Enck", unit: "Early Performers" },
  { name: "Rick Karssen", unit: "Early Performers" },
  { name: "Senna Ekkers", unit: "Early Performers" },
  { name: "Ted Bronkhorst", unit: "Early Performers" },
  // Engineering
  { name: "Delano Nikkels", unit: "Engineering" },
  { name: "Eric Hutchison", unit: "Engineering" },
  { name: "Falco Zegveld", unit: "Engineering" },
  { name: "Jonah Waterborg", unit: "Engineering" },
  { name: "Jort Koggel", unit: "Engineering" },
  { name: "Mathijs Oskamp", unit: "Engineering" },
  { name: "Miguel Kraaijeveld", unit: "Engineering" },
  { name: "Niels Eggens", unit: "Engineering" },
  { name: "Niels Florijn", unit: "Engineering" },
  { name: "Sander Beckker", unit: "Engineering" },
  { name: "Stijn Koldenhoven", unit: "Engineering" },
  { name: "Thijs Dirksen", unit: "Engineering" },
  { name: "Tom Tulen", unit: "Engineering" },
  { name: "Tomas Jansen", unit: "Engineering" },
  { name: "Xander Blok", unit: "Engineering" },
  // Monteurs
  { name: "Bart van Vliet", unit: "Monteurs" },
  { name: "Daan Jacobs", unit: "Monteurs" },
  { name: "Elmar Koopman", unit: "Monteurs" },
  { name: "Joey Pol", unit: "Monteurs" },
  { name: "Joey de Vries", unit: "Monteurs" },
  { name: "Joost Kloppers", unit: "Monteurs" },
  { name: "Kaylee van den Berg", unit: "Monteurs" },
  { name: "Marco Schaap", unit: "Monteurs" },
  { name: "Niek Roufs", unit: "Monteurs" },
  { name: "Nino Boot", unit: "Monteurs" },
  { name: "Robin Jansen", unit: "Monteurs" },
  { name: "Robin van Bruggen", unit: "Monteurs" },
  { name: "Sijmen Bossenbroek", unit: "Monteurs" },
  { name: "Toby Bruinier", unit: "Monteurs" },
  // Operators
  { name: "Bas de Ruiter", unit: "Operators" },
  { name: "Christiaan van Krieken", unit: "Operators" },
  { name: "Elianne van Lohuizen", unit: "Operators" },
  { name: "Ian Schaufeli", unit: "Operators" },
  { name: "Lars van Suntenmaartensdijk", unit: "Operators" },
  { name: "Mahesh Behari", unit: "Operators" },
  { name: "Robert van Zielhuis", unit: "Operators" },
  { name: "Ruben Zoet", unit: "Operators" },
  { name: "Thijs Udink", unit: "Operators" },
  { name: "Thom auf der Masch", unit: "Operators" },
  // Trainingsunit
  { name: "Dees Beeking", unit: "Trainingsunit" },
  { name: "Emily Huigens", unit: "Trainingsunit" },
  { name: "Marnix Miltenburg", unit: "Trainingsunit" },
  { name: "Noa Treep", unit: "Trainingsunit" },
  { name: "Paul Geers", unit: "Trainingsunit" },
  { name: "Robbert Dalhuisen", unit: "Trainingsunit" },
  { name: "Roel Linthorst", unit: "Trainingsunit" },
  { name: "Saleh Akhras", unit: "Trainingsunit" },
  { name: "Thijs Pisa", unit: "Trainingsunit" },
  { name: "Ties Ganzevles", unit: "Trainingsunit" },
  { name: "Tim Kuik", unit: "Trainingsunit" },
];

// Names of "hot" consultants (high growth / momentum)
const hotNames = new Set([
  "Joey de Vries", "Senna Ekkers", "Thijs Dirksen",
  "Christiaan van Krieken", "Dees Beeking",
]);

function generateRanking(topValues: number[]): RankingEntry[] {
  const allValues: number[] = [];
  for (let i = 0; i < consultants.length; i++) {
    allValues.push(i < topValues.length ? topValues[i] : 0);
  }
  return allValues.map((value, i) => ({
    rank: i + 1,
    name: consultants[i].name,
    unit: consultants[i].unit,
    value,
    isHot: hotNames.has(consultants[i].name),
  }));
}

// Week data (current week - default view)
export const ranglijstenWeekColumns: RankingColumn[] = [
  {
    title: "Inschrijvingen",
    total: 312,
    previousTotal: 289,
    entries: generateRanking([28, 24, 22, 19, 17, 16, 15, 14, 13, 13, 12, 11, 10, 10, 9, 9, 8, 7, 6, 5, 4, 4, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1]),
  },
  {
    title: "Acquisities",
    total: 98,
    previousTotal: 104,
    entries: generateRanking([9, 8, 7, 7, 6, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 1]),
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
    entries: generateRanking([5, 4, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1]),
  },
  {
    title: "Plaatsingen",
    total: 8,
    previousTotal: 6,
    entries: generateRanking([2, 1, 1, 1, 1, 1, 1]),
  },
  {
    title: "Niet begonnen",
    total: 1,
    previousTotal: 2,
    entries: generateRanking([1]),
  },
];

// Periode data (current period - used for auto-swap)
export const ranglijstenPeriodeColumns: RankingColumn[] = [
  {
    title: "Inschrijvingen",
    total: 1830,
    previousTotal: 1695,
    entries: generateRanking([125, 95, 93, 88, 73, 70, 69, 69, 65, 65, 63, 61, 60, 58, 55, 52, 48, 45, 42, 38, 35, 30, 28, 25, 22, 20, 18, 15, 12, 10, 8, 6, 5, 4, 3, 2, 1]),
  },
  {
    title: "Acquisities",
    total: 609,
    previousTotal: 572,
    entries: generateRanking([31, 25, 25, 24, 24, 24, 21, 21, 21, 21, 20, 20, 19, 18, 17, 16, 15, 14, 13, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]),
  },
  {
    title: "Gesprekken",
    total: 416,
    previousTotal: 438,
    entries: generateRanking([43, 40, 36, 28, 23, 21, 19, 18, 16, 16, 14, 14, 12, 11, 10, 9, 8, 8, 7, 6, 5, 4, 3, 2, 1]),
  },
  {
    title: "Intakes",
    total: 210,
    previousTotal: 195,
    entries: generateRanking([18, 16, 14, 13, 12, 12, 11, 11, 10, 10, 9, 8, 8, 7, 7, 6, 6, 5, 4, 3, 2, 1, 1]),
  },
  {
    title: "Plaatsingen",
    total: 43,
    previousTotal: 39,
    entries: generateRanking([6, 4, 4, 4, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1]),
  },
  {
    title: "Niet begonnen",
    total: 4,
    previousTotal: 6,
    entries: generateRanking([2, 1, 1]),
  },
];

// Keep original export for backwards compat
export const ranglijstenColumns = ranglijstenWeekColumns;

export const allColumnTitles = [
  "Inschrijvingen", "Acquisities", "Gesprekken", "Intakes", "Plaatsingen", "Niet begonnen",
];

export const ranglijstenFilters = {
  jaren: [2024, 2025, 2026],
  periodes: ["Week", "Periode", "Jaar"],
  periodenummers: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12", "P13"],
  weeknummers: Array.from({ length: 53 }, (_, i) => `W${i + 1}`),
  units: ["Alle units", "Early Performers", "Engineering", "Monteurs", "Operators", "Trainingsunit"],
};
