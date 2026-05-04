import { TrendingUp, TrendingDown, UserPlus, ClipboardList, Target, FileText, MessageSquare, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FunnelMetric } from "@/data/tvData";
import { useTVCompact } from "./TVDashboardLayout";
import { KPIBadge, type KPITone } from "./KPIBadge";

const iconMap: Record<string, typeof UserPlus> = {
  UserPlus, ClipboardList, Target, FileText, MessageSquare, CheckCircle,
};

const toneCycle: KPITone[] = ["primary", "chart-primary", "accent", "gold", "primary", "chart-primary", "accent"];

interface SalesFunnelKPIProps {
  metric: FunnelMetric;
  index: number;
}

export function SalesFunnelKPI({ metric, index }: SalesFunnelKPIProps) {
  const compact = useTVCompact();
  const Icon = iconMap[metric.icon] || Target;
  const isPositive = metric.change >= 0;
  const tone = toneCycle[index % toneCycle.length];

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border flex flex-col overflow-hidden animate-fade-in h-full",
        compact ? "p-3" : "p-3"
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Mini gradient header */}
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-t-xl bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border-b border-border/50",
          compact ? "-mx-3 -mt-3 mb-1.5 px-3 py-1" : "-mx-3 -mt-3 mb-2 px-3 py-1.5"
        )}
      >
        <Icon className={cn("text-muted-foreground", compact ? "w-4 h-4" : "w-3.5 h-3.5")} />
        <span className={cn("font-semibold text-foreground truncate", compact ? "text-sm" : "text-xs")}>
          {metric.label}
        </span>
      </div>

      {/* KPI badge */}
      <div className="flex-1 flex justify-center items-center min-h-0">
        <KPIBadge icon={Icon} value={metric.value} label="" tone={tone} compact={false} size="md" />
      </div>

      {/* Delta pill */}
      <div className="flex justify-center mt-1">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full font-semibold",
            compact ? "px-2 py-0.5 text-xs" : "px-2 py-0.5 text-[11px]",
            isPositive ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
          )}
        >
          {isPositive ? <TrendingUp className={compact ? "w-3.5 h-3.5" : "w-3 h-3"} /> : <TrendingDown className={compact ? "w-3.5 h-3.5" : "w-3 h-3"} />}
          {isPositive ? "+" : ""}{metric.change}%
          <span className="text-muted-foreground font-normal ml-0.5">{compact ? "v.p." : "v. periode"}</span>
        </span>
      </div>
    </div>
  );
}
