import { conversionFormulas } from "./ConversionLegend";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Persistent legend strip for TV mode that explains every icon used in the
 * UnitFunnelBreakdown column headers. Renders all conversion formulas + the
 * "Gem. dagen" (Clock) entry so a viewer can read the icon meanings from
 * across the room without any interaction.
 */
export function ConversionIconLegend() {
  const items = [
    ...conversionFormulas.map((f) => ({
      icon: f.icon,
      label: f.group,
      formula: f.formula,
    })),
    { icon: Clock, label: "Dagen", formula: "Gem. dagen tot plaatsing" },
  ];

  return (
    <div
      className={cn(
        "rounded-lg bg-muted/30 border border-border/40",
        "px-3 py-1.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
      )}
    >
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 text-sm text-foreground/85"
          >
            <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="font-semibold">{it.label}</span>
            <span className="text-muted-foreground text-xs">{it.formula}</span>
          </span>
        );
      })}
    </div>
  );
}
