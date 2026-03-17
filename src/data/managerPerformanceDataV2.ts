import { myTeamConsultants } from "./managerData";
import { consultantSkillData, consultantColors, type ConsultantSkillData } from "./managerPerformanceData";

// Re-export what we still need
export { consultantSkillData, consultantColors, type ConsultantSkillData };

// ─── Revenue Chart with Forecast (Prognose) + Lanes + Historical ───

export interface RevenueDataPointV2 {
  period: string;
  realised: number;
  target: number;
  prognose: number;
  historicalAvg: number;
  belowTarget?: boolean;
}

// Lane reference values (in €k)
export const revenueLanes = {
  norm: 250,
  fastLane: 350,
  executive: 420,
};

// Historical seasonal pattern: high P1, dip P2-P3, rise summer, dip post-summer, rise year-end
export const revenueChartDataV2: RevenueDataPointV2[] = [
  { period: "P1",  realised: 180, target: 200, prognose: 185, historicalAvg: 195 },
  { period: "P2",  realised: 195, target: 220, prognose: 200, historicalAvg: 175 },
  { period: "P3",  realised: 210, target: 240, prognose: 218, historicalAvg: 170 },
  { period: "P4",  realised: 240, target: 260, prognose: 248, historicalAvg: 210 },
  { period: "P5",  realised: 260, target: 280, prognose: 268, historicalAvg: 245 },
  { period: "P6",  realised: 285, target: 300, prognose: 290, historicalAvg: 280 },
  { period: "P7",  realised: 310, target: 320, prognose: 315, historicalAvg: 310 },
  { period: "P8",  realised: 330, target: 340, prognose: 335, historicalAvg: 295 },
  { period: "P9",  realised: 0,   target: 360, prognose: 348, historicalAvg: 260 },
  { period: "P10", realised: 0,   target: 380, prognose: 362, historicalAvg: 285, belowTarget: true },
  { period: "P11", realised: 0,   target: 400, prognose: 378, historicalAvg: 320, belowTarget: true },
  { period: "P12", realised: 0,   target: 420, prognose: 395, historicalAvg: 360, belowTarget: true },
  { period: "P13", realised: 0,   target: 440, prognose: 410, historicalAvg: 390, belowTarget: true },
];

// ─── Placement Attrition Data ───

export interface PlacementAttrition {
  period: string;
  stoppersCount: number;
  revenueImpact: number;
  consultants: { name: string; candidateName: string; revenue: number }[];
}

export const placementAttritionData: PlacementAttrition[] = [
  { period: "P9", stoppersCount: 2, revenueImpact: 8.5, consultants: [
    { name: myTeamConsultants[0]?.name ?? "Consultant 1", candidateName: "Jan de Vries", revenue: 4200 },
    { name: myTeamConsultants[1]?.name ?? "Consultant 2", candidateName: "Maria van den Berg", revenue: 4300 },
  ]},
  { period: "P10", stoppersCount: 3, revenueImpact: 14.2, consultants: [
    { name: myTeamConsultants[2]?.name ?? "Consultant 3", candidateName: "Pieter Jansen", revenue: 5000 },
    { name: myTeamConsultants[0]?.name ?? "Consultant 1", candidateName: "Anna Bakker", revenue: 4800 },
    { name: myTeamConsultants[3]?.name ?? "Consultant 4", candidateName: "Thomas Visser", revenue: 4400 },
  ]},
  { period: "P11", stoppersCount: 1, revenueImpact: 3.8, consultants: [
    { name: myTeamConsultants[4]?.name ?? "Consultant 5", candidateName: "Sophie de Jong", revenue: 3800 },
  ]},
  { period: "P12", stoppersCount: 4, revenueImpact: 18.6, consultants: [
    { name: myTeamConsultants[1]?.name ?? "Consultant 2", candidateName: "Lars Mulder", revenue: 5200 },
    { name: myTeamConsultants[2]?.name ?? "Consultant 3", candidateName: "Emma Bos", revenue: 4600 },
    { name: myTeamConsultants[0]?.name ?? "Consultant 1", candidateName: "Daan Smit", revenue: 4200 },
    { name: myTeamConsultants[3]?.name ?? "Consultant 4", candidateName: "Lisa van Dijk", revenue: 4600 },
  ]},
  { period: "P13", stoppersCount: 2, revenueImpact: 9.0, consultants: [
    { name: myTeamConsultants[5]?.name ?? "Consultant 6", candidateName: "Ruben Meijer", revenue: 4500 },
    { name: myTeamConsultants[0]?.name ?? "Consultant 1", candidateName: "Eva de Graaf", revenue: 4500 },
  ]},
];

// ─── Quality / Sentiment per consultant ───

export interface ConsultantQualityData {
  consultantId: number;
  consultantName: string;
  unit: string;
  npsKlant: number;
  npsKandidaat: number;
  npsKlantTrend: number[];
  npsKandidaatTrend: number[];
  sentimentScore: number;
  sentimentTrend: number;
}

export const consultantQualityData: ConsultantQualityData[] = myTeamConsultants.map((c, i) => {
  const skill = consultantSkillData.find(s => s.consultantId === c.id);
  const npsK = skill?.npsKlant ?? 40;
  const npsC = skill?.npsKandidaat ?? 35;
  return {
    consultantId: c.id,
    consultantName: c.name,
    unit: c.unit,
    npsKlant: npsK,
    npsKandidaat: npsC,
    npsKlantTrend: [npsK - 8, npsK - 3, npsK + 2, npsK],
    npsKandidaatTrend: [npsC - 5, npsC - 1, npsC + 4, npsC],
    sentimentScore: Math.round(50 + (npsK + npsC) / 4),
    sentimentTrend: Math.round((Math.random() - 0.3) * 15),
  };
});

export const teamAvgNps = {
  klant: Math.round(consultantQualityData.reduce((s, c) => s + c.npsKlant, 0) / consultantQualityData.length),
  kandidaat: Math.round(consultantQualityData.reduce((s, c) => s + c.npsKandidaat, 0) / consultantQualityData.length),
  sentiment: Math.round(consultantQualityData.reduce((s, c) => s + c.sentimentScore, 0) / consultantQualityData.length),
};
