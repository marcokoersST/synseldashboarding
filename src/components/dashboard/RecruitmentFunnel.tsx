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

const stepColors = [
  "hsl(175, 65%, 45%)",
  "hsl(160, 55%, 50%)",
  "hsl(145, 50%, 45%)",
  "hsl(35, 65%, 55%)",
  "hsl(200, 55%, 50%)",
  "hsl(260, 45%, 55%)",
  "hsl(175, 70%, 40%)",
];

const RADIUS = 38;

const circlePositions = [
  { x: 85, y: 90 },
  { x: 300, y: 90 },
  { x: 515, y: 90 },
  { x: 515, y: 290 },
  { x: 373, y: 290 },
  { x: 227, y: 290 },
  { x: 85, y: 290 },
];

// --- Sub-components ---

function StepCircle({
  cx, cy, count, label, color, index, delay, isVisible,
  isComparing, compCount, isHovered, onHover,
}: {
  cx: number; cy: number; count: number; label: string; color: string;
  index: number; delay: number; isVisible: boolean;
  isComparing: boolean; compCount?: number; isHovered: boolean;
  onHover: (i: number | null) => void;
}) {
  const labelY = cy > 150 ? cy + RADIUS + 20 : cy - RADIUS - 16;

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
      {/* Ring circle */}
      <circle cx={cx} cy={cy} r={RADIUS}
        fill="hsl(var(--card))" stroke={color} strokeWidth={3}
        opacity={isHovered ? 1 : 0.85}
        style={{ transition: "opacity 0.2s ease" }}
      />

      {/* Step number */}
      <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="middle"
        fill="hsl(220, 10%, 55%)" fontSize="9" fontWeight="500" fontFamily="Inter, sans-serif">
        Stap {index + 1}
      </text>

      {/* Count */}
      {isComparing && compCount !== undefined ? (
        <>
          <text x={cx} y={cy + 4} textAnchor="middle" dominantBaseline="middle"
            fill="hsl(220, 15%, 25%)" fontWeight="700" fontSize="15" fontFamily="Inter, sans-serif">
            {count}
          </text>
          <text x={cx} y={cy + 18} textAnchor="middle" dominantBaseline="middle"
            fill="hsl(45, 50%, 45%)" fontWeight="600" fontSize="11" fontFamily="Inter, sans-serif">
            {compCount}
          </text>
        </>
      ) : (
        <text x={cx} y={cy + 6} textAnchor="middle" dominantBaseline="middle"
          fill="hsl(220, 15%, 25%)" fontWeight="700" fontSize="17" fontFamily="Inter, sans-serif">
          {count}
        </text>
      )}

      {/* Comparison dashed ring */}
      {isComparing && compCount !== undefined && (
        <circle cx={cx} cy={cy} r={RADIUS + 5}
          fill="none" stroke="hsl(45, 40%, 55%)" strokeWidth={2}
          strokeDasharray="5 3" opacity={0.7}
        />
      )}

      {/* Label */}
      <text x={cx} y={labelY}
        textAnchor="middle" dominantBaseline="middle"
        fill="hsl(220, 10%, 50%)" fontSize="10" fontWeight="500" fontFamily="Inter, sans-serif">
        {label}
      </text>
    </g>
  );
}

function ChevronArrow({
  x1, y1, x2, y2, percentage, delay, isVisible,
}: {
  x1: number; y1: number; x2: number; y2: number;
  percentage: number; delay: number; isVisible: boolean;
}) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / dist;
  const ny = dy / dist;

  // Angle for rotating chevrons
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Two chevron marks
  const chevronSize = 6;
  const gap = 8;

  const makeChevron = (ox: number) => {
    const cx = mx + nx * ox;
    const cy = my + ny * ox;
    return `M ${cx - ny * chevronSize - nx * chevronSize} ${cy + nx * chevronSize - ny * chevronSize} L ${cx} ${cy} L ${cx - ny * (-chevronSize) - nx * chevronSize} ${cy + nx * (-chevronSize) - ny * chevronSize}`;
  };

  // Percentage label offset perpendicular to the line
  const perpX = -ny * 14;
  const perpY = nx * 14;

  return (
    <g style={{
      opacity: isVisible ? 1 : 0,
      transition: `opacity 0.4s ease-out ${delay}ms`,
    }}>
      <path d={makeChevron(-gap / 2)} fill="none" stroke="hsl(220, 10%, 75%)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={makeChevron(gap / 2)} fill="none" stroke="hsl(220, 10%, 75%)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <text x={mx + perpX} y={my + perpY} textAnchor="middle" dominantBaseline="middle"
        fill="hsl(220, 10%, 55%)" fontSize="9" fontWeight="500" fontFamily="Inter, sans-serif">
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
          {/* Chevron arrows */}
          {conversions.map((pct, i) => {
            const from = circlePositions[i];
            const to = circlePositions[i + 1];
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const nx = dx / dist;
            const ny = dy / dist;
            return (
              <ChevronArrow
                key={i}
                x1={from.x + nx * (RADIUS + 8)}
                y1={from.y + ny * (RADIUS + 8)}
                x2={to.x - nx * (RADIUS + 8)}
                y2={to.y - ny * (RADIUS + 8)}
                percentage={pct}
                delay={delay + 300 + i * 100}
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
              count={step.count}
              label={step.shortLabel}
              color={stepColors[i]}
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
