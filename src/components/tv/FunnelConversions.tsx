import { weekOverallConversions, weekUnitConversions } from "@/data/tvData";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTVCompact } from "./TVDashboardLayout";

function rateColor(rate: number) {
  if (rate >= 70) return "text-accent";
  if (rate >= 40) return "text-foreground";
  return "text-destructive";
}

export function FunnelConversions() {
  const compact = useTVCompact();

  return (
    <div className={cn("bg-card rounded-xl border border-border animate-fade-in", compact ? "p-3" : "p-5")}>
      <h3 className={cn("font-semibold text-foreground", compact ? "text-xs mb-2" : "text-sm mb-4")}>Conversiepercentages</h3>

      {/* Overall */}
      <div className={cn("flex flex-wrap mb-3", compact ? "gap-1" : "gap-2")}>
        {weekOverallConversions.map((c) => (
          <div key={c.from + c.to} className={cn("flex items-center gap-1 bg-muted/50 rounded-lg", compact ? "px-2 py-1 text-[10px]" : "px-3 py-2 text-xs")}>
            <span className="text-muted-foreground">{c.from}</span>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">{c.to}</span>
            <span className={cn("font-bold ml-1", rateColor(c.rate))}>{c.rate.toFixed(1)}%</span>
          </div>
        ))}
      </div>

      {/* Per unit */}
      <div className="overflow-x-auto">
        <table className={cn("w-full", compact ? "text-[10px]" : "text-xs")}>
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-1 pr-4 text-muted-foreground font-medium">Unit</th>
              {weekOverallConversions.map((c) => (
                <th key={c.from + c.to} className="text-right py-1 px-2 text-muted-foreground font-medium whitespace-nowrap">
                  {c.from.slice(0, 5)}→{c.to.slice(0, 5)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekUnitConversions.map((uc) => (
              <tr key={uc.unit} className="border-b border-border/50">
                <td className="py-1 pr-4 font-medium">{uc.unit}</td>
                {uc.conversions.map((c) => (
                  <td key={c.from + c.to} className={cn("text-right py-1 px-2 tabular-nums font-semibold", rateColor(c.rate))}>
                    {c.rate.toFixed(1)}%
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
