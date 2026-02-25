// Ranglijsten TV Dashboard Mock Data

export interface RankingEntry {
  rank: number;
  name: string;
  firstName: string;
  lastName: string;
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
    name: consultants[i].fullName,
    firstName: consultants[i].firstName,
    lastName: consultants[i].lastName,
    unit: consultants[i].unit,
    value,
    isHot: hotNames.has(consultants[i].fullName),
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
