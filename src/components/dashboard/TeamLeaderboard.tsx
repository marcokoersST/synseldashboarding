import { Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedProgress } from "@/components/animations/AnimatedProgress";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { useAnimateOnMount, getStaggerDelay } from "@/hooks/useAnimateOnMount";
import { cn } from "@/lib/utils";

const teamMembers = [
  { 
    id: 1, 
    name: "Sophie de Vries", 
    role: "Senior Consultant", 
    revenue: 1850000, 
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    isLeader: true 
  },
  { 
    id: 2, 
    name: "Thomas Bakker", 
    role: "Consultant", 
    revenue: 1620000, 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    isLeader: false 
  },
  { 
    id: 3, 
    name: "Emma Jansen", 
    role: "Senior Consultant", 
    revenue: 1450000, 
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    isLeader: false 
  },
  { 
    id: 4, 
    name: "Jouw naam", 
    role: "Recruitment Consultant", 
    revenue: 1280000, 
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    isLeader: false,
    isCurrentUser: true
  },
  { 
    id: 5, 
    name: "Lucas van Dijk", 
    role: "Junior Consultant", 
    revenue: 980000, 
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    isLeader: false 
  },
  { 
    id: 6, 
    name: "Mila Peters", 
    role: "Junior Consultant", 
    revenue: 720000, 
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    isLeader: false 
  },
];

const goal = 2000000;

interface TeamLeaderboardProps {
  delay?: number;
}

export function TeamLeaderboard({ delay = 0 }: TeamLeaderboardProps) {
  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border">
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
          {teamMembers.map((member, index) => (
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
  member: typeof teamMembers[0];
  index: number;
  delay: number;
}

function TeamMemberRow({ member, index, delay }: TeamMemberRowProps) {
  const { ref, isVisible } = useAnimateOnMount({ delay });
  const progress = (member.revenue / goal) * 100;
  
  return (
    <div 
      ref={ref}
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg transition-all duration-500 ease-out cursor-pointer",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
        member.isCurrentUser 
          ? "bg-primary/5 border border-primary/20 glow-primary" 
          : "hover:bg-secondary/50"
      )}
    >
      <span className="w-5 text-xs font-medium text-muted-foreground text-center">
        {index + 1}
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
            {member.name}
          </span>
          {member.isLeader && <Crown className="w-3.5 h-3.5 text-gold flex-shrink-0 animate-bounce-subtle" />}
        </div>
        <p className="text-xs text-muted-foreground truncate">{member.role}</p>
      </div>
      <div className="w-32">
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
        className="text-xs font-medium text-foreground w-16 text-right"
      />
    </div>
  );
}
