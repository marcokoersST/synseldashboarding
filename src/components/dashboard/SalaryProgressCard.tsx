import { useState } from "react";
import { TrendingUp, DollarSign } from "lucide-react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedProgress } from "@/components/animations/AnimatedProgress";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";

interface SalaryProgressCardProps {
  delay?: number;
}

const omzetBonusTiers = [
  { margin: 10000, bonus: 200 },
  { margin: 20000, bonus: 300 },
  { margin: 30000, bonus: 500 },
  { margin: 40000, bonus: 700 },
  { margin: 50000, bonus: 1000 },
  { margin: 60000, bonus: 1500 },
  { margin: 80000, bonus: 2500 },
  { margin: 100000, bonus: 4000 },
  { margin: 120000, bonus: 6000 },
  { margin: 140000, bonus: 8000 },
  { margin: 160000, bonus: 10000 },
];

const targetBonusTiers = [
  { margin: 250000, bonus: 1000 },
  { margin: 500000, bonus: 3000 },
  { margin: 750000, bonus: 7500 },
  { margin: 1000000, bonus: 15000 },
  { margin: 1250000, bonus: 22500 },
  { margin: 1500000, bonus: 30000 },
  { margin: 2000000, bonus: 40000 },
];

export function SalaryProgressCard({ delay = 0 }: SalaryProgressCardProps) {
  const [mode, setMode] = useState<'salary' | 'bonus'>('salary');

  // Salary mock data
  const currentSalary = 3000;
  const nextSalary = 3500;
  const currentRevenue = 420000;
  const revenueMin = 250000;
  const revenueMax = 500000;
  const currentAnnualSalary = 36000;
  const nextAnnualSalary = 42000;
  const nextStep = 3;

  // Bonus mock data (margin-based)
  const currentPeriodMargin = 45000;
  const currentYearMargin = 420000;

  // Bonus calculations
  const currentOmzetTier = [...omzetBonusTiers].reverse().find(t => currentPeriodMargin >= t.margin) || omzetBonusTiers[0];
  const nextOmzetTier = omzetBonusTiers.find(t => t.margin > currentPeriodMargin) || omzetBonusTiers[omzetBonusTiers.length - 1];
  const currentTargetTier = [...targetBonusTiers].reverse().find(t => currentYearMargin >= t.margin) || targetBonusTiers[0];
  const nextTargetTier = targetBonusTiers.find(t => t.margin > currentYearMargin) || targetBonusTiers[targetBonusTiers.length - 1];

  // Derived values based on mode
  const isSalary = mode === 'salary';

  const progressValue = isSalary
    ? ((currentRevenue - revenueMin) / (revenueMax - revenueMin)) * 100
    : ((currentPeriodMargin - currentOmzetTier.margin) / (nextOmzetTier.margin - currentOmzetTier.margin)) * 100;

  const progress = Math.max(0, Math.min(progressValue, 100));

  const amountNeeded = isSalary
    ? revenueMax - currentRevenue
    : nextOmzetTier.margin - currentPeriodMargin;

  const rangeMin = isSalary ? revenueMin : currentOmzetTier.margin;
  const rangeMax = isSalary ? revenueMax : nextOmzetTier.margin;
  const currentMiddleValue = isSalary ? currentRevenue : currentPeriodMargin;

  const leftValue = isSalary ? currentSalary : currentOmzetTier.bonus;
  const rightValue = isSalary ? nextSalary : nextOmzetTier.bonus;

  const bottomLeftValue = isSalary ? currentAnnualSalary : currentTargetTier.bonus;
  const bottomRightValue = isSalary ? nextAnnualSalary : nextTargetTier.bonus;

  const { ref, isVisible } = useAnimateOnMount({ delay: delay + 300 });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border">
        {/* Header with inline toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {mode === 'salary'
              ? <TrendingUp className="w-5 h-5 text-muted-foreground" />
              : <DollarSign className="w-5 h-5 text-muted-foreground" />
            }
            <h3 className="text-base font-medium text-foreground">
              {mode === 'salary' ? "Voortgang naar volgende salarisstap" : "Voortgang naar volgende bonusstap"}
            </h3>
          </div>
          <div className="flex rounded-md bg-muted/50 p-0.5 gap-0.5 opacity-60 hover:opacity-100 transition-all">
            <button
              onClick={() => setMode(mode === 'salary' ? 'bonus' : 'salary')}
              className={`p-1 rounded transition-colors ${mode === 'salary' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMode(mode === 'salary' ? 'bonus' : 'salary')}
              className={`p-1 rounded transition-colors ${mode === 'bonus' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <DollarSign className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress percentage */}
        <div className="mb-1">
          <span className="text-4xl font-bold text-success">
            <AnimatedNumber value={progress} decimals={1} delay={delay + 200} />%
          </span>
          <span className="text-muted-foreground ml-2">van de weg</span>
        </div>

        {/* Subtitle */}
        <p className="text-sm text-muted-foreground mb-4">
          Nog € {formatCurrency(amountNeeded)} {isSalary ? "omzet" : "marge"} nodig voor volgende stap
        </p>

        {/* Three column info */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              {isSalary ? "Huidig salaris" : "Huidige periodebonus"}
            </p>
            <p className="text-xl font-bold text-foreground">
              € <AnimatedNumber value={leftValue} delay={delay + 300} formatFn={formatCurrency} />
            </p>
            {isSalary && <p className="text-xs text-muted-foreground">per maand</p>}
            {!isSalary && <p className="text-xs text-muted-foreground">per periode</p>}
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">
              {isSalary ? "Huidige omzet (13 periodes)" : "Huidige periodemarge"}
            </p>
            <p className="text-xl font-bold text-foreground">
              € <AnimatedNumber value={currentMiddleValue} delay={delay + 400} formatFn={formatCurrency} />
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">
              {isSalary ? "Volgend salaris" : "Volgende periodebonus"}
            </p>
            <p className="text-xl font-bold text-success">
              € <AnimatedNumber value={rightValue} delay={delay + 300} formatFn={formatCurrency} />
            </p>
            {isSalary && <p className="text-xs text-muted-foreground">per maand</p>}
            {!isSalary && <p className="text-xs text-muted-foreground">per periode</p>}
          </div>
        </div>

        {/* Progress Bar Section */}
        <div ref={ref} className="relative mb-2">
          <AnimatedProgress
            value={progress}
            delay={delay + 500}
            barClassName={isSalary ? "bg-gradient-to-r from-gold to-success" : "bg-gradient-to-r from-gold to-primary"}
            trackClassName="bg-muted/30"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-card rounded-full border-2 border-border shadow-lg flex items-center justify-center transition-all duration-1000 ease-out"
            style={{ left: isVisible ? `calc(${progress}% - 16px)` : '-16px' }}
          >
            <span className="text-xs text-muted-foreground font-medium">€</span>
          </div>
        </div>

        {/* Progress range labels */}
        <div className="flex justify-between text-xs text-muted-foreground mt-3 mb-4">
          <span>€ {formatCurrency(rangeMin)}</span>
          <span>€ {formatCurrency(rangeMax)}</span>
        </div>

        {/* Bottom section */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              {isSalary ? "Huidig jaarsalaris" : "Huidige targetbonus (jaar)"}
            </p>
            <p className="text-xl font-bold text-foreground">
              € <AnimatedNumber value={bottomLeftValue} delay={delay + 600} formatFn={formatCurrency} />
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {isSalary
                ? `Bij € ${formatCurrency(revenueMax)} omzet bereik je salarisstap ${nextStep}`
                : `Bij € ${formatCurrency(nextTargetTier.margin)} jaarmarge bereik je de volgende targetbonus`
              }
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              {isSalary ? "Volgend jaarsalaris" : "Volgende targetbonus (jaar)"}
            </p>
            <p className="text-xl font-bold text-success">
              € <AnimatedNumber value={bottomRightValue} delay={delay + 700} formatFn={formatCurrency} />
            </p>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
