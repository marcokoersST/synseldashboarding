import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from "recharts";
import { schoenfeldResiduals } from "@/data/funnelQualityData";

export function SchoenfeldPlot() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {schoenfeldResiduals.map((s) => (
        <div key={s.covariate} className="rounded-md border border-border bg-card p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Schoenfeld — {s.covariate}</p>
          <div style={{ width: "100%", height: 140 }}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 6, right: 8, bottom: 6, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" dataKey="time" name="Tijd" tick={{ fontSize: 9 }} />
                <YAxis type="number" dataKey="residual" name="Residual" domain={[-1, 1]} tick={{ fontSize: 9 }} />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 11 }} />
                <Scatter data={s.points} fill="hsl(var(--primary))" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}
