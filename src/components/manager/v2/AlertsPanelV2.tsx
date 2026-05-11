import { useState, useEffect } from "react";
import { AlertTriangle, AlertOctagon, X, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { generateAlerts, type DashboardAlert } from "@/data/managerOperationalDataV2";

const STORAGE_DISMISSED = "mgr-v2-alerts-dismissed";
const STORAGE_COLLAPSED = "mgr-v2-alerts-collapsed";

function loadDismissed(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_DISMISSED);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

const severityConfig = {
  critical: {
    border: "border-l-destructive",
    bg: "bg-destructive/5",
    icon: AlertOctagon,
    iconClass: "text-destructive",
    badgeClass: "bg-destructive text-destructive-foreground",
  },
  warning: {
    border: "border-l-amber-500",
    bg: "bg-amber-500/5",
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    badgeClass: "bg-amber-500 text-white",
  },
  info: {
    border: "border-l-blue-500",
    bg: "",
    icon: AlertTriangle,
    iconClass: "text-blue-500",
    badgeClass: "bg-blue-500 text-white",
  },
};

function AlertTile({ alert, onDismiss }: { alert: DashboardAlert; onDismiss: (id: string) => void }) {
  const config = severityConfig[alert.severity];
  const Icon = config.icon;

  return (
    <div className={cn(
      "group relative flex gap-3 rounded-lg border border-border border-l-[3px] p-3 transition-colors hover:bg-accent/30",
      config.border, config.bg
    )}>
      {alert.consultantAvatar ? (
        <Avatar className="h-8 w-8 mt-0.5 shrink-0">
          <AvatarImage src={alert.consultantAvatar} alt={alert.consultantName} />
          <AvatarFallback className="text-[10px]">
            {alert.consultantName?.split(" ").map(n => n[0]).join("") ?? "?"}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary mt-0.5">
          <Icon size={16} className={config.iconClass} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold text-foreground leading-tight">{alert.title}</p>
          {alert.value && (
            <Badge variant="outline" className={cn("text-[10px] shrink-0 py-0",
              alert.severity === "critical" ? "border-destructive/30 text-destructive" : "border-amber-500/30 text-amber-600"
            )}>
              {alert.value}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{alert.message}</p>
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function AlertsPanelV2({ variant = "panel" }: { variant?: "panel" | "embedded" } = {}) {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_COLLAPSED) === "true"; } catch { return false; }
  });
  const [dismissedIds, setDismissedIds] = useState<string[]>(loadDismissed);

  const allAlerts = generateAlerts();

  useEffect(() => {
    localStorage.setItem(STORAGE_COLLAPSED, String(collapsed));
  }, [collapsed]);
  useEffect(() => {
    localStorage.setItem(STORAGE_DISMISSED, JSON.stringify(dismissedIds));
  }, [dismissedIds]);

  const dismiss = (id: string) => setDismissedIds(prev => [...prev, id]);
  const clearAll = () => setDismissedIds(allAlerts.map(a => a.id));

  const visible = allAlerts.filter(a => !dismissedIds.includes(a.id));
  const criticalCount = visible.filter(a => a.severity === "critical").length;
  const warningCount = visible.filter(a => a.severity === "warning").length;

  if (visible.length === 0) return null;

  return (
    <div className="mb-6">
      <button
        onClick={() => setCollapsed(p => !p)}
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-left transition-colors hover:bg-accent/40"
      >
        <AlertTriangle size={16} className={criticalCount > 0 ? "text-destructive shrink-0" : "text-amber-500 shrink-0"} />
        <h2 className="text-sm font-semibold text-foreground">Signalering</h2>
        {criticalCount > 0 && (
          <Badge className="h-5 min-w-5 px-1.5 text-[10px] font-bold bg-destructive text-destructive-foreground">
            {criticalCount}
          </Badge>
        )}
        {warningCount > 0 && (
          <Badge className="h-5 min-w-5 px-1.5 text-[10px] font-bold bg-amber-500 text-white">
            {warningCount}
          </Badge>
        )}
        {collapsed && (
          <span className="ml-1 text-xs text-muted-foreground">{visible.length} signalen</span>
        )}
        <div className="flex-1" />
        {!collapsed && visible.length > 1 && (
          <span onClick={e => { e.stopPropagation(); clearAll(); }}
            className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer mr-2">
            Alles wissen
          </span>
        )}
        {collapsed ? <ChevronDown size={16} className="text-muted-foreground shrink-0" /> : <ChevronUp size={16} className="text-muted-foreground shrink-0" />}
      </button>
      {!collapsed && (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {visible.map(alert => (
            <AlertTile key={alert.id} alert={alert} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </div>
  );
}
