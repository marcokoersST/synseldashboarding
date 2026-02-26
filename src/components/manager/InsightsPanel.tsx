import { useState, useEffect } from "react";
import {
  Bell,
  ChevronDown,
  ChevronUp,
  X,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { managerInsights, type Insight } from "@/data/managerInsightsData";

const STORAGE_COLLAPSED = "mgr-dash-insights-collapsed";
const STORAGE_DISMISSED = "mgr-dash-insights-dismissed";

function loadDismissed(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_DISMISSED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Zojuist";
  if (mins < 60) return `${mins} min geleden`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} uur geleden`;
  const days = Math.floor(hrs / 24);
  return `${days}d geleden`;
}

const typeConfig = {
  warning: {
    border: "border-l-orange-500",
    icon: AlertTriangle,
    iconClass: "text-orange-500",
  },
  info: {
    border: "border-l-blue-500",
    icon: Info,
    iconClass: "text-blue-500",
  },
  success: {
    border: "border-l-emerald-500",
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
  },
};

function InsightTile({
  insight,
  onDismiss,
}: {
  insight: Insight;
  onDismiss: (id: string) => void;
}) {
  const config = typeConfig[insight.type];
  const Icon = config.icon;

  return (
    <div
      className={`group relative flex gap-3 rounded-lg border border-border border-l-[3px] ${config.border} bg-card p-3 transition-colors hover:bg-accent/30`}
    >
      {/* Avatar or icon */}
      {insight.consultantAvatar ? (
        <Avatar className="h-8 w-8 mt-0.5 shrink-0">
          <AvatarImage src={insight.consultantAvatar} alt={insight.consultantName} />
          <AvatarFallback className="text-[10px]">
            {insight.consultantName?.split(" ").map((n) => n[0]).join("") ?? "?"}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary mt-0.5">
          <Icon size={16} className={config.iconClass} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold text-foreground leading-tight">
            {insight.title}
          </p>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {relativeTime(insight.timestamp)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {insight.message}
        </p>
        {insight.linkLabel && (
          <button className="text-[11px] font-medium text-primary hover:underline mt-1">
            {insight.linkLabel}
          </button>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(insight.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function InsightsPanel() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_COLLAPSED) === "true";
    } catch {
      return false;
    }
  });
  const [dismissedIds, setDismissedIds] = useState<string[]>(loadDismissed);

  useEffect(() => {
    localStorage.setItem(STORAGE_COLLAPSED, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem(STORAGE_DISMISSED, JSON.stringify(dismissedIds));
  }, [dismissedIds]);

  const dismiss = (id: string) => setDismissedIds((prev) => [...prev, id]);
  const markAllRead = () =>
    setDismissedIds(managerInsights.map((i) => i.id));

  const visible = managerInsights.filter((i) => !dismissedIds.includes(i.id));
  const unreadCount = visible.filter((i) => !i.isRead).length;

  if (visible.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Header bar */}
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-left transition-colors hover:bg-accent/40"
      >
        <Bell size={16} className="text-primary shrink-0" />
        <h2 className="text-sm font-semibold text-foreground">Insights</h2>
        {unreadCount > 0 && (
          <Badge className="h-5 min-w-5 px-1.5 text-[10px] font-bold">
            {unreadCount}
          </Badge>
        )}
        {collapsed && (
          <span className="ml-1 text-xs text-muted-foreground">
            {visible.length} nieuwe insights
          </span>
        )}
        <div className="flex-1" />
        {!collapsed && visible.length > 1 && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              markAllRead();
            }}
            className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer mr-2"
          >
            Alles wissen
          </span>
        )}
        {collapsed ? (
          <ChevronDown size={16} className="text-muted-foreground shrink-0" />
        ) : (
          <ChevronUp size={16} className="text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Tiles */}
      {!collapsed && (
        <div className="mt-2 grid gap-2">
          {visible.map((insight) => (
            <InsightTile key={insight.id} insight={insight} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </div>
  );
}
