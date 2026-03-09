import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { funnelQualityData } from "@/data/cLevelData";
import { cn } from "@/lib/utils";

function QualityMetric({ label, value, threshold }: { label: string; value: number; threshold: number }) {
  const status = value >= threshold ? "good" : value >= threshold - 10 ? "warn" : "bad";
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn(
        "text-sm font-semibold",
        status === "good" && "text-emerald-500",
        status === "warn" && "text-amber-500",
        status === "bad" && "text-red-500",
      )}>
        <AnimatedNumber value={value} suffix="%" />
      </span>
    </div>
  );
}

export function FunnelQualityTile() {
  const { timelyFollowUp, registrationCompliance, overdueActions, correctlyProcessed } = funnelQualityData;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Funnel Kwaliteit & Opvolging</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <QualityMetric label="Tijdige opvolging" value={timelyFollowUp} threshold={85} />
        <QualityMetric label="Registratie compliance" value={registrationCompliance} threshold={90} />
        <QualityMetric label="Correct verwerkt" value={correctlyProcessed} threshold={90} />
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <span className="text-sm text-muted-foreground">Openstaande acties</span>
          <span className={cn("text-sm font-semibold", overdueActions > 10 ? "text-amber-500" : "text-foreground")}>
            <AnimatedNumber value={overdueActions} />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
