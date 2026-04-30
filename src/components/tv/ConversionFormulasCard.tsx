import { Sigma } from "lucide-react";
import { useTVCompact } from "./TVDashboardLayout";
import { conversionFormulas } from "./ConversionLegend";
import { columnGroups, getTotalValue } from "./UnitFunnelBreakdown";
import { TileHeader } from "./TileHeader";
import { cn } from "@/lib/utils";
import { weekUnitBreakdown, UnitFunnelRow } from "@/data/tvData";

function statusClasses(actual: number, benchmark: number) {
  if (actual >= benchmark) return "bg-accent/10 text-accent";
  if (actual >= benchmark * 0.7) return "bg-muted/40 text-foreground";
  return "bg-destructive/10 text-destructive";
}

function parseBenchmark(b: string): number {
  return parseFloat(b.replace("≥ ", "").replace("%", ""));
}

interface ConversionFormulasCardProps {
  data?: UnitFunnelRow[];
}

export function ConversionFormulasCard({ data }: ConversionFormulasCardProps = {}) {
  const compact = useTVCompact();
  const rows = data ?? weekUnitBreakdown;

  const actuals = conversionFormulas.map((f) => {
    for (const g of columnGroups) {
      for (const sub of g.subs) {
        if (sub.type === "conv") {
          if (g.group === f.group && sub.label === f.label) {
            return getTotalValue(sub, rows);
          }
        }
      }
    }
    return "—";
  });

  return (
    <div className={cn("bg-card rounded-xl border border-border h-full overflow-hidden flex flex-col", compact ? "p-3" : "p-5")}>
      <TileHeader
        icons={[{ icon: Sigma, className: "text-primary" }]}
        title="Conversieformules & Benchmarks"
        compact={compact}
      />

      {/* Column headers */}
      <div className={cn(
        "grid items-center rounded-md bg-muted/20 text-muted-foreground font-medium uppercase tracking-wide",
        compact
          ? "grid-cols-[16px_110px_1fr_56px_56px] gap-2 text-[9px] px-1.5 py-1 mb-1"
          : "grid-cols-[16px_130px_1fr_64px_64px] gap-3 text-[10px] px-2 py-1.5 mb-1.5"
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
          const status = !isNaN(actualNum) ? statusClasses(actualNum, benchNum) : "bg-muted/40 text-muted-foreground";
          const IconComp = f.icon;

          return (
            <div
              key={i}
              className={cn(
                "grid items-center rounded-md",
                compact
                  ? "grid-cols-[16px_110px_1fr_56px_56px] gap-2 text-[11px] px-1.5 py-1"
                  : "grid-cols-[16px_130px_1fr_64px_64px] gap-3 text-xs px-2 py-1 bg-muted/10"
              )}
            >
              <span className="rounded-full bg-muted/60 w-4 h-4 flex items-center justify-center">
                <IconComp className="text-muted-foreground w-2.5 h-2.5" />
              </span>
              <span className="text-muted-foreground">{f.group}</span>
              <span className="font-medium text-foreground truncate">{f.formula}</span>
              <span className={cn("text-right font-bold tabular-nums rounded-full px-1.5 py-0.5", status)}>
                {actualStr}
              </span>
              <span className="text-right text-muted-foreground tabular-nums rounded-full px-1.5 py-0.5 border border-border/40">
                {f.benchmark.replace("≥ ", "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
