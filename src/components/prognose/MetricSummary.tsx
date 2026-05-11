import { cn } from "@/lib/utils";

export interface Stat {
  label: string;
  value: string | number;
  tone?: "default" | "good" | "warn" | "bad";
}

const TONE: Record<NonNullable<Stat["tone"]>, string> = {
  default: "text-foreground",
  good: "text-emerald-600",
  warn: "text-amber-600",
  bad: "text-destructive",
};

export function MetricSummary({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-muted/30 border-b">
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <div className={cn("text-lg font-bold tabular-nums", TONE[s.tone || "default"])}>
            {s.value}
          </div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
