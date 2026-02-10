// Centralized mock data for all 19 consultant dashboard pages

// ============ Page 1: Geld & Bonus ============
export const bonusData = {
  current: 4250,
  target: 6000,
  nextTier: { amount: 6000, label: "Trede 3" },
  tiers: [
    { level: 1, threshold: 0, bonus: 1500, reached: true },
    { level: 2, threshold: 3000, bonus: 3000, reached: true },
    { level: 3, threshold: 6000, bonus: 6000, reached: false },
    { level: 4, threshold: 10000, bonus: 10000, reached: false },
  ],
};

export const salaryProgressData = {
  currentSalary: 3200,
  nextSalary: 3600,
  currentRevenue: 170000,
  requiredRevenue: 250000,
  progress: 68,
};

export const earningsData = {
  monthly: { salary: 3200, bonus: 425, extras: 150 },
  ytd: { salary: 35200, bonus: 4250, extras: 1650 },
  total: { salary: 38400, bonus: 4250, extras: 1800 },
};

export const scenarioOptions = [
  { placements: 1, bonusIncrease: 850, newTotal: 5100 },
  { placements: 2, bonusIncrease: 1750, newTotal: 6000 },
  { placements: 3, bonusIncrease: 2800, newTotal: 7050 },
];

export const detavastValues = [
  { name: "Jan de Groot", company: "Shell", monthlyMargin: 1200, totalExpected: 14400 },
  { name: "Pieter Bakker", company: "ASML", monthlyMargin: 980, totalExpected: 11760 },
  { name: "Lisa Jansen", company: "Philips", monthlyMargin: 1450, totalExpected: 17400 },
  { name: "Ahmed Hassan", company: "KPN", monthlyMargin: 870, totalExpected: 10440 },
];

export const marginPerPlacement = [
  { candidate: "Jan de Groot", expected: 14400, realized: 15200, reason: "Snellere overname" },
  { candidate: "Pieter Bakker", expected: 11760, realized: 10500, reason: "Minder uren gedraaid" },
  { candidate: "Lisa Jansen", expected: 17400, realized: 17400, reason: "Conform verwachting" },
  { candidate: "Ahmed Hassan", expected: 10440, realized: 12100, reason: "Tariefsverhoging" },
];

export const noRegretDeals = [
  { candidate: "Sophie Mol", chance: 85, bonusImpact: 1200, reason: "Klant wil snel starten" },
  { candidate: "Tom Hendriks", chance: 72, bonusImpact: 980, reason: "2e gesprek positief" },
  { candidate: "Eva de Wit", chance: 65, bonusImpact: 1100, reason: "Exclusief bij ons" },
  { candidate: "Mark Visser", chance: 58, bonusImpact: 750, reason: "Goede match" },
  { candidate: "Nina Smit", chance: 45, bonusImpact: 890, reason: "Salaris akkoord" },
];

export const bonusLeaderboard = [
  { rank: 1, name: "Sophie de Vries", bonus: 8200, team: "Engineering" },
  { rank: 2, name: "Thomas Berg", bonus: 7100, team: "Finance" },
  { rank: 3, name: "Jij", bonus: 4250, team: "IT", isUser: true },
  { rank: 4, name: "Emma Kok", bonus: 3800, team: "IT" },
  { rank: 5, name: "Daan Mulder", bonus: 3200, team: "Engineering" },
];

// ============ Page 2: KPI Cockpit ============
export const kpiData = [
  { id: "candidates", label: "Nieuwe kandidaten", today: 3, week: 14, target: 20, sparkline: [2, 1, 3, 2, 4, 1, 3] },
  { id: "intakes_planned", label: "Intakes gepland", today: 2, week: 8, target: 10, sparkline: [1, 2, 1, 2, 1, 0, 2] },
  { id: "intakes_done", label: "Intakes gedaan", today: 1, week: 6, target: 10, sparkline: [1, 1, 1, 2, 0, 1, 1] },
  { id: "matches", label: "Matches gemaakt", today: 4, week: 18, target: 25, sparkline: [3, 2, 4, 1, 3, 2, 4] },
  { id: "callblocks", label: "Belblokken (2u)", today: 1, week: 4, target: 5, sparkline: [1, 1, 0, 1, 1, 0, 1] },
  { id: "client_calls", label: "Klantcalls (beslissers)", today: 5, week: 22, target: 30, sparkline: [4, 3, 5, 2, 4, 3, 5] },
  { id: "intros", label: "Intro's verstuurd", today: 2, week: 11, target: 15, sparkline: [1, 2, 2, 1, 2, 1, 2] },
  { id: "interviews_planned", label: "Gesprekken gepland", today: 1, week: 5, target: 8, sparkline: [1, 0, 1, 1, 1, 0, 1] },
  { id: "interviews_evaluated", label: "Gesprekken geëvalueerd", today: 1, week: 4, target: 8, sparkline: [0, 1, 1, 0, 1, 1, 0] },
  { id: "placements", label: "Plaatsingen", today: 0, week: 1, target: 3, sparkline: [0, 0, 1, 0, 0, 0, 0] },
];

// ============ Page 3: Sales Funnel ============
export const funnelSteps = [
  { step: "Binnengekomen", count: 245, color: "hsl(var(--teal))" },
  { step: "Ingeschreven", count: 198, color: "hsl(var(--teal))" },
  { step: "Intake", count: 142, color: "hsl(var(--accent))" },
  { step: "Match", count: 98, color: "hsl(var(--accent))" },
  { step: "Klantcontact", count: 67, color: "hsl(var(--gold))" },
  { step: "Voorstel", count: 45, color: "hsl(var(--gold))" },
  { step: "Gesprek", count: 28, color: "hsl(var(--primary))" },
  { step: "Aanbod", count: 15, color: "hsl(var(--primary))" },
  { step: "Plaatsing", count: 8, color: "hsl(var(--success))" },
];

export const stepDurations = [
  { step: "Binnengekomen → Ingeschreven", days: 1.2 },
  { step: "Ingeschreven → Intake", days: 3.5 },
  { step: "Intake → Match", days: 2.1 },
  { step: "Match → Klantcontact", days: 1.8 },
  { step: "Klantcontact → Voorstel", days: 4.2 },
  { step: "Voorstel → Gesprek", days: 5.1 },
  { step: "Gesprek → Aanbod", days: 3.8 },
  { step: "Aanbod → Plaatsing", days: 6.5 },
];

export const channelWinRates = [
  { channel: "LinkedIn", placements: 3, leads: 85, rate: 3.5 },
  { channel: "Indeed", placements: 2, leads: 62, rate: 3.2 },
  { channel: "Referral", placements: 2, leads: 28, rate: 7.1 },
  { channel: "Website", placements: 1, leads: 45, rate: 2.2 },
  { channel: "Events", placements: 0, leads: 25, rate: 0 },
];

// ============ Page 4: Next Actions ============
export const priorityTasks = [
  { id: 1, task: "Bel Sophie Mol terug - 2e gesprek inplannen", priority: 95, type: "call", overdue: false },
  { id: 2, task: "CV Tom Hendriks versturen naar Shell", priority: 90, type: "email", overdue: false },
  { id: 3, task: "Follow-up ASML vacature - beslisser spreken", priority: 88, type: "call", overdue: true },
  { id: 4, task: "Intake Eva de Wit voorbereiden", priority: 82, type: "meeting", overdue: false },
  { id: 5, task: "Referentiecheck Mark Visser", priority: 78, type: "call", overdue: false },
  { id: 6, task: "Voorstelmail Nina Smit naar KPN", priority: 75, type: "email", overdue: true },
  { id: 7, task: "Check-in gedetacheerde Jan de Groot", priority: 72, type: "call", overdue: false },
  { id: 8, task: "Nieuwe vacature Philips bespreken", priority: 70, type: "meeting", overdue: false },
  { id: 9, task: "LinkedIn bericht sturen 5 kandidaten", priority: 65, type: "email", overdue: false },
  { id: 10, task: "Tariefonderhandeling Randstad", priority: 62, type: "call", overdue: false },
  { id: 11, task: "Intake formulier compleet maken", priority: 58, type: "admin", overdue: true },
  { id: 12, task: "CRM records bijwerken", priority: 55, type: "admin", overdue: false },
  { id: 13, task: "Marktonderzoek logistiek sector", priority: 50, type: "research", overdue: false },
  { id: 14, task: "Belblok middag plannen", priority: 48, type: "call", overdue: false },
  { id: 15, task: "Weekrapport invullen", priority: 42, type: "admin", overdue: false },
];

export const hotMatches = [
  { candidate: "Sophie Mol", company: "Shell", hoursAgo: 2.5, urgency: "critical" as const },
  { candidate: "Tom Hendriks", company: "ASML", hoursAgo: 5, urgency: "high" as const },
  { candidate: "Eva de Wit", company: "Philips", hoursAgo: 8, urgency: "medium" as const },
];

export const openClientResponses = [
  { company: "Shell", contact: "Jan Pietersen", daysPending: 1, sla: "green" as const },
  { company: "ASML", contact: "Marie de Boer", daysPending: 3, sla: "orange" as const },
  { company: "KPN", contact: "Peter Smit", daysPending: 7, sla: "red" as const },
];

export const coolingCandidates = [
  { name: "Rick van Dam", daysSinceContact: 12, lastAction: "Intake afgerond" },
  { name: "Laura Bos", daysSinceContact: 9, lastAction: "CV verstuurd" },
  { name: "Sander Vos", daysSinceContact: 15, lastAction: "Eerste contact" },
];

export const riskyDeals = [
  { candidate: "Mark Visser", risk: "Kandidaat twijfelt over reistijd", level: "high" as const },
  { candidate: "Nina Smit", risk: "Concurrentie: 2 andere bureaus actief", level: "medium" as const },
  { candidate: "Bas Dekker", risk: "Tariefissue - klant wil lager", level: "high" as const },
];

// ============ Page 5: Gesprekskwaliteit ============
export const conversationScores = {
  opening: 78,
  inventarisatie: 85,
  samenvatten: 62,
  afspraken: 71,
};

export const bdcScores = {
  bedrijf: 82,
  dienstverlening: 75,
  consultant: 88,
};

export const listeningScores = {
  luisteren: { score: 72, feedback: "Laat de klant meer uitpraten voor je reageert" },
  samenvatten: { score: 65, feedback: "Vat vaker samen wat de kandidaat zegt" },
  doorvragen: { score: 80, feedback: "Goed doorvragen op motivatie" },
};

export const objectionHandling = {
  won: 14,
  lost: 6,
  examples: [
    { objection: "Te duur", result: "won", response: "ROI-berekening gepresenteerd" },
    { objection: "Geen urgentie", result: "lost", response: "Niet genoeg doorgevraagd" },
    { objection: "Al een bureau", result: "won", response: "USP's benoemd" },
  ],
};

export const callReviewHeatmap = [
  { category: "Opening", week1: 7, week2: 8, week3: 7, week4: 9 },
  { category: "Behoefteanalyse", week1: 8, week2: 7, week3: 8, week4: 8 },
  { category: "Pitch", week1: 6, week2: 7, week3: 8, week4: 8 },
  { category: "Bezwaren", week1: 5, week2: 6, week3: 6, week4: 7 },
  { category: "Afsluiting", week1: 7, week2: 6, week3: 7, week4: 8 },
  { category: "Follow-up", week1: 6, week2: 7, week3: 7, week4: 7 },
];

export const improvementPoints = [
  { point: "Stel 3x vaker 'Wat zou het ideale scenario zijn?' in klantgesprekken", impact: "high" as const },
  { point: "Sluit elk gesprek af met een concrete next step + datum", impact: "high" as const },
  { point: "Begin intake met open vraag over ambitie ipv functie-eisen", impact: "medium" as const },
];

// ============ Page 6: Activiteit vs Resultaat ============
export const activityROI = [
  { stage: "Calls", count: 450, icon: "Phone" },
  { stage: "Voorstellen", count: 45, icon: "FileText" },
  { stage: "Gesprekken", count: 28, icon: "Users" },
  { stage: "Plaatsingen", count: 8, icon: "CheckCircle" },
];

export const callBlockCorrelation = [
  { week: "W1", callBlocks: 3, placements: 0 },
  { week: "W2", callBlocks: 5, placements: 1 },
  { week: "W3", callBlocks: 4, placements: 0 },
  { week: "W4", callBlocks: 5, placements: 2 },
  { week: "W5", callBlocks: 2, placements: 0 },
  { week: "W6", callBlocks: 5, placements: 1 },
  { week: "W7", callBlocks: 4, placements: 1 },
  { week: "W8", callBlocks: 5, placements: 2 },
];

export const trendData = [
  { period: "P1", pipeline: 12, lost: 3 },
  { period: "P2", pipeline: 15, lost: 4 },
  { period: "P3", pipeline: 18, lost: 2 },
  { period: "P4", pipeline: 22, lost: 5 },
  { period: "P5", pipeline: 20, lost: 3 },
  { period: "P6", pipeline: 25, lost: 4 },
];

// ============ Page 7: Benchmarking ============
export const benchmarkData = [
  { kpi: "Plaatsingen", you: 8, teamAvg: 6, top: 12 },
  { kpi: "Conversie %", you: 3.3, teamAvg: 2.8, top: 5.1 },
  { kpi: "Calls/dag", you: 22, teamAvg: 18, top: 35 },
  { kpi: "Time-to-fill", you: 28, teamAvg: 35, top: 21 },
  { kpi: "Marge/plaatsing", you: 12500, teamAvg: 10800, top: 16200 },
  { kpi: "CRM score", you: 78, teamAvg: 72, top: 95 },
];

export const leagueTableData = {
  plaatsingen: [
    { rank: 1, name: "Sophie de Vries", value: 12 },
    { rank: 2, name: "Thomas Berg", value: 10 },
    { rank: 3, name: "Jij", value: 8, isUser: true },
    { rank: 4, name: "Emma Kok", value: 7 },
    { rank: 5, name: "Daan Mulder", value: 6 },
  ],
  marge: [
    { rank: 1, name: "Sophie de Vries", value: 194400 },
    { rank: 2, name: "Thomas Berg", value: 162000 },
    { rank: 3, name: "Jij", value: 100000, isUser: true },
    { rank: 4, name: "Emma Kok", value: 88200 },
    { rank: 5, name: "Daan Mulder", value: 75600 },
  ],
};

export const topPerformerInsights = [
  { insight: "Sophie belt gemiddeld 35 beslissers per dag", impact: "+60% meer gesprekken" },
  { insight: "Haar intake-to-voorstel tijd is 1.5 dag", impact: "2x sneller dan gemiddeld" },
  { insight: "95% CRM compleetheid", impact: "Minder verloren leads" },
];

// ============ Page 8: Kandidaat-First ============
export const candidateStatus = {
  intake: [
    { name: "Rick van Dam", days: 2 },
    { name: "Laura Bos", days: 1 },
  ],
  matching: [
    { name: "Sophie Mol", days: 3 },
    { name: "Tom Hendriks", days: 5 },
  ],
  voorgesteld: [
    { name: "Eva de Wit", days: 4 },
    { name: "Mark Visser", days: 7 },
  ],
  gesprek: [
    { name: "Nina Smit", days: 2 },
  ],
  geplaatst: [
    { name: "Jan de Groot", days: 45 },
    { name: "Pieter Bakker", days: 30 },
  ],
};

export const candidateNPS = {
  naIntake: 8.2,
  naGesprek: 7.8,
  naPlaatsing: 8.9,
};

export const matchQuality = { matchesToInterview: 62, totalMatches: 98 };

export const profileCompleteness = [
  { field: "Werkervaring", complete: 95 },
  { field: "Salariswens", complete: 82 },
  { field: "Reisbereidheid", complete: 78 },
  { field: "Beschikbaarheid", complete: 90 },
  { field: "Referenties", complete: 45 },
];

// ============ Page 9: Klant & Markt ============
export const clientCoverage = [
  { company: "Shell", lastContact: "2 dagen", decisionMaker: true, role: "Engineering Manager", temperature: "warm" as const },
  { company: "ASML", lastContact: "5 dagen", decisionMaker: true, role: "HR Director", temperature: "warm" as const },
  { company: "Philips", lastContact: "12 dagen", decisionMaker: false, role: "Onbekend", temperature: "lauw" as const },
  { company: "KPN", lastContact: "3 dagen", decisionMaker: true, role: "CTO", temperature: "warm" as const },
  { company: "Rabobank", lastContact: "21 dagen", decisionMaker: false, role: "Onbekend", temperature: "koud" as const },
  { company: "ING", lastContact: "45 dagen", decisionMaker: false, role: "Onbekend", temperature: "koud" as const },
  { company: "Unilever", lastContact: "8 dagen", decisionMaker: true, role: "Plant Manager", temperature: "lauw" as const },
];

export const marketInsights = { thisWeek: 7, lastWeek: 4 };

// ============ Page 10: CRM Hygiene ============
export const crmCompleteness = {
  candidates: { score: 78, missing: ["Referenties (45%)", "Motivatiebrief (52%)", "Salariswens (18%)"] },
  clients: { score: 65, missing: ["Beslisser (35%)", "Budget (42%)", "Tijdlijn (28%)"] },
};

export const followUpDiscipline = { onTime: 72, late: 28 };

export const dataQuality = {
  duplicates: 12,
  missingContacts: 8,
  outdatedVacancies: 5,
  score: 71,
};

export const postCallSpeed = { average: "18 min", best: "4 min", target: "10 min" };

export const costlyMistakes = [
  { mistake: "Geen CTA in voorstelmail", frequency: 8, impact: "3 gemiste gesprekken" },
  { mistake: "Te late opvolging (>24u)", frequency: 5, impact: "2 verloren kandidaten" },
  { mistake: "Verkeerde beslisser benaderd", frequency: 3, impact: "1 gemist contract" },
  { mistake: "CV niet specifiek genoeg", frequency: 4, impact: "2 afwijzingen" },
];

// ============ Page 11: Snelheid & Efficientie ============
export const speedMetrics = [
  { label: "Time-to-first-call", value: "2.4 uur", target: "1 uur", status: "warning" as const },
  { label: "Time-to-intro-mail", value: "45 min", target: "30 min", status: "warning" as const },
  { label: "Time-to-interview", value: "4.2 dagen", target: "3 dagen", status: "danger" as const },
  { label: "Cycle time per plaatsing", value: "28 dagen", target: "21 dagen", status: "warning" as const },
];

export const workloadData = {
  openTasks: 34,
  openProcesses: 12,
  urgentTasks: 5,
  items: [
    { task: "Follow-ups vandaag", count: 8, priority: "high" as const },
    { task: "Intakes deze week", count: 4, priority: "medium" as const },
    { task: "CV's updaten", count: 6, priority: "low" as const },
    { task: "CRM bijwerken", count: 12, priority: "low" as const },
    { task: "Klantgesprekken", count: 4, priority: "high" as const },
  ],
};

// ============ Page 12: Forecasting ============
export const forecastData = {
  placements: { weighted: 4.2, unweighted: 8, confidence: 52 },
  marginPerPeriod: [
    { period: "P7", forecast: 18000, actual: null },
    { period: "P8", forecast: 22000, actual: null },
    { period: "P9", forecast: 15000, actual: null },
    { period: "P10", forecast: 25000, actual: null },
  ],
  risks: [
    { deal: "Mark Visser → KPN", probability: 35, reason: "Reistijd bezwaar", margin: 10440 },
    { deal: "Bas Dekker → Randstad", probability: 25, reason: "Tariefissue", margin: 8500 },
    { deal: "Laura Bos → ING", probability: 40, reason: "Concurrentie", margin: 12000 },
  ],
  scenarios: [
    { action: "+15 klantcalls/week", forecastIncrease: "+1.2 plaatsingen", confidence: 78 },
    { action: "CTA op elk voorstel", forecastIncrease: "+0.8 plaatsingen", confidence: 82 },
    { action: "Intake compleetheid 95%", forecastIncrease: "+0.5 plaatsingen", confidence: 65 },
  ],
};

// ============ Page 13: Detavast & Retentie ============
export const deployedStaff = [
  { name: "Jan de Groot", company: "Shell", hoursWorked: 1240, totalRequired: 1700, startDate: "2025-03-01", proefTijd: false, risk: "low" as const },
  { name: "Pieter Bakker", company: "ASML", hoursWorked: 890, totalRequired: 1700, startDate: "2025-06-15", proefTijd: false, risk: "low" as const },
  { name: "Lisa Jansen", company: "Philips", hoursWorked: 320, totalRequired: 1700, startDate: "2025-11-01", proefTijd: true, risk: "medium" as const },
  { name: "Ahmed Hassan", company: "KPN", hoursWorked: 160, totalRequired: 1700, startDate: "2026-01-05", proefTijd: true, risk: "high" as const },
];

export const aftercareTasks = [
  { staff: "Jan de Groot", type: "Maandelijkse check-in", planned: "2026-02-15", done: false },
  { staff: "Pieter Bakker", type: "6-maanden evaluatie", planned: "2026-02-20", done: false },
  { staff: "Lisa Jansen", type: "Proeftijd check", planned: "2026-02-10", done: true },
  { staff: "Ahmed Hassan", type: "Week 2 check-in", planned: "2026-02-12", done: false },
];

// ============ Page 14: Skills & Training ============
export const trainingModules = [
  { name: "Basis Recruitment", completed: true, score: 92 },
  { name: "Advanced Sourcing", completed: true, score: 85 },
  { name: "Klantgesprek Mastery", completed: false, progress: 65 },
  { name: "Salary Negotiation", completed: false, progress: 30 },
  { name: "Detavast Expertise", completed: false, progress: 0 },
];

export const callSkills = {
  pitch: 75,
  doorvragen: 82,
  bezwaren: 60,
  afsluiten: 68,
};

export const coachingTrend = [
  { week: "W1", score: 6.2 },
  { week: "W2", score: 6.5 },
  { week: "W3", score: 6.8 },
  { week: "W4", score: 7.0 },
  { week: "W5", score: 6.9 },
  { week: "W6", score: 7.3 },
  { week: "W7", score: 7.5 },
  { week: "W8", score: 7.8 },
];

export const nextSkillFocus = {
  skill: "Bezwaren afhandelen",
  reason: "Laagste score (60%) - grootste groeipotentieel",
  actions: ["Oefenen met collega (rollenspel)", "Script voor top 3 bezwaren maken", "Na elk gesprek evalueren"],
};

export const bestPractices = [
  { type: "Email", title: "Introductiemail engineering managers", author: "Sophie de Vries", tag: "Engineering", rating: 4.8 },
  { type: "Call", title: "Pitch voor IT-detachering", author: "Thomas Berg", tag: "IT", rating: 4.6 },
  { type: "Email", title: "Follow-up na eerste gesprek", author: "Emma Kok", tag: "Algemeen", rating: 4.5 },
];

// ============ Page 15: Gamification ============
export const badges = [
  { name: "24-uurs Kampioen", icon: "⚡", earned: true, description: "10x binnen 24u opgevolgd" },
  { name: "Exclusiviteit Held", icon: "🔒", earned: true, description: "5 exclusieve kandidaten" },
  { name: "Hot Match Sprinter", icon: "🏃", earned: true, description: "3 hot matches <1u gebeld" },
  { name: "Perfecte Intake", icon: "⭐", earned: false, description: "Intake score 95%+" },
  { name: "Plaatsingsstreak", icon: "🔥", earned: false, description: "3 plaatsingen op rij" },
  { name: "CRM Meester", icon: "📊", earned: false, description: "CRM score 95%+" },
  { name: "Belblok Machine", icon: "📞", earned: true, description: "20 dagen op rij belblok" },
  { name: "Margemaker", icon: "💰", earned: false, description: "€200k+ marge YTD" },
];

export const streakData = { current: 12, best: 23, type: "Belblok dagen" };

export const teamChallenges = [
  { challenge: "100 klantcalls als team", current: 72, target: 100, deadline: "Vrijdag" },
  { challenge: "15 intakes deze week", current: 9, target: 15, deadline: "Vrijdag" },
];

export const wallOfFame = [
  { category: "Beste plaatsing", winner: "Sophie de Vries", value: "€16.200 marge", icon: "🏆" },
  { category: "Snelste cycle time", winner: "Thomas Berg", value: "14 dagen", icon: "⚡" },
  { category: "Hoogste conversie", winner: "Emma Kok", value: "5.8%", icon: "📈" },
];

// ============ Page 16: Alerts & Risico's ============
export const alerts = {
  candidateRisk: [
    { name: "Rick van Dam", days: 12, signal: "Geen contact sinds intake", urgency: "red" as const },
    { name: "Sander Vos", days: 15, signal: "Twijfelt over overstap", urgency: "red" as const },
    { name: "Laura Bos", days: 9, signal: "CV bij concurrent", urgency: "orange" as const },
  ],
  vagueClients: [
    { company: "Rabobank", issue: "Geen beslisser bekend", days: 21, urgency: "red" as const },
    { company: "ING", issue: "Geen concrete next step", days: 14, urgency: "orange" as const },
  ],
  noCTA: [
    { candidate: "Eva de Wit", company: "Philips", sentDaysAgo: 5, urgency: "orange" as const },
    { candidate: "Mark Visser", company: "KPN", sentDaysAgo: 8, urgency: "red" as const },
  ],
  lateFollowUp: [
    { match: "Sophie Mol → Shell", hours: 4, urgency: "red" as const },
    { match: "Tom Hendriks → ASML", hours: 6, urgency: "orange" as const },
  ],
  crmRisk: [
    { candidate: "Bas Dekker", missing: ["Salariswens", "Referenties", "Motivatie"], urgency: "orange" as const },
  ],
};

// ============ Page 17: Match Kwaliteit ============
export const fitScores = {
  skills: 82,
  regio: 90,
  salaris: 75,
  werktijden: 88,
  ambitie: 70,
};

export const interviewQuality = { goodFit: 18, notFit: 10 };

export const offerRate = { interviews: 28, offers: 15, rate: 53.6 };
export const acceptRate = { offers: 15, placements: 8, rate: 53.3 };

export const rejectionReasons = [
  { reason: "Salarismismatch", count: 4 },
  { reason: "Cultuurfit", count: 3 },
  { reason: "Reistijd te lang", count: 2 },
  { reason: "Andere aanbieding", count: 2 },
  { reason: "Timing", count: 1 },
];

// ============ Page 18: Route naar #1 ============
export const gapAnalysis = [
  { kpi: "Calls/dag", you: 22, top: 35, gap: -37 },
  { kpi: "Conversie", you: 3.3, top: 5.1, gap: -35 },
  { kpi: "Snelheid (d)", you: 28, top: 21, gap: -25 },
  { kpi: "CRM score", you: 78, top: 95, gap: -18 },
  { kpi: "Marge/plts", you: 12500, top: 16200, gap: -23 },
];

export const leverageActions = [
  { action: "+15 klantcalls per week", expectedEffect: "+2 plaatsingen/kwartaal", effort: "medium" as const },
  { action: "CTA afdwingen op elk voorstel", expectedEffect: "+30% conversie voorstel→gesprek", effort: "low" as const },
  { action: "Intake volledigheid naar 95%", expectedEffect: "Betere matchkwaliteit, -20% afwijzingen", effort: "medium" as const },
];

export const weeklyPlaybook = [
  { day: "Maandag", blocks: ["Belblok (2u)", "Intakes (2u)", "CRM bijwerken (1u)"] },
  { day: "Dinsdag", blocks: ["Klantcalls (2u)", "CV's versturen (1u)", "Follow-ups (1u)"] },
  { day: "Woensdag", blocks: ["Belblok (2u)", "Klantgesprekken (2u)", "Admin (1u)"] },
  { day: "Donderdag", blocks: ["Sourcing (2u)", "Intakes (2u)", "Evaluaties (1u)"] },
  { day: "Vrijdag", blocks: ["Follow-ups (1u)", "Weekplanning (1u)", "Pipeline review (1u)"] },
];

// ============ Page 19: Extra Dashboards ============
export const topWinningCompanies = [
  { company: "Shell", placements: 5, reason: "Sterke relatie met Engineering Manager" },
  { company: "ASML", placements: 4, reason: "Niche expertise in semiconductors" },
  { company: "KPN", placements: 3, reason: "Snelle besluitvorming" },
  { company: "Philips", placements: 3, reason: "Volume aan vacatures" },
  { company: "Unilever", placements: 2, reason: "Goede cultuurfit kandidaten" },
];

export const topLosingCompanies = [
  { company: "ING", losses: 4, reason: "Trage interne processen" },
  { company: "Rabobank", losses: 3, reason: "Geen beslisser bereikbaar" },
  { company: "ABN AMRO", losses: 3, reason: "Altijd goedkopere concurrent" },
  { company: "Accenture", losses: 2, reason: "Te hoge eisen vs marktconform" },
  { company: "Deloitte", losses: 2, reason: "Eigen recruitment te sterk" },
];

export const emailMetrics = {
  subjectLines: [
    { subject: "Topkandidaat [Functie] beschikbaar", openRate: 72, clickRate: 35, replyRate: 22 },
    { subject: "Voorstel: [Naam] voor [Vacature]", openRate: 65, clickRate: 28, replyRate: 18 },
    { subject: "Kan ik u helpen met uw [Afdeling] team?", openRate: 45, clickRate: 12, replyRate: 8 },
  ],
};

export const weekPlanningScore = { planned: 18, executed: 14, score: 78 };

export const energyChecks = [
  { day: "Ma", done: true },
  { day: "Di", done: true },
  { day: "Wo", done: false },
  { day: "Do", done: true },
  { day: "Vr", done: true },
];

export const pipelineQuality = { a: 12, b: 28, c: 45 };
