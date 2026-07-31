import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronRight, Sparkles, UserCog, UserCheck, Building2, Handshake } from "lucide-react";
import type { FunnelAgg } from "@/data/preMatchingData";

const STEP_ICONS = [Sparkles, UserCog, UserCheck, Building2, Handshake];
const STEP_TONES = [
  "bg-primary/10 text-primary",
  "bg-sky-500/10 text-sky-600",
  "bg-violet-500/10 text-violet-600",
  "bg-amber-500/10 text-amber-600",
  "bg-emerald-500/10 text-emerald-600",
];

interface Props {
  data: FunnelAgg[];
  className?: string;
}

export function FunnelSteps({ data, className }: Props) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className={cn("grid gap-2 md:grid-cols-5", className)}>
      {data.map((d, i) => {
        const Icon = STEP_ICONS[i] ?? Sparkles;
        return (
        <Card key={d.step} className="relative p-4">
          {i > 0 && (
            <ChevronRight className="absolute -left-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-muted-foreground md:block" />
          )}
          <div className="flex items-start gap-2">
            <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", STEP_TONES[i] ?? STEP_TONES[0])}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">{d.step}</div>
          </div>
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
        );
      })}
    </div>
  );
}

export default FunnelSteps;
