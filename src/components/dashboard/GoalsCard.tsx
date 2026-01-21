import { Plus, Trash2, Pencil, Check, X, Shield } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { useAnimateOnMount, getStaggerDelay } from "@/hooks/useAnimateOnMount";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
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

interface Goal {
  id: number;
  text: string;
  completed: boolean;
  isManagerGoal: boolean;
}

const initialGoals: Goal[] = [
  { id: 1, text: "5 nieuwe kandidaten benaderen", completed: true, isManagerGoal: false },
  { id: 2, text: "3 sollicitatie gesprekken inplannen", completed: true, isManagerGoal: false },
  { id: 3, text: "1 nieuwe klant acquisitie doen", completed: false, isManagerGoal: false },
  { id: 4, text: "CV database bijwerken", completed: false, isManagerGoal: false },
  // Manager goals
  { id: 5, text: "Minimaal 90% conversieratio behalen", completed: false, isManagerGoal: true },
  { id: 6, text: "2 nieuwe klanten werven dit kwartaal", completed: true, isManagerGoal: true },
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

  // Separate user goals and manager goals
  const userGoals = goals.filter(g => !g.isManagerGoal);
  const managerGoals = goals.filter(g => g.isManagerGoal);

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">Persoonlijke Ontwikkeldoelen</h3>
          <button 
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors hover-scale"
          >
            <Plus className="w-4 h-4" />
            <span>Doel toevoegen</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {/* User Goals */}
          {userGoals.map((goal, index) => (
            <GoalItem 
              key={goal.id} 
              goal={goal} 
              delay={delay + 200 + getStaggerDelay(index, 80)}
              onToggle={handleToggleComplete}
              onDelete={handleDeleteGoal}
              onEdit={openEditDialog}
            />
          ))}
          
          {/* Manager Goals Section */}
          {managerGoals.length > 0 && (
            <>
              <div className="flex items-center gap-2 pt-2 mt-2 border-t border-border/50">
                <Shield className="w-3.5 h-3.5 text-gold" />
                <span className="text-xs font-medium text-muted-foreground">Doelen van leidinggevende</span>
              </div>
              {managerGoals.map((goal, index) => (
                <GoalItem 
                  key={goal.id} 
                  goal={goal} 
                  delay={delay + 200 + getStaggerDelay(userGoals.length + index, 80)}
                  onToggle={handleToggleComplete}
                  onDelete={handleDeleteGoal}
                  onEdit={openEditDialog}
                />
              ))}
            </>
          )}
        </div>

        {/* Add Goal Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nieuw doel toevoegen</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Beschrijf je doel..."
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Doel bewerken</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Beschrijf je doel..."
                value={editingGoal?.text || ""}
                onChange={(e) => setEditingGoal(prev => prev ? { ...prev, text: e.target.value } : null)}
                onKeyDown={(e) => e.key === 'Enter' && handleEditGoal()}
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
        "flex items-center gap-3 group transition-all duration-500 ease-out",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
        goal.isManagerGoal && "bg-gold/5 border border-gold/30 rounded-lg px-3 py-2 -mx-1"
      )}
    >
      <Checkbox 
        checked={goal.completed}
        onCheckedChange={() => onToggle(goal.id)}
        className={cn(
          "w-5 h-5 rounded-md border-2 transition-all duration-300 cursor-pointer",
          goal.completed 
            ? "bg-success border-success text-success-foreground scale-100" 
            : goal.isManagerGoal
              ? "border-gold/50 hover:border-gold hover:scale-110"
              : "border-border hover:border-primary hover:scale-110"
        )}
      />
      <span className={cn(
        "text-sm transition-all duration-300 flex-1",
        goal.completed 
          ? "text-muted-foreground line-through" 
          : "text-foreground"
      )}>
        {goal.text}
      </span>
      
      {/* Action buttons - only for user goals */}
      {!goal.isManagerGoal && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
              <div className="flex items-center justify-center w-6 h-6">
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
