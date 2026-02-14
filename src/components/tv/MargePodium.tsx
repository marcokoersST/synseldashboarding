import { Crown, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompetitionEntry } from "@/data/tvData";

const medalStyles = [
  { color: "text-[hsl(45,80%,50%)]", bg: "bg-[hsl(45,80%,50%,0.15)]", border: "border-[hsl(45,80%,50%,0.3)]", height: "h-32" },
  { color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border", height: "h-24" },
  { color: "text-[hsl(25,60%,45%)]", bg: "bg-[hsl(25,60%,45%,0.15)]", border: "border-[hsl(25,60%,45%,0.3)]", height: "h-20" },
];

const fmt = (v: number) => `€${(v / 1000).toFixed(0)}K`;

interface MargePodiumProps {
  entries: CompetitionEntry[];
}

export function MargePodium({ entries }: MargePodiumProps) {
  const top3 = entries.slice(0, 3);
  if (top3.length < 3) return null;

  // Render order: #2, #1, #3
  const order = [top3[1], top3[0], top3[2]];
  const styleOrder = [medalStyles[1], medalStyles[0], medalStyles[2]];
  const ranks = [2, 1, 3];

  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Medal className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Top 3 Margebaas</h3>
      </div>
      <div className="flex items-end justify-center gap-3">
        {order.map((entry, i) => {
          const style = styleOrder[i];
          const rank = ranks[i];
          return (
            <div key={entry.name} className="flex flex-col items-center flex-1 max-w-[200px]">
              {rank === 1 && <Crown className={cn("w-6 h-6 mb-1", style.color)} />}
              <span className="text-xs text-muted-foreground mb-1 truncate max-w-full">{entry.name}</span>
              <span className={cn("text-sm font-bold mb-2", style.color)}>{fmt(entry.value)}</span>
              <div className={cn(
                "w-full rounded-t-lg border-t border-x flex items-end justify-center pb-2",
                style.bg, style.border, style.height
              )}>
                <span className={cn("text-2xl font-black", style.color)}>{rank}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
