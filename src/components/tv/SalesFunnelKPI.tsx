import { TrendingUp, TrendingDown, UserPlus, ClipboardList, Target, FileText, MessageSquare, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FunnelMetric } from "@/data/tvData";

const iconMap: Record<string, typeof UserPlus> = {
  UserPlus, ClipboardList, Target, FileText, MessageSquare, CheckCircle,
};

interface SalesFunnelKPIProps {
  metric: FunnelMetric;
  index: number;
}

export function SalesFunnelKPI({ metric, index }: SalesFunnelKPIProps) {
  const Icon = iconMap[metric.icon] || Target;
  const isPositive = metric.change >= 0;

  return (
    <div
      className={cn(
        "bg-card rounded-xl p-5 border border-border flex flex-col gap-3",
        "animate-fade-in"
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium">{metric.label}</span>
      </div>
      <p className="text-3xl font-bold text-foreground">{metric.value}</p>
      <div className={cn("flex items-center gap-1 text-sm font-medium", isPositive ? "text-accent" : "text-destructive")}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span>{isPositive ? "+" : ""}{metric.change}%</span>
      </div>
    </div>
  );
}
