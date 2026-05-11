import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "clean" | "attention" | "critical";

export interface BottleneckRow {
  key: string;
  label: string;
  score: number; // 0-100
  status: Status;
  metric: string;
}

const BAR: Record<Status, string> = {
  clean: "bg-emerald-500",
  attention: "bg-amber-500",
  critical: "bg-destructive",
};
const TXT: Record<Status, string> = {
  clean: "text-emerald-600",
  attention: "text-amber-600",
  critical: "text-destructive",
};

interface Props {
  rows: BottleneckRow[];
  onSelect: (key: string) => void;
}

export function BottleneckRanking({ rows, onSelect }: Props) {
  const sorted = [...rows].sort((a, b) => a.score - b.score);
  const worstKey = sorted[0]?.key;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 pt-3 px-4 border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          Bottleneck-ranking
          <span className="ml-auto text-[10px] font-normal text-muted-foreground">
            Worst → best
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 space-y-1">
        {sorted.map((r) => {
          const gap = r.score - 100;
          return (
            <button
              key={r.key}
              onClick={() => onSelect(r.key)}
              className={cn(
                "w-full text-left rounded-md px-2 py-1.5 hover:bg-muted/60 transition-colors group",
                r.key === worstKey && "ring-1 ring-destructive/30 bg-destructive/5",
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-medium truncate">{r.label}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("text-[10px] font-semibold tabular-nums", TXT[r.status])}>
                    {gap >= 0 ? "+" : ""}{gap}%
                  </span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{r.metric}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full transition-all", BAR[r.status])}
                  style={{ width: `${Math.min(100, Math.max(2, r.score))}%` }}
                />
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
