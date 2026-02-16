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
  // Accountmanagement
  { name: "Elmar Koopman", unit: "Accountmanagement" },
  { name: "Bas de Ruiter", unit: "Accountmanagement" },
  { name: "Jort Koggel", unit: "Accountmanagement" },
  { name: "Thom Auf der Heide", unit: "Accountmanagement" },
  { name: "Robert Zielhuis", unit: "Accountmanagement" },
  { name: "Lars van Summeren", unit: "Accountmanagement" },
  // Customer Success
  { name: "Bart van Vliet", unit: "Customer Success" },
  { name: "Robin van Brussel", unit: "Customer Success" },
  { name: "Elianne van Dalen", unit: "Customer Success" },
  { name: "Thijs Udink", unit: "Customer Success" },
  { name: "Joey Pol", unit: "Customer Success" },
  // Early Performers
  { name: "Eric Hutchison", unit: "Early Performers" },
  { name: "Falco Zegveld", unit: "Early Performers" },
  { name: "Amer Faraman", unit: "Early Performers" },
  { name: "Dyon Mäkel", unit: "Early Performers" },
  { name: "Toby Bruinier", unit: "Early Performers" },
  { name: "Kaylee van Houten", unit: "Early Performers" },
  // Engineering
  { name: "Joey de Vries", unit: "Engineering" },
  { name: "Mahesh Behari", unit: "Engineering" },
  { name: "Sijmen Bos", unit: "Engineering" },
  { name: "Niels Florijn", unit: "Engineering" },
  { name: "Senna Ekkers", unit: "Engineering" },
  { name: "Mathijs Oskar", unit: "Engineering" },
  { name: "Robin Jansen", unit: "Engineering" },
  { name: "Thijs Dirksen", unit: "Engineering" },
  { name: "Milan van de Ven", unit: "Engineering" },
  { name: "Luuk Bergman", unit: "Engineering" },
  // Instroom
  { name: "Jesse van Dijk", unit: "Instroom" },
  { name: "Britt Hendriks", unit: "Instroom" },
  { name: "Noah de Groot", unit: "Instroom" },
  { name: "Fleur Bakker", unit: "Instroom" },
  { name: "Max Willems", unit: "Instroom" },
  { name: "Lieke Peters", unit: "Instroom" },
  { name: "Daan Mulder", unit: "Instroom" },
  // Monteurs
  { name: "Tim Visser", unit: "Monteurs" },
  { name: "Stijn Smit", unit: "Monteurs" },
  { name: "Rick de Jong", unit: "Monteurs" },
  { name: "Kevin Meijer", unit: "Monteurs" },
  { name: "Dennis Bos", unit: "Monteurs" },
  { name: "Patrick Dekker", unit: "Monteurs" },
  { name: "Martijn van Leeuwen", unit: "Monteurs" },
  // Operators
  { name: "Niek Janssen", unit: "Operators" },
  { name: "Thomas Kramer", unit: "Operators" },
  { name: "Ruben Schouten", unit: "Operators" },
  { name: "Wouter van den Berg", unit: "Operators" },
  { name: "Stefan Brouwer", unit: "Operators" },
  { name: "Mark de Wit", unit: "Operators" },
  { name: "Peter Vos", unit: "Operators" },
  { name: "Koen van der Linden", unit: "Operators" },
  // Suriname
  { name: "Rayen Kanhai", unit: "Suriname" },
  { name: "Ashwin Ramdin", unit: "Suriname" },
  { name: "Priya Mohan", unit: "Suriname" },
  { name: "Raj Chotkan", unit: "Suriname" },
  // Synsel Techniek
  { name: "Vincent Maas", unit: "Synsel Techniek" },
  { name: "Jeroen van der Heijden", unit: "Synsel Techniek" },
  { name: "Bas Vermeer", unit: "Synsel Techniek" },
  { name: "Tom de Graaf", unit: "Synsel Techniek" },
  { name: "Nick Kok", unit: "Synsel Techniek" },
  { name: "Erik van Dam", unit: "Synsel Techniek" },
  // Trainingsunit
  { name: "Anne Prins", unit: "Trainingsunit" },
  { name: "Sophie Kuijpers", unit: "Trainingsunit" },
  { name: "Eva van Beek", unit: "Trainingsunit" },
  { name: "Lisa Jacobs", unit: "Trainingsunit" },
  { name: "Julia Wolters", unit: "Trainingsunit" },
  { name: "Rosa van Hoek", unit: "Trainingsunit" },
];

// Names of "hot" consultants (high growth / momentum)
const hotNames = new Set([
  "Elmar Koopman", "Jort Koggel", "Joey de Vries", "Tim Visser",
  "Senna Ekkers", "Britt Hendriks", "Vincent Maas", "Thomas Kramer",
]);

function generateRanking(topValues: number[]): RankingEntry[] {
  // Distribute values across all 65 consultants, filling extras with 0
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
  units: ["Alle units", "Accountmanagement", "Customer Success", "Early Performers", "Engineering", "Instroom", "Monteurs", "Operators", "Suriname", "Synsel Techniek", "Trainingsunit"],
};
