import { useState } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing, 
  Mail, 
  Send,
  Inbox,
  Maximize2,
  Minimize2,
  Clock,
  Zap,
  PhoneMissed,
  PhoneOff,
  Flame,
  Star,
  UserPlus,
  Trophy,
  Target,
  FileText,
  Briefcase,
  BarChart3,
  Reply,
  Timer
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Duration {
  hours: number;
  minutes: number;
  seconds: number;
}

// Mock data
const callsData = {
  passive: {
    inboundCalls: 47,
    outboundCalls: 89,
    totalDuration: { hours: 4, minutes: 32, seconds: 15 }
  },
  active: {
    current: {
      inboundCalls: 47,
      outboundCalls: 89,
      missedCalls: 12,
      bouncedCalls: 8,
      totalTimeInbound: { hours: 1, minutes: 45, seconds: 30 },
      totalTimeOutbound: { hours: 2, minutes: 46, seconds: 45 },
      contactStatus: {
        warmRelation: 34,
        preferredCP: 52,
        newContact: 50
      },
      callsPerPlaatsing: 34 // 136 calls / 4 plaatsingen
    },
    bestPeriod: {
      periodLabel: "P3",
      placements: 8,
      inboundCalls: 52,
      outboundCalls: 79,
      missedCalls: 6,
      bouncedCalls: 4,
      totalTimeInbound: { hours: 2, minutes: 10, seconds: 15 },
      totalTimeOutbound: { hours: 3, minutes: 15, seconds: 0 },
      contactStatus: {
        warmRelation: 42,
        preferredCP: 48,
        newContact: 35
      },
      callsPerPlaatsing: 16 // 131 calls / 8 plaatsingen
    }
  }
};

const mailData = {
  passive: {
    sent: 156,
    received: 243
  },
  active: {
    sent: 156,
    received: 243,
    ttfrScore: 2.4,
    timeToNextAction: { hours: 0, minutes: 45, seconds: 0 },
    emailsPerProcedure: 12.4,
    emailsPerAcquisitie: 8.7,
    benchmarkGeplaatst: 18.2,
    jouwGemiddelde: 14.6,
    replyRate: 68,
    gemReactietijd: { hours: 0, minutes: 32, seconds: 0 }
  }
};

const formatDuration = (duration: Duration) => {
  const h = String(duration.hours).padStart(1, '0');
  const m = String(duration.minutes).padStart(2, '0');
  const s = String(duration.seconds).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const calcPercentageDiff = (current: number, best: number): number => {
  if (best === 0) return current > 0 ? 100 : 0;
  return ((current - best) / best) * 100;
};

const formatPercentage = (diff: number): string => {
  const sign = diff > 0 ? '+' : '';
  return `${sign}${diff.toFixed(1)}%`;
};

const isPositiveDiff = (diff: number, inverse: boolean = false): boolean => {
  return inverse ? diff < 0 : diff > 0;
};

// ─── Shared Components ───

interface ComparisonStatBlockProps {
  icon: React.ReactNode;
  label: string;
  currentValue: number;
  bestValue: number;
  showTime?: boolean;
  currentTime?: Duration;
  bestTime?: Duration;
  inverseColors?: boolean;
  delay?: number;
  currentPeriod?: string;
  bestPeriod?: string;
  decimals?: number;
  suffix?: string;
}

function ComparisonStatBlock({ 
  icon, label, currentValue, bestValue, 
  showTime, currentTime, bestTime,
  inverseColors = false, delay = 0,
  currentPeriod = "P6", bestPeriod = "P3",
  decimals = 0, suffix
}: ComparisonStatBlockProps) {
  const percentageDiff = calcPercentageDiff(currentValue, bestValue);
  const isPositive = isPositiveDiff(percentageDiff, inverseColors);
  
  return (
    <div className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/40 transition-colors">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="border-l-2 border-primary/50 pl-2">
          <span className="text-[10px] uppercase tracking-wide text-primary/70 font-medium">
            Nu ({currentPeriod})
          </span>
          <div className="text-base font-semibold text-foreground">
            <AnimatedNumber value={currentValue} delay={delay} decimals={decimals} />
            {suffix && <span className="text-xs text-muted-foreground ml-0.5">{suffix}</span>}
          </div>
          {showTime && currentTime && (
            <div className="text-xs text-muted-foreground">{formatDuration(currentTime)}</div>
          )}
        </div>
        <div className="border-l-2 border-muted-foreground/30 pl-2">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70 font-medium">
            Best ({bestPeriod})
          </span>
          <div className="text-base font-semibold text-muted-foreground">
            {decimals > 0 ? bestValue.toFixed(decimals) : bestValue}
            {suffix && <span className="text-xs text-muted-foreground/70 ml-0.5">{suffix}</span>}
          </div>
          {showTime && bestTime && (
            <div className="text-xs text-muted-foreground/70">{formatDuration(bestTime)}</div>
          )}
        </div>
      </div>
      <div className="mt-2 flex justify-center">
        <span className={cn(
          "text-[10px] font-medium px-2 py-0.5 rounded-full",
          isPositive ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
        )}>
          {formatPercentage(percentageDiff)}
        </span>
      </div>
    </div>
  );
}

// ─── Shared toggle hook ───

function useDetailToggle() {
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayMode, setDisplayMode] = useState(false);

  const toggle = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      const newMode = !isDetailMode;
      setIsDetailMode(newMode);
      setDisplayMode(newMode);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  return { isDetailMode, isTransitioning, displayMode, toggle };
}

// ═══════════════════════════════════════
// CallsStatsCard
// ═══════════════════════════════════════

interface CardProps {
  delay?: number;
}

export function CallsStatsCard({ delay = 0 }: CardProps) {
  const { isTransitioning, displayMode, toggle } = useDetailToggle();

  return (
    <AnimatedCard delay={delay} className="h-full">
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Gesprekken</h3>
            {displayMode && (
              <div className="flex items-center gap-1.5 ml-2">
                <Trophy className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">
                  vs {callsData.active.bestPeriod.periodLabel} ({callsData.active.bestPeriod.placements} plaatsingen)
                </span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-7 w-7 rounded-full bg-secondary hover:bg-secondary/80"
            title={displayMode ? "Toon minder details" : "Toon meer details"}
          >
            {displayMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>

        <div className={cn(
          "flex-1 transition-all duration-200 ease-out",
          isTransitioning ? "opacity-0 scale-[0.98] translate-y-1" : "opacity-100 scale-100 translate-y-0"
        )}>
          {displayMode ? <CallsDetailView delay={delay} /> : <CallsOverviewView delay={delay} />}
        </div>
      </div>
    </AnimatedCard>
  );
}

function CallsOverviewView({ delay }: { delay: number }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/40 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <PhoneIncoming className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">Inkomend</span>
        </div>
        <AnimatedNumber value={callsData.passive.inboundCalls} delay={delay + 100} className="text-2xl font-bold text-foreground" />
      </div>
      <div className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/40 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <PhoneOutgoing className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">Uitgaand</span>
        </div>
        <AnimatedNumber value={callsData.passive.outboundCalls} delay={delay + 150} className="text-2xl font-bold text-foreground" />
      </div>
      <div className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/40 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">Totale duur</span>
        </div>
        <span className="text-2xl font-bold text-foreground">{formatDuration(callsData.passive.totalDuration)}</span>
      </div>
    </div>
  );
}

function CallsDetailView({ delay }: { delay: number }) {
  const { current, bestPeriod } = callsData.active;

  return (
    <div className="space-y-3">
      {/* Row 1: Call stats */}
      <div className="grid grid-cols-4 gap-2">
        <ComparisonStatBlock icon={<PhoneIncoming className="h-3.5 w-3.5 text-primary" />} label="Inkomend"
          currentValue={current.inboundCalls} bestValue={bestPeriod.inboundCalls}
          showTime currentTime={current.totalTimeInbound} bestTime={bestPeriod.totalTimeInbound}
          delay={delay + 100} bestPeriod={bestPeriod.periodLabel} />
        <ComparisonStatBlock icon={<PhoneOutgoing className="h-3.5 w-3.5 text-primary" />} label="Uitgaand"
          currentValue={current.outboundCalls} bestValue={bestPeriod.outboundCalls}
          showTime currentTime={current.totalTimeOutbound} bestTime={bestPeriod.totalTimeOutbound}
          delay={delay + 150} bestPeriod={bestPeriod.periodLabel} />
        <ComparisonStatBlock icon={<PhoneMissed className="h-3.5 w-3.5 text-muted-foreground" />} label="Gemist"
          currentValue={current.missedCalls} bestValue={bestPeriod.missedCalls}
          inverseColors delay={delay + 200} bestPeriod={bestPeriod.periodLabel} />
        <ComparisonStatBlock icon={<PhoneOff className="h-3.5 w-3.5 text-muted-foreground" />} label="Bounced"
          currentValue={current.bouncedCalls} bestValue={bestPeriod.bouncedCalls}
          inverseColors delay={delay + 250} bestPeriod={bestPeriod.periodLabel} />
      </div>

      {/* Row 2: Contact Status + Calls per plaatsing */}
      <div>
        <span className="text-xs text-muted-foreground mb-2 block">Contact Status</span>
        <div className="grid grid-cols-4 gap-2">
          <ComparisonStatBlock icon={<Flame className="h-3.5 w-3.5 text-primary" />} label="Warme relatie"
            currentValue={current.contactStatus.warmRelation} bestValue={bestPeriod.contactStatus.warmRelation}
            delay={delay + 300} bestPeriod={bestPeriod.periodLabel} />
          <ComparisonStatBlock icon={<Star className="h-3.5 w-3.5 text-primary" />} label="Voorkeurs CP"
            currentValue={current.contactStatus.preferredCP} bestValue={bestPeriod.contactStatus.preferredCP}
            delay={delay + 350} bestPeriod={bestPeriod.periodLabel} />
          <ComparisonStatBlock icon={<UserPlus className="h-3.5 w-3.5 text-teal" />} label="Nieuw contact"
            currentValue={current.contactStatus.newContact} bestValue={bestPeriod.contactStatus.newContact}
            delay={delay + 400} bestPeriod={bestPeriod.periodLabel} />
          <ComparisonStatBlock icon={<Target className="h-3.5 w-3.5 text-primary" />} label="Calls / plaatsing"
            currentValue={current.callsPerPlaatsing} bestValue={bestPeriod.callsPerPlaatsing}
            inverseColors delay={delay + 450} bestPeriod={bestPeriod.periodLabel} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// EmailStatsCard
// ═══════════════════════════════════════

export function EmailStatsCard({ delay = 0 }: CardProps) {
  const { isTransitioning, displayMode, toggle } = useDetailToggle();

  return (
    <AnimatedCard delay={delay} className="h-full">
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-teal" />
            <h3 className="font-semibold text-foreground">E-mail</h3>
            {displayMode && <span className="text-xs text-muted-foreground">(detail)</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-7 w-7 rounded-full bg-secondary hover:bg-secondary/80"
            title={displayMode ? "Toon minder details" : "Toon meer details"}
          >
            {displayMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>

        <div className={cn(
          "flex-1 transition-all duration-200 ease-out",
          isTransitioning ? "opacity-0 scale-[0.98] translate-y-1" : "opacity-100 scale-100 translate-y-0"
        )}>
          {displayMode ? <MailDetailView delay={delay} /> : <MailOverviewView delay={delay} />}
        </div>
      </div>
    </AnimatedCard>
  );
}

function MailOverviewView({ delay }: { delay: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/40 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <Send className="h-4 w-4 text-teal" />
          <span className="text-xs text-muted-foreground">Verstuurd</span>
        </div>
        <AnimatedNumber value={mailData.passive.sent} delay={delay + 100} className="text-2xl font-bold text-foreground" />
      </div>
      <div className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/40 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <Inbox className="h-4 w-4 text-teal" />
          <span className="text-xs text-muted-foreground">Ontvangen</span>
        </div>
        <AnimatedNumber value={mailData.passive.received} delay={delay + 150} className="text-2xl font-bold text-foreground" />
      </div>
    </div>
  );
}

function MailDetailView({ delay }: { delay: number }) {
  const d = mailData.active;

  return (
    <div className="space-y-3">
      {/* Row 1: Core stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/40 transition-colors">
          <div className="flex items-center gap-1.5 mb-2">
            <Send className="h-3.5 w-3.5 text-teal" />
            <span className="text-xs text-muted-foreground">Verstuurd</span>
          </div>
          <AnimatedNumber value={d.sent} delay={delay + 100} className="text-lg font-bold text-foreground" />
        </div>
        <div className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/40 transition-colors">
          <div className="flex items-center gap-1.5 mb-2">
            <Inbox className="h-3.5 w-3.5 text-teal" />
            <span className="text-xs text-muted-foreground">Ontvangen</span>
          </div>
          <AnimatedNumber value={d.received} delay={delay + 150} className="text-lg font-bold text-foreground" />
        </div>
        <div className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/40 transition-colors">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="h-3.5 w-3.5 text-teal" />
            <span className="text-xs text-muted-foreground">TTFR Score</span>
          </div>
          <div className="flex items-baseline gap-1">
            <AnimatedNumber value={d.ttfrScore} decimals={1} delay={delay + 200} className="text-lg font-bold text-foreground" />
            <span className="text-xs text-muted-foreground">uur</span>
          </div>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/40 transition-colors">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="h-3.5 w-3.5 text-teal" />
            <span className="text-xs text-muted-foreground">Volgende actie</span>
          </div>
          <span className="text-lg font-bold text-foreground">{formatDuration(d.timeToNextAction)}</span>
        </div>
      </div>

      {/* Row 2: Verdiepende KPI's */}
      <div>
        <span className="text-xs text-muted-foreground mb-2 block">Verdieping</span>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/40 transition-colors">
            <div className="flex items-center gap-1.5 mb-2">
              <FileText className="h-3.5 w-3.5 text-teal" />
              <span className="text-xs text-muted-foreground">Per procedure</span>
            </div>
            <div className="flex items-baseline gap-1">
              <AnimatedNumber value={d.emailsPerProcedure} decimals={1} delay={delay + 300} className="text-lg font-bold text-foreground" />
              <span className="text-[10px] text-muted-foreground">gem.</span>
            </div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/40 transition-colors">
            <div className="flex items-center gap-1.5 mb-2">
              <Briefcase className="h-3.5 w-3.5 text-teal" />
              <span className="text-xs text-muted-foreground">Per acquisitie</span>
            </div>
            <div className="flex items-baseline gap-1">
              <AnimatedNumber value={d.emailsPerAcquisitie} decimals={1} delay={delay + 350} className="text-lg font-bold text-foreground" />
              <span className="text-[10px] text-muted-foreground">gem.</span>
            </div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/40 transition-colors">
            <div className="flex items-center gap-1.5 mb-2">
              <BarChart3 className="h-3.5 w-3.5 text-teal" />
              <span className="text-xs text-muted-foreground">Benchmark</span>
            </div>
            <div className="text-lg font-bold text-foreground">
              <AnimatedNumber value={d.jouwGemiddelde} decimals={1} delay={delay + 400} />
              <span className="text-[10px] text-muted-foreground ml-1">/ {d.benchmarkGeplaatst}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Reply rate + Reactietijd */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/40 transition-colors">
          <div className="flex items-center gap-1.5 mb-2">
            <Reply className="h-3.5 w-3.5 text-teal" />
            <span className="text-xs text-muted-foreground">Reply rate</span>
          </div>
          <div className="flex items-baseline gap-1">
            <AnimatedNumber value={d.replyRate} delay={delay + 450} className="text-lg font-bold text-foreground" />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/40 transition-colors">
          <div className="flex items-center gap-1.5 mb-2">
            <Timer className="h-3.5 w-3.5 text-teal" />
            <span className="text-xs text-muted-foreground">Gem. reactietijd</span>
          </div>
          <span className="text-lg font-bold text-foreground">{formatDuration(d.gemReactietijd)}</span>
        </div>
      </div>
    </div>
  );
}
