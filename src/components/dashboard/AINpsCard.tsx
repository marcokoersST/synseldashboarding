import { Bot, Star, TrendingUp } from "lucide-react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { AnimatedRing } from "@/components/animations/AnimatedRing";
import { useAnimateOnMount, getStaggerDelay } from "@/hooks/useAnimateOnMount";
import { cn } from "@/lib/utils";

interface AINpsCardProps {
  delay?: number;
}

const feedbackItems = [
  { label: "Communicatie", score: 8.9 },
  { label: "Snelheid", score: 8.4 },
  { label: "Matching kwaliteit", score: 9.1 },
  { label: "Professionaliteit", score: 8.7 },
];

export function AINpsCard({ delay = 0 }: AINpsCardProps) {
  const npsScore = 8.8;
  const totalResponses = 47;
  const trend = "+5%";
  
  const { ref, isVisible } = useAnimateOnMount({ delay: delay + 200 });
  
  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border group h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">AI NPS Score</h3>
              <p className="text-xs text-muted-foreground">Kandidaat tevredenheid</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-success text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5 group-hover:animate-bounce-subtle" />
            <span>{trend}</span>
          </div>
        </div>
        
        {/* Main Score Ring */}
        <div ref={ref} className="flex items-center justify-center mb-4">
          <div className="relative">
            <AnimatedRing 
              value={npsScore}
              max={10}
              size={100}
              strokeWidth={8}
              delay={delay + 300}
              strokeColor="hsl(var(--primary))"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <AnimatedNumber 
                  value={npsScore}
                  decimals={1}
                  delay={delay + 500}
                  className="text-2xl font-bold text-foreground"
                />
                <p className="text-xs text-muted-foreground">/10</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Bot className="w-3 h-3" />
            <span>AI Geanalyseerd</span>
            <span className="text-muted-foreground">• {totalResponses} reacties</span>
          </div>
        </div>
        
        {/* Feedback Breakdown */}
        <div className="space-y-2.5 flex-1">
          {feedbackItems.map((item, index) => (
            <div 
              key={item.label}
              className={cn(
                "flex items-center justify-between p-2 rounded-lg transition-all duration-300",
                "hover:bg-muted/50 cursor-pointer group/item"
              )}
            >
              <div className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-gold fill-gold/50 group-hover/item:fill-gold transition-all" />
                <span className="text-xs text-muted-foreground group-hover/item:text-foreground transition-colors">
                  {item.label}
                </span>
              </div>
              <AnimatedNumber 
                value={item.score}
                decimals={1}
                delay={delay + 600 + getStaggerDelay(index, 80)}
                className="text-xs font-semibold text-foreground"
              />
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="pt-3 mt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Gebaseerd op AI-analyse van kandidaat feedback deze periode
          </p>
        </div>
      </div>
    </AnimatedCard>
  );
}
