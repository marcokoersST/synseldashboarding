import { TrendingUp } from "lucide-react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedProgress } from "@/components/animations/AnimatedProgress";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";

interface SalaryProgressCardProps {
  delay?: number;
}

export function SalaryProgressCard({ delay = 0 }: SalaryProgressCardProps) {
  // Mock data based on screenshot structure
  const currentSalary = 3000;
  const nextSalary = 3500;
  const currentRevenue = 420000;
  const revenueMin = 250000;
  const revenueMax = 500000;
  const revenueNeeded = revenueMax - currentRevenue;
  const progress = ((currentRevenue - revenueMin) / (revenueMax - revenueMin)) * 100;
  const currentAnnualSalary = 36000;
  const nextAnnualSalary = 42000;
  const nextStep = 3;
  
  const { ref, isVisible } = useAnimateOnMount({ delay: delay + 300 });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', { 
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value);
  };
  
  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-6 border border-border">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-base font-medium text-foreground">Voortgang naar volgende salarisstap</h3>
        </div>
        
        {/* Progress percentage */}
        <div className="mb-2">
          <span className="text-4xl font-bold text-success">
            <AnimatedNumber 
              value={progress} 
              decimals={1}
              delay={delay + 200}
            />%
          </span>
          <span className="text-muted-foreground ml-2">van de weg</span>
        </div>
        
        {/* Revenue needed subtitle */}
        <p className="text-sm text-muted-foreground mb-6">
          Nog € {formatCurrency(revenueNeeded)} omzet nodig voor volgende stap
        </p>
        
        {/* Three column info */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Huidig salaris</p>
            <p className="text-xl font-bold text-foreground">
              € <AnimatedNumber value={currentSalary} delay={delay + 300} formatFn={formatCurrency} />
            </p>
            <p className="text-xs text-muted-foreground">per maand</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Huidige omzet (13 periodes)</p>
            <p className="text-xl font-bold text-foreground">
              € <AnimatedNumber value={currentRevenue} delay={delay + 400} formatFn={formatCurrency} />
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Volgend salaris</p>
            <p className="text-xl font-bold text-success">
              € <AnimatedNumber value={nextSalary} delay={delay + 300} formatFn={formatCurrency} />
            </p>
            <p className="text-xs text-muted-foreground">per maand</p>
          </div>
        </div>
        
        {/* Progress Bar Section */}
        <div ref={ref} className="relative mb-2">
          <AnimatedProgress 
            value={progress} 
            delay={delay + 500}
            barClassName="bg-gradient-to-r from-gold to-success"
            trackClassName="bg-muted/30"
          />
          {/* Progress Indicator with € symbol */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-card rounded-full border-2 border-border shadow-lg flex items-center justify-center transition-all duration-1000 ease-out"
            style={{ 
              left: isVisible ? `calc(${progress}% - 16px)` : '-16px',
            }}
          >
            <span className="text-xs text-muted-foreground font-medium">€</span>
          </div>
          
          {/* Tooltip showing current value */}
          <div 
            className="absolute -bottom-10 transform -translate-x-1/2 bg-foreground text-background text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-1000 ease-out whitespace-nowrap"
            style={{ 
              left: isVisible ? `${progress}%` : '0%',
              opacity: isVisible ? 1 : 0,
            }}
          >
            € {formatCurrency(currentRevenue)}
          </div>
        </div>
        
        {/* Progress range labels */}
        <div className="flex justify-between text-xs text-muted-foreground mt-12 mb-6">
          <span>€ {formatCurrency(revenueMin)}</span>
          <span>€ {formatCurrency(revenueMax)}</span>
        </div>
        
        {/* Annual salary section */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Huidig jaarsalaris</p>
            <p className="text-xl font-bold text-foreground">
              € <AnimatedNumber value={currentAnnualSalary} delay={delay + 600} formatFn={formatCurrency} />
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Bij € {formatCurrency(revenueMax)} omzet bereik je salarisstap {nextStep}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Volgend jaarsalaris</p>
            <p className="text-xl font-bold text-success">
              € <AnimatedNumber value={nextAnnualSalary} delay={delay + 700} formatFn={formatCurrency} />
            </p>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
