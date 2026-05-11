import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceLine } from "recharts";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";
import { revenueChartDataV2, revenueLanes } from "@/data/managerPerformanceDataV2";
import { consultantRevenueData, consultantColors } from "@/data/managerPerformanceData";
import { myTeamConsultants } from "@/data/managerData";
import { consultantRevenueDetailData } from "@/data/managerRevenueDetailData";
import { Slider } from "@/components/ui/slider";

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

// ─── Overview: 3-line chart with lanes + historical ───

function RevenueOverviewV2({ delay }: { delay: number }) {
  const { ref, isVisible } = useAnimateOnMount({ delay: delay + 300 });
  const [yMax, setYMax] = useState(500);
  const [visibleLines, setVisibleLines] = useState({
    realised: true, target: true, prognose: true, historicalAvg: true,
    norm: true, fastLane: false, executive: false,
  });

  const toggleLine = (key: keyof typeof visibleLines) => {
    setVisibleLines(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const chartData = revenueChartDataV2.map(d => ({
    ...d,
    realised: d.realised > 0 ? d.realised : undefined,
  }));

  const warningDots = revenueChartDataV2.filter(d => d.belowTarget && d.prognose > 0);

  const legendItems = [
    { key: "realised" as const, label: "Gerealiseerd", color: "hsl(var(--teal))", style: "solid" },
    { key: "target" as const, label: "Target", color: "hsl(var(--muted-foreground))", style: "dashed" },
    { key: "prognose" as const, label: "Prognose", color: "hsl(var(--primary))", style: "dashed" },
    { key: "historicalAvg" as const, label: "Historisch gem.", color: "hsl(220, 15%, 70%)", style: "dotted" },
    { key: "norm" as const, label: "Norm", color: "hsl(var(--muted-foreground))", style: "lane" },
    { key: "fastLane" as const, label: "Fast Lane", color: "hsl(210, 70%, 55%)", style: "lane" },
    { key: "executive" as const, label: "Executive", color: "hsl(45, 80%, 50%)", style: "lane" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3">
        {legendItems.map(item => (
          <button key={item.key}
            className="flex items-center gap-1.5 transition-opacity duration-300"
            style={{ opacity: visibleLines[item.key] ? 1 : 0.3 }}
            onClick={() => toggleLine(item.key)}
          >
            <div className="w-4 h-[2.5px] rounded-full" style={{
              backgroundColor: item.color,
              ...(item.style === "dashed" ? {
                background: `repeating-linear-gradient(90deg, ${item.color} 0 4px, transparent 4px 8px)`
              } : item.style === "dotted" ? {
                background: `repeating-linear-gradient(90deg, ${item.color} 0 2px, transparent 2px 5px)`
              } : item.style === "lane" ? {
                background: `repeating-linear-gradient(90deg, ${item.color} 0 6px, transparent 6px 10px)`
              } : {})
            }} />
            <span className={cn("text-[10px]", visibleLines[item.key] ? "text-foreground font-medium" : "text-muted-foreground")}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Y-axis zoom */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] text-muted-foreground">Y-as max:</span>
        <Slider value={[yMax]} onValueChange={v => setYMax(v[0])} min={200} max={800} step={50} className="w-32" />
        <span className="text-[10px] font-medium text-foreground tabular-nums">€{yMax}k</span>
      </div>

      <div ref={ref} className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}k`} domain={[0, yMax]} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
              formatter={(value: number, name: string) => [
                `€${value}k`,
                name === "realised" ? "Gerealiseerd" : name === "target" ? "Target" : name === "prognose" ? "Prognose" : "Historisch gem."
              ]}
            />
            {visibleLines.norm && <ReferenceLine y={revenueLanes.norm} stroke="hsl(var(--muted-foreground))" strokeDasharray="6 4" strokeWidth={1} label={{ value: "Norm", position: "right", fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />}
            {visibleLines.fastLane && <ReferenceLine y={revenueLanes.fastLane} stroke="hsl(210, 70%, 55%)" strokeDasharray="6 4" strokeWidth={1} label={{ value: "Fast", position: "right", fontSize: 9, fill: "hsl(210, 70%, 55%)" }} />}
            {visibleLines.executive && <ReferenceLine y={revenueLanes.executive} stroke="hsl(45, 80%, 50%)" strokeDasharray="6 4" strokeWidth={1} label={{ value: "Exec", position: "right", fontSize: 9, fill: "hsl(45, 80%, 50%)" }} />}
            {visibleLines.historicalAvg && <Line type="monotone" dataKey="historicalAvg" stroke="hsl(220, 15%, 70%)" strokeWidth={1.5} strokeDasharray="2 4" dot={false} />}
            {visibleLines.target && <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="3 4" dot={false} />}
            {visibleLines.prognose && <Line type="monotone" dataKey="prognose" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="8 4" dot={false} connectNulls />}
            {visibleLines.realised && (
              <Line type="monotone" dataKey="realised" stroke="hsl(var(--teal))" strokeWidth={2.5}
                dot={{ fill: "hsl(var(--teal))", strokeWidth: 0, r: 3 }}
                connectNulls={false}
                strokeDasharray={isVisible ? "0" : "2000"} strokeDashoffset={isVisible ? "0" : "2000"}
                style={{ transition: "stroke-dasharray 2s ease-out, stroke-dashoffset 2s ease-out" }}
              />
            )}
            {visibleLines.prognose && warningDots.map(d => (
              <ReferenceDot key={d.period} x={d.period} y={d.prognose} r={5}
                fill="hsl(var(--destructive))" stroke="hsl(var(--card))" strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {warningDots.length > 0 && visibleLines.prognose && (
        <div className="flex items-center gap-2 mt-2 px-1">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive shrink-0" />
          <span className="text-[10px] text-destructive font-medium">
            Prognose daalt onder target vanaf {warningDots[0].period}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Detail: per consultant with click-through ───

function RevenueDetailV2({ delay, selectedUnit }: { delay: number; selectedUnit?: string }) {
  const { ref } = useAnimateOnMount({ delay: delay + 300 });
  const [activeLine, setActiveLine] = useState<string | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<number | null>(null);

  const consultants = (!selectedUnit || selectedUnit === "all")
    ? myTeamConsultants
    : myTeamConsultants.filter(c => c.unit === selectedUnit);

  const detailData = consultantRevenueDetailData.find(d => d.consultantId === selectedConsultant);

  const mainEl = (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4">
        {consultants.map((c, i) => (
          <button key={c.id}
            className="flex items-center gap-1.5 transition-opacity duration-300"
            style={{ opacity: !activeLine || activeLine === c.name ? 1 : 0.4 }}
            onClick={() => { setActiveLine(activeLine === c.name ? null : c.name); setSelectedConsultant(c.id); }}
          >
            <div className="w-3.5 h-[2.5px] rounded-full" style={{ backgroundColor: consultantColors[i % consultantColors.length] }} />
            <span className={cn("text-[11px]", activeLine === c.name ? "text-foreground font-medium" : "text-muted-foreground")}>
              {c.name}
            </span>
          </button>
        ))}
      </div>
      <div ref={ref} className="h-64" onClick={() => { setActiveLine(null); setSelectedConsultant(null); }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={consultantRevenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}k`} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
              formatter={(value: number, name: string) => [`€${value}k`, name]} />
            <ReferenceLine y={revenueLanes.norm} stroke="hsl(var(--muted-foreground))" strokeDasharray="6 4" strokeWidth={1} strokeOpacity={0.4} />
            {consultants.map((c, i) => (
              <Line key={c.id} type="monotone" dataKey={c.name} stroke={consultantColors[i % consultantColors.length]}
                strokeWidth={activeLine === c.name ? 3 : 2}
                dot={activeLine === c.name ? { fill: consultantColors[i % consultantColors.length], strokeWidth: 0, r: 3 } : false}
                strokeOpacity={!activeLine || activeLine === c.name ? 1 : 0.2}
                style={{ transition: "stroke-opacity 300ms ease, stroke-width 300ms ease" }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const detailEl = detailData && (
    <div className="space-y-3" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between sticky top-0 bg-background pb-2 border-b border-border">
        <h4 className="text-xs font-semibold text-foreground">Detail: {detailData.consultantName}</h4>
        <button onClick={() => { setSelectedConsultant(null); setActiveLine(null); }} className="text-[10px] text-muted-foreground hover:text-foreground">Sluiten ✕</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-card border border-border/30 p-2.5 text-center">
          <p className="text-lg font-bold text-foreground">€{detailData.totalRevenue}k</p>
          <p className="text-[10px] text-muted-foreground">Totale omzet</p>
        </div>
        <div className="rounded-lg bg-card border border-border/30 p-2.5 text-center">
          <p className="text-lg font-bold text-foreground">€{detailData.avgCostPerCandidate}k</p>
          <p className="text-[10px] text-muted-foreground">Gem. per kandidaat</p>
        </div>
        <div className="rounded-lg bg-card border border-border/30 p-2.5 text-center">
          <p className="text-lg font-bold text-foreground">{detailData.detacheringCount} / {detailData.rsCount}</p>
          <p className="text-[10px] text-muted-foreground">Detavast / W&S</p>
        </div>
        <div className="rounded-lg bg-card border border-border/30 p-2.5 text-center">
          <p className={cn("text-lg font-bold", detailData.performanceRatio >= 80 ? "text-success" : detailData.performanceRatio >= 60 ? "text-foreground" : "text-destructive")}>
            {detailData.performanceRatio}%
          </p>
          <p className="text-[10px] text-muted-foreground">Performance ratio</p>
        </div>
      </div>
      <div className="overflow-auto max-h-[280px] rounded border border-border/30">
        <table className="w-full text-[11px]">
          <thead className="bg-card sticky top-0">
            <tr className="border-b border-border">
              <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Kandidaat</th>
              <th className="text-center py-1.5 px-2 font-medium text-muted-foreground">Type</th>
              <th className="text-right py-1.5 px-2 font-medium text-muted-foreground">€/mnd</th>
              <th className="text-center py-1.5 px-2 font-medium text-muted-foreground">Looptijd</th>
            </tr>
          </thead>
          <tbody>
            {detailData.secondments.map((s, i) => (
              <tr key={i} className="border-b border-border/20 hover:bg-muted/20">
                <td className="py-1.5 px-2 font-medium text-foreground">{s.candidateName}<div className="text-[10px] text-muted-foreground">{s.company}</div></td>
                <td className="py-1.5 px-2 text-center">
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                    s.type === "Detavast" ? "bg-primary/10 text-primary" : s.type === "W&S" ? "bg-teal/10 text-teal" : "bg-amber-500/10 text-amber-600"
                  )}>{s.type}</span>
                </td>
                <td className="py-1.5 px-2 text-right tabular-nums font-semibold">€{s.monthlyRevenue}k</td>
                <td className="py-1.5 px-2 text-center tabular-nums">{s.contractedHours > 0 ? `${s.contractedHours}h` : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1 min-w-0">{mainEl}</div>
      {detailEl && (
        <aside className="w-full lg:w-[400px] shrink-0 lg:border-l lg:border-border lg:pl-4 max-h-[calc(100vh-220px)] overflow-y-auto">
          {detailEl}
        </aside>
      )}
    </div>
  );
}

// ─── Main ───

interface RevenueChartV2Props {
  delay?: number;
  selectedUnit?: string;
  framed?: boolean;
}

export function RevenueChartV2({ delay = 0, selectedUnit, framed = true }: RevenueChartV2Props) {
  const { isTransitioning, displayMode, toggle } = useDetailToggle();

  const body = (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          {framed && <h3 className="text-sm font-medium text-foreground">Omzet Overzicht</h3>}
          <p className="text-xs text-muted-foreground mt-0.5">
            {displayMode ? "Per consultant" : "Gerealiseerd, target, prognose & referentielijnen"}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={toggle}
          className="h-7 w-7 rounded-full bg-secondary hover:bg-secondary/80">
          {displayMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <div className={cn(
        "transition-all duration-400 ease-in-out",
        isTransitioning ? "opacity-0 scale-[0.97] translate-y-2" : "opacity-100 scale-100 translate-y-0"
      )}>
        {displayMode ? <RevenueDetailV2 delay={delay} selectedUnit={selectedUnit} /> : <RevenueOverviewV2 delay={delay} />}
      </div>
    </>
  );

  if (!framed) return <div>{body}</div>;
  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border">{body}</div>
    </AnimatedCard>
  );
}
