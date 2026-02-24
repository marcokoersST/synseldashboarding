import { myTeamConsultants } from "./managerData";

// ─── Kernvaardigheden ───

export interface ConsultantSkillData {
  consultantId: number;
  consultantName: string;
  unit: string;
  relatieScoreKlant: number;      // 0-10
  relatieScoreKandidaat: number;   // 0-10
  pitchingPower: number;           // 0-100
  responsiveness: number;          // 0-100
  networking: number;              // 0-100
  bezwaarverlegging: number;       // 0-100
  procedureInschrijving: number;   // 0-100
  procedureAcquisities: number;    // 0-100
  npsKlant: number;                // -100 to 100
  npsKandidaat: number;            // -100 to 100
  systeemHygiene: {
    vacaturesAdded: number;
    vacaturesClosed: number;
    vacaturesEdited: number;
    klantenReopened: number;
    klantenNew: number;
    klantenLost: number;
    contactenAdded: number;
    contactenEdited: number;
    contactenLost: number;
  };
  systeemHygieneScore: number;     // 0-100
}

const skillsBase: Omit<ConsultantSkillData, "consultantId" | "consultantName">[] = [
  {
    relatieScoreKlant: 8.2, relatieScoreKandidaat: 7.8, pitchingPower: 85, responsiveness: 92, networking: 78, bezwaarverlegging: 80,
    procedureInschrijving: 88, procedureAcquisities: 82, npsKlant: 62, npsKandidaat: 55,
    systeemHygiene: { vacaturesAdded: 12, vacaturesClosed: 8, vacaturesEdited: 15, klantenReopened: 2, klantenNew: 5, klantenLost: 1, contactenAdded: 18, contactenEdited: 22, contactenLost: 3 },
    systeemHygieneScore: 84,
  },
  {
    relatieScoreKlant: 7.5, relatieScoreKandidaat: 8.1, pitchingPower: 72, responsiveness: 85, networking: 68, bezwaarverlegging: 65,
    procedureInschrijving: 75, procedureAcquisities: 78, npsKlant: 48, npsKandidaat: 60,
    systeemHygiene: { vacaturesAdded: 10, vacaturesClosed: 6, vacaturesEdited: 12, klantenReopened: 1, klantenNew: 4, klantenLost: 2, contactenAdded: 14, contactenEdited: 18, contactenLost: 4 },
    systeemHygieneScore: 72,
  },
  {
    relatieScoreKlant: 8.8, relatieScoreKandidaat: 8.5, pitchingPower: 90, responsiveness: 88, networking: 85, bezwaarverlegging: 88,
    procedureInschrijving: 92, procedureAcquisities: 88, npsKlant: 70, npsKandidaat: 68,
    systeemHygiene: { vacaturesAdded: 15, vacaturesClosed: 11, vacaturesEdited: 20, klantenReopened: 3, klantenNew: 7, klantenLost: 0, contactenAdded: 24, contactenEdited: 28, contactenLost: 1 },
    systeemHygieneScore: 92,
  },
  {
    relatieScoreKlant: 6.8, relatieScoreKandidaat: 7.2, pitchingPower: 65, responsiveness: 78, networking: 60, bezwaarverlegging: 55,
    procedureInschrijving: 70, procedureAcquisities: 68, npsKlant: 35, npsKandidaat: 42,
    systeemHygiene: { vacaturesAdded: 8, vacaturesClosed: 4, vacaturesEdited: 9, klantenReopened: 1, klantenNew: 3, klantenLost: 3, contactenAdded: 10, contactenEdited: 12, contactenLost: 5 },
    systeemHygieneScore: 58,
  },
  {
    relatieScoreKlant: 5.5, relatieScoreKandidaat: 6.0, pitchingPower: 48, responsiveness: 62, networking: 45, bezwaarverlegging: 38,
    procedureInschrijving: 55, procedureAcquisities: 50, npsKlant: 20, npsKandidaat: 28,
    systeemHygiene: { vacaturesAdded: 5, vacaturesClosed: 2, vacaturesEdited: 6, klantenReopened: 0, klantenNew: 2, klantenLost: 2, contactenAdded: 7, contactenEdited: 8, contactenLost: 6 },
    systeemHygieneScore: 42,
  },
  {
    relatieScoreKlant: 7.0, relatieScoreKandidaat: 6.5, pitchingPower: 58, responsiveness: 70, networking: 52, bezwaarverlegging: 48,
    procedureInschrijving: 62, procedureAcquisities: 60, npsKlant: 30, npsKandidaat: 35,
    systeemHygiene: { vacaturesAdded: 6, vacaturesClosed: 3, vacaturesEdited: 8, klantenReopened: 1, klantenNew: 2, klantenLost: 2, contactenAdded: 9, contactenEdited: 10, contactenLost: 4 },
    systeemHygieneScore: 52,
  },
];

export const consultantSkillData: ConsultantSkillData[] = myTeamConsultants.map((c, i) => ({
  consultantId: c.id,
  consultantName: c.name,
  unit: c.unit,
  ...skillsBase[i % skillsBase.length],
}));

// ─── Doelen ───

export interface ManagerGoal {
  id: number;
  consultantId: number;
  consultantName: string;
  text: string;
  completed: boolean;
  isManagerGoal: boolean;
}

let goalIdCounter = 1;

export const managerGoalsData: ManagerGoal[] = myTeamConsultants.flatMap((c) => [
  { id: goalIdCounter++, consultantId: c.id, consultantName: c.name, text: "Acquisitiegesprekken zelfstandig uitvoeren", completed: Math.random() > 0.6, isManagerGoal: false },
  { id: goalIdCounter++, consultantId: c.id, consultantName: c.name, text: "Netwerk uitbreiden via branche-events", completed: Math.random() > 0.7, isManagerGoal: false },
  { id: goalIdCounter++, consultantId: c.id, consultantName: c.name, text: "Kwaliteitsscore AI-coach ≥ 8.0 dit kwartaal", completed: false, isManagerGoal: true },
  { id: goalIdCounter++, consultantId: c.id, consultantName: c.name, text: "Proactief kennis delen met junior collega's", completed: Math.random() > 0.5, isManagerGoal: true },
]);

// ─── Revenue Chart ───

export interface ManagerRevenueDataPoint {
  period: string;
  realised: number;
  potential: number;
  target: number;
}

export const managerRevenueChartData: ManagerRevenueDataPoint[] = [
  { period: "P1", realised: 180, potential: 210, target: 200 },
  { period: "P2", realised: 195, potential: 230, target: 220 },
  { period: "P3", realised: 210, potential: 250, target: 240 },
  { period: "P4", realised: 240, potential: 275, target: 260 },
  { period: "P5", realised: 260, potential: 300, target: 280 },
  { period: "P6", realised: 285, potential: 330, target: 300 },
  { period: "P7", realised: 310, potential: 360, target: 320 },
  { period: "P8", realised: 330, potential: 385, target: 340 },
  { period: "P9", realised: 355, potential: 410, target: 360 },
  { period: "P10", realised: 375, potential: 435, target: 380 },
  { period: "P11", realised: 400, potential: 460, target: 400 },
  { period: "P12", realised: 420, potential: 485, target: 420 },
  { period: "P13", realised: 445, potential: 510, target: 440 },
];

export interface ConsultantRevenueDataPoint {
  period: string;
  [consultantName: string]: number | string;
}

const consultantColors = [
  "hsl(175, 60%, 45%)",  // teal
  "hsl(45, 30%, 55%)",   // gold
  "#ec4899",             // pink
  "#8b5cf6",             // purple
  "#f59e0b",             // amber
  "#06b6d4",             // cyan
];

export { consultantColors };

export const consultantRevenueData: ConsultantRevenueDataPoint[] = Array.from({ length: 13 }, (_, i) => {
  const point: ConsultantRevenueDataPoint = { period: `P${i + 1}` };
  myTeamConsultants.forEach((c, j) => {
    const base = (c.revenue / 13000) * (i + 1);
    const variation = 0.9 + Math.random() * 0.2;
    point[c.name] = Math.round(base * variation);
  });
  return point;
});
