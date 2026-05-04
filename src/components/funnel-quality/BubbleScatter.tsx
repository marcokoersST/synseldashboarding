import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ReferenceLine, CartesianGrid, Cell } from "recharts";
import { bubbleData, VACATURE_CLUSTERS } from "@/data/funnelQualityData";

const CLUSTER_COLORS: Record<string, string> = {
  Operator: "#0ea5e9",
  Monteur: "#10b981",
  Engineer: "#8b5cf6",
  Werkvoorbereider: "#eab308",
  Servicemonteur: "#f97316",
};

export function BubbleScatter({ height = 320 }: { height?: number }) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 12, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            type="number"
            dataKey="convNieuw6m"
            name="Nieuw 6m"
            unit="%"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            label={{ value: "Cohortconv 6m — Nieuw (%)", position: "insideBottom", offset: -2, style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" } }}
            domain={[0, 8]}
          />
          <YAxis
            type="number"
            dataKey="convReact6m"
            name="Heract 6m"
            unit="%"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            label={{ value: "Heractivering (%)", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "hsl(var(--muted-foreground))", textAnchor: "middle" } }}
            domain={[0, 8]}
          />
          <ZAxis type="number" dataKey="n" range={[60, 600]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
            formatter={(v: any, n: string, p: any) => {
              if (n === "convNieuw6m") return [`${v}%`, "Nieuw 6m"];
              if (n === "convReact6m") return [`${v}%`, "Heract 6m"];
              if (n === "n") return [v, "n"];
              return v;
            }}
          />
          <ReferenceLine
            segment={[{ x: 0, y: 0 }, { x: 8, y: 8 }]}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="4 4"
            label={{ value: "y = x", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          {VACATURE_CLUSTERS.map((c) => (
            <Scatter key={c} name={c} data={bubbleData.filter((b) => b.cluster === c)}>
              {bubbleData.filter((b) => b.cluster === c).map((_, i) => (
                <Cell key={i} fill={CLUSTER_COLORS[c]} fillOpacity={0.7} />
              ))}
            </Scatter>
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
