import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { executiveSummaryData } from "@/data/cLevelData";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export function ExecutiveSummaryTile() {
  const { onTrack, atRisk, offTrack, insight } = executiveSummaryData;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Executive Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center space-y-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
            <div className="text-2xl font-bold text-emerald-500"><AnimatedNumber value={onTrack} /></div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">On Track</div>
          </div>
          <div className="text-center space-y-1">
            <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto" />
            <div className="text-2xl font-bold text-amber-500"><AnimatedNumber value={atRisk} /></div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">At Risk</div>
          </div>
          <div className="text-center space-y-1">
            <XCircle className="w-5 h-5 text-red-500 mx-auto" />
            <div className="text-2xl font-bold text-red-500"><AnimatedNumber value={offTrack} /></div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Off Track</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">{insight}</p>
      </CardContent>
    </Card>
  );
}
