import { TrendingUp } from "lucide-react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { AnimatedProgress } from "@/components/animations/AnimatedProgress";
import { AnimatedRing } from "@/components/animations/AnimatedRing";
import { getStaggerDelay } from "@/hooks/useAnimateOnMount";

const metrics = [
  { label: "Activiteit", value: 8.5, color: "bg-teal" },
  { label: "Conversie", value: 8.2, color: "bg-primary" },
  { label: "Omzet", value: 9.4, color: "bg-success" },
];

interface PerformanceScoreCardProps {
  delay?: number;
}

export function PerformanceScoreCard({ delay = 0 }: PerformanceScoreCardProps) {
  const overallScore = 8.7;
  
  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border group">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Prestatie Score</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Totale prestatie indicator</p>
          </div>
          <div className="flex items-center gap-1.5 text-success text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5 group-hover:animate-bounce-subtle" />
            <span>+12%</span>
          </div>
        </div>
        
        {/* Main Score */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <AnimatedRing 
              value={overallScore}
              max={10}
              size={112}
              strokeWidth={8}
              delay={delay + 300}
              strokeColor="hsl(var(--teal))"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <AnimatedNumber 
                  value={overallScore}
                  decimals={1}
                  delay={delay + 500}
                  className="text-3xl font-bold text-foreground"
                />
                <p className="text-xs text-muted-foreground">/10</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Metric bars */}
        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <div key={metric.label} className="group/metric cursor-pointer">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground group-hover/metric:text-foreground transition-colors">
                  {metric.label}
                </span>
                <AnimatedNumber 
                  value={metric.value}
                  suffix="/10"
                  decimals={1}
                  delay={delay + 600 + getStaggerDelay(index, 100)}
                  className="text-xs font-medium text-foreground"
                />
              </div>
              <AnimatedProgress 
                value={metric.value}
                max={10}
                delay={delay + 500 + getStaggerDelay(index, 100)}
                className="h-1.5 group-hover/metric:h-2 transition-all"
                barClassName={metric.color}
              />
            </div>
          ))}
        </div>
      </div>
    </AnimatedCard>
  );
}
