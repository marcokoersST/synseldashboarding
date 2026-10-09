import { addDays, differenceInCalendarDays, format, startOfDay, startOfISOWeek } from "date-fns";
import { nl } from "date-fns/locale";
import type { DateRange } from "react-day-picker-v9";

export interface TrendTotals {
  conversions: number;
  registrations: number;
  spend: number;
  qualityScore?: number;
}

export type TrendMetric = "conversions" | "registrations" | "bem" | "cpa" | "costPerRegistration" | "spend" | "qualityScoreConv" | "qualityScore";

export const trendMetrics: { key: TrendMetric; label: string; color: string; format: "number" | "currency" | "percent" }[] = [
  { key: "conversions", label: "Conversions", color: "var(--trend-conversions)", format: "number" },
  { key: "registrations", label: "Inschrijven", color: "var(--trend-registrations)", format: "number" },
  { key: "bem", label: "% Bem.", color: "var(--trend-bem)", format: "percent" },
  { key: "cpa", label: "CPA", color: "var(--trend-cpa)", format: "currency" },
  { key: "costPerRegistration", label: "Cost/Inschrijven", color: "var(--trend-cost)", format: "currency" },
  { key: "spend", label: "Spend", color: "var(--trend-spend)", format: "currency" },
  { key: "qualityScoreConv", label: "Quality score conv.", color: "var(--trend-quality-conv)", format: "number" },
  { key: "qualityScore", label: "Quality score bem.", color: "var(--trend-quality)", format: "number" },
];

export function deriveTrendMetrics(totals: TrendTotals) {
  return {
    ...totals,
    qualityScore: Math.min(100, Math.max(0, totals.qualityScore ?? 0)),
    // Demo derivation: conversion-level score sits slightly below the placeable-candidate score.
    qualityScoreConv: Math.min(100, Math.max(0, (totals.qualityScore ?? 0) * 0.94)),
    bem: totals.conversions > 0 ? totals.registrations / totals.conversions * 100 : 0,
    cpa: totals.conversions > 0 ? totals.spend / totals.conversions : 0,
    costPerRegistration: totals.registrations > 0 ? totals.spend / totals.registrations : 0,
  };
}

export function formatTrendValue(value: number, kind: "number" | "currency" | "percent") {
  if (kind === "currency") return value.toLocaleString("nl-NL", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
  return `${value.toLocaleString("nl-NL", { maximumFractionDigits: kind === "percent" ? 1 : 0 })}${kind === "percent" ? "%" : ""}`;
}

/** Static demo distribution, not historical measurements. Totals remain exactly aligned with the supplied filtered totals. */
export type TrendGranularity = "day" | "week" | "month";

export function buildMarketingTrend(range: DateRange, totals: TrendTotals, override?: TrendGranularity) {
  if (!range.from) return { granularity: (override ?? "day") as TrendGranularity, points: [] };
  const from = startOfDay(range.from);
  const to = startOfDay(range.to ?? range.from);
  const days = differenceInCalendarDays(to, from) + 1;
  if (days < 1) return { granularity: (override ?? "day") as TrendGranularity, points: [] };
  const granularity: TrendGranularity = override ?? (days < 30 ? "day" : "month");
  const dates = Array.from({ length: days }, (_, i) => addDays(from, i));
  const weights = dates.map(date => {
    const day = differenceInCalendarDays(date, new Date(2026, 0, 1));
    return {
      conversions: 1 + 0.25 * Math.sin(day * 1.73) + 0.13 * Math.cos(day * 0.48),
      registrations: 1 + 0.22 * Math.sin(day * 1.73 + 0.6) + 0.12 * Math.cos(day * 0.63),
      spend: 1 + 0.12 * Math.sin(day * 0.82 + 1.2),
    };
  });
  const distribute = (key: "conversions" | "registrations" | "spend", integer: boolean) => {
    const weightSum = weights.reduce((sum, row) => sum + row[key], 0);
    let cumulative = 0;
    let previous = 0;
    return weights.map((row, index) => {
      cumulative += row[key];
      const target = index === weights.length - 1 ? totals[key] : totals[key] * cumulative / weightSum;
      const next = integer ? Math.round(target) : target;
      const value = next - previous;
      previous = next;
      return value;
    });
  };
  const conversions = distribute("conversions", true);
  const registrations = distribute("registrations", true);
  const spend = distribute("spend", false);
  const buckets = new Map<string, TrendTotals & { label: string; dateLabel: string }>();
  dates.forEach((date, index) => {
    const weekStart = startOfISOWeek(date);
    const key = granularity === "day" ? format(date, "yyyy-MM-dd") : granularity === "week" ? format(weekStart, "yyyy-MM-dd") : format(date, "yyyy-MM");
    const bucket = buckets.get(key) ?? {
      conversions: 0, registrations: 0, spend: 0, qualityScore: totals.qualityScore ?? 0,
      label: granularity === "day" ? format(date, "d MMM", { locale: nl }) : granularity === "week" ? `Wk ${format(weekStart, "I")}` : format(date, "MMM yy", { locale: nl }),
      dateLabel: granularity === "day" ? format(date, "d MMMM yyyy", { locale: nl }) : granularity === "week" ? `Week ${format(weekStart, "I")} (vanaf ${format(weekStart, "d MMMM yyyy", { locale: nl })})` : format(date, "MMMM yyyy", { locale: nl }),
    };
    bucket.conversions += conversions[index] ?? 0;
    bucket.registrations += registrations[index] ?? 0;
    bucket.spend += spend[index] ?? 0;
    buckets.set(key, bucket);
  });
  return { granularity, points: Array.from(buckets.values()).map(bucket => ({ ...bucket, ...deriveTrendMetrics(bucket) })) };
}