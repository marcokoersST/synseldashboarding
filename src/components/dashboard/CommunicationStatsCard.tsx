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
    totalCalls: 136,
    totalDuration: { hours: 4, minutes: 32, seconds: 15 },
    avgDuration: { hours: 0, minutes: 2, seconds: 0 },
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
      callsPerPlaatsing: 34
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
      callsPerPlaatsing: 16
    }
  }
};

const mailData = {
  passive: {
    sent: 156,
    received: 243,
    total: 399,
    replyRate: 68,
  },
  active: {
    sent: 156,
    received: 243,
    emailsPerDealStage: [
      { code: "2.0", label: "Kandidaat voorgesteld", count: 24 },
      { code: "2.1", label: "Reminder verstuurd", count: 18 },
      { code: "2.3", label: "Lopende zaak", count: 9 },
      { code: "3.0", label: "1e gesprek nog inplannen", count: 15 },
      { code: "3.1", label: "1e sollicitatiegesprek", count: 12 },
      { code: "3.2", label: "Inplannen vervolggesprek", count: 8 },
      { code: "3.3", label: "Vervolggesprek", count: 6 },
      { code: "3.4", label: "Deal sluiter", count: 4 },
    ],
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
  return `${sign}${diff.toFixed(0)}%`;
};

const isPositiveDiff = (diff: number, inverse: boolean = false): boolean => {
  return inverse ? diff < 0 : diff > 0;
};

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
      setTimeout(() => setIsTransitioning(false), 120);
    }, 300);
  };

  return { isDetailMode, isTransitioning, displayMode, toggle };
}

// ─── Compact comparison row for detail mode ───

interface ComparisonRowProps {
  icon: React.ReactNode;
  label: string;
  currentValue: number;
  bestValue: number;
  inverseColors?: boolean;
  delay?: number;
  suffix?: string;
  decimals?: number;
  subtext?: string;
}

function ComparisonRow({
  icon, label, currentValue, bestValue,
  inverseColors = false, delay = 0, suffix, decimals = 0, subtext
}: ComparisonRowProps) {
  const diff = calcPercentageDiff(currentValue, bestValue);
  const positive = isPositiveDiff(diff, inverseColors);

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/30 transition-colors group">
      <div className="flex items-center gap-2 min-w-0">
        {icon}
        <div>
          <span className="text-xs font-medium text-foreground">{label}</span>
          {subtext && <span className="text-[10px] text-muted-foreground block leading-tight">{subtext}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className="text-sm font-semibold text-foreground tabular-nums">
            <AnimatedNumber value={currentValue} delay={delay} decimals={decimals} />
            {suffix && <span className="text-xs text-muted-foreground ml-0.5">{suffix}</span>}
          </span>
        </div>
        <div className="text-right w-8">
          <span className="text-xs text-muted-foreground tabular-nums">{decimals > 0 ? bestValue.toFixed(decimals) : bestValue}</span>
        </div>
        <span className={cn(
          "text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[42px] text-center tabular-nums",
          positive ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
        )}>
          {formatPercentage(diff)}
        </span>
      </div>
    </div>
  );
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
      <WatZieIkHier
        what="Hoeveel je hebt gebeld (in en uit), totale beltijd en hoe die telefonie verdeeld is over de deal-stages."
        insight="Bel je genoeg en lang genoeg om resultaat te halen? Zie meteen waar je telefonie-energie heen gaat."
      />
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Telefonie</h3>
          </div>
          <Button
            variant="ghost" size="icon" onClick={toggle}
            className="h-7 w-7 rounded-full bg-secondary hover:bg-secondary/80"
            title={displayMode ? "Toon minder details" : "Toon meer details"}
          >
            {displayMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>

        <div className={cn(
          "flex-1 transition-all duration-400 ease-in-out",
          isTransitioning ? "opacity-0 scale-[0.97] translate-y-2" : "opacity-100 scale-100 translate-y-0"
        )}>
          {displayMode ? <CallsDetailView delay={delay} /> : <CallsOverviewView delay={delay} />}
        </div>
      </div>
    </AnimatedCard>
  );
}

function CallsOverviewView({ delay }: { delay: number }) {
  const total = callsData.passive.inboundCalls + callsData.passive.outboundCalls;
  const inPct = Math.round((callsData.passive.inboundCalls / total) * 100);
  const outPct = 100 - inPct;

  return (
    <div className="flex flex-col h-full justify-between gap-4">
      {/* Big number hero */}
      <div className="text-center py-2">
        <AnimatedNumber value={total} delay={delay + 100} className="text-4xl font-bold text-foreground" />
        <p className="text-xs text-muted-foreground mt-1">totaal telefonie</p>
      </div>

      {/* Ratio bar */}
      <div>
        <div className="flex h-2 rounded-full overflow-hidden bg-secondary/40">
          <div className="bg-primary/70 rounded-l-full transition-all" style={{ width: `${inPct}%` }} />
          <div className="bg-primary/30 rounded-r-full transition-all" style={{ width: `${outPct}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <PhoneIncoming className="h-3.5 w-3.5 text-primary/70" />
            <span className="text-xs text-muted-foreground">Inkomend</span>
            <span className="text-xs font-semibold text-foreground">{callsData.passive.inboundCalls}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground">{callsData.passive.outboundCalls}</span>
            <span className="text-xs text-muted-foreground">Uitgaand</span>
            <PhoneOutgoing className="h-3.5 w-3.5 text-primary/30" />
          </div>
        </div>
      </div>

      {/* Duration row */}
      <div className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">Totale duur</span>
        </div>
        <span className="text-sm font-semibold text-foreground tabular-nums">{formatDuration(callsData.passive.totalDuration)}</span>
      </div>
    </div>
  );
}

function CallsDetailView({ delay }: { delay: number }) {
  const { current, bestPeriod } = callsData.active;

  return (
    <div className="flex flex-col gap-1">
      {/* Column headers */}
      <div className="flex items-center justify-end px-3 mb-1">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-wider text-primary/70 font-medium w-[40px] text-right">Nu</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium w-8 text-right">{bestPeriod.periodLabel}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium min-w-[42px] text-center">Δ</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-b border-border/50 mx-3 mb-1" />

      {/* Call rows */}
      <ComparisonRow icon={<PhoneIncoming className="h-3.5 w-3.5 text-primary" />} label="Inkomend"
        currentValue={current.inboundCalls} bestValue={bestPeriod.inboundCalls}
        subtext={formatDuration(current.totalTimeInbound)} delay={delay + 100} />
      <ComparisonRow icon={<PhoneOutgoing className="h-3.5 w-3.5 text-primary" />} label="Uitgaand"
        currentValue={current.outboundCalls} bestValue={bestPeriod.outboundCalls}
        subtext={formatDuration(current.totalTimeOutbound)} delay={delay + 120} />
      <ComparisonRow icon={<PhoneMissed className="h-3.5 w-3.5 text-muted-foreground" />} label="Gemist"
        currentValue={current.missedCalls} bestValue={bestPeriod.missedCalls}
        inverseColors delay={delay + 140} />
      <ComparisonRow icon={<PhoneOff className="h-3.5 w-3.5 text-muted-foreground" />} label="Bounced"
        currentValue={current.bouncedCalls} bestValue={bestPeriod.bouncedCalls}
        inverseColors delay={delay + 160} />

      {/* Section label */}
      <div className="border-b border-border/50 mx-3 mt-2 mb-1" />
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium px-3 mb-1">Contact status</span>

      <ComparisonRow icon={<Flame className="h-3.5 w-3.5 text-primary" />} label="Warme relatie"
        currentValue={current.contactStatus.warmRelation} bestValue={bestPeriod.contactStatus.warmRelation}
        delay={delay + 200} />
      <ComparisonRow icon={<Star className="h-3.5 w-3.5 text-primary" />} label="Voorkeurs CP"
        currentValue={current.contactStatus.preferredCP} bestValue={bestPeriod.contactStatus.preferredCP}
        delay={delay + 220} />
      <ComparisonRow icon={<UserPlus className="h-3.5 w-3.5 text-teal" />} label="Nieuw contact"
        currentValue={current.contactStatus.newContact} bestValue={bestPeriod.contactStatus.newContact}
        delay={delay + 240} />

      <div className="border-b border-border/50 mx-3 mt-2 mb-1" />

      <ComparisonRow icon={<Target className="h-3.5 w-3.5 text-primary" />} label="Calls / plaatsing"
        currentValue={current.callsPerPlaatsing} bestValue={bestPeriod.callsPerPlaatsing}
        inverseColors delay={delay + 260} />
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
      <WatZieIkHier
        what="Hoeveel mails je hebt verstuurd, geopend kregen, en hoe ze verdeeld zijn over de deal-stages."
        insight="Volg je je kandidaten en klanten goed op via mail, of laat je kansen liggen?"
      />
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-teal" />
            <h3 className="font-semibold text-foreground">E-mail</h3>
          </div>
          <Button
            variant="ghost" size="icon" onClick={toggle}
            className="h-7 w-7 rounded-full bg-secondary hover:bg-secondary/80"
            title={displayMode ? "Toon minder details" : "Toon meer details"}
          >
            {displayMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>

        <div className={cn(
          "flex-1 transition-all duration-400 ease-in-out",
          isTransitioning ? "opacity-0 scale-[0.97] translate-y-2" : "opacity-100 scale-100 translate-y-0"
        )}>
          {displayMode ? <MailDetailView delay={delay} /> : <MailOverviewView delay={delay} />}
        </div>
      </div>
    </AnimatedCard>
  );
}

function MailOverviewView({ delay }: { delay: number }) {
  const total = mailData.passive.sent + mailData.passive.received;
  const sentPct = Math.round((mailData.passive.sent / total) * 100);
  const recvPct = 100 - sentPct;

  return (
    <div className="flex flex-col h-full justify-between gap-4">
      {/* Big number hero */}
      <div className="text-center py-2">
        <AnimatedNumber value={total} delay={delay + 100} className="text-4xl font-bold text-foreground" />
        <p className="text-xs text-muted-foreground mt-1">totaal e-mails</p>
      </div>

      {/* Ratio bar */}
      <div>
        <div className="flex h-2 rounded-full overflow-hidden bg-secondary/40">
          <div className="bg-teal/70 rounded-l-full transition-all" style={{ width: `${sentPct}%` }} />
          <div className="bg-teal/30 rounded-r-full transition-all" style={{ width: `${recvPct}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <Send className="h-3.5 w-3.5 text-teal/70" />
            <span className="text-xs text-muted-foreground">Verstuurd</span>
            <span className="text-xs font-semibold text-foreground">{mailData.passive.sent}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground">{mailData.passive.received}</span>
            <span className="text-xs text-muted-foreground">Ontvangen</span>
            <Inbox className="h-3.5 w-3.5 text-teal/30" />
          </div>
        </div>
      </div>

      {/* Reply rate row */}
      <div className="flex items-center justify-between bg-secondary/30 rounded-lg px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Reply className="h-3.5 w-3.5 text-teal" />
          <span className="text-xs text-muted-foreground">Reply rate</span>
        </div>
        <span className="text-sm font-semibold text-foreground tabular-nums">{mailData.passive.replyRate}%</span>
      </div>
    </div>
  );
}

function MailDetailView({ delay }: { delay: number }) {
  const d = mailData.active;

  return (
    <div className="flex flex-col gap-1">
      {/* Core metrics as aligned rows */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-3">
        <MetricCell icon={<Send className="h-3.5 w-3.5 text-teal" />} label="Verstuurd" delay={delay + 100}>
          <AnimatedNumber value={d.sent} delay={delay + 100} className="text-lg font-bold text-foreground tabular-nums" />
        </MetricCell>
        <MetricCell icon={<Inbox className="h-3.5 w-3.5 text-teal" />} label="Ontvangen" delay={delay + 120}>
          <AnimatedNumber value={d.received} delay={delay + 120} className="text-lg font-bold text-foreground tabular-nums" />
        </MetricCell>
      </div>

      {/* Emails per dealstage */}
      <div className="border-b border-border/50 mx-1 mb-2" />
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium px-1 mb-2">Emails per dealstage</span>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {d.emailsPerDealStage.map((stage, i) => (
          <div key={stage.code} className="bg-secondary/30 rounded-lg px-3 py-2 hover:bg-secondary/40 transition-colors flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-primary tabular-nums">{stage.code}</span>
              <span className="text-[10px] text-muted-foreground ml-1.5 truncate">{stage.label}</span>
            </div>
            <span className="text-sm font-bold text-foreground tabular-nums ml-2">
              <AnimatedNumber value={stage.count} delay={delay + 140 + i * 20} />
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-b border-border/50 mx-1 mb-2" />
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium px-1 mb-2">Verdieping</span>

      {/* Deeper metrics */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <MetricCell icon={<FileText className="h-3.5 w-3.5 text-teal" />} label="Per procedure" delay={delay + 200}>
          <span className="text-lg font-bold text-foreground tabular-nums">
            <AnimatedNumber value={d.emailsPerProcedure} decimals={1} delay={delay + 200} />
          </span>
        </MetricCell>
        <MetricCell icon={<Briefcase className="h-3.5 w-3.5 text-teal" />} label="Per acquisitie" delay={delay + 220}>
          <span className="text-lg font-bold text-foreground tabular-nums">
            <AnimatedNumber value={d.emailsPerAcquisitie} decimals={1} delay={delay + 220} />
          </span>
        </MetricCell>
        <MetricCell icon={<BarChart3 className="h-3.5 w-3.5 text-teal" />} label="Benchmark" delay={delay + 240}>
          <div className="text-lg font-bold text-foreground tabular-nums leading-tight">
            <AnimatedNumber value={d.jouwGemiddelde} decimals={1} delay={delay + 240} />
          </div>
          <span className="text-[10px] text-muted-foreground">gem. {d.benchmarkGeplaatst}</span>
        </MetricCell>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCell icon={<Reply className="h-3.5 w-3.5 text-teal" />} label="Reply rate" delay={delay + 260}>
          <span className="text-lg font-bold text-foreground tabular-nums">
            <AnimatedNumber value={d.replyRate} delay={delay + 260} />
            <span className="text-xs text-muted-foreground ml-0.5">%</span>
          </span>
        </MetricCell>
        <MetricCell icon={<Timer className="h-3.5 w-3.5 text-teal" />} label="Gem. reactietijd" delay={delay + 280}>
          <span className="text-lg font-bold text-foreground tabular-nums">{formatDuration(d.gemReactietijd)}</span>
        </MetricCell>
      </div>
    </div>
  );
}

// ─── Aligned metric cell for email detail ───

interface MetricCellProps {
  icon: React.ReactNode;
  label: string;
  delay: number;
  children: React.ReactNode;
}

function MetricCell({ icon, label, children }: MetricCellProps) {
  return (
    <div className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/40 transition-colors">
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}
