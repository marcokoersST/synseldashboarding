import { useState } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DashboardAlert } from "@/data/managerOperationalDataV2";

interface Props {
  alerts: DashboardAlert[];
  onSelect: (alert: DashboardAlert) => void;
}

const DOT = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
};

export function LCBSignalRow({ alerts, onSelect }: Props) {
  const [showMore, setShowMore] = useState(false);

  if (alerts.length === 0) {
    return (
      <div className="px-3 py-1 border-b border-border bg-emerald-500/5 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Alle signalen op groen — geen actie vereist.
      </div>
    );
  }

  const visible = alerts.slice(0, 6);
  const more = alerts.slice(6);

  return (
    <div className="flex items-center gap-3 px-3 py-1 border-b border-border bg-card/40 whitespace-nowrap overflow-hidden">
      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground shrink-0">Signalen</span>
      <div className="flex items-center gap-3 min-w-0 overflow-hidden">
        {visible.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a)}
            className="inline-flex items-center gap-1.5 text-[11px] text-foreground hover:text-primary truncate min-w-0"
            title={a.title}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", DOT[a.severity])} />
            <span className="truncate max-w-[220px]">
              {a.consultantName ? `${a.consultantName} — ` : ""}{a.title}
            </span>
          </button>
        ))}
      </div>
      {more.length > 0 && (
        <Popover open={showMore} onOpenChange={setShowMore}>
          <PopoverTrigger asChild>
            <button type="button" className="text-[10px] text-muted-foreground hover:text-foreground shrink-0 ml-auto">
              +{more.length} meer
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-1" align="end">
            {more.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => { setShowMore(false); onSelect(a); }}
                className="w-full flex items-start gap-2 px-2 py-1.5 rounded hover:bg-muted text-left"
              >
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0 mt-1.5", DOT[a.severity])} />
                <span className="text-[11px]">
                  {a.consultantName && <span className="font-medium">{a.consultantName} — </span>}
                  {a.title}
                </span>
              </button>
            ))}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
