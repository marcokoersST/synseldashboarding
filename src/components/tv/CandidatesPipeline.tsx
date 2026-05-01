import { Users } from "lucide-react";
import { candidatesInsides } from "@/data/tvData";
import { useTVCompact } from "./TVDashboardLayout";
import { TileHeader } from "./TileHeader";
import { KPIBadge } from "./KPIBadge";
import { cn } from "@/lib/utils";
import { DevNote } from "@/components/groeimodel/DevNote";

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
          compact={false}
          size="lg"
        />
      </div>

      {/* Bargraph — distributed evenly to fill the available height */}
      <div className={cn("flex-1 min-h-0 flex flex-col justify-between", compact ? "gap-1.5" : "gap-2.5")}>
        {candidatesInsides.bars.map((bar) => (
          <div key={bar.key}>
            <div className={cn("flex justify-between items-center mb-1", compact ? "text-sm" : "text-xs")}>
              <span className="flex items-center gap-1.5 text-muted-foreground truncate">
                <span className={cn("rounded-full shrink-0", compact ? "w-2 h-2" : "w-1.5 h-1.5")} style={{ backgroundColor: bar.color }} />
                {bar.label}
              </span>
              <span className={cn("font-bold text-foreground tabular-nums shrink-0 ml-2", compact ? "text-base" : "")}>{bar.count}</span>
            </div>
            <div className={cn("w-full rounded-full bg-secondary shadow-inner", compact ? "h-2.5" : "h-2")}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(bar.count / max) * 100}%`, backgroundColor: bar.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {!compact && (
        <DevNote
          story={<><strong>As a user (manager/TV viewer)</strong>, I want to see how many active candidates are currently in each pipeline stage, <strong>so that</strong> I can gauge the health of the candidate pool and identify stages that need attention.</>}
          logic={`Hero counter at the top shows the total number of
active candidates across all stages.

Below it, 8 horizontal bars represent pipeline stages:
  Op verdelen, Op inschrijven, In procedure,
  Met uitnodigingen, Met gesprekken,
  Op gesprek geweest, Procedures met dealsluiter,
  Geplaatst.

Each bar's width is proportional to the highest count
(max-normalised). Colors are distinct per stage.

Data source: candidatesInsides from tvData.ts.
This is a snapshot — it does not change with the
date filter, only with unit selection.`}
        />
      )}
    </div>
  );
}
