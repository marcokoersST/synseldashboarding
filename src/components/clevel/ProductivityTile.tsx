import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { productivityData } from "@/data/cLevelData";
import { cn } from "@/lib/utils";

export function ProductivityTile() {
  const { avgPlacementsPerConsultant, benchmark, trend } = productivityData;
  const aboveBenchmark = avgPlacementsPerConsultant >= benchmark;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Consultant Productiviteit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-3xl font-bold tracking-tight">
          <AnimatedNumber value={avgPlacementsPerConsultant} decimals={1} />
        </div>
        <p className="text-sm text-muted-foreground">gem. plaatsingen per consultant</p>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">Benchmark:</span>
          <span className={cn("font-medium", aboveBenchmark ? "text-emerald-500" : "text-amber-500")}>
            {benchmark}
          </span>
          {!aboveBenchmark && <span className="text-amber-500 text-xs">↓ onder target</span>}
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
