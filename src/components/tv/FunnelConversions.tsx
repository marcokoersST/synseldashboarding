import { weekOverallConversions, weekUnitConversions } from "@/data/tvData";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

function rateColor(rate: number) {
  if (rate >= 70) return "text-accent";
  if (rate >= 40) return "text-foreground";
  return "text-destructive";
}

export function FunnelConversions() {
  return (
    <div className="bg-card rounded-xl p-5 border border-border animate-fade-in">
      <h3 className="text-sm font-semibold text-foreground mb-4">Conversiepercentages</h3>

      {/* Overall */}
      <div className="flex flex-wrap gap-2 mb-5">
        {weekOverallConversions.map((c) => (
          <div key={c.from + c.to} className="flex items-center gap-1.5 bg-muted/50 rounded-lg px-3 py-2 text-xs">
            <span className="text-muted-foreground">{c.from}</span>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">{c.to}</span>
            <span className={cn("font-bold ml-1", rateColor(c.rate))}>{c.rate.toFixed(1)}%</span>
          </div>
        ))}
      </div>

      {/* Per unit */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Unit</th>
              {weekOverallConversions.map((c) => (
                <th key={c.from + c.to} className="text-right py-2 px-2 text-muted-foreground font-medium whitespace-nowrap">
                  {c.from.slice(0, 5)}→{c.to.slice(0, 5)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekUnitConversions.map((uc) => (
              <tr key={uc.unit} className="border-b border-border/50">
                <td className="py-2 pr-4 font-medium">{uc.unit}</td>
                {uc.conversions.map((c) => (
                  <td key={c.from + c.to} className={cn("text-right py-2 px-2 tabular-nums font-semibold", rateColor(c.rate))}>
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
