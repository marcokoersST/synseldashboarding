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

const opacityMap = [1, 0.88, 0.76, 0.65, 0.55, 0.45, 0.35];

// U-shape positions in a 600x380 viewBox
// Top row L→R: 0,1,2 | Right curve: 2→3 | Bottom row R→L: 3,4,5,6
const circlePositions = [
  { x: 80, y: 80 },    // 0 Toegewezen
  { x: 300, y: 80 },   // 1 Inschrijvingen
  { x: 520, y: 80 },   // 2 Acquisities
  { x: 520, y: 290 },  // 3 Uitnodiging
  { x: 373, y: 290 },  // 4 Gesprekken
  { x: 227, y: 290 },  // 5 Vervolg
  { x: 80, y: 290 },   // 6 Plaatsingen
];

// Radius based on sqrt scale
const getRadius = (count: number, maxCount: number): number => {
  const minR = 26;
  const maxR = 42;
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
  const gradId = `grad-${index}`;
  const glowId = `glow-${index}`;
  const labelY = cy > 150 ? cy + radius + 22 : cy - radius - 14;

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      style={{
        transform: isVisible ? "scale(1)" : "scale(0)",
        transformOrigin: `${cx}px ${cy}px`,
        transition: `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
      }}
    >
      <defs>
        <radialGradient id={gradId} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={`hsl(175 70% 55% / ${opacity})`} />
          <stop offset="100%" stopColor={`hsl(175 55% 35% / ${opacity})`} />
        </radialGradient>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Hover glow ring */}
      {isHovered && (
        <circle cx={cx} cy={cy} r={radius + 7} fill="none"
          stroke="hsl(175 60% 50% / 0.4)" strokeWidth={2.5}
          filter={`url(#${glowId})`}
        />
      )}

      {/* Main circle with gradient */}
      <circle cx={cx} cy={cy} r={radius}
        fill={`url(#${gradId})`}
        stroke="hsl(175 50% 60% / 0.25)" strokeWidth={1.5}
      />

      {/* Inner highlight for 3D feel */}
      <circle cx={cx - radius * 0.15} cy={cy - radius * 0.15} r={radius * 0.55}
        fill="hsl(175 80% 80% / 0.08)"
      />

      {/* Comparison dashed ring */}
      {isComparing && compCount !== undefined && (
        <circle cx={cx} cy={cy} r={radius + 5}
          fill="none" stroke="hsl(45 30% 55%)" strokeWidth={2.5}
          strokeDasharray="5 3" opacity={0.8}
        />
      )}

      {/* Count text */}
      {isComparing && compCount !== undefined ? (
        <>
          <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="middle"
            fill="white" fontWeight="700" fontSize="16" fontFamily="Inter, sans-serif">
            {count}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle"
            fill="hsl(45 40% 75%)" fontWeight="600" fontSize="12" fontFamily="Inter, sans-serif">
            {compCount}
          </text>
        </>
      ) : (
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
          fill="white" fontWeight="700" fontSize="18" fontFamily="Inter, sans-serif"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
          {count}
        </text>
      )}

      {/* Label */}
      <text x={cx} y={labelY}
        textAnchor="middle" dominantBaseline="middle"
        fill="hsl(220 10% 50%)" fontSize="11" fontWeight="500" fontFamily="Inter, sans-serif">
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
  const isVertical = Math.abs(y2 - y1) > Math.abs(x2 - x1);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  let path: string;

  if (isVertical) {
    const cpx = x1 + 40;
    path = `M ${x1} ${y1} Q ${cpx} ${my} ${x2} ${y2}`;
  } else {
    const cpy = y1 < 150 ? Math.min(y1, y2) - 20 : Math.max(y1, y2) + 20;
    path = `M ${x1} ${y1} Q ${mx} ${cpy} ${x2} ${y2}`;
  }

  const pathLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) * 1.3;

  return (
    <g>
      {/* Subtle background line */}
      <path d={path} fill="none"
        stroke="hsl(220 15% 90%)" strokeWidth={2} opacity={0.5}
      />
      {/* Animated foreground line */}
      <path d={path} fill="none"
        stroke="hsl(175 40% 65%)" strokeWidth={2}
        strokeDasharray={pathLength}
        strokeDashoffset={isVisible ? 0 : pathLength}
        strokeLinecap="round"
        style={{ transition: `stroke-dashoffset 1s ease-out ${delay}ms` }}
      />
      {/* Conversion badge */}
      <rect x={mx - 20} y={my - 10} width={40} height={20} rx={10}
        fill="hsl(var(--card))" stroke="hsl(220 15% 86%)" strokeWidth={1}
        style={{
          opacity: isVisible ? 1 : 0,
          transition: `opacity 0.4s ease-out ${delay + 500}ms`,
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.06))",
        }}
      />
      <text x={mx} y={my + 1} textAnchor="middle" dominantBaseline="middle"
        fill="hsl(175 50% 38%)" fontWeight="600" fontSize="11" fontFamily="Inter, sans-serif"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: `opacity 0.4s ease-out ${delay + 500}ms`,
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

  const conversions = useMemo(() =>
    currentData.slice(1).map((s, i) =>
      Math.round((s.count / currentData[i].count) * 100)
    ), []);

  return (
    <AnimatedCard delay={delay}>
      <div ref={ref} className="bg-card rounded-xl p-5 border border-border">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
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
        <svg viewBox="0 0 600 380" className="w-full" preserveAspectRatio="xMidYMid meet">
          {/* Conversion paths */}
          {conversions.map((pct, i) => {
            const from = circlePositions[i];
            const to = circlePositions[i + 1];
            const r1 = getRadius(currentData[i].count, maxCount);
            const r2 = getRadius(currentData[i + 1].count, maxCount);
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
