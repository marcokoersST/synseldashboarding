import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { revenueData } from "@/data/cLevelData";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function RevenueTile() {
  const { total, previousPeriod, target, sparkline } = revenueData;
  const vsPrevious = ((total - previousPeriod) / previousPeriod) * 100;
  const vsTarget = ((total - target) / target) * 100;
  const onTrack = vsTarget >= -5;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Omzet</CardTitle>
          <div className={cn("w-3 h-3 rounded-full", onTrack ? "bg-emerald-500" : "bg-red-500")} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-3xl font-bold tracking-tight">
          <AnimatedNumber value={total / 1_000_000} prefix="€" suffix="M" decimals={1} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm">
            {vsPrevious >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
            <span className={cn("font-medium", vsPrevious >= 0 ? "text-emerald-500" : "text-red-500")}>
              {vsPrevious >= 0 ? "+" : ""}{vsPrevious.toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs vorige periode</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className={cn("font-medium", vsTarget >= 0 ? "text-emerald-500" : "text-amber-500")}>
              {vsTarget >= 0 ? "+" : ""}{vsTarget.toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs target</span>
          </div>
        </div>
        {/* Mini sparkline */}
        <div className="flex items-end gap-1 h-8 pt-1">
          {sparkline.map((v, i) => (
            <div
              key={i}
              className="flex-1 bg-primary/20 rounded-sm relative overflow-hidden"
              style={{ height: `${(v / Math.max(...sparkline)) * 100}%` }}
            >
              <div className="absolute inset-0 bg-primary rounded-sm" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
