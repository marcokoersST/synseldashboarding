import { useState, useMemo } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Data ---

interface StepData {
  label: string;
  shortLabel: string;
  count: number;
}

const currentData: StepData[] = [
  { label: "Toegewezen kandidaten", shortLabel: "Toegewezen", count: 120 },
  { label: "Inschrijvingen", shortLabel: "Inschrijvingen", count: 65 },
  { label: "Acquisities", shortLabel: "Acquisities", count: 51 },
  { label: "Uitnodiging", shortLabel: "Uitnodiging", count: 32 },
  { label: "Gesprekken", shortLabel: "Gesprekken", count: 23 },
  { label: "Vervolg gesprekken", shortLabel: "Vervolg", count: 11 },
  { label: "Plaatsingen", shortLabel: "Plaatsingen", count: 5 },
];

const makeCompData = (counts: number[]): StepData[] =>
  currentData.map((s, i) => ({ ...s, count: counts[i] }));

const comparisonDataByPeriod: Record<string, StepData[]> = {
  P1: makeCompData([100, 55, 42, 27, 19, 9, 3]),
  P2: makeCompData([115, 62, 48, 30, 21, 10, 4]),
  P3: makeCompData([95, 50, 38, 24, 17, 8, 3]),
  P4: makeCompData([130, 70, 55, 35, 25, 12, 6]),
  P5: makeCompData([110, 58, 45, 28, 20, 9, 4]),
  P6: makeCompData([125, 67, 52, 33, 24, 11, 5]),
  P7: makeCompData([105, 56, 43, 26, 18, 8, 3]),
  P8: makeCompData([118, 64, 50, 31, 22, 10, 5]),
  P9: makeCompData([128, 68, 53, 34, 24, 12, 6]),
  P10: makeCompData([98, 52, 40, 25, 18, 8, 3]),
  P11: makeCompData([122, 66, 51, 32, 23, 11, 5]),
  P12: makeCompData([108, 58, 44, 28, 20, 9, 4]),
  P13: makeCompData([135, 73, 57, 36, 26, 13, 7]),
};

// Light-to-dark teal gradient
const stepColors = [
  "hsl(175, 50%, 75%)",
  "hsl(175, 50%, 67%)",
  "hsl(175, 55%, 59%)",
  "hsl(175, 55%, 51%)",
  "hsl(175, 60%, 43%)",
  "hsl(175, 60%, 35%)",
  "hsl(175, 65%, 27%)",
];

// Text colors: dark for light circles, white for dark
const stepTextColors = [
  "hsl(220, 15%, 20%)",
  "hsl(220, 15%, 20%)",
  "hsl(220, 15%, 20%)",
  "hsl(220, 15%, 25%)",
  "white",
  "white",
  "white",
];

const stepCountColors = [
  "hsl(220, 15%, 20%)",
  "hsl(220, 15%, 20%)",
  "hsl(220, 15%, 20%)",
  "white",
  "white",
  "white",
  "white",
];

// Arc layout: vertical semicircle opening to the right
// Arc center on the left side, angles from π/2 (top) to -π/2 (bottom)
const ARC_CENTER_X = 60;
const ARC_CENTER_Y = 400;
const ARC_RADIUS = 260;
const CIRCLE_R = 40;

const circlePositions = Array.from({ length: 7 }, (_, i) => {
  const angle = Math.PI / 2 - (i / 6) * Math.PI; // π/2 to -π/2
  return {
    x: ARC_CENTER_X + ARC_RADIUS * Math.cos(angle),
    y: ARC_CENTER_Y - ARC_RADIUS * Math.sin(angle),
  };
});

// --- Sub-components ---

function StepNode({
  cx, cy, count, label, color, textColor, countColor, index, delay, isVisible,
  isComparing, compCount, isHovered, onHover,
}: {
  cx: number; cy: number; count: number; label: string; color: string;
  textColor: string; countColor: string;
  index: number; delay: number; isVisible: boolean;
  isComparing: boolean; compCount?: number; isHovered: boolean;
  onHover: (i: number | null) => void;
}) {
  const isTop = index === 0;
  const isBottom = index === 6;
  const labelX = isTop || isBottom ? cx : cx + CIRCLE_R + 28;
  const labelY = isTop ? cy - CIRCLE_R - 14 : isBottom ? cy + CIRCLE_R + 18 : cy;
  const labelAnchor = isTop || isBottom ? "middle" : "start";

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      style={{
        transform: isVisible ? "scale(1)" : "scale(0)",
        transformOrigin: `${cx}px ${cy}px`,
        transition: `transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
      }}
    >
      {/* Main filled circle */}
      <circle cx={cx} cy={cy} r={CIRCLE_R}
        fill={color}
        style={{ filter: isHovered ? "drop-shadow(0 2px 8px rgba(0,0,0,0.15))" : "none", transition: "filter 0.2s" }}
      />

      {/* Step number */}
      <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="middle"
        fill={textColor} fontSize="13" fontWeight="700" fontFamily="Inter, sans-serif"
        opacity={0.6}>
        0{index + 1}
      </text>

      {/* Count */}
      {isComparing && compCount !== undefined ? (
        <>
          <text x={cx} y={cy + 6} textAnchor="middle" dominantBaseline="middle"
            fill={countColor} fontWeight="700" fontSize="18" fontFamily="Inter, sans-serif">
            {count}
          </text>
          <text x={cx} y={cy + 21} textAnchor="middle" dominantBaseline="middle"
            fill="hsl(45, 50%, 45%)" fontWeight="600" fontSize="14" fontFamily="Inter, sans-serif">
            {compCount}
          </text>
        </>
      ) : (
        <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle"
          fill={countColor} fontWeight="700" fontSize="22" fontFamily="Inter, sans-serif">
          {count}
        </text>
      )}

      {/* Comparison dashed ring */}
      {isComparing && compCount !== undefined && (
        <circle cx={cx} cy={cy} r={CIRCLE_R + 5}
          fill="none" stroke="hsl(45, 40%, 55%)" strokeWidth={1.5}
          strokeDasharray="4 3" opacity={0.6}
        />
      )}

      {/* Label to the right */}
      <text x={labelX} y={labelY}
        textAnchor={labelAnchor} dominantBaseline="middle"
        fill="hsl(220, 10%, 40%)" fontSize="13" fontWeight="600" fontFamily="Inter, sans-serif">
        {label}
      </text>
    </g>
  );
}

function ConnectorLine({
  x1, y1, x2, y2, percentage, delay, isVisible,
}: {
  x1: number; y1: number; x2: number; y2: number;
  percentage: number; delay: number; isVisible: boolean;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / dist;
  const ny = dy / dist;

  // Start from edge of circle 1, end at edge of circle 2
  const sx = x1 + nx * (CIRCLE_R + 4);
  const sy = y1 + ny * (CIRCLE_R + 4);
  const ex = x2 - nx * (CIRCLE_R + 4);
  const ey = y2 - ny * (CIRCLE_R + 4);

  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;
  // Perpendicular offset for label
  const perpX = -ny * 30;
  const perpY = nx * 30;

  const pathLen = Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2);

  return (
    <g>
      <line x1={sx} y1={sy} x2={ex} y2={ey}
        stroke="hsl(220, 10%, 82%)" strokeWidth={1.5}
        strokeDasharray={pathLen}
        strokeDashoffset={isVisible ? 0 : pathLen}
        style={{ transition: `stroke-dashoffset 0.8s ease-out ${delay}ms` }}
      />
      {/* Arrow dot */}
      <circle cx={ex - nx * 2} cy={ey - ny * 2} r={2.5}
        fill="hsl(220, 10%, 70%)"
        style={{ opacity: isVisible ? 1 : 0, transition: `opacity 0.3s ${delay + 400}ms` }}
      />
      {/* Percentage */}
      <text x={mx + perpX} y={my + perpY} textAnchor="middle" dominantBaseline="middle"
        fill="hsl(220, 10%, 50%)" fontSize="12" fontWeight="500" fontFamily="Inter, sans-serif"
        style={{ opacity: isVisible ? 1 : 0, transition: `opacity 0.3s ${delay + 500}ms` }}>
        {percentage}%
      </text>
    </g>
  );
}

// --- Main Component ---

interface RecruitmentFunnelProps {
  delay?: number;
}

export function RecruitmentFunnel({ delay = 0 }: RecruitmentFunnelProps) {
  const [isComparing, setIsComparing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("P1");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { ref, isVisible } = useAnimateOnMount({ delay });

  const comparisonData = comparisonDataByPeriod[selectedPeriod];

  const conversions = useMemo(() =>
    currentData.slice(1).map((s, i) =>
      Math.round((s.count / currentData[i].count) * 100)
    ), []);

  return (
    <AnimatedCard delay={delay}>
      <div ref={ref} className="bg-card rounded-xl p-5 border border-border min-h-[800px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-sm font-medium text-foreground">Wervingstrechter</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Conversie per fase</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "transition-all duration-300 ease-out overflow-hidden",
              isComparing ? "opacity-100 max-w-32" : "opacity-0 max-w-0"
            )}>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="h-7 text-xs w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 13 }, (_, i) => `P${i + 1}`).map((period) => (
                    <SelectItem key={period} value={period} className="text-xs">
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs"
              onClick={() => setIsComparing(!isComparing)}>
              {isComparing ? "Sluiten" : "Vergelijken"}
            </Button>
          </div>
        </div>

        {/* SVG Pipeline */}
        <svg viewBox="0 0 560 780" className="w-full" preserveAspectRatio="xMidYMid meet">
          {/* Connector lines between consecutive circles */}
          {conversions.map((pct, i) => (
            <ConnectorLine
              key={i}
              x1={circlePositions[i].x}
              y1={circlePositions[i].y}
              x2={circlePositions[i + 1].x}
              y2={circlePositions[i + 1].y}
              percentage={pct}
              delay={delay + 200 + i * 100}
              isVisible={isVisible}
            />
          ))}

          {/* Step circles */}
          {currentData.map((step, i) => (
            <StepNode
              key={i}
              cx={circlePositions[i].x}
              cy={circlePositions[i].y}
              count={step.count}
              label={step.shortLabel}
              color={stepColors[i]}
              textColor={stepTextColors[i]}
              countColor={stepCountColors[i]}
              index={i}
              delay={delay + 100 + i * 80}
              isVisible={isVisible}
              isComparing={isComparing}
              compCount={isComparing ? comparisonData[i].count : undefined}
              isHovered={hoveredIndex === i}
              onHover={setHoveredIndex}
            />
          ))}
        </svg>

        {/* Legend / Hover Info */}
        <div className={cn(
          "border-t border-border transition-all duration-300",
          isComparing ? "opacity-100 mt-3 pt-3 min-h-[28px]" : "opacity-0 h-0 mt-0 pt-0 border-0 overflow-hidden"
        )}>
          {hoveredIndex === null ? (
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal" />
                <span className="text-xs text-muted-foreground">Huidig</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gold" />
                <span className="text-xs text-muted-foreground">{selectedPeriod}</span>
              </div>
            </div>
          ) : (
            (() => {
              const s = currentData[hoveredIndex];
              const c = comparisonData[hoveredIndex];
              const prev = hoveredIndex > 0 ? currentData[hoveredIndex - 1] : null;
              const prevC = hoveredIndex > 0 ? comparisonData[hoveredIndex - 1] : null;
              const conv = prev ? Math.round((s.count / prev.count) * 100) : null;
              const convC = prevC ? Math.round((c.count / prevC.count) * 100) : null;
              return (
                <div className="flex items-center justify-between text-xs gap-3">
                  <span className="font-medium text-foreground shrink-0">{s.label}</span>
                  <div className="flex items-center gap-3 flex-wrap justify-end">
                    <span className="whitespace-nowrap">
                      <span className="text-muted-foreground">Huidig: </span>
                      <span className="font-medium text-teal">{s.count}</span>
                    </span>
                    <span className="whitespace-nowrap">
                      <span className="text-muted-foreground">{selectedPeriod}: </span>
                      <span className="font-medium text-gold">{c.count}</span>
                    </span>
                    {conv !== null && convC !== null && (
                      <span className="whitespace-nowrap">
                        <span className="text-muted-foreground">Conversie: </span>
                        <span className="text-teal">{conv}%</span>
                        <span className="text-muted-foreground"> / </span>
                        <span className="text-gold">{convC}%</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </AnimatedCard>
  );
}
