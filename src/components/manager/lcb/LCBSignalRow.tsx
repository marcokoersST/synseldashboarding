import { useState } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DashboardAlert } from "@/data/managerOperationalDataV2";

interface Props {
  alerts: DashboardAlert[];
  onSelect: (alert: DashboardAlert) => void;
}

const PILL: Record<string, string> = {
  critical: "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400 hover:bg-red-500/20",
  warning: "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400 hover:bg-amber-500/20",
  info: "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400 hover:bg-blue-500/20",
};
const DOT: Record<string, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
};

function shortText(a: DashboardAlert): string {
  const txt = a.consultantName ? `${a.consultantName.split(" ")[0]} • ${a.title}` : a.title;
  return txt.length > 36 ? txt.slice(0, 34) + "…" : txt;
}

export function LCBSignalRow({ alerts, onSelect }: Props) {
  const [showMore, setShowMore] = useState(false);

  if (alerts.length === 0) {
    return (
      <div className="h-7 px-3 border-b border-border bg-gradient-to-r from-emerald-500/10 to-transparent text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Alle signalen op groen — geen actie vereist.
      </div>
    );
  }

  const visible = alerts.slice(0, 7);
  const more = alerts.slice(7);

  return (
    <div className="flex items-center gap-2 px-3 h-9 border-b border-border bg-card/40 whitespace-nowrap overflow-hidden">
      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground shrink-0">Signalen</span>
      <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
        {visible.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a)}
            title={`${a.consultantName ?? ""} — ${a.title}`}
            className={cn(
              "inline-flex items-center gap-1.5 h-6 px-2 rounded-full text-[11px] border transition-colors",
              PILL[a.severity],
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", DOT[a.severity])} />
            <span className="truncate max-w-[200px] font-medium">{shortText(a)}</span>
          </button>
        ))}
      </div>
      {more.length > 0 && (
        <Popover open={showMore} onOpenChange={setShowMore}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="h-6 px-2 rounded-full text-[11px] border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 ml-auto"
            >
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
