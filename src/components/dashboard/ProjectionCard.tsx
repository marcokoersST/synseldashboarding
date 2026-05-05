import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { WatZieIkHier } from "@/components/dashboard/WatZieIkHier";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import type { WeekProjectionPoint, ProjectionMetric } from "@/data/projectionData";

interface ProjectionCardProps {
  title: string;
  description: string;
  data: WeekProjectionPoint[];
  inputMetrics: ProjectionMetric[];
  delay?: number;
  color?: string;
}

export function ProjectionCard({
  title,
  description,
  data,
  inputMetrics,
  delay = 0,
  color = "hsl(var(--chart-2))",
}: ProjectionCardProps) {
  const firstWeek = data[0]?.week ?? "";
  const lastWeek = data[data.length - 1]?.week ?? "";

  return (
    <AnimatedCard delay={delay}>
      <WatZieIkHier
        what={`Een prognose van "${title.replace("Projectie ", "")}" voor de komende weken, gebaseerd op je huidige activiteiten en conversies.`}
        insight="Op tijd bijsturen: zie alvast of je op koers ligt voor je doel of dat je nu al moet versnellen."
      />
      <Card className="h-full">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-1 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[220px]">
                  <p className="text-xs">
                    Solid lijn = historische data (afgelopen 3 weken).
                    Stippellijn = projectie (komende 3 weken).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Chart */}
          <div className="h-[110px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <Line
                  type="monotone"
                  dataKey="historical"
                  stroke={color}
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke={color}
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Period labels */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">{firstWeek}</span>
            <span className="text-xs text-muted-foreground">{lastWeek}</span>
          </div>

          {/* Input metrics */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
            {inputMetrics.map((metric) => (
              <div key={metric.label} className="text-center flex-1">
                <p className="text-base font-bold text-foreground">{metric.value}</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{metric.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}
