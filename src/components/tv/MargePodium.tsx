import { Crown, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTVCompact } from "@/components/tv/TVDashboardLayout";
import type { CompetitionEntry } from "@/data/tvData";

const medalStyles = [
  { color: "text-[hsl(45,80%,50%)]", bg: "bg-[hsl(45,80%,50%,0.15)]", border: "border-[hsl(45,80%,50%,0.3)]", height: "h-32", heightCompact: "flex-[3]" },
  { color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border", height: "h-24", heightCompact: "flex-[2.2]" },
  { color: "text-[hsl(25,60%,45%)]", bg: "bg-[hsl(25,60%,45%,0.15)]", border: "border-[hsl(25,60%,45%,0.3)]", height: "h-20", heightCompact: "flex-[1.8]" },
];

const fmt = (v: number) => `€${(v / 1000).toFixed(0)}K`;

interface MargePodiumProps {
  entries: CompetitionEntry[];
}

export function MargePodium({ entries }: MargePodiumProps) {
  const compact = useTVCompact();
  const top3 = entries.slice(0, 3);
  if (top3.length < 3) return null;

  const order = [top3[1], top3[0], top3[2]];
  const styleOrder = [medalStyles[1], medalStyles[0], medalStyles[2]];
  const ranks = [2, 1, 3];

  return (
    <div className={cn(
      "bg-card rounded-xl border border-border animate-fade-in flex flex-col",
      compact ? "p-3 h-full" : "p-4 mb-4"
    )}>
      <div className="flex items-center gap-2 mb-3">
        <Medal className={cn("text-primary", compact ? "w-4 h-4" : "w-5 h-5")} />
        <h3 className={cn("font-semibold text-foreground", compact ? "text-xs" : "text-sm")}>Top 3 Margebaas</h3>
      </div>
      <div className={cn("flex items-end justify-center gap-3", compact ? "flex-1 min-h-0" : "")}>
        {order.map((entry, i) => {
          const style = styleOrder[i];
          const rank = ranks[i];
          return (
            <div key={entry.name} className={cn(
              "flex flex-col items-center flex-1 max-w-[200px]",
              compact ? "h-full justify-end" : ""
            )}>
              {rank === 1 && <Crown className={cn("mb-1", style.color, compact ? "w-5 h-5" : "w-6 h-6")} />}
              <span className={cn("text-muted-foreground mb-1 truncate max-w-full", compact ? "text-[10px]" : "text-xs")}>{entry.name}</span>
              <span className={cn("font-bold mb-2", style.color, compact ? "text-xs" : "text-sm")}>{fmt(entry.value)}</span>
              <div className={cn(
                "w-full rounded-t-lg border-t border-x flex items-end justify-center pb-2",
                style.bg, style.border,
                compact ? style.heightCompact : style.height
              )}>
                <span className={cn("font-black", style.color, compact ? "text-xl" : "text-2xl")}>{rank}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
