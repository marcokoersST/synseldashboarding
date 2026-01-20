import { TrendingUp } from "lucide-react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedProgress } from "@/components/animations/AnimatedProgress";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";

interface SalaryProgressCardProps {
  delay?: number;
}

export function SalaryProgressCard({ delay = 0 }: SalaryProgressCardProps) {
  const progress = 68;
  const current = 3000;
  const goal = 3500;
  const annual = 42000;
  
  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border group">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Salaristrap Progressie</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Op weg naar je volgende salaristrap</p>
          </div>
          <div className="flex items-center gap-1.5 text-success text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5 group-hover:animate-bounce-subtle" />
            <span>+12%</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative mb-3">
          <AnimatedProgress 
            value={progress} 
            delay={delay + 300}
            barClassName="bg-gradient-to-r from-primary to-gold"
          />
          {/* Progress Indicator */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-gold rounded-full border-2 border-card shadow-md transition-all duration-1000 ease-out animate-pulse-subtle"
            style={{ 
              left: `calc(${progress}% - 8px)`,
              transitionDelay: `${delay + 300}ms`
            }}
          />
        </div>
        
        {/* Labels */}
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-muted-foreground">Huidig: </span>
            <AnimatedNumber 
              value={current} 
              prefix="€" 
              delay={delay + 400}
              className="font-semibold text-foreground"
            />
          </div>
          <div className="text-center">
            <AnimatedNumber 
              value={progress} 
              suffix="%" 
              delay={delay + 500}
              className="font-bold text-lg text-primary"
            />
          </div>
          <div className="text-right">
            <span className="text-muted-foreground">Doel: </span>
            <AnimatedNumber 
              value={goal} 
              prefix="€" 
              delay={delay + 400}
              className="font-semibold text-foreground"
            />
          </div>
        </div>
        
        {/* Annual salary note */}
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Jaarsalaris doel: <AnimatedNumber 
              value={annual} 
              prefix="€" 
              delay={delay + 600}
              className="font-semibold text-foreground"
            />
          </p>
        </div>
      </div>
    </AnimatedCard>
  );
}
