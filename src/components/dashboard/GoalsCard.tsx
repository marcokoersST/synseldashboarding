import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { useAnimateOnMount, getStaggerDelay } from "@/hooks/useAnimateOnMount";
import { cn } from "@/lib/utils";

const goals = [
  { id: 1, text: "5 nieuwe kandidaten benaderen", completed: true },
  { id: 2, text: "3 sollicitatie gesprekken inplannen", completed: true },
  { id: 3, text: "1 nieuwe klant acquisitie doen", completed: false },
  { id: 4, text: "CV database bijwerken", completed: false },
];

interface GoalsCardProps {
  delay?: number;
}

export function GoalsCard({ delay = 0 }: GoalsCardProps) {
  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">Persoonlijke Ontwikkeldoelen</h3>
          <button className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors hover-scale">
            <Plus className="w-4 h-4" />
            <span>Doel toevoegen</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {goals.map((goal, index) => (
            <GoalItem 
              key={goal.id} 
              goal={goal} 
              delay={delay + 200 + getStaggerDelay(index, 80)} 
            />
          ))}
        </div>
      </div>
    </AnimatedCard>
  );
}

interface GoalItemProps {
  goal: { id: number; text: string; completed: boolean };
  delay: number;
}

function GoalItem({ goal, delay }: GoalItemProps) {
  const { ref, isVisible } = useAnimateOnMount({ delay });
  
  return (
    <div 
      ref={ref}
      className={cn(
        "flex items-center gap-3 transition-all duration-500 ease-out",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
      )}
    >
      <Checkbox 
        checked={goal.completed}
        className={cn(
          "w-5 h-5 rounded-md border-2 transition-all duration-300",
          goal.completed 
            ? "bg-success border-success text-success-foreground scale-100" 
            : "border-border hover:border-primary hover:scale-110"
        )}
      />
      <span className={cn(
        "text-sm transition-all duration-300",
        goal.completed 
          ? "text-muted-foreground line-through" 
          : "text-foreground"
      )}>
        {goal.text}
      </span>
    </div>
  );
}
