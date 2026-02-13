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

// ── Opvolging & Betrokkenheid Kwaliteit ──

export interface FollowUpMetric {
  label: string;
  emoji: string;
  score: number; // 0-100
  description: string;
}

export interface ConsultantFollowUp {
  consultant: string;
  overallScore: number;
  metrics: FollowUpMetric[];
}

export const followUpMetrics: ConsultantFollowUp[] = [
  {
    consultant: "Sophie de Vries",
    overallScore: 92,
    metrics: [
      { label: "Bellen vóór gesprek", emoji: "📞", score: 95, description: "Kandidaat gebeld ter voorbereiding op sollicitatiegesprek" },
      { label: "Briefing kwaliteit", emoji: "📋", score: 90, description: "Kandidaat goed gebrieft over bedrijf, functie en gesprekspartners" },
      { label: "Nabellen na gesprek", emoji: "⏱️", score: 88, description: "Binnen 2 uur nagebeld na afloop van het gesprek" },
      { label: "Afspraken nakomen", emoji: "🤝", score: 96, description: "Terugbelafspraken en deadlines consequent nagekomen" },
      { label: "Proactief contact", emoji: "💬", score: 90, description: "Proactief tussentijds contact opgenomen met kandidaat" },
    ],
  },
  {
    consultant: "Bram Jansen",
    overallScore: 78,
    metrics: [
      { label: "Bellen vóór gesprek", emoji: "📞", score: 82, description: "Kandidaat gebeld ter voorbereiding op sollicitatiegesprek" },
      { label: "Briefing kwaliteit", emoji: "📋", score: 74, description: "Kandidaat goed gebrieft over bedrijf, functie en gesprekspartners" },
      { label: "Nabellen na gesprek", emoji: "⏱️", score: 70, description: "Binnen 2 uur nagebeld na afloop van het gesprek" },
      { label: "Afspraken nakomen", emoji: "🤝", score: 85, description: "Terugbelafspraken en deadlines consequent nagekomen" },
      { label: "Proactief contact", emoji: "💬", score: 78, description: "Proactief tussentijds contact opgenomen met kandidaat" },
    ],
  },
  {
    consultant: "Lisa van Dijk",
    overallScore: 85,
    metrics: [
      { label: "Bellen vóór gesprek", emoji: "📞", score: 88, description: "Kandidaat gebeld ter voorbereiding op sollicitatiegesprek" },
      { label: "Briefing kwaliteit", emoji: "📋", score: 82, description: "Kandidaat goed gebrieft over bedrijf, functie en gesprekspartners" },
      { label: "Nabellen na gesprek", emoji: "⏱️", score: 80, description: "Binnen 2 uur nagebeld na afloop van het gesprek" },
      { label: "Afspraken nakomen", emoji: "🤝", score: 92, description: "Terugbelafspraken en deadlines consequent nagekomen" },
      { label: "Proactief contact", emoji: "💬", score: 84, description: "Proactief tussentijds contact opgenomen met kandidaat" },
    ],
  },
  {
    consultant: "Thomas Bakker",
    overallScore: 65,
    metrics: [
      { label: "Bellen vóór gesprek", emoji: "📞", score: 60, description: "Kandidaat gebeld ter voorbereiding op sollicitatiegesprek" },
      { label: "Briefing kwaliteit", emoji: "📋", score: 55, description: "Kandidaat goed gebrieft over bedrijf, functie en gesprekspartners" },
      { label: "Nabellen na gesprek", emoji: "⏱️", score: 68, description: "Binnen 2 uur nagebeld na afloop van het gesprek" },
      { label: "Afspraken nakomen", emoji: "🤝", score: 72, description: "Terugbelafspraken en deadlines consequent nagekomen" },
      { label: "Proactief contact", emoji: "💬", score: 70, description: "Proactief tussentijds contact opgenomen met kandidaat" },
    ],
  },
  {
    consultant: "Emma Visser",
    overallScore: 88,
    metrics: [
      { label: "Bellen vóór gesprek", emoji: "📞", score: 90, description: "Kandidaat gebeld ter voorbereiding op sollicitatiegesprek" },
      { label: "Briefing kwaliteit", emoji: "📋", score: 86, description: "Kandidaat goed gebrieft over bedrijf, functie en gesprekspartners" },
      { label: "Nabellen na gesprek", emoji: "⏱️", score: 85, description: "Binnen 2 uur nagebeld na afloop van het gesprek" },
      { label: "Afspraken nakomen", emoji: "🤝", score: 94, description: "Terugbelafspraken en deadlines consequent nagekomen" },
      { label: "Proactief contact", emoji: "💬", score: 86, description: "Proactief tussentijds contact opgenomen met kandidaat" },
    ],
  },
  {
    consultant: "Daan de Boer",
    overallScore: 71,
    metrics: [
      { label: "Bellen vóór gesprek", emoji: "📞", score: 72, description: "Kandidaat gebeld ter voorbereiding op sollicitatiegesprek" },
      { label: "Briefing kwaliteit", emoji: "📋", score: 65, description: "Kandidaat goed gebrieft over bedrijf, functie en gesprekspartners" },
      { label: "Nabellen na gesprek", emoji: "⏱️", score: 68, description: "Binnen 2 uur nagebeld na afloop van het gesprek" },
      { label: "Afspraken nakomen", emoji: "🤝", score: 78, description: "Terugbelafspraken en deadlines consequent nagekomen" },
      { label: "Proactief contact", emoji: "💬", score: 72, description: "Proactief tussentijds contact opgenomen met kandidaat" },
    ],
  },
];

// ── NPS Scores per Kandidaat ──

export interface CandidateNPS {
  candidateId: string;
  name: string;
  avatar: string;
  consultant: string;
  npsScore: number; // -100 to 100 scale, but we show 1-10
  npsRating: number; // 1-10
  category: "promoter" | "passive" | "detractor";
  feedback: string;
  date: string;
}

export const candidateNPSScores: CandidateNPS[] = [
  { candidateId: "cand-0", name: "Kevin van der Berg", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face", consultant: "Sophie de Vries", npsRating: 10, npsScore: 100, category: "promoter", feedback: "Uitstekende begeleiding van begin tot eind. Voelde me echt gehoord.", date: "2 weken geleden" },
  { candidateId: "cand-1", name: "Priya Sharma", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face", consultant: "Sophie de Vries", npsRating: 9, npsScore: 90, category: "promoter", feedback: "Snelle opvolging en goede match gevonden. Top service!", date: "1 week geleden" },
  { candidateId: "cand-2", name: "Jordi Willemsen", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face", consultant: "Bram Jansen", npsRating: 8, npsScore: 80, category: "promoter", feedback: "Goed geholpen, alleen de briefing kon iets uitgebreider.", date: "3 dagen geleden" },
  { candidateId: "cand-3", name: "Nadia el Amrani", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face", consultant: "Bram Jansen", npsRating: 6, npsScore: 20, category: "passive", feedback: "Proces duurde lang, maar uiteindelijk goed terechtgekomen.", date: "1 week geleden" },
  { candidateId: "cand-4", name: "Ruben Hendriks", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face", consultant: "Lisa van Dijk", npsRating: 9, npsScore: 90, category: "promoter", feedback: "Lisa begreep precies wat ik zocht. Fantastisch!", date: "Vandaag" },
  { candidateId: "cand-5", name: "Fatima Yilmaz", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face", consultant: "Lisa van Dijk", npsRating: 7, npsScore: 40, category: "passive", feedback: "Goede ervaring, maar had graag meer updates ontvangen.", date: "5 dagen geleden" },
  { candidateId: "cand-6", name: "Thijs Vermeer", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face", consultant: "Thomas Bakker", npsRating: 10, npsScore: 100, category: "promoter", feedback: "De beste recruiter die ik ooit heb gehad. Echt persoonlijk.", date: "Gisteren" },
  { candidateId: "cand-7", name: "Sanne Kuijpers", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face", consultant: "Thomas Bakker", npsRating: 5, npsScore: -10, category: "detractor", feedback: "Terugbelafspraak niet nagekomen, daarna wel goed opgepakt.", date: "4 dagen geleden" },
  { candidateId: "cand-8", name: "Dex van Leeuwen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face", consultant: "Emma Visser", npsRating: 8, npsScore: 80, category: "promoter", feedback: "Prettig contact en goede voorbereiding op gesprekken.", date: "2 dagen geleden" },
  { candidateId: "cand-9", name: "Maria Gonzalez", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face", consultant: "Emma Visser", npsRating: 9, npsScore: 90, category: "promoter", feedback: "Heel blij met de begeleiding. Droombaan gevonden!", date: "Vandaag" },
  { candidateId: "cand-10", name: "Bram Dijkstra", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face", consultant: "Daan de Boer", npsRating: 6, npsScore: 20, category: "passive", feedback: "Redelijke ervaring. Communicatie kon beter.", date: "1 week geleden" },
  { candidateId: "cand-11", name: "Yara de Jong", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face", consultant: "Daan de Boer", npsRating: 10, npsScore: 100, category: "promoter", feedback: "Geweldige ervaring! Al mijn vrienden doorverwezen.", date: "3 dagen geleden" },
];

// ── Google Reviews (bedrijfsniveau) ──

export interface GoogleReview {
  author: string;
  avatar: string;
  rating: number; // 1-5 stars
  text: string;
  date: string;
  linkedCandidate?: string;
  linkedConsultant?: string;
}

export const googleReviews: GoogleReview[] = [
  { author: "Kevin v.d. Berg", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face", rating: 5, text: "Synsel heeft mij fantastisch geholpen aan mijn droombaan als elektromonteur. Sophie was heel persoonlijk en betrokken.", date: "2 weken geleden", linkedConsultant: "Sophie de Vries" },
  { author: "Thijs V.", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face", rating: 5, text: "Beste uitzendbureau waar ik ooit mee heb gewerkt. Ze luisteren écht naar wat je wilt.", date: "1 week geleden", linkedConsultant: "Thomas Bakker" },
  { author: "Priya S.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face", rating: 4, text: "Goede ervaring, snelle plaatsing. Alleen de communicatie tussendoor kon iets frequenter.", date: "3 weken geleden", linkedConsultant: "Sophie de Vries" },
  { author: "Maria G.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face", rating: 5, text: "Ik ben via Synsel aan mijn nieuwe baan gekomen en kon niet blijer zijn. Aanrader!", date: "5 dagen geleden", linkedConsultant: "Emma Visser" },
  { author: "Anoniem", avatar: "", rating: 3, text: "Prima bureau, maar ik moest zelf vaak bellen voor updates. Uiteindelijk wel goed geholpen.", date: "1 maand geleden" },
  { author: "Ruben H.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face", rating: 5, text: "Lisa heeft precies begrepen wat ik zocht. Binnen 2 weken geplaatst!", date: "Vandaag", linkedConsultant: "Lisa van Dijk" },
];

export const companyGoogleRating = 4.6;
export const companyGoogleReviewCount = 127;
