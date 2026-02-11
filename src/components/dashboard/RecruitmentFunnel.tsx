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
  "hsl(175, 60%, 45%)",
  "hsl(175, 50%, 55%)",
  "hsl(160, 55%, 42%)",
  "hsl(45, 30%, 55%)",
  "hsl(175, 65%, 38%)",
  "hsl(160, 45%, 50%)",
  "hsl(45, 35%, 45%)",
];

// Arc layout: 7 circles in a semicircle from left to right (180° arc)
// Center of the arc
const CX = 210;
const CY = 280;
const ARC_RADIUS = 200;
const CIRCLE_R = 40;

// Angles from π (left) to 0 (right), evenly spaced
const circlePositions = Array.from({ length: 7 }, (_, i) => {
  const angle = Math.PI - (i / 6) * Math.PI; // π to 0
  return {
    x: CX + ARC_RADIUS * Math.cos(angle),
    y: CY - ARC_RADIUS * Math.sin(angle),
  };
});

// --- Sub-components ---

function StepNode({
  cx, cy, count, label, color, index, delay, isVisible,
  isComparing, compCount, isHovered, onHover,
}: {
  cx: number; cy: number; count: number; label: string; color: string;
  index: number; delay: number; isVisible: boolean;
  isComparing: boolean; compCount?: number; isHovered: boolean;
  onHover: (i: number | null) => void;
}) {
  // Label position: above for top circles, below for bottom ones
  const angle = Math.PI - (index / 6) * Math.PI;
  const isTop = cy < CY - 40;
  const isBottom = cy > CY + 40;
  const labelOffsetY = isTop ? -CIRCLE_R - 28 : isBottom ? CIRCLE_R + 16 : (angle > Math.PI / 2 ? -CIRCLE_R - 28 : -CIRCLE_R - 28);
  const labelOffsetX = 0;

  // Small colored indicator dot position (like reference)
  const dotAngle = angle + Math.PI / 2 + 0.4; // top-left area of circle
  const dotX = cx + (CIRCLE_R + 2) * Math.cos(dotAngle);
  const dotY = cy - (CIRCLE_R + 2) * Math.sin(dotAngle);

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
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={CIRCLE_R}
        fill="white" stroke="hsl(220, 10%, 88%)" strokeWidth={2}
        style={{ filter: isHovered ? "drop-shadow(0 2px 8px rgba(0,0,0,0.1))" : "none", transition: "filter 0.2s" }}
      />

      {/* Colored accent arc (partial ring like reference) */}
      <circle cx={cx} cy={cy} r={CIRCLE_R}
        fill="none" stroke={color} strokeWidth={3}
        strokeDasharray={`${CIRCLE_R * 1.8} ${2 * Math.PI * CIRCLE_R}`}
        strokeDashoffset={-CIRCLE_R * 0.3}
        strokeLinecap="round"
      />

      {/* Colored indicator dot */}
      <circle cx={dotX} cy={dotY} r={5}
        fill={color} stroke="white" strokeWidth={2}
      />

      {/* Step number */}
      <text x={cx} y={cy - 7} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize="13" fontWeight="700" fontFamily="Inter, sans-serif"
        opacity={0.6}>
        0{index + 1}
      </text>

      {/* Count */}
      {isComparing && compCount !== undefined ? (
        <>
          <text x={cx} y={cy + 6} textAnchor="middle" dominantBaseline="middle"
            fill="hsl(220, 15%, 20%)" fontWeight="700" fontSize="18" fontFamily="Inter, sans-serif">
            {count}
          </text>
          <text x={cx} y={cy + 21} textAnchor="middle" dominantBaseline="middle"
            fill="hsl(45, 50%, 45%)" fontWeight="600" fontSize="14" fontFamily="Inter, sans-serif">
            {compCount}
          </text>
        </>
      ) : (
        <text x={cx} y={cy + 8} textAnchor="middle" dominantBaseline="middle"
          fill="hsl(220, 15%, 20%)" fontWeight="700" fontSize="22" fontFamily="Inter, sans-serif">
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

      {/* Label */}
      <text x={cx + labelOffsetX} y={cy + labelOffsetY}
        textAnchor="middle" dominantBaseline="middle"
        fill="hsl(220, 10%, 40%)" fontSize="13" fontWeight="600" fontFamily="Inter, sans-serif">
        {label}
      </text>
      {/* Conversion from previous step */}
    </g>
  );
}

function ConnectorLine({
  x1, y1, x2, y2, percentage, delay, isVisible,
}: {
  x1: number; y1: number; x2: number; y2: number;
  percentage: number; delay: number; isVisible: boolean;
}) {
  // Line from center to circle, with percentage near the circle end
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / dist;
  const ny = dy / dist;

  // Start from center edge, end at circle edge
  const sx = x1 + nx * 52;
  const sy = y1 + ny * 52;
  const ex = x2 - nx * (CIRCLE_R + 8);
  const ey = y2 - ny * (CIRCLE_R + 8);

  // Midpoint for percentage label
  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;
  const perpX = -ny * 12;
  const perpY = nx * 12;

  const pathLen = Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2);

  return (
    <g>
      <line x1={sx} y1={sy} x2={ex} y2={ey}
        stroke="hsl(220, 10%, 85%)" strokeWidth={1.5}
        strokeDasharray={pathLen}
        strokeDashoffset={isVisible ? 0 : pathLen}
        style={{ transition: `stroke-dashoffset 0.8s ease-out ${delay}ms` }}
      />
      {/* Small arrow at the end */}
      <circle cx={ex + nx * 3} cy={ey + ny * 3} r={2.5}
        fill="hsl(220, 10%, 75%)"
        style={{ opacity: isVisible ? 1 : 0, transition: `opacity 0.3s ${delay + 400}ms` }}
      />
      {/* Percentage */}
      <text x={mx + perpX} y={my + perpY} textAnchor="middle" dominantBaseline="middle"
        fill="hsl(220, 10%, 55%)" fontSize="12" fontWeight="500" fontFamily="Inter, sans-serif"
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
      <div ref={ref} className="bg-card rounded-xl p-5 border border-border min-h-[480px]">
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
        <svg viewBox="0 0 420 500" className="w-full" preserveAspectRatio="xMidYMid meet">
          {/* Central hub circle */}
          <circle cx={CX} cy={CY} r={55}
            fill="white" stroke="hsl(220, 10%, 90%)" strokeWidth={2}
            style={{
              transform: isVisible ? "scale(1)" : "scale(0)",
              transformOrigin: `${CX}px ${CY}px`,
              transition: `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay + 50}ms`,
            }}
          />
          <text x={CX} y={CY - 8} textAnchor="middle" dominantBaseline="middle"
            fill="hsl(220, 15%, 25%)" fontSize="15" fontWeight="700" fontFamily="Inter, sans-serif"
            style={{ opacity: isVisible ? 1 : 0, transition: `opacity 0.4s ${delay + 300}ms` }}>
            Werving
          </text>
          <text x={CX} y={CY + 8} textAnchor="middle" dominantBaseline="middle"
            fill="hsl(220, 10%, 55%)" fontSize="11" fontWeight="500" fontFamily="Inter, sans-serif"
            style={{ opacity: isVisible ? 1 : 0, transition: `opacity 0.4s ${delay + 350}ms` }}>
            trechter
          </text>

          {/* Connector lines from center to each circle */}
          {conversions.map((pct, i) => (
            <ConnectorLine
              key={i}
              x1={CX}
              y1={CY}
              x2={circlePositions[i + 1].x}
              y2={circlePositions[i + 1].y}
              percentage={pct}
              delay={delay + 200 + i * 100}
              isVisible={isVisible}
            />
          ))}

          {/* Also draw line from center to first circle (no percentage) */}
          <line
            x1={CX - 40} y1={CY}
            x2={circlePositions[0].x + CIRCLE_R + 8} y2={circlePositions[0].y}
            stroke="hsl(220, 10%, 85%)" strokeWidth={1.5}
            strokeDasharray="200"
            strokeDashoffset={isVisible ? 0 : 200}
            style={{ transition: `stroke-dashoffset 0.8s ease-out ${delay + 150}ms` }}
          />

          {/* Step circles */}
          {currentData.map((step, i) => (
            <StepNode
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
