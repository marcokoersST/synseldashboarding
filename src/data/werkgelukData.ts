// Mock data for Werkgeluk dashboard

export interface WerkgelukDimension {
  key: string;
  label: string;
  emoji: string;
  score: number; // 0-100
  trend: number; // delta vs vorige periode
  description: string;
}

export interface ConsultantWerkgeluk {
  name: string;
  overallScore: number;
  dimensions: WerkgelukDimension[];
  periodTrend: { period: string; overall: number; kpi: number; salaris: number; kandidaat: number; erkenning: number; droombaan: number }[];
  trophies: { label: string; date: string; emoji: string }[];
  droombaanCount: number;
}

const baseDimensions = (kpi: number, salaris: number, kandidaat: number, erkenning: number, droombaan: number): WerkgelukDimension[] => [
  { key: "kpi", label: "KPI Ontwikkeling", emoji: "📊", score: kpi, trend: Math.round((Math.random() - 0.3) * 12), description: "Groei in het behalen van KPI-targets over tijd" },
  { key: "salaris", label: "Salaris Groei", emoji: "💰", score: salaris, trend: Math.round((Math.random() - 0.2) * 10), description: "Progressie in salaristrappen en bonussen" },
  { key: "kandidaat", label: "Kandidaat Ervaring", emoji: "❤️", score: kandidaat, trend: Math.round((Math.random() - 0.3) * 14), description: "Tevredenheid en NPS-scores van kandidaten" },
  { key: "erkenning", label: "Waardering & Erkenning", emoji: "🏆", score: erkenning, trend: Math.round((Math.random() - 0.4) * 8), description: "Top noteringen, bokalen en awards behaald" },
  { key: "droombaan", label: "Droombaan Plaatsingen", emoji: "🎯", score: droombaan, trend: Math.round((Math.random() - 0.3) * 10), description: "Kandidaten succesvol aan hun droombaan geholpen" },
];

function makeTrend(base: number[]) {
  return [
    { period: "P8", overall: base[0], kpi: base[0] - 5, salaris: base[0] - 8, kandidaat: base[0] + 2, erkenning: base[0] - 12, droombaan: base[0] - 3 },
    { period: "P9", overall: base[1], kpi: base[1] - 3, salaris: base[1] - 6, kandidaat: base[1] + 1, erkenning: base[1] - 10, droombaan: base[1] - 1 },
    { period: "P10", overall: base[2], kpi: base[2] - 2, salaris: base[2] - 4, kandidaat: base[2] + 3, erkenning: base[2] - 8, droombaan: base[2] + 2 },
    { period: "P11", overall: base[3], kpi: base[3] + 1, salaris: base[3] - 2, kandidaat: base[3] + 4, erkenning: base[3] - 5, droombaan: base[3] + 3 },
    { period: "P12", overall: base[4], kpi: base[4] + 3, salaris: base[4] - 1, kandidaat: base[4] + 5, erkenning: base[4] - 3, droombaan: base[4] + 4 },
    { period: "P13", overall: base[5], kpi: base[5] + 4, salaris: base[5] + 1, kandidaat: base[5] + 6, erkenning: base[5] - 1, droombaan: base[5] + 5 },
  ];
}

export const consultantWerkgeluk: ConsultantWerkgeluk[] = [
  {
    name: "Sophie de Vries",
    overallScore: 88,
    dimensions: baseDimensions(92, 85, 90, 88, 82),
    periodTrend: makeTrend([72, 75, 78, 82, 85, 88]),
    trophies: [
      { label: "Omzetkoning P12", date: "2025-12", emoji: "👑" },
      { label: "Plaatsingskoning P11", date: "2025-10", emoji: "🥇" },
      { label: "Beste NPS Q3", date: "2025-09", emoji: "⭐" },
    ],
    droombaanCount: 14,
  },
  {
    name: "Thomas Bakker",
    overallScore: 79,
    dimensions: baseDimensions(82, 78, 80, 72, 75),
    periodTrend: makeTrend([65, 68, 70, 73, 76, 79]),
    trophies: [
      { label: "Gesprekken Guru P10", date: "2025-08", emoji: "🎙️" },
    ],
    droombaanCount: 11,
  },
  {
    name: "Emma Visser",
    overallScore: 75,
    dimensions: baseDimensions(78, 72, 82, 65, 70),
    periodTrend: makeTrend([60, 63, 66, 69, 72, 75]),
    trophies: [
      { label: "Beste NPS P9", date: "2025-07", emoji: "⭐" },
    ],
    droombaanCount: 9,
  },
  {
    name: "Anna Smit",
    overallScore: 71,
    dimensions: baseDimensions(74, 70, 75, 60, 68),
    periodTrend: makeTrend([55, 58, 62, 65, 68, 71]),
    trophies: [],
    droombaanCount: 8,
  },
  {
    name: "Fleur Mulder",
    overallScore: 65,
    dimensions: baseDimensions(68, 62, 70, 55, 60),
    periodTrend: makeTrend([48, 52, 55, 58, 62, 65]),
    trophies: [],
    droombaanCount: 6,
  },
  {
    name: "Niels de Groot",
    overallScore: 60,
    dimensions: baseDimensions(62, 58, 65, 48, 55),
    periodTrend: makeTrend([42, 46, 50, 53, 57, 60]),
    trophies: [],
    droombaanCount: 5,
  },
  {
    name: "Mark Peters",
    overallScore: 55,
    dimensions: baseDimensions(58, 52, 55, 45, 50),
    periodTrend: makeTrend([38, 42, 45, 48, 52, 55]),
    trophies: [
      { label: "Margebaas P8", date: "2025-06", emoji: "💎" },
    ],
    droombaanCount: 4,
  },
  {
    name: "Daan de Boer",
    overallScore: 48,
    dimensions: baseDimensions(50, 45, 48, 38, 42),
    periodTrend: makeTrend([32, 35, 38, 42, 45, 48]),
    trophies: [],
    droombaanCount: 3,
  },
  {
    name: "Bram Jansen",
    overallScore: 42,
    dimensions: baseDimensions(44, 40, 42, 32, 38),
    periodTrend: makeTrend([28, 30, 33, 36, 39, 42]),
    trophies: [],
    droombaanCount: 2,
  },
  {
    name: "Lisa van Dijk",
    overallScore: 35,
    dimensions: baseDimensions(38, 32, 35, 25, 30),
    periodTrend: makeTrend([22, 25, 28, 30, 32, 35]),
    trophies: [],
    droombaanCount: 1,
  },
];
