import { useState } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { cn } from "@/lib/utils";
import { heatmapData, type HeatmapConsultant } from "@/data/managerRevenueDetailData";
import { Target, ChevronRight, Lightbulb } from "lucide-react";

function ZoneLabel({ zone, count }: { zone: string; count: number }) {
  const colors = { green: "bg-success/20 text-success", yellow: "bg-amber-500/20 text-amber-600", red: "bg-destructive/20 text-destructive" };
  const labels = { green: "Op koers", yellow: "Aandacht", red: "Interventie" };
  return (
    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", colors[zone as keyof typeof colors])}>
      {labels[zone as keyof typeof labels]} ({count})
    </span>
  );
}

function ConsultantDetail({ consultant }: { consultant: HeatmapConsultant }) {
  return (
    <div className="bg-muted/10 border border-primary/10 rounded-lg p-4 mt-3 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">{consultant.consultantName}</h4>
        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
          consultant.zone === "green" ? "bg-success/20 text-success" :
          consultant.zone === "yellow" ? "bg-amber-500/20 text-amber-600" :
          "bg-destructive/20 text-destructive"
        )}>
          Score: {consultant.performanceScore}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{consultant.explanation}</p>
      <div className="flex items-start gap-2">
        <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-foreground font-medium">{consultant.bestNextStep}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground mb-1">Aanbevelingen</p>
          <ul className="space-y-0.5">
            {consultant.recommendations.map((r, i) => (
              <li key={i} className="text-[11px] text-foreground flex items-start gap-1">
                <ChevronRight className="h-3 w-3 shrink-0 mt-0.5 text-primary" />{r}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground mb-1">Ontwikkelpunten</p>
          <ul className="space-y-0.5">
            {consultant.developmentPoints.map((d, i) => (
              <li key={i} className="text-[11px] text-foreground flex items-start gap-1">
                <ChevronRight className="h-3 w-3 shrink-0 mt-0.5 text-amber-500" />{d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface InterventionHeatmapProps {
  delay?: number;
  selectedUnit?: string;
}

export function InterventionHeatmap({ delay = 0, selectedUnit }: InterventionHeatmapProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const data = (!selectedUnit || selectedUnit === "all")
    ? heatmapData
    : heatmapData.filter(c => c.unit === selectedUnit);

  const zones = { green: data.filter(c => c.zone === "green").length, yellow: data.filter(c => c.zone === "yellow").length, red: data.filter(c => c.zone === "red").length };
  const selectedConsultant = data.find(c => c.consultantId === selected);

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm font-medium text-foreground">Interventie Heatmap</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Klik op een consultant voor detail</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ZoneLabel zone="green" count={zones.green} />
            <ZoneLabel zone="yellow" count={zones.yellow} />
            <ZoneLabel zone="red" count={zones.red} />
          </div>
        </div>

        {/* Heatmap scatter */}
        <div className="relative h-32 rounded-lg overflow-hidden mb-2">
          {/* Zone backgrounds */}
          <div className="absolute inset-0 flex">
            <div className="flex-1 bg-destructive/10 border-r border-destructive/20" />
            <div className="flex-1 bg-amber-500/10 border-r border-amber-500/20" />
            <div className="flex-1 bg-success/10" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-[9px] text-muted-foreground">
            <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
          </div>
          {/* Dots */}
          {data.map((c, i) => {
            const x = (c.performanceScore / 100) * 90 + 5;
            const y = 15 + (i % 3) * 25 + Math.random() * 15;
            return (
              <button key={c.consultantId}
                onClick={() => setSelected(selected === c.consultantId ? null : c.consultantId)}
                className={cn(
                  "absolute w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold transition-all border-2",
                  selected === c.consultantId ? "scale-125 z-10 ring-2 ring-primary" : "hover:scale-110",
                  c.zone === "green" ? "bg-success/80 text-success-foreground border-success" :
                  c.zone === "yellow" ? "bg-amber-500/80 text-white border-amber-500" :
                  "bg-destructive/80 text-destructive-foreground border-destructive"
                )}
                style={{ left: `${x}%`, top: `${y}%` }}
                title={c.consultantName}
              >
                {c.consultantName.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </button>
            );
          })}
        </div>

        {selectedConsultant && <ConsultantDetail consultant={selectedConsultant} />}
      </div>
    </AnimatedCard>
  );
}
