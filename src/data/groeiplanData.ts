// Integrated Consultant Growth Plan data — combines KPI, bonus/salary, quality, and AI-coach insights

export interface GrowthDimension {
  label: string;
  score: number; // 0-100
  trend: number[]; // last 6 periods
  icon: string;
}

export interface DevelopmentAction {
  priority: 1 | 2 | 3;
  area: string;
  action: string;
  impact: "hoog" | "midden" | "laag";
  category: "kpi" | "kwaliteit" | "omzet" | "coaching";
}

export interface TrophyMoment {
  date: string;
  icon: string;
  title: string;
  description: string;
  category: "ranking" | "kpi" | "kwaliteit" | "omzet" | "team" | "special";
}

export interface ConsultantGrowthProfile {
  name: string;
  role: string;
  department: string;
  overallScore: number; // 0-100 composite
  tier: "Starter" | "Gevorderd" | "Professional" | "Expert" | "Top Performer";
  revenue: number;
  revenueTarget: number;
  bonus: number;
  bonusTarget: number;
  salary: number;
  nextSalary: number;
  salaryProgress: number; // 0-100
  placements: number;
  placementsTarget: number;
  qualityScore: number; // 0-10
  aiCoachAvg: number; // 0-10
  kpiCompletion: number; // 0-100
  conversionRate: number;
  npsScore: number;
  dimensions: GrowthDimension[];
  developmentActions: DevelopmentAction[];
  trophies: TrophyMoment[];
  periodTrend: { period: string; overall: number; kpi: number; quality: number; revenue: number }[];
}

const tiers = ["Starter", "Gevorderd", "Professional", "Expert", "Top Performer"] as const;

function getTier(score: number): typeof tiers[number] {
  if (score >= 90) return "Top Performer";
  if (score >= 75) return "Expert";
  if (score >= 60) return "Professional";
  if (score >= 40) return "Gevorderd";
  return "Starter";
}

const actionPool: DevelopmentAction[] = [
  { priority: 1, area: "Belactiviteit", action: "Verhoog het aantal dagelijkse belblokken van 1 naar 2 om meer beslissers te bereiken", impact: "hoog", category: "kpi" },
  { priority: 1, area: "Conversie", action: "Focus op kwaliteit van intakegesprekken — bereid elk gesprek voor met 3 gerichte vragen", impact: "hoog", category: "kpi" },
  { priority: 2, area: "Mail personalisatie", action: "Pas voorstelmails aan met bedrijfsspecifieke details in plaats van generieke templates", impact: "midden", category: "kwaliteit" },
  { priority: 2, area: "DMU targeting", action: "Controleer altijd de correcte decision maker voordat je een voorstel verstuurt", impact: "midden", category: "kwaliteit" },
  { priority: 1, area: "Omzet groei", action: "Sluit minimaal 1 extra plaatsing per periode om de volgende salarisstap te bereiken", impact: "hoog", category: "omzet" },
  { priority: 3, area: "Marge optimalisatie", action: "Onderhandel actiever over tarieven bij verlengingen om de marge per plaatsing te verhogen", impact: "midden", category: "omzet" },
  { priority: 2, area: "Telefonische acquisitie", action: "Verbeter je waardepropositie — oefen de elevator pitch met je AI-coach", impact: "midden", category: "coaching" },
  { priority: 1, area: "Deal closing", action: "Herken koopsignalen sneller en pas de assumptive close techniek vaker toe", impact: "hoog", category: "coaching" },
  { priority: 3, area: "CRM discipline", action: "Werk dagelijks alle notities en statusupdates bij in het CRM systeem", impact: "laag", category: "kwaliteit" },
  { priority: 2, area: "Kandidaat pipeline", action: "Bouw een grotere pool op door wekelijks 5 nieuwe kandidaten te sourcen via LinkedIn", impact: "midden", category: "kpi" },
  { priority: 3, area: "Snelheid", action: "Reageer binnen 2 uur op kandidaat-reacties om je conversion rate te verhogen", impact: "midden", category: "kpi" },
  { priority: 1, area: "Intakekwaliteit", action: "Gebruik de intake-checklist consequent en bespreek salarisverwachtingen eerder", impact: "hoog", category: "coaching" },
];

function pickActions(seed: number, count: number): DevelopmentAction[] {
  const start = seed % Math.max(1, actionPool.length - count);
  return actionPool.slice(start, start + count).map((a, i) => ({ ...a, priority: (i + 1) as 1 | 2 | 3 }));
}

function genTrend(base: number, variance: number): number[] {
  return [0, 1, 2, 3, 4, 5].map((_, i) => Math.max(0, Math.min(100, Math.round(base - variance * 3 + i * variance + (Math.sin(i * 2.3) * variance * 0.5)))));
}

const rawProfiles = [
  { name: "Sophie de Vries", role: "Senior Recruiter", dept: "Engineering", rev: 1850000, revT: 2000000, bonus: 8200, bonusT: 10000, sal: 4200, nextSal: 4600, salProg: 92, plac: 7, placT: 8, qual: 8.4, aiCoach: 9.0, kpi: 94, conv: 3.1, nps: 9.2 },
  { name: "Thomas Bakker", role: "Recruiter", dept: "Engineering", rev: 1620000, revT: 2000000, bonus: 7100, bonusT: 10000, sal: 3800, nextSal: 4200, salProg: 85, plac: 5, placT: 8, qual: 7.8, aiCoach: 8.3, kpi: 88, conv: 2.8, nps: 8.5 },
  { name: "Emma Visser", role: "Senior Recruiter", dept: "Operators", rev: 1450000, revT: 2000000, bonus: 5800, bonusT: 10000, sal: 3600, nextSal: 4200, salProg: 78, plac: 6, placT: 8, qual: 7.5, aiCoach: 7.9, kpi: 82, conv: 3.4, nps: 8.1 },
  { name: "Anna Smit", role: "Recruiter", dept: "Operators", rev: 1280000, revT: 2000000, bonus: 4250, bonusT: 10000, sal: 3200, nextSal: 3600, salProg: 68, plac: 5, placT: 8, qual: 7.1, aiCoach: 7.4, kpi: 76, conv: 4.2, nps: 7.8 },
  { name: "Fleur Mulder", role: "Recruiter", dept: "Monteurs", rev: 1100000, revT: 2000000, bonus: 3500, bonusT: 10000, sal: 3000, nextSal: 3400, salProg: 58, plac: 4, placT: 8, qual: 6.8, aiCoach: 6.9, kpi: 72, conv: 2.6, nps: 7.2 },
  { name: "Niels de Groot", role: "Junior Recruiter", dept: "Engineering", rev: 980000, revT: 2000000, bonus: 3200, bonusT: 10000, sal: 2900, nextSal: 3200, salProg: 52, plac: 3, placT: 8, qual: 6.5, aiCoach: 6.7, kpi: 68, conv: 2.2, nps: 6.9 },
  { name: "Mark Peters", role: "Junior Recruiter", dept: "Monteurs", rev: 820000, revT: 2000000, bonus: 2400, bonusT: 10000, sal: 2800, nextSal: 3200, salProg: 42, plac: 2, placT: 8, qual: 6.2, aiCoach: 6.2, kpi: 62, conv: 1.9, nps: 6.5 },
  { name: "Daan de Boer", role: "Junior Recruiter", dept: "Operators", rev: 650000, revT: 2000000, bonus: 1800, bonusT: 10000, sal: 2700, nextSal: 3000, salProg: 35, plac: 2, placT: 8, qual: 5.5, aiCoach: 5.6, kpi: 55, conv: 1.7, nps: 5.8 },
  { name: "Bram Jansen", role: "Trainee", dept: "Monteurs", rev: 420000, revT: 2000000, bonus: 900, bonusT: 10000, sal: 2500, nextSal: 2800, salProg: 22, plac: 1, placT: 8, qual: 5.1, aiCoach: 5.0, kpi: 45, conv: 1.4, nps: 5.2 },
  { name: "Lisa van Dijk", role: "Trainee", dept: "Engineering", rev: 280000, revT: 2000000, bonus: 400, bonusT: 10000, sal: 2400, nextSal: 2800, salProg: 14, plac: 1, placT: 8, qual: 4.8, aiCoach: 4.4, kpi: 38, conv: 1.1, nps: 4.5 },
];

// Extended organization data (~50 consultants) for horse-race ranking
export interface OrgConsultant {
  name: string;
  department: string;
  role: string;
  overallScore: number;
  tier: string;
  delta: number; // position change vs last period
}

const orgNames = [
  "Sophie de Vries","Thomas Bakker","Emma Visser","Anna Smit","Fleur Mulder",
  "Niels de Groot","Mark Peters","Daan de Boer","Bram Jansen","Lisa van Dijk",
  "Roos Hendriks","Max Willems","Julia Verhoeven","Sven Dekker","Eva Brouwer",
  "Cas Hoekstra","Mila van den Berg","Lars Schouten","Noor Bergman","Tim Vogel",
  "Sara Kuijpers","Jesse Maas","Femke Bosman","Joris Kok","Lotte Blom",
  "Ruben de Jong","Iris Vos","Thijs Scholten","Amber van Leeuwen","Stijn Post",
  "Nina Vermeer","Wouter Groen","Tessa Kuiper","Daniël Prins","Merel van Vliet",
  "Rick Huisman","Vera Jacobs","Pieter Meijer","Anouk Timmermans","Koen Bos",
  "Lisanne de Wit","Sander Molenaar","Charlotte Smeets","Jasper van Dam","Fleur Aalbers",
  "Hugo Dijkstra","Marie van Rijn","Bas Gielen","Eline Koster","Tom Verhagen",
];
const orgDepts = ["Engineering","Operators","Monteurs"];
const orgRoles = ["Senior Recruiter","Recruiter","Recruiter","Junior Recruiter","Junior Recruiter","Trainee"];

export const orgConsultants: OrgConsultant[] = orgNames.map((name, i) => {
  const match = rawProfiles.find(p => p.name === name);
  const score = match
    ? Math.round(match.kpi * 0.3 + match.qual * 10 * 0.25 + match.aiCoach * 10 * 0.2 + match.salProg * 0.15 + (match.plac / match.placT) * 100 * 0.1)
    : Math.max(20, Math.min(95, 90 - i * 1.4 + Math.round(Math.sin(i * 1.7) * 6)));
  return {
    name,
    department: match?.dept || orgDepts[i % 3],
    role: match?.role || orgRoles[i % orgRoles.length],
    overallScore: score,
    tier: getTier(score),
    delta: Math.round(Math.sin(i * 2.1) * 3),
  };
}).sort((a, b) => b.overallScore - a.overallScore);

export const consultantGrowthProfiles: ConsultantGrowthProfile[] = rawProfiles.map((p, idx) => {
  const overallScore = Math.round((p.kpi * 0.3 + p.qual * 10 * 0.25 + p.aiCoach * 10 * 0.2 + p.salProg * 0.15 + (p.plac / p.placT) * 100 * 0.1));

  const dimensions: GrowthDimension[] = [
    { label: "KPI Prestaties", score: p.kpi, trend: genTrend(p.kpi, 4), icon: "target" },
    { label: "Kwaliteitsborging", score: Math.round(p.qual * 10), trend: genTrend(p.qual * 10, 3), icon: "shield" },
    { label: "AI-Coach Score", score: Math.round(p.aiCoach * 10), trend: genTrend(p.aiCoach * 10, 3), icon: "brain" },
    { label: "Omzet & Bonus", score: Math.round((p.rev / p.revT) * 100), trend: genTrend((p.rev / p.revT) * 100, 5), icon: "euro" },
    { label: "Conversie", score: Math.min(100, Math.round(p.conv * 20)), trend: genTrend(Math.min(100, p.conv * 20), 4), icon: "funnel" },
    { label: "Klanttevredenheid", score: Math.round(p.nps * 10), trend: genTrend(p.nps * 10, 2), icon: "heart" },
  ];

  const periodTrend = ["P8", "P9", "P10", "P11", "P12", "P13"].map((period, i) => ({
    period,
    overall: Math.max(0, Math.min(100, overallScore - 12 + i * 3 + Math.round(Math.sin(i + idx) * 3))),
    kpi: Math.max(0, Math.min(100, p.kpi - 10 + i * 2 + Math.round(Math.cos(i * 1.5) * 3))),
    quality: Math.max(0, Math.min(100, Math.round(p.qual * 10) - 8 + i * 2)),
    revenue: Math.max(0, Math.min(100, Math.round((p.rev / p.revT) * 100) - 15 + i * 3)),
  }));

  const trophyPool: TrophyMoment[] = [
    { date: "2025-12", icon: "🥇", title: "#1 Omzetkoning P12", description: "Hoogste omzet van alle consultants in periode 12", category: "ranking" },
    { date: "2025-11", icon: "🏆", title: "Top 3 Plaatsingskoning", description: "Derde plaats in het aantal plaatsingen in periode 11", category: "ranking" },
    { date: "2025-10", icon: "⭐", title: "NPS Score 9+", description: "Gemiddelde kandidaat-NPS boven de 9.0 behaald", category: "kwaliteit" },
    { date: "2025-09", icon: "🔥", title: "30-dagen belstreak", description: "30 opeenvolgende dagen minimaal 15 gesprekken gevoerd", category: "kpi" },
    { date: "2025-08", icon: "💰", title: "€1M omzet mijlpaal", description: "De grens van €1.000.000 omzet doorbroken dit jaar", category: "omzet" },
    { date: "2025-07", icon: "🎯", title: "100% KPI Completie", description: "Alle KPI-targets volledig behaald in periode 9", category: "kpi" },
    { date: "2025-06", icon: "🤝", title: "Team Challenge Winner", description: "Winnend team bij de Q2 plaatsingen-challenge", category: "team" },
    { date: "2025-05", icon: "💎", title: "Expert Level bereikt", description: "Doorgegroeid naar Expert-tier in het gamification systeem", category: "special" },
    { date: "2025-04", icon: "📞", title: "Gesprekken Guru P6", description: "Meeste kwalitatieve gesprekken gevoerd in periode 6", category: "ranking" },
    { date: "2025-03", icon: "✉️", title: "Beste Personalisatie", description: "Hoogste personalisatiescore op voorstelmails (92%)", category: "kwaliteit" },
    { date: "2025-02", icon: "🚀", title: "Snelste Plaatsing", description: "Record: kandidaat geplaatst binnen 5 werkdagen", category: "special" },
    { date: "2025-01", icon: "🏅", title: "Rookie of the Year", description: "Beste nieuwkomer van het afgelopen jaar", category: "special" },
    { date: "2024-12", icon: "📈", title: "Margebaas Q4", description: "Hoogste gemiddelde marge per plaatsing in Q4", category: "omzet" },
    { date: "2024-11", icon: "👑", title: "#1 AI-Coach Score", description: "Beste gemiddelde AI-Coach beoordeling van alle consultants", category: "kwaliteit" },
  ];

  // Assign trophies based on performance — top performers get more
  const trophyCount = p.kpi >= 88 ? 10 : p.kpi >= 72 ? 7 : p.kpi >= 55 ? 4 : 2;
  const startIdx = (idx * 3) % trophyPool.length;
  const trophies: TrophyMoment[] = [];
  for (let i = 0; i < trophyCount; i++) {
    trophies.push(trophyPool[(startIdx + i) % trophyPool.length]);
  }

  return {
    name: p.name,
    role: p.role,
    department: p.dept,
    overallScore,
    tier: getTier(overallScore),
    revenue: p.rev,
    revenueTarget: p.revT,
    bonus: p.bonus,
    bonusTarget: p.bonusT,
    salary: p.sal,
    nextSalary: p.nextSal,
    salaryProgress: p.salProg,
    placements: p.plac,
    placementsTarget: p.placT,
    qualityScore: p.qual,
    aiCoachAvg: p.aiCoach,
    kpiCompletion: p.kpi,
    conversionRate: p.conv,
    npsScore: p.nps,
    dimensions,
    developmentActions: pickActions(idx, 5),
    trophies,
    periodTrend,
  };
});
