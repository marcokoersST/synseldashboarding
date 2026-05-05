import { Mail, Phone, UserPlus, CheckCircle } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { useAnimateOnMount, getStaggerDelay } from "@/hooks/useAnimateOnMount";
import { cn } from "@/lib/utils";

const activities = [
  { 
    icon: Mail, 
    label: "Emails verstuurd", 
    value: 156, 
    data: [
      { value: 20, day: "Ma 13 jan" }, { value: 25, day: "Di 14 jan" }, { value: 18, day: "Wo 15 jan" }, { value: 30, day: "Do 16 jan" }, 
      { value: 27, day: "Vr 17 jan" }, { value: 16, day: "Za 18 jan" }, { value: 20, day: "Zo 19 jan" }
    ],
    color: "hsl(var(--teal))"
  },
  { 
    icon: Phone, 
    label: "Telefonie", 
    value: 136, 
    data: [
      { value: 18, day: "Ma 13 jan" }, { value: 22, day: "Di 14 jan" }, { value: 16, day: "Wo 15 jan" }, { value: 25, day: "Do 16 jan" }, 
      { value: 21, day: "Vr 17 jan" }, { value: 14, day: "Za 18 jan" }, { value: 20, day: "Zo 19 jan" }
    ],
    color: "hsl(var(--primary))"
  },
  { 
    icon: UserPlus, 
    label: "Acquisities", 
    value: 12, 
    data: [
      { value: 2, day: "Ma 13 jan" }, { value: 1, day: "Di 14 jan" }, { value: 3, day: "Wo 15 jan" }, { value: 2, day: "Do 16 jan" }, 
      { value: 1, day: "Vr 17 jan" }, { value: 2, day: "Za 18 jan" }, { value: 1, day: "Zo 19 jan" }
    ],
    color: "hsl(var(--gold))"
  },
  { 
    icon: CheckCircle, 
    label: "Plaatsingen", 
    value: 5, 
    data: [
      { value: 1, day: "Ma 13 jan" }, { value: 0, day: "Di 14 jan" }, { value: 1, day: "Wo 15 jan" }, { value: 1, day: "Do 16 jan" }, 
      { value: 0, day: "Vr 17 jan" }, { value: 1, day: "Za 18 jan" }, { value: 1, day: "Zo 19 jan" }
    ],
    color: "hsl(var(--success))"
  },
];

interface MiniChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { value: number; day: string } }>;
}

function MiniChartTooltip({ active, payload }: MiniChartTooltipProps) {
  if (!active || !payload?.length) return null;
  
  const data = payload[0].payload;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg text-center z-50">
      <p className="text-sm font-semibold text-foreground">{data.value}</p>
      <p className="text-xs text-muted-foreground">{data.day}</p>
    </div>
  );
}

interface CoreActivitiesCardProps {
  delay?: number;
}

export function CoreActivitiesCard({ delay = 0 }: CoreActivitiesCardProps) {
  return (
    <AnimatedCard delay={delay}>
      <WatZieIkHier
        what="De kernactiviteiten die je deze periode hebt gedaan: gesprekken, acquisities, voorstellen, intakes, etc."
        insight="Direct zien of je dagelijkse 'moetjes' op koers liggen of dat je vandaag nog een tandje bij moet zetten."
      />
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="mb-4">
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
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
              content={<MiniChartTooltip />}
            />
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
