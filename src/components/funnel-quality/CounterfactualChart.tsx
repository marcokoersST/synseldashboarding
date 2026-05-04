import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList } from "recharts";
import { counterfactualData } from "@/data/funnelQualityData";

export function CounterfactualChart({ height = 280 }: { height?: number }) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={counterfactualData} margin={{ top: 16, right: 12, bottom: 4, left: 0 }}>
          <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
            formatter={(v: number, name: string) => [v, name]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="actual" name="Werkelijk geplaatst" fill="hsl(259 94% 51%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="counterfactual" name="Mix-stabiel scenario" fill="hsl(259 94% 51% / 0.3)" radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey="gap"
              position="top"
              formatter={(v: number) => (v > 0 ? `+${v}` : "")}
              style={{ fontSize: 10, fill: "hsl(var(--destructive))", fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
