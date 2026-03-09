import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { strategicInitiativesData } from "@/data/cLevelData";
import { cn } from "@/lib/utils";

const statusConfig = {
  on_track: { label: "On track", color: "bg-emerald-500" },
  delayed: { label: "Delayed", color: "bg-amber-500" },
  at_risk: { label: "At risk", color: "bg-red-500" },
};

export function StrategicInitiativesTile() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Strategische Initiatieven</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {strategicInitiativesData.map((project) => {
          const config = statusConfig[project.status];
          return (
            <div key={project.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate pr-2">{project.name}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className={cn("w-2 h-2 rounded-full", config.color)} />
                  <span className="text-xs text-muted-foreground">{config.label}</span>
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", config.color)} style={{ width: `${project.progress}%` }} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
