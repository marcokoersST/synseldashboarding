import { Sigma } from "lucide-react";
import { useTVCompact } from "./TVDashboardLayout";
import { conversionFormulas } from "./ConversionLegend";
import { columnGroups, getTotalValue } from "./UnitFunnelBreakdown";
import { TileHeader } from "./TileHeader";
import { cn } from "@/lib/utils";
import { weekUnitBreakdown, UnitFunnelRow } from "@/data/tvData";
import { DevNote } from "@/components/groeimodel/DevNote";

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
          if (sub.label === f.label) {
            return getTotalValue(sub, rows);
          }
        }
      }
    }
    return "—";
  });

  // Grid template: in TV mode, every formula row shares the available height equally.
  const listStyle = compact
    ? { gridTemplateRows: `repeat(${conversionFormulas.length}, minmax(0, 1fr))` }
    : undefined;

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
          ? "grid-cols-[20px_130px_1fr_70px_70px] gap-2 text-xs px-2 py-1.5 mb-1.5"
          : "grid-cols-[16px_130px_1fr_64px_64px] gap-3 text-[10px] px-2 py-1.5 mb-1.5"
      )}>
        <span />
        <span>Groep</span>
        <span>Formule</span>
        <span className="text-right">Actueel</span>
        <span className="text-right">Doel</span>
      </div>

      <div
        className={cn(
          "flex-1 min-h-0",
          compact ? "grid gap-1" : "space-y-1.5"
        )}
        style={listStyle}
      >
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
                  ? "grid-cols-[20px_130px_1fr_70px_70px] gap-2 text-sm px-2 py-1 bg-muted/10"
                  : "grid-cols-[16px_130px_1fr_64px_64px] gap-3 text-xs px-2 py-1 bg-muted/10"
              )}
            >
              <span className={cn("rounded-full bg-muted/60 flex items-center justify-center", compact ? "w-5 h-5" : "w-4 h-4")}>
                <IconComp className={cn("text-muted-foreground", compact ? "w-3 h-3" : "w-2.5 h-2.5")} />
              </span>
              <span className="text-muted-foreground truncate">{f.group}</span>
              <span className="font-medium text-foreground truncate">{f.formula}</span>
              <span className={cn("text-right font-bold tabular-nums rounded-full px-1.5 py-0.5", status, compact && "text-base")}>
                {actualStr}
              </span>
              <span className={cn("text-right text-muted-foreground tabular-nums rounded-full px-1.5 py-0.5 border border-border/40", compact && "text-base")}>
                {f.benchmark.replace("≥ ", "")}
              </span>
            </div>
          );
        })}
      </div>

      {!compact && (
        <DevNote
          id={7}
          story={<><strong>As a user (manager/TV viewer)</strong>, I want to see the key conversion ratios compared against benchmark targets, <strong>so that</strong> I can instantly judge which parts of the funnel are under- or over-performing.</>}
          logic={`Each row represents a conversion formula defined in
ConversionLegend.ts — e.g. "Inschr. %" = Ingeschreven
÷ Toegewezen × 100.

The "Actueel" column computes the ratio from the Totaal
row of the UnitFunnelBreakdown data (sum across all
visible units).

Color coding of the Actueel pill:
  ≥ benchmark → green (accent)
  ≥ 70% of benchmark → neutral
  < 70% of benchmark → red (destructive)

The "Doel" column shows the static benchmark from
conversionFormulas (e.g. "≥ 60%").

When period data is passed via the data prop, the card
recalculates against period totals instead of week.`}
        />
      )}
    </div>
  );
}
