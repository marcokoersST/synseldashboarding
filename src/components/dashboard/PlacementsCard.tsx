import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";
import { useState, useCallback, useRef } from "react";
import { format, differenceInDays } from "date-fns";
import { nl } from "date-fns/locale";
import { List, BarChart3, TrendingUp, TrendingDown, Lock } from "lucide-react";
import { useMemo } from "react";

// Combined data for both views
const combinedData = [
  { period: "P1", historical: 2, projected: null, minimumNorm: 1, fastLane: 2, bestPerformer: 3, bestPerformerProj: null, afvallers: 0 },
  { period: "P2", historical: 1, projected: null, minimumNorm: 1, fastLane: 3, bestPerformer: 3, bestPerformerProj: null, afvallers: 1 },
  { period: "P3", historical: 3, projected: null, minimumNorm: 2, fastLane: 3, bestPerformer: 4, bestPerformerProj: null, afvallers: 0 },
  { period: "P4", historical: 2, projected: null, minimumNorm: 2, fastLane: 4, bestPerformer: 4, bestPerformerProj: null, afvallers: 1 },
  { period: "P5", historical: 4, projected: null, minimumNorm: 2, fastLane: 5, bestPerformer: 5, bestPerformerProj: null, afvallers: 1 },
  { period: "P6", historical: 5, projected: 5, minimumNorm: 3, fastLane: 5, bestPerformer: 6, bestPerformerProj: 6, afvallers: 2 },
  { period: "P7", historical: null, projected: 6, minimumNorm: 3, fastLane: 6, bestPerformer: null, bestPerformerProj: 7, afvallers: 1 },
  { period: "P8", historical: null, projected: 5, minimumNorm: 3, fastLane: 7, bestPerformer: null, bestPerformerProj: 7, afvallers: 3 },
  { period: "P9", historical: null, projected: 7, minimumNorm: 4, fastLane: 7, bestPerformer: null, bestPerformerProj: 8, afvallers: 1 },
  { period: "P10", historical: null, projected: 6, minimumNorm: 4, fastLane: 8, bestPerformer: null, bestPerformerProj: 8, afvallers: 2 },
  { period: "P11", historical: null, projected: 8, minimumNorm: 4, fastLane: 8, bestPerformer: null, bestPerformerProj: 9, afvallers: 1 },
  { period: "P12", historical: null, projected: 7, minimumNorm: 5, fastLane: 9, bestPerformer: null, bestPerformerProj: 9, afvallers: 2 },
  { period: "P13", historical: null, projected: 9, minimumNorm: 5, fastLane: 10, bestPerformer: null, bestPerformerProj: 10, afvallers: 1 },
];

const COLORS = {
  minimumNorm: "hsl(var(--muted-foreground))",
  fastLane: "#f59e0b",
  bestPerformer: "#ec4899",
  afvallers: "hsl(var(--destructive))",
};

const LEGEND_GROUPS: Record<string, string[]> = {
  werkelijk: ["historical"],
  prognose: ["projected"],
  minimumNorm: ["minimumNorm"],
  fastLane: ["fastLane"],
  bestPerformer: ["bestPerformer", "bestPerformerProj"],
};

const periodStats: Record<number, { totaal: number; actief: number; afvallers: number; afvallerType: 'gestopt' | 'komend' | 'verwacht' }> = {
  1: { totaal: 8, actief: 2, afvallers: 0, afvallerType: 'gestopt' },
  2: { totaal: 12, actief: 1, afvallers: 1, afvallerType: 'gestopt' },
  3: { totaal: 16, actief: 3, afvallers: 0, afvallerType: 'gestopt' },
  4: { totaal: 19, actief: 2, afvallers: 1, afvallerType: 'gestopt' },
  5: { totaal: 23, actief: 4, afvallers: 1, afvallerType: 'gestopt' },
  6: { totaal: 28, actief: 5, afvallers: 2, afvallerType: 'komend' },
  7: { totaal: 31, actief: 6, afvallers: 1, afvallerType: 'verwacht' },
  8: { totaal: 33, actief: 5, afvallers: 3, afvallerType: 'verwacht' },
  9: { totaal: 36, actief: 7, afvallers: 1, afvallerType: 'verwacht' },
  10: { totaal: 38, actief: 6, afvallers: 2, afvallerType: 'verwacht' },
  11: { totaal: 41, actief: 8, afvallers: 1, afvallerType: 'verwacht' },
  12: { totaal: 43, actief: 7, afvallers: 2, afvallerType: 'verwacht' },
  13: { totaal: 46, actief: 9, afvallers: 1, afvallerType: 'verwacht' },
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
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const index = startIndex + i;
    // Start dates: mid-2025 to early 2026
    const startMonth = 5 + Math.floor(Math.random() * 9); // May 2025 - Jan 2026
    const startYear = startMonth > 11 ? 2026 : 2025;
    const startDate = new Date(startYear, startMonth % 12, Math.floor(Math.random() * 28) + 1);
    // End dates: spread around current date for realistic mix
    // ~30% ending soon (within 30 days), ~50% active (1-8 months out), ~20% already ended
    const rand = Math.random();
    let endDate: Date;
    if (rand < 0.2) {
      // Already ended (past 1-4 weeks)
      endDate = new Date(now.getTime() - Math.floor(Math.random() * 28 + 1) * 86400000);
    } else if (rand < 0.5) {
      // Ending soon (within 30 days)
      endDate = new Date(now.getTime() + Math.floor(Math.random() * 30 + 1) * 86400000);
    } else {
      // Active, ending 1-8 months from now
      endDate = new Date(now.getFullYear(), now.getMonth() + 1 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 28) + 1);
    }
    const daysUntilEnd = differenceInDays(endDate, now);
    return {
      id: `candidate-${index}`,
      name: names[index % names.length],
      company: companies[index % companies.length],
      startDate,
      endDate,
      isActive: endDate > now,
      isEndingSoon: endDate > now && daysUntilEnd <= 30 && daysUntilEnd >= 0,
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
  const [hoveredPeriod, setHoveredPeriod] = useState<string | null>(null);
  const [lockedPeriod, setLockedPeriod] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(6);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chartClickedRef = useRef(false);

  const displayPeriod = lockedPeriod || hoveredPeriod || null;
  const stats = periodStats[selectedPeriod];

  const filteredData = useMemo(() => {
    return combinedData.map((d, i) => {
      const periodIndex = i;
      const splitIndex = selectedPeriod - 1;
      if (periodIndex < splitIndex) {
        const val = d.historical ?? d.projected;
        return { ...d, historical: val, projected: null, bestPerformer: d.bestPerformer ?? d.bestPerformerProj, bestPerformerProj: null };
      } else if (periodIndex === splitIndex) {
        const val = d.historical ?? d.projected;
        return { ...d, historical: val, projected: val, bestPerformer: d.bestPerformer ?? d.bestPerformerProj, bestPerformerProj: d.bestPerformerProj ?? d.bestPerformer };
      } else {
        const val = d.projected ?? d.historical;
        return { ...d, historical: null, projected: val, bestPerformer: null, bestPerformerProj: d.bestPerformerProj ?? d.bestPerformer };
      }
    });
  }, [selectedPeriod]);
  const activeData = displayPeriod ? filteredData.find(d => d.period === displayPeriod) : null;

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

  // Versus data - dynamic based on selected period
  const selectedDataPoint = filteredData[selectedPeriod - 1];
  const currentTotal = selectedDataPoint?.historical ?? selectedDataPoint?.projected ?? 0;

  const versusItems = [
    { label: "Minimum Norm", yours: currentTotal, theirs: selectedDataPoint?.minimumNorm ?? 0, color: COLORS.minimumNorm },
    { label: "Fast Lane", yours: currentTotal, theirs: selectedDataPoint?.fastLane ?? 0, color: COLORS.fastLane },
    { label: "Best Performer", yours: currentTotal, theirs: selectedDataPoint?.bestPerformer ?? selectedDataPoint?.bestPerformerProj ?? 0, color: COLORS.bestPerformer },
  ];

  const endingSoonCandidates = candidates.filter(c => c.isEndingSoon);
  const activeCandidates = candidates.filter(c => c.isActive && !c.isEndingSoon);

  const legendItems = [
    { key: "werkelijk", label: "Werkelijk", swatch: <div className="w-3.5 h-[2.5px] rounded-full" style={{ backgroundColor: 'hsl(var(--teal))' }} /> },
    { key: "prognose", label: "Prognose", swatch: <div className="w-3.5 h-[2.5px] rounded-full" style={{ background: 'repeating-linear-gradient(90deg, hsl(var(--teal)) 0 3px, transparent 3px 6px)' }} /> },
    { key: "minimumNorm", label: "Min. Norm", swatch: <div className="w-3.5 h-[1.5px] rounded-full" style={{ background: `repeating-linear-gradient(90deg, ${COLORS.minimumNorm} 0 2px, transparent 2px 5px)` }} /> },
    { key: "fastLane", label: "Fast Lane", swatch: <div className="w-3.5 h-[1.5px] rounded-full" style={{ background: `repeating-linear-gradient(90deg, ${COLORS.fastLane} 0 2px, transparent 2px 5px)` }} /> },
    { key: "bestPerformer", label: "Best Perf.", swatch: <div className="w-3.5 h-[2px] rounded-full" style={{ backgroundColor: COLORS.bestPerformer }} /> },
  ];

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border group flex flex-col">
        <div className="mb-4">
          {/* Row 1: Title | Percentage + Toggle */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Plaatsingen & Gedetacheerden</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                <span>0.0%</span>
              </div>
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
          {/* Row 2: Subtitle | Period Selector */}
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">
              {selectedPeriod === 6 ? "Huidige actieve plaatsingen" : `Periode ${selectedPeriod} - historisch overzicht`}
            </p>
            <select
              value={selectedPeriod}
              onChange={(e) => { setSelectedPeriod(Number(e.target.value)); setLockedPeriod(null); }}
              className="bg-muted/50 rounded-lg text-xs font-medium text-foreground px-2 py-1.5 border-0 outline-none cursor-pointer appearance-none pr-5 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M0%200l5%206%205-6z%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_6px_center]"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(p => (
                <option key={p} value={p} className="bg-card text-foreground">
                  P{p}{p === 6 ? ' (huidig)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-end gap-6 mb-4">
          <div>
            <AnimatedNumber value={stats.totaal} delay={delay + 300} className="text-3xl font-bold text-foreground" />
            <p className="text-xs text-muted-foreground mt-0.5">Totaal</p>
          </div>
          <div>
            <AnimatedNumber value={stats.actief} delay={delay + 400} className="text-xl font-semibold text-teal" />
            <p className="text-xs text-muted-foreground mt-0.5">Actief</p>
          </div>
          <div>
            <AnimatedNumber value={stats.afvallers} delay={delay + 500} className="text-xl font-semibold text-destructive" />
            <p className="text-xs text-muted-foreground mt-0.5">Komende afvallers</p>
          </div>
        </div>

        {/* Period-specific afvallers indicator */}
        <div className="flex items-center gap-1.5 mb-4 px-1">
          <span className="text-xs font-semibold text-destructive">{stats.afvallers}</span>
          <span className="text-xs text-muted-foreground">
            {stats.afvallerType === 'gestopt' ? `gestopt in P${selectedPeriod}` : 
             stats.afvallerType === 'komend' ? `komende afvallers P${selectedPeriod}` : 
             `verwacht in P${selectedPeriod}`}
          </span>
        </div>

        {!detailMode ? (
          <div className="flex flex-col min-h-0">
            {/* Mini Chart */}
            <div ref={ref} className="h-16 mb-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
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
            <div className="border-t border-border pt-3">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Actieve gedetacheerden</h4>
              <div className="max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" onScroll={handleScroll} ref={scrollRef}>
                <div className="space-y-2">
                  {activeCandidates.map((candidate) => (
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

                  {/* Komende afvallers sectie */}
                  {endingSoonCandidates.length > 0 && (
                    <>
                      <div className="border-t border-border my-2" />
                      <h4 className="text-xs font-medium text-destructive mb-2">Komende afvallers</h4>
                      {endingSoonCandidates.map((candidate) => (
                        <div key={candidate.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-destructive/5 hover:bg-destructive/10 transition-colors">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{candidate.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{candidate.company}</p>
                          </div>
                          <div className="text-right ml-3 shrink-0">
                            <p className="text-xs text-muted-foreground">{format(candidate.startDate, "d MMM yyyy", { locale: nl })}</p>
                            <p className="text-xs text-destructive font-medium">t/m {format(candidate.endDate, "d MMM yyyy", { locale: nl })}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

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
          </div>
        ) : (
          <div onClick={() => { if (chartClickedRef.current) { chartClickedRef.current = false; return; } setActiveLine(null); setLockedPeriod(null); }}>
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
            <div ref={ref} className="h-40 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={filteredData}
                  margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                  onMouseMove={(e: any) => {
                    if (e?.activeLabel) setHoveredPeriod(e.activeLabel);
                  }}
                  onMouseLeave={() => setHoveredPeriod(null)}
                  onClick={(e: any) => {
                    if (e?.activeLabel) {
                      chartClickedRef.current = true;
                      setLockedPeriod(prev => prev === e.activeLabel ? null : e.activeLabel);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Line type="monotone" dataKey="minimumNorm" stroke={COLORS.minimumNorm} strokeWidth={1.5} strokeDasharray={activeLine === "minimumNorm" ? "0" : "3 4"} dot={false} activeDot={false} strokeOpacity={getLineOpacity("minimumNorm")} style={{ transition: "stroke-opacity 300ms ease" }} />
                  <Line type="monotone" dataKey="fastLane" stroke={COLORS.fastLane} strokeWidth={1.5} strokeDasharray={activeLine === "fastLane" ? "0" : "3 4"} dot={false} activeDot={false} strokeOpacity={getLineOpacity("fastLane")} style={{ transition: "stroke-opacity 300ms ease" }} />
                  <Line type="monotone" dataKey="bestPerformer" stroke={COLORS.bestPerformer} strokeWidth={2} dot={{ fill: COLORS.bestPerformer, strokeWidth: 0, r: 2.5, fillOpacity: getLineOpacity("bestPerformer") }} connectNulls={false} strokeOpacity={getLineOpacity("bestPerformer")} style={{ transition: "stroke-opacity 300ms ease" }} />
                  <Line type="monotone" dataKey="bestPerformerProj" stroke={COLORS.bestPerformer} strokeWidth={2} strokeDasharray={activeLine === "bestPerformer" ? "0" : "6 4"} dot={{ fill: COLORS.bestPerformer, strokeWidth: 0, r: 2.5, fillOpacity: getLineOpacity("bestPerformerProj") }} connectNulls={false} strokeOpacity={getLineOpacity("bestPerformerProj")} style={{ transition: "stroke-opacity 300ms ease" }} />
                  
                  <Line type="monotone" dataKey="historical" stroke="hsl(var(--teal))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--teal))', strokeWidth: 0, r: 3, fillOpacity: getLineOpacity("historical") }} connectNulls={false} strokeOpacity={getLineOpacity("historical")} style={{ transition: "stroke-opacity 300ms ease" }} />
                  <Line type="monotone" dataKey="projected" stroke="hsl(var(--teal))" strokeWidth={2.5} strokeDasharray={activeLine === "prognose" ? "0" : "6 4"} dot={{ fill: 'hsl(var(--teal))', strokeWidth: 0, r: 3, fillOpacity: getLineOpacity("projected") }} connectNulls={false} strokeOpacity={getLineOpacity("projected")} style={{ transition: "stroke-opacity 300ms ease" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Dynamic Info Area */}
            <div className="border-t border-border pt-3 space-y-2 min-h-[148px]">
              {activeData ? (
                <>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    {activeData.period}
                    {lockedPeriod && <Lock size={10} className="text-muted-foreground" />}
                  </h4>
                  {[
                    { label: activeData.historical != null ? "Werkelijk" : "Prognose", value: activeData.historical ?? activeData.projected, color: "hsl(var(--teal))" },
                    { label: "Min. Norm", value: activeData.minimumNorm, color: COLORS.minimumNorm },
                    { label: "Fast Lane", value: activeData.fastLane, color: COLORS.fastLane },
                    { label: "Best Performer", value: activeData.bestPerformer ?? activeData.bestPerformerProj, color: COLORS.bestPerformer },
                  ].filter(item => item.value != null).map((item) => {
                    const yours = activeData.historical ?? activeData.projected ?? 0;
                    const delta = item.label === "Werkelijk" || item.label === "Prognose" ? null : yours - (item.value ?? 0);
                    return (
                      <div key={item.label} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-muted-foreground">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground">{item.value}</span>
                          {delta != null && (
                            <div className={`flex items-center gap-0.5 text-xs font-medium ${delta >= 0 ? 'text-teal' : 'text-destructive'}`}>
                              {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              <span>{delta >= 0 ? '+' : ''}{delta}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1.5">Jouw positie (P{selectedPeriod})</h4>
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
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}
