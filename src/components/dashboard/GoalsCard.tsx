import { Plus, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const goals = [
  { id: 1, text: "5 nieuwe kandidaten benaderen", completed: true },
  { id: 2, text: "3 sollicitatie gesprekken inplannen", completed: true },
  { id: 3, text: "1 nieuwe klant acquisitie doen", completed: false },
  { id: 4, text: "CV database bijwerken", completed: false },
];

export function GoalsCard() {
  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Persoonlijke Ontwikkeldoelen</h3>
        <button className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Doel toevoegen</span>
        </button>
      </div>
      
      <div className="space-y-3">
        {goals.map((goal) => (
          <div key={goal.id} className="flex items-center gap-3">
            <Checkbox 
              checked={goal.completed}
              className={`w-5 h-5 rounded-md border-2 ${
                goal.completed 
                  ? "bg-success border-success text-success-foreground" 
                  : "border-border"
              }`}
            />
            <span className={`text-sm ${
              goal.completed 
                ? "text-muted-foreground line-through" 
                : "text-foreground"
            }`}>
              {goal.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
