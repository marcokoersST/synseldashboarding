import { Card } from "@/components/ui/card";
import { KPITile, statusFromPct } from "../KPITile";
import { ActionList } from "../ActionList";
import { TileInfo } from "../TileInfo";
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
      {/* 6 KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPITile label="Instroom volume" value={`${kpis.instroomVolume.value}`} sub={`${kpis.instroomVolume.pct}% van weekdoel ${kpis.instroomVolume.goal}`} status={statusFromPct(kpis.instroomVolume.pct)} onClick={() => goTo("instroom")}
          info={{ title: "Instroom volume", what: "Aantal nieuw toegewezen kandidaten in de afgelopen 7 dagen.", formula: "telling: candidates.toegewezenOp ≥ NOW − 7d", source: "kpis.instroomVolume", notes: "Weekdoel staat hard op 700." }} />
        <KPITile label="Instroom kwaliteit" value={`${kpis.instroomKwaliteit.value}`} sub={`Δ ${kpis.instroomKwaliteit.value - kpis.instroomKwaliteit.prev > 0 ? "+" : ""}${kpis.instroomKwaliteit.value - kpis.instroomKwaliteit.prev} vs vorige week`} status={kpis.instroomKwaliteit.value >= 70 ? "groen" : kpis.instroomKwaliteit.value >= 60 ? "oranje" : "rood"} onClick={() => goTo("instroom")}
          info={{ title: "Instroom kwaliteit", what: "Gemiddelde plaatsbaarheidscore (0-100) van kandidaten van afgelopen week.", formula: "avg(score) over instroom afgelopen 7d\nΔ = deze week − vorige week", source: "kpis.instroomKwaliteit", notes: "Score-buckets: D 0-34 · C 35-54 · B 55-74 · A 75-89 · A+ 90-100." }} />
        <KPITile label="Contact-SLA" value={`${kpis.contactSLA.pct}%`} sub="binnen SLA, alle tiers" status={statusFromPct(kpis.contactSLA.pct, 90, 75)} onClick={() => goTo("opvolging")}
          info={{ title: "Contact-SLA", what: "Aandeel gecontacteerde kandidaten dat binnen het SLA-venster van zijn tier is bereikt.", formula: "in_SLA / contacted × 100", source: "SLA_MATRIX × candidates.eersteContactOp", notes: "Tier A+: 2u · A: 8u · B: 48u · C: 5d · D: 10d." }} />
        <KPITile label="Bel-discipline" value={`${kpis.belDiscipline.pct}%`} sub="kandidaten met 6/6 belmomenten" status={statusFromPct(kpis.belDiscipline.pct, 75, 60)} onClick={() => goTo("opvolging")}
          info={{ title: "Bel-discipline", what: "% kandidaten waar alle 6 belmomenten over 2 dagen zijn uitgevoerd.", formula: "kandidaten met 6/6 uitgevoerd / totaal", source: "callAttempts", notes: "Mock-aanname: ~70% haalt 6/6." }} />
        <KPITile label="Distributie-fit" value={`${dist.pct}%`} sub={`${dist.actual} van ${dist.ideal} optimaal`} status={statusFromPct(dist.pct, 95, 85)} onClick={() => goTo("distributie")}
          info={{ title: "Distributie-fit", what: "Verhouding tussen werkelijke plaatsingen en het ideaal bij optimale consultant-routing.", formula: "actual / ideal × 100\nideal = actual × 1.18", source: "kpis.distributieFit", notes: "Hit-rate per consultant × functiegroep wordt deterministisch gegenereerd." }} />
        <KPITile label="Forecast deze maand" value={`${fcst.p50}`} sub={`P50 vs doel ${fcst.goal} · ideaal ${fcst.ideal}`} status={statusFromPct(Math.round((fcst.p50 / fcst.goal) * 100), 100, 85)} onClick={() => goTo("forecast")}
          info={{ title: "Forecast deze maand", what: "Mediane verwachting (P50) plaatsingen voor deze maand.", formula: "P50 forecastmodel\nIdeaal = bij optimale herverdeling", source: "kpis.forecastMaand", notes: "Klik in 'Forecast' op de oranje tegel voor herverdeel-suggesties." }} />
      </div>

      {/* Mini overzichten */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold">Instroom (4 weken)</h3>
            <button onClick={() => goTo("instroom")} className="text-xs text-primary hover:underline">Bekijk →</button>
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
            <button onClick={() => goTo("opvolging")} className="text-xs text-primary hover:underline">Bekijk →</button>
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
            <button onClick={() => goTo("forecast")} className="text-xs text-primary hover:underline">Bekijk →</button>
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
          <button onClick={() => goTo("watchlist")} className="text-xs text-primary hover:underline whitespace-nowrap">Bekijk volledige watchlist →</button>
        </div>
        <ActionList rows={actionRows} dense />
      </Card>
    </div>
  );
}
