import { useState } from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  myTeamConsultants, 
  allConsultants, 
  ConsultantWithTrends 
} from "@/data/managerData";

interface ManagerRevenueLeaderboardProps {
  delay?: number;
  selectedUnit?: string;
}

function formatRevenue(value: number): string {
  if (value >= 1000000) {
    return `€${(value / 1000000).toFixed(2)}M`;
  }
  return `€${(value / 1000).toFixed(0)}K`;
}

function ConsultantRow({ 
  consultant, 
  rank, 
  delay 
}: { 
  consultant: ConsultantWithTrends; 
  rank: number; 
  delay: number;
}) {
  const initials = consultant.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div
      className={cn(
        "flex items-center gap-4 py-3 px-4 rounded-lg transition-colors",
        consultant.isCurrentUser 
          ? "bg-primary/10 border border-primary/20" 
          : "hover:bg-muted/50"
      )}
    >
      {/* Rank */}
      <div className="w-8 flex items-center justify-center">
        {rank === 1 ? (
          <Crown className="w-5 h-5 text-amber-500" />
        ) : (
          <span className="text-sm font-semibold text-muted-foreground">
            #{rank}
          </span>
        )}
      </div>

      {/* Avatar & Name */}
      <div className="flex items-center gap-3 min-w-[180px]">
        <Avatar className="w-8 h-8">
          <AvatarImage src={consultant.avatar} alt={consultant.name} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className={cn(
            "text-sm font-medium truncate",
            consultant.isCurrentUser ? "text-primary" : "text-foreground"
          )}>
            {consultant.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {consultant.role}
          </p>
        </div>
      </div>

      {/* Revenue */}
      <div className="w-24 text-right">
        <AnimatedNumber
          value={consultant.revenue}
          delay={delay}
          formatFn={formatRevenue}
          className="text-sm font-semibold text-foreground"
        />
      </div>

      {/* Mini Chart */}
      <div className="flex-1 h-10 min-w-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={consultant.revenueTrend}>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "11px",
              }}
              formatter={(value: number, name: string) => [
                `€${value}K`,
                name === "historical" ? "Werkelijk" : "Projectie",
              ]}
              labelFormatter={(label) => `Periode ${label}`}
            />
            {/* Historical line (solid) */}
            <Line
              type="monotone"
              dataKey="historical"
              stroke="hsl(var(--teal))"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            {/* Projected line (dashed) */}
            <Line
              type="monotone"
              dataKey="projected"
              stroke="hsl(var(--teal))"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              connectNulls={false}
              opacity={0.6}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ManagerRevenueLeaderboard({ delay = 0 }: ManagerRevenueLeaderboardProps) {
  const [view, setView] = useState<"team" | "company">("team");

  const consultants = view === "team" ? myTeamConsultants : allConsultants;

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Team Omzet Ranglijst
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Omzetontwikkeling per consultant
            </p>
          </div>

          <Tabs value={view} onValueChange={(v) => setView(v as "team" | "company")}>
            <TabsList className="h-8">
              <TabsTrigger value="team" className="text-xs px-3 h-7">
                Mijn Team
              </TabsTrigger>
              <TabsTrigger value="company" className="text-xs px-3 h-7">
                Heel Bedrijf
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Column Headers */}
        <div className="flex items-center gap-4 py-2 px-4 text-xs text-muted-foreground border-b border-border mb-2">
          <div className="w-8">#</div>
          <div className="min-w-[180px]">Consultant</div>
          <div className="w-24 text-right">Omzet</div>
          <div className="flex-1 min-w-[200px] flex justify-between">
            <span>P1</span>
            <span className="text-center">Omzet Ontwikkeling</span>
            <span>P13</span>
          </div>
        </div>

        {/* Consultant Rows */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {consultants.map((consultant, index) => (
            <ConsultantRow
              key={consultant.id}
              consultant={consultant}
              rank={index + 1}
              delay={delay + 100 + index * 50}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 pt-3 mt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-teal" />
            <span className="text-xs text-muted-foreground">Werkelijk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-teal opacity-60" style={{ backgroundImage: 'repeating-linear-gradient(90deg, hsl(var(--teal)) 0, hsl(var(--teal)) 4px, transparent 4px, transparent 8px)' }} />
            <span className="text-xs text-muted-foreground">Projectie</span>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
