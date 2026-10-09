import { Fragment, useMemo, useState } from "react";
import { format, getISOWeek, startOfDay, subDays } from "date-fns";
import { nl } from "date-fns/locale";
import type { DateRange } from "react-day-picker-v9";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CalendarDays, CheckCircle2, ChevronDown, ChevronRight, Target } from "lucide-react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/marketing-dashboard/components/ui/button";
import { Card, CardContent } from "@/marketing-dashboard/components/ui/card";
import { FORECAST_METRICS, buildForecastDemoData, calculateForecast, filterForecastRows, forecastBreakdown, type ForecastMetric, type ForecastPeriod, type ForecastResult } from "@/marketing-dashboard/lib/marketingForecast";
import type { MarketingFilterRule } from "@/marketing-dashboard/lib/marketingFilters";
import { cn } from "@/marketing-dashboard/lib/utils";
import TvPerformanceSignals, { type TvSignal } from "@/marketing-dashboard/components/marketing/TvPerformanceSignals";

interface Props { dateRange: DateRange; filters: MarketingFilterRule[]; tvMode?: boolean }
const number = (value: number) => value.toLocaleString("nl-NL", { maximumFractionDigits: 0 });
const pct = (value: number) => `${value.toLocaleString("nl-NL", { maximumFractionDigits: 1 })}%`;
const metricLabelOf = (metric: ForecastMetric) => FORECAST_METRICS.find(m => m.key === metric)?.label ?? metric;
const valueFmt = (metric: ForecastMetric, value: number) => metric.startsWith("qualityScore") ? value.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : number(value);
const statusLabels: Record<string, string> = { behind: "Achter op schema", ahead: "Voor op schema", "on-track": "Op schema", "not-started": "Periode gestart · 0%", "no-data": "Geen referentiedata" };
const statusColor = (status: string) => status === "behind" ? "text-destructive" : status === "ahead" || status === "on-track" ? "text-forecast-positive" : "text-muted-foreground";

function PeriodCard({ result, period, metricKey }: { result: ForecastResult; period: ForecastPeriod; metricKey: ForecastMetric }) {
  const metric = metricLabelOf(metricKey);
  const quality = metricKey.startsWith("qualityScore");
  const title = period === "week" ? `Week ${getISOWeek(result.start)}` : format(result.start, "MMMM yyyy", { locale: nl });
  return <Card className="rounded-lg">
    <CardContent className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><div className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" /><h3 className="font-semibold capitalize">{title}</h3></div>
          <p className="mt-1 text-xs text-muted-foreground">{format(result.start, "d MMM", { locale: nl })} – {format(subDays(result.end, 1), "d MMM yyyy", { locale: nl })}</p></div>
        <span className={cn("flex items-center gap-1.5 text-xs font-medium", statusColor(result.status))}>{result.status === "behind" ? <AlertTriangle className="size-3.5" /> : <Target className="size-3.5" />}{statusLabels[result.status]}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1"><p className="text-4xl font-bold tabular-nums">{pct(result.progress)}</p><span className="pb-1 text-sm text-muted-foreground">{quality ? "van het halfjaargemiddelde" : `van het ${period === "week" ? "weekdoel" : "maanddoel"}`}</span></div>
      <div className="relative mt-4 h-2 bg-muted rounded-full" aria-label={`${title}: ${pct(result.progress)} behaald, ${pct(result.expectedPct)} verwacht`}>
        <div className={cn("h-full rounded-full", result.status === "behind" ? "bg-destructive" : "bg-forecast-positive")} style={{ width: `${Math.min(result.progress, 100)}%` }} />
        <div className="absolute -top-1 h-4 w-0.5 bg-foreground" style={{ left: `${result.expectedPct}%` }} />
      </div>
      <div className="mt-2 flex justify-between gap-2 text-xs text-muted-foreground"><span>Verwacht nu: {pct(result.expectedPct)}</span><span>Doel: 100%</span></div>
      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
        <div><dt className="text-xs text-muted-foreground">{quality ? "Huidig" : "Behaald"}</dt><dd className="mt-1 font-semibold tabular-nums">{valueFmt(metricKey, result.actual)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Verwacht nu</dt><dd className="mt-1 font-semibold tabular-nums">{valueFmt(metricKey, result.expected)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">{quality ? "Gemiddeld halfjaar" : "Gemiddeld doel"}</dt><dd className="mt-1 font-semibold tabular-nums">{valueFmt(metricKey, result.target)}</dd></div>
      </dl>
      <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs"><span className={statusColor(result.status)}>{result.deviation === null ? "Nog geen afwijking" : `${result.deviation > 0 ? "+" : ""}${pct(result.deviation)} t.o.v. verwachting`}</span><span className="text-muted-foreground">Eindprognose: {result.projectedPct === null ? "—" : pct(result.projectedPct)}</span></div>
      <div className="mt-5 h-[200px] w-full" aria-label={`${title} voortgangsgrafiek`}>
        <ResponsiveContainer width="100%" height="100%"><LineChart data={result.points} margin={{ top: 8, right: 12, bottom: 0, left: -15 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" minTickGap={45} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, (max: number) => Math.max(110, Math.ceil(max / 25) * 25)]} tickFormatter={value => `${value}%`} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <ReferenceLine y={100} stroke="var(--primary)" strokeDasharray="2 4" />
          <Tooltip formatter={(value: number) => pct(value)} contentStyle={{ background: "var(--popover)", borderColor: "var(--border)", color: "var(--popover-foreground)", borderRadius: 6 }} />
          <Line name="Verwachting" dataKey="expected" stroke="var(--muted-foreground)" strokeWidth={1.5} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
          <Line name={metric} dataKey="actual" stroke="var(--trend-registrations)" strokeWidth={2.5} dot={false} connectNulls={false} isAnimationActive={false} />
        </LineChart></ResponsiveContainer>
      </div>
      <div className="mt-2 flex justify-center gap-5 text-xs text-muted-foreground"><span className="flex items-center gap-2"><span className="h-0.5 w-5 bg-forecast-positive" />Behaald</span><span className="flex items-center gap-2"><span className="w-5 border-t border-dashed border-muted-foreground" />Verwachting</span></div>
    </CardContent>
  </Card>;
}

function TvPeriodCard({ result, period, metricKey }: { result: ForecastResult; period: ForecastPeriod; metricKey: ForecastMetric }) {
  const title = period === "week" ? `Week ${getISOWeek(result.start)}` : format(result.start, "MMMM yyyy", { locale: nl });
  return <Card className="flex min-h-0 flex-col rounded-lg">
    <CardContent className="flex min-h-0 flex-1 flex-col p-4 [@media(max-height:850px)]:p-2.5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold capitalize">{title}</h3>
        <span className={cn("flex items-center gap-1.5 text-sm font-semibold", statusColor(result.status))}>{result.status === "behind" ? <AlertTriangle className="size-4" /> : <Target className="size-4" />}{statusLabels[result.status]}</span>
      </div>
      <div className="mt-2">
        <p className="text-3xl font-bold tabular-nums [@media(max-height:850px)]:text-2xl">{pct(result.progress)}</p>
      </div>
      <div className="relative mt-3 h-2.5 rounded-full bg-muted [@media(max-height:850px)]:mt-2">
        <div className={cn("h-full rounded-full", result.status === "behind" ? "bg-destructive" : "bg-forecast-positive")} style={{ width: `${Math.min(result.progress, 100)}%` }} />
        <div className="absolute -top-1 h-4.5 w-0.5 bg-foreground" style={{ left: `${result.expectedPct}%` }} />
      </div>
      <div className="hidden">
        <ResponsiveContainer width="100%" height="100%"><LineChart data={result.points} margin={{ top: 8, right: 12, bottom: 0, left: -15 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" minTickGap={45} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, (max: number) => Math.max(110, Math.ceil(max / 25) * 25)]} tickFormatter={value => `${value}%`} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <ReferenceLine y={100} stroke="var(--primary)" strokeDasharray="2 4" />
          <Line dataKey="expected" stroke="var(--muted-foreground)" strokeWidth={1.5} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
          <Line dataKey="actual" stroke="var(--trend-registrations)" strokeWidth={3} dot={false} connectNulls={false} isAnimationActive={false} />
        </LineChart></ResponsiveContainer>
      </div>
      <dl className="mt-2 grid grid-cols-3 gap-2 border-t border-border pt-2 [@media(max-height:850px)]:hidden [@media(max-height:850px)]:mt-1 [@media(max-height:850px)]:pt-1 [@media(max-height:850px)]:[&_dd]:mt-0 [@media(max-height:850px)]:[&_dd]:text-lg">
        <div><dt className="text-xs text-muted-foreground">{metricKey.startsWith("qualityScore") ? "Huidig" : "Behaald"}</dt><dd className="mt-1 text-lg font-semibold tabular-nums">{valueFmt(metricKey, result.actual)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Verwacht nu</dt><dd className="mt-1 text-lg font-semibold tabular-nums">{valueFmt(metricKey, result.expected)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">{metricKey.startsWith("qualityScore") ? "Gem. halfjaar" : "Gemiddeld doel"}</dt><dd className="mt-1 text-lg font-semibold tabular-nums">{valueFmt(metricKey, result.target)}</dd></div>
      </dl>
      <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs tabular-nums [@media(max-height:850px)]:mt-1 [@media(max-height:850px)]:text-xs">
        <span className={statusColor(result.status)}>{result.deviation === null ? "Nog geen afwijking" : `${result.deviation > 0 ? "+" : ""}${pct(result.deviation)} t.o.v. verwachting`}</span>
        <span className="text-muted-foreground">Eindprognose: {result.projectedPct === null ? "—" : pct(result.projectedPct)}</span>
      </div>
    </CardContent>
  </Card>;
}

function ForecastCells({ row, metric }: { row: ForecastResult; metric: ForecastMetric }) {
  return <><td className="px-3 py-2.5 tabular-nums">{valueFmt(metric, row.actual)}</td><td className="px-3 py-2.5 tabular-nums">{valueFmt(metric, row.expected)}</td><td className="px-3 py-2.5 tabular-nums">{valueFmt(metric, row.target)}</td><td className="px-3 py-2.5 tabular-nums">{pct(row.progress)}</td><td className={cn("px-3 py-2.5 tabular-nums", statusColor(row.status))}>{row.deviation === null ? "—" : `${row.deviation > 0 ? "+" : ""}${pct(row.deviation)}`}</td><td className={cn("px-3 py-2.5 text-xs", statusColor(row.status))}>{statusLabels[row.status]}</td></>;
}

export default function PrognoseTab({ dateRange, filters, tvMode = false }: Props) {
  const [metric, setMetric] = useState<ForecastMetric>("registrations");
  const [period, setPeriod] = useState<ForecastPeriod>("week");
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const selected = dateRange.to ?? dateRange.from ?? new Date();
  const asOf = startOfDay(new Date(Math.min(selected.getTime(), Date.now())));
  const stamp = asOf.getTime();
  const rows = useMemo(() => filterForecastRows(buildForecastDemoData(new Date(stamp)), filters), [stamp, filters]);
  const overview = useMemo(() => FORECAST_METRICS.map(m => ({ ...m, week: calculateForecast(rows, new Date(stamp), "week", m.key), month: calculateForecast(rows, new Date(stamp), "month", m.key) })), [rows, stamp]);
  const week = overview[0]!.week;
  const breakdown = useMemo(() => forecastBreakdown(rows, new Date(stamp), period, metric, "source"), [rows, stamp, period, metric]);
  const campaigns = useMemo(() => forecastBreakdown(rows, new Date(stamp), period, metric, "campaign"), [rows, stamp, period, metric]);
  const alerts = useMemo(() => FORECAST_METRICS.flatMap(m => forecastBreakdown(rows, new Date(stamp), period, m.key, "source").map(row => ({ ...row, metricKey: m.key, metricLabel: m.label }))).filter(row => row.status === "behind" || row.status === "ahead")
    .sort((a, b) => Math.abs(b.deviation ?? 0) - Math.abs(a.deviation ?? 0)), [rows, stamp, period]);
  const toggleSource = (source: string) => setExpandedSources(previous => {
    const next = new Set(previous);
    if (next.has(source)) next.delete(source); else next.add(source);
    return next;
  });
  const metricLabel = metricLabelOf(metric);
  const result = period === "week" ? week : overview[0]!.month;

  if (tvMode) {
    const signalsByPeriod = (["week", "month"] as const).map(signalPeriod => FORECAST_METRICS.flatMap(m => forecastBreakdown(rows, new Date(stamp), signalPeriod, m.key, "source").map(result => ({ source: result.source, period: signalPeriod, metric: m.label, result })))
      .filter(signal => signal.result.status === "behind" || signal.result.status === "ahead")
      .sort((a, b) => Math.abs(b.result.deviation ?? 0) - Math.abs(a.result.deviation ?? 0)));
    const tvSignals: TvSignal[] = [];
    for (let index = 0; index < Math.max(...signalsByPeriod.map(signals => signals.length)); index++) {
      for (const signals of signalsByPeriod) { const signal = signals[index]; if (signal) tvSignals.push(signal); }
    }
    return <div className="flex shrink-0 flex-col gap-4 [@media(max-height:850px)]:gap-2">
      <section className="shrink-0" aria-label="Prognose">
        <h2 className="mb-2 text-xl font-semibold [@media(max-height:850px)]:mb-1 [@media(max-height:850px)]:text-lg">Prognose</h2>
        <div className="grid gap-4 lg:grid-cols-4 [@media(max-height:850px)]:gap-3">{overview.map(m => <div key={m.key} className="flex min-w-0 flex-col gap-3 [@media(max-height:850px)]:gap-2"><h3 className="text-base font-semibold text-muted-foreground">{m.label}</h3><TvPeriodCard result={m.week} period="week" metricKey={m.key} /><TvPeriodCard result={m.month} period="month" metricKey={m.key} /></div>)}</div>
      </section>
      <TvPerformanceSignals signals={tvSignals} />
    </div>;
  }

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
      <div><h2 className="text-xl font-semibold">Prognose</h2><p className="mt-1 text-sm text-muted-foreground">Stand bij start {format(asOf, "d MMMM yyyy", { locale: nl })} · afgeronde dagen t/m {format(subDays(asOf, 1), "d MMM", { locale: nl })}</p></div>
      <div className="flex gap-1" aria-label="Prognose meetwaarde">{FORECAST_METRICS.map(m => <Button key={m.key} size="sm" variant={metric === m.key ? "default" : "outline"} aria-pressed={metric === m.key} onClick={() => setMetric(m.key)}>{m.label}</Button>)}</div>
    </div>
    <p className="text-xs text-muted-foreground">Referentie: {format(week.historyStart, "d MMM yyyy", { locale: nl })} – {format(subDays(week.historyEnd, 1), "d MMM yyyy", { locale: nl })} · Alerts bij meer dan 20% afwijking (quality score: 5%).</p>
    {(() => { const m = overview.find(o => o.key === metric) ?? overview[0]!; return <div className="grid gap-4 lg:grid-cols-2"><PeriodCard result={m.week} period="week" metricKey={m.key} /><PeriodCard result={m.month} period="month" metricKey={m.key} /></div>; })()}
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="text-base font-semibold">Prestatiesignalen <span className="ml-1 text-sm font-normal text-muted-foreground">({alerts.length})</span></h3><p className="mt-1 text-xs text-muted-foreground">Conversions, inschrijven en quality scores (conv. en bem.) per bron · afwijking van de verwachting op dit moment</p></div>
        <div className="flex gap-1">{(["week", "month"] as const).map(value => <Button size="sm" key={value} variant={period === value ? "secondary" : "ghost"} aria-pressed={period === value} onClick={() => setPeriod(value)}>{value === "week" ? "Week" : "Maand"}</Button>)}</div>
      </div>
      {alerts.length > 0 ? <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{alerts.map(row => <div key={`${row.metricKey}-${row.source}`} className={cn("rounded-md border border-border bg-card p-3.5 border-l-2", row.status === "behind" ? "border-l-destructive" : "border-l-forecast-positive")}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0"><p className="break-words text-sm font-semibold">{row.source}</p><p className="text-[11px] text-muted-foreground">{row.metricLabel}</p></div>
          <span className={cn("flex shrink-0 items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-semibold", statusColor(row.status))}>{row.status === "behind" ? <ArrowDownRight className="size-3" /> : <ArrowUpRight className="size-3" />}{row.status === "behind" ? "Onder verwachting" : "Boven verwachting"}</span>
        </div>
        <p className={cn("mt-3 text-xl font-bold tabular-nums", statusColor(row.status))}>{(row.deviation ?? 0) > 0 ? "+" : ""}{pct(row.deviation ?? 0)}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">afwijking t.o.v. de verwachting</p>
        <div className="relative mt-3 h-1.5 rounded-full bg-muted" aria-label={`${row.source}: ${pct(row.progress)} behaald`}>
          <div className={cn("h-full rounded-full", row.status === "behind" ? "bg-destructive" : "bg-forecast-positive")} style={{ width: `${Math.min(row.progress, 100)}%` }} />
          <div className="absolute -top-0.5 h-2.5 w-0.5 bg-foreground" style={{ left: `${row.expectedPct}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Eindprognose: <span className="font-semibold tabular-nums text-foreground">{row.projectedPct === null ? "—" : pct(row.projectedPct)}</span> van doel</p>
      </div>)}</div> : <div className="flex items-center gap-2 border-y border-border py-6 text-sm text-muted-foreground"><CheckCircle2 className="size-4" />{result.status === "no-data" ? "Geen data voor deze filters." : result.elapsedDays === 0 ? "De periode begint op 0%. Er zijn nog geen afgeronde dagen voor alerts." : "Geen sterke afwijkingen: alle prestaties liggen binnen 20% van de verwachting."}</div>}
    </section>
    <section className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-base font-semibold">Per bron en campagne · {metricLabel} · {period === "week" ? "week" : "maand"}</h3></div>
      <div className="overflow-x-auto border-y border-border"><table className="w-full min-w-[900px] text-sm"><thead className="text-muted-foreground"><tr>{["Bron / campagne", "Behaald", "Verwacht nu", "Doel (gem. halfjaar)", "Voortgang", "Afwijking", "Status"].map(label => <th key={label} className="h-11 px-3 text-left font-medium">{label}</th>)}</tr></thead><tbody>{breakdown.map(row => {
        const children = campaigns.filter(campaign => campaign.source === row.source);
        const behind = children.filter(campaign => campaign.status === "behind");
        const open = expandedSources.has(row.source);
        return <Fragment key={row.source}><tr className="border-t border-border"><td className="min-w-[260px] max-w-[340px] px-3 py-2.5"><div className="flex items-center gap-2"><Button variant="ghost" size="sm" className="h-auto min-w-0 justify-start gap-2 px-0 text-left font-semibold whitespace-normal" aria-expanded={open} aria-label={`Campagnes van ${row.source}`} onClick={() => toggleSource(row.source)}>{open ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}<span className="break-words">{row.source}</span><span className="text-xs font-normal text-muted-foreground">({children.length})</span></Button>{behind.length > 0 && <span className="flex shrink-0 items-center gap-1 text-xs text-destructive" role="img" aria-label={`${behind.length} campagnes achter op schema bij ${row.source}`} title={`${behind.length} campagnes achter op schema: ${behind.map(campaign => campaign.name).join(", ")}`}><AlertTriangle className="size-4" />{behind.length}</span>}</div></td><ForecastCells row={row} metric={metric} /></tr>{open && children.map(campaign => <tr key={campaign.name} className="border-t border-border bg-muted/30"><td className="max-w-[340px] break-words py-2.5 pr-3 pl-10 text-xs text-muted-foreground">{campaign.name}</td><ForecastCells row={campaign} metric={metric} /></tr>)}</Fragment>;
      })}{breakdown.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Geen data voor deze filters.</td></tr>}</tbody></table></div>
    </section>
  </div>;
}