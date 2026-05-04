import { ResponsiveContainer, LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, ReferenceLine } from "recharts";
import { survivalCurve, survivalMedians } from "@/data/funnelQualityData";

const NEW_COLOR = "hsl(142 71% 45%)";    // groen
const REACT_COLOR = "hsl(25 95% 53%)";   // oranje

export function KMChart({ height = 320 }: { height?: number }) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <ComposedChart data={survivalCurve} margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            label={{ value: "Dagen sinds inschrijving", position: "insideBottom", offset: -4, style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" } }}
          />
          <YAxis
            domain={[0.85, 1]}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            label={{ value: "Survival (% niet geplaatst)", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "hsl(var(--muted-foreground))", textAnchor: "middle" } }}
          />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => `${(v * 100).toFixed(2)}%`}
            labelFormatter={(d) => `Dag ${d}`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {/* Confidence bands */}
          <Area type="monotone" dataKey="newCiHigh" stroke="none" fill={NEW_COLOR} fillOpacity={0.08} legendType="none" name="" />
          <Area type="monotone" dataKey="newCiLow" stroke="none" fill="hsl(var(--background))" fillOpacity={1} legendType="none" name="" />
          <Area type="monotone" dataKey="reactCiHigh" stroke="none" fill={REACT_COLOR} fillOpacity={0.08} legendType="none" name="" />
          <Area type="monotone" dataKey="reactCiLow" stroke="none" fill="hsl(var(--background))" fillOpacity={1} legendType="none" name="" />
          {/* Curves */}
          <Line type="monotone" dataKey="newSurv" name="Nieuwe kandidaten" stroke={NEW_COLOR} strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="reactSurv" name="Heractivering" stroke={REACT_COLOR} strokeWidth={2.5} dot={false} />
          {/* Median lines */}
          <ReferenceLine x={survivalMedians.nieuw} stroke={NEW_COLOR} strokeDasharray="3 3" label={{ value: `mediaan ${survivalMedians.nieuw}d`, fill: NEW_COLOR, fontSize: 10, position: "top" }} />
          <ReferenceLine x={survivalMedians.heractivering} stroke={REACT_COLOR} strokeDasharray="3 3" label={{ value: `mediaan ${survivalMedians.heractivering}d`, fill: REACT_COLOR, fontSize: 10, position: "top" }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
