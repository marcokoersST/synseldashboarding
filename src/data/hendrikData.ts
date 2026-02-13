// Mock data for Dashboards Hendrik

// ── Shared consultant names ──
export const consultants = [
  "Sophie de Vries",
  "Bram Jansen",
  "Lisa van Dijk",
  "Thomas Bakker",
  "Emma Visser",
  "Daan de Boer",
  "Fleur Mulder",
  "Niels de Groot",
  "Anna Smit",
  "Mark Peters",
];

// ── 1. Kwaliteitsoverzicht ──
export const qualityOverview = {
  overallScore: 7.2,
  complaintsThisPeriod: 8,
  avgPersonalization: 62,
  dmuErrorRate: 14,
  trend: [
    { period: "P8", score: 6.5 },
    { period: "P9", score: 6.8 },
    { period: "P10", score: 7.0 },
    { period: "P11", score: 6.9 },
    { period: "P12", score: 7.1 },
    { period: "P13", score: 7.2 },
  ],
  consultantRisk: [
    { name: "Sophie de Vries", score: 8.4, risk: "green" as const, complaints: 0, dmuErrors: 2 },
    { name: "Thomas Bakker", score: 7.8, risk: "green" as const, complaints: 1, dmuErrors: 3 },
    { name: "Emma Visser", score: 7.5, risk: "green" as const, complaints: 1, dmuErrors: 4 },
    { name: "Anna Smit", score: 7.1, risk: "green" as const, complaints: 1, dmuErrors: 5 },
    { name: "Fleur Mulder", score: 6.8, risk: "orange" as const, complaints: 2, dmuErrors: 6 },
    { name: "Niels de Groot", score: 6.5, risk: "orange" as const, complaints: 2, dmuErrors: 7 },
    { name: "Mark Peters", score: 6.2, risk: "orange" as const, complaints: 3, dmuErrors: 8 },
    { name: "Daan de Boer", score: 5.5, risk: "red" as const, complaints: 4, dmuErrors: 12 },
    { name: "Bram Jansen", score: 5.1, risk: "red" as const, complaints: 5, dmuErrors: 14 },
    { name: "Lisa van Dijk", score: 4.8, risk: "red" as const, complaints: 6, dmuErrors: 16 },
  ],
};

// ── 2. Mail & Voorstellen ──
export const mailData = {
  perConsultant: consultants.map((name, i) => ({
    name,
    mailsSent: 120 + i * 30,
    rejectionRate: 8 + i * 3,
    personalization: 80 - i * 5,
  })),
  weeklyVolume: [
    { week: "W1", mails: 245 },
    { week: "W2", mails: 312 },
    { week: "W3", mails: 289 },
    { week: "W4", mails: 378 },
    { week: "W5", mails: 345 },
    { week: "W6", mails: 402 },
    { week: "W7", mails: 368 },
    { week: "W8", mails: 421 },
  ],
};

// ── 3. DMU/CP Correctheid ──
export const dmuData = {
  correct: 312,
  incorrect: 48,
  trendPerPeriod: [
    { period: "P8", pct: 82 },
    { period: "P9", pct: 84 },
    { period: "P10", pct: 85 },
    { period: "P11", pct: 83 },
    { period: "P12", pct: 87 },
    { period: "P13", pct: 87 },
  ],
  recentErrors: [
    { consultant: "Bram Jansen", client: "TechCorp BV", expectedCP: "Jan de Boer (CEO)", selectedCP: "Karin Smit (HR Stagiaire)" },
    { consultant: "Lisa van Dijk", client: "BuildRight NV", expectedCP: "Pieter Groot (Operations Dir.)", selectedCP: "Anna Vos (Receptie)" },
    { consultant: "Daan de Boer", client: "MediCare Plus", expectedCP: "Dr. van Houten (Hoofd Inkoop)", selectedCP: "Sanne de Wit (Marketing Asst.)" },
    { consultant: "Mark Peters", client: "LogiFlow BV", expectedCP: "Robert Kamp (Facility Mgr.)", selectedCP: "Tom Hendriks (IT Support)" },
    { consultant: "Bram Jansen", client: "GreenEnergy NL", expectedCP: "Linda Bakker (HR Director)", selectedCP: "Niels Post (Stagiair)" },
  ],
};

// ── 4. Conversie Funnel ──
export const funnelSteps = [
  { label: "Inschrijvingen", value: 1240 },
  { label: "Acquisities", value: 680 },
  { label: "Voorstellen", value: 420 },
  { label: "Uitnodigingen", value: 185 },
  { label: "Gesprekken", value: 92 },
];

export const funnelPerConsultant = consultants.map((name, i) => ({
  name,
  inschrijvingen: 100 + i * 15,
  acquisities: 55 + i * 8,
  voorstellen: 35 + i * 5,
  uitnodigingen: 15 + i * 2,
  gesprekken: 7 + i,
}));

// ── 5. Klacht & Risico ──
export const complaintData = {
  perConsultant: [
    { name: "Lisa van Dijk", negativeReactions: 12, complaints: 6, rejections: 45, riskScore: 9.2 },
    { name: "Bram Jansen", negativeReactions: 10, complaints: 5, rejections: 38, riskScore: 8.5 },
    { name: "Daan de Boer", negativeReactions: 8, complaints: 4, rejections: 32, riskScore: 7.8 },
    { name: "Mark Peters", negativeReactions: 6, complaints: 3, rejections: 28, riskScore: 6.5 },
    { name: "Niels de Groot", negativeReactions: 5, complaints: 2, rejections: 22, riskScore: 5.8 },
    { name: "Fleur Mulder", negativeReactions: 4, complaints: 2, rejections: 18, riskScore: 5.2 },
    { name: "Anna Smit", negativeReactions: 3, complaints: 1, rejections: 14, riskScore: 4.1 },
    { name: "Emma Visser", negativeReactions: 2, complaints: 1, rejections: 10, riskScore: 3.2 },
    { name: "Thomas Bakker", negativeReactions: 1, complaints: 1, rejections: 8, riskScore: 2.5 },
    { name: "Sophie de Vries", negativeReactions: 0, complaints: 0, rejections: 5, riskScore: 1.0 },
  ],
  recentComplaints: [
    { date: "2026-02-11", consultant: "Lisa van Dijk", client: "TechCorp BV", description: "Kandidaat volledig verkeerd profiel, brandmeldmonteur voorgesteld voor machinebouw-rol." },
    { date: "2026-02-10", consultant: "Bram Jansen", client: "BuildRight NV", description: "Herhaaldelijk contact ondanks 'geen contact' notitie in CRM." },
    { date: "2026-02-09", consultant: "Daan de Boer", client: "MediCare Plus", description: "Voorstelmail niet gepersonaliseerd, generieke template gestuurd naar senior hiring manager." },
    { date: "2026-02-08", consultant: "Mark Peters", client: "LogiFlow BV", description: "Terugbelafspraak niet nagekomen, klant moest zelf weer bellen." },
  ],
};

// ── 6. Opvolging & Hygiene ──
export const followUpData = {
  callbackFollowUp: { kept: 82, missed: 18 },
  intakeStatus: { completed: 45, pending: 12, overdue: 5 },
  noteReading: consultants.map((name, i) => ({
    name,
    avgReadTime: 8 + i * 3, // seconds
    avgScrollDepth: 90 - i * 7, // percentage
  })),
  appointmentFollowUp: [
    { consultant: "Sophie de Vries", type: "Terugmail", afspraak: "CV aanleveren na intake", deadline: "2026-02-10", status: "done" as const, mailVerstuurd: true, afspraakNagekomen: true, nagebeldAcquisitie: true },
    { consultant: "Bram Jansen", type: "Acquisitie", afspraak: "Referenties opvragen", deadline: "2026-02-09", status: "overdue" as const, mailVerstuurd: false, afspraakNagekomen: false, nagebeldAcquisitie: false },
    { consultant: "Lisa van Dijk", type: "Intake opvolging", afspraak: "Beschikbaarheid bevestigen", deadline: "2026-02-11", status: "done" as const, mailVerstuurd: true, afspraakNagekomen: true, nagebeldAcquisitie: true },
    { consultant: "Thomas Bakker", type: "Inschrijving", afspraak: "Certificaten uploaden", deadline: "2026-02-12", status: "pending" as const, mailVerstuurd: true, afspraakNagekomen: false, nagebeldAcquisitie: false },
    { consultant: "Emma Visser", type: "Acquisitie", afspraak: "Salarisvoorstel doorsturen", deadline: "2026-02-08", status: "overdue" as const, mailVerstuurd: false, afspraakNagekomen: false, nagebeldAcquisitie: false },
    { consultant: "Daan de Boer", type: "Intake opvolging", afspraak: "Contract tekenen", deadline: "2026-02-13", status: "pending" as const, mailVerstuurd: true, afspraakNagekomen: false, nagebeldAcquisitie: true },
    { consultant: "Fleur Mulder", type: "Inschrijving", afspraak: "Portfolio aanleveren", deadline: "2026-02-07", status: "done" as const, mailVerstuurd: true, afspraakNagekomen: true, nagebeldAcquisitie: true },
    { consultant: "Niels de Groot", type: "Acquisitie", afspraak: "Feedback gesprek delen", deadline: "2026-02-06", status: "overdue" as const, mailVerstuurd: false, afspraakNagekomen: false, nagebeldAcquisitie: false },
    { consultant: "Anna Smit", type: "Intake opvolging", afspraak: "Startdatum bevestigen", deadline: "2026-02-14", status: "pending" as const, mailVerstuurd: true, afspraakNagekomen: false, nagebeldAcquisitie: true },
    { consultant: "Mark Peters", type: "Inschrijving", afspraak: "Motivatiebrief nazenden", deadline: "2026-02-11", status: "done" as const, mailVerstuurd: true, afspraakNagekomen: true, nagebeldAcquisitie: true },
  ],
  systemHygiene: consultants.map((name, i) => ({
    name,
    filledFields: 95 - i * 4,
    currentStatuses: 92 - i * 5,
    overallScore: 93 - i * 4,
  })),
};

// ── 7. Gamification Levels ──
export const gamificationLevels = [
  { level: 1, label: "Starter", minScore: 0, maxScore: 4.9, color: "destructive" as const, privileges: "Beperkt kandidatenaanbod", sanctions: "Max 50 mails/dag" },
  { level: 2, label: "Basis", minScore: 5.0, maxScore: 5.9, color: "secondary" as const, privileges: "Standaard toegang", sanctions: "Geen extra features" },
  { level: 3, label: "Gevorderd", minScore: 6.0, maxScore: 6.9, color: "secondary" as const, privileges: "Uitgebreid kandidatenaanbod", sanctions: "—" },
  { level: 4, label: "Expert", minScore: 7.0, maxScore: 7.9, color: "default" as const, privileges: "Prioriteit bij toewijzingen + extra kanalen", sanctions: "—" },
  { level: 5, label: "Meester", minScore: 8.0, maxScore: 10, color: "default" as const, privileges: "Alle kanalen + mentor-rol + bonus multiplier", sanctions: "—" },
];

export const consultantLevels = [
  { name: "Sophie de Vries", score: 8.4, level: 5, progress: 85 },
  { name: "Thomas Bakker", score: 7.8, level: 4, progress: 80 },
  { name: "Emma Visser", score: 7.5, level: 4, progress: 50 },
  { name: "Anna Smit", score: 7.1, level: 4, progress: 10 },
  { name: "Fleur Mulder", score: 6.8, level: 3, progress: 80 },
  { name: "Niels de Groot", score: 6.5, level: 3, progress: 50 },
  { name: "Mark Peters", score: 6.2, level: 3, progress: 20 },
  { name: "Daan de Boer", score: 5.5, level: 2, progress: 50 },
  { name: "Bram Jansen", score: 5.1, level: 2, progress: 10 },
  { name: "Lisa van Dijk", score: 4.8, level: 1, progress: 96 },
];

export const qualityThreshold = 5.0; // ondergrens
