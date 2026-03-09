import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { workforceHealthData } from "@/data/cLevelData";
import { cn } from "@/lib/utils";

export function WorkforceHealthTile() {
  const { attritionPercent, absenteeismPercent, openVacancies, totalStaff } = workforceHealthData;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Workforce Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Verloop</span>
          <span className={cn("text-sm font-semibold", attritionPercent > 10 ? "text-red-500" : "text-foreground")}>
            <AnimatedNumber value={attritionPercent} decimals={1} suffix="%" />
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Ziekteverzuim</span>
          <span className={cn("text-sm font-semibold", absenteeismPercent > 5 ? "text-amber-500" : "text-foreground")}>
            <AnimatedNumber value={absenteeismPercent} decimals={1} suffix="%" />
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Open vacatures</span>
          <span className="text-sm font-semibold">
            <AnimatedNumber value={openVacancies} />
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <span className="text-sm text-muted-foreground">Totaal medewerkers</span>
          <span className="text-sm font-semibold"><AnimatedNumber value={totalStaff} /></span>
        </div>
      </CardContent>
    </Card>
  );
}
