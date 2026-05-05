import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { WatZieIkHier } from "@/components/dashboard/WatZieIkHier";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
}

const initialGoals: Goal[] = [
  { id: 1, text: "Acquisitiegesprekken volledig zelfstandig uitvoeren zonder begeleiding van een senior collega", completed: true },
  { id: 2, text: "Actief luisteren verbeteren tijdens klantgesprekken door samenvattingen te geven", completed: false },
  { id: 3, text: "Elke week één nieuwe onderhandelingstechniek toepassen en evalueren", completed: false },
  { id: 4, text: "Netwerk uitbreiden door maandelijks minimaal 2 branche-events bij te wonen", completed: true },
  { id: 5, text: "Timemanagement verbeteren door dagelijks prioriteiten te stellen met de Eisenhower-matrix", completed: false },
  { id: 6, text: "Presentatievaardigheden ontwikkelen door kwartaallijks een interne kennissessie te geven", completed: true },
  { id: 7, text: "Stressbestendigheid vergroten door mindfulness-technieken toe te passen bij piekdrukte", completed: false },
];

interface GoalsCardProps {
  delay?: number;
}

export function GoalsCard({ delay = 0 }: GoalsCardProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [newGoalText, setNewGoalText] = useState("");
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

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
      };
      setGoals([...goals, newGoal]);
      setNewGoalText("");
    }
  };

  const handleDeleteGoal = (id: number) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const startEditing = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditingText(goal.text);
  };

  const saveEdit = () => {
    if (editingGoalId && editingText.trim()) {
      setGoals(goals.map(goal =>
        goal.id === editingGoalId ? { ...goal, text: editingText.trim() } : goal
      ));
    }
    setEditingGoalId(null);
    setEditingText("");
  };

  const cancelEdit = () => {
    setEditingGoalId(null);
    setEditingText("");
  };

  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [goals]);

  return (
    <AnimatedCard delay={delay}>
    <WatZieIkHier
      what="Je persoonlijke leer- en ontwikkeldoelen voor deze periode, met aangevinkt wat al af is."
      insight="Houd zelf grip op je groei: vink af wat je hebt gedaan en zie meteen waar je nog mee bezig bent."
    />
    <div className="bg-card rounded-xl p-5 border border-border flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-sm font-medium text-foreground">Persoonlijke Ontwikkeldoelen</h3>
          <button 
            onClick={() => setIsManageDialogOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors hover-scale"
          >
            <Plus className="w-4 h-4" />
            <span>Doelen beheren</span>
          </button>
        </div>
        
        <div className="relative flex-1">
          <div className="h-[280px] overflow-y-auto scrollbar-thin">
            <div className="space-y-2 pr-2 pb-4">
              {sortedGoals.map((goal) => (
                <GoalItemCompact 
                  key={goal.id} 
                  goal={goal} 
                  onToggle={handleToggleComplete}
                />
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-2 h-2 bg-gradient-to-t from-card to-transparent pointer-events-none" />
        </div>

        {/* Goals Management Dialog */}
        <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
          <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0">
            <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
              <DialogTitle className="text-lg font-semibold">Doelen Beheren</DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {/* Add new goal input */}
              <div className="px-6 py-3 border-b border-border/30 shrink-0">
                <div className="flex flex-col gap-2">
                  <Textarea
                    placeholder="Nieuw doel toevoegen..."
                    value={newGoalText}
                    onChange={(e) => {
                      setNewGoalText(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.max(e.target.scrollHeight, 52) + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddGoal();
                      }
                    }}
                    className="w-full min-h-[52px] max-h-[150px] resize-none"
                    rows={2}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleAddGoal}
                    disabled={!newGoalText.trim()}
                    className="self-end"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Toevoegen
                  </Button>
                </div>
              </div>
              
              {/* Goals list */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-2">
                  {sortedGoals.map((goal) => (
                    <GoalItemFull
                      key={goal.id}
                      goal={goal}
                      isEditing={editingGoalId === goal.id}
                      editingText={editingText}
                      onToggle={handleToggleComplete}
                      onDelete={handleDeleteGoal}
                      onStartEdit={startEditing}
                      onSaveEdit={saveEdit}
                      onCancelEdit={cancelEdit}
                      onEditTextChange={setEditingText}
                    />
                  ))}
                  {sortedGoals.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nog geen doelen. Voeg er een toe hierboven.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedCard>
  );
}

// Compact goal item for the card view
interface GoalItemCompactProps {
  goal: Goal;
  onToggle: (id: number) => void;
}

function GoalItemCompact({ goal, onToggle }: GoalItemCompactProps) {
  return (
    <div className="flex items-start gap-2.5 group p-1.5 rounded-lg">
      <Checkbox 
        checked={goal.completed}
        onCheckedChange={() => onToggle(goal.id)}
        className={cn(
          "w-4 h-4 rounded-md border-2 transition-all duration-300 cursor-pointer mt-0.5 flex-shrink-0",
          goal.completed 
            ? "bg-success border-success text-success-foreground" 
            : "border-border hover:border-primary"
        )}
      />
      <span className={cn(
        "text-xs transition-all duration-300 flex-1 leading-relaxed",
        goal.completed 
          ? "text-muted-foreground line-through" 
          : "text-foreground"
      )}>
        {goal.text}
      </span>
    </div>
  );
}

// Full goal item for the management dialog
interface GoalItemFullProps {
  goal: Goal;
  isEditing: boolean;
  editingText: string;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onStartEdit: (goal: Goal) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditTextChange: (text: string) => void;
}

function GoalItemFull({ 
  goal, 
  isEditing, 
  editingText,
  onToggle, 
  onDelete, 
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditTextChange,
}: GoalItemFullProps) {
  return (
    <div className="flex items-start gap-3 group p-3 rounded-lg border transition-all bg-card border-border hover:border-primary/30">
      <Checkbox 
        checked={goal.completed}
        onCheckedChange={() => onToggle(goal.id)}
        className={cn(
          "w-5 h-5 rounded-md border-2 transition-all duration-300 cursor-pointer mt-0.5 flex-shrink-0",
          goal.completed 
            ? "bg-success border-success text-success-foreground" 
            : "border-border hover:border-primary"
        )}
      />
      
      {isEditing ? (
        <div className="flex-1 flex gap-2">
          <Textarea
            value={editingText}
            onChange={(e) => onEditTextChange(e.target.value)}
            className="flex-1 min-h-[60px] text-sm resize-none"
            autoFocus
          />
          <div className="flex flex-col gap-1">
            <Button size="icon" variant="ghost" onClick={onSaveEdit} className="h-7 w-7 text-success hover:text-success hover:bg-success/20">
              <Check className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onCancelEdit} className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/20">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <span className={cn(
            "text-sm flex-1 leading-relaxed",
            goal.completed 
              ? "text-muted-foreground line-through" 
              : "text-foreground"
          )}>
            {goal.text}
          </span>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onStartEdit(goal)}
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
        </>
      )}
    </div>
  );
}
