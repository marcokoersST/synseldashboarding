import { Phone, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { weekCallStats, periodCallStats } from "@/data/tvData";

interface CallStatsProps {
  mode: "week" | "period";
}

export function CallStats({ mode }: CallStatsProps) {
  if (mode === "period") {
    return (
      <div className="bg-card rounded-xl p-5 border border-border h-full">
        <h3 className="text-sm font-semibold text-foreground mb-4">Belstatistieken</h3>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{periodCallStats.totalOutbound.toLocaleString("nl-NL")}</p>
              <p className="text-xs text-muted-foreground">Uitgaande gesprekken</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <div>
              <p className="text-2xl font-bold text-foreground">{periodCallStats.totalDurationHours}u</p>
              <p className="text-xs text-muted-foreground">Totale gesprekstijd</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Gem. {periodCallStats.avgPerDay} gesprekken/dag</p>
      </div>
    );
  }

  const totalOutbound = weekCallStats.reduce((s, d) => s + d.outbound, 0);
  const totalMinutes = weekCallStats.reduce((s, d) => s + d.duration, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return (
    <div className="bg-card rounded-xl p-5 border border-border h-full">
      <h3 className="text-sm font-semibold text-foreground mb-4">Belstatistieken</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" />
          <div>
            <p className="text-2xl font-bold text-foreground">{totalOutbound}</p>
            <p className="text-xs text-muted-foreground">Uitgaand</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent" />
          <div>
            <p className="text-2xl font-bold text-foreground">{hours}u {mins}m</p>
            <p className="text-xs text-muted-foreground">Gesprekstijd</p>
          </div>
        </div>
      </div>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekCallStats}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [v, "Gesprekken"]}
            />
            <Bar dataKey="outbound" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
