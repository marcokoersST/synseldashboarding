import { Card } from "@/components/ui/card";
import { ComposedChart, Line, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { forecastSeries, kpis, UNITS_REF, FUNCTIEGROEPEN_REF, candidates } from "@/data/funnelOperationsData";

export function ForecastTab() {
  const series = forecastSeries();
  const fcst = kpis.forecastMaand;

  // contribution table
  const open = candidates.filter(c => c.status !== "geplaatst" && c.status !== "afgesloten");
  const rows = UNITS_REF.flatMap(unit => FUNCTIEGROEPEN_REF.slice(0, 5).map(fg => {
    const subset = open.filter(c => c.unit === unit && c.functiegroep === fg);
    const conv = 0.08 + (subset.reduce((s, c) => s + c.score, 0) / Math.max(1, subset.length)) / 1000;
    return { unit, fg, open: subset.length, conv: +(conv * 100).toFixed(1), expect: Math.round(subset.length * conv) };
  })).filter(r => r.open > 0).sort((a, b) => b.expect - a.expect).slice(0, 12);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4 border-l-4 border-l-success">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Verwacht (huidige distributie)</div>
          <div className="text-3xl font-bold tabular-nums">{fcst.p50}</div>
          <div className="text-xs text-muted-foreground">vs maanddoel {fcst.goal}</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-orange-500">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Verwacht (optimale distributie)</div>
          <div className="text-3xl font-bold tabular-nums">{fcst.ideal}</div>
          <div className="text-xs text-orange-500">+{fcst.ideal - fcst.p50} potentie</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Scenario's</div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-center">
            <div><div className="text-[10px] text-muted-foreground">P10</div><div className="text-lg font-semibold tabular-nums">{fcst.p50 - 18}</div></div>
            <div><div className="text-[10px] text-muted-foreground">P50</div><div className="text-lg font-semibold tabular-nums">{fcst.p50}</div></div>
            <div><div className="text-[10px] text-muted-foreground">P90</div><div className="text-lg font-semibold tabular-nums">{fcst.p50 + 22}</div></div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="text-sm font-medium mb-2">Plaatsingen — 12 maanden historie + 3 maanden forecast</div>
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
        <div className="px-4 py-3 border-b border-border text-sm font-semibold">Bijdrage deze maand · open kandidaten × verwachte conversie</div>
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
    </div>
  );
}
