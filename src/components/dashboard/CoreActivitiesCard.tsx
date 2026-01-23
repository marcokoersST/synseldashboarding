import { Mail, Phone, UserPlus, CheckCircle } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { useAnimateOnMount, getStaggerDelay } from "@/hooks/useAnimateOnMount";
import { cn } from "@/lib/utils";

const activities = [
  { 
    icon: Mail, 
    label: "Emails verstuurd", 
    value: 245, 
    data: [
      { value: 35 }, { value: 42 }, { value: 28 }, { value: 55 }, 
      { value: 48 }, { value: 37 }, { value: 52 }
    ],
    color: "hsl(var(--teal))"
  },
  { 
    icon: Phone, 
    label: "Gesprekken", 
    value: 89, 
    data: [
      { value: 12 }, { value: 15 }, { value: 10 }, { value: 18 }, 
      { value: 14 }, { value: 8 }, { value: 12 }
    ],
    color: "hsl(var(--primary))"
  },
  { 
    icon: UserPlus, 
    label: "Acquisities", 
    value: 12, 
    data: [
      { value: 2 }, { value: 1 }, { value: 3 }, { value: 2 }, 
      { value: 1 }, { value: 2 }, { value: 1 }
    ],
    color: "hsl(var(--gold))"
  },
  { 
    icon: CheckCircle, 
    label: "Plaatsingen", 
    value: 5, 
    data: [
      { value: 1 }, { value: 0 }, { value: 1 }, { value: 1 }, 
      { value: 0 }, { value: 1 }, { value: 1 }
    ],
    color: "hsl(var(--success))"
  },
];

interface CoreActivitiesCardProps {
  delay?: number;
}

export function CoreActivitiesCard({ delay = 0 }: CoreActivitiesCardProps) {
  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="glass-header">
          <h3 className="text-sm font-medium text-foreground">Kernactiviteiten</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Activiteiten deze periode</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {activities.map((activity, index) => (
            <ActivityItem 
              key={activity.label}
              activity={activity}
              delay={delay + 200 + getStaggerDelay(index, 100)}
            />
          ))}
        </div>
      </div>
    </AnimatedCard>
  );
}

interface ActivityItemProps {
  activity: typeof activities[0];
  delay: number;
}

function ActivityItem({ activity, delay }: ActivityItemProps) {
  const { ref, isVisible } = useAnimateOnMount({ delay });
  
  return (
    <div 
      ref={ref}
      className={cn(
        "bg-secondary/30 rounded-lg p-3 transition-all duration-500 ease-out cursor-pointer hover-lift group",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center group-hover:scale-110 transition-transform">
          <activity.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
        <AnimatedNumber 
          value={activity.value}
          delay={delay + 100}
          className="text-xl font-bold text-foreground"
        />
      </div>
      <p className="text-xs text-muted-foreground mb-2 group-hover:text-foreground transition-colors">
        {activity.label}
      </p>
      <div className="h-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activity.data}>
            <Bar dataKey="value" radius={[2, 2, 0, 0]}>
              {activity.data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === activity.data.length - 1 ? activity.color : 'hsl(var(--chart-muted))'} 
                  className={cn(
                    "transition-all duration-300",
                    isVisible ? "opacity-100" : "opacity-0"
                  )}
                  style={{
                    transitionDelay: `${delay + 200 + index * 50}ms`
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
