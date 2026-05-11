import { useState, useMemo } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Pencil, Shield, Check, X, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { managerGoalsData, type ManagerGoal } from "@/data/managerPerformanceData";
import { myTeamConsultants } from "@/data/managerData";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ManagerGoalsCardProps {
  delay?: number;
  selectedUnit?: string;
  framed?: boolean;
}

export function ManagerGoalsCard({ delay = 0, selectedUnit, framed = true }: ManagerGoalsCardProps) {
  const [goals, setGoals] = useState<ManagerGoal[]>(managerGoalsData);
  const [expandedConsultant, setExpandedConsultant] = useState<number | null>(null);
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalIsManager, setNewGoalIsManager] = useState(true);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const consultants = useMemo(() => {
    if (!selectedUnit || selectedUnit === "all") return myTeamConsultants;
    return myTeamConsultants.filter(c => c.unit === selectedUnit);
  }, [selectedUnit]);

  // Summary per consultant
  const summaryData = useMemo(() => {
    return consultants.map(c => {
      const cGoals = goals.filter(g => g.consultantId === c.id);
      const total = cGoals.length;
      const completed = cGoals.filter(g => g.completed).length;
      const managerCount = cGoals.filter(g => g.isManagerGoal).length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { consultant: c, total, completed, managerCount, pct };
    });
  }, [goals, consultants]);

  const handleToggle = (id: number) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const handleAdd = () => {
    if (!newGoalText.trim() || expandedConsultant === null) return;
    const consultant = consultants.find(c => c.id === expandedConsultant);
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

  const handleDelete = (id: number) => setGoals(goals.filter(g => g.id !== id));

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

  const body = (
    <>
      {framed && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-foreground">Doelen & Ontwikkeling</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Per consultant</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1.5">
        {summaryData.map(({ consultant, total, completed, managerCount, pct }) => {
          const isExpanded = expandedConsultant === consultant.id;
          const consultantGoals = goals.filter(g => g.consultantId === consultant.id);
          const mGoals = consultantGoals.filter(g => g.isManagerGoal).sort((a, b) => Number(a.completed) - Number(b.completed));
          const pGoals = consultantGoals.filter(g => !g.isManagerGoal).sort((a, b) => Number(a.completed) - Number(b.completed));

          return (
            <div key={consultant.id} className="border border-border/50 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedConsultant(isExpanded ? null : consultant.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/30 transition-colors text-left"
              >
                {/* Progress ring */}
                <div className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-full border-2 text-[11px] font-bold shrink-0",
                  pct >= 75 ? "text-success border-success/30 bg-success/8" :
                  pct >= 50 ? "text-amber-500 border-amber-500/30 bg-amber-500/8" :
                  "text-destructive border-destructive/30 bg-destructive/8"
                )}>
                  {pct}%
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{consultant.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Progress value={pct} className="h-1 flex-1" />
                    <span className="text-[10px] text-muted-foreground shrink-0">{completed}/{total}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {managerCount > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-gold">
                      <Shield className="w-3 h-3" />{managerCount}
                    </span>
                  )}
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border/50 bg-secondary/10 px-3 py-3 space-y-3">
                  {/* Add goal */}
                  <div className="space-y-2 border-b border-border/30 pb-3">
                    <Textarea
                      placeholder="Nieuw doel toevoegen..."
                      value={newGoalText}
                      onChange={e => setNewGoalText(e.target.value)}
                      className="min-h-[36px] max-h-[80px] resize-none text-xs"
                      rows={1}
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={newGoalIsManager} onCheckedChange={(v) => setNewGoalIsManager(!!v)} className="w-3.5 h-3.5" />
                        <span className="text-[10px] text-muted-foreground">Manager doel</span>
                      </label>
                      <Button size="sm" onClick={handleAdd} disabled={!newGoalText.trim()} className="h-6 text-[10px] px-2">
                        <Plus className="w-3 h-3 mr-0.5" />Toevoegen
                      </Button>
                    </div>
                  </div>

                  {/* Manager goals */}
                  {mGoals.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Shield className="w-3 h-3 text-gold" />
                        <span className="text-[10px] font-medium text-muted-foreground">Manager doelen</span>
                      </div>
                      <div className="space-y-1">
                        {mGoals.map(goal => (
                          <GoalItem key={goal.id} goal={goal} isEditing={editingGoalId === goal.id} editingText={editingText}
                            onToggle={handleToggle} onDelete={handleDelete} onStartEdit={startEdit} onSaveEdit={saveEdit}
                            onCancelEdit={() => { setEditingGoalId(null); setEditingText(""); }} onEditTextChange={setEditingText} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Personal goals */}
                  {pGoals.length > 0 && (
                    <div>
                      <span className="text-[10px] font-medium text-muted-foreground mb-1.5 block">Persoonlijke doelen</span>
                      <div className="space-y-1">
                        {pGoals.map(goal => (
                          <GoalItem key={goal.id} goal={goal} isEditing={editingGoalId === goal.id} editingText={editingText}
                            onToggle={handleToggle} onDelete={handleDelete} onStartEdit={startEdit} onSaveEdit={saveEdit}
                            onCancelEdit={() => { setEditingGoalId(null); setEditingText(""); }} onEditTextChange={setEditingText} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  if (!framed) return <div className="flex flex-col h-full">{body}</div>;
  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">{body}</div>
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
      "flex items-start gap-2 group p-1.5 rounded-md transition-all",
      goal.completed ? "opacity-60" : ""
    )}>
      <Checkbox
        checked={goal.completed}
        onCheckedChange={() => onToggle(goal.id)}
        className={cn("w-3.5 h-3.5 rounded mt-0.5 shrink-0 cursor-pointer",
          goal.completed ? "bg-success border-success" : "border-border"
        )}
      />
      {isEditing ? (
        <div className="flex-1 flex gap-1">
          <Textarea value={editingText} onChange={e => onEditTextChange(e.target.value)} className="flex-1 min-h-[28px] text-[11px] resize-none" autoFocus />
          <div className="flex flex-col gap-0.5">
            <Button size="icon" variant="ghost" onClick={onSaveEdit} className="h-5 w-5 text-success"><Check className="w-2.5 h-2.5" /></Button>
            <Button size="icon" variant="ghost" onClick={onCancelEdit} className="h-5 w-5 text-destructive"><X className="w-2.5 h-2.5" /></Button>
          </div>
        </div>
      ) : (
        <>
          <span className={cn("flex-1 text-[11px] leading-relaxed", goal.completed ? "text-muted-foreground line-through" : "text-foreground")}>
            {goal.text}
          </span>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button size="icon" variant="ghost" onClick={() => onStartEdit(goal)} className="h-5 w-5"><Pencil className="w-2.5 h-2.5" /></Button>
            <Button size="icon" variant="ghost" onClick={() => onDelete(goal.id)} className="h-5 w-5 text-destructive"><Trash2 className="w-2.5 h-2.5" /></Button>
          </div>
        </>
      )}
    </div>
  );
}
