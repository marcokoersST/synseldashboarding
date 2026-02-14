import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTVCompact } from "./TVDashboardLayout";

interface ConversionArrowProps {
  rate: number;
}

export function ConversionArrow({ rate }: ConversionArrowProps) {
  const compact = useTVCompact();

  return (
    <div className={cn("flex flex-col items-center justify-center shrink-0", compact ? "px-2" : "px-1")}>
      <ChevronRight className={cn("text-muted-foreground", compact ? "w-4 h-4" : "w-5 h-5")} />
      <span className={cn(
        "font-bold tabular-nums",
        compact ? "text-[10px]" : "text-xs",
        rate >= 70 ? "text-accent" : rate >= 40 ? "text-foreground" : "text-destructive"
      )}>
        {rate.toFixed(1)}%
      </span>
    </div>
  );
}
