import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { useAnimateOnMount, getStaggerDelay } from "@/hooks/useAnimateOnMount";
import { cn } from "@/lib/utils";

const funnelStages = [
  { label: "Leads", count: 450, percentage: 100, width: 100 },
  { label: "Eerste contact", count: 245, percentage: 54, width: 80 },
  { label: "Intake gesprek", count: 89, percentage: 20, width: 60 },
  { label: "CV Check", count: 34, percentage: 8, width: 40 },
  { label: "Geplaatst", count: 5, percentage: 1, width: 20 },
];

interface RecruitmentFunnelProps {
  delay?: number;
}

export function RecruitmentFunnel({ delay = 0 }: RecruitmentFunnelProps) {
  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-foreground">Wervingstrechter</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Conversie per fase</p>
        </div>
        
        <div className="relative">
          {/* Funnel visualization */}
          <div className="flex items-end justify-between gap-2 h-32 mb-4">
            {funnelStages.map((stage, index) => (
              <FunnelBar 
                key={stage.label}
                stage={stage}
                index={index}
                delay={delay + 300 + getStaggerDelay(index, 100)}
              />
            ))}
          </div>
          
          {/* Labels */}
          <div className="flex justify-between gap-2">
            {funnelStages.map((stage, index) => (
              <FunnelLabel 
                key={stage.label}
                stage={stage}
                delay={delay + 500 + getStaggerDelay(index, 80)}
              />
            ))}
          </div>
          
          {/* Connecting lines */}
          <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none">
            <svg className="w-full h-full" preserveAspectRatio="none">
              {funnelStages.slice(0, -1).map((_, index) => {
                const x1 = (100 / funnelStages.length) * (index + 0.5);
                const x2 = (100 / funnelStages.length) * (index + 1.5);
                return (
                  <line
                    key={index}
                    x1={`${x1}%`}
                    y1="50%"
                    x2={`${x2}%`}
                    y2="50%"
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="animate-draw-line"
                    style={{ animationDelay: `${delay + 600 + index * 100}ms` }}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}

interface FunnelBarProps {
  stage: typeof funnelStages[0];
  index: number;
  delay: number;
}

function FunnelBar({ stage, index, delay }: FunnelBarProps) {
  const { ref, isVisible } = useAnimateOnMount({ delay });
  
  return (
    <div 
      ref={ref}
      className="flex-1 flex flex-col items-center group cursor-pointer"
    >
      <div 
        className={cn(
          "w-full rounded-t-lg bg-gradient-to-t from-teal to-teal/60 transition-all duration-700 ease-out origin-bottom",
          "group-hover:from-teal group-hover:to-teal/80 group-hover:shadow-lg"
        )}
        style={{ 
          height: isVisible ? `${stage.width}%` : "0%",
          opacity: 1 - (index * 0.15),
          transitionDelay: `${delay}ms`,
          boxShadow: isVisible ? '0 -4px 20px hsl(var(--teal) / 0.2)' : 'none'
        }}
      />
    </div>
  );
}

interface FunnelLabelProps {
  stage: typeof funnelStages[0];
  delay: number;
}

function FunnelLabel({ stage, delay }: FunnelLabelProps) {
  const { ref, isVisible } = useAnimateOnMount({ delay });
  
  return (
    <div 
      ref={ref}
      className={cn(
        "flex-1 text-center transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      <AnimatedNumber 
        value={stage.count}
        delay={delay}
        className="text-xs font-medium text-foreground"
      />
      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{stage.label}</p>
      <p className="text-[10px] font-medium text-teal mt-0.5">{stage.percentage}%</p>
    </div>
  );
}
