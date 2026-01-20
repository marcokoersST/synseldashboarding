import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";

const data = [
  { period: "P1", value: 2 },
  { period: "P2", value: 1 },
  { period: "P3", value: 3 },
  { period: "P4", value: 2 },
  { period: "P5", value: 4 },
  { period: "P6", value: 2 },
  { period: "P7", value: 3 },
  { period: "P8", value: 1 },
  { period: "P9", value: 2 },
  { period: "P10", value: 3 },
  { period: "P11", value: 2 },
  { period: "P12", value: 2 },
  { period: "P13", value: 1 },
];

interface PlacementsCardProps {
  delay?: number;
}

export function PlacementsCard({ delay = 0 }: PlacementsCardProps) {
  const { ref, isVisible } = useAnimateOnMount({ delay: delay + 400 });
  
  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border group">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Plaatsingen & Gedetacheerden</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Huidige actieve plaatsingen</p>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
            <span>0.0%</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-end gap-6 mb-4">
          <div>
            <AnimatedNumber 
              value={28} 
              delay={delay + 300}
              className="text-3xl font-bold text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-0.5">Totaal</p>
          </div>
          <div>
            <AnimatedNumber 
              value={5} 
              delay={delay + 400}
              className="text-xl font-semibold text-teal"
            />
            <p className="text-xs text-muted-foreground mt-0.5">Actief</p>
          </div>
        </div>
        
        {/* Mini Chart */}
        <div ref={ref} className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--teal))" 
                strokeWidth={2}
                dot={false}
                strokeDasharray={isVisible ? "0" : "1000"}
                strokeDashoffset={isVisible ? "0" : "1000"}
                style={{
                  transition: "stroke-dasharray 1.5s ease-out, stroke-dashoffset 1.5s ease-out"
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Period labels */}
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>P1</span>
          <span>P13</span>
        </div>
      </div>
    </AnimatedCard>
  );
}
