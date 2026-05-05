import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ComposedChart, Line, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { forecastSeries, kpis, UNITS_REF, FUNCTIEGROEPEN_REF, candidates } from "@/data/funnelOperationsData";
import { TileInfo } from "../TileInfo";
import { OptimalReassignPanel } from "../OptimalReassignPanel";
import { MousePointerClick, TrendingUp, Target, BarChart3, LineChart as LineIcon, Table as TableIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ForecastTab() {
  const [openReassign, setOpenReassign] = useState(false);
  const series = forecastSeries();
  const fcst = kpis.forecastMaand;

  const open = candidates.filter(c => c.status !== "geplaatst" && c.status !== "afgesloten");
  const rows = UNITS_REF.flatMap(unit => FUNCTIEGROEPEN_REF.slice(0, 5).map(fg => {
    const subset = open.filter(c => c.unit === unit && c.functiegroep === fg);
    const conv = 0.08 + (subset.reduce((s, c) => s + c.score, 0) / Math.max(1, subset.length)) / 1000;
    return { unit, fg, open: subset.length, conv: +(conv * 100).toFixed(1), expect: Math.round(subset.length * conv) };
  })).filter(r => r.open > 0).sort((a, b) => b.expect - a.expect).slice(0, 12);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4 border-l-4 border-l-success">
          <div className="flex items-start justify-between gap-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Verwacht (huidige distributie)</div>
            <TileInfo
              title="Forecast — current distribution (P50)"
              what="Median expected placements for this month given the current consultant assignments and their historical hit-rates per job family."
              formula={`P50 = Σ ( open_candidates × hit_rate(consultant, job_family) )\nValue: ${fcst.p50}`}
              source="kpis.forecastMaand.p50"
              notes="Hard-coded mock output; in production this comes from the forecast model."
            />
          </div>
          <div className="text-3xl font-bold tabular-nums">{fcst.p50}</div>
          <div className="text-xs text-muted-foreground">vs maanddoel {fcst.goal}</div>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          aria-label="Toon herverdeel-suggesties"
          onClick={() => setOpenReassign(true)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenReassign(true); } }}
          className={cn(
            "p-4 border-l-4 border-l-orange-500 cursor-pointer transition-all",
            "hover:bg-orange-500/5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40",
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Verwacht (optimale distributie)</div>
            <TileInfo
              title="Forecast — optimal distribution"
              what="Maximum forecast achievable when every open candidate is routed to the best-fitting consultant. The gap vs P50 is the optimisation upside."
              formula={`Optimal = Σ ( open_candidates × max_hit_rate(*, job_family) )\nValue: ${fcst.ideal}\nUpside: +${fcst.ideal - fcst.p50}`}
              source="kpis.forecastMaand.ideal · optimalReassignments()"
              notes="Capacity per consultant in this round capped at 8 new matches."
            />
          </div>
          <div className="text-3xl font-bold tabular-nums">{fcst.ideal}</div>
          <div className="text-xs text-orange-500 flex items-center gap-1">
            +{fcst.ideal - fcst.p50} potentie
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground ml-1">
              <MousePointerClick className="w-3 h-3" /> klik voor herverdeel-lijst
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Scenario's</div>
            <TileInfo
              title="Scenarios P10 / P50 / P90"
              what="Pessimistic / expected / optimistic placement scenarios for the current month. Used to communicate forecast uncertainty to stakeholders."
              formula={`P10 = P50 − 18\nP50 = ${fcst.p50}\nP90 = P50 + 22`}
              source="forecastSeries() — last 3 months"
              notes="Bandwidth is based on a historical standard deviation of ±15%."
            />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-center">
            <div><div className="text-[10px] text-muted-foreground">P10</div><div className="text-lg font-semibold tabular-nums">{fcst.p50 - 18}</div></div>
            <div><div className="text-[10px] text-muted-foreground">P50</div><div className="text-lg font-semibold tabular-nums">{fcst.p50}</div></div>
            <div><div className="text-[10px] text-muted-foreground">P90</div><div className="text-lg font-semibold tabular-nums">{fcst.p50 + 22}</div></div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium flex items-center gap-2"><LineIcon className="w-4 h-4 text-primary" />Plaatsingen — 12 maanden historie + 3 maanden forecast</div>
          <TileInfo
            title="History + forecast line"
            what="Actual placements per month for the last 12 months and the P50 line plus P10–P90 band for the next 3 months."
            formula="actual = sum(status='placed' per month)\nP10/P50/P90 = forecast model output"
            source="forecastSeries()"
            notes="Mock data; periods before May 2026 are deterministically generated."
          />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="maand" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="p90" stroke="none" fill="hsl(var(--primary) / 0.15)" name="P10–P90 band" />
              <Area type="monotone" dataKey="p10" stroke="none" fill="hsl(var(--background))" />
              <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Werkelijk" />
              <Line type="monotone" dataKey="p50" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="Forecast P50" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="text-sm font-semibold flex items-center gap-2"><TableIcon className="w-4 h-4 text-primary" />Bijdrage deze maand · open kandidaten × verwachte conversie</div>
          <TileInfo
            title="Contribution table"
            what="Top-12 Unit × Job-family combinations ranked by expected placements this month. Helps prioritise where additional sourcing or capacity will move the needle."
            formula="exp_conversion = 0.08 + (avg_score / 1000)\nexp_placements = open_candidates × exp_conversion"
            source="candidates filtered on status ≠ placed/closed"
            notes="Simple conversion proxy — not the production model."
          />
        </div>
        <table className="w-full text-xs">
          <thead className="text-muted-foreground bg-muted/20">
            <tr>
              <th className="text-left p-2 font-normal">Unit</th>
              <th className="text-left p-2 font-normal">Functiegroep</th>
              <th className="p-2 font-normal text-right">Open</th>
              <th className="p-2 font-normal text-right">Verw. conv.</th>
              <th className="p-2 font-normal text-right">Verw. plaatsingen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-muted/30">
                <td className="p-2">{r.unit}</td>
                <td className="p-2">{r.fg}</td>
                <td className="p-2 text-right tabular-nums">{r.open}</td>
                <td className="p-2 text-right tabular-nums">{r.conv}%</td>
                <td className="p-2 text-right tabular-nums font-semibold">{r.expect}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <OptimalReassignPanel open={openReassign} onOpenChange={setOpenReassign} />
    </div>
  );
}
