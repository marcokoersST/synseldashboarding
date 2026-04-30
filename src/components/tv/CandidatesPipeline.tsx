import { Users } from "lucide-react";
import { candidatesInsides } from "@/data/tvData";
import { useTVCompact } from "./TVDashboardLayout";
import { cn } from "@/lib/utils";

export function CandidatesPipeline() {
  const compact = useTVCompact();
  const max = Math.max(...candidatesInsides.bars.map(b => b.count), 1);

  return (
    <div className={cn("bg-card rounded-xl border border-border h-full overflow-hidden flex flex-col", compact ? "p-3" : "p-5")}>
      <h3 className={cn("font-semibold text-foreground flex items-center gap-2", compact ? "text-xs mb-1" : "text-sm mb-2")}>
        <Users className={cn(compact ? "w-3.5 h-3.5" : "w-4 h-4", "text-primary")} />
        Kandidaten Insides
      </h3>

      {/* Counter */}
      <div className={cn("flex items-baseline gap-2 mb-3 pb-3 border-b border-border/50", compact && "mb-2 pb-2")}>
        <p className={cn("font-bold text-foreground tabular-nums", compact ? "text-2xl" : "text-3xl")}>
          {candidatesInsides.actief}
        </p>
        <p className={cn("font-medium text-muted-foreground", compact ? "text-xs" : "text-sm")}>
          actieve kandidaten
        </p>
      </div>

      {/* Bargraph */}
      <div className={cn("overflow-y-auto flex-1", compact ? "space-y-1.5" : "space-y-2.5")}>
        {candidatesInsides.bars.map((bar) => (
          <div key={bar.key}>
            <div className={cn("flex justify-between mb-0.5", compact ? "text-[11px]" : "text-xs")}>
              <span className="text-muted-foreground truncate">{bar.label}</span>
              <span className="font-semibold text-foreground tabular-nums shrink-0 ml-2">{bar.count}</span>
            </div>
            <div className={cn("w-full rounded-full bg-secondary", compact ? "h-1.5" : "h-2")}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(bar.count / max) * 100}%`, backgroundColor: bar.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
