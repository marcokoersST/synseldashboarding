import { useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import { LCB_STATUS_BG, LCB_STATUS_LABEL, type LCBStatus } from "@/lib/lcbStatus";

type MetricKey = "revenue" | "forecast" | "potentieel" | "revRisk" | "margin" | "realisedPot";

interface MetricDef {
  key: MetricKey;
  label: string;
  color: string;
  dash?: string;
}

const METRICS: MetricDef[] = [
  { key: "revenue", label: "Revenue", color: "hsl(var(--primary))" },
  { key: "forecast", label: "Forecast", color: "hsl(217 91% 60%)" },
  { key: "potentieel", label: "Potentieel", color: "hsl(142 71% 45%)" },
  { key: "revRisk", label: "Revenue Risk", color: "hsl(38 92% 50%)", dash: "4 3" },
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
  financialCat: string;
  status: LCBStatus;
}

interface Props {
  rows: Row[];
  onOpenRevenue: (consultantId: number) => void;
}

export function RevenueForecastChart({ rows, onOpenRevenue }: Props) {
  const [visible, setVisible] = useState<Record<MetricKey, boolean>>({
    revenue: true, forecast: true, potentieel: true, revRisk: true,
    margin: false, realisedPot: false,
  });

  const data = rows.map((r) => ({
    id: r.c.id,
    name: r.c.name,
    status: r.status,
    categorie: r.financialCat,
    revenue: r.realised,
    forecast: r.forecast,
    potentieel: r.potential,
    realisedPot: r.realisedPotential,
    revRiskRaw: r.revRisk,
    revRisk: Math.round(r.revRisk / 1000),
    margin: r.margin,
  }));

  return (
    <div className="mt-3 rounded-lg border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Omzetontwikkeling & forecast per consultant</h3>
          <p className="text-[11px] text-muted-foreground">
            Vergelijk gerealiseerde omzet, forecast, potentieel en risico per consultant.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
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
      </div>

      {data.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
          Geen omzetdata beschikbaar voor de geselecteerde filters.
        </div>
      ) : (
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 56, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                angle={-30}
                textAnchor="end"
                interval={0}
                height={60}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                stroke="hsl(var(--border))"
              />
              <YAxis
                tickFormatter={(v) => `€${v}k`}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                stroke="hsl(var(--border))"
                width={56}
              />
              <Tooltip content={<ConsultantTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "3 3" }} />
              {METRICS.filter((m) => visible[m.key]).map((m) => (
                <Line
                  key={m.key}
                  type="monotone"
                  dataKey={m.key}
                  name={m.label}
                  stroke={m.color}
                  strokeWidth={2}
                  strokeDasharray={m.dash}
                  dot={{ r: 3, fill: m.color, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: m.color, strokeWidth: 0, style: { cursor: "pointer" } }}
                  onClick={(d: any) => {
                    const id = d?.payload?.id ?? d?.activePayload?.[0]?.payload?.id;
                    if (id != null) onOpenRevenue(id);
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

function ConsultantTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload as {
    name: string; revenue: number; forecast: number; potentieel: number;
    revRiskRaw: number; categorie: string; status: LCBStatus;
  };
  const fmtK = (v: number) => `€${v}k`;
  const fmtE = (v: number) => `€${v.toLocaleString("nl-NL")}`;
  return (
    <div className="rounded-md border border-border bg-card shadow-lg px-3 py-2 text-[11px] min-w-[180px]">
      <div className="font-semibold text-foreground mb-1">{p.name}</div>
      <Row label="Revenue" value={fmtK(p.revenue)} />
      <Row label="Forecast" value={fmtK(p.forecast)} />
      <Row label="Potentieel" value={fmtK(p.potentieel)} />
      <Row label="Revenue Risk" value={fmtE(p.revRiskRaw)} />
      <Row label="Categorie" value={p.categorie} />
      <div className="flex items-center justify-between gap-3 mt-1">
        <span className="text-muted-foreground">Status</span>
        <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium", LCB_STATUS_BG[p.status])}>
          {LCB_STATUS_LABEL[p.status]}
        </span>
      </div>
      <div className="text-[10px] text-muted-foreground mt-1.5 pt-1.5 border-t border-border">
        Klik op een punt voor details
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
    </div>
  );
}
