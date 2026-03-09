import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { CalendarX2, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { placementAttritionData } from "@/data/managerPerformanceDataV2";

export function PlacementAttritionCard({ delay = 0 }: { delay?: number }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const totalStoppers = placementAttritionData.reduce((s, p) => s + p.stoppersCount, 0);
  const totalImpact = placementAttritionData.reduce((s, p) => s + p.revenueImpact, 0);
  const highAttritionThreshold = 3;

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <CalendarX2 className="h-5 w-5 text-destructive" />
          <div>
            <h3 className="text-sm font-medium text-foreground">Verwachte Afvallers</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalStoppers} stoppers — €{totalImpact.toFixed(0)}k omzetrisico
            </p>
          </div>
        </div>

        {/* Bar chart */}
        <div className="h-36 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={placementAttritionData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                formatter={(value: number) => [`€${value}k`, "Omzetrisico"]}
              />
              <Bar dataKey="revenueImpact" radius={[4, 4, 0, 0]}>
                {placementAttritionData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.stoppersCount >= highAttritionThreshold ? "hsl(var(--destructive))" : "hsl(var(--primary) / 0.6)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Period details */}
        <div className="space-y-1">
          {placementAttritionData.map(period => {
            const isHigh = period.stoppersCount >= highAttritionThreshold;
            const isExpanded = expanded === period.period;
            return (
              <div key={period.period} className={cn(
                "rounded-lg border transition-colors",
                isHigh ? "border-destructive/30 bg-destructive/5" : "border-border/50"
              )}>
                <button
                  onClick={() => setExpanded(isExpanded ? null : period.period)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent/30 transition-colors"
                >
                  <span className={cn("text-xs font-semibold w-8", isHigh ? "text-destructive" : "text-foreground")}>{period.period}</span>
                  <span className="text-xs text-muted-foreground flex-1">{period.stoppersCount} stopper{period.stoppersCount !== 1 ? "s" : ""}</span>
                  <span className={cn("text-xs font-semibold tabular-nums", isHigh ? "text-destructive" : "text-foreground")}>-€{period.revenueImpact.toFixed(1)}k</span>
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                {isExpanded && (
                  <div className="px-3 pb-2 space-y-1">
                    {period.consultants.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="text-foreground font-medium">{c.name}</span>
                        <span>·</span>
                        <span>{c.candidateName}</span>
                        <span className="ml-auto tabular-nums font-medium text-foreground">€{c.revenue.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AnimatedCard>
  );
}
