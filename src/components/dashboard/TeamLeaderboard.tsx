import { Crown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedProgress } from "@/components/animations/AnimatedProgress";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { useAnimateOnMount, getStaggerDelay } from "@/hooks/useAnimateOnMount";
import { cn } from "@/lib/utils";
import { teamMembers, REVENUE_GOAL, TeamMember } from "@/data/teamData";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TeamLeaderboardProps {
  delay?: number;
}

export function TeamLeaderboard({ delay = 0 }: TeamLeaderboardProps) {
  // Sort by revenue descending
  const sortedMembers = [...teamMembers].sort((a, b) => b.revenue - a.revenue);

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border h-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Team Omzet Race</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Wie bereikt als eerste €2M?</p>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gold/10 rounded-md">
            <Crown className="w-4 h-4 text-gold animate-float" />
            <span className="text-xs font-medium text-gold">Leider</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {sortedMembers.map((member, index) => (
            <TeamMemberRow 
              key={member.id} 
              member={member} 
              index={index}
              delay={delay + 200 + getStaggerDelay(index, 60)}
            />
          ))}
        </div>
      </div>
    </AnimatedCard>
  );
}

interface TeamMemberRowProps {
  member: TeamMember;
  index: number;
  delay: number;
}

function TeamMemberRow({ member, index, delay }: TeamMemberRowProps) {
  const { ref, isVisible } = useAnimateOnMount({ delay });
  const navigate = useNavigate();
  const progress = (member.revenue / REVENUE_GOAL) * 100;
  const rank = index + 1;

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/vergelijking/${member.id}`);
  };
  
  return (
    <div 
      ref={ref}
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg transition-all duration-500 ease-out",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
        member.isCurrentUser 
          ? "bg-primary/5 border border-primary/20 glow-primary" 
          : "hover:bg-secondary/50"
      )}
    >
      <span className="w-5 text-xs font-medium text-muted-foreground text-center">
        {rank}
      </span>
      <Avatar className="w-8 h-8 transition-transform duration-200 hover:scale-110">
        <AvatarImage src={member.avatar} />
        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-medium truncate transition-colors",
            member.isCurrentUser ? "text-primary" : "text-foreground"
          )}>
            {member.isCurrentUser ? "Jij" : member.name}
          </span>
          {member.isLeader && <Crown className="w-3.5 h-3.5 text-gold flex-shrink-0 animate-bounce-subtle" />}
        </div>
        <p className="text-xs text-muted-foreground truncate">{member.role}</p>
      </div>
      <div className="w-24 hidden sm:block">
        <AnimatedProgress 
          value={progress}
          delay={delay + 100}
          className="h-1.5"
          barClassName={cn(
            member.isLeader ? "bg-gold" : member.isCurrentUser ? "bg-primary" : "bg-teal"
          )}
        />
      </div>
      <AnimatedNumber 
        value={member.revenue / 1000000}
        prefix="€"
        suffix="M"
        decimals={2}
        delay={delay + 200}
        className="text-xs font-medium text-foreground w-14 text-right"
      />
      
      {/* Compare Button - Only show for other team members */}
      {!member.isCurrentUser && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCompareClick}
                className={cn(
                  "h-7 w-7 shrink-0 transition-colors",
                  "hover:bg-primary/20 hover:text-primary",
                  member.isLeader && "hover:bg-gold/20 hover:text-gold"
                )}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Hoe kom ik op plek {rank}?</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
