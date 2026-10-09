import { addDays, addMonths, differenceInCalendarDays, format, startOfDay, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { nl } from "date-fns/locale";
import { paidChannelData } from "@/marketing-dashboard/data/marketingHubData";
import { filterMarketingRows, type MarketingFilterRule } from "@/marketing-dashboard/lib/marketingFilters";

export type ForecastMetric = "conversions" | "registrations" | "qualityScoreConv" | "qualityScoreBem";
export const FORECAST_METRICS: { key: ForecastMetric; label: string }[] = [{ key: "conversions", label: "Conversions" }, { key: "registrations", label: "Inschrijven" }, { key: "qualityScoreConv", label: "Quality score conv." }, { key: "qualityScoreBem", label: "Quality score bem." }];
export type ForecastPeriod = "week" | "month";
export interface ForecastRow {
  date: Date; source: string; campaign: string; ad: string; unit: string; functiegroep: string;
  conversions: number; registrations: number; qualityScore: number;
}
const hash = (value: string) => [...value].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 100003, 7);

/** Synthetic daily cohorts: never combine overlapping channel and ad datasets. */
export function buildForecastDemoData(asOf: Date): ForecastRow[] {
  const historyEnd = startOfMonth(asOf);
  const historyStart = subMonths(historyEnd, 6);
  const rows: ForecastRow[] = [];
  for (let date = historyStart; date < startOfDay(asOf); date = addDays(date, 1)) {
    for (const row of paidChannelData) {
      const campaign = `${row.unit.toLowerCase()} - ${row.source.toLowerCase()} conversion`;
      const seed = hash(`${row.source}-${row.unit}`);
      const baseline = 0.9 + (hash(format(date, "yyyy-MM-dd")) % 21) / 100;
      const current = date >= historyEnd ? 0.58 + (seed % 90) / 100 : 1;
      rows.push({ date, source: row.source, campaign, ad: "Go Video", unit: row.unit, functiegroep: row.functiegroep,
        conversions: Math.round(row.conversions / 7 * baseline * current),
        registrations: Math.round(row.registrations / 7 * baseline * current),
        // Bounded per-source quality with small daily variance; current period shifted per source.
        qualityScore: Math.min(100, Math.max(0, 62 + (seed % 25) + ((hash(format(date, "dd")) % 7) - 3) + (date >= historyEnd ? ((seed >> 3) % 15) - 7 : 0))) });
    }
  }
  return rows;
}

export function filterForecastRows(rows: ForecastRow[], filters: MarketingFilterRule[]) {
  return filterMarketingRows(rows, filters, row => ({ bron: row.source, campagne: row.campaign, ad: row.ad, unit: row.unit, functiegroep: row.functiegroep }));
}

const weightedQuality = (rows: ForecastRow[]) => {
  const weight = rows.reduce((sum, row) => sum + Math.max(0, row.conversions), 0);
  return weight > 0 ? rows.reduce((sum, row) => sum + row.qualityScore * Math.max(0, row.conversions), 0) / weight : 0;
};

/** Quality is a conversion-weighted mean, not a sum: compare running period mean with the six-month mean (±5% band). */
function calculateQualityForecast(rows: ForecastRow[], asOf: Date, period: ForecastPeriod) {
  const anchor = startOfDay(asOf);
  const start = period === "week" ? startOfWeek(anchor, { weekStartsOn: 1 }) : startOfMonth(anchor);
  const end = period === "week" ? addDays(start, 7) : addMonths(start, 1);
  const historyEnd = startOfMonth(anchor);
  const historyStart = subMonths(historyEnd, 6);
  const target = weightedQuality(rows.filter(row => row.date >= historyStart && row.date < historyEnd));
  const currentRows = rows.filter(row => row.date >= start && row.date < anchor);
  const totalDays = differenceInCalendarDays(end, start);
  const elapsedDays = differenceInCalendarDays(anchor, start);
  const actual = weightedQuality(currentRows);
  const progress = target > 0 && elapsedDays > 0 ? actual / target * 100 : 0;
  const deviation = target > 0 && elapsedDays > 0 ? (actual / target - 1) * 100 : null;
  const status = target === 0 ? "no-data" : elapsedDays === 0 ? "not-started" : (deviation ?? 0) < -5 ? "behind" : (deviation ?? 0) > 5 ? "ahead" : "on-track";
  const points = Array.from({ length: totalDays + 1 }, (_, day) => {
    const date = addDays(start, day);
    const sofar = currentRows.filter(row => differenceInCalendarDays(row.date, start) < day);
    return { label: format(date, "d MMM", { locale: nl }), expected: 100, actual: day > 0 && day <= elapsedDays && target > 0 ? weightedQuality(sofar) / target * 100 : null };
  });
  return { start, end, historyStart, historyEnd, target, actual, expected: target, expectedPct: 100, progress, deviation, projectedPct: elapsedDays > 0 ? progress : null, status, elapsedDays, totalDays, points };
}

export function calculateForecast(rows: ForecastRow[], asOf: Date, period: ForecastPeriod, metric: ForecastMetric) {
  if (metric.startsWith("qualityScore")) return calculateQualityForecast(rows, asOf, period);
  const anchor = startOfDay(asOf);
  const start = period === "week" ? startOfWeek(anchor, { weekStartsOn: 1 }) : startOfMonth(anchor);
  const end = period === "week" ? addDays(start, 7) : addMonths(start, 1);
  const historyEnd = startOfMonth(anchor);
  const historyStart = subMonths(historyEnd, 6);
  // Only completed Monday–Sunday weeks fully inside the six completed months.
  let firstWeek = startOfWeek(historyStart, { weekStartsOn: 1 });
  if (firstWeek < historyStart) firstWeek = addDays(firstWeek, 7);
  const weekCount = Math.floor(differenceInCalendarDays(historyEnd, firstWeek) / 7);
  const baselineStart = period === "week" ? firstWeek : historyStart;
  const baselineEnd = period === "week" ? addDays(firstWeek, weekCount * 7) : historyEnd;
  const countKey = metric === "registrations" ? "registrations" : "conversions";
  const historyTotal = rows.filter(row => row.date >= baselineStart && row.date < baselineEnd).reduce((sum, row) => sum + row[countKey], 0);
  const target = historyTotal / (period === "week" ? weekCount : 6);
  const currentRows = rows.filter(row => row.date >= start && row.date < anchor);
  const actual = currentRows.reduce((sum, row) => sum + row[countKey], 0);
  const totalDays = differenceInCalendarDays(end, start);
  const elapsedDays = differenceInCalendarDays(anchor, start);
  const expectedPct = elapsedDays / totalDays * 100;
  const expected = target * elapsedDays / totalDays;
  const progress = target > 0 ? actual / target * 100 : 0;
  const deviation = expected > 0 ? (actual / expected - 1) * 100 : null;
  const projectedPct = elapsedDays > 0 && target > 0 ? progress / (elapsedDays / totalDays) : null;
  const status = target === 0 ? "no-data" : elapsedDays === 0 ? "not-started" : (deviation ?? 0) < -20 ? "behind" : (deviation ?? 0) > 20 ? "ahead" : "on-track";
  let cumulative = 0;
  const points = Array.from({ length: totalDays + 1 }, (_, day) => {
    const date = addDays(start, day);
    if (day > 0 && day <= elapsedDays) cumulative += currentRows.filter(row => differenceInCalendarDays(row.date, start) === day - 1).reduce((sum, row) => sum + row[countKey], 0);
    return { label: format(date, "d MMM", { locale: nl }), expected: day / totalDays * 100, actual: day <= elapsedDays && target > 0 ? cumulative / target * 100 : null };
  });
  return { start, end, historyStart, historyEnd, target, actual, expected, expectedPct, progress, deviation, projectedPct, status, elapsedDays, totalDays, points };
}
export type ForecastResult = ReturnType<typeof calculateForecast>;

export function forecastBreakdown(rows: ForecastRow[], asOf: Date, period: ForecastPeriod, metric: ForecastMetric, group: "source" | "campaign") {
  const groups = new Map<string, ForecastRow[]>();
  for (const row of rows) {
    const key = group === "source" ? row.source : `${row.source}\u0000${row.campaign}`;
    const existing = groups.get(key) ?? [];
    existing.push(row); groups.set(key, existing);
  }
  return [...groups.values()].map(groupRows => ({ name: group === "source" ? groupRows[0]?.source ?? "" : groupRows[0]?.campaign ?? "", source: groupRows[0]?.source ?? "", ...calculateForecast(groupRows, asOf, period, metric) }))
    .sort((a, b) => Math.abs(b.deviation ?? 0) - Math.abs(a.deviation ?? 0));
}