import { TrendingUp } from "lucide-react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";

interface RevenueTargetCardProps {
  delay?: number;
}

export function RevenueTargetCard({ delay = 0 }: RevenueTargetCardProps) {
  const current = 36000;
  const goal = 40000;
  const remaining = goal - current;
  const percentage = (current / goal) * 100;
  
  const { ref, isVisible } = useAnimateOnMount({ delay: delay + 300 });
  
  // Calculate the stroke dasharray for the semi-circle
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = isVisible ? circumference - (percentage / 100) * circumference : circumference;
  
  return (
    <AnimatedCard delay={delay}>
      <WatZieIkHier
        what="Je maandelijkse omzettarget en hoe ver je daar nu vanaf bent, weergegeven in een ring."
        insight="Eén oogopslag: hoeveel moet ik deze maand nog binnenhalen om mijn target te halen?"
      />
      <div className="bg-card rounded-xl p-5 border border-border group">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Omzet Doelstelling</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Maandelijks target</p>
          </div>
          <div className="flex items-center gap-1.5 text-success text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5 group-hover:animate-bounce-subtle" />
            <span>90%</span>
          </div>
        </div>
        
        {/* Semi-circular Progress */}
        <div ref={ref} className="relative flex justify-center mb-4">
          <svg width="180" height="100" viewBox="0 0 180 100">
            {/* Background arc */}
            <path
              d="M 10 90 A 80 80 0 0 1 170 90"
              fill="none"
              stroke="hsl(var(--progress-bg))"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <path
              d="M 10 90 A 80 80 0 0 1 170 90"
              fill="none"
              stroke="hsl(var(--teal))"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              style={{ 
                filter: isVisible ? 'drop-shadow(0 0 6px hsl(var(--teal)))' : 'none',
                transitionDelay: `${delay}ms`
              }}
            />
          </svg>
          
          {/* Center text */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
            <AnimatedNumber 
              value={current / 1000}
              prefix="€"
              suffix="k"
              delay={delay + 500}
              className="text-2xl font-bold text-foreground"
            />
            <p className="text-xs text-muted-foreground">van €{(goal / 1000).toFixed(0)}k</p>
          </div>
        </div>
        
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="text-center group/stat cursor-pointer">
            <p className="text-xs text-muted-foreground mb-1">Huidige omzet</p>
            <AnimatedNumber 
              value={current}
              prefix="€"
              delay={delay + 600}
              className="text-lg font-semibold text-foreground group-hover/stat:text-teal transition-colors"
            />
          </div>
          <div className="text-center group/stat cursor-pointer">
            <p className="text-xs text-muted-foreground mb-1">Nog te gaan</p>
            <AnimatedNumber 
              value={remaining}
              prefix="€"
              delay={delay + 700}
              className="text-lg font-semibold text-primary group-hover/stat:scale-110 transition-transform inline-block"
            />
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
