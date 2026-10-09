export interface InflowSourceEntry {
  bron: string;
  conversies: number;
  prevConversies: number;
  inschrijvingen: number;
  bemiddelbareKandidaten: number;
  acquisitie: number;
  prevInschrijvingen: number;
  prevBemiddelbareKandidaten: number;
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

export interface InflowCampaignEntry {
  campagne: string;
  bron: string;
  kandidaten: number;
  inschrijvingen: number;
  prevKandidaten: number;
  prevInschrijvingen: number;
}

const inflowSourceBase: Omit<InflowSourceEntry, "conversies" | "prevConversies">[] = [
  { bron: "Indeed", inschrijvingen: 42, bemiddelbareKandidaten: 55, acquisitie: 18, prevInschrijvingen: 38, prevBemiddelbareKandidaten: 48, prevAcquisitie: 15 },
  { bron: "Wati", inschrijvingen: 27, bemiddelbareKandidaten: 35, acquisitie: 12, prevInschrijvingen: 30, prevBemiddelbareKandidaten: 37, prevAcquisitie: 14 },
  { bron: "Google Ads", inschrijvingen: 35, bemiddelbareKandidaten: 45, acquisitie: 14, prevInschrijvingen: 28, prevBemiddelbareKandidaten: 36, prevAcquisitie: 11 },
  { bron: "Werkzoeken / CV Database", inschrijvingen: 19, bemiddelbareKandidaten: 26, acquisitie: 9, prevInschrijvingen: 22, prevBemiddelbareKandidaten: 29, prevAcquisitie: 10 },
  { bron: "E-mail", inschrijvingen: 15, bemiddelbareKandidaten: 20, acquisitie: 7, prevInschrijvingen: 12, prevBemiddelbareKandidaten: 16, prevAcquisitie: 5 },
  { bron: "Jobster / Joof", inschrijvingen: 11, bemiddelbareKandidaten: 15, acquisitie: 4, prevInschrijvingen: 14, prevBemiddelbareKandidaten: 17, prevAcquisitie: 6 },
  { bron: "Technicus.nl", inschrijvingen: 8, bemiddelbareKandidaten: 10, acquisitie: 3, prevInschrijvingen: 10, prevBemiddelbareKandidaten: 12, prevAcquisitie: 4 },
  { bron: "Organisch", inschrijvingen: 22, bemiddelbareKandidaten: 29, acquisitie: 10, prevInschrijvingen: 18, prevBemiddelbareKandidaten: 24, prevAcquisitie: 8 },
  { bron: "LinkedIn", inschrijvingen: 16, bemiddelbareKandidaten: 21, acquisitie: 6, prevInschrijvingen: 13, prevBemiddelbareKandidaten: 18, prevAcquisitie: 5 },
  { bron: "Overig", inschrijvingen: 9, bemiddelbareKandidaten: 11, acquisitie: 3, prevInschrijvingen: 7, prevBemiddelbareKandidaten: 9, prevAcquisitie: 2 },
];
/** Demo conversions per source: ~1.35 conversions per placeable candidate (no separate source in local data). */
export const inflowSourceData: InflowSourceEntry[] = inflowSourceBase.map((row) => ({
  ...row,
  conversies: Math.round(row.bemiddelbareKandidaten * 1.35),
  prevConversies: Math.round(row.prevBemiddelbareKandidaten * 1.35),
}));

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

export const inflowCampaignData: InflowCampaignEntry[] = [
  { campagne: "monteurs_machine_service", bron: "Werkzoeken", kandidaten: 48, inschrijvingen: 14, prevKandidaten: 41, prevInschrijvingen: 11 },
  { campagne: "active+monteurs+assemblage", bron: "Jobster", kandidaten: 36, inschrijvingen: 11, prevKandidaten: 39, prevInschrijvingen: 13 },
  { campagne: "engineers_mechanical", bron: "Werkzoeken", kandidaten: 29, inschrijvingen: 9, prevKandidaten: 24, prevInschrijvingen: 7 },
  { campagne: "active", bron: "Vapro Banen", kandidaten: 24, inschrijvingen: 6, prevKandidaten: 20, prevInschrijvingen: 5 },
  { campagne: "engineers_tekenaars", bron: "Werkzoeken", kandidaten: 19, inschrijvingen: 4, prevKandidaten: 22, prevInschrijvingen: 6 },
  { campagne: "algemeen - conversion", bron: "Tiktok", kandidaten: 15, inschrijvingen: 3, prevKandidaten: 12, prevInschrijvingen: 4 },
  { campagne: "operators_productie", bron: "Indeed", kandidaten: 12, inschrijvingen: 2, prevKandidaten: 10, prevInschrijvingen: 1 },
  { campagne: "technische_dienst", bron: "Google Ads", kandidaten: 9, inschrijvingen: 2, prevKandidaten: 11, prevInschrijvingen: 3 },
  { campagne: "monteurs_elektrotechniek", bron: "Jobster", kandidaten: 7, inschrijvingen: 1, prevKandidaten: 6, prevInschrijvingen: 1 },
  { campagne: "procesoperators", bron: "Vapro Banen", kandidaten: 6, inschrijvingen: 1, prevKandidaten: 8, prevInschrijvingen: 2 },
  { campagne: "werkvoorbereiders", bron: "Werkzoeken", kandidaten: 5, inschrijvingen: 1, prevKandidaten: 4, prevInschrijvingen: 0 },
  { campagne: "service_monteurs", bron: "Jouwtechniekbaan", kandidaten: 4, inschrijvingen: 0, prevKandidaten: 5, prevInschrijvingen: 1 },
  { campagne: "active", bron: "Jobster", kandidaten: 3, inschrijvingen: 0, prevKandidaten: 2, prevInschrijvingen: 0 },
  { campagne: "active+monteurs+assemblage", bron: "Jouwtechniekbaan", kandidaten: 3, inschrijvingen: 0, prevKandidaten: 4, prevInschrijvingen: 1 },
  { campagne: "operators_food", bron: "Indeed", kandidaten: 2, inschrijvingen: 0, prevKandidaten: 2, prevInschrijvingen: 0 },
];

export const inflowCampaignCandidateTotal = 729;

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
