import { TrendingUp, TrendingDown, UserPlus, ClipboardList, Target, FileText, MessageSquare, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FunnelMetric } from "@/data/tvData";
import { useTVCompact } from "./TVDashboardLayout";

const iconMap: Record<string, typeof UserPlus> = {
  UserPlus, ClipboardList, Target, FileText, MessageSquare, CheckCircle,
};

interface SalesFunnelKPIProps {
  metric: FunnelMetric;
  index: number;
}

export function SalesFunnelKPI({ metric, index }: SalesFunnelKPIProps) {
  const compact = useTVCompact();
  const Icon = iconMap[metric.icon] || Target;
  const isPositive = metric.change >= 0;

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border flex flex-col",
        "animate-fade-in",
        compact ? "p-3 gap-1" : "p-5 gap-3"
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />
        <span className={cn("font-medium", compact ? "text-xs" : "text-sm")}>{metric.label}</span>
      </div>
      <p className={cn("font-bold text-foreground", compact ? "text-xl" : "text-3xl")}>{metric.value}</p>
      <div className={cn("flex items-center gap-1 font-medium", compact ? "text-xs" : "text-sm", isPositive ? "text-accent" : "text-destructive")}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{isPositive ? "+" : ""}{metric.change}%</span>
        <span className="text-muted-foreground font-normal ml-1">{compact ? "v. periode" : "t.o.v. vorige periode"}</span>
      </div>
    </div>
  );
}
