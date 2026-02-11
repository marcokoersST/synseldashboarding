import { useState, useMemo, useEffect } from "react";
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
  { label: "Toegewezen kandidaten", shortLabel: "Toeg.", count: 120 },
  { label: "Inschrijvingen", shortLabel: "Insch.", count: 65 },
  { label: "Acquisities", shortLabel: "Acq.", count: 51 },
  { label: "Uitnodiging", shortLabel: "Uitn.", count: 32 },
  { label: "Gesprekken", shortLabel: "Gespr.", count: 23 },
  { label: "Vervolg gesprekken", shortLabel: "Verv.g.", count: 11 },
  { label: "Plaatsingen", shortLabel: "Plts.", count: 5 },
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

const opacityMap = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4];

// --- Circle positions in U-shape within SVG viewBox (500 x 320) ---
// Top row L→R: steps 0,1,2
// Right side down: 2→3
// Bottom row R→L: 3,4,5
// Bottom-left: 6

const positions: { x: number; y: number }[] = [
  { x: 70, y: 65 },   // 0 - Toeg.
  { x: 250, y: 65 },  // 1 - Insch.
  { x: 430, y: 65 },  // 2 - Acq.
  { x: 430, y: 235 }, // 3 - Uitn.
  { x: 250, y: 235 }, // 4 - Gespr.
  { x: 250, y: 235 }, // 5 - Verv.g. (will offset)
  { x: 70, y: 235 },  // 6 - Plts.
];

// Better U-shape: top row 0-1-2, right curve 2-3, bottom row 3-4-5-6
const circlePositions = [
  { x: 70, y: 60 },   // 0 Toeg.
  { x: 250, y: 60 },  // 1 Insch.
  { x: 430, y: 60 },  // 2 Acq.
  { x: 430, y: 230 }, // 3 Uitn.
  { x: 310, y: 230 }, // 4 Gespr.
  { x: 190, y: 230 }, // 5 Verv.g.
  { x: 70, y: 230 },  // 6 Plts.
];

// Radius based on sqrt scale
const getRadius = (count: number, maxCount: number): number => {
  const minR = 18;
  const maxR = 32;
  return minR + (Math.sqrt(count) / Math.sqrt(maxCount)) * (maxR - minR);
};

// --- Sub-components ---

function StepCircle({
  cx, cy, radius, count, label, opacity, index, delay, isVisible,
  isComparing, compCount, isHovered, onHover,
}: {
  cx: number; cy: number; radius: number; count: number; label: string;
  opacity: number; index: number; delay: number; isVisible: boolean;
  isComparing: boolean; compCount?: number; isHovered: boolean;
  onHover: (i: number | null) => void;
}) {
  return (
    <g
      className="cursor-default"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      style={{
        transform: isVisible ? "scale(1)" : "scale(0)",
        transformOrigin: `${cx}px ${cy}px`,
        transition: `transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
      }}
    >
      {/* Glow on hover */}
      {isHovered && (
        <circle cx={cx} cy={cy} r={radius + 5} fill="none"
          stroke="hsl(175 60% 45% / 0.3)" strokeWidth={2}
        />
      )}
      {/* Main circle */}
      <circle cx={cx} cy={cy} r={radius}
        fill={`hsl(175 60% 45% / ${opacity})`}
        stroke="hsl(175 60% 45% / 0.3)" strokeWidth={1}
      />
      {/* Comparison ring */}
      {isComparing && compCount !== undefined && (
        <circle cx={cx} cy={cy} r={radius + 3}
          fill="none" stroke="hsl(45 30% 55%)" strokeWidth={2.5}
          strokeDasharray="4 2"
        />
      )}
      {/* Count text */}
      {isComparing && compCount !== undefined ? (
        <>
          <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="middle"
            className="fill-white font-semibold" style={{ fontSize: 11 }}>
            {count}
          </text>
          <text x={cx} y={cy + 9} textAnchor="middle" dominantBaseline="middle"
            className="font-medium" style={{ fontSize: 9, fill: "hsl(45 30% 70%)" }}>
            {compCount}
          </text>
        </>
      ) : (
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
          className="fill-white font-semibold" style={{ fontSize: 12 }}>
          {count}
        </text>
      )}
      {/* Label below */}
      <text x={cx} y={cy > 150 ? cy + radius + 16 : cy - radius - 8}
        textAnchor="middle" dominantBaseline="middle"
        className="fill-muted-foreground" style={{ fontSize: 9 }}>
        {label}
      </text>
    </g>
  );
}

function ConversionPath({
  x1, y1, x2, y2, percentage, index, delay, isVisible,
}: {
  x1: number; y1: number; x2: number; y2: number;
  percentage: number; index: number; delay: number; isVisible: boolean;
}) {
  // Determine if vertical or horizontal
  const isVertical = Math.abs(y2 - y1) > Math.abs(x2 - x1);
  
  // Build a curved path
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  let path: string;
  
  if (isVertical) {
    // Vertical curve (right side)
    const cpx = x1 + 30;
    path = `M ${x1} ${y1} Q ${cpx} ${my} ${x2} ${y2}`;
  } else {
    // Horizontal line with slight curve
    const cpy = Math.min(y1, y2) - 15;
    path = `M ${x1} ${y1} Q ${mx} ${cpy} ${x2} ${y2}`;
  }

  // Path length estimate
  const pathLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) * 1.2;

  return (
    <g>
      <path d={path} fill="none"
        stroke="hsl(220 15% 80%)" strokeWidth={1.5}
        strokeDasharray={pathLength}
        strokeDashoffset={isVisible ? 0 : pathLength}
        style={{
          transition: `stroke-dashoffset 0.8s ease-out ${delay}ms`,
        }}
      />
      {/* Conversion label */}
      <rect x={mx - 16} y={my - 8} width={32} height={16} rx={4}
        fill="hsl(var(--card))" stroke="hsl(220 15% 88%)" strokeWidth={0.5}
        style={{
          opacity: isVisible ? 1 : 0,
          transition: `opacity 0.3s ease-out ${delay + 400}ms`,
        }}
      />
      <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle"
        className="font-medium" style={{
          fontSize: 8.5,
          fill: "hsl(175 60% 40%)",
          opacity: isVisible ? 1 : 0,
          transition: `opacity 0.3s ease-out ${delay + 400}ms`,
        }}>
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
  const maxCount = Math.max(...currentData.map(d => d.count));

  // Conversion percentages between consecutive steps
  const conversions = useMemo(() =>
    currentData.slice(1).map((s, i) =>
      Math.round((s.count / currentData[i].count) * 100)
    ), []);

  return (
    <AnimatedCard delay={delay}>
      <div ref={ref} className="bg-card rounded-xl p-5 border border-border">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
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
        <svg viewBox="0 0 500 290" className="w-full" style={{ minHeight: 200 }}>
          {/* Conversion paths (draw between consecutive circles) */}
          {conversions.map((pct, i) => {
            const from = circlePositions[i];
            const to = circlePositions[i + 1];
            const r1 = getRadius(currentData[i].count, maxCount);
            const r2 = getRadius(currentData[i + 1].count, maxCount);
            // Offset start/end by radius in the direction of travel
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const nx = dx / dist;
            const ny = dy / dist;
            return (
              <ConversionPath
                key={i}
                x1={from.x + nx * r1}
                y1={from.y + ny * r1}
                x2={to.x - nx * r2}
                y2={to.y - ny * r2}
                percentage={pct}
                index={i}
                delay={delay + 200 + i * 150}
                isVisible={isVisible}
              />
            );
          })}

          {/* Step circles */}
          {currentData.map((step, i) => (
            <StepCircle
              key={i}
              cx={circlePositions[i].x}
              cy={circlePositions[i].y}
              radius={getRadius(step.count, maxCount)}
              count={step.count}
              label={step.shortLabel}
              opacity={opacityMap[i]}
              index={i}
              delay={delay + 100 + i * 120}
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
                <div className="w-3 h-3 rounded-sm bg-teal" />
                <span className="text-xs text-muted-foreground">Huidig</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-gold" />
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
