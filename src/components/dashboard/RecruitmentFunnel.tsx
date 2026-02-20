import { useState, useMemo } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
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

interface OptionalStepData extends StepData {
  /** Index of the main step BEFORE this optional step */
  afterMainIndex: number;
}

// 6 main steps (mandatory path)
const currentData: StepData[] = [
  { label: "Toegewezen kandidaten", shortLabel: "Toegewezen", count: 120 },
  { label: "Inschrijvingen", shortLabel: "Inschrijvingen", count: 65 },
  { label: "Acquisities", shortLabel: "Acquisities", count: 51 },
  { label: "Uitnodiging", shortLabel: "Uitnodiging", count: 32 },
  { label: "Gesprekken", shortLabel: "Gesprekken", count: 23 },
  { label: "Plaatsingen", shortLabel: "Plaatsingen", count: 5 },
];

// Optional side steps
const optionalSteps: OptionalStepData[] = [
  { label: "Intakes", shortLabel: "Intakes", count: 58, afterMainIndex: 1 },
  { label: "Vervolggesprekken", shortLabel: "Vervolg", count: 11, afterMainIndex: 4 },
];

const makeCompData = (counts: number[]): StepData[] =>
  currentData.map((s, i) => ({ ...s, count: counts[i] }));

const makeOptCompData = (counts: number[]): OptionalStepData[] =>
  optionalSteps.map((s, i) => ({ ...s, count: counts[i] }));

const comparisonDataByPeriod: Record<string, { main: StepData[]; optional: OptionalStepData[] }> = {
  P1:  { main: makeCompData([100, 55, 42, 27, 19, 3]), optional: makeOptCompData([48, 9]) },
  P2:  { main: makeCompData([115, 62, 48, 30, 21, 4]), optional: makeOptCompData([53, 10]) },
  P3:  { main: makeCompData([95, 50, 38, 24, 17, 3]), optional: makeOptCompData([42, 8]) },
  P4:  { main: makeCompData([130, 70, 55, 35, 25, 6]), optional: makeOptCompData([60, 12]) },
  P5:  { main: makeCompData([110, 58, 45, 28, 20, 4]), optional: makeOptCompData([50, 9]) },
  P6:  { main: makeCompData([125, 67, 52, 33, 24, 5]), optional: makeOptCompData([57, 11]) },
  P7:  { main: makeCompData([105, 56, 43, 26, 18, 3]), optional: makeOptCompData([47, 8]) },
  P8:  { main: makeCompData([118, 64, 50, 31, 22, 5]), optional: makeOptCompData([54, 10]) },
  P9:  { main: makeCompData([128, 68, 53, 34, 24, 6]), optional: makeOptCompData([58, 12]) },
  P10: { main: makeCompData([98, 52, 40, 25, 18, 3]), optional: makeOptCompData([44, 8]) },
  P11: { main: makeCompData([122, 66, 51, 32, 23, 5]), optional: makeOptCompData([56, 11]) },
  P12: { main: makeCompData([108, 58, 44, 28, 20, 4]), optional: makeOptCompData([49, 9]) },
  P13: { main: makeCompData([135, 73, 57, 36, 26, 7]), optional: makeOptCompData([62, 13]) },
};

// --- Detail toggle hook ---

function useDetailToggle() {
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayMode, setDisplayMode] = useState(false);

  const toggle = () => {
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

// --- Layout config ---

const MAIN_STEP_COUNT = 6;

function getLayoutConfig(isDetail: boolean) {
  const ARC_CENTER_X = isDetail ? 80 : 65;
  const ARC_CENTER_Y = isDetail ? 400 : 280;
  const ARC_RADIUS = isDetail ? 260 : 180;
  const CIRCLE_R = isDetail ? 40 : 30;
  const OPT_CIRCLE_R = isDetail ? 28 : 21;
  const OPT_INSET = isDetail ? 90 : 65; // how far inside the arc optional steps sit
  const viewBox = isDetail ? "0 0 580 780" : "0 0 440 540";

  const stepColors = [
    "hsl(175, 50%, 75%)", "hsl(175, 50%, 67%)", "hsl(175, 55%, 59%)",
    "hsl(175, 55%, 51%)", "hsl(175, 60%, 43%)", "hsl(175, 65%, 27%)",
  ];

  const stepTextColors = [
    "hsl(220, 15%, 20%)", "hsl(220, 15%, 20%)", "hsl(220, 15%, 20%)",
    "hsl(220, 15%, 25%)", "white", "white",
  ];

  const stepCountColors = [
    "hsl(220, 15%, 20%)", "hsl(220, 15%, 20%)", "hsl(220, 15%, 20%)",
    "white", "white", "white",
  ];

  const circlePositions = Array.from({ length: MAIN_STEP_COUNT }, (_, i) => {
    const angle = Math.PI / 2 - (i / (MAIN_STEP_COUNT - 1)) * Math.PI;
    return {
      x: ARC_CENTER_X + ARC_RADIUS * Math.cos(angle),
      y: ARC_CENTER_Y - ARC_RADIUS * Math.sin(angle),
    };
  });

  // Optional step positions: inside the arc, between their two adjacent main steps
  const optionalPositions = optionalSteps.map((opt) => {
    const p1 = circlePositions[opt.afterMainIndex];
    const p2 = circlePositions[opt.afterMainIndex + 1];
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    // Move inward (toward arc center)
    const dx = midX - ARC_CENTER_X;
    const dy = midY - ARC_CENTER_Y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return {
      x: midX - (dx / dist) * OPT_INSET,
      y: midY - (dy / dist) * OPT_INSET,
      fromMain: opt.afterMainIndex,
      toMain: opt.afterMainIndex + 1,
    };
  });

  return {
    ARC_CENTER_X, ARC_CENTER_Y, ARC_RADIUS, CIRCLE_R, OPT_CIRCLE_R,
    viewBox, stepColors, stepTextColors, stepCountColors,
    circlePositions, optionalPositions,
  };
}

// --- Sub-components ---

function StepNode({
  cx, cy, count, label, color, textColor, countColor, index, delay, isVisible,
  isComparing, compCount, isHovered, onHover, circleR, isDetail, totalSteps,
}: {
  cx: number; cy: number; count: number; label: string; color: string;
  textColor: string; countColor: string;
  index: number; delay: number; isVisible: boolean;
  isComparing: boolean; compCount?: number; isHovered: boolean;
  onHover: (i: number | null) => void;
  circleR: number; isDetail: boolean; totalSteps: number;
}) {
  const isTop = index === 0;
  const isBottom = index === totalSteps - 1;
  const labelX = isTop || isBottom ? cx : cx + circleR + (isDetail ? 28 : 20);
  const labelY = isTop ? cy - circleR - 14 : isBottom ? cy + circleR + 18 : cy;
  const labelAnchor = isTop || isBottom ? "middle" : "start";

  const numSize = isDetail ? 13 : 10;
  const countSize = isDetail ? 22 : 16;
  const labelSize = isDetail ? 13 : 11;
  const compCountSize = isDetail ? 14 : 11;

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
      <circle cx={cx} cy={cy} r={circleR}
        fill={color}
        style={{ filter: isHovered ? "drop-shadow(0 2px 8px rgba(0,0,0,0.15))" : "none", transition: "filter 0.2s" }}
      />

      {/* Step number */}
      <text x={cx} y={cy - (isDetail ? 10 : 7)} textAnchor="middle" dominantBaseline="middle"
        fill={textColor} fontSize={numSize} fontWeight="700" fontFamily="Inter, sans-serif"
        opacity={0.6}>
        0{index + 1}
      </text>

      {/* Count */}
      {isComparing && compCount !== undefined ? (
        <>
          <text x={cx} y={cy + (isDetail ? 6 : 4)} textAnchor="middle" dominantBaseline="middle"
            fill={countColor} fontWeight="700" fontSize={countSize - 4} fontFamily="Inter, sans-serif">
            {count}
          </text>
          <text x={cx} y={cy + (isDetail ? 21 : 15)} textAnchor="middle" dominantBaseline="middle"
            fill="hsl(45, 50%, 45%)" fontWeight="600" fontSize={compCountSize} fontFamily="Inter, sans-serif">
            {compCount}
          </text>
        </>
      ) : (
        <text x={cx} y={cy + (isDetail ? 10 : 7)} textAnchor="middle" dominantBaseline="middle"
          fill={countColor} fontWeight="700" fontSize={countSize} fontFamily="Inter, sans-serif">
          {count}
        </text>
      )}

      {/* Comparison dashed ring */}
      {isComparing && compCount !== undefined && (
        <circle cx={cx} cy={cy} r={circleR + 5}
          fill="none" stroke="hsl(45, 40%, 55%)" strokeWidth={1.5}
          strokeDasharray="4 3" opacity={0.6}
        />
      )}

      {/* Label */}
      <text x={labelX} y={labelY}
        textAnchor={labelAnchor} dominantBaseline="middle"
        fill="hsl(220, 10%, 40%)" fontSize={labelSize} fontWeight="600" fontFamily="Inter, sans-serif">
        {label}
      </text>
    </g>
  );
}

function OptionalStepNode({
  cx, cy, count, label, delay, isVisible, circleR, isDetail,
  isComparing, compCount,
}: {
  cx: number; cy: number; count: number; label: string;
  delay: number; isVisible: boolean; circleR: number; isDetail: boolean;
  isComparing: boolean; compCount?: number;
}) {
  const labelX = cx - circleR - (isDetail ? 14 : 10);
  const labelSize = isDetail ? 11 : 9;
  const countSize = isDetail ? 16 : 12;
  const compCountSize = isDetail ? 11 : 9;

  return (
    <g style={{
      transform: isVisible ? "scale(1)" : "scale(0)",
      transformOrigin: `${cx}px ${cy}px`,
      transition: `transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
    }}>
      <circle cx={cx} cy={cy} r={circleR}
        fill="hsl(175, 40%, 85%)" stroke="hsl(175, 45%, 65%)" strokeWidth={1.5}
        strokeDasharray="3 2" opacity={0.85}
      />

      {/* Count */}
      {isComparing && compCount !== undefined ? (
        <>
          <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle"
            fill="hsl(175, 50%, 35%)" fontWeight="700" fontSize={countSize - 3} fontFamily="Inter, sans-serif">
            {count}
          </text>
          <text x={cx} y={cy + (isDetail ? 11 : 9)} textAnchor="middle" dominantBaseline="middle"
            fill="hsl(45, 50%, 45%)" fontWeight="600" fontSize={compCountSize} fontFamily="Inter, sans-serif">
            {compCount}
          </text>
        </>
      ) : (
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
          fill="hsl(175, 50%, 35%)" fontWeight="700" fontSize={countSize} fontFamily="Inter, sans-serif">
          {count}
        </text>
      )}

      {/* Label - to the left */}
      <text x={labelX} y={cy}
        textAnchor="end" dominantBaseline="middle"
        fill="hsl(220, 10%, 50%)" fontSize={labelSize} fontWeight="500" fontFamily="Inter, sans-serif"
        fontStyle="italic">
        {label}
      </text>
    </g>
  );
}

function ConnectorLine({
  x1, y1, x2, y2, percentage, delay, isVisible, circleR,
}: {
  x1: number; y1: number; x2: number; y2: number;
  percentage: number; delay: number; isVisible: boolean; circleR: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / dist;
  const ny = dy / dist;

  const sx = x1 + nx * (circleR + 4);
  const sy = y1 + ny * (circleR + 4);
  const ex = x2 - nx * (circleR + 4);
  const ey = y2 - ny * (circleR + 4);

  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;
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
      <circle cx={ex - nx * 2} cy={ey - ny * 2} r={2.5}
        fill="hsl(220, 10%, 70%)"
        style={{ opacity: isVisible ? 1 : 0, transition: `opacity 0.3s ${delay + 400}ms` }}
      />
      <text x={mx + perpX} y={my + perpY} textAnchor="middle" dominantBaseline="middle"
        fill="hsl(220, 10%, 50%)" fontSize="12" fontWeight="500" fontFamily="Inter, sans-serif"
        style={{ opacity: isVisible ? 1 : 0, transition: `opacity 0.3s ${delay + 500}ms` }}>
        {percentage}%
      </text>
    </g>
  );
}

function DottedConnectorLine({
  x1, y1, x2, y2, delay, isVisible, circleR1, circleR2,
}: {
  x1: number; y1: number; x2: number; y2: number;
  delay: number; isVisible: boolean; circleR1: number; circleR2: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / dist;
  const ny = dy / dist;

  const sx = x1 + nx * (circleR1 + 3);
  const sy = y1 + ny * (circleR1 + 3);
  const ex = x2 - nx * (circleR2 + 3);
  const ey = y2 - ny * (circleR2 + 3);

  return (
    <line x1={sx} y1={sy} x2={ex} y2={ey}
      stroke="hsl(175, 35%, 70%)" strokeWidth={1.2}
      strokeDasharray="4 3"
      opacity={isVisible ? 0.7 : 0}
      style={{ transition: `opacity 0.6s ease-out ${delay}ms` }}
    />
  );
}

// --- Detail Content ---

function ConversionTable({ comparisonData, selectedPeriod, isComparing }: {
  comparisonData: StepData[]; selectedPeriod: string; isComparing: boolean;
}) {
  const conversions = currentData.slice(1).map((s, i) => {
    const pct = Math.round((s.count / currentData[i].count) * 100);
    const compPct = isComparing
      ? Math.round((comparisonData[i + 1].count / comparisonData[i].count) * 100)
      : null;
    return {
      from: currentData[i].shortLabel,
      to: s.shortLabel,
      pct,
      compPct,
      fromCount: currentData[i].count,
      toCount: s.count,
    };
  });

  const best = conversions.reduce((a, b) => (b.pct > a.pct ? b : a));
  const worst = conversions.reduce((a, b) => (b.pct < a.pct ? b : a));
  const lastStep = currentData[currentData.length - 1];
  const overall = ((lastStep.count / currentData[0].count) * 100).toFixed(1);

  return (
    <div className="space-y-3">
      {/* Main conversion rows */}
      <div className="space-y-1.5">
        {conversions.map((c, i) => (
          <div key={i} className={cn(
            "flex items-center justify-between text-xs px-3 py-1.5 rounded-md",
            c === best ? "bg-emerald-50 dark:bg-emerald-950/30" :
            c === worst ? "bg-amber-50 dark:bg-amber-950/30" : "bg-muted/30"
          )}>
            <span className="text-muted-foreground">
              {c.from} → {c.to}
            </span>
            <div className="flex items-center gap-3">
              <span className={cn(
                "font-semibold",
                c === best ? "text-emerald-600 dark:text-emerald-400" :
                c === worst ? "text-amber-600 dark:text-amber-400" : "text-foreground"
              )}>
                {c.pct}%
              </span>
              {isComparing && c.compPct !== null && (
                <span className="font-medium text-[hsl(45,50%,45%)]">{c.compPct}%</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Optional steps indicator */}
      <div className="space-y-1">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide px-3">Optionele stappen</p>
        {optionalSteps.map((opt, i) => (
          <div key={i} className="flex items-center justify-between text-xs px-3 py-1 rounded-md bg-muted/20 border border-dashed border-border/50">
            <span className="text-muted-foreground italic">{opt.shortLabel}</span>
            <span className="font-medium text-foreground">{opt.count}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
        <span className="text-xs font-medium text-foreground">
          Totaal: {currentData[0].count} → {lastStep.count}
        </span>
        <span className="text-sm font-bold text-primary">{overall}% conversie</span>
      </div>

      {/* Best / Worst */}
      <div className="grid grid-cols-2 gap-2">
        <div className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30">
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Beste conversie</p>
          <p className="text-xs font-semibold text-foreground mt-0.5">{best.from} → {best.to}</p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{best.pct}%</p>
        </div>
        <div className="px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30">
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Laagste conversie</p>
          <p className="text-xs font-semibold text-foreground mt-0.5">{worst.from} → {worst.to}</p>
          <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{worst.pct}%</p>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

interface RecruitmentFunnelProps {
  delay?: number;
}

export function RecruitmentFunnel({ delay = 0 }: RecruitmentFunnelProps) {
  const { isTransitioning, displayMode, toggle } = useDetailToggle();
  const [isComparing, setIsComparing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("P1");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { ref, isVisible } = useAnimateOnMount({ delay });

  const layout = useMemo(() => getLayoutConfig(displayMode), [displayMode]);
  const comparisonData = comparisonDataByPeriod[selectedPeriod];

  const conversions = useMemo(() =>
    currentData.slice(1).map((s, i) =>
      Math.round((s.count / currentData[i].count) * 100)
    ), []);

  return (
    <AnimatedCard delay={delay}>
      <div ref={ref} className="bg-card rounded-xl p-5 border border-border">
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-sm font-medium text-foreground">Wervingstrechter</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Conversie per fase</p>
          </div>
          <Button
            variant="ghost" size="icon" onClick={toggle}
            className="h-7 w-7 rounded-full bg-secondary hover:bg-secondary/80"
            title={displayMode ? "Overzicht" : "Details"}
          >
            {displayMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Content with transition */}
        <div className={cn(
          "transition-all duration-300 ease-out",
          isTransitioning ? "opacity-0 scale-[0.97] translate-y-2" : "opacity-100 scale-100 translate-y-0"
        )}>
          {/* Comparison controls - detail mode only */}
          {displayMode && (
            <div className="flex items-center gap-2 mb-2 justify-end">
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
          )}

          {/* SVG Pipeline */}
          <svg viewBox={layout.viewBox} className="w-full" preserveAspectRatio="xMidYMid meet">
            {/* Main connector lines */}
            {conversions.map((pct, i) => (
              <ConnectorLine
                key={i}
                x1={layout.circlePositions[i].x}
                y1={layout.circlePositions[i].y}
                x2={layout.circlePositions[i + 1].x}
                y2={layout.circlePositions[i + 1].y}
                percentage={pct}
                delay={delay + 200 + i * 100}
                isVisible={isVisible}
                circleR={layout.CIRCLE_R}
              />
            ))}

            {/* Dotted connector lines to optional steps */}
            {layout.optionalPositions.map((optPos, i) => (
              <g key={`opt-conn-${i}`}>
                <DottedConnectorLine
                  x1={layout.circlePositions[optPos.fromMain].x}
                  y1={layout.circlePositions[optPos.fromMain].y}
                  x2={optPos.x}
                  y2={optPos.y}
                  delay={delay + 600 + i * 100}
                  isVisible={isVisible}
                  circleR1={layout.CIRCLE_R}
                  circleR2={layout.OPT_CIRCLE_R}
                />
                <DottedConnectorLine
                  x1={optPos.x}
                  y1={optPos.y}
                  x2={layout.circlePositions[optPos.toMain].x}
                  y2={layout.circlePositions[optPos.toMain].y}
                  delay={delay + 650 + i * 100}
                  isVisible={isVisible}
                  circleR1={layout.OPT_CIRCLE_R}
                  circleR2={layout.CIRCLE_R}
                />
              </g>
            ))}

            {/* Main step nodes */}
            {currentData.map((step, i) => (
              <StepNode
                key={i}
                cx={layout.circlePositions[i].x}
                cy={layout.circlePositions[i].y}
                count={step.count}
                label={step.shortLabel}
                color={layout.stepColors[i]}
                textColor={layout.stepTextColors[i]}
                countColor={layout.stepCountColors[i]}
                index={i}
                delay={delay + 100 + i * 80}
                isVisible={isVisible}
                isComparing={displayMode && isComparing}
                compCount={displayMode && isComparing ? comparisonData.main[i].count : undefined}
                isHovered={hoveredIndex === i}
                onHover={setHoveredIndex}
                circleR={layout.CIRCLE_R}
                isDetail={displayMode}
                totalSteps={MAIN_STEP_COUNT}
              />
            ))}

            {/* Optional step nodes */}
            {optionalSteps.map((opt, i) => (
              <OptionalStepNode
                key={`opt-${i}`}
                cx={layout.optionalPositions[i].x}
                cy={layout.optionalPositions[i].y}
                count={opt.count}
                label={opt.shortLabel}
                delay={delay + 500 + i * 100}
                isVisible={isVisible}
                circleR={layout.OPT_CIRCLE_R}
                isDetail={displayMode}
                isComparing={displayMode && isComparing}
                compCount={displayMode && isComparing ? comparisonData.optional[i].count : undefined}
              />
            ))}
          </svg>

          {/* Detail mode extra content */}
          {displayMode && (
            <>
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
                    const c = comparisonData.main[hoveredIndex];
                    const prev = hoveredIndex > 0 ? currentData[hoveredIndex - 1] : null;
                    const prevC = hoveredIndex > 0 ? comparisonData.main[hoveredIndex - 1] : null;
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

              {/* Conversion table & highlights */}
              <div className="mt-4">
                <ConversionTable
                  comparisonData={comparisonData.main}
                  selectedPeriod={selectedPeriod}
                  isComparing={isComparing}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
}
