import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import type { FunnelAgg } from "@/data/preMatchingData";

interface Props {
  data: FunnelAgg[];
  className?: string;
}

export function FunnelSteps({ data, className }: Props) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className={cn("grid gap-2 md:grid-cols-5", className)}>
      {data.map((d, i) => (
        <Card key={d.step} className="relative p-4">
          {i > 0 && (
            <ChevronRight className="absolute -left-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-muted-foreground md:block" />
          )}
          <div className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">{d.step}</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-foreground">{d.count}</div>
          <div className="mt-1 text-xs tabular-nums">
            {d.conversion === null ? (
              <span className="text-muted-foreground">start</span>
            ) : (
              <span
                className={cn(
                  "font-medium",
                  d.conversion >= 60 ? "text-emerald-600" : d.conversion >= 35 ? "text-amber-600" : "text-destructive",
                )}
              >
                {d.conversion.toFixed(1)}% t.o.v. vorige stap
              </span>
            )}
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(d.count / max) * 100}%` }} />
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground tabular-nums">
            {d.fromStart.toFixed(1)}% van alle matches
          </div>
        </Card>
      ))}
    </div>
  );
}

export default FunnelSteps;
