import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { teamPlacements, teamStats, teamPlacementsChartData } from "@/data/managerData";
import { myTeamConsultants } from "@/data/managerData";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function useDetailToggle() {
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayMode, setDisplayMode] = useState(false);
  const toggle = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      const newMode = !isDetailMode;
      setIsDetailMode(newMode);
      setDisplayMode(newMode);
      setTimeout(() => setIsTransitioning(false), 120);
    }, 300);
  };
  return { isDetailMode, isTransitioning, displayMode, toggle };
}

interface ManagerPlacementsCardProps {
  delay?: number;
  selectedUnit?: string;
}

export function ManagerPlacementsCard({ delay = 0, selectedUnit }: ManagerPlacementsCardProps) {
  const { ref, isVisible } = useAnimateOnMount({ delay: delay + 400 });
  const { isTransitioning, displayMode, toggle } = useDetailToggle();
  const [selectedConsultant, setSelectedConsultant] = useState<number | null>(null);

  const activePlacements = useMemo(() => {
    return teamPlacements
      .filter(p => p.isActive)
      .map(p => {
        const consultant = myTeamConsultants.find(c => c.id === p.consultantId);
        return { ...p, consultantName: consultant?.name ?? "Onbekend" };
      })
      .sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
  }, []);

  // Group placements by consultant for drill-down
  const placementsByConsultant = useMemo(() => {
    const grouped: Record<number, typeof activePlacements> = {};
    activePlacements.forEach(p => {
      if (!grouped[p.consultantId]) grouped[p.consultantId] = [];
      grouped[p.consultantId].push(p);
    });
    return grouped;
  }, [activePlacements]);

  // Stoppers per period
  const stoppersByPeriod = useMemo(() => {
    const allPlacements = teamPlacements.map(p => {
      const consultant = myTeamConsultants.find(c => c.id === p.consultantId);
      return { ...p, consultantName: consultant?.name ?? "Onbekend" };
    });
    const periods: Record<string, typeof allPlacements> = {};
    allPlacements.forEach(p => {
      const month = p.endDate.getMonth() + 1;
      const periodNum = Math.ceil(month / (12/13));
      const key = `P${Math.min(periodNum, 13)}`;
      if (!periods[key]) periods[key] = [];
      if (p.endDate <= new Date()) periods[key].push(p);
    });
    return periods;
  }, []);

  const selectedConsultantData = selectedConsultant
    ? {
        consultant: myTeamConsultants.find(c => c.id === selectedConsultant),
        placements: placementsByConsultant[selectedConsultant] || [],
      }
    : null;

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Plaatsingen & Gedetacheerden</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {displayMode ? "Detail overzicht" : "Unit-niveau overzicht"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={toggle}
            className="h-7 w-7 rounded-full bg-secondary hover:bg-secondary/80">
            {displayMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>

        <div className={cn(
          "flex-1 transition-all duration-400 ease-in-out min-h-0",
          isTransitioning ? "opacity-0 scale-[0.97] translate-y-2" : "opacity-100 scale-100 translate-y-0"
        )}>
          {displayMode ? (
            <div className="space-y-4 flex-1">
              {/* Stats */}
              <div className="flex items-end gap-6">
                <div>
                  <AnimatedNumber value={teamStats.totalPlacements} delay={delay + 300} className="text-3xl font-bold text-foreground" />
                  <p className="text-xs text-muted-foreground mt-0.5">Totaal</p>
                </div>
                <div>
                  <AnimatedNumber value={teamStats.activePlacements} delay={delay + 400} className="text-xl font-semibold text-teal" />
                  <p className="text-xs text-muted-foreground mt-0.5">Actief</p>
                </div>
              </div>

              {/* Full table */}
              <div className="max-h-[280px] overflow-y-auto scrollbar-thin">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Kandidaat</th>
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">ID</th>
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Consultant</th>
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Start</th>
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Einde</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePlacements.map(p => (
                      <tr
                        key={p.id}
                        className={cn(
                          "border-b border-border/50 transition-colors cursor-pointer",
                          selectedConsultant === p.consultantId ? "bg-primary/5" : "hover:bg-muted/30"
                        )}
                        onClick={() => setSelectedConsultant(selectedConsultant === p.consultantId ? null : p.consultantId)}
                      >
                        <td className="py-2 px-2 font-medium text-foreground">{p.candidateName}</td>
                        <td className="py-2 px-2 tabular-nums text-muted-foreground">{p.candidateId}</td>
                        <td className="py-2 px-2 text-muted-foreground">{p.consultantName}</td>
                        <td className="py-2 px-2 text-muted-foreground">{format(p.startDate, "d MMM yy", { locale: nl })}</td>
                        <td className="py-2 px-2 text-teal font-medium">{format(p.endDate, "d MMM yy", { locale: nl })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Consultant drill-down */}
              {selectedConsultantData && selectedConsultantData.consultant && (
                <div className="border border-border rounded-lg p-3 bg-secondary/10 space-y-2">
                  <h4 className="text-xs font-semibold text-foreground">{selectedConsultantData.consultant.name} — Kandidaten</h4>
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-1 px-1.5 font-medium text-muted-foreground">Kandidaat</th>
                        <th className="text-left py-1 px-1.5 font-medium text-muted-foreground">Deal ID</th>
                        <th className="text-right py-1 px-1.5 font-medium text-muted-foreground">Omzet</th>
                        <th className="text-left py-1 px-1.5 font-medium text-muted-foreground">Einde</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedConsultantData.placements.map(p => (
                        <tr key={p.id} className="border-b border-border/30">
                          <td className="py-1 px-1.5 text-foreground">{p.candidateName}</td>
                          <td className="py-1 px-1.5 tabular-nums text-muted-foreground">{p.dealId}</td>
                          <td className="py-1 px-1.5 tabular-nums text-right font-medium">€{p.revenueAmount}</td>
                          <td className="py-1 px-1.5 text-teal">{format(p.endDate, "d MMM yy", { locale: nl })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Stoppers summary */}
                  <div className="pt-2 border-t border-border/30">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Stoppers per periode</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {Object.entries(stoppersByPeriod)
                        .filter(([_, items]) => items.some(i => i.consultantId === selectedConsultant))
                        .map(([period, items]) => {
                          const count = items.filter(i => i.consultantId === selectedConsultant).length;
                          return (
                            <span key={period} className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                              {period}: {count}
                            </span>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
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
                  {activePlacements.map(c => (
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
            </>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
}
