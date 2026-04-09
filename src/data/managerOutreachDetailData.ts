import { myTeamConsultants } from "./managerData";

// ─── Consultant Outreach Detail Data ───

export interface CallRecord {
  id: string;
  contactName: string;
  direction: "in" | "out";
  duration: number; // seconds
  date: string;
  outcome: "connected" | "voicemail" | "no-answer";
}

export interface OutreachDetailData {
  consultantId: number;
  recentCalls: CallRecord[];
  avgCallDuration: number; // seconds
  aiQualityExplanation: {
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
  };
  trendJustification: {
    callTrend: string;
    emailTrend: string;
  };
}

const contactNames = ["Peter Hendriks", "Sandra Mol", "Erik de Groot", "Marloes Kuiper", "Jan de Vries", "Maria van den Berg", "Thomas Visser", "Sophie de Jong", "Lars Mulder", "Anna Bakker"];

export const outreachDetailData: OutreachDetailData[] = myTeamConsultants.map((c, ci) => ({
  consultantId: c.id,
  recentCalls: Array.from({ length: 10 }, (_, i) => ({
    id: `CALL-${c.id}-${i}`,
    contactName: contactNames[(ci * 2 + i) % contactNames.length],
    direction: (i % 3 === 0 ? "in" : "out") as "in" | "out",
    duration: 60 + Math.floor(Math.random() * 420),
    date: `${7 - Math.floor(i / 2)} apr 2026`,
    outcome: (["connected", "voicemail", "no-answer"] as const)[i % 3],
  })),
  avgCallDuration: 180 + Math.floor(Math.random() * 120),
  aiQualityExplanation: {
    score: +(6.5 + Math.random() * 3).toFixed(1),
    summary: `${c.name} laat een ${Math.random() > 0.5 ? "consistent" : "wisselend"} gesprekspatroon zien met ${Math.random() > 0.5 ? "sterke" : "gemiddelde"} opbouw.`,
    strengths: [
      "Goed in het opbouwen van rapport",
      "Stelt gerichte vervolgvragen",
      Math.random() > 0.5 ? "Helder in pitch" : "Goede luisterhouding",
    ].slice(0, 2 + Math.floor(Math.random() * 2)),
    weaknesses: [
      "Kan beter doorvragen op bezwaren",
      Math.random() > 0.5 ? "Te snel naar afsluiting" : "Mist soms urgentie",
    ].slice(0, 1 + Math.floor(Math.random() * 2)),
  },
  trendJustification: {
    callTrend: Math.random() > 0.5
      ? "Stijging door focus op outbound acquisitie deze week"
      : "Daling door vakantiedag en minder inbound verkeer",
    emailTrend: Math.random() > 0.5
      ? "Meer e-mails door opvolgcampagne kandidaten"
      : "Lager volume door verschuiving naar telefonisch contact",
  },
}));
