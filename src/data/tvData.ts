// TV Dashboard Mock Data

export interface FunnelMetric {
  label: string;
  value: number;
  change: number; // percentage
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
  duration: number; // minutes
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
  { label: "Intakes", value: 28, change: 5, icon: "ClipboardList" },
  { label: "Acquisities", value: 15, change: -3, icon: "Target" },
  { label: "Voorstellen", value: 22, change: 8, icon: "FileText" },
  { label: "Gesprekken", value: 18, change: 2, icon: "MessageSquare" },
  { label: "Plaatsingen", value: 6, change: 15, icon: "CheckCircle" },
];

// Dashboard 2: Period Sales Funnel
export const periodFunnelMetrics: FunnelMetric[] = [
  { label: "Inschrijvingen", value: 186, change: 9, icon: "UserPlus" },
  { label: "Intakes", value: 124, change: 4, icon: "ClipboardList" },
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
    { rank: 1, name: "Sophie de Vries", value: 180000, change: 32, department: "Engineering" },
    { rank: 2, name: "Thomas Bakker", value: 120000, change: 24, department: "Engineering" },
    { rank: 3, name: "Kevin Hendriks", value: 95000, change: 18, department: "Operators" },
    { rank: 4, name: "Emma Visser", value: 82000, change: 15, department: "Engineering" },
    { rank: 5, name: "Mark de Groot", value: 68000, change: 12, department: "Operators" },
  ],
  dalers: [
    { rank: 1, name: "Rianne Willems", value: -45000, change: -18, department: "Operators" },
    { rank: 2, name: "Jan Smit", value: -32000, change: -12, department: "Monteurs" },
    { rank: 3, name: "Lisa de Boer", value: -18000, change: -8, department: "Monteurs" },
  ],
};

export const plaatsingsKoning: CompetitionEntry[] = [
  { rank: 1, name: "Kevin Hendriks", value: 5, department: "Operators" },
  { rank: 2, name: "Sophie de Vries", value: 4, department: "Engineering" },
  { rank: 3, name: "Mark de Groot", value: 4, department: "Operators" },
  { rank: 4, name: "Thomas Bakker", value: 3, department: "Engineering" },
  { rank: 5, name: "Emma Visser", value: 3, department: "Engineering" },
];

export const margeBaas: CompetitionEntry[] = [
  { rank: 1, name: "Sophie de Vries", value: 420000, department: "Engineering" },
  { rank: 2, name: "Kevin Hendriks", value: 380000, department: "Operators" },
  { rank: 3, name: "Thomas Bakker", value: 310000, department: "Engineering" },
  { rank: 4, name: "Mark de Groot", value: 275000, department: "Operators" },
  { rank: 5, name: "Emma Visser", value: 240000, department: "Engineering" },
];

export const gesprekkenGuru: CompetitionEntry[] = [
  { rank: 1, name: "Sophie de Vries", value: 128, department: "Engineering" },
  { rank: 2, name: "Kevin Hendriks", value: 115, department: "Operators" },
  { rank: 3, name: "Mark de Groot", value: 105, department: "Operators" },
  { rank: 4, name: "Thomas Bakker", value: 98, department: "Engineering" },
  { rank: 5, name: "Jan Smit", value: 92, department: "Monteurs" },
];

export const totalPotentialMargin = 2400000;

// Dashboard 4: Gedetacheerden
export const deployedStats = {
  active: 20,
  starting: 3,
  ending: 5,
};

export const deployedPersons: DeployedPerson[] = [
  { id: "d1", name: "Pieter Jansen", company: "ASML", startDate: "2025-03-15", endDate: null, consultant: "Sophie de Vries", status: "active" },
  { id: "d2", name: "Eva de Wit", company: "Philips", startDate: "2025-06-01", endDate: null, consultant: "Thomas Bakker", status: "active" },
  { id: "d3", name: "Lars Mulder", company: "Shell", startDate: "2025-01-10", endDate: "2026-03-31", consultant: "Kevin Hendriks", status: "ending" },
  { id: "d4", name: "Nina Smeets", company: "ING", startDate: "2026-03-01", endDate: null, consultant: "Sophie de Vries", status: "starting" },
  { id: "d5", name: "Daan Bos", company: "Rabobank", startDate: "2025-09-01", endDate: null, consultant: "Mark de Groot", status: "active" },
  { id: "d6", name: "Sanne Vos", company: "KLM", startDate: "2025-04-20", endDate: "2026-04-20", consultant: "Emma Visser", status: "ending" },
  { id: "d7", name: "Rick van Dijk", company: "Booking.com", startDate: "2026-02-15", endDate: null, consultant: "Thomas Bakker", status: "starting" },
  { id: "d8", name: "Mila Bakker", company: "ABN AMRO", startDate: "2025-07-01", endDate: null, consultant: "Kevin Hendriks", status: "active" },
  { id: "d9", name: "Tom Hendriks", company: "Heineken", startDate: "2025-11-01", endDate: "2026-02-28", consultant: "Sophie de Vries", status: "ending" },
  { id: "d10", name: "Fleur de Jong", company: "Unilever", startDate: "2026-03-10", endDate: null, consultant: "Mark de Groot", status: "starting" },
  { id: "d11", name: "Bas Vermeer", company: "ASML", startDate: "2025-05-15", endDate: null, consultant: "Sophie de Vries", status: "active" },
  { id: "d12", name: "Julia Koning", company: "Philips", startDate: "2025-08-01", endDate: null, consultant: "Thomas Bakker", status: "active" },
];

export const revenueByPeriod: PeriodRevenue[] = [
  { period: "Periode 4", revenue: 1200000 },
  { period: "Periode 5", revenue: 1400000 },
  { period: "Periode 6", revenue: 1600000 },
];

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
