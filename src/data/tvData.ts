// TV Dashboard Mock Data

export interface FunnelMetric {
  label: string;
  value: number;
  change: number;
  icon: string;
}

export interface PipelinePhase {
  phase: string;
  count: number;
  color: string;
}

export interface DayCallStat {
  day: string;
  outbound: number;
  duration: number;
}

export interface CompetitionEntry {
  rank: number;
  name: string;
  value: number;
  change?: number;
  department: string;
}

export interface DeployedPerson {
  id: string;
  name: string;
  company: string;
  startDate: string;
  endDate: string | null;
  consultant: string;
  status: "active" | "starting" | "ending";
}

export interface PeriodRevenue {
  period: string;
  revenue: number;
}

// Dashboard 1: Week Sales Funnel
export const weekFunnelMetrics: FunnelMetric[] = [
  { label: "Inschrijvingen", value: 42, change: 12, icon: "UserPlus" },
  { label: "Acquisities", value: 15, change: -3, icon: "Target" },
  { label: "Voorstellen", value: 22, change: 8, icon: "FileText" },
  { label: "Gesprekken", value: 18, change: 2, icon: "MessageSquare" },
  { label: "Plaatsingen", value: 6, change: 15, icon: "CheckCircle" },
];

// Dashboard 2: Period Sales Funnel
export const periodFunnelMetrics: FunnelMetric[] = [
  { label: "Inschrijvingen", value: 186, change: 9, icon: "UserPlus" },
  { label: "Acquisities", value: 68, change: -2, icon: "Target" },
  { label: "Voorstellen", value: 95, change: 11, icon: "FileText" },
  { label: "Gesprekken", value: 78, change: 6, icon: "MessageSquare" },
];

export const candidatePipeline: PipelinePhase[] = [
  { phase: "Screening", count: 24, color: "hsl(var(--chart-primary))" },
  { phase: "Interview", count: 18, color: "hsl(var(--gold))" },
  { phase: "Voorstel", count: 15, color: "hsl(var(--accent))" },
  { phase: "Aanbieding", count: 12, color: "hsl(var(--primary))" },
  { phase: "Geplaatst", count: 15, color: "hsl(var(--success))" },
];

// Kandidaten Insides — 1 counter + 8 bargraph categories
export interface CandidatesInsidesBar {
  key: string;
  label: string;
  count: number;
  color: string;
}
export const candidatesInsides: { actief: number; bars: CandidatesInsidesBar[] } = {
  actief: 184,
  bars: [
    { key: "verdelen", label: "Op verdelen", count: 28, color: "hsl(var(--muted-foreground))" },
    { key: "inschrijven", label: "Op inschrijven", count: 36, color: "hsl(var(--chart-primary))" },
    { key: "procedure", label: "In procedure", count: 42, color: "hsl(var(--primary))" },
    { key: "uitnodigingen", label: "Met uitnodigingen", count: 31, color: "hsl(var(--gold))" },
    { key: "gesprekkenGepland", label: "Met gesprekken", count: 22, color: "hsl(var(--accent))" },
    { key: "opGesprekGeweest", label: "Op gesprek geweest", count: 14, color: "hsl(var(--teal))" },
    { key: "dealsluiter", label: "Procedures met dealsluiter", count: 8, color: "hsl(var(--orange-glow,var(--gold)))" },
    { key: "geplaatst", label: "Geplaatst", count: 6, color: "hsl(var(--success))" },
  ],
};

export const weekCallStats: DayCallStat[] = [
  { day: "Ma", outbound: 68, duration: 580 },
  { day: "Di", outbound: 72, duration: 620 },
  { day: "Wo", outbound: 55, duration: 490 },
  { day: "Do", outbound: 81, duration: 710 },
  { day: "Vr", outbound: 66, duration: 510 },
];

export const periodCallStats = {
  totalOutbound: 1482,
  totalDurationHours: 210,
  avgPerDay: 56,
};

// Dashboard 3: Beker / Competition
export const omzetKoning: { stijgers: CompetitionEntry[]; dalers: CompetitionEntry[] } = {
  stijgers: [
    { rank: 1, name: "Delano Nikkels", value: 180000, change: 32, department: "Engineering" },
    { rank: 2, name: "Falco Zegveld", value: 120000, change: 24, department: "Engineering" },
    { rank: 3, name: "Christiaan van Krieken", value: 95000, change: 18, department: "Operators" },
    { rank: 4, name: "Niels Florijn", value: 82000, change: 15, department: "Engineering" },
    { rank: 5, name: "Mahesh Behari", value: 68000, change: 12, department: "Operators" },
  ],
  dalers: [
    { rank: 1, name: "Elianne van Lohuizen", value: -45000, change: -18, department: "Operators" },
    { rank: 2, name: "Bart van Vliet", value: -32000, change: -12, department: "Monteurs" },
    { rank: 3, name: "Kaylee van den Berg", value: -18000, change: -8, department: "Monteurs" },
  ],
};

export const plaatsingsKoning: CompetitionEntry[] = [
  { rank: 1, name: "Christiaan van Krieken", value: 5, department: "Operators" },
  { rank: 2, name: "Delano Nikkels", value: 4, department: "Engineering" },
  { rank: 3, name: "Mahesh Behari", value: 4, department: "Operators" },
  { rank: 4, name: "Falco Zegveld", value: 3, department: "Engineering" },
  { rank: 5, name: "Niels Florijn", value: 3, department: "Engineering" },
];

export const margeBaas: CompetitionEntry[] = [
  { rank: 1, name: "Delano Nikkels", value: 420000, department: "Engineering" },
  { rank: 2, name: "Christiaan van Krieken", value: 380000, department: "Operators" },
  { rank: 3, name: "Falco Zegveld", value: 310000, department: "Engineering" },
  { rank: 4, name: "Mahesh Behari", value: 275000, department: "Operators" },
  { rank: 5, name: "Niels Florijn", value: 240000, department: "Engineering" },
];

export const gesprekkenGuru: CompetitionEntry[] = [
  { rank: 1, name: "Delano Nikkels", value: 128, department: "Engineering" },
  { rank: 2, name: "Christiaan van Krieken", value: 115, department: "Operators" },
  { rank: 3, name: "Mahesh Behari", value: 105, department: "Operators" },
  { rank: 4, name: "Falco Zegveld", value: 98, department: "Engineering" },
  { rank: 5, name: "Bart van Vliet", value: 92, department: "Monteurs" },
];

export const totalPotentialMargin = 2400000;

// Dashboard 4: Gedetacheerden
export const deployedStats = {
  active: 20,
  starting: 3,
  ending: 5,
};

export const deployedPersons: DeployedPerson[] = [
  { id: "d1", name: "Pieter Jansen", company: "ASML", startDate: "2025-03-15", endDate: null, consultant: "Delano Nikkels", status: "active" },
  { id: "d2", name: "Eva de Wit", company: "Philips", startDate: "2025-06-01", endDate: null, consultant: "Falco Zegveld", status: "active" },
  { id: "d3", name: "Lars Mulder", company: "Shell", startDate: "2025-01-10", endDate: "2026-03-31", consultant: "Christiaan van Krieken", status: "ending" },
  { id: "d4", name: "Nina Smeets", company: "ING", startDate: "2026-03-01", endDate: null, consultant: "Delano Nikkels", status: "starting" },
  { id: "d5", name: "Daan Bos", company: "Rabobank", startDate: "2025-09-01", endDate: null, consultant: "Mahesh Behari", status: "active" },
  { id: "d6", name: "Sanne Vos", company: "KLM", startDate: "2025-04-20", endDate: "2026-04-20", consultant: "Niels Florijn", status: "ending" },
  { id: "d7", name: "Rick van Dijk", company: "Booking.com", startDate: "2026-02-15", endDate: null, consultant: "Falco Zegveld", status: "starting" },
  { id: "d8", name: "Mila Bakker", company: "ABN AMRO", startDate: "2025-07-01", endDate: null, consultant: "Christiaan van Krieken", status: "active" },
  { id: "d9", name: "Tom Hendriks", company: "Heineken", startDate: "2025-11-01", endDate: "2026-02-28", consultant: "Delano Nikkels", status: "ending" },
  { id: "d10", name: "Fleur de Jong", company: "Unilever", startDate: "2026-03-10", endDate: null, consultant: "Mahesh Behari", status: "starting" },
  { id: "d11", name: "Bas Vermeer", company: "ASML", startDate: "2025-05-15", endDate: null, consultant: "Delano Nikkels", status: "active" },
  { id: "d12", name: "Julia Koning", company: "Philips", startDate: "2025-08-01", endDate: null, consultant: "Falco Zegveld", status: "active" },
];

export const revenueByPeriod: PeriodRevenue[] = [
  { period: "Periode 4", revenue: 1200000 },
  { period: "Periode 5", revenue: 1400000 },
  { period: "Periode 6", revenue: 1600000 },
];

// Unit Funnel Breakdown (Week)
export interface UnitFunnelRow {
  unit: string;
  subUnit?: string;
  color: string;
  toegewezen: number;
  ingeschreven: number;
  intakes: number;
  acquisities: number;
  voorstellenPerKandidaat: number;
  voorstellenViaEmail: number;
  uitnodigingenTotaal: number;
  nietUitgenodigd: number;
  welUitgenodigd: number;
  eersteGesprek: number;
  geenEersteGesprek: number;
  welEersteGesprek: number;
  vervolgGesprek: number;
  dealsluiter: number;
  geplaatst: number;
  gemDagenTotPlaatsing: number;
}

export interface ConsultantFunnelRow extends Omit<UnitFunnelRow, 'color'> {
  name: string;
}

export const weekUnitBreakdown: UnitFunnelRow[] = [
  { unit: "Engineering", color: "hsl(var(--primary))", toegewezen: 18, ingeschreven: 14, intakes: 10, acquisities: 5, voorstellenPerKandidaat: 2.1, voorstellenViaEmail: 6, uitnodigingenTotaal: 12, nietUitgenodigd: 4, welUitgenodigd: 8, eersteGesprek: 7, geenEersteGesprek: 3, welEersteGesprek: 4, vervolgGesprek: 3, dealsluiter: 2, geplaatst: 2, gemDagenTotPlaatsing: 28 },
  { unit: "Monteurs", color: "hsl(var(--chart-primary))", toegewezen: 10, ingeschreven: 8, intakes: 6, acquisities: 3, voorstellenPerKandidaat: 1.8, voorstellenViaEmail: 3, uitnodigingenTotaal: 6, nietUitgenodigd: 2, welUitgenodigd: 4, eersteGesprek: 3, geenEersteGesprek: 1, welEersteGesprek: 2, vervolgGesprek: 2, dealsluiter: 1, geplaatst: 1, gemDagenTotPlaatsing: 35 },
  { unit: "Operators", color: "hsl(var(--accent))", toegewezen: 15, ingeschreven: 12, intakes: 8, acquisities: 4, voorstellenPerKandidaat: 2.3, voorstellenViaEmail: 5, uitnodigingenTotaal: 9, nietUitgenodigd: 3, welUitgenodigd: 6, eersteGesprek: 5, geenEersteGesprek: 2, welEersteGesprek: 3, vervolgGesprek: 3, dealsluiter: 2, geplaatst: 2, gemDagenTotPlaatsing: 22 },
  { unit: "Trainingsunit", color: "hsl(var(--gold))", toegewezen: 7, ingeschreven: 5, intakes: 3, acquisities: 2, voorstellenPerKandidaat: 1.5, voorstellenViaEmail: 2, uitnodigingenTotaal: 4, nietUitgenodigd: 1, welUitgenodigd: 3, eersteGesprek: 2, geenEersteGesprek: 1, welEersteGesprek: 1, vervolgGesprek: 1, dealsluiter: 1, geplaatst: 1, gemDagenTotPlaatsing: 42 },
  { unit: "Early Performers", color: "hsl(var(--teal))", toegewezen: 4, ingeschreven: 3, intakes: 1, acquisities: 1, voorstellenPerKandidaat: 1.0, voorstellenViaEmail: 1, uitnodigingenTotaal: 2, nietUitgenodigd: 1, welUitgenodigd: 1, eersteGesprek: 1, geenEersteGesprek: 0, welEersteGesprek: 1, vervolgGesprek: 0, dealsluiter: 0, geplaatst: 0, gemDagenTotPlaatsing: 0 },
];

// Consultant-level breakdown per unit for Manager Acquisitie Conversie
export const consultantFunnelData: Record<string, ConsultantFunnelRow[]> = {
  Engineering: [
    { unit: "Engineering", name: "Delano Nikkels", toegewezen: 7, ingeschreven: 6, intakes: 4, acquisities: 2, voorstellenPerKandidaat: 2.5, voorstellenViaEmail: 3, uitnodigingenTotaal: 5, nietUitgenodigd: 1, welUitgenodigd: 4, eersteGesprek: 3, geenEersteGesprek: 1, welEersteGesprek: 2, vervolgGesprek: 2, dealsluiter: 1, geplaatst: 1, gemDagenTotPlaatsing: 25 },
    { unit: "Engineering", name: "Falco Zegveld", toegewezen: 6, ingeschreven: 5, intakes: 4, acquisities: 2, voorstellenPerKandidaat: 1.8, voorstellenViaEmail: 2, uitnodigingenTotaal: 4, nietUitgenodigd: 2, welUitgenodigd: 2, eersteGesprek: 2, geenEersteGesprek: 1, welEersteGesprek: 1, vervolgGesprek: 1, dealsluiter: 1, geplaatst: 1, gemDagenTotPlaatsing: 30 },
    { unit: "Engineering", name: "Niels Florijn", toegewezen: 5, ingeschreven: 3, intakes: 2, acquisities: 1, voorstellenPerKandidaat: 2.0, voorstellenViaEmail: 1, uitnodigingenTotaal: 3, nietUitgenodigd: 1, welUitgenodigd: 2, eersteGesprek: 2, geenEersteGesprek: 1, welEersteGesprek: 1, vervolgGesprek: 0, dealsluiter: 0, geplaatst: 0, gemDagenTotPlaatsing: 0 },
  ],
  Monteurs: [
    { unit: "Monteurs", name: "Bart van Vliet", toegewezen: 5, ingeschreven: 4, intakes: 3, acquisities: 2, voorstellenPerKandidaat: 2.0, voorstellenViaEmail: 2, uitnodigingenTotaal: 3, nietUitgenodigd: 1, welUitgenodigd: 2, eersteGesprek: 2, geenEersteGesprek: 1, welEersteGesprek: 1, vervolgGesprek: 1, dealsluiter: 1, geplaatst: 1, gemDagenTotPlaatsing: 33 },
    { unit: "Monteurs", name: "Kaylee van den Berg", toegewezen: 5, ingeschreven: 4, intakes: 3, acquisities: 1, voorstellenPerKandidaat: 1.5, voorstellenViaEmail: 1, uitnodigingenTotaal: 3, nietUitgenodigd: 1, welUitgenodigd: 2, eersteGesprek: 1, geenEersteGesprek: 0, welEersteGesprek: 1, vervolgGesprek: 1, dealsluiter: 0, geplaatst: 0, gemDagenTotPlaatsing: 0 },
  ],
  Operators: [
    { unit: "Operators", name: "Christiaan van Krieken", toegewezen: 8, ingeschreven: 7, intakes: 5, acquisities: 2, voorstellenPerKandidaat: 2.5, voorstellenViaEmail: 3, uitnodigingenTotaal: 5, nietUitgenodigd: 1, welUitgenodigd: 4, eersteGesprek: 3, geenEersteGesprek: 1, welEersteGesprek: 2, vervolgGesprek: 2, dealsluiter: 1, geplaatst: 1, gemDagenTotPlaatsing: 20 },
    { unit: "Operators", name: "Mahesh Behari", toegewezen: 7, ingeschreven: 5, intakes: 3, acquisities: 2, voorstellenPerKandidaat: 2.0, voorstellenViaEmail: 2, uitnodigingenTotaal: 4, nietUitgenodigd: 2, welUitgenodigd: 2, eersteGesprek: 2, geenEersteGesprek: 1, welEersteGesprek: 1, vervolgGesprek: 1, dealsluiter: 1, geplaatst: 1, gemDagenTotPlaatsing: 24 },
  ],
  Trainingsunit: [
    { unit: "Trainingsunit", name: "Dees Beeking", toegewezen: 7, ingeschreven: 5, intakes: 3, acquisities: 2, voorstellenPerKandidaat: 1.5, voorstellenViaEmail: 2, uitnodigingenTotaal: 4, nietUitgenodigd: 1, welUitgenodigd: 3, eersteGesprek: 2, geenEersteGesprek: 1, welEersteGesprek: 1, vervolgGesprek: 1, dealsluiter: 1, geplaatst: 1, gemDagenTotPlaatsing: 40 },
  ],
  "Early Performers": [
    { unit: "Early Performers", name: "Ted Bronkhorst", toegewezen: 4, ingeschreven: 3, intakes: 1, acquisities: 1, voorstellenPerKandidaat: 1.0, voorstellenViaEmail: 1, uitnodigingenTotaal: 2, nietUitgenodigd: 1, welUitgenodigd: 1, eersteGesprek: 1, geenEersteGesprek: 0, welEersteGesprek: 1, vervolgGesprek: 0, dealsluiter: 0, geplaatst: 0, gemDagenTotPlaatsing: 0 },
  ],
};

export interface ConversionStep {
  from: string;
  to: string;
  rate: number;
}

export interface UnitConversion {
  unit: string;
  conversions: ConversionStep[];
}

export const weekOverallConversions: ConversionStep[] = [
  { from: "Inschrijvingen", to: "Acquisities", rate: 35.7 },
  { from: "Acquisities", to: "Voorstellen", rate: 146.7 },
  { from: "Voorstellen", to: "Gesprekken", rate: 81.8 },
  { from: "Gesprekken", to: "Plaatsingen", rate: 33.3 },
];

export const periodOverallConversions: ConversionStep[] = [
  { from: "Inschrijvingen", to: "Acquisities", rate: 36.6 },
  { from: "Acquisities", to: "Voorstellen", rate: 139.7 },
  { from: "Voorstellen", to: "Gesprekken", rate: 82.1 },
];

export const periodUnitBreakdown: UnitFunnelRow[] = [
  { unit: "Engineering", color: "hsl(var(--primary))", toegewezen: 72, ingeschreven: 56, intakes: 40, acquisities: 20, voorstellenPerKandidaat: 2.2, voorstellenViaEmail: 24, uitnodigingenTotaal: 48, nietUitgenodigd: 16, welUitgenodigd: 32, eersteGesprek: 28, geenEersteGesprek: 12, welEersteGesprek: 16, vervolgGesprek: 12, dealsluiter: 8, geplaatst: 8, gemDagenTotPlaatsing: 27 },
  { unit: "Monteurs", color: "hsl(var(--chart-primary))", toegewezen: 40, ingeschreven: 32, intakes: 24, acquisities: 12, voorstellenPerKandidaat: 1.9, voorstellenViaEmail: 12, uitnodigingenTotaal: 24, nietUitgenodigd: 8, welUitgenodigd: 16, eersteGesprek: 12, geenEersteGesprek: 4, welEersteGesprek: 8, vervolgGesprek: 8, dealsluiter: 4, geplaatst: 4, gemDagenTotPlaatsing: 34 },
  { unit: "Operators", color: "hsl(var(--accent))", toegewezen: 60, ingeschreven: 48, intakes: 32, acquisities: 16, voorstellenPerKandidaat: 2.4, voorstellenViaEmail: 20, uitnodigingenTotaal: 36, nietUitgenodigd: 12, welUitgenodigd: 24, eersteGesprek: 20, geenEersteGesprek: 8, welEersteGesprek: 12, vervolgGesprek: 12, dealsluiter: 8, geplaatst: 8, gemDagenTotPlaatsing: 21 },
  { unit: "Trainingsunit", color: "hsl(var(--gold))", toegewezen: 28, ingeschreven: 20, intakes: 12, acquisities: 8, voorstellenPerKandidaat: 1.6, voorstellenViaEmail: 8, uitnodigingenTotaal: 16, nietUitgenodigd: 4, welUitgenodigd: 12, eersteGesprek: 8, geenEersteGesprek: 4, welEersteGesprek: 4, vervolgGesprek: 4, dealsluiter: 4, geplaatst: 4, gemDagenTotPlaatsing: 40 },
  { unit: "Early Performers", color: "hsl(var(--teal))", toegewezen: 16, ingeschreven: 12, intakes: 4, acquisities: 4, voorstellenPerKandidaat: 1.1, voorstellenViaEmail: 4, uitnodigingenTotaal: 8, nietUitgenodigd: 4, welUitgenodigd: 4, eersteGesprek: 4, geenEersteGesprek: 0, welEersteGesprek: 4, vervolgGesprek: 0, dealsluiter: 0, geplaatst: 0, gemDagenTotPlaatsing: 0 },
];

export const periodCallStatsDaily: DayCallStat[] = [
  { day: "Wk1", outbound: 285, duration: 2400 },
  { day: "Wk2", outbound: 310, duration: 2680 },
  { day: "Wk3", outbound: 265, duration: 2200 },
  { day: "Wk4", outbound: 340, duration: 2920 },
];

export const periodGesprekkenPerUnit = [
  { unit: "Engineering", gesprekken: 28, acquisitieCalls: 168 },
  { unit: "Monteurs", gesprekken: 12, acquisitieCalls: 96 },
  { unit: "Operators", gesprekken: 20, acquisitieCalls: 144 },
  { unit: "Trainingsunit", gesprekken: 8, acquisitieCalls: 72 },
  { unit: "Early Performers", gesprekken: 4, acquisitieCalls: 36 },
];

export const periodMailStats = {
  totalAcquisitieMails: 536,
  perDay: [
    { day: "Wk1", mails: 128 },
    { day: "Wk2", mails: 142 },
    { day: "Wk3", mails: 108 },
    { day: "Wk4", mails: 158 },
  ],
  perUnit: [
    { unit: "Engineering", mails: 168 },
    { unit: "Monteurs", mails: 96 },
    { unit: "Operators", mails: 152 },
    { unit: "Trainingsunit", mails: 72 },
    { unit: "Early Performers", mails: 48 },
  ],
};

export const weekUnitConversions: UnitConversion[] = [
  { unit: "Engineering", conversions: [
    { from: "Inschrijvingen", to: "Intakes", rate: 71.4 },
    { from: "Intakes", to: "Acquisities", rate: 50.0 },
    { from: "Acquisities", to: "Voorstellen", rate: 160.0 },
    { from: "Voorstellen", to: "Gesprekken", rate: 87.5 },
    { from: "Gesprekken", to: "Plaatsingen", rate: 28.6 },
  ]},
  { unit: "Monteurs", conversions: [
    { from: "Inschrijvingen", to: "Intakes", rate: 62.5 },
    { from: "Intakes", to: "Acquisities", rate: 60.0 },
    { from: "Acquisities", to: "Voorstellen", rate: 133.3 },
    { from: "Voorstellen", to: "Gesprekken", rate: 75.0 },
    { from: "Gesprekken", to: "Plaatsingen", rate: 33.3 },
  ]},
  { unit: "Operators", conversions: [
    { from: "Inschrijvingen", to: "Intakes", rate: 66.7 },
    { from: "Intakes", to: "Acquisities", rate: 50.0 },
    { from: "Acquisities", to: "Voorstellen", rate: 150.0 },
    { from: "Voorstellen", to: "Gesprekken", rate: 83.3 },
    { from: "Gesprekken", to: "Plaatsingen", rate: 40.0 },
  ]},
  { unit: "Trainingsunit", conversions: [
    { from: "Inschrijvingen", to: "Intakes", rate: 60.0 },
    { from: "Intakes", to: "Acquisities", rate: 66.7 },
    { from: "Acquisities", to: "Voorstellen", rate: 150.0 },
    { from: "Voorstellen", to: "Gesprekken", rate: 66.7 },
    { from: "Gesprekken", to: "Plaatsingen", rate: 50.0 },
  ]},
  { unit: "Early Performers", conversions: [
    { from: "Inschrijvingen", to: "Intakes", rate: 66.7 },
    { from: "Intakes", to: "Acquisities", rate: 50.0 },
    { from: "Acquisities", to: "Voorstellen", rate: 100.0 },
    { from: "Voorstellen", to: "Gesprekken", rate: 100.0 },
    { from: "Gesprekken", to: "Plaatsingen", rate: 0.0 },
  ]},
];

export const weekGesprekkenPerUnit = [
  { unit: "Engineering", gesprekken: 7, acquisitieCalls: 42 },
  { unit: "Monteurs", gesprekken: 3, acquisitieCalls: 24 },
  { unit: "Operators", gesprekken: 5, acquisitieCalls: 36 },
  { unit: "Trainingsunit", gesprekken: 2, acquisitieCalls: 18 },
  { unit: "Early Performers", gesprekken: 1, acquisitieCalls: 9 },
];

export const weekMailStats = {
  totalAcquisitieMails: 134,
  perDay: [
    { day: "Ma", mails: 32 },
    { day: "Di", mails: 28 },
    { day: "Wo", mails: 22 },
    { day: "Do", mails: 35 },
    { day: "Vr", mails: 17 },
  ],
  perUnit: [
    { unit: "Engineering", mails: 42 },
    { unit: "Monteurs", mails: 24 },
    { unit: "Operators", mails: 38 },
    { unit: "Trainingsunit", mails: 18 },
    { unit: "Early Performers", mails: 12 },
  ],
};

export const bonusData = {
  lastMonth: 12500,
  last12Months: 148000,
  monthlyTrend: [
    { month: "Mrt", amount: 9800 },
    { month: "Apr", amount: 11200 },
    { month: "Mei", amount: 10500 },
    { month: "Jun", amount: 13400 },
    { month: "Jul", amount: 12100 },
    { month: "Aug", amount: 11800 },
    { month: "Sep", amount: 14200 },
    { month: "Okt", amount: 12800 },
    { month: "Nov", amount: 13600 },
    { month: "Dec", amount: 15100 },
    { month: "Jan", amount: 10900 },
    { month: "Feb", amount: 12500 },
  ],
};

// === Auto-generated consultant funnel rows for all 56 consultants ===
// Deterministic distribution of unit-level totals across each unit's consultants.
import { allConsultantsList } from "./ranglijstenData";

function distribute(total: number, weights: number[]): number[] {
  const sum = weights.reduce((s, w) => s + w, 0) || 1;
  const raw = weights.map(w => (total * w) / sum);
  const floored = raw.map(v => Math.floor(v));
  let remainder = total - floored.reduce((s, v) => s + v, 0);
  const fracs = raw.map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < remainder; k++) floored[fracs[k % fracs.length].i] += 1;
  return floored;
}

function buildConsultantRowsForUnit(unitRow: UnitFunnelRow, names: string[]): ConsultantFunnelRow[] {
  // Pseudo-random but stable weights per consultant (based on name hash)
  const weights = names.map(n => {
    let h = 0;
    for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) & 0xffff;
    return 0.5 + ((h % 100) / 100); // 0.5..1.5
  });
  const numericKeys: (keyof Omit<UnitFunnelRow, "unit" | "color" | "subUnit" | "voorstellenPerKandidaat" | "gemDagenTotPlaatsing">)[] = [
    "toegewezen", "ingeschreven", "intakes", "acquisities",
    "voorstellenViaEmail", "uitnodigingenTotaal", "nietUitgenodigd", "welUitgenodigd",
    "eersteGesprek", "geenEersteGesprek", "welEersteGesprek",
    "vervolgGesprek", "dealsluiter", "geplaatst",
  ];
  const distributed: Record<string, number[]> = {};
  numericKeys.forEach(k => {
    distributed[k as string] = distribute(unitRow[k] as number, weights);
  });
  return names.map((name, idx) => {
    const row: ConsultantFunnelRow = {
      unit: unitRow.unit,
      name,
      toegewezen: distributed.toegewezen[idx],
      ingeschreven: distributed.ingeschreven[idx],
      intakes: distributed.intakes[idx],
      acquisities: distributed.acquisities[idx],
      voorstellenPerKandidaat: unitRow.voorstellenPerKandidaat,
      voorstellenViaEmail: distributed.voorstellenViaEmail[idx],
      uitnodigingenTotaal: distributed.uitnodigingenTotaal[idx],
      nietUitgenodigd: distributed.nietUitgenodigd[idx],
      welUitgenodigd: distributed.welUitgenodigd[idx],
      eersteGesprek: distributed.eersteGesprek[idx],
      geenEersteGesprek: distributed.geenEersteGesprek[idx],
      welEersteGesprek: distributed.welEersteGesprek[idx],
      vervolgGesprek: distributed.vervolgGesprek[idx],
      dealsluiter: distributed.dealsluiter[idx],
      geplaatst: distributed.geplaatst[idx],
      gemDagenTotPlaatsing: unitRow.gemDagenTotPlaatsing,
    };
    return row;
  });
}

function buildAllConsultantData(unitBreakdown: UnitFunnelRow[]): Record<string, ConsultantFunnelRow[]> {
  const result: Record<string, ConsultantFunnelRow[]> = {};
  for (const unitRow of unitBreakdown) {
    const names = allConsultantsList
      .filter(c => c.unit === unitRow.unit && c.isActive)
      .map(c => c.fullName);
    result[unitRow.unit] = buildConsultantRowsForUnit(unitRow, names);
  }
  return result;
}

export const weekConsultantFunnelData = buildAllConsultantData(weekUnitBreakdown);
export const periodConsultantFunnelData = buildAllConsultantData(periodUnitBreakdown);
