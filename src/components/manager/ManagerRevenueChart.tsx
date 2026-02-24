import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";
import {
  managerRevenueChartData,
  consultantRevenueData,
  consultantColors,
} from "@/data/managerPerformanceData";
import { myTeamConsultants } from "@/data/managerData";

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

const LEGEND_GROUPS: Record<string, string[]> = {
  realised: ["realised"],
  potential: ["potential"],
  target: ["target"],
};

// ─── Overview ───

function RevenueOverview({ delay }: { delay: number }) {
  const { ref, isVisible } = useAnimateOnMount({ delay: delay + 300 });
  const [activeLine, setActiveLine] = useState<string | null>(null);

  const getOpacity = (key: string) => {
    if (!activeLine) return 1;
    return LEGEND_GROUPS[activeLine]?.includes(key) ? 1 : 0.3;
  };

  const legendItems = [
    { key: "realised", label: "Gerealiseerd", swatch: <div className="w-4 h-[2.5px] rounded-full" style={{ backgroundColor: "hsl(var(--teal))" }} /> },
    { key: "potential", label: "Potentieel", swatch: <div className="w-4 h-[2.5px] rounded-full" style={{ background: "repeating-linear-gradient(90deg, hsl(var(--primary)) 0 4px, transparent 4px 8px)" }} /> },
    { key: "target", label: "Target", swatch: <div className="w-4 h-[1.5px] rounded-full" style={{ background: "repeating-linear-gradient(90deg, hsl(var(--muted-foreground)) 0 2px, transparent 2px 5px)" }} /> },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4">
        {legendItems.map(item => (
          <div key={item.key}
            className="flex items-center gap-1.5 cursor-pointer transition-opacity duration-300"
            style={{ opacity: !activeLine || activeLine === item.key ? 1 : 0.5 }}
            onClick={(e) => { e.stopPropagation(); setActiveLine(activeLine === item.key ? null : item.key); }}
          >
            {item.swatch}
            <span className={cn("text-[11px] transition-all duration-300", activeLine === item.key ? "text-foreground font-medium" : "text-muted-foreground")}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <div ref={ref} className="h-64" onClick={() => setActiveLine(null)}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={managerRevenueChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}k`} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
              formatter={(value: number, name: string) => [`€${value}k`, name === "realised" ? "Gerealiseerd" : name === "potential" ? "Potentieel" : "Target"]} />
            <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="3 4" dot={false}
              strokeOpacity={getOpacity("target")} style={{ transition: "stroke-opacity 300ms ease" }} />
            <Line type="monotone" dataKey="potential" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="8 4" dot={false}
              strokeOpacity={getOpacity("potential")} style={{ transition: "stroke-opacity 300ms ease" }} />
            <Line type="monotone" dataKey="realised" stroke="hsl(var(--teal))" strokeWidth={2.5}
              dot={{ fill: "hsl(var(--teal))", strokeWidth: 0, r: 3 }}
              strokeDasharray={isVisible ? "0" : "2000"} strokeDashoffset={isVisible ? "0" : "2000"}
              strokeOpacity={getOpacity("realised")}
              style={{ transition: "stroke-dasharray 2s ease-out, stroke-dashoffset 2s ease-out, stroke-opacity 300ms ease" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Detail: per consultant lines + enhanced table ───

function RevenueDetail({ delay }: { delay: number }) {
  const { ref, isVisible } = useAnimateOnMount({ delay: delay + 300 });
  const [activeLine, setActiveLine] = useState<string | null>(null);
  const [hoveredPeriod, setHoveredPeriod] = useState<string | null>(null);

  const consultants = myTeamConsultants;
  const periods = Array.from({ length: 13 }, (_, i) => `P${i + 1}`);

  const getOpacity = (name: string) => {
    if (!activeLine) return 1;
    return activeLine === name ? 1 : 0.2;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4">
        {consultants.map((c, i) => (
          <div key={c.id}
            className="flex items-center gap-1.5 cursor-pointer transition-opacity duration-300"
            style={{ opacity: !activeLine || activeLine === c.name ? 1 : 0.4 }}
            onClick={(e) => { e.stopPropagation(); setActiveLine(activeLine === c.name ? null : c.name); }}
          >
            <div className="w-3.5 h-[2.5px] rounded-full" style={{ backgroundColor: consultantColors[i % consultantColors.length] }} />
            <span className={cn("text-[11px] transition-all duration-300", activeLine === c.name ? "text-foreground font-medium" : "text-muted-foreground")}>
              {c.name}
            </span>
          </div>
        ))}
      </div>
      <div ref={ref} className="h-64" onClick={() => setActiveLine(null)}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={consultantRevenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}k`} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
              formatter={(value: number, name: string) => [`€${value}k`, name]} />
            {consultants.map((c, i) => (
              <Line key={c.id} type="monotone" dataKey={c.name} stroke={consultantColors[i % consultantColors.length]}
                strokeWidth={activeLine === c.name ? 3 : 2}
                dot={activeLine === c.name ? { fill: consultantColors[i % consultantColors.length], strokeWidth: 0, r: 3 } : false}
                strokeOpacity={getOpacity(c.name)}
                style={{ transition: "stroke-opacity 300ms ease, stroke-width 300ms ease" }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced table with periods */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-1.5 px-2 font-medium text-muted-foreground sticky left-0 bg-card z-10">Consultant</th>
              {periods.map(p => (
                <th
                  key={p}
                  className={cn(
                    "text-center py-1.5 px-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-all whitespace-nowrap",
                    hoveredPeriod && hoveredPeriod !== p && "opacity-30"
                  )}
                  onMouseEnter={() => setHoveredPeriod(p)}
                  onMouseLeave={() => setHoveredPeriod(null)}
                >
                  {p}
                </th>
              ))}
              <th className={cn(
                "text-right py-1.5 px-2 font-medium text-foreground whitespace-nowrap",
                hoveredPeriod && "opacity-30"
              )}>Cumulatief</th>
            </tr>
          </thead>
          <tbody>
            {consultants.map((c, ci) => {
              let cumulative = 0;
              return (
                <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="py-1.5 px-2 font-medium text-foreground sticky left-0 bg-card z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: consultantColors[ci % consultantColors.length] }} />
                      {c.name}
                    </div>
                  </td>
                  {periods.map(p => {
                    const dataPoint = consultantRevenueData.find(d => d.period === p);
                    const val = dataPoint ? (dataPoint[c.name] as number) : 0;
                    cumulative += val;
                    return (
                      <td
                        key={p}
                        className={cn(
                          "text-center py-1.5 px-2 tabular-nums transition-all",
                          hoveredPeriod === p ? "font-semibold text-foreground bg-primary/5" : "",
                          hoveredPeriod && hoveredPeriod !== p && "opacity-30"
                        )}
                        onMouseEnter={() => setHoveredPeriod(p)}
                        onMouseLeave={() => setHoveredPeriod(null)}
                      >
                        €{val}k
                      </td>
                    );
                  })}
                  <td className={cn(
                    "text-right py-1.5 px-2 tabular-nums font-semibold text-foreground",
                    hoveredPeriod && "opacity-30"
                  )}>
                    €{cumulative}k
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main ───

interface ManagerRevenueChartProps {
  delay?: number;
}

export function ManagerRevenueChart({ delay = 0 }: ManagerRevenueChartProps) {
  const { isTransitioning, displayMode, toggle } = useDetailToggle();

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Omzet Overzicht</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {displayMode ? "Per consultant met perioden" : "Gerealiseerd, potentieel & target"}
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
          {displayMode ? <RevenueDetail delay={delay} /> : <RevenueOverview delay={delay} />}
        </div>
      </div>
    </AnimatedCard>
  );
}
