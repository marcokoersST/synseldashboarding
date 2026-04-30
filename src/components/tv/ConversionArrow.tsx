import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTVCompact } from "./TVDashboardLayout";

interface ConversionArrowProps {
  rate: number;
}

export function ConversionArrow({ rate }: ConversionArrowProps) {
  const compact = useTVCompact();
  const tone =
    rate >= 70
      ? "bg-accent/10 text-accent border-accent/30"
      : rate >= 40
      ? "bg-muted/40 text-foreground border-border/40"
      : "bg-destructive/10 text-destructive border-destructive/30";

  return (
    <div className={cn("flex items-center justify-center shrink-0", compact ? "px-1" : "px-1")}>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full border font-bold tabular-nums",
          tone,
          compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[11px]"
        )}
      >
        <ChevronRight className={cn(compact ? "w-3 h-3" : "w-3.5 h-3.5")} />
        {rate.toFixed(1)}%
      </span>
    </div>
  );
}
