import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { ActionTable } from "../ActionTable";
import { TileInfo } from "../TileInfo";
import { PeriodComparisonStrip } from "../PeriodComparisonStrip";
import { kpis, getActionList, tierContactStats, dailyInstroom, sourceTree } from "@/data/funnelOperationsData";
import { TIER_COLOR } from "@/data/funnelOperationsData";
import type { Tier } from "@/data/funnelOperationsData";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip, PieChart, Pie, Cell } from "recharts";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { TrendingUp, Timer, PieChart as PieIcon, AlertTriangle, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const PIE_COLORS = ["hsl(45 70% 55%)", "hsl(210 70% 55%)", "hsl(160 50% 45%)", "hsl(280 60% 55%)", "hsl(0 60% 55%)"];

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
  const pieData = sourceTree.map(s => ({ name: s.bron, value: s.total }));
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
                title="Instroom (4 weken)"
                what={
                  "Trendlijn van de instroom van kandidaten over tijd. Gaat om kandidaten die op status '1 | Inschrijven' zijn gekomen in RecruitCRM, opgesplitst naar Nieuw vs Bestaand.\n\n" +
                  "Nieuw: kandidaat heeft nog nooit eerder op status Inschrijven gestaan.\n" +
                  "Bestaand: kandidaat is opnieuw op status Inschrijven gekomen en heeft daar minimaal 1× eerder op gestaan."
                }
                formula={
                  "per dag d in [today-28, today]:\n" +
                  "  nieuw    = count(c | c.status = '1 | Inschrijven' op d ∧ geen eerdere Inschrijven-historie)\n" +
                  "  bestaand = count(c | c.status = '1 | Inschrijven' op d ∧ ≥1 eerdere Inschrijven-historie)"
                }
                source="dailyInstroom · RecruitCRM kandidaat-status historie"
                notes="Mock-mix Nieuw/Bestaand ≈ 60/40."
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
                  title="SLA per tier · % binnen contact"
                  what={
                    "Percentage kandidaten per tier dat op tijd is gebeld. We kijken naar alle kandidaten die in deze week op status '1 | Inschrijven' zijn gezet en checken of in de callrecordings een uitgaande poging valt binnen de tier-termijn."
                  }
                  formula={
                    "per tier T:\n" +
                    "  pct = count(c ∈ T met uitgaande call binnen tier_SLA(T)) / count(c ∈ T) × 100\n\n" +
                    "Tier-termijnen (geldt voor het hele dashboard):\n" +
                    "  85+    → 2× gebeld binnen 1 uur\n" +
                    "  70-85  → gebeld binnen 1 uur\n" +
                    "  50-70  → gebeld op het eerstvolgende belmoment\n" +
                    "  30-50  → gebeld binnen 1 dag\n" +
                    "  0-30   → gebeld binnen 2 dagen"
                  }
                  source="tierContactStats() · RecruitCRM callrecordings (uitgaande pogingen)"
                  notes="Telt belpoging, niet daadwerkelijk gesprek. n = onTime/total in deze week."
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
                <TileInfo title="Source mix & forecast" what="Distribution of candidates over the 5 main sourcing channels alongside the median monthly placement forecast." formula="share = count(candidates per source) / total\nforecast = kpis.forecastMaand.p50" source="sourceTree · kpis.forecastMaand" notes="Mock mix jobscan/open_cv/cv_database/reactivation/linkedin: 30/15/20/25/10." />
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
                <div className="text-xs text-muted-foreground">Forecast P50</div>
                <div className="text-2xl font-bold tabular-nums">{fcst.p50}</div>
                <div className="text-[11px] text-muted-foreground">doel {fcst.goal} · ideaal {fcst.ideal}</div>
                <div className="text-[11px] text-orange-500">+{fcst.ideal - fcst.p50} potentie bij optimale distributie</div>
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
              <TileInfo title="Actions today" what="Open candidates whose contact-SLA is breached or within 20% of its deadline. Drives the recruiter team's daily call list." formula="getContactSLA(c).status ∈ {expired, at_risk}\nsort: highest pctElapsed first" source="getActionList()" notes="The actions themselves happen in RecruitCRM via the deeplinks." />
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
