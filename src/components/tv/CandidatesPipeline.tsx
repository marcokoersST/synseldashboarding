import { candidatePipeline } from "@/data/tvData";
import { useTVCompact } from "./TVDashboardLayout";
import { cn } from "@/lib/utils";

export function CandidatesPipeline() {
  const compact = useTVCompact();
  const total = candidatePipeline.reduce((s, p) => s + p.count, 0);

  return (
    <div className={cn("bg-card rounded-xl border border-border h-full overflow-hidden", compact ? "p-2" : "p-5")}>
      <h3 className={cn("font-semibold text-foreground", compact ? "text-[10px] mb-0.5" : "text-sm mb-1")}>Kandidaten in Procedure</h3>
      <p className={cn("font-bold text-foreground", compact ? "text-sm mb-1" : "text-2xl mb-4")}>{total} <span className={cn("font-normal text-muted-foreground", compact ? "text-[9px]" : "text-sm")}>kandidaten actief</span></p>
      <div className={cn(compact ? "space-y-0.5 overflow-y-auto" : "space-y-3")}>
        {candidatePipeline.map((phase) => (
          <div key={phase.phase}>
            <div className={cn("flex justify-between mb-0.5", compact ? "text-[10px]" : "text-sm")}>
              <span className="text-muted-foreground">{phase.phase}</span>
              <span className="font-medium text-foreground">{phase.count}</span>
            </div>
            <div className={cn("w-full rounded-full bg-secondary", compact ? "h-1" : "h-2.5")}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(phase.count / total) * 100}%`, backgroundColor: phase.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
