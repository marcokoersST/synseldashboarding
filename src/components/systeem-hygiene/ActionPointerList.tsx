import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ENTITY_LABEL, type ActionPointer } from "@/data/systeemHygieneData";

const priorityStyle: Record<ActionPointer["priority"], string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400",
  low: "bg-muted text-muted-foreground border-border",
};

const priorityLabel: Record<ActionPointer["priority"], string> = {
  high: "Hoog",
  medium: "Middel",
  low: "Laag",
};

export function ActionPointerList({ items, className, showEntity = false }: { items: ActionPointer[]; className?: string; showEntity?: boolean }) {
  return (
    <div className={cn("space-y-2", className)}>
      {items.map((a, i) => (
        <div key={i} className={cn(
          "flex items-start gap-3 rounded-lg border bg-card/50 p-3",
          a.flagged ? "border-destructive/50 bg-destructive/5" : "border-border",
        )}>
          <Badge variant="outline" className={cn("shrink-0 text-[10px] uppercase tracking-wider", priorityStyle[a.priority])}>{priorityLabel[a.priority]}</Badge>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-sm font-medium text-foreground">{a.issue}</span>
              {a.flagged && <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-destructive/15 text-destructive border-destructive/40">Sales risk</Badge>}
              {showEntity && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{ENTITY_LABEL[a.entity]}</span>}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              <span className="text-foreground/80">Actie:</span> {a.suggestedAction} · <span className="text-foreground/80">{a.affectedRecords}</span> records · <span className="text-foreground/80">{a.owner}</span>
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground italic">{a.impact}</div>
          </div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
      ))}
    </div>
  );
}
