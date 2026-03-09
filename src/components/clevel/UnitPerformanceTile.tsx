import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { unitPerformanceData } from "@/data/cLevelData";

export function UnitPerformanceTile() {
  const maxRevenue = Math.max(...unitPerformanceData.map(u => u.revenue));

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Business Unit Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {unitPerformanceData.map((unit) => (
          <div key={unit.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{unit.name}</span>
              <span className="text-muted-foreground">
                €<AnimatedNumber value={unit.revenue / 1_000_000} decimals={1} />M · {unit.placements} pl.
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(unit.revenue / maxRevenue) * 100}%`,
                  backgroundColor: unit.color,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
