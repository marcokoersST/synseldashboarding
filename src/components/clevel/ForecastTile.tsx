import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { AnimatedProgress } from "@/components/animations/AnimatedProgress";
import { forecastData } from "@/data/cLevelData";
import { cn } from "@/lib/utils";

export function ForecastTile() {
  const { forecastedPlacements, targetPlacements, forecastedRevenue, targetRevenue } = forecastData;
  const placementProgress = (forecastedPlacements / targetPlacements) * 100;
  const revenueProgress = (forecastedRevenue / targetRevenue) * 100;
  const onTrack = placementProgress >= 90;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Forecast</CardTitle>
          <div className={cn("w-3 h-3 rounded-full", onTrack ? "bg-emerald-500" : "bg-amber-500")} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm text-muted-foreground">Plaatsingen</span>
            <span className="text-sm font-medium">
              <AnimatedNumber value={forecastedPlacements} /> / {targetPlacements}
            </span>
          </div>
          <AnimatedProgress value={placementProgress} barClassName={cn(placementProgress >= 90 ? "bg-emerald-500" : "bg-amber-500")} />
        </div>
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm text-muted-foreground">Omzet</span>
            <span className="text-sm font-medium">
              €<AnimatedNumber value={forecastedRevenue / 1_000_000} decimals={1} />M / €{(targetRevenue / 1_000_000).toFixed(0)}M
            </span>
          </div>
          <AnimatedProgress value={revenueProgress} barClassName={cn(revenueProgress >= 90 ? "bg-emerald-500" : "bg-amber-500")} />
        </div>
        <div className="pt-1 text-sm text-muted-foreground">
          Afwijking: <span className={cn("font-medium", placementProgress >= 95 ? "text-emerald-500" : "text-amber-500")}>
            {(placementProgress - 100).toFixed(0)}%
          </span> plaatsingen
        </div>
      </CardContent>
    </Card>
  );
}
