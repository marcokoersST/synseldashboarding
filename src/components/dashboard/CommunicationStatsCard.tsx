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
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommunicationStatsCardProps {
  delay?: number;
}

type ViewType = 'calls' | 'mail';

// Mock data
const callsData = {
  passive: {
    inboundCalls: 47,
    outboundCalls: 89,
    totalDuration: { hours: 4, minutes: 32, seconds: 15 }
  },
  active: {
    totalTimeInbound: { hours: 1, minutes: 45, seconds: 30 },
    totalTimeOutbound: { hours: 2, minutes: 46, seconds: 45 }
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
    ttfrScore: 2.4, // uren
    timeToNextAction: { hours: 0, minutes: 45, seconds: 0 }
  }
};

const formatDuration = (duration: { hours: number; minutes: number; seconds: number }) => {
  const h = String(duration.hours).padStart(1, '0');
  const m = String(duration.minutes).padStart(2, '0');
  const s = String(duration.seconds).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export function CommunicationStatsCard({ delay = 0 }: CommunicationStatsCardProps) {
  const [currentView, setCurrentView] = useState<ViewType>('calls');
  const [isDetailMode, setIsDetailMode] = useState(false);

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

  const toggleDetailMode = () => {
    setIsDetailMode(!isDetailMode);
  };

  return (
    <AnimatedCard delay={delay} className="h-full">
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {currentView === 'calls' ? (
              <Phone className="h-5 w-5 text-primary" />
            ) : (
              <Mail className="h-5 w-5 text-teal" />
            )}
            <h3 className="font-semibold text-foreground">
              {currentView === 'calls' ? 'Gesprekken' : 'E-mail'}
            </h3>
            {isDetailMode && (
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
        <div className="transition-all duration-300 flex-1 flex items-center w-full">
          <div className="w-full">
            {currentView === 'calls' ? (
              <CallsView isDetailMode={isDetailMode} delay={delay} />
            ) : (
              <MailView isDetailMode={isDetailMode} delay={delay} />
            )}
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}

interface ViewProps {
  isDetailMode: boolean;
  delay: number;
}

function CallsView({ isDetailMode, delay }: ViewProps) {
  if (isDetailMode) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {/* Inbound Details */}
        <div className="bg-secondary/30 rounded-lg p-4 hover:bg-secondary/40 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <PhoneIncoming className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Inkomend</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Aantal</span>
              <AnimatedNumber 
                value={callsData.passive.inboundCalls} 
                delay={delay + 100}
                className="text-lg font-semibold text-foreground"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Totale tijd</span>
              <span className="text-lg font-semibold text-foreground">
                {formatDuration(callsData.active.totalTimeInbound)}
              </span>
            </div>
          </div>
        </div>

        {/* Outbound Details */}
        <div className="bg-secondary/30 rounded-lg p-4 hover:bg-secondary/40 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <PhoneOutgoing className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Uitgaand</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Aantal</span>
              <AnimatedNumber 
                value={callsData.passive.outboundCalls} 
                delay={delay + 150}
                className="text-lg font-semibold text-foreground"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Totale tijd</span>
              <span className="text-lg font-semibold text-foreground">
                {formatDuration(callsData.active.totalTimeOutbound)}
              </span>
            </div>
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
