export interface InflowSourceEntry {
  bron: string;
  inschrijvingen: number;
  acquisitie: number;
  prevInschrijvingen: number;
  prevAcquisitie: number;
}

export interface InflowConsultantEntry {
  consultant: string;
  unit: string;
  inschrijvingen: number;
  acquisitie: number;
  prevInschrijvingen: number;
  prevAcquisitie: number;
}

export interface InflowUnitEntry {
  unit: string;
  inschrijvingen: number;
  acquisitie: number;
  prevInschrijvingen: number;
  prevAcquisitie: number;
}

export const inflowSourceData: InflowSourceEntry[] = [
  { bron: "Indeed", inschrijvingen: 42, acquisitie: 18, prevInschrijvingen: 38, prevAcquisitie: 15 },
  { bron: "Wati", inschrijvingen: 27, acquisitie: 12, prevInschrijvingen: 30, prevAcquisitie: 14 },
  { bron: "Google Ads", inschrijvingen: 35, acquisitie: 14, prevInschrijvingen: 28, prevAcquisitie: 11 },
  { bron: "Werkzoeken / CV Database", inschrijvingen: 19, acquisitie: 9, prevInschrijvingen: 22, prevAcquisitie: 10 },
  { bron: "E-mail", inschrijvingen: 15, acquisitie: 7, prevInschrijvingen: 12, prevAcquisitie: 5 },
  { bron: "Jobster / Joof", inschrijvingen: 11, acquisitie: 4, prevInschrijvingen: 14, prevAcquisitie: 6 },
  { bron: "Technicus.nl", inschrijvingen: 8, acquisitie: 3, prevInschrijvingen: 10, prevAcquisitie: 4 },
  { bron: "Organisch", inschrijvingen: 22, acquisitie: 10, prevInschrijvingen: 18, prevAcquisitie: 8 },
  { bron: "LinkedIn", inschrijvingen: 16, acquisitie: 6, prevInschrijvingen: 13, prevAcquisitie: 5 },
  { bron: "Overig", inschrijvingen: 9, acquisitie: 3, prevInschrijvingen: 7, prevAcquisitie: 2 },
];

export const inflowConsultantData: InflowConsultantEntry[] = [
  { consultant: "Jan de Vries", unit: "Engineering", inschrijvingen: 18, acquisitie: 8, prevInschrijvingen: 15, prevAcquisitie: 6 },
  { consultant: "Lisa Bakker", unit: "Engineering", inschrijvingen: 14, acquisitie: 6, prevInschrijvingen: 12, prevAcquisitie: 5 },
  { consultant: "Tom Jansen", unit: "Monteurs", inschrijvingen: 22, acquisitie: 10, prevInschrijvingen: 19, prevAcquisitie: 8 },
  { consultant: "Emma Smit", unit: "Monteurs", inschrijvingen: 16, acquisitie: 7, prevInschrijvingen: 18, prevAcquisitie: 9 },
  { consultant: "Daan Visser", unit: "Monteurs", inschrijvingen: 12, acquisitie: 5, prevInschrijvingen: 10, prevAcquisitie: 4 },
  { consultant: "Sophie Mulder", unit: "Operators", inschrijvingen: 20, acquisitie: 9, prevInschrijvingen: 17, prevAcquisitie: 7 },
  { consultant: "Ruben de Groot", unit: "Operators", inschrijvingen: 15, acquisitie: 6, prevInschrijvingen: 14, prevAcquisitie: 6 },
  { consultant: "Anne Bos", unit: "Operators", inschrijvingen: 11, acquisitie: 4, prevInschrijvingen: 13, prevAcquisitie: 5 },
  { consultant: "Mark Peters", unit: "Trainingsunit", inschrijvingen: 25, acquisitie: 11, prevInschrijvingen: 20, prevAcquisitie: 9 },
  { consultant: "Laura Hendriks", unit: "Trainingsunit", inschrijvingen: 19, acquisitie: 8, prevInschrijvingen: 16, prevAcquisitie: 7 },
  { consultant: "Kevin Dekker", unit: "Trainingsunit", inschrijvingen: 13, acquisitie: 5, prevInschrijvingen: 11, prevAcquisitie: 4 },
  { consultant: "Nina van Dijk", unit: "Early Performers", inschrijvingen: 10, acquisitie: 3, prevInschrijvingen: 8, prevAcquisitie: 2 },
  { consultant: "Thijs Vermeer", unit: "Early Performers", inschrijvingen: 9, acquisitie: 4, prevInschrijvingen: 11, prevAcquisitie: 5 },
];

export const inflowHeractiveringen = {
  current: 34,
  previous: 28,
};

export function aggregateByUnit(data: InflowConsultantEntry[]): InflowUnitEntry[] {
  const map = new Map<string, InflowUnitEntry>();
  for (const c of data) {
    const existing = map.get(c.unit);
    if (existing) {
      existing.inschrijvingen += c.inschrijvingen;
      existing.acquisitie += c.acquisitie;
      existing.prevInschrijvingen += c.prevInschrijvingen;
      existing.prevAcquisitie += c.prevAcquisitie;
    } else {
      map.set(c.unit, {
        unit: c.unit,
        inschrijvingen: c.inschrijvingen,
        acquisitie: c.acquisitie,
        prevInschrijvingen: c.prevInschrijvingen,
        prevAcquisitie: c.prevAcquisitie,
      });
    }
  }
  return Array.from(map.values());
}
