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
  ChevronUp, 
  ChevronDown,
  Maximize2,
  Minimize2,
  Clock,
  Zap,
  PhoneMissed,
  PhoneOff,
  Flame,
  Star,
  UserPlus,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommunicationStatsCardProps {
  delay?: number;
}

type ViewType = 'calls' | 'mail';

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
      }
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
      }
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
    timeToNextAction: { hours: 0, minutes: 45, seconds: 0 }
  }
};

const formatDuration = (duration: Duration) => {
  const h = String(duration.hours).padStart(1, '0');
  const m = String(duration.minutes).padStart(2, '0');
  const s = String(duration.seconds).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

// Helper functions for comparison
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

export function CommunicationStatsCard({ delay = 0 }: CommunicationStatsCardProps) {
  const [currentView, setCurrentView] = useState<ViewType>('calls');
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayMode, setDisplayMode] = useState(false);

  const toggleDetailMode = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    // Fade out current content
    setTimeout(() => {
      const newMode = !isDetailMode;
      setIsDetailMode(newMode);
      setDisplayMode(newMode);
      
      // Reset transition state after content swap
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 150);
  };

  const views: ViewType[] = ['calls', 'mail'];

  const handleNextView = () => {
    const currentIndex = views.indexOf(currentView);
    const nextIndex = (currentIndex + 1) % views.length;
    setCurrentView(views[nextIndex]);
    setIsDetailMode(false);
  };

  const handlePrevView = () => {
    const currentIndex = views.indexOf(currentView);
    const prevIndex = (currentIndex - 1 + views.length) % views.length;
    setCurrentView(views[prevIndex]);
    setIsDetailMode(false);
  };


  return (
    <AnimatedCard delay={delay} className="h-full">
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">
        {/* Header */}
        <div className="glass-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentView === 'calls' ? (
              <Phone className="h-5 w-5 text-primary" />
            ) : (
              <Mail className="h-5 w-5 text-teal" />
            )}
            <h3 className="font-semibold text-foreground">
              {currentView === 'calls' ? 'Gesprekken' : 'E-mail'}
            </h3>
            {isDetailMode && currentView === 'calls' && (
              <div className="flex items-center gap-1.5 ml-2">
                <Trophy className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">
                  vs {callsData.active.bestPeriod.periodLabel} ({callsData.active.bestPeriod.placements} plaatsingen)
                </span>
              </div>
            )}
            {isDetailMode && currentView !== 'calls' && (
              <span className="text-xs text-muted-foreground">(detail)</span>
            )}
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Toggle Active/Passive Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDetailMode}
              className="h-7 w-7 rounded-full bg-secondary hover:bg-secondary/80"
              title={isDetailMode ? "Toon minder details" : "Toon meer details"}
            >
              {isDetailMode ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>
            
            {/* Separator */}
            <div className="w-px h-4 bg-border mx-1" />
            
            {/* Up/Down Navigation */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevView}
              className="h-7 w-7 rounded-full bg-secondary hover:bg-secondary/80"
              title="Vorige"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextView}
              className="h-7 w-7 rounded-full bg-secondary hover:bg-secondary/80"
              title="Volgende"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className={cn(
          "flex-1 transition-all duration-200 ease-out",
          isTransitioning 
            ? "opacity-0 scale-[0.98] translate-y-1" 
            : "opacity-100 scale-100 translate-y-0"
        )}>
          {currentView === 'calls' ? (
            <CallsView isDetailMode={displayMode} delay={delay} />
          ) : (
            <MailView isDetailMode={displayMode} delay={delay} />
          )}
        </div>
      </div>
    </AnimatedCard>
  );
}

interface ViewProps {
  isDetailMode: boolean;
  delay: number;
}

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
}

function ComparisonStatBlock({ 
  icon, 
  label, 
  currentValue, 
  bestValue, 
  showTime,
  currentTime,
  bestTime,
  inverseColors = false,
  delay = 0,
  currentPeriod = "P6",
  bestPeriod = "P3"
}: ComparisonStatBlockProps) {
  const percentageDiff = calcPercentageDiff(currentValue, bestValue);
  const isPositive = isPositiveDiff(percentageDiff, inverseColors);
  
  return (
    <div className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/40 transition-colors">
      {/* Header with label */}
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      
      {/* Two-column comparison layout */}
      <div className="grid grid-cols-2 gap-2">
        {/* Current period column */}
        <div className="border-l-2 border-primary/50 pl-2">
          <span className="text-[10px] uppercase tracking-wide text-primary/70 font-medium">
            Nu ({currentPeriod})
          </span>
          <div className="text-base font-semibold text-foreground">
            <AnimatedNumber value={currentValue} delay={delay} />
          </div>
          {showTime && currentTime && (
            <div className="text-xs text-muted-foreground">
              {formatDuration(currentTime)}
            </div>
          )}
        </div>
        
        {/* Best period column */}
        <div className="border-l-2 border-muted-foreground/30 pl-2">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70 font-medium">
            Best ({bestPeriod})
          </span>
          <div className="text-base font-semibold text-muted-foreground">
            {bestValue}
          </div>
          {showTime && bestTime && (
            <div className="text-xs text-muted-foreground/70">
              {formatDuration(bestTime)}
            </div>
          )}
        </div>
      </div>
      
      {/* Percentage difference badge - subtle colors */}
      <div className="mt-2 flex justify-center">
        <span className={cn(
          "text-[10px] font-medium px-2 py-0.5 rounded-full",
          isPositive 
            ? "bg-success/15 text-success" 
            : "bg-primary/15 text-primary"
        )}>
          {formatPercentage(percentageDiff)}
        </span>
      </div>
    </div>
  );
}

function CallsView({ isDetailMode, delay }: ViewProps) {
  const { current, bestPeriod } = callsData.active;
  
  if (isDetailMode) {
    return (
      <div className="space-y-3">
        {/* Row 1: Call statistics with comparison */}
        <div className="grid grid-cols-4 gap-2">
          {/* Inbound */}
          <ComparisonStatBlock
            icon={<PhoneIncoming className="h-3.5 w-3.5 text-primary" />}
            label="Inkomend"
            currentValue={current.inboundCalls}
            bestValue={bestPeriod.inboundCalls}
            showTime
            currentTime={current.totalTimeInbound}
            bestTime={bestPeriod.totalTimeInbound}
            delay={delay + 100}
            bestPeriod={bestPeriod.periodLabel}
          />
          
          {/* Outbound */}
          <ComparisonStatBlock
            icon={<PhoneOutgoing className="h-3.5 w-3.5 text-primary" />}
            label="Uitgaand"
            currentValue={current.outboundCalls}
            bestValue={bestPeriod.outboundCalls}
            showTime
            currentTime={current.totalTimeOutbound}
            bestTime={bestPeriod.totalTimeOutbound}
            delay={delay + 150}
            bestPeriod={bestPeriod.periodLabel}
          />
          
          {/* Missed */}
          <ComparisonStatBlock
            icon={<PhoneMissed className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Gemist"
            currentValue={current.missedCalls}
            bestValue={bestPeriod.missedCalls}
            inverseColors
            delay={delay + 200}
            bestPeriod={bestPeriod.periodLabel}
          />
          
          {/* Bounced */}
          <ComparisonStatBlock
            icon={<PhoneOff className="h-3.5 w-3.5 text-muted-foreground" />}
            label="Bounced"
            currentValue={current.bouncedCalls}
            bestValue={bestPeriod.bouncedCalls}
            inverseColors
            delay={delay + 250}
            bestPeriod={bestPeriod.periodLabel}
          />
        </div>

        {/* Row 2: Contact Status Breakdown */}
        <div>
          <span className="text-xs text-muted-foreground mb-2 block">
            Contact Status
          </span>
          <div className="grid grid-cols-3 gap-2">
            {/* Warm Relation */}
            <ComparisonStatBlock
              icon={<Flame className="h-3.5 w-3.5 text-primary" />}
              label="Warme relatie"
              currentValue={current.contactStatus.warmRelation}
              bestValue={bestPeriod.contactStatus.warmRelation}
              delay={delay + 300}
              bestPeriod={bestPeriod.periodLabel}
            />
            
            {/* Preferred CP */}
            <ComparisonStatBlock
              icon={<Star className="h-3.5 w-3.5 text-primary" />}
              label="Voorkeurs CP"
              currentValue={current.contactStatus.preferredCP}
              bestValue={bestPeriod.contactStatus.preferredCP}
              delay={delay + 350}
              bestPeriod={bestPeriod.periodLabel}
            />
            
            {/* New Contact */}
            <ComparisonStatBlock
              icon={<UserPlus className="h-3.5 w-3.5 text-teal" />}
              label="Nieuw contact"
              currentValue={current.contactStatus.newContact}
              bestValue={bestPeriod.contactStatus.newContact}
              delay={delay + 400}
              bestPeriod={bestPeriod.periodLabel}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Inbound Calls */}
      <div className="bg-secondary/30 rounded-lg p-4 hover:bg-secondary/40 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <PhoneIncoming className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">Inkomend</span>
        </div>
        <AnimatedNumber 
          value={callsData.passive.inboundCalls} 
          delay={delay + 100}
          className="text-2xl font-bold text-foreground"
        />
      </div>

      {/* Outbound Calls */}
      <div className="bg-secondary/30 rounded-lg p-4 hover:bg-secondary/40 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <PhoneOutgoing className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">Uitgaand</span>
        </div>
        <AnimatedNumber 
          value={callsData.passive.outboundCalls} 
          delay={delay + 150}
          className="text-2xl font-bold text-foreground"
        />
      </div>

      {/* Total Duration */}
      <div className="bg-secondary/30 rounded-lg p-4 hover:bg-secondary/40 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">Totale duur</span>
        </div>
        <span className="text-2xl font-bold text-foreground">
          {formatDuration(callsData.passive.totalDuration)}
        </span>
      </div>
    </div>
  );
}

function MailView({ isDetailMode, delay }: ViewProps) {
  if (isDetailMode) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {/* Sent */}
        <div className="bg-secondary/30 rounded-lg p-4 hover:bg-secondary/40 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Send className="h-4 w-4 text-teal" />
            <span className="text-xs text-muted-foreground">Verstuurd</span>
          </div>
          <AnimatedNumber 
            value={mailData.active.sent} 
            delay={delay + 100}
            className="text-2xl font-bold text-foreground"
          />
        </div>

        {/* Received */}
        <div className="bg-secondary/30 rounded-lg p-4 hover:bg-secondary/40 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Inbox className="h-4 w-4 text-teal" />
            <span className="text-xs text-muted-foreground">Ontvangen</span>
          </div>
          <AnimatedNumber 
            value={mailData.active.received} 
            delay={delay + 150}
            className="text-2xl font-bold text-foreground"
          />
        </div>

        {/* TTFR Score */}
        <div className="bg-secondary/30 rounded-lg p-4 hover:bg-secondary/40 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-teal" />
            <span className="text-xs text-muted-foreground">TTFR Score</span>
          </div>
          <div className="flex items-baseline gap-1">
            <AnimatedNumber 
              value={mailData.active.ttfrScore} 
              decimals={1}
              delay={delay + 200}
              className="text-2xl font-bold text-foreground"
            />
            <span className="text-sm text-muted-foreground">uur</span>
          </div>
        </div>

        {/* Time to Next Action */}
        <div className="bg-secondary/30 rounded-lg p-4 hover:bg-secondary/40 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-teal" />
            <span className="text-xs text-muted-foreground">Volgende actie</span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {formatDuration(mailData.active.timeToNextAction)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Sent */}
      <div className="bg-secondary/30 rounded-lg p-4 hover:bg-secondary/40 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <Send className="h-4 w-4 text-teal" />
          <span className="text-xs text-muted-foreground">Verstuurd</span>
        </div>
        <AnimatedNumber 
          value={mailData.passive.sent} 
          delay={delay + 100}
          className="text-2xl font-bold text-foreground"
        />
      </div>

      {/* Received */}
      <div className="bg-secondary/30 rounded-lg p-4 hover:bg-secondary/40 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <Inbox className="h-4 w-4 text-teal" />
          <span className="text-xs text-muted-foreground">Ontvangen</span>
        </div>
        <AnimatedNumber 
          value={mailData.passive.received} 
          delay={delay + 150}
          className="text-2xl font-bold text-foreground"
        />
      </div>
    </div>
  );
}
