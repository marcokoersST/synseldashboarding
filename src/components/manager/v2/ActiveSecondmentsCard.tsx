import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { activeSecondmentsData } from "@/data/managerRevenueDetailData";

interface ActiveSecondmentsCardProps {
  delay?: number;
  selectedUnit?: string;
  framed?: boolean;
}

export function ActiveSecondmentsCard({ delay = 0, framed = true }: ActiveSecondmentsCardProps) {
  const data = activeSecondmentsData;
  const totalRevenue = data.reduce((s, d) => s + d.monthlyRevenue, 0);
  const endingSoon = data.filter(d => d.status === "ending-soon").length;
  const newPlacements = data.filter(d => d.status === "new").length;

  const statusColors = {
    active: "text-success",
    "ending-soon": "text-amber-500",
    new: "text-primary",
  };
  const statusLabels = {
    active: "Actief",
    "ending-soon": "Eindigt binnenkort",
    new: "Nieuw",
  };

  const body = (
    <>
      {framed && (
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm font-medium text-foreground">Actieve Detacheringen</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              <AnimatedNumber value={data.length} delay={delay + 100} /> plaatsingen — €{totalRevenue}k/mnd
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {endingSoon > 0 && (
              <span className="text-[10px] font-medium text-amber-500">{endingSoon} eindigt binnenkort</span>
            )}
            {newPlacements > 0 && (
              <span className="text-[10px] font-medium text-primary">{newPlacements} nieuw</span>
            )}
          </div>
        </div>
      )}

      <div className="overflow-auto max-h-[300px] rounded border border-border/30">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Kandidaat</th>
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Bedrijf</th>
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Consultant</th>
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Start</th>
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Verwacht einde</th>
              <th className="text-right py-2 px-2 font-medium text-muted-foreground">€/mnd</th>
              <th className="text-center py-2 px-2 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className={cn(
                "border-b border-border/30 hover:bg-muted/20 transition-colors",
                row.status === "ending-soon" && "bg-amber-500/5"
              )}>
                <td className="py-1.5 px-2 font-medium text-foreground">{row.candidateName}</td>
                <td className="py-1.5 px-2 text-muted-foreground">{row.company}</td>
                <td className="py-1.5 px-2 text-muted-foreground">{row.consultantName}</td>
                <td className="py-1.5 px-2 text-muted-foreground">{row.startDate}</td>
                <td className="py-1.5 px-2 text-muted-foreground">{row.expectedEnd}</td>
                <td className="py-1.5 px-2 text-right font-semibold tabular-nums text-foreground">€{row.monthlyRevenue}k</td>
                <td className="py-1.5 px-2 text-center">
                  <span className={cn("text-[10px] font-medium", statusColors[row.status])}>
                    {statusLabels[row.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  if (!framed) return <div className="space-y-4">{body}</div>;
  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border">{body}</div>
    </AnimatedCard>
  );
}
