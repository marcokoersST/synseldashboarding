import { getComparisonValue } from "@/marketing-dashboard/lib/marketingCompare";
import { aggregateComparisonQualityScore } from "@/marketing-dashboard/lib/marketingQuality";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker-v9";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Check, TrendingUp } from "lucide-react";
import { Button } from "@/marketing-dashboard/components/ui/button";
import { buildMarketingTrend, deriveTrendMetrics, formatTrendValue, trendMetrics, type TrendGranularity, type TrendMetric, type TrendTotals } from "@/marketing-dashboard/lib/marketingTrends";
import { cn } from "@/marketing-dashboard/lib/utils";
import type { QualityRow } from "@/marketing-dashboard/lib/marketingQuality";
import QualityScoreComparison from "@/marketing-dashboard/components/marketing/QualityScoreComparison";

interface Props {
  dateRange: DateRange;
  totals: TrendTotals;
  compareRange?: DateRange | null;
  qualityRows?: QualityRow[];
  tvMode?: boolean;
  matchableCandidates?: number;
}

export default function MarketingTrendChart({ dateRange, totals: sourceTotals, compareRange = null, qualityRows = [], tvMode = false, matchableCandidates = 0 }: Props) {
  const totals = useMemo(() => tvMode ? { ...sourceTotals, registrations: matchableCandidates } : sourceTotals, [sourceTotals, tvMode, matchableCandidates]);
  const [selected, setSelected] = useState<TrendMetric[]>(["conversions", "registrations"]);
  const [chosen, setChosen] = useState<TrendGranularity | null>(null);
  const { points, granularity } = useMemo(() => buildMarketingTrend(dateRange, totals, chosen ?? undefined), [dateRange, totals, chosen]);
  const summary = deriveTrendMetrics(totals);
  // Previous-period line: same comparison basis as the tiles, bucketed with the current granularity and aligned by position.
  const chartPoints = useMemo(() => {
    if (tvMode || !compareRange?.from || !compareRange.to) return points;
    const prevTotals = {
      conversions: getComparisonValue(totals.conversions, { dateRange, compareRange, seed: "trend-conversions" }),
      registrations: getComparisonValue(totals.registrations, { dateRange, compareRange, seed: "trend-registrations" }),
      spend: getComparisonValue(totals.spend, { dateRange, compareRange, seed: "trend-spend" }),
      qualityScore: qualityRows.length ? aggregateComparisonQualityScore(qualityRows, dateRange, compareRange) : (totals.qualityScore ?? 0),
    };
    const prev = buildMarketingTrend(compareRange, prevTotals, granularity).points;
    return points.map((point, i) => {
      const p = prev[i] as Record<string, unknown> | undefined;
      if (!p) return point;
      const extra: Record<string, unknown> = { prevDateLabel: p["dateLabel"] };
      for (const m of trendMetrics) extra[`prev_${m.key}`] = p[m.key];
      return { ...point, ...extra };
    });
  }, [points, compareRange, totals, dateRange, qualityRows, granularity, tvMode]);
  const hasCompare = chartPoints !== points;
  const availableMetrics = tvMode ? trendMetrics.filter(metric => metric.key === "registrations" || metric.key === "spend").map(metric => metric.key === "registrations" ? { ...metric, label: "Bemiddelbare kandidaten" } : metric) : trendMetrics;
  const activeMetrics = tvMode ? availableMetrics : availableMetrics.filter(metric => selected.includes(metric.key));
  const hasData = totals.conversions > 0 || totals.registrations > 0 || totals.spend > 0;

  return (
    <section aria-label="Trendgrafiek" data-tv-trend={tvMode || undefined} data-granularity={granularity} className="min-w-0 border-y border-border bg-card py-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-semibold">Trend</h2>
        </div>
        {!tvMode && <div className="inline-flex rounded-md border border-border p-0.5" role="group" aria-label="Periode-indeling">
          {([["day", "Per dag"], ["week", "Per week"], ["month", "Per maand"]] as const).map(([key, label]) => (
            <button key={key} type="button" aria-pressed={granularity === key} onClick={() => setChosen(key)}
              className={cn("rounded px-2.5 py-1 text-xs transition-colors", granularity === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {label}
            </button>
          ))}
        </div>}
        {tvMode && <div className="flex items-center gap-5" aria-label="Trendlijnen">{activeMetrics.map(metric => <span key={metric.key} className="flex items-center gap-2 text-xs font-medium"><span className="trend-swatch size-2 rounded-full" data-metric={metric.key} />{metric.label}</span>)}</div>}
      </div>
      {!tvMode && <div className="mb-5 flex flex-wrap gap-2 px-4" role="group" aria-label="Trendlijnen">
        {trendMetrics.map(metric => {
          const active = selected.includes(metric.key);
          return (
            <Button key={metric.key} variant="outline" size="sm" aria-pressed={active}
              onClick={() => setSelected(previous => active ? previous.filter(key => key !== metric.key) : [...previous, metric.key])}
              className={cn("h-auto min-h-12 gap-2 rounded-md px-3 py-2 text-left", active ? "border-primary/30 bg-primary/5 text-foreground" : "text-muted-foreground")}
            >
              <span className={cn("trend-swatch size-2 shrink-0 rounded-full", !active && "opacity-40")} data-metric={metric.key} />
              <span className="flex flex-col gap-0.5"><span className="text-xs font-medium">{metric.label}</span><span className="text-xs tabular-nums">{formatTrendValue(summary[metric.key], metric.format)}</span></span>
              <Check className={cn("size-3 shrink-0", !active && "invisible")} />
            </Button>
          );
        })}
      </div>}
      <div className="h-64 min-w-0 px-2 sm:px-4">
        {!hasData || !points.length || !selected.length ? (
          <div className="grid h-full place-items-center text-sm text-muted-foreground" role="status">{!selected.length ? "Geen meetwaarden geselecteerd" : "Geen data in deze selectie"}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={chartPoints} margin={{ left: 6, right: 14, top: 12, bottom: 6 }} accessibilityLayer>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} minTickGap={28} />
              {activeMetrics.map(metric => (
                <YAxis key={metric.key} yAxisId={metric.key} orientation={tvMode && metric.key === "spend" ? "right" : "left"} hide={!tvMode && activeMetrics.length > 1} width={58} domain={(metric.key === "qualityScore" || metric.key === "qualityScoreConv") ? [0, 100] : [0, "auto"]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false}
                  tickFormatter={value => metric.format === "currency" ? `€${Number(value).toLocaleString("nl-NL", { notation: "compact" })}` : `${Number(value).toLocaleString("nl-NL", { notation: "compact" })}${metric.format === "percent" ? "%" : ""}`} />
              ))}
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return <div className="rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-sm">
                  <p className="mb-2 text-xs font-medium">{payload[0]?.payload.dateLabel}</p>
                  {activeMetrics.map(metric => <div key={metric.key} className="flex items-center justify-between gap-6 py-0.5 text-xs">
                    <span className="flex items-center gap-2"><span className="trend-swatch size-2 rounded-full" data-metric={metric.key} />{metric.label}</span>
                    <span className="flex items-center gap-3"><span className="font-medium tabular-nums">{metric.key === "qualityScore" ? <QualityScoreComparison value={Number(payload[0]?.payload.qualityScore ?? 0)} rows={qualityRows} dateRange={dateRange} compareRange={compareRange} /> : formatTrendValue(Number(payload[0]?.payload[metric.key] ?? 0), metric.format)}</span>{payload[0]?.payload[`prev_${metric.key}`] !== undefined && <span className="tabular-nums text-muted-foreground" title="Vorige periode">vs {formatTrendValue(Number(payload[0]?.payload[`prev_${metric.key}`]), metric.format)}</span>}</span>
                  </div>)}
                </div>;
              }} />
              {activeMetrics.map(metric => <Line key={metric.key} yAxisId={metric.key} type="linear" dataKey={metric.key} name={metric.label} stroke={metric.color} strokeWidth={2} dot={points.length === 1 ? { r: 4 } : false} activeDot={{ r: 4 }} isAnimationActive={false} />)}
              {hasCompare && activeMetrics.map(metric => <Line key={`prev-${metric.key}`} yAxisId={metric.key} type="linear" dataKey={`prev_${metric.key}`} name={`${metric.label} (vorige periode)`} stroke={metric.color} strokeOpacity={0.45} strokeWidth={1.5} strokeDasharray="5 4" dot={false} activeDot={false} isAnimationActive={false} />)}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}