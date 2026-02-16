import { useTVCompact } from "./TVDashboardLayout";
import { conversionFormulas } from "./ConversionLegend";
import { columnGroups, getTotalValue } from "./UnitFunnelBreakdown";
import { cn } from "@/lib/utils";

function rateVsBenchmark(actual: number, benchmark: number) {
  if (actual >= benchmark) return "text-accent";
  if (actual >= benchmark * 0.7) return "text-foreground";
  return "text-destructive";
}

function parseBenchmark(b: string): number {
  return parseFloat(b.replace("≥ ", "").replace("%", ""));
}

export function ConversionFormulasCard() {
  const compact = useTVCompact();

  const actuals = conversionFormulas.map((f) => {
    for (const g of columnGroups) {
      for (const sub of g.subs) {
        if (sub.type === "conv") {
          const groupMatch = g.group === f.group;
          const labelMatch = sub.label === f.label;
          if (groupMatch && labelMatch) {
            return getTotalValue(sub);
          }
        }
      }
    }
    return "—";
  });

  return (
    <div className={cn("bg-card rounded-xl border border-border h-full overflow-hidden flex flex-col", compact ? "p-3" : "p-5")}>
      <h3 className={cn("font-semibold text-foreground", compact ? "text-xs mb-1" : "text-sm mb-3")}>
        Conversieformules & Benchmarks
      </h3>
      {/* Column headers */}
      <div className={cn(
        "grid items-center border-b border-border text-muted-foreground font-medium uppercase tracking-wide",
        compact
          ? "grid-cols-[16px_80px_1fr_48px_48px] gap-2 text-[9px] px-1.5 pb-1 mb-1"
          : "grid-cols-[16px_100px_1fr_60px_60px] gap-3 text-[10px] px-2 pb-1.5 mb-1.5"
      )}>
        <span />
        <span>Groep</span>
        <span>Formule</span>
        <span className="text-right">Actueel</span>
        <span className="text-right">Doel</span>
      </div>

      <div className={cn("overflow-y-auto flex-1", compact ? "space-y-1" : "space-y-1.5")}>
        {conversionFormulas.map((f, i) => {
          const actualStr = actuals[i];
          const actualNum = parseFloat(actualStr);
          const benchNum = parseBenchmark(f.benchmark);
          const colorClass = !isNaN(actualNum) ? rateVsBenchmark(actualNum, benchNum) : "text-muted-foreground";
          const IconComp = f.icon;

          return (
            <div
              key={i}
              className={cn(
                "grid items-center rounded",
                compact
                  ? "grid-cols-[16px_80px_1fr_48px_48px] gap-2 text-[11px] px-1.5 py-1"
                  : "grid-cols-[16px_100px_1fr_60px_60px] gap-3 text-xs px-2 py-1 bg-muted/20"
              )}
            >
              <IconComp className="text-muted-foreground w-3 h-3" />
              <span className="text-muted-foreground truncate">{f.group}</span>
              <span className="font-medium text-foreground truncate">{f.formula}</span>
              <span className={cn("text-right font-bold tabular-nums", colorClass)}>{actualStr}</span>
              <span className="text-right text-muted-foreground tabular-nums">{f.benchmark}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
