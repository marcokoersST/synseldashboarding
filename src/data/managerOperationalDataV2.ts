import { myTeamConsultants } from "./managerData";

// ─── Corrected Funnel Order ───
// Toegewezen → Inschrijving → Acquisitie → Intake → Uitnodiging → Gesprek → Vervolggesprek → Plaatsing

export const funnelStepsV2 = [
  { key: "toegewezen", label: "Toegewezen" },
  { key: "inschrijvingen", label: "Inschrijvingen" },
  { key: "acquisities", label: "Acquisities" },
  { key: "intakes", label: "Intakes" },
  { key: "uitnodiging", label: "Uitnodigingen" },
  { key: "gesprekken", label: "Gesprekken" },
  { key: "vervolg", label: "Vervolggesprek" },
  { key: "plaatsingen", label: "Plaatsingen" },
] as const;

export type FunnelStepKey = typeof funnelStepsV2[number]["key"];

export interface ConsultantFunnelDataV2 {
  consultantId: number;
  consultantName: string;
  unit: string;
  toegewezen: number;
  inschrijvingen: number;
  acquisities: number;
  intakes: number;
  uitnodiging: number;
  gesprekken: number;
  vervolg: number;
  plaatsingen: number;
  // Previous period for trend comparison
  prevToegewezen: number;
  prevInschrijvingen: number;
  prevAcquisities: number;
  prevIntakes: number;
  prevUitnodiging: number;
  prevGesprekken: number;
  prevVervolg: number;
  prevPlaatsingen: number;
}

const funnelBase = [
  { toegewezen: 120, inschrijvingen: 65, acquisities: 51, intakes: 44, uitnodiging: 32, gesprekken: 23, vervolg: 11, plaatsingen: 5,
    prevToegewezen: 115, prevInschrijvingen: 62, prevAcquisities: 50, prevIntakes: 45, prevUitnodiging: 34, prevGesprekken: 25, prevVervolg: 12, prevPlaatsingen: 6 },
  { toegewezen: 98, inschrijvingen: 52, acquisities: 40, intakes: 32, uitnodiging: 26, gesprekken: 18, vervolg: 8, plaatsingen: 4,
    prevToegewezen: 102, prevInschrijvingen: 55, prevAcquisities: 44, prevIntakes: 36, prevUitnodiging: 28, prevGesprekken: 20, prevVervolg: 9, prevPlaatsingen: 4 },
  { toegewezen: 85, inschrijvingen: 48, acquisities: 38, intakes: 34, uitnodiging: 24, gesprekken: 17, vervolg: 9, plaatsingen: 4,
    prevToegewezen: 90, prevInschrijvingen: 50, prevAcquisities: 42, prevIntakes: 38, prevUitnodiging: 28, prevGesprekken: 20, prevVervolg: 10, prevPlaatsingen: 5 },
  { toegewezen: 110, inschrijvingen: 60, acquisities: 48, intakes: 40, uitnodiging: 30, gesprekken: 22, vervolg: 10, plaatsingen: 5,
    prevToegewezen: 108, prevInschrijvingen: 58, prevAcquisities: 46, prevIntakes: 39, prevUitnodiging: 29, prevGesprekken: 21, prevVervolg: 10, prevPlaatsingen: 5 },
  { toegewezen: 72, inschrijvingen: 38, acquisities: 29, intakes: 18, uitnodiging: 18, gesprekken: 13, vervolg: 5, plaatsingen: 2,
    prevToegewezen: 80, prevInschrijvingen: 42, prevAcquisities: 35, prevIntakes: 25, prevUitnodiging: 22, prevGesprekken: 16, prevVervolg: 7, prevPlaatsingen: 3 },
  { toegewezen: 55, inschrijvingen: 28, acquisities: 20, intakes: 12, uitnodiging: 12, gesprekken: 8, vervolg: 3, plaatsingen: 1,
    prevToegewezen: 60, prevInschrijvingen: 32, prevAcquisities: 24, prevIntakes: 16, prevUitnodiging: 14, prevGesprekken: 10, prevVervolg: 4, prevPlaatsingen: 2 },
];

export const consultantFunnelDataV2: ConsultantFunnelDataV2[] = myTeamConsultants.map((c, i) => ({
  consultantId: c.id,
  consultantName: c.name,
  unit: c.unit,
  ...funnelBase[i % funnelBase.length],
}));

export const unitFunnelTotalsV2 = consultantFunnelDataV2.reduce(
  (acc, c) => {
    const keys: FunnelStepKey[] = ["toegewezen", "inschrijvingen", "acquisities", "intakes", "uitnodiging", "gesprekken", "vervolg", "plaatsingen"];
    keys.forEach(k => { acc[k] = (acc[k] || 0) + c[k]; });
    return acc;
  },
  {} as Record<FunnelStepKey, number>
);

// Conversion helper — each step converts from the previous step
export function getConversionV2(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round((current / previous) * 100);
}

// ─── Email / Outreach Data ───

export interface ConsultantOutreachData {
  consultantId: number;
  consultantName: string;
  unit: string;
  callsIn: number;
  callsOut: number;
  totalMinutes: number;
  qualityScore: number;
  missed: number;
  emailsSent: number;
  emailsReceived: number;
  totalOutreach: number;
  callTrend: number; // % change vs prev period
  emailTrend: number;
}

export const consultantOutreachData: ConsultantOutreachData[] = myTeamConsultants.map((c, i) => {
  const callsIn = 35 + Math.floor(Math.random() * 30);
  const callsOut = 60 + Math.floor(Math.random() * 50);
  const emailsSent = 40 + Math.floor(Math.random() * 60);
  const emailsReceived = 20 + Math.floor(Math.random() * 30);
  return {
    consultantId: c.id,
    consultantName: c.name,
    unit: c.unit,
    callsIn,
    callsOut,
    totalMinutes: 180 + Math.floor(Math.random() * 200),
    qualityScore: +(6.5 + Math.round(Math.random() * 30) / 10).toFixed(1),
    missed: 3 + Math.floor(Math.random() * 12),
    emailsSent,
    emailsReceived,
    totalOutreach: callsIn + callsOut + emailsSent,
    callTrend: Math.round((Math.random() - 0.4) * 30),
    emailTrend: Math.round((Math.random() - 0.4) * 25),
  };
});

export const unitOutreachTotals = {
  callsIn: consultantOutreachData.reduce((s, c) => s + c.callsIn, 0),
  callsOut: consultantOutreachData.reduce((s, c) => s + c.callsOut, 0),
  totalMinutes: consultantOutreachData.reduce((s, c) => s + c.totalMinutes, 0),
  qualityScore: +(consultantOutreachData.reduce((s, c) => s + c.qualityScore, 0) / consultantOutreachData.length).toFixed(1),
  emailsSent: consultantOutreachData.reduce((s, c) => s + c.emailsSent, 0),
  emailsReceived: consultantOutreachData.reduce((s, c) => s + c.emailsReceived, 0),
  totalOutreach: consultantOutreachData.reduce((s, c) => s + c.totalOutreach, 0),
};

// ─── Auto-generated Alerts ───

export interface DashboardAlert {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  consultantName?: string;
  consultantAvatar?: string;
  metric?: string;
  value?: string;
}

export function generateAlerts(): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  const c = myTeamConsultants;

  // Check funnel conversions
  consultantFunnelDataV2.forEach(cf => {
    const intakeConv = cf.acquisities > 0 ? Math.round((cf.intakes / cf.acquisities) * 100) : 0;
    if (intakeConv < 65) {
      alerts.push({
        id: `funnel-intake-${cf.consultantId}`,
        severity: intakeConv < 50 ? "critical" : "warning",
        title: `Lage conversie acquisitie → intake`,
        message: `${cf.consultantName} converteert slechts ${intakeConv}% van acquisities naar intakes.`,
        consultantName: cf.consultantName,
        consultantAvatar: c.find(x => x.id === cf.consultantId)?.avatar,
        metric: "Acquisitie → Intake",
        value: `${intakeConv}%`,
      });
    }
    const gesprekConv = cf.uitnodiging > 0 ? Math.round((cf.gesprekken / cf.uitnodiging) * 100) : 0;
    if (gesprekConv < 60) {
      alerts.push({
        id: `funnel-gesprek-${cf.consultantId}`,
        severity: "warning",
        title: `Lage conversie uitnodiging → gesprek`,
        message: `${cf.consultantName}: ${gesprekConv}% conversie van uitnodiging naar gesprek.`,
        consultantName: cf.consultantName,
        consultantAvatar: c.find(x => x.id === cf.consultantId)?.avatar,
        metric: "Uitnodiging → Gesprek",
        value: `${gesprekConv}%`,
      });
    }
  });

  // Check declining trends (prev vs current)
  consultantFunnelDataV2.forEach(cf => {
    const currentPlaatsingen = cf.plaatsingen;
    const prevPlaatsingen = cf.prevPlaatsingen;
    if (prevPlaatsingen > 0 && currentPlaatsingen < prevPlaatsingen) {
      const drop = Math.round(((prevPlaatsingen - currentPlaatsingen) / prevPlaatsingen) * 100);
      if (drop >= 30) {
        alerts.push({
          id: `decline-${cf.consultantId}`,
          severity: "critical",
          title: `Sterke daling plaatsingen`,
          message: `${cf.consultantName} daalt ${drop}% in plaatsingen t.o.v. vorige periode.`,
          consultantName: cf.consultantName,
          consultantAvatar: c.find(x => x.id === cf.consultantId)?.avatar,
          metric: "Plaatsingen",
          value: `${currentPlaatsingen} (was ${prevPlaatsingen})`,
        });
      }
    }
  });

  // Check low outreach
  const avgOutreach = consultantOutreachData.reduce((s, c) => s + c.totalOutreach, 0) / consultantOutreachData.length;
  consultantOutreachData.forEach(co => {
    if (co.totalOutreach < avgOutreach * 0.6) {
      alerts.push({
        id: `outreach-low-${co.consultantId}`,
        severity: "warning",
        title: `Lage contactactiviteit`,
        message: `${co.consultantName} heeft ${co.totalOutreach} contactmomenten — ver onder teamgemiddelde (${Math.round(avgOutreach)}).`,
        consultantName: co.consultantName,
        consultantAvatar: c.find(x => x.id === co.consultantId)?.avatar,
        metric: "Totaal outreach",
        value: `${co.totalOutreach}`,
      });
    }
  });

  // Check low quality scores
  consultantOutreachData.forEach(co => {
    if (co.qualityScore < 7.0) {
      alerts.push({
        id: `quality-${co.consultantId}`,
        severity: co.qualityScore < 6.5 ? "critical" : "warning",
        title: `Lage kwaliteitsscore gesprekken`,
        message: `${co.consultantName} scoort ${co.qualityScore} — plan een coaching gesprek in.`,
        consultantName: co.consultantName,
        consultantAvatar: c.find(x => x.id === co.consultantId)?.avatar,
        metric: "Kwaliteitsscore",
        value: `${co.qualityScore}`,
      });
    }
  });

  // Sort by severity
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
