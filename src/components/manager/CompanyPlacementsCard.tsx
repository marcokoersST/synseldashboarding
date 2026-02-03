import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";
import { useState, useCallback, useRef } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Building2 } from "lucide-react";
import { companyStats, companyPlacements, companyPlacementsChartData } from "@/data/managerData";
import { allConsultants } from "@/data/managerData";

interface CompanyPlacementsCardProps {
  delay?: number;
}

export function CompanyPlacementsCard({ delay = 0 }: CompanyPlacementsCardProps) {
  const { ref, isVisible } = useAnimateOnMount({ delay: delay + 400 });
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const activePlacements = companyPlacements.filter(p => p.isActive);
  const displayedPlacements = activePlacements.slice(0, visibleCount);
  const hasMore = visibleCount < activePlacements.length;
  
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 10);
      setIsLoading(false);
    }, 300);
  }, [isLoading, hasMore]);
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    if (scrollBottom < 50 && hasMore && !isLoading) {
      loadMore();
    }
  }, [loadMore, hasMore, isLoading]);

  const getConsultantName = (consultantId: number) => {
    const consultant = allConsultants.find(c => c.id === consultantId);
    return consultant?.name || "Onbekend";
  };
  
  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border group flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <div>
              <h3 className="text-sm font-medium text-foreground">Bedrijf Plaatsingen</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Alle teams gecombineerd</p>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-end gap-6 mb-4">
          <div>
            <AnimatedNumber 
              value={companyStats.totalPlacements} 
              delay={delay + 300}
              className="text-3xl font-bold text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-0.5">Totaal</p>
          </div>
          <div>
            <AnimatedNumber 
              value={companyStats.activePlacements} 
              delay={delay + 400}
              className="text-xl font-semibold text-teal"
            />
            <p className="text-xs text-muted-foreground mt-0.5">Actief</p>
          </div>
        </div>
        
        {/* Mini Chart with projection */}
        <div ref={ref} className="h-16 mb-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={companyPlacementsChartData}>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number, name: string) => [
                  value,
                  name === 'historical' ? 'Werkelijk' : 'Projectie'
                ]}
              />
              {/* Historical line (solid) */}
              <Line 
                type="monotone" 
                dataKey="historical" 
                stroke="hsl(var(--teal))" 
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                strokeDasharray={isVisible ? "0" : "1000"}
                strokeDashoffset={isVisible ? "0" : "1000"}
                style={{
                  transition: "stroke-dasharray 1.5s ease-out, stroke-dashoffset 1.5s ease-out"
                }}
              />
              {/* Projected line (dashed) */}
              <Line 
                type="monotone" 
                dataKey="projected" 
                stroke="hsl(var(--teal))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                connectNulls={false}
                opacity={isVisible ? 0.7 : 0}
                style={{
                  transition: "opacity 1.5s ease-out 0.5s"
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Period labels */}
        <div className="flex justify-between text-[10px] text-muted-foreground mb-4">
          <span>P1</span>
          <span>P13</span>
        </div>
        
        {/* Placements list with infinite scroll */}
        <div className="flex-1 min-h-0 border-t border-border pt-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Actieve gedetacheerden</h4>
          <div 
            className="h-[180px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
            onScroll={handleScroll}
            ref={scrollRef}
          >
            <div className="space-y-2">
              {displayedPlacements.map((placement) => (
                <div 
                  key={placement.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{placement.candidateName}</p>
                    <p className="text-xs text-muted-foreground truncate">{placement.company}</p>
                    <p className="text-[10px] text-muted-foreground/70 truncate">
                      via {getConsultantName(placement.consultantId)}
                    </p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {format(placement.startDate, "d MMM yyyy", { locale: nl })}
                    </p>
                    <p className="text-xs text-teal font-medium">
                      t/m {format(placement.endDate, "d MMM yyyy", { locale: nl })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center justify-center py-3">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!hasMore && displayedPlacements.length > 0 && (
                <p className="text-center text-xs text-muted-foreground py-2">
                  Alle plaatsingen geladen
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
