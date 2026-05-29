import { useMemo, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

type Granularity = "periode" | "maand" | "kwartaal";
type MetricKey = "revenue" | "forecast" | "potentieel" | "revRisk" | "margin" | "realisedPot";

interface MetricDef {
  key: MetricKey;
  label: string;
  color: string;
  dash?: string;
  /** Revenue Risk uses absolute € (not divided by 1k) */
  rawEuros?: boolean;
}

const METRICS: MetricDef[] = [
  { key: "revenue", label: "Revenue", color: "hsl(var(--primary))" },
  { key: "forecast", label: "Forecast", color: "hsl(217 91% 60%)" },
  { key: "potentieel", label: "Potentieel", color: "hsl(142 71% 45%)" },
  { key: "revRisk", label: "Revenue Risk", color: "hsl(38 92% 50%)", dash: "4 3", rawEuros: true },
  { key: "margin", label: "Margin", color: "hsl(262 83% 58%)" },
  { key: "realisedPot", label: "Realised Pot.", color: "hsl(var(--muted-foreground))", dash: "2 3" },
];

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
  onDrilldown: (bucket: string, metric: MetricKey, consultantIds: number[]) => void;
}

// Deterministic bucket seasonality factor — keeps lines smooth but moving.
function bucketFactor(consultantId: number, bucketIdx: number, totalBuckets: number, metric: MetricKey): number {
  const phase = (consultantId * 13 + bucketIdx * 31 + metric.length * 7) % 100;
  // Slight upward trend + seasonal wave
  const trend = 0.78 + (bucketIdx / Math.max(totalBuckets - 1, 1)) * 0.35;
  const seasonal = 0.92 + (Math.sin((bucketIdx + (consultantId % 5)) * 0.9) * 0.12);
  const jitter = 0.94 + (phase / 100) * 0.12;
  return trend * seasonal * jitter;
}

function buildBuckets(granularity: Granularity): string[] {
  if (granularity === "periode") {
    // Synsel 4-week periods, last 8 ending at P5 26
    return ["P11 25", "P12 25", "P13 25", "P1 26", "P2 26", "P3 26", "P4 26", "P5 26"];
  }
  if (granularity === "maand") {
    return ["Jul 25", "Aug 25", "Sep 25", "Okt 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mrt 26", "Apr 26", "Mei 26", "Jun 26"];
  }
  return ["Q3 24", "Q4 24", "Q1 25", "Q2 25", "Q3 25", "Q4 25"];
}

export function FinanceTrendChart({ rows, selectedConsultants, onDrilldown }: Props) {
  const [granularity, setGranularity] = useState<Granularity>("periode");
  const [visible, setVisible] = useState<Record<MetricKey, boolean>>({
    revenue: true, forecast: true, potentieel: true,
    revRisk: false, margin: false, realisedPot: false,
  });
  const [splitMode, setSplitMode] = useState<boolean>(false);

  // Determine scope: which rows contribute
  const scopeRows = useMemo(() => {
    if (selectedConsultants.length === 0) return rows;
    return rows.filter((r) => selectedConsultants.includes(r.c.id));
  }, [rows, selectedConsultants]);

  const showSplitToggle = scopeRows.length >= 2 && scopeRows.length <= 5;
  const effectiveSplit = splitMode && showSplitToggle;

  const buckets = useMemo(() => buildBuckets(granularity), [granularity]);

  // Build chart data: one row per bucket. Each row holds either aggregate
  // metric keys, or per-consultant suffixed keys when split mode is on.
  const data = useMemo(() => {
    return buckets.map((label, idx) => {
      const row: Record<string, number | string> = { bucket: label };
      if (effectiveSplit) {
        scopeRows.forEach((r) => {
          METRICS.forEach((m) => {
            const base = baseValue(r, m.key);
            const v = base * bucketFactor(r.c.id, idx, buckets.length, m.key);
            row[`${m.key}__${r.c.id}`] = m.rawEuros ? Math.round(v) : Math.round(v);
          });
        });
      } else {
        METRICS.forEach((m) => {
          let sum = 0;
          scopeRows.forEach((r) => {
            const base = baseValue(r, m.key);
            sum += base * bucketFactor(r.c.id, idx, buckets.length, m.key);
          });
          row[m.key] = Math.round(sum);
        });
      }
      return row;
    });
  }, [buckets, scopeRows, effectiveSplit]);

  const scopeLabel = selectedConsultants.length === 0
    ? "Alle consultants"
    : scopeRows.length === 1
      ? `Consultant: ${scopeRows[0].c.name}`
      : `${scopeRows.length} consultants`;

  const handlePointClick = (bucket: string, metric: MetricKey, consultantIds: number[]) => {
    onDrilldown(bucket, metric, consultantIds);
  };

  return (
    <div className="mt-3 rounded-lg border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Financiële ontwikkeling over tijd</h3>
          <p className="text-[11px] text-muted-foreground">
            Bekijk de ontwikkeling van omzet, forecast, potentieel en risico per periode, maand of kwartaal.
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Scope: {scopeLabel}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {/* Granularity */}
          <div className="inline-flex items-center rounded-md border border-border p-0.5 bg-background text-[11px]">
            {(["periode", "maand", "kwartaal"] as Granularity[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGranularity(g)}
                className={cn(
                  "px-2 py-0.5 rounded transition-colors capitalize",
                  granularity === g ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {g === "periode" ? "Periode" : g === "maand" ? "Maand" : "Kwartaal"}
              </button>
            ))}
          </div>
          {/* Split toggle (only 2–5 selected) */}
          {showSplitToggle && (
            <div className="inline-flex items-center rounded-md border border-border p-0.5 bg-background text-[10px]">
              <button
                type="button"
                onClick={() => setSplitMode(false)}
                className={cn(
                  "px-1.5 py-0.5 rounded transition-colors",
                  !splitMode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                Aggregeren
              </button>
              <button
                type="button"
                onClick={() => setSplitMode(true)}
                className={cn(
                  "px-1.5 py-0.5 rounded transition-colors",
                  splitMode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                Split
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metric pills */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {METRICS.map((m) => {
          const on = visible[m.key];
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setVisible((v) => ({ ...v, [m.key]: !v[m.key] }))}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] transition-colors",
                on
                  ? "border-border bg-background text-foreground"
                  : "border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: on ? m.color : "hsl(var(--muted-foreground) / 0.4)" }}
              />
              {m.label}
            </button>
          );
        })}
      </div>

      {data.length === 0 || scopeRows.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
          Geen data voor de geselecteerde filters.
        </div>
      ) : (
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="bucket"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                stroke="hsl(var(--border))"
              />
              <YAxis
                tickFormatter={(v) => `€${Math.round(Number(v) / 1000)}k`}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                stroke="hsl(var(--border))"
                width={64}
              />
              <Tooltip
                content={(props: any) => (
                  <TrendTooltip
                    {...props}
                    scopeLabel={scopeLabel}
                    split={effectiveSplit}
                    scopeRows={scopeRows}
                  />
                )}
                cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "3 3" }}
              />
              {effectiveSplit
                ? scopeRows.flatMap((r) =>
                    METRICS.filter((m) => visible[m.key]).map((m) => (
                      <Line
                        key={`${m.key}__${r.c.id}`}
                        type="monotone"
                        dataKey={`${m.key}__${r.c.id}`}
                        name={`${m.label} · ${r.c.name}`}
                        stroke={m.color}
                        strokeWidth={1.6}
                        strokeDasharray={m.dash}
                        strokeOpacity={0.75}
                        dot={{ r: 2.5, fill: m.color, strokeWidth: 0 }}
                        activeDot={{
                          r: 5,
                          fill: m.color,
                          strokeWidth: 0,
                          style: { cursor: "pointer" },
                          onClick: (_e: any, payload: any) => {
                            const bucket = payload?.payload?.bucket;
                            if (bucket) handlePointClick(bucket, m.key, [r.c.id]);
                          },
                        }}
                        isAnimationActive={false}
                      />
                    )),
                  )
                : METRICS.filter((m) => visible[m.key]).map((m) => (
                    <Line
                      key={m.key}
                      type="monotone"
                      dataKey={m.key}
                      name={m.label}
                      stroke={m.color}
                      strokeWidth={2}
                      strokeDasharray={m.dash}
                      dot={{ r: 3, fill: m.color, strokeWidth: 0 }}
                      activeDot={{
                        r: 5,
                        fill: m.color,
                        strokeWidth: 0,
                        style: { cursor: "pointer" },
                        onClick: (_e: any, payload: any) => {
                          const bucket = payload?.payload?.bucket;
                          if (bucket) handlePointClick(bucket, m.key, scopeRows.map((r) => r.c.id));
                        },
                      }}
                      isAnimationActive={false}
                    />
                  ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function baseValue(r: Row, key: MetricKey): number {
  // marginRows holds values in €k for most metrics. revRisk is already in raw €.
  // Convert €k → € so the chart Y-axis can format consistently in €k.
  switch (key) {
    case "revenue": return r.realised * 1000;
    case "forecast": return r.forecast * 1000;
    case "potentieel": return r.potential * 1000;
    case "realisedPot": return r.realisedPotential * 1000;
    case "margin": return r.margin * 1000;
    case "revRisk": return r.revRisk; // already in €
  }
}

function TrendTooltip({ active, payload, label, scopeLabel, split, scopeRows }: any) {
  if (!active || !payload || !payload.length) return null;
  const fmt = (v: number, raw?: boolean) =>
    raw ? `€${Math.round(v).toLocaleString("nl-NL")}` : `€${Math.round(v / 1000)}k`;

  return (
    <div className="rounded-md border border-border bg-card shadow-lg px-3 py-2 text-[11px] min-w-[200px]">
      <div className="font-semibold text-foreground mb-0.5">{label}</div>
      <div className="text-muted-foreground mb-1">{scopeLabel}</div>
      {payload.map((p: any) => {
        const key: string = p.dataKey;
        const [metricKey, consId] = key.split("__");
        const metric = METRICS.find((m) => m.key === metricKey);
        if (!metric) return null;
        const consultantName = split && consId
          ? scopeRows.find((r: Row) => String(r.c.id) === consId)?.c.name
          : null;
        return (
          <div key={key} className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">
              {metric.label}{consultantName ? ` · ${consultantName}` : ""}
            </span>
            <span className="tabular-nums text-foreground">{fmt(Number(p.value), metric.rawEuros)}</span>
          </div>
        );
      })}
      <div className="text-[10px] text-muted-foreground mt-1.5 pt-1.5 border-t border-border">
        Klik op een punt voor details
      </div>
    </div>
  );
}
