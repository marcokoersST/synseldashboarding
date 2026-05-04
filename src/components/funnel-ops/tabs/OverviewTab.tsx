import { Card } from "@/components/ui/card";
import { KPITile, statusFromPct } from "../KPITile";
import { ActionList } from "../ActionList";
import { TileInfo } from "../TileInfo";
import { PeriodComparisonStrip } from "../PeriodComparisonStrip";
import { kpis, getActionList, tierContactStats, dailyInstroom, sourceTree } from "@/data/funnelOperationsData";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip, PieChart, Pie, Cell } from "recharts";
import { TIER_COLOR } from "@/data/funnelOperationsData";
import type { Tier } from "@/data/funnelOperationsData";

const PIE_COLORS = ["hsl(45 70% 55%)", "hsl(210 70% 55%)", "hsl(160 50% 45%)", "hsl(280 60% 55%)", "hsl(0 60% 55%)"];

export function OverviewTab({ goTo }: { goTo: (tab: string) => void }) {
  const actionRows = getActionList(15);
  const tierStats = tierContactStats();
  const trend = dailyInstroom.slice(-28);
  const pieData = sourceTree.map(s => ({ name: s.bron, value: s.total }));
  const fcst = kpis.forecastMaand;
  const dist = kpis.distributieFit;

  return (
    <div className="space-y-4">
      <PeriodComparisonStrip />
      {/* 6 KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPITile label="Instroom volume" value={`${kpis.instroomVolume.value}`} sub={`${kpis.instroomVolume.pct}% van weekdoel ${kpis.instroomVolume.goal}`} status={statusFromPct(kpis.instroomVolume.pct)} onClick={() => goTo("instroom")}
          info={{ title: "Inflow volume", what: "Counts the number of candidates newly assigned to a consultant during the last 7 days. Used to monitor recruiter throughput against the weekly inflow target.", formula: "count( candidates WHERE toegewezenOp >= NOW − 7d )", source: "kpis.instroomVolume", notes: "Weekly target is hard-coded at 700; should become configurable per business unit." }} />
        <KPITile label="Instroom kwaliteit" value={`${kpis.instroomKwaliteit.value}`} sub={`Δ ${kpis.instroomKwaliteit.value - kpis.instroomKwaliteit.prev > 0 ? "+" : ""}${kpis.instroomKwaliteit.value - kpis.instroomKwaliteit.prev} vs vorige week`} status={kpis.instroomKwaliteit.value >= 70 ? "groen" : kpis.instroomKwaliteit.value >= 60 ? "oranje" : "rood"} onClick={() => goTo("instroom")}
          info={{ title: "Inflow quality", what: "Average placeability score (0-100) for candidates that entered the funnel last week. Indicates whether sourcing channels are bringing in the right profiles.", formula: "avg(score) over candidates with toegewezenOp in last 7d\nΔ = this week − previous week", source: "kpis.instroomKwaliteit", notes: "Score buckets: D 0-34 · C 35-54 · B 55-74 · A 75-89 · A+ 90-100." }} />
        <KPITile label="Contact-SLA" value={`${kpis.contactSLA.pct}%`} sub="binnen SLA, alle tiers" status={statusFromPct(kpis.contactSLA.pct, 90, 75)} onClick={() => goTo("opvolging")}
          info={{ title: "Contact SLA", what: "Share of contacted candidates that were reached inside the SLA window defined for their tier. Reflects responsiveness of the recruiter team.", formula: "in_SLA / contacted × 100", source: "SLA_MATRIX × candidates.eersteContactOp", notes: "Tier windows — A+: 2h · A: 8h · B: 48h · C: 5d · D: 10d." }} />
        <KPITile label="Bel-discipline" value={`${kpis.belDiscipline.pct}%`} sub="kandidaten met 6/6 belmomenten" status={statusFromPct(kpis.belDiscipline.pct, 75, 60)} onClick={() => goTo("opvolging")}
          info={{ title: "Call discipline", what: "Percentage of candidates for whom all 6 scheduled call attempts (2 days × 3 day-parts) were actually executed. Measures process discipline, independent of outcome.", formula: "count(candidates with 6/6 attempts executed) / total", source: "callAttempts", notes: "Mock assumption: ~70% of candidates reach 6/6." }} />
        <KPITile label="Distributie-fit" value={`${dist.pct}%`} sub={`${dist.actual} van ${dist.ideal} optimaal`} status={statusFromPct(dist.pct, 95, 85)} onClick={() => goTo("distributie")}
          info={{ title: "Distribution fit", what: "Ratio of actual placements to the ideal placements that would be achieved under perfect consultant-to-candidate routing. Quantifies the cost of mis-routing.", formula: "actual / ideal × 100\nideal = actual × 1.18", source: "kpis.distributieFit", notes: "Hit-rate per consultant × job family is generated deterministically from a seeded PRNG." }} />
        <KPITile label="Forecast deze maand" value={`${fcst.p50}`} sub={`P50 vs doel ${fcst.goal} · ideaal ${fcst.ideal}`} status={statusFromPct(Math.round((fcst.p50 / fcst.goal) * 100), 100, 85)} onClick={() => goTo("forecast")}
          info={{ title: "Forecast — current month", what: "Median (P50) expected placements for the current month, based on open candidates and historical conversion. The 'ideal' value shows the upside under optimal redistribution.", formula: "P50 = forecast model output\nIdeal = Σ open_candidates × max_hit_rate(*, job_family)", source: "kpis.forecastMaand", notes: "On the Forecast tab, click the orange tile to inspect the suggested re-assignments." }} />
      </div>

      {/* Mini overzichten */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold">Instroom (4 weken)</h3>
            <div className="flex items-center gap-1">
              <TileInfo title="Inflow (4 weeks)" what="Daily inflow split by candidate type (new vs returning). Lets the team spot demand spikes and channel shifts." formula="bucket per day from candidates.toegewezenOp, split on candidate.type" source="dailyInstroom" notes="Mock mix new/returning: 60/40." />
              <button onClick={() => goTo("instroom")} className="text-xs text-primary hover:underline">Bekijk →</button>
            </div>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="dag" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} interval={6} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 11 }} />
                <Line type="monotone" dataKey="nieuw" stroke="hsl(var(--success))" strokeWidth={2} dot={false} name="Nieuw" />
                <Line type="monotone" dataKey="bestaand" stroke="hsl(25 90% 55%)" strokeWidth={2} dot={false} name="Bestaand" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /> Nieuw</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> Bestaand</span>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold">SLA per tier · % binnen contact</h3>
            <div className="flex items-center gap-1">
              <TileInfo title="SLA per tier" what="Contact-SLA score per candidate tier (A+ down to D). Highlights where responsiveness lags for the most valuable cohorts." formula="in_SLA / contacted × 100, grouped by tier" source="tierContactStats()" notes="A+ must be reached within 2h — smallest tolerated margin." />
              <button onClick={() => goTo("opvolging")} className="text-xs text-primary hover:underline">Bekijk →</button>
            </div>
          </div>
          <div className="space-y-1.5">
            {tierStats.map(t => (
              <div key={t.tier} className="flex items-center gap-2">
                <span className="text-xs font-semibold w-8" style={{ color: TIER_COLOR[t.tier as Tier] }}>{t.tier}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: t.pct >= 80 ? "hsl(var(--success))" : t.pct >= 60 ? "hsl(25 90% 55%)" : "hsl(var(--destructive))" }} />
                </div>
                <span className="text-xs tabular-nums w-10 text-right">{t.pct}%</span>
                <span className="text-[10px] text-muted-foreground w-12 text-right">n={t.n}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold">Bron-mix &amp; forecast</h3>
            <div className="flex items-center gap-1">
              <TileInfo title="Bron-mix & forecast" what="Verdeling van kandidaten over de 5 hoofdbronnen plus deze maands forecast." formula="bron-aandeel: count(candidates per bron) / totaal" source="sourceTree · kpis.forecastMaand" notes="Mock-mix jobscan/open_cv/cv_database/reactivering/linkedin: 30/15/20/25/10." />
              <button onClick={() => goTo("forecast")} className="text-xs text-primary hover:underline">Bekijk →</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 items-center">
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={28} outerRadius={50} paddingAngle={2}>
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
      </div>

      {/* Acties vandaag */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold">Acties vandaag</h3>
            <p className="text-xs text-muted-foreground">Top {actionRows.length} kandidaten met SLA-overschrijding of dreigend. Open RecruitCRM in nieuw tabblad om te handelen.</p>
          </div>
          <div className="flex items-center gap-2">
            <TileInfo title="Acties vandaag" what="Lijst van open kandidaten waarvan de contact-SLA verlopen is of binnen 20% van zijn deadline zit." formula="getContactSLA(c).status ∈ {verlopen, dreigend}\nsort: hoogste pctElapsed eerst" source="getActionList(15)" notes="Acties zelf gebeuren in RecruitCRM via deeplinks." />
            <button onClick={() => goTo("watchlist")} className="text-xs text-primary hover:underline whitespace-nowrap">Bekijk volledige watchlist →</button>
          </div>
        </div>
        <ActionList rows={actionRows} dense />
      </Card>
    </div>
  );
}
