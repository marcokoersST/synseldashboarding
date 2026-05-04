import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { scoreHistogram, TIER_COLOR, type Tier } from "@/data/funnelOperationsData";

export function ScoreHistogram({ filter, title }: { filter: "totaal" | "nieuw" | "bestaand"; title: string }) {
  const data = scoreHistogram(filter);
  return (
    <div className="border border-border rounded-md p-3 bg-card">
      <div className="text-xs font-medium text-muted-foreground mb-2">{title}</div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis dataKey="tier" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {data.map((d) => <Cell key={d.tier} fill={TIER_COLOR[d.tier as Tier]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
