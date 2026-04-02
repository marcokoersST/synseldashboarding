import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, CheckCircle2, ExternalLink, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConsultantInsight } from "@/data/consultantInsightsData";

interface InsightsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insights: ConsultantInsight[];
  readIds: string[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const typeConfig = {
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m geleden`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}u geleden`;
  const days = Math.floor(hours / 24);
  return `${days}d geleden`;
}

export function InsightsDrawer({ open, onOpenChange, insights, readIds, onMarkRead, onMarkAllRead }: InsightsDrawerProps) {
  const navigate = useNavigate();
  const unreadCount = insights.filter(i => !readIds.includes(i.id)).length;

  const handleClick = (insight: ConsultantInsight) => {
    onMarkRead(insight.id);
    const url = insight.linkParams ? `${insight.linkTo}${insight.linkParams}` : insight.linkTo;
    navigate(url);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[50vw] overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">Inzichten Center</SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onMarkAllRead} className="text-xs gap-1.5">
                <CheckCheck className="w-3.5 h-3.5" />
                Alles gelezen
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="p-4 space-y-3">
          {insights.map((insight) => {
            const config = typeConfig[insight.type];
            const Icon = config.icon;
            const isRead = readIds.includes(insight.id);

            return (
              <button
                key={insight.id}
                onClick={() => handleClick(insight)}
                className={cn(
                  "w-full text-left rounded-lg border p-4 transition-colors hover:bg-muted/50 group",
                  config.border,
                  isRead ? "opacity-60" : ""
                )}
              >
                <div className="flex gap-3">
                  <div className={cn("mt-0.5 rounded-md p-1.5", config.bg)}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm">{insight.title}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{timeAgo(insight.timestamp)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{insight.message}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-3 h-3" />
                      Bekijk dashboard
                    </div>
                  </div>
                  {!isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
