import { TrendingUp, DollarSign } from "lucide-react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedProgress } from "@/components/animations/AnimatedProgress";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";
import { WatZieIkHier } from "@/components/dashboard/WatZieIkHier";

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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

function SalaryPanel({ delay }: { delay: number }) {
  const currentSalary = 3000;
  const nextSalary = 3500;
  const currentRevenue = 420000;
  const revenueMin = 250000;
  const revenueMax = 500000;
  const currentAnnualSalary = 36000;
  const nextAnnualSalary = 42000;
  const nextStep = 3;

  const progress = Math.max(0, Math.min(((currentRevenue - revenueMin) / (revenueMax - revenueMin)) * 100, 100));
  const amountNeeded = revenueMax - currentRevenue;

  const { ref, isVisible } = useAnimateOnMount({ delay: delay + 300 });

  return (
    <div className="flex-1 p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-base font-medium text-foreground">Voortgang salarisstap</h3>
      </div>

      <div className="mb-1">
        <span className="text-4xl font-bold text-success">
          <AnimatedNumber value={progress} decimals={1} delay={delay + 200} />%
        </span>
        <span className="text-muted-foreground ml-2">van de weg</span>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Nog € {formatCurrency(amountNeeded)} omzet nodig voor volgende stap
      </p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Huidig salaris</p>
          <p className="text-lg font-bold text-foreground">€ <AnimatedNumber value={currentSalary} delay={delay + 300} formatFn={formatCurrency} /></p>
          <p className="text-xs text-muted-foreground">per maand</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Huidige omzet (13 per.)</p>
          <p className="text-lg font-bold text-foreground">€ <AnimatedNumber value={currentRevenue} delay={delay + 400} formatFn={formatCurrency} /></p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1">Volgend salaris</p>
          <p className="text-lg font-bold text-success">€ <AnimatedNumber value={nextSalary} delay={delay + 300} formatFn={formatCurrency} /></p>
          <p className="text-xs text-muted-foreground">per maand</p>
        </div>
      </div>

      <div ref={ref} className="relative mb-2">
        <AnimatedProgress value={progress} delay={delay + 500} barClassName="bg-gradient-to-r from-gold to-success" trackClassName="bg-muted/30" />
        <div className="absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-card rounded-full border-2 border-border shadow-lg flex items-center justify-center transition-all duration-1000 ease-out" style={{ left: isVisible ? `calc(${progress}% - 14px)` : '-14px' }}>
          <span className="text-xs text-muted-foreground font-medium">€</span>
        </div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground mt-3 mb-4">
        <span>€ {formatCurrency(revenueMin)}</span>
        <span>€ {formatCurrency(revenueMax)}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Huidig jaarsalaris</p>
          <p className="text-lg font-bold text-foreground">€ <AnimatedNumber value={currentAnnualSalary} delay={delay + 600} formatFn={formatCurrency} /></p>
          <p className="text-xs text-muted-foreground mt-1">Bij € {formatCurrency(revenueMax)} omzet bereik je stap {nextStep}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Volgend jaarsalaris</p>
          <p className="text-lg font-bold text-success">€ <AnimatedNumber value={nextAnnualSalary} delay={delay + 700} formatFn={formatCurrency} /></p>
        </div>
      </div>
    </div>
  );
}

function BonusPanel({ delay }: { delay: number }) {
  const currentPeriodMargin = 45000;
  const currentYearMargin = 420000;

  const currentOmzetTier = [...omzetBonusTiers].reverse().find(t => currentPeriodMargin >= t.margin) || omzetBonusTiers[0];
  const nextOmzetTier = omzetBonusTiers.find(t => t.margin > currentPeriodMargin) || omzetBonusTiers[omzetBonusTiers.length - 1];
  const currentTargetTier = [...targetBonusTiers].reverse().find(t => currentYearMargin >= t.margin) || targetBonusTiers[0];
  const nextTargetTier = targetBonusTiers.find(t => t.margin > currentYearMargin) || targetBonusTiers[targetBonusTiers.length - 1];

  const progress = Math.max(0, Math.min(((currentPeriodMargin - currentOmzetTier.margin) / (nextOmzetTier.margin - currentOmzetTier.margin)) * 100, 100));
  const amountNeeded = nextOmzetTier.margin - currentPeriodMargin;

  const { ref, isVisible } = useAnimateOnMount({ delay: delay + 300 });

  return (
    <div className="flex-1 p-5">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-base font-medium text-foreground">Voortgang bonusstap</h3>
      </div>

      <div className="mb-1">
        <span className="text-4xl font-bold text-success">
          <AnimatedNumber value={progress} decimals={1} delay={delay + 200} />%
        </span>
        <span className="text-muted-foreground ml-2">van de weg</span>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Nog € {formatCurrency(amountNeeded)} marge nodig voor volgende stap
      </p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Huidige periodebonus</p>
          <p className="text-lg font-bold text-foreground">€ <AnimatedNumber value={currentOmzetTier.bonus} delay={delay + 300} formatFn={formatCurrency} /></p>
          <p className="text-xs text-muted-foreground">per periode</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Huidige periodemarge</p>
          <p className="text-lg font-bold text-foreground">€ <AnimatedNumber value={currentPeriodMargin} delay={delay + 400} formatFn={formatCurrency} /></p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1">Volgende periodebonus</p>
          <p className="text-lg font-bold text-success">€ <AnimatedNumber value={nextOmzetTier.bonus} delay={delay + 300} formatFn={formatCurrency} /></p>
          <p className="text-xs text-muted-foreground">per periode</p>
        </div>
      </div>

      <div ref={ref} className="relative mb-2">
        <AnimatedProgress value={progress} delay={delay + 500} barClassName="bg-gradient-to-r from-gold to-primary" trackClassName="bg-muted/30" />
        <div className="absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-card rounded-full border-2 border-border shadow-lg flex items-center justify-center transition-all duration-1000 ease-out" style={{ left: isVisible ? `calc(${progress}% - 14px)` : '-14px' }}>
          <span className="text-xs text-muted-foreground font-medium">€</span>
        </div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground mt-3 mb-4">
        <span>€ {formatCurrency(currentOmzetTier.margin)}</span>
        <span>€ {formatCurrency(nextOmzetTier.margin)}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Huidige targetbonus (jaar)</p>
          <p className="text-lg font-bold text-foreground">€ <AnimatedNumber value={currentTargetTier.bonus} delay={delay + 600} formatFn={formatCurrency} /></p>
          <p className="text-xs text-muted-foreground mt-1">Bij € {formatCurrency(nextTargetTier.margin)} jaarmarge volgende targetbonus</p>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Volgende targetbonus (jaar)</p>
          <p className="text-lg font-bold text-success">€ <AnimatedNumber value={nextTargetTier.bonus} delay={delay + 700} formatFn={formatCurrency} /></p>
        </div>
      </div>
    </div>
  );
}

export function SalaryProgressCard({ delay = 0 }: SalaryProgressCardProps) {
  return (
    <AnimatedCard delay={delay}>
      <WatZieIkHier
        what="Hoeveel salaris en bonus je tot nu toe verdient en hoe ver je nog van het volgende salaris- of bonusniveau af bent."
        insight="Je ziet meteen hoeveel extra omzet of plaatsingen direct meer geld in je portemonnee opleveren."
      />
      <div className="bg-card rounded-xl border border-border flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
        <SalaryPanel delay={delay} />
        <BonusPanel delay={delay + 100} />
      </div>
    </AnimatedCard>
  );
}
