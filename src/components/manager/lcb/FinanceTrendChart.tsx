import { useMemo, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";
import { Check, ChevronDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { consultantColors } from "@/data/managerPerformanceData";

type Granularity = "periode" | "maand" | "week";

interface Row {
  c: { id: number; name: string };
  realised: number;
  forecast: number;
  potential: number;
  realisedPotential: number;
  margin: number;
  revRisk: number;
}

interface Props {
  rows: Row[];
  selectedConsultants: number[];
  onDrilldown: (bucket: string, metric: string, consultantIds: number[]) => void;
}

// Average consultant earns ~€20.040 per month. We bound buckets to [0, 45.000].
const AVG_MONTHLY_EUR = 20040;
const MAX_BUCKET_EUR = 45000;
const MODAAL_EUR = AVG_MONTHLY_EUR;

// Bucket-size scaling so that the average bucket value stays ≈ AVG_MONTHLY_EUR.
function bucketTargetAvg(g: Granularity): number {
  if (g === "periode") return AVG_MONTHLY_EUR * (28 / 30.44); // ~4-week period
  if (g === "maand") return AVG_MONTHLY_EUR;
  return AVG_MONTHLY_EUR / 4.345; // weekly
}

// Deterministic 0..1 hash for variation
function hash01(consultantId: number, bucketIdx: number): number {
  const v = Math.sin(consultantId * 127.1 + bucketIdx * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

// Returns a multiplicative factor (mean ≈ 1) for a consultant/bucket combo.
function bucketFactor(consultantId: number, bucketIdx: number, totalBuckets: number): number {
  const trend = 0.88 + (bucketIdx / Math.max(totalBuckets - 1, 1)) * 0.18; // 0.88 → 1.06
  const seasonal = 1 + Math.sin((bucketIdx + (consultantId % 7)) * 0.85) * 0.18;
  const jitter = 0.85 + hash01(consultantId, bucketIdx) * 0.3; // 0.85 → 1.15
  return trend * seasonal * jitter;
}

function buildBuckets(g: Granularity): string[] {
  if (g === "periode") {
    return ["P11 25", "P12 25", "P13 25", "P1 26", "P2 26", "P3 26", "P4 26", "P5 26"];
  }
  if (g === "maand") {
    return ["Jul 25", "Aug 25", "Sep 25", "Okt 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mrt 26", "Apr 26", "Mei 26", "Jun 26"];
  }
  // week — rolling 13 weeks
  return Array.from({ length: 13 }, (_, i) => `W${i + 23}`);
}

// Modaal scaled per granularity so the reference matches bucket size.
function modaalFor(g: Granularity): number {
  return Math.round(bucketTargetAvg(g));
}

export function FinanceTrendChart({ rows, selectedConsultants }: Props) {
  const [granularity, setGranularity] = useState<Granularity>("periode");
  const [localConsultants, setLocalConsultants] = useState<number[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [lockedId, setLockedId] = useState<number | null>(null);

  // Scope rows from global filter first, then local consultant filter.
  const globalScope = useMemo(() => {
    if (selectedConsultants.length === 0) return rows;
    return rows.filter((r) => selectedConsultants.includes(r.c.id));
  }, [rows, selectedConsultants]);

  // Reset local consultants that are no longer in scope
  const validLocal = useMemo(
    () => localConsultants.filter((id) => globalScope.some((r) => r.c.id === id)),
    [localConsultants, globalScope],
  );

  const scopeRows = useMemo(() => {
    if (validLocal.length === 0) return globalScope;
    return globalScope.filter((r) => validLocal.includes(r.c.id));
  }, [globalScope, validLocal]);

  const buckets = useMemo(() => buildBuckets(granularity), [granularity]);
  const isSingle = scopeRows.length === 1;
  const highlightId = lockedId ?? activeId;

  // Build per-consultant historical + forecast series.
  // Forecast = mean of last N historical buckets, appended as one extra bucket.
  const forecastWindow = granularity === "periode" && buckets.length >= 13 ? 13 : 3;
  const forecastBucketLabel = "Prognose";

  const data = useMemo(() => {
    const target = bucketTargetAvg(granularity);
    // Cohort mean of `realised` (used to scale each consultant relative to peers).
    const cohortRealised = scopeRows.reduce((s, r) => s + r.realised, 0) / Math.max(scopeRows.length, 1);
    const baselineFor = (r: Row) => {
      const rel = cohortRealised > 0 ? r.realised / cohortRealised : 1;
      // Keep relative spread but compress so outliers stay within [0, MAX_BUCKET_EUR].
      const compressed = 0.55 + Math.min(Math.max(rel, 0.3), 2.2) * 0.45;
      return target * compressed;
    };
    const clamp = (v: number) => Math.max(0, Math.min(MAX_BUCKET_EUR, Math.round(v)));

    const perConsultant = new Map<number, number[]>();
    scopeRows.forEach((r) => {
      const base = baselineFor(r);
      const vals = buckets.map((_, idx) => clamp(base * bucketFactor(r.c.id, idx, buckets.length)));
      perConsultant.set(r.c.id, vals);
    });

    // Rolling expectation: at bucket idx, prognose = mean of the previous `forecastWindow` situatie values.
    // For idx 0 we have no history → leave null so the line starts where data exists.
    const progPerConsultant = new Map<number, (number | null)[]>();
    scopeRows.forEach((r) => {
      const vals = perConsultant.get(r.c.id)!;
      const prog: (number | null)[] = vals.map((_, idx) => {
        if (idx === 0) return null;
        const start = Math.max(0, idx - forecastWindow);
        const slice = vals.slice(start, idx);
        if (slice.length === 0) return null;
        return clamp(slice.reduce((s, v) => s + v, 0) / slice.length);
      });
      progPerConsultant.set(r.c.id, prog);
    });

    const histRows = buckets.map((label, idx) => {
      const row: Record<string, number | string | null> = { bucket: label };
      scopeRows.forEach((r) => {
        row[`sit__${r.c.id}`] = perConsultant.get(r.c.id)![idx];
        row[`prog__${r.c.id}`] = progPerConsultant.get(r.c.id)![idx];
      });
      return row;
    });

    // Future bucket: extend prognose one step ahead based on full historical tail.
    const forecastRow: Record<string, number | string | null> = { bucket: forecastBucketLabel };
    scopeRows.forEach((r) => {
      const vals = perConsultant.get(r.c.id)!;
      const tail = vals.slice(-forecastWindow);
      const avg = clamp(tail.reduce((s, v) => s + v, 0) / Math.max(tail.length, 1));
      forecastRow[`prog__${r.c.id}`] = avg;
      forecastRow[`sit__${r.c.id}`] = null;
    });

    return [...histRows, forecastRow];
  }, [buckets, scopeRows, forecastWindow, granularity]);

  const scopeLabel = scopeRows.length === 0
    ? "Geen consultants"
    : isSingle
      ? `Consultant: ${scopeRows[0].c.name}`
      : `${scopeRows.length} consultants`;

  const allLocalOn = validLocal.length === globalScope.length;
  const toggleAll = () => setLocalConsultants(allLocalOn ? [] : globalScope.map((r) => r.c.id));
  const toggleOne = (id: number) =>
    setLocalConsultants((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const lineColor = (idx: number, id: number) => {
    if (isSingle) return "hsl(var(--primary))";
    return consultantColors[idx % consultantColors.length];
  };

  const opacityFor = (id: number) => {
    if (highlightId === null) return 1;
    return highlightId === id ? 1 : 0.2;
  };

  const handleLineClick = (id: number) => {
    setLockedId((curr) => (curr === id ? null : id));
  };

  return (
    <div
      className="mt-3 rounded-lg border border-border bg-card p-3"
      onClick={() => setLockedId(null)}
    >
      <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Financiële ontwikkeling</h3>
          <p className="text-[11px] text-muted-foreground">Financiële groei per consultant.</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Scope: {scopeLabel}</p>
        </div>
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* Consultant filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 px-2 text-[11px] gap-1">
                <Users className="h-3 w-3" />
                {validLocal.length === 0
                  ? "Alle consultants"
                  : `${validLocal.length} geselecteerd`}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-2">
              <div className="flex items-center justify-between mb-1.5 pb-1.5 border-b border-border">
                <span className="text-[11px] font-medium text-foreground">Consultants</span>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {allLocalOn ? "Alles uit" : "Alles aan"}
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-0.5">
                {globalScope.map((r) => {
                  const on = validLocal.includes(r.c.id);
                  return (
                    <button
                      key={r.c.id}
                      type="button"
                      onClick={() => toggleOne(r.c.id)}
                      className={cn(
                        "w-full flex items-center gap-2 rounded px-2 py-1 text-[11px] text-left",
                        on ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "h-3 w-3 rounded border flex items-center justify-center",
                          on ? "border-primary bg-primary" : "border-border",
                        )}
                      >
                        {on && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                      </span>
                      {r.c.name}
                    </button>
                  );
                })}
                {globalScope.length === 0 && (
                  <p className="text-[11px] text-muted-foreground px-2 py-1">Geen consultants in scope.</p>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Granularity */}
          <div className="inline-flex items-center rounded-md border border-border p-0.5 bg-background text-[11px]">
            {(["periode", "maand", "week"] as Granularity[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGranularity(g)}
                className={cn(
                  "px-2 py-0.5 rounded transition-colors capitalize",
                  granularity === g ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-2 text-[11px] text-muted-foreground">
        {isSingle && (
          <>
            <LegendItem swatch={<div className="w-4 h-[2.5px] rounded-full bg-muted-foreground/50" style={{ background: "repeating-linear-gradient(90deg, hsl(var(--muted-foreground)) 0 4px, transparent 4px 7px)" }} />} label="Modaal" />
            <LegendItem swatch={<div className="w-4 h-[2.5px] rounded-full" style={{ backgroundColor: "hsl(var(--primary))" }} />} label="Situatie" />
            <LegendItem swatch={<div className="w-4 h-[2.5px] rounded-full" style={{ background: "repeating-linear-gradient(90deg, hsl(217 91% 60%) 0 5px, transparent 5px 9px)" }} />} label="Prognose" />
          </>
        )}
        {!isSingle && scopeRows.length > 1 && (
          <>
            <LegendItem swatch={<div className="w-4 h-[2.5px] rounded-full bg-foreground/70" />} label="Situatie per consultant" />
            <LegendItem swatch={<div className="w-4 h-[2.5px] rounded-full" style={{ background: "repeating-linear-gradient(90deg, hsl(var(--foreground)) 0 5px, transparent 5px 9px)" }} />} label="Prognose (bij hover/klik)" />
          </>
        )}
      </div>

      {scopeRows.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
          Geen consultants in scope.
        </div>
      ) : (
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} stroke="hsl(var(--border))" />
              <YAxis
                tickFormatter={(v) => `€${Math.round(Number(v) / 1000)}k`}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                stroke="hsl(var(--border))"
                width={64}
              />
              <Tooltip
                content={(props: any) => (
                  <TrendTooltip {...props} scopeRows={scopeRows} isSingle={isSingle} modaal={modaalFor(granularity)} />
                )}
                cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "3 3" }}
              />

              {/* Modaal (single only) */}
              {isSingle && (
                <ReferenceLine
                  y={modaalFor(granularity)}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 4"
                  strokeWidth={1.2}
                  label={{ value: "Modaal", position: "insideTopLeft", fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                />
              )}

              {/* Situatie lines per consultant */}
              {scopeRows.map((r, idx) => {
                const color = lineColor(idx, r.c.id);
                const op = opacityFor(r.c.id);
                return (
                  <Line
                    key={`sit-${r.c.id}`}
                    type="monotone"
                    dataKey={`sit__${r.c.id}`}
                    name={isSingle ? "Situatie" : r.c.name}
                    stroke={color}
                    strokeWidth={highlightId === r.c.id ? 2.6 : 2}
                    strokeOpacity={op}
                    dot={{ r: 2.5, fill: color, strokeWidth: 0, opacity: op }}
                    activeDot={{
                      r: 5,
                      fill: color,
                      strokeWidth: 0,
                      style: { cursor: "pointer" },
                      onClick: (e: any) => {
                        e?.stopPropagation?.();
                        handleLineClick(r.c.id);
                      },
                    }}
                    onMouseEnter={() => !isSingle && setActiveId(r.c.id)}
                    onMouseLeave={() => !isSingle && setActiveId(null)}
                    onClick={(e: any) => {
                      e?.stopPropagation?.();
                      if (!isSingle) handleLineClick(r.c.id);
                    }}
                    isAnimationActive={false}
                  />
                );
              })}

              {/* Prognose lines */}
              {scopeRows.map((r, idx) => {
                if (!isSingle && highlightId !== r.c.id) return null;
                const color = isSingle ? "hsl(217 91% 60%)" : lineColor(idx, r.c.id);
                return (
                  <Line
                    key={`prog-${r.c.id}`}
                    type="monotone"
                    dataKey={`prog__${r.c.id}`}
                    name={isSingle ? "Prognose" : `Prognose · ${r.c.name}`}
                    stroke={color}
                    strokeWidth={1.8}
                    strokeDasharray="5 4"
                    dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
                    connectNulls
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {!isSingle && scopeRows.length > 1 && (
        <p className="text-[10px] text-muted-foreground mt-1.5">
          Hover op een lijn voor de prognose. Klik om vast te zetten, klik nogmaals om te ontgrendelen.
        </p>
      )}
    </div>
  );
}

function LegendItem({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {swatch}
      <span>{label}</span>
    </div>
  );
}

function TrendTooltip({ active, payload, label, scopeRows, isSingle, modaal = MODAAL_EUR }: any) {
  if (!active || !payload || !payload.length) return null;
  const fmt = (v: number) => `€${Math.round(v / 1000)}k`;

  return (
    <div className="rounded-md border border-border bg-card shadow-lg px-3 py-2 text-[11px] min-w-[180px]">
      <div className="font-semibold text-foreground mb-1">{label}</div>
      {payload.map((p: any) => {
        const key: string = p.dataKey;
        const [kind, idStr] = key.split("__");
        const id = Number(idStr);
        const name = scopeRows.find((r: Row) => r.c.id === id)?.c.name ?? "";
        const lineLabel = isSingle
          ? kind === "sit" ? "Situatie" : "Prognose"
          : kind === "sit" ? name : `Prognose · ${name}`;
        return (
          <div key={key} className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{lineLabel}</span>
            <span className="tabular-nums text-foreground">{fmt(Number(p.value))}</span>
          </div>
        );
      })}
      {isSingle && (
        <div className="flex items-center justify-between gap-3 mt-1 pt-1 border-t border-border">
          <span className="text-muted-foreground">Modaal</span>
          <span className="tabular-nums text-foreground">{`€${(modaal / 1000).toFixed(modaal < 10000 ? 1 : 0)}k`}</span>
        </div>
      )}
    </div>
  );
}
