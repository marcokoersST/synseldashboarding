import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { marginData } from "@/data/cLevelData";
import { cn } from "@/lib/utils";

export function MarginTile() {
  const { totalEuro, percentage, targetPercentage, previousPeriod } = marginData;
  const vsTarget = percentage - targetPercentage;
  const vsPrevious = ((totalEuro - previousPeriod) / previousPeriod) * 100;
  const onTrack = vsTarget >= -3;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Marge</CardTitle>
          <div className={cn("w-3 h-3 rounded-full", onTrack ? "bg-emerald-500" : "bg-amber-500")} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-3xl font-bold tracking-tight">
          <AnimatedNumber value={totalEuro / 1_000_000} prefix="€" suffix="M" decimals={1} />
        </div>
        <div className="text-lg font-semibold text-muted-foreground">
          <AnimatedNumber value={percentage} suffix="%" /> marge
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm">
            <span className={cn("font-medium", vsTarget >= 0 ? "text-emerald-500" : "text-amber-500")}>
              {vsTarget >= 0 ? "+" : ""}{vsTarget}pp
            </span>
            <span className="text-muted-foreground">vs target ({targetPercentage}%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className={cn("font-medium", vsPrevious >= 0 ? "text-emerald-500" : "text-red-500")}>
              {vsPrevious >= 0 ? "+" : ""}{vsPrevious.toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs vorige periode</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
