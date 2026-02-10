import { useState } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent } from "@/components/ui/card";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface KPITileProps {
  label: string;
  today: number;
  week: number;
  target: number;
  sparkline: number[];
  delay?: number;
}

export function KPITile({ label, today, week, target, sparkline, delay = 0 }: KPITileProps) {
  const [view, setView] = useState<"today" | "week">("week");
  const value = view === "today" ? today : week;
  const pct = Math.round((value / target) * 100);
  const chartData = sparkline.map((v, i) => ({ i, v }));

  return (
    <AnimatedCard delay={delay}>
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium truncate pr-2">{label}</p>
            <div className="flex gap-1">
              {(["today", "week"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setView(t)}
                  className={`text-[10px] px-1.5 py-0.5 rounded ${view === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  {t === "today" ? "Dag" : "Week"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold text-foreground">
                <AnimatedNumber value={value} />
              </span>
              <span className="text-xs text-muted-foreground ml-1">/ {target}</span>
            </div>
            <span className={`text-xs font-medium ${pct >= 100 ? "text-green-600" : pct >= 60 ? "text-amber-600" : "text-red-500"}`}>
              {pct}%
            </span>
          </div>
          <div className="h-8 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Area type="monotone" dataKey="v" stroke="hsl(var(--teal))" fill="hsl(var(--teal) / 0.15)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}
