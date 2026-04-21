import { allAdminConsultants, departments } from "./adminData";

export interface ConsultantLifecycle {
  id: number;
  name: string;
  unit: string;
  unitColor: string;
  role: string;
  avatar: string;
  startDate: Date;
  endDate?: Date;
  monthlyCost: number;
  monthlyMargin: number[]; // margin per month since start
}

export interface BreakEvenResult {
  breakEvenMonth: number | null; // null = not yet reached
  startupCost: number; // cumulative loss until break-even (positive number)
  cumulativeSeries: { month: number; balance: number; revenue: number; cost: number }[];
  totalMonths: number;
  currentBalance: number;
  profitSinceBreakEven: number;
}

const MARGIN_PCT = 0.23;

function roleMonthlyCost(role: string): number {
  const r = role.toLowerCase();
  if (r.includes("senior")) return 8000;
  if (r.includes("junior")) return 5000;
  return 6500;
}

function generateMonthlyMargin(targetAnnualRevenue: number, monthsActive: number): number[] {
  // Annual margin target
  const targetMonthlyMargin = (targetAnnualRevenue * MARGIN_PCT) / 12;
  const series: number[] = [];
  for (let m = 0; m < monthsActive; m++) {
    let factor: number;
    if (m < 2) factor = 0.05 + m * 0.05; // very low first 2 months
    else if (m < 5) factor = 0.15 + (m - 2) * 0.15; // ramp up
    else if (m < 9) factor = 0.6 + (m - 5) * 0.08; // approach steady
    else factor = 0.95 + Math.sin(m * 0.7) * 0.1; // steady with variance
    const value = Math.round(targetMonthlyMargin * factor);
    series.push(Math.max(0, value));
  }
  return series;
}

function monthsBetween(start: Date, end: Date): number {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

const NOW = new Date(2025, 3, 1); // April 2025

// Generate lifecycles
export const consultantLifecycles: ConsultantLifecycle[] = allAdminConsultants.map((c, i) => {
  // Vary start date between 4 and 30 months ago
  const monthsAgo = 4 + ((i * 7) % 27);
  const startDate = new Date(NOW.getFullYear(), NOW.getMonth() - monthsAgo, 1);

  // Some have ended (about 12%)
  const isTerminated = i % 9 === 0 && monthsAgo > 10;
  const endDate = isTerminated
    ? new Date(NOW.getFullYear(), NOW.getMonth() - (monthsAgo - 8 - (i % 5)), 1)
    : undefined;

  const lastMonth = endDate ?? NOW;
  const activeMonths = Math.max(1, monthsBetween(startDate, lastMonth) + 1);

  const dept = departments.find((d) => d.consultantIds.includes(c.id));
  const unitName = dept?.name ?? c.unit;
  const unitColor = dept?.color ?? "hsl(var(--primary))";

  return {
    id: c.id,
    name: c.name,
    unit: unitName,
    unitColor,
    role: c.role,
    avatar: c.avatar,
    startDate,
    endDate,
    monthlyCost: roleMonthlyCost(c.role),
    monthlyMargin: generateMonthlyMargin(c.revenue, activeMonths),
  };
});

export function computeBreakEven(lc: ConsultantLifecycle): BreakEvenResult {
  let cumulative = 0;
  let breakEvenMonth: number | null = null;
  let startupCost = 0;
  const series: BreakEvenResult["cumulativeSeries"] = [];

  for (let m = 0; m < lc.monthlyMargin.length; m++) {
    const revenue = lc.monthlyMargin[m];
    const cost = lc.monthlyCost;
    cumulative += revenue - cost;
    series.push({ month: m, balance: cumulative, revenue, cost });
    if (breakEvenMonth === null && cumulative >= 0) {
      breakEvenMonth = m;
      startupCost = Math.abs(Math.min(...series.slice(0, m + 1).map((s) => s.balance)));
    }
  }

  if (breakEvenMonth === null) {
    startupCost = Math.abs(Math.min(...series.map((s) => s.balance), 0));
  }

  const profitSinceBreakEven =
    breakEvenMonth !== null ? cumulative + startupCost : 0;

  return {
    breakEvenMonth,
    startupCost,
    cumulativeSeries: series,
    totalMonths: lc.monthlyMargin.length,
    currentBalance: cumulative,
    profitSinceBreakEven,
  };
}

// Pre-compute all
export const lifecyclesWithBreakEven = consultantLifecycles.map((lc) => ({
  lifecycle: lc,
  result: computeBreakEven(lc),
}));

export type LifecycleStatus = "startup" | "profitable" | "terminated";

export function getStatus(lc: ConsultantLifecycle, br: BreakEvenResult): LifecycleStatus {
  if (lc.endDate) return "terminated";
  if (br.breakEvenMonth === null) return "startup";
  return "profitable";
}

// Aggregations
export function getTotalStartupInvestment(): number {
  return lifecyclesWithBreakEven.reduce((sum, x) => sum + x.result.startupCost, 0);
}

export function getAverageBreakEvenMonths(): number {
  const reached = lifecyclesWithBreakEven.filter((x) => x.result.breakEvenMonth !== null);
  if (!reached.length) return 0;
  return Math.round(
    reached.reduce((s, x) => s + (x.result.breakEvenMonth as number), 0) / reached.length,
  );
}

export function getActiveStartupCount(): number {
  return lifecyclesWithBreakEven.filter(
    (x) => !x.lifecycle.endDate && x.result.breakEvenMonth === null,
  ).length;
}

export function getCohortROI(): number {
  const totalProfit = lifecyclesWithBreakEven.reduce(
    (s, x) => s + Math.max(0, x.result.profitSinceBreakEven),
    0,
  );
  const totalStartup = getTotalStartupInvestment();
  return totalStartup > 0 ? totalProfit / totalStartup : 0;
}

export function getStartupCostByUnit() {
  const byUnit = new Map<string, { name: string; color: string; total: number; count: number }>();
  for (const { lifecycle, result } of lifecyclesWithBreakEven) {
    const key = lifecycle.unit;
    const existing = byUnit.get(key) ?? { name: key, color: lifecycle.unitColor, total: 0, count: 0 };
    existing.total += result.startupCost;
    existing.count += 1;
    byUnit.set(key, existing);
  }
  return Array.from(byUnit.values()).map((u) => ({
    name: u.name,
    color: u.color,
    avgStartup: Math.round(u.total / u.count),
    total: u.total,
    count: u.count,
  }));
}

export function getBreakEvenDistributionFor(
  rows: { result: BreakEvenResult }[] = lifecyclesWithBreakEven,
) {
  const buckets = [
    { label: "M0-M3", min: 0, max: 3, count: 0 },
    { label: "M3-M6", min: 3, max: 6, count: 0 },
    { label: "M6-M9", min: 6, max: 9, count: 0 },
    { label: "M9-M12", min: 9, max: 12, count: 0 },
    { label: "M12+", min: 12, max: Infinity, count: 0 },
    { label: "Niet bereikt", min: -1, max: -1, count: 0 },
  ];
  for (const { result } of rows) {
    if (result.breakEvenMonth === null) {
      buckets[buckets.length - 1].count += 1;
    } else {
      const b = buckets.find((x) => result.breakEvenMonth! >= x.min && result.breakEvenMonth! < x.max);
      if (b) b.count += 1;
    }
  }
  return buckets;
}

export function getBreakEvenDistribution() {
  return getBreakEvenDistributionFor(lifecyclesWithBreakEven);
}

export function getAvailableCohortYears(): number[] {
  const years = new Set<number>();
  for (const lc of consultantLifecycles) years.add(lc.startDate.getFullYear());
  return Array.from(years).sort((a, b) => a - b);
}

/** Map calendar month (0-11) to period (1-13). */
export function monthToPeriod(month: number): number {
  return Math.min(13, Math.max(1, Math.floor(month * 13 / 12) + 1));
}

export function formatEuro(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `€${(n / 1_000).toFixed(0)}k`;
  return `€${Math.round(n)}`;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("nl-NL", { month: "short", year: "numeric" });
}
