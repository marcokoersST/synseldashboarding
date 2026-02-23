import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { teamPlacements, teamStats, teamPlacementsChartData } from "@/data/managerData";
import { myTeamConsultants } from "@/data/managerData";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { useRef, useState, useCallback } from "react";

interface ManagerPlacementsCardProps {
  delay?: number;
}

export function ManagerPlacementsCard({ delay = 0 }: ManagerPlacementsCardProps) {
  const { ref, isVisible } = useAnimateOnMount({ delay: delay + 400 });
  const [candidates] = useState(() => {
    const now = new Date();
    return teamPlacements
      .filter(p => p.isActive)
      .map(p => {
        const consultant = myTeamConsultants.find(c => c.id === p.consultantId);
        return { ...p, consultantName: consultant?.name ?? "Onbekend" };
      })
      .sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
  });

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-foreground">Plaatsingen & Gedetacheerden</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Unit-niveau overzicht</p>
        </div>

        {/* Stats */}
        <div className="flex items-end gap-6 mb-4">
          <div>
            <AnimatedNumber value={teamStats.totalPlacements} delay={delay + 300} className="text-3xl font-bold text-foreground" />
            <p className="text-xs text-muted-foreground mt-0.5">Totaal</p>
          </div>
          <div>
            <AnimatedNumber value={teamStats.activePlacements} delay={delay + 400} className="text-xl font-semibold text-teal" />
            <p className="text-xs text-muted-foreground mt-0.5">Actief</p>
          </div>
        </div>

        {/* Mini chart */}
        <div ref={ref} className="h-16 mb-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={teamPlacementsChartData}>
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                formatter={(value: number, name: string) => [value, name === "historical" ? "Werkelijk" : "Projectie"]} />
              <Line type="monotone" dataKey="historical" stroke="hsl(var(--teal))" strokeWidth={2} dot={false} connectNulls={false}
                strokeDasharray={isVisible ? "0" : "1000"} strokeDashoffset={isVisible ? "0" : "1000"}
                style={{ transition: "stroke-dasharray 1.5s ease-out, stroke-dashoffset 1.5s ease-out" }} />
              <Line type="monotone" dataKey="projected" stroke="hsl(var(--teal))" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls={false}
                opacity={isVisible ? 0.7 : 0} style={{ transition: "opacity 1.5s ease-out 0.5s" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mb-4">
          <span>P1</span><span>P13</span>
        </div>

        {/* Candidates list */}
        <div className="border-t border-border pt-3 flex-1 min-h-0">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Actieve gedetacheerden</h4>
          <div className="max-h-[180px] overflow-y-auto pr-2 scrollbar-thin space-y-1.5">
            {candidates.map(c => (
              <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{c.candidateName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{c.company} · {c.consultantName}</p>
                </div>
                <div className="text-right ml-2 shrink-0">
                  <p className="text-[10px] text-teal font-medium">t/m {format(c.endDate, "d MMM yyyy", { locale: nl })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
