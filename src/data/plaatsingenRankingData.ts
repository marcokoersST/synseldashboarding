import { allConsultantsList } from "@/data/ranglijstenData";

export type PlaatsingCategorie = "Detavast" | "W&S" | "Marge Fac";

export interface PlaatsingRankingRecord {
  id: string;
  consultant: string;
  unit: string;
  kandidaat: string;
  klant: string;
  categorie: PlaatsingCategorie;
  plaatsingsdatum: string;
  startdatum: string;
  einddatum: string | null;
  week: number;
  periode: number;
  jaar: number;
  looptijdUren: number;
  /** Detachering: verhoudingsfactor tussen inkoop- en verkooptarief. */
  factor: number | null;
  /** Detachering: verkooptarief per uur. */
  uurtarief: number | null;
  /** W&S: jaarsalaris waarop de fee is gerekend. */
  jaarsalaris: number | null;
  /** W&S: percentage van het jaarsalaris. */
  wsPercentage: number | null;
  dealwaarde: number;
}

const kandidaten = [
  "Sophie van Dijk", "Milan Jansen", "Noah de Boer", "Emma Mulder", "Lucas Smit",
  "Julia Visser", "Finn Meijer", "Lotte Bakker", "Daan de Wit", "Tess Vos",
  "Sem Hendriks", "Sara Dekker", "Levi Peters", "Nina Jacobs", "Bram Kok",
];

const klanten = [
  "Vekoma", "ASML", "Royal Kaak", "Nedap", "Bronkhorst", "Marel", "VDL", "Aviko",
  "FrieslandCampina", "Grolsch", "Remeha", "Auping",
];

const categories: PlaatsingCategorie[] = ["Detavast", "W&S", "Marge Fac"];

const round = (value: number, step = 50) => Math.round(value / step) * step;
const addDays = (iso: string, days: number) => {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
};

/** Detachering: kostprijs × factor = uurtarief; marge per uur × uren = dealwaarde. */
const buildDetachering = (kostprijs: number, factor: number, uren: number, weging = 1) => {
  const uurtarief = Math.round(kostprijs * factor * 100) / 100;
  const dealwaarde = round((uurtarief - kostprijs) * uren * weging);
  return { uurtarief, factor, dealwaarde };
};


/** W&S: percentage van het jaarsalaris. */
const buildWS = (jaarsalaris: number, percentage: number) => ({
  jaarsalaris,
  wsPercentage: percentage,
  dealwaarde: round(jaarsalaris * (percentage / 100)),
});

const records: PlaatsingRankingRecord[] = [];

allConsultantsList.filter((consultant) => consultant.isActive).forEach((consultant, consultantIndex) => {
  const placementCount = 4 + (consultantIndex % 5);

  for (let index = 0; index < placementCount; index += 1) {
    const week = 1 + ((consultantIndex * 7 + index * 11) % 52);
    const month = Math.min(11, Math.floor((week - 1) / 4.34));
    const day = 1 + ((consultantIndex * 3 + index * 5) % 25);
    const categorie = categories[(consultantIndex + index) % categories.length];
    const plaatsingsdatum = new Date(Date.UTC(2026, month, day)).toISOString();
    const startdatum = addDays(plaatsingsdatum, 14 + ((consultantIndex + index) % 3) * 7);

    const looptijdUren = categorie === "W&S" ? 0 : 960 + ((consultantIndex + index) % 6) * 240;
    const kostprijs = 26 + ((consultantIndex * 3 + index * 2) % 12);
    const factor = 1.9 + (((consultantIndex * 5 + index * 3) % 13) * 0.1);
    const jaarsalaris = 52000 + ((consultantIndex * 2 + index) % 9) * 4000;
    const percentage = 15 + ((consultantIndex + index * 2) % 8);

    const conditions = categorie === "W&S"
      ? { ...buildWS(jaarsalaris, percentage), factor: null, uurtarief: null }
      : { ...buildDetachering(kostprijs, Math.round(factor * 100) / 100, looptijdUren, categorie === "Marge Fac" ? 0.3 : 0.75), jaarsalaris: null, wsPercentage: null };

    records.push({
      id: `plaatsing-${consultantIndex}-${index}`,
      consultant: consultant.fullName,
      unit: consultant.unit,
      kandidaat: kandidaten[(consultantIndex + index * 3) % kandidaten.length],
      klant: klanten[(consultantIndex * 2 + index) % klanten.length],
      categorie,
      plaatsingsdatum,
      startdatum,
      einddatum: looptijdUren ? addDays(startdatum, Math.round((looptijdUren / 40) * 7)) : null,
      week,
      periode: Math.min(13, Math.ceil(week / 4)),
      jaar: 2026,
      looptijdUren,
      factor: conditions.factor,
      uurtarief: conditions.uurtarief,
      jaarsalaris: conditions.jaarsalaris,
      wsPercentage: conditions.wsPercentage,
      dealwaarde: conditions.dealwaarde,
    });
  }
});

// Extra dichtheid rond de standaardweergave (week 42 / periode 11) zodat de
// ranglijst bij het openen minimaal 25 consultants toont.
const defaultViewConsultants = allConsultantsList.filter((c) => c.isActive).slice(0, 30);
defaultViewConsultants.forEach((consultant, i) => {
  const categorie = categories[i % categories.length];
  const looptijdUren = categorie === "W&S" ? 0 : 960 + (i % 6) * 240;
  const kostprijs = 26 + (i % 12);
  const factor = 1.9 + ((i % 13) * 0.1);
  const jaarsalaris = 52000 + (i % 9) * 4000;
  const percentage = 15 + (i % 8);

  const conditions = categorie === "W&S"
    ? { ...buildWS(jaarsalaris, percentage), factor: null, uurtarief: null }
    : { ...buildDetachering(kostprijs, Math.round(factor * 100) / 100, looptijdUren, categorie === "Marge Fac" ? 0.3 : 0.75), jaarsalaris: null, wsPercentage: null };

  const plaatsingsdatum = new Date(Date.UTC(2026, 9, 13 + (i % 7))).toISOString();
  const startdatum = addDays(plaatsingsdatum, 14 + (i % 3) * 7);

  records.push({
    id: `extra-week42-${i}`,
    consultant: consultant.fullName,
    unit: consultant.unit,
    kandidaat: kandidaten[(i * 3) % kandidaten.length],
    klant: klanten[(i * 2) % klanten.length],
    categorie,
    plaatsingsdatum,
    startdatum,
    einddatum: looptijdUren ? addDays(startdatum, Math.round((looptijdUren / 40) * 7)) : null,
    week: 42,
    periode: 11,
    jaar: 2026,
    looptijdUren,
    factor: conditions.factor,
    uurtarief: conditions.uurtarief,
    jaarsalaris: conditions.jaarsalaris,
    wsPercentage: conditions.wsPercentage,
    dealwaarde: conditions.dealwaarde,
  });
});

// Referentievoorbeelden uit de briefing (week 42).
records.push(
  {
    id: "briefing-robin-1", consultant: "Robin van Bruggen", unit: "Monteurs",
    kandidaat: "Jasper de Vries", klant: "Nedap", categorie: "Detavast",
    plaatsingsdatum: "2026-10-13T00:00:00.000Z", startdatum: "2026-11-02T00:00:00.000Z",
    einddatum: "2027-11-01T00:00:00.000Z",
    week: 42, periode: 11, jaar: 2026,
    looptijdUren: 2080, factor: 3.05, uurtarief: 30.42, jaarsalaris: null, wsPercentage: null,
    dealwaarde: 42500,
  },
  {
    id: "briefing-robin-2", consultant: "Robin van Bruggen", unit: "Monteurs",
    kandidaat: "Laura Willems", klant: "Royal Kaak", categorie: "Detavast",
    plaatsingsdatum: "2026-10-15T00:00:00.000Z", startdatum: "2026-11-09T00:00:00.000Z",
    einddatum: "2027-08-23T00:00:00.000Z",
    week: 42, periode: 11, jaar: 2026,
    looptijdUren: 1800, factor: 2.7, uurtarief: 28.05, jaarsalaris: null, wsPercentage: null,
    dealwaarde: 20000,
  },
  {
    id: "briefing-sijmen", consultant: "Sijmen Bossenbroek", unit: "Monteurs",
    kandidaat: "Thijs van Loon", klant: "Vekoma", categorie: "Detavast",
    plaatsingsdatum: "2026-10-14T00:00:00.000Z", startdatum: "2026-11-02T00:00:00.000Z",
    einddatum: "2027-10-11T00:00:00.000Z",
    week: 42, periode: 11, jaar: 2026,
    looptijdUren: 2000, factor: 2.95, uurtarief: 31.50, jaarsalaris: null, wsPercentage: null,
    dealwaarde: 40000,
  },
  {
    id: "briefing-nino", consultant: "Nino Boot", unit: "Monteurs",
    kandidaat: "Eva Vermeer", klant: "Vekoma", categorie: "W&S",
    plaatsingsdatum: "2026-10-16T00:00:00.000Z", startdatum: "2026-11-16T00:00:00.000Z",
    einddatum: null,
    week: 42, periode: 11, jaar: 2026,
    looptijdUren: 0, factor: null, uurtarief: null, jaarsalaris: 66667, wsPercentage: 18,
    dealwaarde: 12000,
  },
);

export const plaatsingenRankingData = records;
