import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { riskAlertsData } from "@/data/cLevelData";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function RiskAlertsTile() {
  const { criticalCount, warningCount, issues } = riskAlertsData;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Risico's & Alerts</CardTitle>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                <AlertCircle className="w-3.5 h-3.5" /> {criticalCount}
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                <AlertTriangle className="w-3.5 h-3.5" /> {warningCount}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {issues.map((issue, i) => (
          <div key={i} className={cn(
            "flex items-start gap-2 p-2 rounded-md text-xs",
            issue.severity === "critical" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
          )}>
            {issue.severity === "critical"
              ? <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              : <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            }
            <span>{issue.text}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
