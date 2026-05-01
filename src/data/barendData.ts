// Static demo data for Barend's "Reverse Matching Analytics" dashboard.
// Numbers mirror the source spec 1:1 so visuals match the reference screenshot.

export const periodOptions = ["7d", "30d", "90d", "QTD", "YTD", "Custom"] as const;
export type PeriodOption = typeof periodOptions[number];

export const reverseFunnelKpis = [
  { key: "vacatures", label: "Vacatures opgepakt", sub: "Via Vacature Matching", value: 174, change: 8.4, icon: "Briefcase", tone: "primary" },
  { key: "matched", label: "Kandidaten gematched", sub: "Door matching engine", value: 2104, change: 12.1, icon: "Users", tone: "chart-primary" },
  { key: "doorgezet", label: "Kandidaten doorgezet", sub: "Naar Sales", value: 488, change: 6.8, icon: "Send", tone: "accent" },
  { key: "voorgesteld", label: "Voorgesteld bij bedrijf", sub: "Door Sales gedeeld", value: 286, change: 9.2, icon: "Building2", tone: "gold" },
  { key: "opGesprek", label: "Op gesprek", sub: "Uitgenodigd door klant", value: 124, change: 14.3, icon: "MessageSquare", tone: "primary" },
  { key: "geplaatst", label: "Geplaatst", sub: "Gerealiseerd", value: 38, change: 18.7, icon: "CheckCircle", tone: "accent" },
] as const;

export const actieNodigTiles = [
  {
    key: "doorgezet-niet-gebeld",
    label: "Doorgezet, nog niet gebeld",
    count: 47,
    subject: "kandidaten",
    detail: "Oudste wacht 5u 18m",
    severity: "warning" as const,
    icon: "PhoneOff",
  },
  {
    key: "sla-2u-niet-gebeld",
    label: "SLA breach: > 2u niet gebeld",
    count: 12,
    subject: "kandidaten",
    detail: "Sales heeft kandidaat op naam",
    severity: "danger" as const,
    icon: "Clock",
  },
  {
    key: "gereageerd-niet-doorgezet",
    label: "Gereageerd, nog niet doorgezet",
    count: 84,
    subject: "kandidaten",
    detail: "Oudste wacht 3u 16m",
    severity: "warning" as const,
    icon: "MessageSquareWarning",
  },
  {
    key: "sla-1u-geen-reactie",
    label: "SLA breach: > 1u geen reactie",
    count: 31,
    subject: "kandidaten",
    detail: "Reactie van kandidaat onbeantwoord",
    severity: "danger" as const,
    icon: "AlarmClock",
  },
];

export const bronMixData = {
  total: 2416,
  segments: [
    { name: "Mail", value: 1240, share: 51.3, change: 4.2, color: "hsl(var(--chart-primary))" },
    { name: "Bird (WhatsApp)", value: 612, share: 25.3, change: 12.6, color: "hsl(var(--accent))" },
    { name: "Sollicitatie", value: 312, share: 12.9, change: 8.4, color: "hsl(var(--gold))" },
    { name: "LinkedIn", value: 252, share: 10.4, change: 22.8, color: "hsl(var(--primary))" },
  ],
};

export const trendOverTimeData = [
  { week: "wk 7",  outreach: 220, responses: 70,  cvs: 32, plaatsingen: 2, omzet: 28000 },
  { week: "wk 8",  outreach: 240, responses: 78,  cvs: 36, plaatsingen: 3, omzet: 34000 },
  { week: "wk 9",  outreach: 200, responses: 64,  cvs: 28, plaatsingen: 2, omzet: 30000 },
  { week: "wk 10", outreach: 180, responses: 60,  cvs: 26, plaatsingen: 2, omzet: 32000 },
  { week: "wk 11", outreach: 160, responses: 52,  cvs: 22, plaatsingen: 1, omzet: 28000 },
  { week: "wk 12", outreach: 170, responses: 58,  cvs: 24, plaatsingen: 2, omzet: 36000 },
  { week: "wk 13", outreach: 150, responses: 50,  cvs: 22, plaatsingen: 2, omzet: 40000 },
  { week: "wk 14", outreach: 175, responses: 60,  cvs: 28, plaatsingen: 3, omzet: 48000 },
  { week: "wk 15", outreach: 195, responses: 70,  cvs: 34, plaatsingen: 3, omzet: 56000 },
  { week: "wk 16", outreach: 240, responses: 90,  cvs: 42, plaatsingen: 4, omzet: 68000 },
  { week: "wk 17", outreach: 270, responses: 102, cvs: 48, plaatsingen: 5, omzet: 76000 },
  { week: "wk 18", outreach: 230, responses: 88,  cvs: 40, plaatsingen: 4, omzet: 64000 },
];

export const kanaalPerformance = [
  {
    name: "Email",
    provider: "Postmark",
    responseRate: 17.6,
    sent: 1240,
    avgResp: "18,4u",
    kostenPerResp: 0.39,
    plaatsingen: 14,
    omzet: 178000,
    roi: 2070,
    tone: "chart-primary" as const,
  },
  {
    name: "WhatsApp",
    provider: "Bird",
    responseRate: 30.1,
    sent: 612,
    avgResp: "2,8u",
    kostenPerResp: 1.7,
    plaatsingen: 16,
    omzet: 204800,
    roi: 656,
    tone: "accent" as const,
  },
  {
    name: "LinkedIn",
    provider: "Unipile",
    responseRate: 34.1,
    sent: 252,
    avgResp: "12,2u",
    kostenPerResp: 5.58,
    plaatsingen: 8,
    omzet: 104500,
    roi: 217,
    tone: "primary" as const,
  },
];

export const matchKwaliteitBuckets = [
  { bucket: "0–50",   kandidaten: 420, responsePct: 8.3,  doorgezetPct: 1.4 },
  { bucket: "50–70",  kandidaten: 760, responsePct: 14.6, doorgezetPct: 4.2 },
  { bucket: "70–85",  kandidaten: 880, responsePct: 23.9, doorgezetPct: 9.7 },
  { bucket: "85–100", kandidaten: 356, responsePct: 31.4, doorgezetPct: 13.7 },
];

export const functiegroepRows = [
  { naam: "Werktuigbouwkundig Engineer", vac: 22, gematched: 286, geinteresseerd: 72, voorgesteld: 38, plaatsingen: 8, fillRate: 33.3, avgTime: "21 dgn", omzet: 112000 },
  { naam: "Elektrotechnisch Engineer",   vac: 20, gematched: 264, geinteresseerd: 64, voorgesteld: 34, plaatsingen: 7, fillRate: 31.8, avgTime: "23 dgn", omzet: 96000 },
  { naam: "Service Engineer",            vac: 16, gematched: 198, geinteresseerd: 48, voorgesteld: 26, plaatsingen: 5, fillRate: 27.8, avgTime: "18 dgn", omzet: 64000 },
  { naam: "Projectleider Techniek",      vac: 14, gematched: 172, geinteresseerd: 42, voorgesteld: 22, plaatsingen: 4, fillRate: 25.0, avgTime: "26 dgn", omzet: 72000 },
  { naam: "Werkvoorbereider",            vac: 12, gematched: 138, geinteresseerd: 34, voorgesteld: 18, plaatsingen: 4, fillRate: 28.6, avgTime: "24 dgn", omzet: 58000 },
  { naam: "PLC / Software Engineer",     vac: 11, gematched: 128, geinteresseerd: 32, voorgesteld: 16, plaatsingen: 3, fillRate: 25.0, avgTime: "27 dgn", omzet: 48000 },
  { naam: "Onderhoudsmonteur",           vac: 11, gematched: 116, geinteresseerd: 24, voorgesteld: 12, plaatsingen: 2, fillRate: 14.3, avgTime: "22 dgn", omzet: 26000 },
  { naam: "Procestechnoloog",            vac: 9,  gematched: 108, geinteresseerd: 28, voorgesteld: 14, plaatsingen: 3, fillRate: 30.0, avgTime: "28 dgn", omzet: 44000 },
  { naam: "Calculator",                  vac: 7,  gematched: 72,  geinteresseerd: 16, voorgesteld: 8,  plaatsingen: 2, fillRate: 25.0, avgTime: "30 dgn", omzet: 24000 },
  { naam: "Mechanical Designer",         vac: 5,  gematched: 64,  geinteresseerd: 12, voorgesteld: 6,  plaatsingen: 0, fillRate: 0.0,  avgTime: "—",      omzet: 0 },
];

export const recruiterLeaderboard = [
  { rank: 1, initials: "Sd", naam: "Sanne de Vries", vac: 18, plaats: 8, respRate: 26.9, fillRate: 44.4, tijdShortlist: "3,8u", pipeline: 142000, omzet: 98400 },
  { rank: 2, initials: "MJ", naam: "Mark Jansen",    vac: 16, plaats: 7, respRate: 25.2, fillRate: 43.8, tijdShortlist: "4,2u", pipeline: 128000, omzet: 86200 },
  { rank: 3, initials: "LB", naam: "Lisa Bakker",    vac: 14, plaats: 6, respRate: 27.4, fillRate: 42.9, tijdShortlist: "4,6u", pipeline: 112000, omzet: 74800 },
  { rank: 4, initials: "JV", naam: "Jeroen Visser",  vac: 15, plaats: 5, respRate: 24.1, fillRate: 33.3, tijdShortlist: "5,1u", pipeline: 98000,  omzet: 62400 },
  { rank: 5, initials: "ES", naam: "Eva Smit",       vac: 12, plaats: 4, respRate: 22.2, fillRate: 33.3, tijdShortlist: "5,4u", pipeline: 86000,  omzet: 52800 },
  { rank: 6, initials: "TM", naam: "Tom Mulder",     vac: 10, plaats: 3, respRate: 19.0, fillRate: 30.0, tijdShortlist: "6,2u", pipeline: 72000,  omzet: 38400 },
  { rank: 7, initials: "Nv", naam: "Nina van Dijk",  vac: 9,  plaats: 2, respRate: 17.9, fillRate: 22.2, tijdShortlist: "6,8u", pipeline: 58000,  omzet: 28200 },
  { rank: 8, initials: "RH", naam: "Ruben Hoekstra", vac: 8,  plaats: 2, respRate: 16.7, fillRate: 25.0, tijdShortlist: "7,4u", pipeline: 46000,  omzet: 22400 },
];

export const financieleMetrics = {
  omzet: { value: 487300, change: 14.2, sub: "LTV toegevoegd: € 1.248.000" },
  brutomarge: { value: 121800, change: 18.9, sub: "25,0% marge" },
  pipeline: { value: 742000, change: 8.5, sub: "Verwachte omzet open vacatures" },
  roiTotaal: { value: 139, sub: "Outreach kosten: € 878" },
};

export const monthlyRevenue = [
  { month: "mei '25", omzet: 280000 },
  { month: "jun '25", omzet: 320000 },
  { month: "jul '25", omzet: 290000 },
  { month: "aug '25", omzet: 340000 },
  { month: "sep '25", omzet: 380000 },
  { month: "okt '25", omzet: 420000 },
  { month: "nov '25", omzet: 410000 },
  { month: "dec '25", omzet: 360000 },
  { month: "jan '26", omzet: 440000 },
  { month: "feb '26", omzet: 480000 },
  { month: "mrt '26", omzet: 520000 },
  { month: "apr '26", omzet: 487300 },
];

export const roiPerKanaal = [
  { kanaal: "Email", roi: 2070 },
  { kanaal: "WhatsApp", roi: 656 },
  { kanaal: "LinkedIn", roi: 217 },
];
