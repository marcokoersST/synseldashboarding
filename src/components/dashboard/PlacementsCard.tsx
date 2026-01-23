import { LineChart, Line, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useCallback, useRef, useEffect } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

// Historical data (P1-P6)
const historicalData = [
  { period: "P1", value: 2, type: "historical" },
  { period: "P2", value: 1, type: "historical" },
  { period: "P3", value: 3, type: "historical" },
  { period: "P4", value: 2, type: "historical" },
  { period: "P5", value: 4, type: "historical" },
  { period: "P6", value: 5, type: "historical" },
];

// Projected data (P6-P13) - starts from last historical point
const projectedData = [
  { period: "P6", value: 5, type: "projected" },
  { period: "P7", value: 6, type: "projected" },
  { period: "P8", value: 5, type: "projected" },
  { period: "P9", value: 7, type: "projected" },
  { period: "P10", value: 6, type: "projected" },
  { period: "P11", value: 8, type: "projected" },
  { period: "P12", value: 7, type: "projected" },
  { period: "P13", value: 9, type: "projected" },
];

// Combined data for chart
const combinedData = [
  { period: "P1", historical: 2, projected: null },
  { period: "P2", historical: 1, projected: null },
  { period: "P3", historical: 3, projected: null },
  { period: "P4", historical: 2, projected: null },
  { period: "P5", historical: 4, projected: null },
  { period: "P6", historical: 5, projected: 5 },
  { period: "P7", historical: null, projected: 6 },
  { period: "P8", historical: null, projected: 5 },
  { period: "P9", historical: null, projected: 7 },
  { period: "P10", historical: null, projected: 6 },
  { period: "P11", historical: null, projected: 8 },
  { period: "P12", historical: null, projected: 7 },
  { period: "P13", historical: null, projected: 9 },
];

// Mock candidates data
const generateCandidates = (startIndex: number, count: number) => {
  const names = [
    "Jan de Vries", "Maria van den Berg", "Pieter Jansen", "Anna Bakker",
    "Thomas Visser", "Sophie de Jong", "Lars Mulder", "Emma Bos",
    "Daan Smit", "Lisa van Dijk", "Ruben Meijer", "Eva de Graaf",
    "Luuk Peters", "Julia Hendriks", "Tim van Leeuwen", "Sara Dekker",
    "Bram Vermeer", "Nina van den Broek", "Jesse Kok", "Femke de Boer",
    "Stijn Willems", "Fleur Claassen", "Rick van der Linden", "Noor Jacobs"
  ];
  
  const companies = [
    "TechCorp BV", "Digital Solutions", "FinanceHub", "MarketPro",
    "DataDriven NL", "CloudFirst", "InnovateTech", "SmartBiz"
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const index = startIndex + i;
    const startDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const endDate = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    
    return {
      id: `candidate-${index}`,
      name: names[index % names.length],
      company: companies[index % companies.length],
      startDate,
      endDate,
      isActive: endDate > new Date(),
    };
  });
};

interface PlacementsCardProps {
  delay?: number;
}

export function PlacementsCard({ delay = 0 }: PlacementsCardProps) {
  const { ref, isVisible } = useAnimateOnMount({ delay: delay + 400 });
  const [candidates, setCandidates] = useState(() => generateCandidates(0, 10));
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const loadMoreCandidates = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newCandidates = generateCandidates(candidates.length, 10);
      setCandidates(prev => [...prev, ...newCandidates]);
      setIsLoading(false);
      // Stop after 50 candidates for demo
      if (candidates.length >= 40) {
        setHasMore(false);
      }
    }, 500);
  }, [candidates.length, isLoading, hasMore]);
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    
    if (scrollBottom < 50 && hasMore && !isLoading) {
      loadMoreCandidates();
    }
  }, [loadMoreCandidates, hasMore, isLoading]);
  
  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border group flex flex-col h-full">
        <div className="glass-header flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">Plaatsingen & Gedetacheerden</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Huidige actieve plaatsingen</p>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
            <span>0.0%</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-end gap-6 mb-4">
          <div>
            <AnimatedNumber 
              value={28} 
              delay={delay + 300}
              className="text-3xl font-bold text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-0.5">Totaal</p>
          </div>
          <div>
            <AnimatedNumber 
              value={5} 
              delay={delay + 400}
              className="text-xl font-semibold text-teal"
            />
            <p className="text-xs text-muted-foreground mt-0.5">Actief</p>
          </div>
        </div>
        
        {/* Mini Chart with projection */}
        <div ref={ref} className="h-16 mb-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData}>
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
        
        {/* Candidates list with infinite scroll */}
        <div className="flex-1 min-h-0 border-t border-border pt-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Actieve gedetacheerden</h4>
          <div 
            className="h-[180px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
            onScroll={handleScroll}
            ref={scrollRef}
          >
            <div className="space-y-2">
              {candidates.map((candidate) => (
                <div 
                  key={candidate.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{candidate.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{candidate.company}</p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {format(candidate.startDate, "d MMM yyyy", { locale: nl })}
                    </p>
                    <p className="text-xs text-teal font-medium">
                      t/m {format(candidate.endDate, "d MMM yyyy", { locale: nl })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center justify-center py-3">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!hasMore && candidates.length > 0 && (
                <p className="text-center text-xs text-muted-foreground py-2">
                  Alle kandidaten geladen
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
