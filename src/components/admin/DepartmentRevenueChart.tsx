import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { getRevenueDistribution } from "@/data/adminData";

interface DepartmentRevenueChartProps {
  delay?: number;
}

function formatRevenue(value: number): string {
  if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
  return `€${(value / 1000).toFixed(0)}K`;
}

export function DepartmentRevenueChart({ delay = 0 }: DepartmentRevenueChartProps) {
  const data = getRevenueDistribution();
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-foreground">Omzet Verdeling</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Per afdeling</p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [formatRevenue(value), "Omzet"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 mt-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">{formatRevenue(item.value)}</span>
                <span className="text-xs text-muted-foreground">({Math.round((item.value / total) * 100)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedCard>
  );
}
