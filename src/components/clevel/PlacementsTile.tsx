import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { placementsData } from "@/data/cLevelData";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlacementsTile() {
  const { total, previousPeriod, target, trend } = placementsData;
  const vsPrevious = ((total - previousPeriod) / previousPeriod) * 100;
  const vsTarget = ((total - target) / target) * 100;
  const onTrack = vsTarget >= -10;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Plaatsingen</CardTitle>
          <div className={cn("w-3 h-3 rounded-full", onTrack ? "bg-emerald-500" : "bg-red-500")} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-3xl font-bold tracking-tight">
          <AnimatedNumber value={total} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm">
            {vsPrevious >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
            <span className={cn("font-medium", vsPrevious >= 0 ? "text-emerald-500" : "text-red-500")}>
              {vsPrevious >= 0 ? "+" : ""}{vsPrevious.toFixed(0)}%
            </span>
            <span className="text-muted-foreground">vs vorige periode</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Target: <span className="font-medium text-foreground">{target}</span>
          </div>
        </div>
        <div className="flex items-end gap-1 h-8 pt-1">
          {trend.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-primary"
              style={{ height: `${(v / Math.max(...trend)) * 100}%`, opacity: 0.3 + (i / trend.length) * 0.7 }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
