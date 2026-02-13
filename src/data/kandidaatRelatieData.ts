// Mock data for Relatie & Kandidaat Geluk dashboard

export interface CandidateJourney {
  id: string;
  name: string;
  avatar: string;
  role: string;
  stage: number; // 0-5 (inschrijving, acquisitie, gesprekken, dealsluiter, contract, droombaan)
  sentimentScore: number; // 1-10
  happinessLevel: "very_happy" | "happy" | "neutral" | "unhappy";
  deepInsightFound: boolean;
  priorities: {
    salaris: number;
    voorwaarden: number;
    reisafstand: number;
    collegas: number;
    werkinhoud: number;
    ontwikkeling: number;
    carrierestap: number;
  };
  lastContact: string;
  consultant: string;
  quote?: string;
}

export const stageLabels = [
  "Inschrijving",
  "Acquisitie",
  "Intake",
  "Dealsluiter",
  "Contract",
  "🎯 Droombaan",
];

export const stageEmoji = ["📝", "🔍", "💬", "🤝", "📋", "🌟"];

const avatars = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
];

const names = [
  "Kevin van der Berg",
  "Priya Sharma",
  "Jordi Willemsen",
  "Nadia el Amrani",
  "Ruben Hendriks",
  "Fatima Yilmaz",
  "Thijs Vermeer",
  "Sanne Kuijpers",
  "Dex van Leeuwen",
  "Maria Gonzalez",
  "Bram Dijkstra",
  "Yara de Jong",
];

const roles = [
  "Elektromonteur",
  "Werkvoorbereider",
  "Projectleider HVAC",
  "Servicemonteur",
  "Calculator Infra",
  "Technisch Tekenaar",
  "Constructeur",
  "Installatiemonteur",
  "BIM Modelleur",
  "Loodgieter",
  "Timmerman",
  "Dakdekker",
];

const quotes = [
  "Ik voel me echt gehoord, dit is precies wat ik zoek!",
  "Voor het eerst heb ik het gevoel dat iemand snapt wat ik wil.",
  "De reistijd was mijn echte zorg, fijn dat jullie dat meenemen.",
  "Ik wist niet dat dit soort functies bestonden — super!",
  "Eindelijk een recruiter die verder kijkt dan mijn CV.",
  "Het salaris is goed, maar de sfeer klinkt nog beter.",
  "Ik twijfelde, maar na ons gesprek weet ik het zeker.",
  "Jullie begrijpen dat ontwikkeling voor mij het belangrijkst is.",
];

export const candidateJourneys: CandidateJourney[] = names.map((name, i) => {
  const stage = [5, 4, 3, 3, 2, 2, 1, 1, 0, 4, 3, 5][i] ?? Math.floor(Math.random() * 6);
  const sentiment = [9.2, 8.5, 7.8, 6.2, 8.1, 7.0, 9.0, 5.8, 7.5, 8.8, 6.5, 9.5][i] ?? 7;
  const happiness: CandidateJourney["happinessLevel"] =
    sentiment >= 8.5 ? "very_happy" : sentiment >= 7 ? "happy" : sentiment >= 6 ? "neutral" : "unhappy";

  return {
    id: `cand-${i}`,
    name,
    avatar: avatars[i % avatars.length],
    role: roles[i],
    stage,
    sentimentScore: sentiment,
    happinessLevel: happiness,
    deepInsightFound: [true, true, true, false, true, false, true, false, true, true, false, true][i] ?? false,
    priorities: {
      salaris: [8, 6, 7, 9, 5, 8, 4, 7, 6, 7, 8, 5][i] ?? 6,
      voorwaarden: [6, 7, 5, 7, 8, 6, 7, 5, 8, 6, 5, 7][i] ?? 6,
      reisafstand: [9, 4, 8, 5, 7, 3, 6, 9, 4, 5, 7, 3][i] ?? 5,
      collegas: [5, 8, 6, 4, 6, 9, 8, 6, 7, 8, 4, 9][i] ?? 6,
      werkinhoud: [7, 9, 8, 6, 7, 7, 9, 4, 8, 9, 6, 8][i] ?? 7,
      ontwikkeling: [6, 8, 9, 3, 9, 5, 8, 3, 9, 7, 5, 7][i] ?? 6,
      carrierestap: [4, 7, 7, 8, 8, 4, 7, 5, 7, 6, 9, 6][i] ?? 6,
    },
    lastContact: ["Vandaag", "Gisteren", "2 dagen", "Vandaag", "3 dagen", "Gisteren", "Vandaag", "4 dagen", "Gisteren", "Vandaag", "2 dagen", "Vandaag"][i] ?? "Vandaag",
    consultant: ["Sophie de Vries", "Sophie de Vries", "Bram Jansen", "Bram Jansen", "Lisa van Dijk", "Lisa van Dijk", "Thomas Bakker", "Thomas Bakker", "Emma Visser", "Emma Visser", "Daan de Boer", "Daan de Boer"][i] ?? "Sophie de Vries",
    quote: i < quotes.length ? quotes[i] : undefined,
  };
});

export const overallSentimentTrend = [
  { period: "W1", score: 6.8 },
  { period: "W2", score: 7.1 },
  { period: "W3", score: 7.4 },
  { period: "W4", score: 7.2 },
  { period: "W5", score: 7.8 },
  { period: "W6", score: 8.0 },
  { period: "W7", score: 7.9 },
  { period: "W8", score: 8.2 },
];

export const priorityLabels: Record<string, string> = {
  salaris: "💰 Beter Salaris",
  voorwaarden: "📋 Betere Voorwaarden",
  reisafstand: "🚗 Kortere Reisafstand",
  collegas: "👥 Leukere Collega's",
  werkinhoud: "⚙️ Leuker Werk",
  ontwikkeling: "📈 Ontwikkelperspectief",
  carrierestap: "🚀 Carrièrestap",
};
