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
  week: number;
  periode: number;
  jaar: number;
  looptijdUren: number;
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
const baseValues = [42500, 20000, 12000, 36500, 28000, 18750, 52000, 24000, 15500, 33000];

const records: PlaatsingRankingRecord[] = [];

allConsultantsList.filter((consultant) => consultant.isActive).forEach((consultant, consultantIndex) => {
  const placementCount = 2 + (consultantIndex % 4);

  for (let index = 0; index < placementCount; index += 1) {
    const week = 1 + ((consultantIndex * 7 + index * 11) % 52);
    const month = Math.min(11, Math.floor((week - 1) / 4.34));
    const day = 1 + ((consultantIndex * 3 + index * 5) % 25);
    const category = categories[(consultantIndex + index) % categories.length];
    const rawValue = baseValues[(consultantIndex * 2 + index) % baseValues.length];

    records.push({
      id: `plaatsing-${consultantIndex}-${index}`,
      consultant: consultant.fullName,
      unit: consultant.unit,
      kandidaat: kandidaten[(consultantIndex + index * 3) % kandidaten.length],
      klant: klanten[(consultantIndex * 2 + index) % klanten.length],
      categorie: category,
      plaatsingsdatum: new Date(2026, month, day).toISOString(),
      week,
      periode: Math.min(13, Math.ceil(week / 4)),
      jaar: 2026,
      looptijdUren: category === "W&S" ? 0 : 960 + ((consultantIndex + index) % 6) * 240,
      dealwaarde: rawValue + (consultantIndex % 5) * 1250,
    });
  }
});

// Reference examples from the supplied briefing, kept together in week 42.
records.push(
  {
    id: "briefing-robin-1", consultant: "Robin van Bruggen", unit: "Monteurs",
    kandidaat: "Jasper de Vries", klant: "Nedap", categorie: "Detavast",
    plaatsingsdatum: "2026-10-13T00:00:00.000Z", week: 42, periode: 11, jaar: 2026,
    looptijdUren: 2080, dealwaarde: 42500,
  },
  {
    id: "briefing-robin-2", consultant: "Robin van Bruggen", unit: "Monteurs",
    kandidaat: "Laura Willems", klant: "Royal Kaak", categorie: "Detavast",
    plaatsingsdatum: "2026-10-15T00:00:00.000Z", week: 42, periode: 11, jaar: 2026,
    looptijdUren: 1800, dealwaarde: 20000,
  },
  {
    id: "briefing-sijmen", consultant: "Sijmen Bossenbroek", unit: "Monteurs",
    kandidaat: "Thijs van Loon", klant: "Vekoma", categorie: "W&S",
    plaatsingsdatum: "2026-10-14T00:00:00.000Z", week: 42, periode: 11, jaar: 2026,
    looptijdUren: 0, dealwaarde: 40000,
  },
  {
    id: "briefing-nino", consultant: "Nino Boot", unit: "Monteurs",
    kandidaat: "Eva Vermeer", klant: "Vekoma", categorie: "W&S",
    plaatsingsdatum: "2026-10-16T00:00:00.000Z", week: 42, periode: 11, jaar: 2026,
    looptijdUren: 0, dealwaarde: 12000,
  },
);

export const plaatsingenRankingData = records;
