import { Plus, Trash2, Pencil, Shield } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { useAnimateOnMount, getStaggerDelay } from "@/hooks/useAnimateOnMount";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Goal {
  id: number;
  text: string;
  completed: boolean;
  isManagerGoal: boolean;
}

const initialGoals: Goal[] = [
  // Personal development goals (user's own) - 7 goals
  { id: 1, text: "Acquisitiegesprekken volledig zelfstandig uitvoeren zonder begeleiding van een senior collega", completed: true, isManagerGoal: false },
  { id: 2, text: "Actief luisteren verbeteren tijdens klantgesprekken door samenvattingen te geven", completed: false, isManagerGoal: false },
  { id: 3, text: "Elke week één nieuwe onderhandelingstechniek toepassen en evalueren", completed: false, isManagerGoal: false },
  { id: 4, text: "Netwerk uitbreiden door maandelijks minimaal 2 branche-events bij te wonen", completed: true, isManagerGoal: false },
  { id: 5, text: "Timemanagement verbeteren door dagelijks prioriteiten te stellen met de Eisenhower-matrix", completed: false, isManagerGoal: false },
  { id: 6, text: "Presentatievaardigheden ontwikkelen door kwartaallijks een interne kennissessie te geven", completed: true, isManagerGoal: false },
  { id: 7, text: "Stressbestendigheid vergroten door mindfulness-technieken toe te passen bij piekdrukte", completed: false, isManagerGoal: false },
  
  // Manager-set goals - 7 goals
  { id: 8, text: "Kwaliteitsscore van minimaal 8.0 behalen bij AI-coach inschrijvingen dit kwartaal", completed: false, isManagerGoal: true },
  { id: 9, text: "Meer oplossingsgerichte houding tonen in teamoverleggen en minder focussen op obstakels", completed: false, isManagerGoal: true },
  { id: 10, text: "Proactief kennis en best practices delen met junior collega's tijdens wekelijkse check-ins", completed: true, isManagerGoal: true },
  { id: 11, text: "Initiatief tonen bij het oppakken van nieuwe klantrelaties zonder directe aansturing", completed: false, isManagerGoal: true },
  { id: 12, text: "Feedbackcultuur versterken door constructieve feedback te geven én te ontvangen", completed: false, isManagerGoal: true },
  { id: 13, text: "Samenwerking met andere business units verbeteren door maandelijks kennis uit te wisselen", completed: true, isManagerGoal: true },
  { id: 14, text: "Klanttevredenheid verhogen door proactief follow-up gesprekken te voeren na plaatsingen", completed: false, isManagerGoal: true },
];

interface GoalsCardProps {
  delay?: number;
}

export function GoalsCard({ delay = 0 }: GoalsCardProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newGoalText, setNewGoalText] = useState("");
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleToggleComplete = (id: number) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const handleAddGoal = () => {
    if (newGoalText.trim()) {
      const newGoal: Goal = {
        id: Date.now(),
        text: newGoalText.trim(),
        completed: false,
        isManagerGoal: false,
      };
      setGoals([...goals, newGoal]);
      setNewGoalText("");
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteGoal = (id: number) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const handleEditGoal = () => {
    if (editingGoal && editingGoal.text.trim()) {
      setGoals(goals.map(goal =>
        goal.id === editingGoal.id ? { ...goal, text: editingGoal.text.trim() } : goal
      ));
      setEditingGoal(null);
      setIsEditDialogOpen(false);
    }
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal({ ...goal });
    setIsEditDialogOpen(true);
  };

  // Separate and sort goals: uncompleted first, then completed
  const sortedUserGoals = useMemo(() => {
    return goals
      .filter(g => !g.isManagerGoal)
      .sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [goals]);

  const sortedManagerGoals = useMemo(() => {
    return goals
      .filter(g => g.isManagerGoal)
      .sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [goals]);

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border flex flex-col h-full">
        <div className="glass-header flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Persoonlijke Ontwikkeldoelen</h3>
          <button 
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors hover-scale"
          >
            <Plus className="w-4 h-4" />
            <span>Doel toevoegen</span>
          </button>
        </div>
        
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* User Goals Section */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-muted-foreground">Mijn doelen</span>
              <span className="text-xs text-muted-foreground/60">({sortedUserGoals.length})</span>
            </div>
            <div className="relative">
              <div className="h-[130px] overflow-y-auto scrollbar-thin">
                <div className="space-y-2 pr-2 pb-4">
                  {sortedUserGoals.map((goal, index) => (
                    <GoalItem 
                      key={goal.id} 
                      goal={goal} 
                      delay={delay + 200 + getStaggerDelay(index, 80)}
                      onToggle={handleToggleComplete}
                      onDelete={handleDeleteGoal}
                      onEdit={openEditDialog}
                    />
                  ))}
                </div>
              </div>
              {/* Fade gradient overlay */}
              <div className="absolute bottom-0 left-0 right-2 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
            </div>
          </div>
          
          {/* Manager Goals Section */}
          {sortedManagerGoals.length > 0 && (
            <div className="flex-1 min-h-0 flex flex-col border-t border-border/50 pt-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-3.5 h-3.5 text-gold" />
                <span className="text-xs font-medium text-muted-foreground">Doelen van leidinggevende</span>
                <span className="text-xs text-muted-foreground/60">({sortedManagerGoals.length})</span>
              </div>
              <div className="relative">
                <div className="h-[130px] overflow-y-auto scrollbar-thin">
                  <div className="space-y-2 pr-2 pb-4">
                    {sortedManagerGoals.map((goal, index) => (
                      <GoalItem 
                        key={goal.id} 
                        goal={goal} 
                        delay={delay + 200 + getStaggerDelay(sortedUserGoals.length + index, 80)}
                        onToggle={handleToggleComplete}
                        onDelete={handleDeleteGoal}
                        onEdit={openEditDialog}
                      />
                    ))}
                  </div>
                </div>
                {/* Fade gradient overlay */}
                <div className="absolute bottom-0 left-0 right-2 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Add Goal Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nieuw doel toevoegen</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Beschrijf je persoonlijke ontwikkeldoel. Dit kan meerdere regels bevatten..."
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                className="min-h-[120px] resize-none"
                autoFocus
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuleren
              </Button>
              <Button onClick={handleAddGoal} disabled={!newGoalText.trim()}>
                Toevoegen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Goal Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Doel bewerken</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Beschrijf je persoonlijke ontwikkeldoel. Dit kan meerdere regels bevatten..."
                value={editingGoal?.text || ""}
                onChange={(e) => setEditingGoal(prev => prev ? { ...prev, text: e.target.value } : null)}
                className="min-h-[120px] resize-none"
                autoFocus
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuleren
              </Button>
              <Button onClick={handleEditGoal} disabled={!editingGoal?.text.trim()}>
                Opslaan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedCard>
  );
}

interface GoalItemProps {
  goal: Goal;
  delay: number;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (goal: Goal) => void;
}

function GoalItem({ goal, delay, onToggle, onDelete, onEdit }: GoalItemProps) {
  const { ref, isVisible } = useAnimateOnMount({ delay });
  
  return (
    <div 
      ref={ref}
      className={cn(
        "flex items-start gap-3 group transition-all duration-500 ease-out p-2 rounded-lg",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
        goal.isManagerGoal && "bg-gold/5 border border-gold/30"
      )}
    >
      <Checkbox 
        checked={goal.completed}
        onCheckedChange={() => onToggle(goal.id)}
        className={cn(
          "w-5 h-5 rounded-md border-2 transition-all duration-300 cursor-pointer mt-0.5 flex-shrink-0",
          goal.completed 
            ? "bg-success border-success text-success-foreground scale-100" 
            : goal.isManagerGoal
              ? "border-gold/50 hover:border-gold hover:scale-110"
              : "border-border hover:border-primary hover:scale-110"
        )}
      />
      <span className={cn(
        "text-sm transition-all duration-300 flex-1 leading-relaxed",
        goal.completed 
          ? "text-muted-foreground line-through" 
          : "text-foreground"
      )}>
        {goal.text}
      </span>
      
      {/* Action buttons - only for user goals */}
      {!goal.isManagerGoal && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(goal)}
                  className="h-7 w-7 hover:bg-primary/20 hover:text-primary"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Bewerken</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(goal.id)}
                  className="h-7 w-7 hover:bg-destructive/20 hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Verwijderen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      
      {/* Manager goal indicator */}
      {goal.isManagerGoal && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                <Shield className="w-4 h-4 text-gold" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Ingesteld door leidinggevende</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
