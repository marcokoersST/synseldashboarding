import { cn } from "@/lib/utils";
import type { EventCounters, EventLogRow } from "@/data/systeemHygieneData";

function formatTime(min: number) {
  if (min < 60) return `${min}m geleden`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}u geleden`;
  return `${Math.floor(h / 24)}d geleden`;
}

export function EventCountersStrip({ counters, className }: { counters: EventCounters; className?: string }) {
  const items: { label: string; value: number }[] = [
    { label: "Toegevoegd", value: counters.added },
    { label: "Bijgewerkt", value: counters.updated },
    { label: "Verwijderd", value: counters.deleted },
    { label: "Stage changes", value: counters.stageChanges },
    { label: "Notes", value: counters.notesAdded },
    { label: "Tasks", value: counters.tasksAdded },
  ];
  return (
    <div className={cn("grid grid-cols-3 md:grid-cols-6 gap-2", className)}>
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
          <div className="min-w-0">
            <span className="font-medium text-foreground">{r.owner}</span>{" "}
            <span className="text-muted-foreground">{r.action}</span>{" "}
            <span className="font-medium text-foreground">{r.field}</span>{" "}
            <span className="text-muted-foreground">on</span>{" "}
            <span className="text-foreground">{r.entityName}</span>
          </div>
          <div className="shrink-0 text-[10px] text-muted-foreground tabular-nums">{formatTime(r.minutesAgo)}</div>
        </div>
      ))}
    </div>
  );
}
