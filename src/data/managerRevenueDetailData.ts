import { myTeamConsultants } from "./managerData";

// ─── Consultant Revenue Detail Data ───

export interface SecondmentRecord {
  candidateName: string;
  company: string;
  startDate: string;
  endDate: string;
  monthlyRevenue: number;
  contractedMonths: number;
  type: "detachering" | "R&S";
}

export interface ConsultantRevenueDetail {
  consultantId: number;
  consultantName: string;
  totalRevenue: number;
  avgCostPerCandidate: number;
  detacheringCount: number;
  rsCount: number;
  performanceRatio: number; // percentage
  secondments: SecondmentRecord[];
}

const companies = ["Shell", "ASML", "Philips", "ING", "KPN", "Rabobank", "Unilever", "Heineken"];

export const consultantRevenueDetailData: ConsultantRevenueDetail[] = myTeamConsultants.map((c, ci) => {
  const detCount = 2 + Math.floor(Math.random() * 4);
  const rsCount = 1 + Math.floor(Math.random() * 3);
  const totalRev = 80 + Math.floor(Math.random() * 120);
  return {
    consultantId: c.id,
    consultantName: c.name,
    totalRevenue: totalRev,
    avgCostPerCandidate: Math.round(totalRev / (detCount + rsCount)),
    detacheringCount: detCount,
    rsCount,
    performanceRatio: 60 + Math.floor(Math.random() * 35),
    secondments: Array.from({ length: detCount + rsCount }, (_, i) => ({
      candidateName: ["Jan de Vries", "Maria van den Berg", "Pieter Jansen", "Anna Bakker", "Thomas Visser", "Sophie de Jong", "Lars Mulder"][(ci + i) % 7],
      company: companies[(ci * 2 + i) % companies.length],
      startDate: `${1 + i} jan 2026`,
      endDate: i < detCount ? `${1 + i} jul 2026` : "–",
      monthlyRevenue: 8 + Math.floor(Math.random() * 12),
      contractedMonths: i < detCount ? 6 + Math.floor(Math.random() * 6) : 0,
      type: (i < detCount ? "detachering" : "R&S") as "detachering" | "R&S",
    })),
  };
});

// ─── Attrition Projection Data ───

export interface AttritionProjection {
  period: string;
  expectedAttrition: number;
  revenueLoss: number;
  candidates: {
    candidateName: string;
    consultantName: string;
    revenue: number;
    notes: string;
    aiAnalysis: string;
  }[];
}

export const attritionProjectionData: AttritionProjection[] = [
  { period: "P9", expectedAttrition: 2, revenueLoss: 8.5, candidates: [
    { candidateName: "Jan de Vries", consultantName: myTeamConsultants[0]?.name ?? "Consultant 1", revenue: 4200, notes: "Contract loopt af, geen verlenging verwacht", aiAnalysis: "Consultant heeft 2x opvolging gedaan, maar geen verlenggesprek ingepland. Aanbevolen: direct contact opnemen." },
    { candidateName: "Maria van den Berg", consultantName: myTeamConsultants[1]?.name ?? "Consultant 2", revenue: 4300, notes: "Kandidaat heeft aangegeven te willen stoppen", aiAnalysis: "Signalen van ontevredenheid in laatste check-in. Overweeg retentiegesprek." },
  ]},
  { period: "P10", expectedAttrition: 3, revenueLoss: 14.2, candidates: [
    { candidateName: "Pieter Jansen", consultantName: myTeamConsultants[2]?.name ?? "Consultant 3", revenue: 5000, notes: "Proeftijd eindigt, onzeker over verlenging", aiAnalysis: "Hoge kans op vertrek op basis van vergelijkbare profielen. Plan evaluatiegesprek in." },
    { candidateName: "Anna Bakker", consultantName: myTeamConsultants[0]?.name ?? "Consultant 1", revenue: 4800, notes: "Bedrijf reorganiseert", aiAnalysis: "Externe factor. Zoek proactief naar alternatieve plaatsing." },
    { candidateName: "Thomas Visser", consultantName: myTeamConsultants[3]?.name ?? "Consultant 4", revenue: 4400, notes: "Kandidaat solliciteert elders", aiAnalysis: "Consultant heeft geen recent contact gehad. Directe actie vereist." },
  ]},
  { period: "P11", expectedAttrition: 1, revenueLoss: 3.8, candidates: [
    { candidateName: "Sophie de Jong", consultantName: myTeamConsultants[4]?.name ?? "Consultant 5", revenue: 3800, notes: "Seizoenscontract", aiAnalysis: "Verwacht einde. Overweeg vervanging voor te bereiden." },
  ]},
  { period: "P12", expectedAttrition: 4, revenueLoss: 18.6, candidates: [
    { candidateName: "Lars Mulder", consultantName: myTeamConsultants[1]?.name ?? "Consultant 2", revenue: 5200, notes: "Contracteinde december", aiAnalysis: "Goede prestaties, verlenging kansrijk mits tijdig besproken." },
    { candidateName: "Emma Bos", consultantName: myTeamConsultants[2]?.name ?? "Consultant 3", revenue: 4600, notes: "Kandidaat ontevreden over werklocatie", aiAnalysis: "Overweeg locatiewijziging te bespreken met opdrachtgever." },
    { candidateName: "Daan Smit", consultantName: myTeamConsultants[0]?.name ?? "Consultant 1", revenue: 4200, notes: "Bedrijf bezuinigt", aiAnalysis: "Externe factor, maar consultant kan proactief alternatief zoeken." },
    { candidateName: "Lisa van Dijk", consultantName: myTeamConsultants[3]?.name ?? "Consultant 4", revenue: 4600, notes: "Studie gestart", aiAnalysis: "Kandidaat prioriteert studie. Mogelijkheid voor parttime?" },
  ]},
  { period: "P13", expectedAttrition: 2, revenueLoss: 9.0, candidates: [
    { candidateName: "Ruben Meijer", consultantName: myTeamConsultants[5]?.name ?? "Consultant 6", revenue: 4500, notes: "Contracteinde Q1", aiAnalysis: "Goede relatie, verlenging waarschijnlijk." },
    { candidateName: "Eva de Graaf", consultantName: myTeamConsultants[0]?.name ?? "Consultant 1", revenue: 4500, notes: "Verhuizing gepland", aiAnalysis: "Remote work optie bespreken om retentie te behouden." },
  ]},
];

// ─── Heatmap Data ───

export interface HeatmapConsultant {
  consultantId: number;
  consultantName: string;
  unit: string;
  performanceScore: number; // 0-100
  zone: "green" | "yellow" | "red";
  explanation: string;
  bestNextStep: string;
  recommendations: string[];
  developmentPoints: string[];
}

export const heatmapData: HeatmapConsultant[] = myTeamConsultants.map((c, i) => {
  const score = 30 + Math.floor(Math.random() * 65);
  const zone = score >= 70 ? "green" : score >= 45 ? "yellow" : "red";
  return {
    consultantId: c.id,
    consultantName: c.name,
    unit: c.unit,
    performanceScore: score,
    zone,
    explanation: zone === "green"
      ? `${c.name} presteert bovengemiddeld op alle kernmetrics en is op koers voor de periodedoelstelling.`
      : zone === "yellow"
      ? `${c.name} laat wisselende resultaten zien: sterke acquisitie maar lagere conversie naar plaatsingen.`
      : `${c.name} scoort onder norm op meerdere metrics. Interventie aanbevolen.`,
    bestNextStep: zone === "green"
      ? "Houd koers aan, deel best practices met team"
      : zone === "yellow"
      ? "Plan 1-op-1 coachinggesprek over conversie-optimalisatie"
      : "Plan interventiegesprek, stel actieplan op met concrete targets",
    recommendations: zone === "red"
      ? ["Wekelijks voortgangsgesprek inplannen", "Buddy koppelen aan toppresteerder", "Focus op 3 kernvaardigheden"]
      : ["Maandelijkse check-in behouden", "Uitdagende targets stellen"],
    developmentPoints: zone === "green"
      ? ["Mentorrol ontwikkelen", "Complexere klanten toewijzen"]
      : zone === "yellow"
      ? ["Conversie verbeteren", "Kwaliteit voorstellen verhogen"]
      : ["Basis verkoopvaardigheden", "Timemanagement", "Acquisitietechnieken"],
  };
});

// ─── Active Secondments Data ───

export interface ActiveSecondment {
  candidateName: string;
  company: string;
  consultantName: string;
  startDate: string;
  expectedEnd: string;
  monthlyRevenue: number;
  status: "active" | "ending-soon" | "new";
}

export const activeSecondmentsData: ActiveSecondment[] = myTeamConsultants.flatMap((c, ci) => 
  Array.from({ length: 2 + Math.floor(Math.random() * 3) }, (_, i) => ({
    candidateName: ["Jan de Vries", "Maria van den Berg", "Pieter Jansen", "Anna Bakker", "Thomas Visser", "Sophie de Jong", "Lars Mulder", "Emma Bos"][(ci * 2 + i) % 8],
    company: companies[(ci + i) % companies.length],
    consultantName: c.name,
    startDate: `${1 + i} jan 2026`,
    expectedEnd: `${1 + i} ${i < 2 ? "jul" : "dec"} 2026`,
    monthlyRevenue: 8 + Math.floor(Math.random() * 12),
    status: (i === 0 && ci < 2 ? "ending-soon" : i === 0 && ci > 3 ? "new" : "active") as "active" | "ending-soon" | "new",
  }))
);
