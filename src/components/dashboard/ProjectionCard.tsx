import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";
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
  // Find the split point (last week with both historical and projected)
  const splitIndex = data.findIndex((d) => d.historical !== null && d.projected !== null);

  return (
    <AnimatedCard delay={delay}>
      <Card className="h-full">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 cursor-help" />
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
          <div className="h-[140px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                {splitIndex >= 0 && (
                  <ReferenceLine
                    x={data[splitIndex].week}
                    stroke="hsl(var(--border))"
                    strokeDasharray="3 3"
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="historical"
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: color }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={{ r: 3, fill: color, strokeDasharray: "0" }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Input metrics */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
            {inputMetrics.map((metric) => (
              <div key={metric.label} className="text-center flex-1">
                <p className="text-sm font-bold text-foreground">{metric.value}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{metric.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}
