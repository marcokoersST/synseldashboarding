import { useEffect, useMemo, useState } from "react";
import { TVDashboardLayout } from "@/components/tv/TVDashboardLayout";
import {
  getActionList,
  recruiterById,
  consultantById,
  TIER_COLOR,
  tierContactStats,
  dailyInstroom,
  sourceTree,
  SOURCE_LABELS,
  rangeStats,
  kpis,
  NOW,
  HOUR,
} from "@/data/funnelOperationsData";
import type { Tier } from "@/data/funnelOperationsData";
import { TierBadge } from "@/components/funnel-ops/TierBadge";
import { SLAStatusPill } from "@/components/funnel-ops/SLAStatusPill";
import {
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Timer,
  PieChart as PieIcon,
  TrendingDown,
  Minus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RTooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

const PIE_COLORS = [
  "hsl(210 70% 55%)",
  "hsl(210 50% 70%)",
  "hsl(280 60% 55%)",
  "hsl(280 50% 70%)",
  "hsl(160 50% 45%)",
  "hsl(45 70% 55%)",
  "hsl(25 90% 55%)",
  "hsl(0 60% 55%)",
];

const DAY = 24 * HOUR;

function Delta({ cur, prev, suffix = "" }: { cur: number; prev: number | null; suffix?: string }) {
  if (prev === null) return null;
  const diff = cur - prev;
  const pct = prev === 0 ? null : Math.round((diff / prev) * 100);
  const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const color = diff > 0 ? "text-success" : diff < 0 ? "text-destructive" : "text-muted-foreground";
  return (
    <span className={cn("text-xs font-medium inline-flex items-center gap-0.5 tabular-nums", color)}>
      <Icon className="w-3 h-3" />
      {diff > 0 ? "+" : ""}
      {diff}
      {suffix}
      {pct !== null && (
        <span className="text-muted-foreground">
          ({diff > 0 ? "+" : ""}
          {pct}%)
        </span>
      )}
    </span>
  );
}

export default function TVFunnelOpsOverzicht() {
  const [, setTick] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setUpdatedAt(new Date());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // Rolling week vs previous week
  const cur = useMemo(() => rangeStats(NOW - 7 * DAY, NOW), [updatedAt]);
  const prev = useMemo(() => rangeStats(NOW - 14 * DAY, NOW - 7 * DAY), [updatedAt]);

  const kpiItems = [
    { label: "Instroom", cur: cur.instroom, prev: prev.instroom },
    { label: "Gem. score", cur: cur.avgScore, prev: prev.avgScore },
    { label: "Gecontacteerd", cur: cur.contacted, prev: prev.contacted },
    { label: "Contact-SLA", cur: cur.contactSLApct, prev: prev.contactSLApct, suffix: "%" },
    { label: "Geplaatst", cur: cur.geplaatst, prev: prev.geplaatst },
  ];

  const tierStats = tierContactStats();
  const trend = dailyInstroom.slice(-28);
  const pieData = sourceTree.map((s) => ({
    name: SOURCE_LABELS[s.bron] ?? s.bron,
    value: s.total,
  }));
  const fcst = kpis.forecastMaand;


  return (
    <TVDashboardLayout title="Funnel Operations · Overzicht">
      <div className="flex flex-col h-full gap-2">
        {/* KPI strip */}
        <div className="rounded-lg border border-border bg-card p-2 shadow-sm">
          <div className="grid grid-cols-5 gap-2">
            {kpiItems.map((it) => (
              <div key={it.label} className="border border-border rounded-md p-2">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {it.label}
                </div>
                <div className="text-xl font-bold tabular-nums">
                  {it.cur}
                  {it.suffix ?? ""}
                </div>
                <Delta cur={it.cur} prev={it.prev} suffix={it.suffix} />
              </div>
            ))}
          </div>
        </div>

        {/* Trend + SLA + Bron */}
        <div className="grid grid-cols-12 gap-2">
          {/* Instroom trend */}
          <div className="col-span-6 rounded-lg border border-border bg-card p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-success" />
              <h3 className="text-sm font-semibold">Instroom (4 weken)</h3>
            </div>
            <div className="h-[18vh]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="dag"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    interval={3}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RTooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="nieuw"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={false}
                    name="Nieuw"
                  />
                  <Line
                    type="monotone"
                    dataKey="bestaand"
                    stroke="hsl(25 90% 55%)"
                    strokeWidth={2}
                    dot={false}
                    name="Bestaand"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success" /> Nieuw
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> Bestaand
              </span>
            </div>
          </div>

          {/* SLA per tier */}
          <div className="col-span-3 rounded-lg border border-border bg-card p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-semibold">SLA per tier</h3>
            </div>
            <div className="space-y-1.5">
              {tierStats.map((t) => (
                <div key={t.tier} className="flex items-center gap-2">
                  <span
                    className="text-xs font-semibold w-12"
                    style={{ color: TIER_COLOR[t.tier as Tier] }}
                  >
                    {t.tier}
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${t.pct}%`,
                        background:
                          t.pct >= 80
                            ? "hsl(var(--success))"
                            : t.pct >= 60
                            ? "hsl(25 90% 55%)"
                            : "hsl(var(--destructive))",
                      }}
                    />
                  </div>
                  <span className="text-xs tabular-nums w-10 text-right">{t.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bron-mix + forecast */}
          <div className="col-span-3 rounded-lg border border-border bg-card p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Bron-mix &amp; forecast</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 items-center">
              <div className="h-[16vh]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      innerRadius="40%"
                      outerRadius="80%"
                      paddingAngle={2}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RTooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 6,
                        fontSize: 11,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] text-muted-foreground leading-tight">
                  Verwacht aantal plaatsingen
                </div>
                <div className="text-2xl font-bold tabular-nums leading-none">{fcst.goal}</div>
                <div className="text-[10px] text-muted-foreground">ideaal {fcst.ideal}</div>
                <div className="text-[10px] text-orange-500">
                  +{fcst.ideal - fcst.goal} potentie
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
          <RefreshCw className="w-3 h-3" />
          {updatedAt.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </TVDashboardLayout>
  );
}
