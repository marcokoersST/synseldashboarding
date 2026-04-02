import { ReactNode } from "react";
import { Bell, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  children?: ReactNode;
  latestInsight?: string;
  unreadCount?: number;
  onOpenInsights?: () => void;
}

export function TopBar({ children, latestInsight, unreadCount = 0, onOpenInsights }: TopBarProps) {
  return (
    <div className="h-14 bg-sidebar flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        {children}
      </div>

      <div className="flex items-center gap-3">
        {/* Latest insight snippet */}
        {latestInsight && (
          <button
            onClick={onOpenInsights}
            className="hidden md:flex items-center gap-2 max-w-sm px-3 py-1.5 rounded-lg bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-xs text-sidebar-foreground truncate">{latestInsight}</span>
          </button>
        )}

        {/* Notification bell */}
        {onOpenInsights && (
          <button
            onClick={onOpenInsights}
            className="relative p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors"
          >
            <Bell className="w-5 h-5 text-sidebar-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1">
                {unreadCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
