import { cn } from "@/lib/utils";
import type { EventCounters, EventLogRow } from "@/data/systeemHygieneData";

type CounterKey = "added" | "updated" | "deleted" | "stageChanges" | "notesAdded" | "tasksAdded";

function formatTime(min: number) {
  if (min < 60) return `${min}m geleden`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}u geleden`;
  return `${Math.floor(h / 24)}d geleden`;
}

const COUNTER_DEFS: { key: CounterKey; label: string }[] = [
  { key: "added", label: "Toegevoegd" },
  { key: "updated", label: "Bijgewerkt" },
  { key: "deleted", label: "Verwijderd" },
  { key: "stageChanges", label: "Stage changes" },
  { key: "notesAdded", label: "Notes" },
  { key: "tasksAdded", label: "Tasks" },
];

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-3 md:grid-cols-5",
  6: "grid-cols-3 md:grid-cols-6",
};

export function EventCountersStrip({ counters, className, exclude }: { counters: EventCounters; className?: string; exclude?: CounterKey[] }) {
  const items = COUNTER_DEFS
    .filter(d => !exclude?.includes(d.key))
    .map(d => ({ label: d.label, value: counters[d.key] }));
  const cols = GRID_COLS[items.length] ?? "grid-cols-3 md:grid-cols-6";
  return (
    <div className={cn("grid gap-2", cols, className)}>
      {items.map(it => (
        <div key={it.label} className="rounded-lg border border-border bg-card/50 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{it.label}</div>
          <div className="text-lg font-semibold tabular-nums text-foreground">{it.value.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

export function EventLogList({ rows, className }: { rows: EventLogRow[]; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {rows.map(r => (
        <div key={r.id} className="flex items-start justify-between gap-3 rounded-md border border-border/60 bg-card/30 px-3 py-2 text-xs">
          <div className="min-w-0 text-foreground">
            {r.sentence}
          </div>
          <div className="shrink-0 text-[10px] text-muted-foreground tabular-nums">{formatTime(r.minutesAgo)}</div>
        </div>
      ))}
    </div>
  );
}
