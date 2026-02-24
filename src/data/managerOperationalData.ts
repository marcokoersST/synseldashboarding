import { myTeamConsultants } from "./managerData";

// ─── Sales Funnel ───

export interface ConsultantFunnelData {
  consultantId: number;
  consultantName: string;
  unit: string;
  toegewezen: number;
  inschrijvingen: number;
  intakes: number;
  acquisities: number;
  uitnodiging: number;
  gesprekken: number;
  vervolg: number;
  plaatsingen: number;
}

const funnelBase = [
  { toegewezen: 120, inschrijvingen: 65, intakes: 58, acquisities: 51, uitnodiging: 32, gesprekken: 23, vervolg: 11, plaatsingen: 5 },
  { toegewezen: 98, inschrijvingen: 52, intakes: 45, acquisities: 40, uitnodiging: 26, gesprekken: 18, vervolg: 8, plaatsingen: 4 },
  { toegewezen: 85, inschrijvingen: 48, intakes: 42, acquisities: 38, uitnodiging: 24, gesprekken: 17, vervolg: 9, plaatsingen: 4 },
  { toegewezen: 110, inschrijvingen: 60, intakes: 54, acquisities: 48, uitnodiging: 30, gesprekken: 22, vervolg: 10, plaatsingen: 5 },
  { toegewezen: 72, inschrijvingen: 38, intakes: 33, acquisities: 29, uitnodiging: 18, gesprekken: 13, vervolg: 5, plaatsingen: 2 },
  { toegewezen: 55, inschrijvingen: 28, intakes: 24, acquisities: 20, uitnodiging: 12, gesprekken: 8, vervolg: 3, plaatsingen: 1 },
];

export const consultantFunnelData: ConsultantFunnelData[] = myTeamConsultants.map((c, i) => ({
  consultantId: c.id,
  consultantName: c.name,
  unit: c.unit,
  ...funnelBase[i % funnelBase.length],
}));

export const unitFunnelTotals = consultantFunnelData.reduce(
  (acc, c) => ({
    toegewezen: acc.toegewezen + c.toegewezen,
    inschrijvingen: acc.inschrijvingen + c.inschrijvingen,
    intakes: acc.intakes + c.intakes,
    acquisities: acc.acquisities + c.acquisities,
    uitnodiging: acc.uitnodiging + c.uitnodiging,
    gesprekken: acc.gesprekken + c.gesprekken,
    vervolg: acc.vervolg + c.vervolg,
    plaatsingen: acc.plaatsingen + c.plaatsingen,
  }),
  { toegewezen: 0, inschrijvingen: 0, intakes: 0, acquisities: 0, uitnodiging: 0, gesprekken: 0, vervolg: 0, plaatsingen: 0 }
);

// ─── Opvolging (Deal Stages) ───

export interface DealRecord {
  id: string;
  consultantName: string;
  candidateName: string;
  dealStage: string;
  dealStageLabel: string;
  lastModified: Date;
}

export const dealStages = [
  { code: "2.3", label: "Lopende zaak" },
  { code: "3.0", label: "1e gesprek nog inplannen" },
  { code: "3.1", label: "1e sollicitatiegesprek" },
  { code: "3.2", label: "Inplannen vervolggesprek" },
  { code: "3.3", label: "Vervolggesprek" },
  { code: "3.4", label: "Dealsluiter" },
] as const;

const candidateNames = [
  "Jan de Vries", "Maria van den Berg", "Pieter Jansen", "Anna Bakker",
  "Thomas Visser", "Sophie de Jong", "Lars Mulder", "Emma Bos",
  "Daan Smit", "Lisa van Dijk", "Ruben Meijer", "Eva de Graaf",
  "Luuk Peters", "Julia Hendriks", "Tim van Leeuwen", "Sara Dekker",
  "Bram Vermeer", "Nina van den Broek", "Jesse Kok", "Femke de Boer",
  "Max Kuiper", "Floor Bosman", "Sven de Wit", "Roos Janssen",
];

const consultantNames = myTeamConsultants.map(c => c.name);
const consultantUnits = Object.fromEntries(myTeamConsultants.map(c => [c.name, c.unit]));

export const dealRecords: DealRecord[] = Array.from({ length: 36 }, (_, i) => {
  const stage = dealStages[i % dealStages.length];
  const daysAgo = Math.floor(Math.random() * 14) + 1;
  const consultantName = consultantNames[i % consultantNames.length];
  return {
    id: `DEAL-${1000 + i}`,
    consultantName,
    unit: consultantUnits[consultantName] || "Engineering",
    candidateName: candidateNames[i % candidateNames.length],
    dealStage: stage.code,
    dealStageLabel: stage.label,
    lastModified: new Date(Date.now() - daysAgo * 86400000),
  };
});

export const dealStageCounts = dealStages.map(stage => ({
  ...stage,
  count: dealRecords.filter(r => r.dealStage === stage.code).length,
}));

// ─── Calls ───

export interface ConsultantCallData {
  consultantId: number;
  consultantName: string;
  inbound: number;
  outbound: number;
  totalMinutes: number;
  qualityScore: number;
  missed: number;
  contactStatus: {
    warmRelation: number;
    preferredCP: number;
    newContact: number;
  };
}

export const consultantCallData: ConsultantCallData[] = myTeamConsultants.map((c, i) => ({
  consultantId: c.id,
  consultantName: c.name,
  inbound: 35 + Math.floor(Math.random() * 30),
  outbound: 60 + Math.floor(Math.random() * 50),
  totalMinutes: 180 + Math.floor(Math.random() * 200),
  qualityScore: 6.5 + Math.round(Math.random() * 30) / 10,
  missed: 3 + Math.floor(Math.random() * 12),
  contactStatus: {
    warmRelation: 10 + Math.floor(Math.random() * 25),
    preferredCP: 15 + Math.floor(Math.random() * 30),
    newContact: 12 + Math.floor(Math.random() * 25),
  },
}));

export const unitCallTotals = {
  inbound: consultantCallData.reduce((s, c) => s + c.inbound, 0),
  outbound: consultantCallData.reduce((s, c) => s + c.outbound, 0),
  totalMinutes: consultantCallData.reduce((s, c) => s + c.totalMinutes, 0),
  qualityScore: +(consultantCallData.reduce((s, c) => s + c.qualityScore, 0) / consultantCallData.length).toFixed(1),
};
