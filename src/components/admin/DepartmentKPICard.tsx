import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Briefcase } from "lucide-react";
import { getDepartmentStats, getConsultantsByDepartment } from "@/data/adminData";

interface DepartmentKPICardProps {
  departmentId: string;
  departmentName: string;
  color: string;
  delay?: number;
}

function formatRevenue(value: number): string {
  if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
  return `€${(value / 1000).toFixed(0)}K`;
}

export function DepartmentKPICard({ departmentId, departmentName, color, delay = 0 }: DepartmentKPICardProps) {
  const stats = getDepartmentStats(departmentId);
  const consultants = getConsultantsByDepartment(departmentId);
  
  // Aggregate trend data from consultants
  const trendData = Array.from({ length: 6 }, (_, i) => ({
    period: `P${i + 1}`,
    value: consultants.reduce((sum, c) => sum + (c.revenueTrend[i]?.historical || 0), 0),
  }));

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">{departmentName}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Afdelings KPI's</p>
          </div>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        </div>

        {/* Revenue */}
        <div className="mb-4">
          <AnimatedNumber
            value={stats.totalRevenue}
            delay={delay + 200}
            formatFn={formatRevenue}
            className="text-2xl font-bold text-foreground"
          />
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-teal" />
            <span className="text-xs text-teal">+12% vs vorige periode</span>
          </div>
        </div>

        {/* Mini trend */}
        <div className="h-12 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{stats.consultantCount} consultants</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{stats.activePlacements} plaatsingen</span>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
