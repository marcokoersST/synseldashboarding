// AI KPI Dashboard mock data
// Measures consultant usage of the 7-step AI workflow:
// Inschrijven → Transcript → CV → Matches → Contactpersonen → Voorstel Emails → Bellijst

import { allConsultantsList, type ConsultantInfo } from "./ranglijstenData";

export interface AIKpiRow {
  consultant: ConsultantInfo;
  // 1. Inschrijvingen
  inschrijvingenStarted: number;
  inschrijvingenApproved: number;
  // 2. Transcripts
  transcriptsGenerated: number;
  transcriptsApproved: number;
  // 3. CVs
  cvsGenerated: number;
  cvsApproved: number;
  // 4. AI matches (vacature) — voorgesteld door AI, goedgekeurd
  aiMatchesProposed: number;
  aiMatchesApproved: number;
  // 5. Handmatige matches – vacature
  manualVacancyMatches: number;
  // 6. Handmatige matches – bedrijf
  manualCompanyMatches: number;
  // 7. Contactpersonen
  contactsSelected: number;
  contactsApproved: number;
  // 8. Voorstel emails
  emailsPrepared: number;
  emailsSent: number;
  // 9. Bellijst
  callListItems: number;
  callsMade: number;
  callsConnectedPct: number; // 0-100
  followUpsScheduled: number;
}

function rng(seed: number, i: number): number {
  const x = Math.sin(seed + i * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function seedHash(year: number, mode: number, num: number): number {
  let h = (year * 31 + mode * 17 + num * 53) ^ 0x5f3759df;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = (h >> 16) ^ h;
  return Math.abs(h);
}

function pickApproval(seed: number, i: number, salt: number, lo = 0.6, hi = 0.95): number {
  return lo + rng(seed + salt, i) * (hi - lo);
}

export function getAIKpiData(year: number, mode: "week" | "periode", num: number): AIKpiRow[] {
  const modeNum = mode === "week" ? 0 : 1;
  const seed = seedHash(year, modeNum, num);
  const scale = mode === "periode" ? 4 : 1;

  return allConsultantsList.map((c, i) => {
    if (!c.isActive) {
      return {
        consultant: c,
        inschrijvingenStarted: 0,
        inschrijvingenApproved: 0,
        transcriptsGenerated: 0,
        transcriptsApproved: 0,
        cvsGenerated: 0,
        cvsApproved: 0,
        aiMatchesProposed: 0,
        aiMatchesApproved: 0,
        manualVacancyMatches: 0,
        manualCompanyMatches: 0,
        contactsSelected: 0,
        contactsApproved: 0,
        emailsPrepared: 0,
        emailsSent: 0,
        callListItems: 0,
        callsMade: 0,
        callsConnectedPct: 0,
        followUpsScheduled: 0,
      };
    }

    // Base ability factor 0.4 - 1.6 per consultant
    const ability = 0.4 + rng(seed, i) * 1.2;

    const inschrijvingenStarted = Math.max(0, Math.round((6 + rng(seed, i + 11) * 18) * ability * scale));
    const inschrijvingenApproved = Math.round(inschrijvingenStarted * pickApproval(seed, i, 100));

    const transcriptsGenerated = inschrijvingenApproved;
    const transcriptsApproved = Math.round(transcriptsGenerated * pickApproval(seed, i, 200, 0.5, 0.95));

    const cvsGenerated = transcriptsApproved;
    const cvsApproved = Math.round(cvsGenerated * pickApproval(seed, i, 300, 0.55, 0.95));

    const aiMatchesProposed = Math.round(cvsApproved * (1.5 + rng(seed, i + 22) * 2.5));
    const aiMatchesApproved = Math.round(aiMatchesProposed * pickApproval(seed, i, 400, 0.2, 0.7));

    const manualVacancyMatches = Math.round(cvsApproved * (0.2 + rng(seed, i + 33) * 0.8));
    const manualCompanyMatches = Math.round(cvsApproved * (0.1 + rng(seed, i + 44) * 0.5));

    const contactsSelected = Math.round((aiMatchesApproved + manualVacancyMatches + manualCompanyMatches) * (0.8 + rng(seed, i + 55) * 0.6));
    const contactsApproved = Math.round(contactsSelected * pickApproval(seed, i, 500, 0.6, 0.95));

    const emailsPrepared = contactsApproved;
    const emailsSent = Math.round(emailsPrepared * pickApproval(seed, i, 600, 0.4, 0.95));

    const callListItems = Math.round(emailsSent * (1.1 + rng(seed, i + 66) * 0.7));
    const callsMade = Math.round(callListItems * pickApproval(seed, i, 700, 0.3, 0.9));
    const callsConnectedPct = Math.round(35 + rng(seed, i + 77) * 50);
    const followUpsScheduled = Math.round(callsMade * (callsConnectedPct / 100) * (0.4 + rng(seed, i + 88) * 0.4));

    return {
      consultant: c,
      inschrijvingenStarted,
      inschrijvingenApproved,
      transcriptsGenerated,
      transcriptsApproved,
      cvsGenerated,
      cvsApproved,
      aiMatchesProposed,
      aiMatchesApproved,
      manualVacancyMatches,
      manualCompanyMatches,
      contactsSelected,
      contactsApproved,
      emailsPrepared,
      emailsSent,
      callListItems,
      callsMade,
      callsConnectedPct,
      followUpsScheduled,
    };
  });
}

export interface RiskFlag {
  text: string;
  severity: "high" | "medium" | "low";
}

export interface RiskProfile {
  consultant: ConsultantInfo;
  row: AIKpiRow;
  score: number; // 0-100, higher = more concerning
  flags: RiskFlag[];
}

function pct(n: number, d: number): number {
  return d > 0 ? (n / d) * 100 : 0;
}

export function getZorgelijkeConsultants(rows: AIKpiRow[], topN = 6): RiskProfile[] {
  const active = rows.filter(r => r.consultant.isActive && r.inschrijvingenStarted > 0);

  // Compute peer medians for ratio comparisons
  const median = (arr: number[]) => {
    const s = [...arr].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length === 0 ? 0 : (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2);
  };

  const medManualRatio = median(active.map(r => pct(r.manualVacancyMatches + r.manualCompanyMatches, Math.max(1, r.aiMatchesApproved + 1))));

  const profiles: RiskProfile[] = active.map(r => {
    const flags: RiskFlag[] = [];
    let score = 0;

    const transcriptApprovalPct = pct(r.transcriptsApproved, r.transcriptsGenerated);
    const cvApprovalPct = pct(r.cvsApproved, r.cvsGenerated);
    const emailSentPct = pct(r.emailsSent, r.emailsPrepared);
    const inschrijvingenApprovalPct = pct(r.inschrijvingenApproved, r.inschrijvingenStarted);
    const callsMadePct = pct(r.callsMade, r.callListItems);
    const aiApprovalPct = pct(r.aiMatchesApproved, r.aiMatchesProposed);
    const manualRatio = pct(r.manualVacancyMatches + r.manualCompanyMatches, Math.max(1, r.aiMatchesApproved + 1));

    if (transcriptApprovalPct < 60) {
      flags.push({ text: `Keurt ${Math.round(100 - transcriptApprovalPct)}% van AI-transcripts af`, severity: "high" });
      score += 25;
    }
    if (cvApprovalPct < 60) {
      flags.push({ text: `CV-goedkeuring slechts ${Math.round(cvApprovalPct)}%`, severity: "medium" });
      score += 15;
    }
    if (emailSentPct < 50 && r.emailsPrepared > 5) {
      flags.push({ text: `${r.emailsPrepared - r.emailsSent} voorstel-emails onverzonden`, severity: "high" });
      score += 20;
    }
    if (inschrijvingenApprovalPct < 70 && r.inschrijvingenStarted > 5) {
      flags.push({ text: `${r.inschrijvingenStarted - r.inschrijvingenApproved} inschrijvingen niet afgemaakt`, severity: "medium" });
      score += 12;
    }
    if (callsMadePct < 50 && r.callListItems > 3) {
      flags.push({ text: `Bellijst ${Math.round(100 - callsMadePct)}% niet afgewerkt`, severity: "high" });
      score += 18;
    }
    if (aiApprovalPct < 25 && r.aiMatchesProposed > 5) {
      flags.push({ text: `Slechts ${Math.round(aiApprovalPct)}% AI-matches goedgekeurd`, severity: "medium" });
      score += 14;
    }
    if (manualRatio > medManualRatio * 2 && (r.manualVacancyMatches + r.manualCompanyMatches) > 3) {
      flags.push({ text: `${Math.round(manualRatio / Math.max(1, medManualRatio))}× meer handmatige matches dan peer-mediaan`, severity: "low" });
      score += 8;
    }
    if (r.callsConnectedPct < 40) {
      flags.push({ text: `Lage doorkom-ratio (${r.callsConnectedPct}%)`, severity: "low" });
      score += 6;
    }

    return { consultant: r.consultant, row: r, score, flags };
  });

  return profiles
    .filter(p => p.flags.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

// Trend over 6 weeks (simulated) for drill-down sparklines
export function getConsultantTrend(consultantName: string, year: number): { week: string; value: number }[][] {
  const seed = seedHash(year, 0, 0) + consultantName.length;
  // Returns [transcriptApprovalSeries, callsMadeSeries] — generic 6-point trends
  const a = Array.from({ length: 6 }, (_, i) => ({
    week: `W${i + 1}`,
    value: Math.round(40 + rng(seed, i) * 50),
  }));
  const b = Array.from({ length: 6 }, (_, i) => ({
    week: `W${i + 1}`,
    value: Math.round(30 + rng(seed + 1, i) * 60),
  }));
  return [a, b];
}
