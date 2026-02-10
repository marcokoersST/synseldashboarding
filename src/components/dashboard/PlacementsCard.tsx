import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";
import { useState, useCallback, useRef } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { List, BarChart3, TrendingUp, TrendingDown } from "lucide-react";

// Combined data for both views
const combinedData = [
  { period: "P1", historical: 2, projected: null, minimumNorm: 1, fastLane: 2, bestPerformer: 3, bestPerformerProj: null },
  { period: "P2", historical: 1, projected: null, minimumNorm: 1, fastLane: 3, bestPerformer: 3, bestPerformerProj: null },
  { period: "P3", historical: 3, projected: null, minimumNorm: 2, fastLane: 3, bestPerformer: 4, bestPerformerProj: null },
  { period: "P4", historical: 2, projected: null, minimumNorm: 2, fastLane: 4, bestPerformer: 4, bestPerformerProj: null },
  { period: "P5", historical: 4, projected: null, minimumNorm: 2, fastLane: 5, bestPerformer: 5, bestPerformerProj: null },
  { period: "P6", historical: 5, projected: 5, minimumNorm: 3, fastLane: 5, bestPerformer: 6, bestPerformerProj: 6 },
  { period: "P7", historical: null, projected: 6, minimumNorm: 3, fastLane: 6, bestPerformer: null, bestPerformerProj: 7 },
  { period: "P8", historical: null, projected: 5, minimumNorm: 3, fastLane: 7, bestPerformer: null, bestPerformerProj: 7 },
  { period: "P9", historical: null, projected: 7, minimumNorm: 4, fastLane: 7, bestPerformer: null, bestPerformerProj: 8 },
  { period: "P10", historical: null, projected: 6, minimumNorm: 4, fastLane: 8, bestPerformer: null, bestPerformerProj: 8 },
  { period: "P11", historical: null, projected: 8, minimumNorm: 4, fastLane: 8, bestPerformer: null, bestPerformerProj: 9 },
  { period: "P12", historical: null, projected: 7, minimumNorm: 5, fastLane: 9, bestPerformer: null, bestPerformerProj: 9 },
  { period: "P13", historical: null, projected: 9, minimumNorm: 5, fastLane: 10, bestPerformer: null, bestPerformerProj: 10 },
];

const COLORS = {
  minimumNorm: "hsl(var(--muted-foreground))",
  fastLane: "#f59e0b",
  bestPerformer: "#ec4899",
};

const LEGEND_GROUPS: Record<string, string[]> = {
  werkelijk: ["historical"],
  prognose: ["projected"],
  minimumNorm: ["minimumNorm"],
  fastLane: ["fastLane"],
  bestPerformer: ["bestPerformer", "bestPerformerProj"],
};

// Mock candidates
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
  const [detailMode, setDetailMode] = useState(false);
  const [activeLine, setActiveLine] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadMoreCandidates = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setTimeout(() => {
      const newCandidates = generateCandidates(candidates.length, 10);
      setCandidates(prev => [...prev, ...newCandidates]);
      setIsLoading(false);
      if (candidates.length >= 40) setHasMore(false);
    }, 500);
  }, [candidates.length, isLoading, hasMore]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    if (scrollBottom < 50 && hasMore && !isLoading) loadMoreCandidates();
  }, [loadMoreCandidates, hasMore, isLoading]);

  const getLineOpacity = (dataKey: string): number => {
    if (!activeLine) return 1;
    return LEGEND_GROUPS[activeLine]?.includes(dataKey) ? 1 : 0.3;
  };

  // Versus data
  const currentTotal = 5; // P6 actual
  const normP6 = 3;
  const fastLaneP6 = 5;
  const bestP6 = 6;

  const versusItems = [
    { label: "Minimum Norm", yours: currentTotal, theirs: normP6, color: COLORS.minimumNorm },
    { label: "Fast Lane", yours: currentTotal, theirs: fastLaneP6, color: COLORS.fastLane },
    { label: "Best Performer", yours: currentTotal, theirs: bestP6, color: COLORS.bestPerformer },
  ];

  const legendItems = [
    { key: "werkelijk", label: "Werkelijk", swatch: <div className="w-3.5 h-[2.5px] rounded-full" style={{ backgroundColor: 'hsl(var(--teal))' }} /> },
    { key: "prognose", label: "Prognose", swatch: <div className="w-3.5 h-[2.5px] rounded-full" style={{ background: 'repeating-linear-gradient(90deg, hsl(var(--teal)) 0 3px, transparent 3px 6px)' }} /> },
    { key: "minimumNorm", label: "Min. Norm", swatch: <div className="w-3.5 h-[1.5px] rounded-full" style={{ background: `repeating-linear-gradient(90deg, ${COLORS.minimumNorm} 0 2px, transparent 2px 5px)` }} /> },
    { key: "fastLane", label: "Fast Lane", swatch: <div className="w-3.5 h-[1.5px] rounded-full" style={{ background: `repeating-linear-gradient(90deg, ${COLORS.fastLane} 0 2px, transparent 2px 5px)` }} /> },
    { key: "bestPerformer", label: "Best Perf.", swatch: <div className="w-3.5 h-[2px] rounded-full" style={{ backgroundColor: COLORS.bestPerformer }} /> },
  ];

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border group flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Plaatsingen & Gedetacheerden</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Huidige actieve plaatsingen</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
              <span>0.0%</span>
            </div>
            {/* Toggle */}
            <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
              <button
                onClick={() => setDetailMode(d => !d)}
                className={`p-1.5 rounded-md transition-all duration-200 ${!detailMode ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setDetailMode(d => !d)}
                className={`p-1.5 rounded-md transition-all duration-200 ${detailMode ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <BarChart3 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-end gap-6 mb-4">
          <div>
            <AnimatedNumber value={28} delay={delay + 300} className="text-3xl font-bold text-foreground" />
            <p className="text-xs text-muted-foreground mt-0.5">Totaal</p>
          </div>
          <div>
            <AnimatedNumber value={5} delay={delay + 400} className="text-xl font-semibold text-teal" />
            <p className="text-xs text-muted-foreground mt-0.5">Actief</p>
          </div>
        </div>

        {!detailMode ? (
          <>
            {/* Mini Chart */}
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
                  <Line type="monotone" dataKey="historical" stroke="hsl(var(--teal))" strokeWidth={2} dot={false} connectNulls={false}
                    strokeDasharray={isVisible ? "0" : "1000"} strokeDashoffset={isVisible ? "0" : "1000"}
                    style={{ transition: "stroke-dasharray 1.5s ease-out, stroke-dashoffset 1.5s ease-out" }}
                  />
                  <Line type="monotone" dataKey="projected" stroke="hsl(var(--teal))" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls={false}
                    opacity={isVisible ? 0.7 : 0} style={{ transition: "opacity 1.5s ease-out 0.5s" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-4">
              <span>P1</span><span>P13</span>
            </div>

            {/* Candidates list */}
            <div className="flex-1 min-h-0 border-t border-border pt-3">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Actieve gedetacheerden</h4>
              <div className="h-[180px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" onScroll={handleScroll} ref={scrollRef}>
                <div className="space-y-2">
                  {candidates.map((candidate) => (
                    <div key={candidate.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{candidate.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{candidate.company}</p>
                      </div>
                      <div className="text-right ml-3 shrink-0">
                        <p className="text-xs text-muted-foreground">{format(candidate.startDate, "d MMM yyyy", { locale: nl })}</p>
                        <p className="text-xs text-teal font-medium">t/m {format(candidate.endDate, "d MMM yyyy", { locale: nl })}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center justify-center py-3">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {!hasMore && candidates.length > 0 && (
                    <p className="text-center text-xs text-muted-foreground py-2">Alle kandidaten geladen</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div onClick={() => setActiveLine(null)}>
            {/* Interactive Legend */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3">
              {legendItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-1 cursor-pointer transition-opacity duration-300"
                  style={{ opacity: !activeLine || activeLine === item.key ? 1 : 0.5 }}
                  onClick={(e) => { e.stopPropagation(); setActiveLine(activeLine === item.key ? null : item.key); }}
                >
                  {item.swatch}
                  <span className={`text-[10px] transition-all duration-300 ${activeLine === item.key ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Detail Chart */}
            <div ref={ref} className="h-48 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(value: number, name: string) => {
                      const labels: Record<string, string> = { historical: 'Werkelijk', projected: 'Prognose', minimumNorm: 'Min. Norm', fastLane: 'Fast Lane', bestPerformer: 'Best Performer', bestPerformerProj: 'Best Perf. (proj.)' };
                      return [value, labels[name] || name];
                    }}
                  />
                  <Line type="monotone" dataKey="minimumNorm" stroke={COLORS.minimumNorm} strokeWidth={1.5} strokeDasharray="3 4" dot={false} activeDot={false} strokeOpacity={getLineOpacity("minimumNorm")} style={{ transition: "stroke-opacity 300ms ease" }} />
                  <Line type="monotone" dataKey="fastLane" stroke={COLORS.fastLane} strokeWidth={1.5} strokeDasharray="3 4" dot={false} activeDot={false} strokeOpacity={getLineOpacity("fastLane")} style={{ transition: "stroke-opacity 300ms ease" }} />
                  <Line type="monotone" dataKey="bestPerformer" stroke={COLORS.bestPerformer} strokeWidth={2} dot={{ fill: COLORS.bestPerformer, strokeWidth: 0, r: 2.5, fillOpacity: getLineOpacity("bestPerformer") }} connectNulls={false} strokeOpacity={getLineOpacity("bestPerformer")} style={{ transition: "stroke-opacity 300ms ease" }} />
                  <Line type="monotone" dataKey="bestPerformerProj" stroke={COLORS.bestPerformer} strokeWidth={2} strokeDasharray="6 4" dot={{ fill: COLORS.bestPerformer, strokeWidth: 0, r: 2.5, fillOpacity: getLineOpacity("bestPerformerProj") }} connectNulls={false} strokeOpacity={getLineOpacity("bestPerformerProj")} style={{ transition: "stroke-opacity 300ms ease" }} />
                  <Line type="monotone" dataKey="historical" stroke="hsl(var(--teal))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--teal))', strokeWidth: 0, r: 3, fillOpacity: getLineOpacity("historical") }} connectNulls={false} strokeOpacity={getLineOpacity("historical")} style={{ transition: "stroke-opacity 300ms ease" }} />
                  <Line type="monotone" dataKey="projected" stroke="hsl(var(--teal))" strokeWidth={2.5} strokeDasharray="6 4" dot={{ fill: 'hsl(var(--teal))', strokeWidth: 0, r: 3, fillOpacity: getLineOpacity("projected") }} connectNulls={false} strokeOpacity={getLineOpacity("projected")} style={{ transition: "stroke-opacity 300ms ease" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Versus Stats */}
            <div className="border-t border-border pt-3 space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground mb-1.5">Jouw positie (P6)</h4>
              {versusItems.map((item) => {
                const delta = item.yours - item.theirs;
                const isPositive = delta >= 0;
                return (
                  <div key={item.label} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{item.theirs}</span>
                      <div className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-teal' : 'text-destructive'}`}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        <span>{isPositive ? '+' : ''}{delta}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}
