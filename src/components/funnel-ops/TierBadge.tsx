import type { Tier } from "@/data/funnelOperationsData";
import { cn } from "@/lib/utils";

const STYLES: Record<Tier, string> = {
  "A+": "bg-destructive/15 text-destructive border-destructive/30",
  "A":  "bg-orange-500/15 text-orange-500 border-orange-500/30",
  "B":  "bg-blue-500/15 text-blue-500 border-blue-500/30",
  "C":  "bg-success/15 text-success border-success/30",
  "D":  "bg-muted text-muted-foreground border-border",
};

export function TierBadge({ tier, className }: { tier: Tier; className?: string }) {
  return (
    <span className={cn("inline-flex items-center justify-center rounded border px-1.5 py-0.5 text-[10px] font-semibold tabular-nums", STYLES[tier], className)}>
      {tier}
    </span>
  );
}
