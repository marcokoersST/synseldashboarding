import { Users } from "lucide-react";
import { candidatesInsides } from "@/data/tvData";
import { useTVCompact } from "./TVDashboardLayout";
import { TileHeader } from "./TileHeader";
import { KPIBadge } from "./KPIBadge";
import { cn } from "@/lib/utils";

export function CandidatesPipeline() {
  const compact = useTVCompact();
  const max = Math.max(...candidatesInsides.bars.map(b => b.count), 1);

  return (
    <div className={cn("bg-card rounded-xl border border-border h-full overflow-hidden flex flex-col", compact ? "p-3" : "p-5")}>
      <TileHeader
        icons={[{ icon: Users, className: "text-primary" }]}
        title="Kandidaten Insides"
        compact={compact}
      />

      {/* Hero counter */}
      <div className={cn("flex items-center justify-center pb-3 mb-3 border-b border-border/50", compact && "pb-2 mb-2")}>
        <KPIBadge
          icon={Users}
          value={candidatesInsides.actief}
          label="actieve kandidaten"
          tone="primary"
          compact={compact}
          size={compact ? "md" : "lg"}
        />
      </div>

      {/* Bargraph */}
      <div className={cn("overflow-y-auto flex-1", compact ? "space-y-1.5" : "space-y-2.5")}>
        {candidatesInsides.bars.map((bar) => (
          <div key={bar.key}>
            <div className={cn("flex justify-between items-center mb-0.5", compact ? "text-[11px]" : "text-xs")}>
              <span className="flex items-center gap-1.5 text-muted-foreground truncate">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: bar.color }} />
                {bar.label}
              </span>
              <span className="font-semibold text-foreground tabular-nums shrink-0 ml-2">{bar.count}</span>
            </div>
            <div className={cn("w-full rounded-full bg-secondary shadow-inner", compact ? "h-1.5" : "h-2")}>
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
