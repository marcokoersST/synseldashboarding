import { useState, useMemo } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Pencil, Shield, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { managerGoalsData, type ManagerGoal } from "@/data/managerPerformanceData";
import { myTeamConsultants } from "@/data/managerData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ManagerGoalsCardProps {
  delay?: number;
}

export function ManagerGoalsCard({ delay = 0 }: ManagerGoalsCardProps) {
  const [goals, setGoals] = useState<ManagerGoal[]>(managerGoalsData);
  const [selectedConsultant, setSelectedConsultant] = useState<string>("all");
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalIsManager, setNewGoalIsManager] = useState(true);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const consultants = myTeamConsultants;

  const filteredGoals = useMemo(() => {
    let data = goals;
    if (selectedConsultant !== "all") {
      data = data.filter(g => g.consultantId === Number(selectedConsultant));
    }
    return data.sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [goals, selectedConsultant]);

  const managerGoals = filteredGoals.filter(g => g.isManagerGoal);
  const personalGoals = filteredGoals.filter(g => !g.isManagerGoal);

  const handleToggle = (id: number) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const handleAdd = () => {
    if (!newGoalText.trim() || selectedConsultant === "all") return;
    const consultant = consultants.find(c => c.id === Number(selectedConsultant));
    if (!consultant) return;
    setGoals([...goals, {
      id: Date.now(),
      consultantId: consultant.id,
      consultantName: consultant.name,
      text: newGoalText.trim(),
      completed: false,
      isManagerGoal: newGoalIsManager,
    }]);
    setNewGoalText("");
  };

  const handleDelete = (id: number) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const startEdit = (goal: ManagerGoal) => {
    setEditingGoalId(goal.id);
    setEditingText(goal.text);
  };

  const saveEdit = () => {
    if (editingGoalId && editingText.trim()) {
      setGoals(goals.map(g => g.id === editingGoalId ? { ...g, text: editingText.trim() } : g));
    }
    setEditingGoalId(null);
    setEditingText("");
  };

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Doelen & Ontwikkeling</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Per consultant</p>
          </div>
          <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Alle consultants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle consultants</SelectItem>
              {consultants.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add goal (only when a specific consultant is selected) */}
        {selectedConsultant !== "all" && (
          <div className="mb-4 space-y-2 border-b border-border/50 pb-4">
            <Textarea
              placeholder="Nieuw doel toevoegen..."
              value={newGoalText}
              onChange={e => setNewGoalText(e.target.value)}
              className="min-h-[44px] max-h-[100px] resize-none text-xs"
              rows={2}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={newGoalIsManager}
                  onCheckedChange={(v) => setNewGoalIsManager(!!v)}
                  className="w-4 h-4"
                />
                <span className="text-xs text-muted-foreground">Manager doel</span>
              </label>
              <Button size="sm" onClick={handleAdd} disabled={!newGoalText.trim()} className="h-7 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Toevoegen
              </Button>
            </div>
          </div>
        )}

        {/* Goals list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4">
          {/* Manager goals */}
          {managerGoals.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-3.5 h-3.5 text-gold" />
                <span className="text-xs font-medium text-muted-foreground">Manager doelen</span>
                <span className="text-[10px] text-muted-foreground/60">({managerGoals.length})</span>
              </div>
              <div className="space-y-1.5">
                {managerGoals.map(goal => (
                  <GoalItem
                    key={goal.id}
                    goal={goal}
                    isEditing={editingGoalId === goal.id}
                    editingText={editingText}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onStartEdit={startEdit}
                    onSaveEdit={saveEdit}
                    onCancelEdit={() => { setEditingGoalId(null); setEditingText(""); }}
                    onEditTextChange={setEditingText}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Personal goals */}
          {personalGoals.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground">Persoonlijke doelen</span>
                <span className="text-[10px] text-muted-foreground/60">({personalGoals.length})</span>
              </div>
              <div className="space-y-1.5">
                {personalGoals.map(goal => (
                  <GoalItem
                    key={goal.id}
                    goal={goal}
                    isEditing={editingGoalId === goal.id}
                    editingText={editingText}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onStartEdit={startEdit}
                    onSaveEdit={saveEdit}
                    onCancelEdit={() => { setEditingGoalId(null); setEditingText(""); }}
                    onEditTextChange={setEditingText}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredGoals.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">
              {selectedConsultant === "all" ? "Selecteer een consultant om doelen te bekijken" : "Geen doelen gevonden"}
            </p>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
}

// ─── Goal Item ───

interface GoalItemProps {
  goal: ManagerGoal;
  isEditing: boolean;
  editingText: string;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onStartEdit: (goal: ManagerGoal) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditTextChange: (text: string) => void;
}

function GoalItem({
  goal, isEditing, editingText, onToggle, onDelete, onStartEdit, onSaveEdit, onCancelEdit, onEditTextChange
}: GoalItemProps) {
  return (
    <div className={cn(
      "flex items-start gap-2.5 group p-2 rounded-lg border transition-all",
      goal.isManagerGoal ? "bg-gold/5 border-gold/30" : "bg-card border-border/50"
    )}>
      <Checkbox
        checked={goal.completed}
        onCheckedChange={() => onToggle(goal.id)}
        className={cn(
          "w-4 h-4 rounded-md border-2 mt-0.5 flex-shrink-0 cursor-pointer",
          goal.completed ? "bg-success border-success" : goal.isManagerGoal ? "border-gold/50" : "border-border"
        )}
      />

      {isEditing ? (
        <div className="flex-1 flex gap-1.5">
          <Textarea value={editingText} onChange={e => onEditTextChange(e.target.value)} className="flex-1 min-h-[36px] text-xs resize-none" autoFocus />
          <div className="flex flex-col gap-0.5">
            <Button size="icon" variant="ghost" onClick={onSaveEdit} className="h-6 w-6 text-success hover:text-success"><Check className="w-3 h-3" /></Button>
            <Button size="icon" variant="ghost" onClick={onCancelEdit} className="h-6 w-6 text-destructive hover:text-destructive"><X className="w-3 h-3" /></Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <span className={cn("text-xs leading-relaxed", goal.completed ? "text-muted-foreground line-through" : "text-foreground")}>
              {goal.text}
            </span>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{goal.consultantName}</p>
          </div>

          {goal.isManagerGoal && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Shield className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent><p>Manager doel</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <Button size="icon" variant="ghost" onClick={() => onStartEdit(goal)} className="h-6 w-6"><Pencil className="w-3 h-3" /></Button>
            <Button size="icon" variant="ghost" onClick={() => onDelete(goal.id)} className="h-6 w-6 text-destructive"><Trash2 className="w-3 h-3" /></Button>
          </div>
        </>
      )}
    </div>
  );
}
