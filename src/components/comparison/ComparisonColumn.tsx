import { TeamMember, REVENUE_GOAL } from "@/data/teamData";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { AnimatedProgress } from "@/components/animations/AnimatedProgress";
import { AnimatedRing } from "@/components/animations/AnimatedRing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonColumnProps {
  member: TeamMember;
  rank: number;
  isCurrentUser: boolean;
  delay?: number;
}

export function ComparisonColumn({
  member,
  rank,
  isCurrentUser,
  delay = 0,
}: ComparisonColumnProps) {
  const revenueProgress = (member.revenue / REVENUE_GOAL) * 100;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value}`;
  };

  return (
    <AnimatedCard
      delay={delay}
      className={cn(
        "p-6",
        isCurrentUser && "ring-2 ring-primary/50 bg-primary/5"
      )}
    >
      {/* Header with Avatar and Name */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
        <div className="relative">
          <Avatar className="h-16 w-16">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback>
              {member.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          {member.isLeader && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold rounded-full flex items-center justify-center">
              <Crown className="w-3.5 h-3.5 text-background" />
            </div>
          )}
          {isCurrentUser && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">
              {isCurrentUser ? "Jij" : member.name}
            </h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              Plek #{rank}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{member.role}</p>
        </div>
      </div>

      {/* Performance Score */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <AnimatedRing
            value={member.metrics.performanceScore}
            size={120}
            strokeWidth={8}
            delay={delay + 100}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">
              <AnimatedNumber
                value={member.metrics.performanceScore}
                delay={delay + 150}
              />
            </span>
            <span className="text-xs text-muted-foreground">Score</span>
          </div>
        </div>
      </div>

      {/* Revenue Progress */}
      <div className="mb-6 p-4 rounded-lg bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Omzet</span>
          <span className="text-lg font-bold text-foreground">
            <AnimatedNumber
              value={member.revenue}
              delay={delay + 200}
              formatFn={formatCurrency}
            />
          </span>
        </div>
        <AnimatedProgress
          value={revenueProgress}
          delay={delay + 250}
          className="h-3"
        />
        <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
          <span>€0</span>
          <span>Doel: €2M</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-4">
        <MetricItem
          label="Emails verstuurd"
          value={member.metrics.emailsSent}
          delay={delay + 300}
        />
        <MetricItem
          label="Gesprekken"
          value={member.metrics.calls}
          delay={delay + 350}
        />
        <MetricItem
          label="Acquisities"
          value={member.metrics.acquisitions}
          delay={delay + 400}
        />
        <MetricItem
          label="Plaatsingen"
          value={member.metrics.placements}
          delay={delay + 450}
        />
        <MetricItem
          label="Kandidaten"
          value={member.metrics.candidates}
          delay={delay + 500}
        />
        <MetricItem
          label="Conversieratio"
          value={member.metrics.conversionRate}
          suffix="%"
          delay={delay + 550}
        />
        <MetricItem
          label="Salaris voortgang"
          value={member.metrics.salaryProgress}
          suffix="%"
          delay={delay + 600}
        />
      </div>
    </AnimatedCard>
  );
}

interface MetricItemProps {
  label: string;
  value: number;
  suffix?: string;
  delay?: number;
}

function MetricItem({ label, value, suffix = "", delay = 0 }: MetricItemProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">
        <AnimatedNumber value={value} delay={delay} />
        {suffix}
      </span>
    </div>
  );
}
