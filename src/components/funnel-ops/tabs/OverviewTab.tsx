import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { ActionTable } from "../ActionTable";
import { TileInfo } from "../TileInfo";
import { PeriodComparisonStrip } from "../PeriodComparisonStrip";
import { kpis, getActionList, tierContactStats, dailyInstroom, sourceTree, SOURCE_LABELS } from "@/data/funnelOperationsData";
import { TIER_COLOR } from "@/data/funnelOperationsData";
import type { Tier } from "@/data/funnelOperationsData";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip, PieChart, Pie, Cell } from "recharts";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { TrendingUp, Timer, PieChart as PieIcon, AlertTriangle, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const PIE_COLORS = [
  "hsl(210 70% 55%)", "hsl(210 50% 70%)", "hsl(280 60% 55%)", "hsl(280 50% 70%)",
  "hsl(160 50% 45%)", "hsl(45 70% 55%)", "hsl(25 90% 55%)", "hsl(0 60% 55%)",
];

type Filter = "alle" | "verlopen" | "dreigend";

export function OverviewTab({ goTo }: { goTo: (tab: string) => void }) {
  const [filter, setFilter] = useState<Filter>("alle");
  const allActions = useMemo(() => getActionList(), []);
  const filteredActions = useMemo(
    () => filter === "alle" ? allActions : allActions.filter(a => a.sla.status === filter),
    [allActions, filter]
  );
  const counts = useMemo(() => ({
    verlopen: allActions.filter(a => a.sla.status === "verlopen").length,
    dreigend: allActions.filter(a => a.sla.status === "dreigend").length,
  }), [allActions]);

  const tierStats = tierContactStats();
  const trend = dailyInstroom.slice(-28);
  const pieData = sourceTree.map(s => ({ name: SOURCE_LABELS[s.bron] ?? s.bron, value: s.total }));
  const fcst = kpis.forecastMaand;

  return (
    <div className="space-y-4 animate-fade-in">
      <PeriodComparisonStrip />

      {/* Instroom 4 weken — full width on top */}
      <AnimatedCard delay={0}>
        <Card className="p-4 space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <h3 className="text-sm font-semibold">Instroom (4 weken)</h3>
            </div>
            <div className="flex items-center gap-1">
              <TileInfo
                title="Inflow (4 weeks)"
                what={
                  "Trend line of candidate inflow over time. Counts candidates that entered status '1 | Inschrijven' in RecruitCRM, split into New vs Returning.\n\n" +
                  "New: candidate has never previously been on status Inschrijven.\n" +
                  "Returning: candidate is back on status Inschrijven and has been on it at least once before."
                }
                formula={
                  "per day d in [today-28, today]:\n" +
                  "  new       = count(c | c.status = '1 | Inschrijven' on d ∧ no prior Inschrijven history)\n" +
                  "  returning = count(c | c.status = '1 | Inschrijven' on d ∧ ≥1 prior Inschrijven history)"
                }
                source="dailyInstroom · RecruitCRM candidate status history"
                notes="Mock mix new/returning ≈ 60/40."
              />
              <button onClick={() => goTo("instroom")} className="text-xs text-primary hover:underline">Bekijk →</button>
            </div>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="dag" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={3} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 11 }} />
                <Line type="monotone" dataKey="nieuw" stroke="hsl(var(--success))" strokeWidth={2} dot={false} name="Nieuw" animationDuration={900} />
                <Line type="monotone" dataKey="bestaand" stroke="hsl(25 90% 55%)" strokeWidth={2} dot={false} name="Bestaand" animationDuration={900} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /> Nieuw</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> Bestaand</span>
          </div>
        </Card>
      </AnimatedCard>

      {/* SLA per tier + Bron-mix naast elkaar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatedCard delay={80}>
          <Card className="p-4 space-y-3 h-full hover:shadow-md transition-shadow">
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-semibold">SLA per tier · % binnen contact</h3>
              </div>
              <div className="flex items-center gap-1">
                <TileInfo
                  title="SLA per tier · % contacted on time"
                  what={
                    "Percentage of candidates per tier called within the tier-specific deadline. Looks at all candidates set to status '1 | Inschrijven' in this week and checks whether the call recordings contain an outbound attempt within that tier's deadline."
                  }
                  formula={
                    "per tier T:\n" +
                    "  pct = count(c ∈ T with outbound call within tier_SLA(T)) / count(c ∈ T) × 100\n\n" +
                    "Tier deadlines (apply across the whole dashboard):\n" +
                    "  85+    → called 2× within 1 hour\n" +
                    "  70-85  → called within 1 hour\n" +
                    "  50-70  → called at the next call slot\n" +
                    "  30-50  → called within 1 day\n" +
                    "  0-30   → called within 2 days"
                  }
                  source="tierContactStats() · RecruitCRM call recordings (outbound attempts)"
                  notes="Counts call attempt, not actual conversation. n = onTime/total in this week."
                />
                <button onClick={() => goTo("opvolging")} className="text-xs text-primary hover:underline">Bekijk →</button>
              </div>
            </div>
            <div className="space-y-1.5">
              {tierStats.map(t => (
                <div key={t.tier} className="flex items-center gap-2">
                  <span className="text-xs font-semibold w-12" style={{ color: TIER_COLOR[t.tier as Tier] }}>{t.tier}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${t.pct}%`, background: t.pct >= 80 ? "hsl(var(--success))" : t.pct >= 60 ? "hsl(25 90% 55%)" : "hsl(var(--destructive))" }} />
                  </div>
                  <span className="text-xs tabular-nums w-10 text-right">{t.pct}%</span>
                  <span className="text-[10px] text-muted-foreground w-20 text-right tabular-nums">{t.onTime}/{t.total}</span>
                </div>
              ))}
            </div>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={160}>
          <Card className="p-4 space-y-3 h-full hover:shadow-md transition-shadow">
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Bron-mix &amp; forecast</h3>
              </div>
              <div className="flex items-center gap-1">
                <TileInfo
                  title="Source mix & forecast"
                  what={
                    "Source mix: number of candidates that entered status Inschrijven, broken down by utm_medium.\n\n" +
                    "Mediums:\n" +
                    "  1. Jobboards paid       → utm_medium = paid_jobboard\n" +
                    "  2. Jobboards organic    → utm_medium = organic_jobboard\n" +
                    "  3. Paid social          → utm_medium = paid_social\n" +
                    "  4. Organic social       → utm_medium = organic_social\n" +
                    "  5. Reactivation         → utm_medium = app OR mail\n" +
                    "  6. Direct               → utm_medium = direct_mail OR direct_telefoon\n" +
                    "  7. CV databases         → utm_medium = cv_database\n" +
                    "  8. LinkedIn recruiter   → utm_medium = recruiter\n\n" +
                    "Expected placements: forecasted number of placements for this inflow (same logic as the top 5 KPI tiles).\n\n" +
                    "Potential at optimal distribution: max number of placements based on inflow × normalised job titles × per-consultant placement ratio. Underlined value = +Δ between current forecast and theoretical maximum."
                  }
                  formula={
                    "share(medium)  = count(candidates with utm_medium = medium) / total\n" +
                    "expected       = Σ historical placement_ratio(job_title, score) × instroom\n" +
                    "potential      = max Σ placement_ratio(job_title, consultant) − expected"
                  }
                  source="sourceTree · kpis.forecastMaand · RecruitCRM utm_medium + placement history"
                  notes="Requires normalised job titles and per-consultant placement ratios for the potential calculation."
                />
                <button onClick={() => goTo("forecast")} className="text-xs text-primary hover:underline">Bekijk →</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 items-center">
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={32} outerRadius={58} paddingAngle={2} animationDuration={900}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <RTooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs text-muted-foreground">Verwacht aantal plaatsingen</div>
                <div className="text-2xl font-bold tabular-nums">{fcst.goal}</div>
                <div className="text-[11px] text-muted-foreground">ideaal {fcst.ideal}</div>
                <div className="text-[11px] text-orange-500">+{fcst.ideal - fcst.goal} potentie bij optimale distributie</div>
              </div>
            </div>
          </Card>
        </AnimatedCard>
      </div>

      {/* Acties vandaag — full fix list */}
      <AnimatedCard delay={240}>
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border gap-3 flex-wrap">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold">Acties vandaag</h3>
                <p className="text-xs text-muted-foreground">
                  {filteredActions.length} kandidaten met SLA-overschrijding of dreigend ·{" "}
                  <span className="text-destructive font-medium">{counts.verlopen} verlopen</span> ·{" "}
                  <span className="text-orange-500 font-medium">{counts.dreigend} dreigend</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(["alle","verlopen","dreigend"] as const).map(k => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full border transition-colors capitalize",
                    filter === k
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:bg-muted/50"
                  )}
                >{k}</button>
              ))}
              <Link
                to="/tv/acties-vandaag"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-full border border-border bg-background hover:bg-muted/50 transition-colors"
              >
                <Monitor className="w-3 h-3" /> TV Modus
              </Link>
              <TileInfo
                title="Actions today"
                what={
                  "Per candidate the open contact-SLA: tier, time remaining or hours overdue, and the owning consultant in RecruitCRM.\n\n" +
                  "Filter columns (icon in column header):\n" +
                  "  · Kandidaat — multi-select on candidate name\n" +
                  "  · Tier (chip + filter) — multi-select on tier 0-30 / 30-50 / 50-70 / 70-85 / 85+\n" +
                  "  · Consultant — multi-select on owning consultant (no recruiters; only consultants are shown here)\n" +
                  "  · SLA — dual-thumb hour slider (negative = time left, positive = hours overdue), bounds derived from current dataset"
                }
                formula={
                  "deadline    = ingeschrevenOp + tier_SLA(c.tier)\n" +
                  "hoursOver   = (now − deadline) / 1h    (negative = time left)\n" +
                  "status      = expired   if hoursOver > 0\n" +
                  "            = at_risk   if (deadline − now) ≤ 20% × tier_SLA\n" +
                  "sort: column header click; default = largest breach first"
                }
                source="getActionList() · RecruitCRM candidate status, ingeschrevenOp, owner"
                notes="Tier deadlines identical to the SLA per tier tile. Actions happen in RecruitCRM via the deeplinks."
              />
              <button onClick={() => goTo("watchlist")} className="text-xs text-primary hover:underline whitespace-nowrap">Volledige watchlist →</button>
            </div>
          </div>
          <div className="max-h-[620px] overflow-y-auto">
            <ActionTable rows={filteredActions} dense />
          </div>
        </Card>
      </AnimatedCard>
    </div>
  );
}
