import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";
import { useNavigate } from "react-router-dom";

const LEGEND_GROUPS: Record<string, string[]> = {
  werkelijk: ["werkelijk"],
  geprojecteerd: ["geprojecteerd"],
  minimumNorm: ["minimumNorm"],
  fastLane: ["fastLane"],
  executiveLane: ["executiveLane"],
  bestPerformer: ["bestPerformer", "bestPerformerProj"],
};

const data = [
  { month: "mei", werkelijk: 28000, geprojecteerd: null, minimumNorm: 20000, fastLane: 34000, executiveLane: 40000, bestPerformer: 32000, bestPerformerProj: null },
  { month: "jun", werkelijk: 32000, geprojecteerd: null, minimumNorm: 20800, fastLane: 35600, executiveLane: 42000, bestPerformer: 35000, bestPerformerProj: null },
  { month: "jul", werkelijk: 29000, geprojecteerd: null, minimumNorm: 21600, fastLane: 37200, executiveLane: 44000, bestPerformer: 34000, bestPerformerProj: null },
  { month: "aug", werkelijk: 35000, geprojecteerd: null, minimumNorm: 22400, fastLane: 38800, executiveLane: 46000, bestPerformer: 38000, bestPerformerProj: null },
  { month: "sep", werkelijk: 31000, geprojecteerd: null, minimumNorm: 23200, fastLane: 40400, executiveLane: 48000, bestPerformer: 37000, bestPerformerProj: null },
  { month: "okt", werkelijk: 36000, geprojecteerd: null, minimumNorm: 24000, fastLane: 42000, executiveLane: 50000, bestPerformer: 40000, bestPerformerProj: null },
  { month: "nov", werkelijk: 33000, geprojecteerd: null, minimumNorm: 24800, fastLane: 43600, executiveLane: 52000, bestPerformer: 42000, bestPerformerProj: null },
  { month: "dec", werkelijk: 38000, geprojecteerd: null, minimumNorm: 25600, fastLane: 45200, executiveLane: 54000, bestPerformer: 44000, bestPerformerProj: null },
  { month: "jan", werkelijk: 36000, geprojecteerd: 36000, minimumNorm: 26400, fastLane: 46800, executiveLane: 56000, bestPerformer: 44000, bestPerformerProj: 46000 },
  { month: "feb", werkelijk: null, geprojecteerd: 40000, minimumNorm: 27200, fastLane: 48400, executiveLane: 58000, bestPerformer: null, bestPerformerProj: 49000 },
  { month: "mrt", werkelijk: null, geprojecteerd: 42000, minimumNorm: 27600, fastLane: 50000, executiveLane: 60000, bestPerformer: null, bestPerformerProj: 52000 },
  { month: "apr", werkelijk: null, geprojecteerd: 45000, minimumNorm: 28000, fastLane: 52000, executiveLane: 62000, bestPerformer: null, bestPerformerProj: 55000 },
];

const COLORS = {
  minimumNorm: "hsl(var(--muted-foreground))",
  fastLane: "#f59e0b",
  executiveLane: "#8b5cf6",
  bestPerformer: "#ec4899",
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  onNavigate: () => void;
}

function CustomTooltip({ active, payload, label, onNavigate }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const labelMap: Record<string, string> = {
    werkelijk: "Werkelijk",
    geprojecteerd: "Geprojecteerd",
    minimumNorm: "Minimum Norm",
    fastLane: "Fast Lane",
    executiveLane: "Executive Lane",
    bestPerformer: "Best Performer",
    bestPerformerProj: "Best Performer (proj.)",
  };

  const colorMap: Record<string, string> = {
    werkelijk: "hsl(var(--teal))",
    geprojecteerd: "hsl(var(--primary))",
    minimumNorm: COLORS.minimumNorm,
    fastLane: COLORS.fastLane,
    executiveLane: COLORS.executiveLane,
    bestPerformer: COLORS.bestPerformer,
    bestPerformerProj: COLORS.bestPerformer,
  };

  const hasBestPerformer = payload.some(
    (p: any) => (p.dataKey === "bestPerformer" || p.dataKey === "bestPerformerProj") && p.value != null
  );

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-medium text-foreground mb-2">{label}</p>
      {payload.map((entry: any, i: number) => {
        if (entry.value == null) return null;
        return (
          <div key={i} className="flex items-center justify-between gap-4 py-0.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorMap[entry.dataKey] || entry.color }} />
              <span className="text-muted-foreground">{labelMap[entry.dataKey] || entry.dataKey}</span>
            </div>
            <span className="font-medium text-foreground">€{entry.value?.toLocaleString()}</span>
          </div>
        );
      })}
      {hasBestPerformer && (
        <button
          onClick={onNavigate}
          className="mt-2 w-full text-left text-[11px] font-medium text-pink-500 hover:text-pink-400 transition-colors cursor-pointer"
        >
          Sophie de Vries — Hoe kom ik op deze plek? →
        </button>
      )}
    </div>
  );
}

interface RevenueChartProps {
  delay?: number;
}

export function RevenueChart({ delay = 0 }: RevenueChartProps) {
  const { ref, isVisible } = useAnimateOnMount({ delay: delay + 300 });
  const navigate = useNavigate();
  const [activeLine, setActiveLine] = useState<string | null>(null);

  const getLineOpacity = (dataKey: string): number => {
    if (!activeLine) return 1;
    return LEGEND_GROUPS[activeLine]?.includes(dataKey) ? 1 : 0.3;
  };

  const legendItems: { key: string; label: string; swatch: React.ReactNode }[] = [
    { key: "werkelijk", label: "Werkelijk", swatch: <div className="w-4 h-[2.5px] rounded-full" style={{ backgroundColor: 'hsl(var(--teal))' }} /> },
    { key: "geprojecteerd", label: "Geprojecteerd", swatch: <div className="w-4 h-[2.5px] rounded-full" style={{ background: 'repeating-linear-gradient(90deg, hsl(var(--primary)) 0 4px, transparent 4px 8px)' }} /> },
    { key: "minimumNorm", label: "Minimum Norm", swatch: <div className="w-4 h-[1.5px] rounded-full" style={{ background: `repeating-linear-gradient(90deg, ${COLORS.minimumNorm} 0 2px, transparent 2px 5px)` }} /> },
    { key: "fastLane", label: "Fast Lane", swatch: <div className="w-4 h-[1.5px] rounded-full" style={{ background: `repeating-linear-gradient(90deg, ${COLORS.fastLane} 0 2px, transparent 2px 5px)` }} /> },
    { key: "executiveLane", label: "Executive Lane", swatch: <div className="w-4 h-[1.5px] rounded-full" style={{ background: `repeating-linear-gradient(90deg, ${COLORS.executiveLane} 0 2px, transparent 2px 5px)` }} /> },
    { key: "bestPerformer", label: "Best Performer", swatch: <div className="w-4 h-[2px] rounded-full" style={{ backgroundColor: COLORS.bestPerformer }} /> },
  ];

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border" onClick={() => setActiveLine(null)}>
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">Omzet Overzicht</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Historisch vs. Geprojecteerd</p>
            </div>
          </div>

          {/* Legend - interactive */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {legendItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-1.5 cursor-pointer transition-opacity duration-300 ease-in-out"
                style={{ opacity: !activeLine || activeLine === item.key ? 1 : 0.5 }}
                onClick={(e) => { e.stopPropagation(); setActiveLine(activeLine === item.key ? null : item.key); }}
              >
                {item.swatch}
                <span className={`text-[11px] transition-all duration-300 ${activeLine === item.key ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div ref={ref} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `€${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip onNavigate={() => navigate("/vergelijking/1")} />} />

              {/* Minimum Norm - gray dotted thin */}
              <Line type="monotone" dataKey="minimumNorm" stroke={COLORS.minimumNorm} strokeWidth={1.5} strokeDasharray="3 4" dot={false} activeDot={false} strokeOpacity={getLineOpacity("minimumNorm")} style={{ transition: "stroke-opacity 300ms ease" }} />

              {/* Fast Lane - orange dotted thin */}
              <Line type="monotone" dataKey="fastLane" stroke={COLORS.fastLane} strokeWidth={1.5} strokeDasharray="3 4" dot={false} activeDot={false} strokeOpacity={getLineOpacity("fastLane")} style={{ transition: "stroke-opacity 300ms ease" }} />

              {/* Executive Lane - purple dotted thin */}
              <Line type="monotone" dataKey="executiveLane" stroke={COLORS.executiveLane} strokeWidth={1.5} strokeDasharray="3 4" dot={false} activeDot={false} strokeOpacity={getLineOpacity("executiveLane")} style={{ transition: "stroke-opacity 300ms ease" }} />

              {/* Best Performer actual - pink solid medium */}
              <Line
                type="monotone"
                dataKey="bestPerformer"
                stroke={COLORS.bestPerformer}
                strokeWidth={2}
                dot={{ fill: COLORS.bestPerformer, strokeWidth: 0, r: 3, fillOpacity: getLineOpacity("bestPerformer") }}
                activeDot={{ r: 5, cursor: "pointer" }}
                connectNulls={false}
                cursor="pointer"
                onClick={() => navigate("/vergelijking/1")}
                strokeOpacity={getLineOpacity("bestPerformer")}
                style={{ transition: "stroke-opacity 300ms ease" }}
              />

              {/* Best Performer projected - pink dashed medium */}
              <Line
                type="monotone"
                dataKey="bestPerformerProj"
                stroke={COLORS.bestPerformer}
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ fill: COLORS.bestPerformer, strokeWidth: 0, r: 3, fillOpacity: getLineOpacity("bestPerformerProj") }}
                activeDot={{ r: 5, cursor: "pointer" }}
                connectNulls={false}
                cursor="pointer"
                onClick={() => navigate("/vergelijking/1")}
                strokeOpacity={getLineOpacity("bestPerformerProj")}
                style={{ transition: "stroke-opacity 300ms ease" }}
              />

              {/* Werkelijk - teal solid thick */}
              <Line
                type="monotone"
                dataKey="werkelijk"
                stroke="hsl(var(--teal))"
                strokeWidth={2.5}
                dot={{ fill: 'hsl(var(--teal))', strokeWidth: 0, r: 4, fillOpacity: getLineOpacity("werkelijk") }}
                activeDot={{ r: 6, className: "animate-pulse-subtle" }}
                connectNulls={false}
                strokeDasharray={isVisible ? "0" : "2000"}
                strokeDashoffset={isVisible ? "0" : "2000"}
                strokeOpacity={getLineOpacity("werkelijk")}
                style={{ transition: "stroke-dasharray 2s ease-out, stroke-dashoffset 2s ease-out, stroke-opacity 300ms ease" }}
              />

              {/* Geprojecteerd - primary dashed thick */}
              <Line
                type="monotone"
                dataKey="geprojecteerd"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                strokeDasharray={isVisible ? "8 4" : "2000"}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4, fillOpacity: getLineOpacity("geprojecteerd") }}
                activeDot={{ r: 6, className: "animate-pulse-subtle" }}
                connectNulls={false}
                strokeOpacity={getLineOpacity("geprojecteerd")}
                style={{ transition: "stroke-dasharray 2s ease-out 0.5s, stroke-opacity 300ms ease" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AnimatedCard>
  );
}
