import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";

const data = [
  { month: "mei", werkelijk: 28000, geprojecteerd: null, norm: 30000 },
  { month: "jun", werkelijk: 32000, geprojecteerd: null, norm: 30000 },
  { month: "jul", werkelijk: 29000, geprojecteerd: null, norm: 30000 },
  { month: "aug", werkelijk: 35000, geprojecteerd: null, norm: 30000 },
  { month: "sep", werkelijk: 31000, geprojecteerd: null, norm: 30000 },
  { month: "okt", werkelijk: 36000, geprojecteerd: null, norm: 30000 },
  { month: "nov", werkelijk: 33000, geprojecteerd: null, norm: 30000 },
  { month: "dec", werkelijk: 38000, geprojecteerd: null, norm: 30000 },
  { month: "jan", werkelijk: 36000, geprojecteerd: 36000, norm: 30000 },
  { month: "feb", werkelijk: null, geprojecteerd: 40000, norm: 30000 },
  { month: "mrt", werkelijk: null, geprojecteerd: 42000, norm: 30000 },
  { month: "apr", werkelijk: null, geprojecteerd: 45000, norm: 30000 },
];

interface RevenueChartProps {
  delay?: number;
}

export function RevenueChart({ delay = 0 }: RevenueChartProps) {
  const { ref, isVisible } = useAnimateOnMount({ delay: delay + 300 });
  
  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="glass-header flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">Omzet Overzicht</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Historisch vs. Geprojecteerd</p>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-3 h-0.5 bg-teal rounded-full group-hover:w-5 transition-all" />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Werkelijk</span>
            </div>
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-3 h-0.5 bg-primary rounded-full group-hover:w-5 transition-all" style={{ backgroundImage: 'repeating-linear-gradient(90deg, hsl(var(--primary)) 0, hsl(var(--primary)) 4px, transparent 4px, transparent 8px)' }} />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Geprojecteerd</span>
            </div>
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-3 h-0.5 bg-muted-foreground/30 rounded-full group-hover:w-5 transition-all" />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Minimum Norm</span>
            </div>
          </div>
        </div>
        
        <div ref={ref} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `€${value / 1000}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'
                }}
                formatter={(value: number) => [`€${value?.toLocaleString()}`, '']}
              />
              <ReferenceLine 
                y={30000} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5" 
                strokeOpacity={0.3}
              />
              <Line 
                type="monotone" 
                dataKey="werkelijk" 
                stroke="hsl(var(--teal))" 
                strokeWidth={2.5}
                dot={{ fill: 'hsl(var(--teal))', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, className: "animate-pulse-subtle" }}
                connectNulls={false}
                strokeDasharray={isVisible ? "0" : "2000"}
                strokeDashoffset={isVisible ? "0" : "2000"}
                style={{
                  transition: "stroke-dasharray 2s ease-out, stroke-dashoffset 2s ease-out"
                }}
              />
              <Line 
                type="monotone" 
                dataKey="geprojecteerd" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2.5}
                strokeDasharray={isVisible ? "8 4" : "2000"}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, className: "animate-pulse-subtle" }}
                connectNulls={false}
                style={{
                  transition: "stroke-dasharray 2s ease-out 0.5s"
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AnimatedCard>
  );
}
