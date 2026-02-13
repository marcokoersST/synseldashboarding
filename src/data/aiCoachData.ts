// AI-Coach Ranking mock data with period-based nuance

export interface CoachScore {
  category: string;
  score: number; // 0-10
}

export interface DevelopmentPoint {
  label: string;
  description: string;
}

export interface PeriodScores {
  scores: CoachScore[];
  average: number;
  developmentPoints: Record<string, DevelopmentPoint[]>; // category -> top 3
}

export interface TrendPoint {
  label: string;
  scores: Record<string, number>; // category -> score
  average: number;
}

export interface ConsultantCoachRanking {
  name: string;
  scores: CoachScore[];
  average: number;
  periodData: Record<string, PeriodScores>;
  trendData: Record<string, TrendPoint[]>; // periodKey -> timeline
}

export type PeriodKey = "dag" | "week" | "periode" | "kwartaal" | "jaar";

export const periodLabels: Record<PeriodKey, string> = {
  dag: "Dag",
  week: "Week",
  periode: "Periode (4 wkn)",
  kwartaal: "Kwartaal",
  jaar: "Jaar",
};

export const coachCategories = [
  "Telefonische Inschrijving",
  "Telefonische Acquisitie",
  "Intakegesprek",
  "Deal Sluiter",
];

const devPointsPool: Record<string, DevelopmentPoint[]> = {
  "Telefonische Inschrijving": [
    { label: "Opening & rapport", description: "Bouw sneller een persoonlijke connectie op in de eerste 30 seconden." },
    { label: "Behoefteanalyse", description: "Stel meer open vragen om de motivatie van de kandidaat te achterhalen." },
    { label: "Afsluiting & follow-up", description: "Maak concretere vervolgafspraken aan het einde van het gesprek." },
    { label: "Actief luisteren", description: "Vat vaker samen wat de kandidaat zegt om begrip te tonen." },
    { label: "Urgentie creëren", description: "Benadruk de kansen en tijdlijnen om sneller commitment te krijgen." },
  ],
  "Telefonische Acquisitie": [
    { label: "Waardepropositie", description: "Formuleer het unieke voordeel concreter en klantgerichter." },
    { label: "Bezwaar-handling", description: "Gebruik de 'feel-felt-found' techniek bij prijsbezwaren." },
    { label: "Decision maker bereiken", description: "Zorg dat je sneller bij de juiste contactpersoon uitkomt." },
    { label: "Pitch tempo", description: "Neem meer pauzes om de prospect te laten reageren." },
    { label: "CTA formuleren", description: "Eindig elk gesprek met een duidelijke call-to-action." },
  ],
  "Intakegesprek": [
    { label: "Gespreksstructuur", description: "Houd je strikter aan de intake-checklist om niets over te slaan." },
    { label: "Culturele fit beoordeling", description: "Peil dieper op soft skills en teamdynamiek voorkeuren." },
    { label: "Verwachtingsmanagement", description: "Communiceer duidelijker over het vervolgproces en tijdlijn." },
    { label: "Salarisindicatie", description: "Bespreek eerder in het gesprek de financiële verwachtingen." },
    { label: "Motivatie-analyse", description: "Onderzoek grondiger waarom de kandidaat wil wisselen van baan." },
  ],
  "Deal Sluiter": [
    { label: "Closing-technieken", description: "Pas vaker de assumptive close toe bij warme leads." },
    { label: "Onderhandelingstactiek", description: "Creëer win-win scenario's in plaats van eenzijdige concessies." },
    { label: "Contractbespreking", description: "Bereid de contractvoorwaarden beter voor om verrassingen te voorkomen." },
    { label: "Timing van de close", description: "Herken koopsignalen sneller en stuur daar direct op aan." },
    { label: "After-close relatie", description: "Plan direct een onboarding-check-in na het tekenen van het contract." },
  ],
};

// Generate slightly varied scores per period using a seed-like approach
function variedScore(base: number, periodIdx: number, catIdx: number): number {
  const offsets = [
    [0.3, -0.2, 0.1, -0.4, 0.2],
    [-0.1, 0.4, -0.3, 0.2, -0.1],
    [0.2, -0.3, 0.5, -0.1, 0.3],
    [-0.2, 0.1, -0.2, 0.3, -0.3],
  ];
  const offset = offsets[catIdx % 4][periodIdx % 5];
  return Math.max(1, Math.min(10, +(base + offset).toFixed(1)));
}

function pickDevPoints(category: string, seed: number): DevelopmentPoint[] {
  const pool = devPointsPool[category] || [];
  const start = seed % Math.max(1, pool.length - 2);
  return pool.slice(start, start + 3);
}

const periods: PeriodKey[] = ["dag", "week", "periode", "kwartaal", "jaar"];

const baseData = [
  { name: "Sophie de Vries", base: [9.1, 8.7, 8.9, 9.3] },
  { name: "Thomas Bakker", base: [8.4, 8.1, 7.9, 8.6] },
  { name: "Emma Visser", base: [7.8, 8.3, 7.5, 7.9] },
  { name: "Anna Smit", base: [7.5, 7.2, 7.8, 7.0] },
  { name: "Fleur Mulder", base: [7.1, 6.8, 7.3, 6.5] },
  { name: "Niels de Groot", base: [6.6, 7.0, 6.2, 6.8] },
  { name: "Mark Peters", base: [6.3, 5.9, 6.5, 6.1] },
  { name: "Daan de Boer", base: [5.8, 5.5, 5.2, 5.9] },
  { name: "Bram Jansen", base: [5.2, 4.8, 5.5, 4.6] },
  { name: "Lisa van Dijk", base: [4.5, 4.2, 4.8, 4.0] },
];

const trendLabels: Record<PeriodKey, string[]> = {
  dag: ["Ma", "Di", "Wo", "Do", "Vr"],
  week: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6", "Wk 7", "Wk 8"],
  periode: ["P1", "P2", "P3", "P4", "P5", "P6"],
  kwartaal: ["Q1", "Q2", "Q3", "Q4"],
  jaar: ["2021", "2022", "2023", "2024", "2025"],
};

function trendScore(base: number, tIdx: number, catIdx: number, periodIdx: number): number {
  // Create a progression pattern: generally improving over time with some variation
  const progression = tIdx * 0.15;
  const noise = Math.sin(tIdx * 3.7 + catIdx * 2.1 + periodIdx * 1.3) * 0.4;
  return Math.max(1, Math.min(10, +(base - 1.0 + progression + noise).toFixed(1)));
}

export const consultantCoachRankings: ConsultantCoachRanking[] = baseData.map((d, consultantIdx) => {
  const scores = coachCategories.map((cat, ci) => ({ category: cat, score: d.base[ci] }));
  const average = +(scores.reduce((s, x) => s + x.score, 0) / scores.length).toFixed(1);

  const periodData: Record<string, PeriodScores> = {};
  const trendData: Record<string, TrendPoint[]> = {};

  periods.forEach((period, pi) => {
    const pScores = coachCategories.map((cat, ci) => ({
      category: cat,
      score: variedScore(d.base[ci], pi, ci),
    }));
    const pAvg = +(pScores.reduce((s, x) => s + x.score, 0) / pScores.length).toFixed(1);
    const devPoints: Record<string, DevelopmentPoint[]> = {};
    coachCategories.forEach((cat, ci) => {
      devPoints[cat] = pickDevPoints(cat, consultantIdx + pi + ci);
    });
    periodData[period] = { scores: pScores, average: pAvg, developmentPoints: devPoints };

    // Generate trend timeline
    const labels = trendLabels[period];
    trendData[period] = labels.map((label, tIdx) => {
      const tScores: Record<string, number> = {};
      coachCategories.forEach((cat, ci) => {
        tScores[cat] = trendScore(d.base[ci], tIdx, ci, pi);
      });
      const tAvg = +(Object.values(tScores).reduce((s, v) => s + v, 0) / coachCategories.length).toFixed(1);
      return { label, scores: tScores, average: tAvg };
    });
  });

  return { name: d.name, scores, average, periodData, trendData };
});
