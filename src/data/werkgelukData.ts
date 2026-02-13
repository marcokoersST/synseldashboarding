// Mock data for Werkgeluk dashboard

export interface WerkgelukDimension {
  key: string;
  label: string;
  emoji: string;
  score: number;
  trend: number;
  description: string;
}

export interface HooraySentiment {
  geluk: number;
  autonomie: number;
  ontwikkeling: number;
  perspectief: number;
  doel: number;
  overall: number;
  lastAssessment: string;
  trend: { period: string; geluk: number; autonomie: number; ontwikkeling: number; perspectief: number; doel: number }[];
}

export interface LeadershipShadow {
  klaaggedrag: number;      // Mate van klagen / negativiteit
  slachtofferschap: number; // Slachtofferrol aannemen
  weerstand: number;        // Weerstand tegen verandering / feedback
  overall: number;
}

export interface LeadershipScore {
  openheid: number;
  betrokkenheid: number;
  ontwikkelbehoefte: number;
  verantwoordelijkheid: number;
  overall: number;
  shadow: LeadershipShadow;
  bronnen: { bron: string; leidend: number; schaduw: number }[];
}

export interface ConsultantWerkgeluk {
  name: string;
  overallScore: number;
  dimensions: WerkgelukDimension[];
  periodTrend: { period: string; overall: number; kpi: number; salaris: number; kandidaat: number; erkenning: number; droombaan: number; ontwikkeling: number }[];
  trophies: { label: string; date: string; emoji: string }[];
  droombaanCount: number;
  hooray: HooraySentiment;
  leadership: LeadershipScore;
}

const baseDimensions = (kpi: number, salaris: number, kandidaat: number, erkenning: number, droombaan: number, ontwikkeling: number): WerkgelukDimension[] => [
  { key: "kpi", label: "KPI Ontwikkeling", emoji: "📊", score: kpi, trend: Math.round((Math.random() - 0.3) * 12), description: "Groei in het behalen van KPI-targets over tijd" },
  { key: "salaris", label: "Salaris Groei", emoji: "💰", score: salaris, trend: Math.round((Math.random() - 0.2) * 10), description: "Progressie in salaristrappen en bonussen" },
  { key: "kandidaat", label: "Kandidaat Ervaring", emoji: "❤️", score: kandidaat, trend: Math.round((Math.random() - 0.3) * 14), description: "Tevredenheid en NPS-scores van kandidaten" },
  { key: "erkenning", label: "Waardering & Erkenning", emoji: "🏆", score: erkenning, trend: Math.round((Math.random() - 0.4) * 8), description: "Top noteringen, bokalen en awards behaald" },
  { key: "droombaan", label: "Droombanen Bemiddeld", emoji: "🎯", score: droombaan, trend: Math.round((Math.random() - 0.3) * 10), description: "Kandidaten succesvol aan hun droombaan geholpen" },
  { key: "ontwikkeling", label: "Persoonlijke Ontwikkeling", emoji: "🌱", score: ontwikkeling, trend: Math.round((Math.random() - 0.25) * 11), description: "Groei in vaardigheden, mindset en professionele competenties" },
];

function makeLeadership(openheid: number, betrokkenheid: number, ontwikkelbehoefte: number, verantwoordelijkheid: number): LeadershipScore {
  const overall = Math.round((openheid + betrokkenheid + ontwikkelbehoefte + verantwoordelijkheid) / 4);
  // Shadow scores are inversely correlated — higher leadership = lower shadow
  const shadowBase = Math.max(5, 100 - overall + Math.round(Math.random() * 10 - 5));
  const klaag = Math.min(95, Math.max(5, shadowBase + Math.round(Math.random() * 12 - 6)));
  const slacht = Math.min(95, Math.max(5, shadowBase + Math.round(Math.random() * 14 - 7)));
  const weer = Math.min(95, Math.max(5, shadowBase + Math.round(Math.random() * 10 - 5)));
  const shadowOverall = Math.round((klaag + slacht + weer) / 3);

  return {
    openheid, betrokkenheid, ontwikkelbehoefte, verantwoordelijkheid, overall,
    shadow: { klaaggedrag: klaag, slachtofferschap: slacht, weerstand: weer, overall: shadowOverall },
    bronnen: [
      { bron: "Tel. Inschrijving", leidend: Math.min(100, Math.max(10, Math.round(openheid * 0.95 + Math.random() * 6 - 3))), schaduw: Math.min(95, Math.max(5, Math.round(klaag * 0.9 + Math.random() * 8 - 4))) },
      { bron: "Tel. Acquisitie", leidend: Math.min(100, Math.max(10, Math.round(betrokkenheid * 0.9 + Math.random() * 8 - 4))), schaduw: Math.min(95, Math.max(5, Math.round(slacht * 0.95 + Math.random() * 6 - 3))) },
      { bron: "Intakegesprek", leidend: Math.min(100, Math.max(10, Math.round(ontwikkelbehoefte * 1.02 + Math.random() * 6 - 3))), schaduw: Math.min(95, Math.max(5, Math.round(weer * 0.92 + Math.random() * 8 - 4))) },
      { bron: "Deal Sluiter", leidend: Math.min(100, Math.max(10, Math.round(verantwoordelijkheid * 0.97 + Math.random() * 6 - 3))), schaduw: Math.min(95, Math.max(5, Math.round(klaag * 0.88 + Math.random() * 10 - 5))) },
      { bron: "Hooray Vragenlijst", leidend: Math.min(100, Math.max(10, Math.round(overall * 1.01 + Math.random() * 4 - 2))), schaduw: Math.min(95, Math.max(5, Math.round(shadowOverall * 1.02 + Math.random() * 4 - 2))) },
      { bron: "Hooray Documentatie", leidend: Math.min(100, Math.max(10, Math.round(overall * 0.98 + Math.random() * 4 - 2))), schaduw: Math.min(95, Math.max(5, Math.round(shadowOverall * 0.97 + Math.random() * 6 - 3))) },
    ],
  };
}

function makeHooray(geluk: number, autonomie: number, ontwikkeling: number, perspectief: number, doel: number): HooraySentiment {
  const overall = Math.round((geluk + autonomie + ontwikkeling + perspectief + doel) / 5);
  return {
    geluk, autonomie, ontwikkeling, perspectief, doel, overall,
    lastAssessment: "2026-01-28",
    trend: [
      { period: "Q1'25", geluk: geluk - 12, autonomie: autonomie - 10, ontwikkeling: ontwikkeling - 8, perspectief: perspectief - 14, doel: doel - 11 },
      { period: "Q2'25", geluk: geluk - 8, autonomie: autonomie - 6, ontwikkeling: ontwikkeling - 5, perspectief: perspectief - 9, doel: doel - 7 },
      { period: "Q3'25", geluk: geluk - 4, autonomie: autonomie - 3, ontwikkeling: ontwikkeling - 2, perspectief: perspectief - 5, doel: doel - 3 },
      { period: "Q4'25", geluk, autonomie, ontwikkeling, perspectief, doel },
    ],
  };
}

function makeTrend(base: number[]) {
  return [
    { period: "P8", overall: base[0], kpi: base[0] - 5, salaris: base[0] - 8, kandidaat: base[0] + 2, erkenning: base[0] - 12, droombaan: base[0] - 3, ontwikkeling: base[0] - 6 },
    { period: "P9", overall: base[1], kpi: base[1] - 3, salaris: base[1] - 6, kandidaat: base[1] + 1, erkenning: base[1] - 10, droombaan: base[1] - 1, ontwikkeling: base[1] - 4 },
    { period: "P10", overall: base[2], kpi: base[2] - 2, salaris: base[2] - 4, kandidaat: base[2] + 3, erkenning: base[2] - 8, droombaan: base[2] + 2, ontwikkeling: base[2] - 2 },
    { period: "P11", overall: base[3], kpi: base[3] + 1, salaris: base[3] - 2, kandidaat: base[3] + 4, erkenning: base[3] - 5, droombaan: base[3] + 3, ontwikkeling: base[3] + 1 },
    { period: "P12", overall: base[4], kpi: base[4] + 3, salaris: base[4] - 1, kandidaat: base[4] + 5, erkenning: base[4] - 3, droombaan: base[4] + 4, ontwikkeling: base[4] + 2 },
    { period: "P13", overall: base[5], kpi: base[5] + 4, salaris: base[5] + 1, kandidaat: base[5] + 6, erkenning: base[5] - 1, droombaan: base[5] + 5, ontwikkeling: base[5] + 3 },
  ];
}

export const consultantWerkgeluk: ConsultantWerkgeluk[] = [
  { name: "Sophie de Vries", overallScore: 88, dimensions: baseDimensions(92, 85, 90, 88, 82, 86), periodTrend: makeTrend([72, 75, 78, 82, 85, 88]), trophies: [{ label: "Omzetkoning P12", date: "2025-12", emoji: "👑" }, { label: "Plaatsingskoning P11", date: "2025-10", emoji: "🥇" }, { label: "Beste NPS Q3", date: "2025-09", emoji: "⭐" }], droombaanCount: 14, hooray: makeHooray(92, 88, 85, 90, 87), leadership: makeLeadership(90, 92, 85, 88) },
  { name: "Thomas Bakker", overallScore: 79, dimensions: baseDimensions(82, 78, 80, 72, 75, 76), periodTrend: makeTrend([65, 68, 70, 73, 76, 79]), trophies: [{ label: "Gesprekken Guru P10", date: "2025-08", emoji: "🎙️" }], droombaanCount: 11, hooray: makeHooray(80, 75, 78, 72, 70), leadership: makeLeadership(78, 74, 72, 70) },
  { name: "Emma Visser", overallScore: 75, dimensions: baseDimensions(78, 72, 82, 65, 70, 80), periodTrend: makeTrend([60, 63, 66, 69, 72, 75]), trophies: [{ label: "Beste NPS P9", date: "2025-07", emoji: "⭐" }], droombaanCount: 9, hooray: makeHooray(78, 72, 80, 68, 65), leadership: makeLeadership(82, 70, 75, 68) },
  { name: "Anna Smit", overallScore: 71, dimensions: baseDimensions(74, 70, 75, 60, 68, 72), periodTrend: makeTrend([55, 58, 62, 65, 68, 71]), trophies: [], droombaanCount: 8, hooray: makeHooray(74, 68, 72, 65, 60), leadership: makeLeadership(72, 68, 65, 62) },
  { name: "Fleur Mulder", overallScore: 65, dimensions: baseDimensions(68, 62, 70, 55, 60, 64), periodTrend: makeTrend([48, 52, 55, 58, 62, 65]), trophies: [], droombaanCount: 6, hooray: makeHooray(65, 60, 62, 55, 52), leadership: makeLeadership(60, 58, 55, 52) },
  { name: "Niels de Groot", overallScore: 60, dimensions: baseDimensions(62, 58, 65, 48, 55, 58), periodTrend: makeTrend([42, 46, 50, 53, 57, 60]), trophies: [], droombaanCount: 5, hooray: makeHooray(58, 55, 60, 48, 45), leadership: makeLeadership(55, 52, 48, 45) },
  { name: "Mark Peters", overallScore: 55, dimensions: baseDimensions(58, 52, 55, 45, 50, 52), periodTrend: makeTrend([38, 42, 45, 48, 52, 55]), trophies: [{ label: "Margebaas P8", date: "2025-06", emoji: "💎" }], droombaanCount: 4, hooray: makeHooray(52, 48, 55, 42, 40), leadership: makeLeadership(48, 45, 42, 40) },
  { name: "Daan de Boer", overallScore: 48, dimensions: baseDimensions(50, 45, 48, 38, 42, 44), periodTrend: makeTrend([32, 35, 38, 42, 45, 48]), trophies: [], droombaanCount: 3, hooray: makeHooray(45, 40, 42, 35, 32), leadership: makeLeadership(42, 38, 35, 32) },
  { name: "Bram Jansen", overallScore: 42, dimensions: baseDimensions(44, 40, 42, 32, 38, 36), periodTrend: makeTrend([28, 30, 33, 36, 39, 42]), trophies: [], droombaanCount: 2, hooray: makeHooray(40, 35, 38, 28, 25), leadership: makeLeadership(35, 30, 28, 25) },
  { name: "Lisa van Dijk", overallScore: 35, dimensions: baseDimensions(38, 32, 35, 25, 30, 28), periodTrend: makeTrend([22, 25, 28, 30, 32, 35]), trophies: [], droombaanCount: 1, hooray: makeHooray(32, 28, 30, 22, 18), leadership: makeLeadership(28, 22, 20, 18) },
];
