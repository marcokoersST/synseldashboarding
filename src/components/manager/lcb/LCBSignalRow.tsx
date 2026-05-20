import { AlertTriangle, AlertCircle, Info, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardAlert } from "@/data/managerOperationalDataV2";

interface Props {
  alerts: DashboardAlert[];
  onSelect: (alert: DashboardAlert) => void;
}

const ICON = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};
const COLOR = {
  critical: "text-red-500 bg-red-500/10 border-red-500/30",
  warning: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  info: "text-blue-500 bg-blue-500/10 border-blue-500/30",
};

export function LCBSignalRow({ alerts, onSelect }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="px-4 py-2 border-b border-border bg-emerald-500/5 text-xs text-emerald-600 dark:text-emerald-400">
        Alle signalen op groen — geen actie vereist.
      </div>
    );
  }
  const visible = alerts.slice(0, 4);
  const more = alerts.length - visible.length;

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card/60 overflow-x-auto">
      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground shrink-0 mr-1">
        Signalen
      </span>
      {visible.map((a) => {
        const Icon = ICON[a.severity];
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors hover:opacity-90",
              COLOR[a.severity],
            )}
          >
            <Icon className="h-3 w-3 shrink-0" />
            <span className="font-medium truncate max-w-[280px]">
              {a.consultantName ? `${a.consultantName} — ` : ""}{a.title}
            </span>
            {a.value && <span className="tabular-nums opacity-80">{a.value}</span>}
            <ChevronRight className="h-3 w-3 shrink-0 opacity-70" />
          </button>
        );
      })}
      {more > 0 && (
        <span className="text-[10px] text-muted-foreground shrink-0">+{more} meer</span>
      )}
    </div>
  );
}
