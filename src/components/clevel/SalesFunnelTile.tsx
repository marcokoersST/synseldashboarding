import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { funnelData } from "@/data/cLevelData";
import { cn } from "@/lib/utils";

export function SalesFunnelTile() {
  const { stages } = funnelData;
  const maxCount = stages[0].count;

  // Calculate conversions between stages
  const conversions = stages.slice(1).map((stage, i) => {
    const rate = (stage.count / stages[i].count) * 100;
    return { rate, isLow: rate < 50 };
  });

  // Find biggest drop-off
  const lowestConversion = Math.min(...conversions.map(c => c.rate));

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Sales & Recruitment Funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {stages.map((stage, i) => {
          const widthPercent = (stage.count / maxCount) * 100;
          const conversion = i > 0 ? conversions[i - 1] : null;
          return (
            <div key={stage.name}>
              {conversion && (
                <div className="flex justify-end pr-1 -mb-0.5">
                  <span className={cn(
                    "text-[10px] font-medium",
                    conversion.rate === lowestConversion ? "text-red-500" : "text-muted-foreground"
                  )}>
                    {conversion.rate.toFixed(0)}% ↓
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-24 truncate">{stage.name}</span>
                <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden">
                  <div
                    className={cn("h-full rounded-sm bg-primary transition-all", conversion?.rate === lowestConversion && i > 0 && "bg-red-500/80")}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <span className="text-xs font-medium w-10 text-right">{stage.count}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
