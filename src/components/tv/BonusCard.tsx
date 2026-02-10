import { DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { bonusData } from "@/data/tvData";

export function BonusCard() {
  return (
    <div className="bg-card rounded-xl p-5 border border-border h-full">
      <h3 className="text-sm font-semibold text-foreground mb-4">Bonussen</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Afgelopen maand</p>
          <p className="text-2xl font-bold text-foreground">€{bonusData.lastMonth.toLocaleString("nl-NL")}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Afgelopen 12 maanden</p>
          <p className="text-2xl font-bold text-foreground">€{(bonusData.last12Months / 1000).toFixed(0)}K</p>
        </div>
      </div>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={bonusData.monthlyTrend}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [`€${v.toLocaleString("nl-NL")}`, "Bonus"]}
            />
            <Line type="monotone" dataKey="amount" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
