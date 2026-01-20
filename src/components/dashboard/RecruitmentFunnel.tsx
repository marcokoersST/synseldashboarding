import { useState, useMemo } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { useAnimateOnMount, getStaggerDelay } from "@/hooks/useAnimateOnMount";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Square-root scale for bar widths - makes small values visible while keeping proportions
const getScaledWidth = (value: number, maxValue: number): number => {
  if (maxValue === 0) return 0;
  const scaled = (Math.sqrt(value) / Math.sqrt(maxValue)) * 100;
  return Math.max(scaled, 3); // Minimum 3% width for visibility
};

// Current period data
const currentData = [
  { label: "Leads", count: 450, percentage: 100 },
  { label: "Eerste contact", count: 245, percentage: 54 },
  { label: "Intake gesprek", count: 89, percentage: 20 },
  { label: "CV Check", count: 34, percentage: 8 },
  { label: "Geplaatst", count: 5, percentage: 1 },
];

// Comparison data by period (demo data with variations)
const comparisonDataByPeriod: Record<string, typeof currentData> = {
  "P1": [
    { label: "Leads", count: 380, percentage: 100 },
    { label: "Eerste contact", count: 210, percentage: 55 },
    { label: "Intake gesprek", count: 76, percentage: 20 },
    { label: "CV Check", count: 28, percentage: 7 },
    { label: "Geplaatst", count: 4, percentage: 1 },
  ],
  "P2": [
    { label: "Leads", count: 420, percentage: 100 },
    { label: "Eerste contact", count: 235, percentage: 56 },
    { label: "Intake gesprek", count: 82, percentage: 20 },
    { label: "CV Check", count: 30, percentage: 7 },
    { label: "Geplaatst", count: 6, percentage: 1 },
  ],
  "P3": [
    { label: "Leads", count: 390, percentage: 100 },
    { label: "Eerste contact", count: 198, percentage: 51 },
    { label: "Intake gesprek", count: 71, percentage: 18 },
    { label: "CV Check", count: 25, percentage: 6 },
    { label: "Geplaatst", count: 3, percentage: 1 },
  ],
  "P4": [
    { label: "Leads", count: 465, percentage: 100 },
    { label: "Eerste contact", count: 260, percentage: 56 },
    { label: "Intake gesprek", count: 95, percentage: 20 },
    { label: "CV Check", count: 38, percentage: 8 },
    { label: "Geplaatst", count: 7, percentage: 2 },
  ],
  "P5": [
    { label: "Leads", count: 410, percentage: 100 },
    { label: "Eerste contact", count: 225, percentage: 55 },
    { label: "Intake gesprek", count: 85, percentage: 21 },
    { label: "CV Check", count: 32, percentage: 8 },
    { label: "Geplaatst", count: 5, percentage: 1 },
  ],
  "P6": [
    { label: "Leads", count: 440, percentage: 100 },
    { label: "Eerste contact", count: 242, percentage: 55 },
    { label: "Intake gesprek", count: 88, percentage: 20 },
    { label: "CV Check", count: 35, percentage: 8 },
    { label: "Geplaatst", count: 6, percentage: 1 },
  ],
  "P7": [
    { label: "Leads", count: 395, percentage: 100 },
    { label: "Eerste contact", count: 205, percentage: 52 },
    { label: "Intake gesprek", count: 75, percentage: 19 },
    { label: "CV Check", count: 29, percentage: 7 },
    { label: "Geplaatst", count: 4, percentage: 1 },
  ],
  "P8": [
    { label: "Leads", count: 425, percentage: 100 },
    { label: "Eerste contact", count: 238, percentage: 56 },
    { label: "Intake gesprek", count: 92, percentage: 22 },
    { label: "CV Check", count: 36, percentage: 8 },
    { label: "Geplaatst", count: 5, percentage: 1 },
  ],
  "P9": [
    { label: "Leads", count: 455, percentage: 100 },
    { label: "Eerste contact", count: 250, percentage: 55 },
    { label: "Intake gesprek", count: 91, percentage: 20 },
    { label: "CV Check", count: 37, percentage: 8 },
    { label: "Geplaatst", count: 6, percentage: 1 },
  ],
  "P10": [
    { label: "Leads", count: 385, percentage: 100 },
    { label: "Eerste contact", count: 200, percentage: 52 },
    { label: "Intake gesprek", count: 73, percentage: 19 },
    { label: "CV Check", count: 27, percentage: 7 },
    { label: "Geplaatst", count: 4, percentage: 1 },
  ],
  "P11": [
    { label: "Leads", count: 430, percentage: 100 },
    { label: "Eerste contact", count: 240, percentage: 56 },
    { label: "Intake gesprek", count: 86, percentage: 20 },
    { label: "CV Check", count: 33, percentage: 8 },
    { label: "Geplaatst", count: 5, percentage: 1 },
  ],
  "P12": [
    { label: "Leads", count: 400, percentage: 100 },
    { label: "Eerste contact", count: 220, percentage: 55 },
    { label: "Intake gesprek", count: 80, percentage: 20 },
    { label: "CV Check", count: 31, percentage: 8 },
    { label: "Geplaatst", count: 5, percentage: 1 },
  ],
  "P13": [
    { label: "Leads", count: 475, percentage: 100 },
    { label: "Eerste contact", count: 265, percentage: 56 },
    { label: "Intake gesprek", count: 98, percentage: 21 },
    { label: "CV Check", count: 40, percentage: 8 },
    { label: "Geplaatst", count: 8, percentage: 2 },
  ],
};

// Opacity values for each stage (top to bottom: 100% for Leads, decreasing for later stages)
const opacityMap = [1, 0.85, 0.7, 0.55, 0.4];

interface RecruitmentFunnelProps {
  delay?: number;
}

export function RecruitmentFunnel({ delay = 0 }: RecruitmentFunnelProps) {
  const [isComparing, setIsComparing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("P1");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const comparisonData = comparisonDataByPeriod[selectedPeriod];

  // Calculate max count for scaling (use max across both datasets)
  const maxCount = useMemo(() => {
    const maxCurrent = Math.max(...currentData.map(d => d.count));
    const maxComparison = Math.max(...comparisonData.map(d => d.count));
    return Math.max(maxCurrent, maxComparison);
  }, [comparisonData]);

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-sm font-medium text-foreground">Wervingstrechter</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Conversie per fase</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Period dropdown - only visible in comparison mode */}
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
            
            {/* Toggle button */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setIsComparing(!isComparing)}
            >
              {isComparing ? "Sluiten" : "Vergelijken"}
            </Button>
          </div>
        </div>

        {/* Funnel stages */}
        <TooltipProvider delayDuration={100}>
          <div className="space-y-4">
            {currentData.map((stage, index) => (
              <FunnelRow
                key={stage.label}
                stage={stage}
                comparisonStage={comparisonData[index]}
                previousStage={index > 0 ? currentData[index - 1] : null}
                previousComparisonStage={index > 0 ? comparisonData[index - 1] : null}
                index={index}
                delay={delay + 300 + getStaggerDelay(index, 100)}
                isComparing={isComparing}
                hoveredIndex={hoveredIndex}
                onHover={setHoveredIndex}
                maxCount={maxCount}
                selectedPeriod={selectedPeriod}
              />
            ))}
          </div>
        </TooltipProvider>

        {/* Scale disclaimer note */}
        <p className="text-[10px] text-muted-foreground/60 text-center mt-3">
          Balklengte geschaald (√) voor leesbaarheid; getallen zijn werkelijke aantallen.
        </p>

        {/* Legend in comparison mode */}
        <div className={cn(
          "flex items-center justify-center gap-6 mt-4 pt-3 border-t border-border transition-all duration-300",
          isComparing ? "opacity-100" : "opacity-0 h-0 mt-0 pt-0 border-0 overflow-hidden"
        )}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-teal" />
            <span className="text-xs text-muted-foreground">Huidig</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-gold" />
            <span className="text-xs text-muted-foreground">{selectedPeriod}</span>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}

interface FunnelRowProps {
  stage: typeof currentData[0];
  comparisonStage: typeof currentData[0];
  previousStage: typeof currentData[0] | null;
  previousComparisonStage: typeof currentData[0] | null;
  index: number;
  delay: number;
  isComparing: boolean;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
  maxCount: number;
  selectedPeriod: string;
}

function FunnelRow({ 
  stage, 
  comparisonStage,
  previousStage,
  previousComparisonStage,
  index, 
  delay, 
  isComparing,
  hoveredIndex,
  onHover,
  maxCount,
  selectedPeriod
}: FunnelRowProps) {
  const { ref, isVisible } = useAnimateOnMount({ delay });
  const opacity = opacityMap[index];
  
  const isHovered = hoveredIndex === index;
  const hasHover = hoveredIndex !== null;
  const isOther = hasHover && !isHovered;

  // Calculate bar widths using square-root scale for visual balance
  const currentWidth = getScaledWidth(stage.count, maxCount);
  const comparisonWidth = getScaledWidth(comparisonStage.count, maxCount);

  // Calculate conversion rates from previous stage
  const currentConversion = previousStage 
    ? Math.round((stage.count / previousStage.count) * 100) 
    : 100;
  const comparisonConversion = previousComparisonStage 
    ? Math.round((comparisonStage.count / previousComparisonStage.count) * 100) 
    : 100;

  const tooltipContent = (
    <div className="space-y-1.5 text-xs">
      <div className="font-medium">{stage.label}</div>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Huidig:</span>
        <span className="font-medium text-teal">{stage.count}</span>
      </div>
      {isComparing && (
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">{selectedPeriod}:</span>
          <span className="font-medium text-gold">{comparisonStage.count}</span>
        </div>
      )}
      {previousStage && (
        <div className="pt-1 border-t border-border">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Conversie:</span>
            <span>
              <span className="text-teal">{currentConversion}%</span>
              {isComparing && (
                <>
                  <span className="text-muted-foreground"> / </span>
                  <span className="text-gold">{comparisonConversion}%</span>
                </>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          ref={ref}
          className={cn(
            "transition-all duration-200 ease-out cursor-default",
            isComparing && isOther && "opacity-80"
          )}
          onMouseEnter={() => isComparing && onHover(index)}
          onMouseLeave={() => onHover(null)}
        >
          {/* Label row - text on same line */}
          <div className="flex items-center justify-between mb-1.5">
            <span className={cn(
              "text-xs transition-all duration-200",
              isComparing && isHovered ? "font-medium text-foreground" : "text-muted-foreground",
              isComparing && isOther && "opacity-80"
            )}>
              {stage.label}
            </span>
            <div className="flex items-center gap-3">
              <AnimatedNumber 
                value={stage.count}
                delay={delay}
                className={cn(
                  "text-xs font-medium transition-all duration-200",
                  isComparing ? "text-teal" : "text-foreground",
                  isComparing && isOther && "opacity-80"
                )}
              />
              {isComparing ? (
                <span className={cn(
                  "text-xs font-medium text-gold transition-all duration-200",
                  isOther && "opacity-80"
                )}>
                  {comparisonStage.count}
                </span>
              ) : (
                <span className={cn(
                  "text-xs text-teal transition-all duration-200",
                  isOther && "opacity-80"
                )}>
                  {stage.percentage}%
                </span>
              )}
            </div>
          </div>

          {/* Horizontal bar container - grows left to right */}
          <div className={cn(
            "relative transition-all duration-300 ease-out overflow-hidden rounded-full",
            isComparing ? "h-5" : "h-2"
          )}>
            {/* Current period bar (teal) - horizontal gradient from light to dark */}
            <div 
              className={cn(
                "absolute left-0 rounded-full transition-all duration-700 ease-out",
                isComparing ? "top-0 h-[40%]" : "top-0 h-full",
                isComparing && isHovered && "brightness-110",
                isComparing && isOther && "brightness-90"
              )}
              style={{ 
                width: isVisible ? `${currentWidth}%` : "0%",
                background: `linear-gradient(to right, hsl(var(--teal) / ${opacity * 0.5}), hsl(var(--teal) / ${opacity}))`,
              }}
            />
            
            {/* Comparison period bar (gold) - only in comparison mode */}
            {isComparing && (
              <div 
                className={cn(
                  "absolute left-0 bottom-0 h-[40%] rounded-full transition-all duration-500 ease-out",
                  isHovered && "brightness-110",
                  isOther && "brightness-90"
                )}
                style={{ 
                  width: isVisible ? `${comparisonWidth}%` : "0%",
                  background: `linear-gradient(to right, hsl(var(--gold) / ${opacity * 0.5}), hsl(var(--gold) / ${opacity}))`,
                }}
              />
            )}

            {/* Center divider line - only in comparison mode */}
            {isComparing && (
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-border/50" />
            )}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-popover border-border">
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
}
