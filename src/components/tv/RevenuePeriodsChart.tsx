import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { revenueByPeriod } from "@/data/tvData";

export function RevenuePeriodsChart() {
  const total = revenueByPeriod.reduce((s, p) => s + p.revenue, 0);

  return (
    <div className="bg-card rounded-xl p-5 border border-border h-full">
      <h3 className="text-sm font-semibold text-foreground mb-1">Omzet Laatste 3 Periodes</h3>
      <p className="text-2xl font-bold text-foreground mb-4">
        €{(total / 1000000).toFixed(1)}M <span className="text-sm font-normal text-muted-foreground">totaal</span>
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueByPeriod}>
            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [`€${(v / 1000000).toFixed(2)}M`, "Omzet"]}
            />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
