import { TVDashboardLayout } from "@/components/tv/TVDashboardLayout";
import { useTVCompact } from "@/components/tv/TVDashboardLayout";
import { SalesFunnelKPI } from "@/components/tv/SalesFunnelKPI";
import { ConversionArrow } from "@/components/tv/ConversionArrow";
import { CandidatesPipeline } from "@/components/tv/CandidatesPipeline";
import { CallStats } from "@/components/tv/CallStats";
import { UnitFunnelBreakdown } from "@/components/tv/UnitFunnelBreakdown";
import { weekFunnelMetrics, weekOverallConversions } from "@/data/tvData";
import { cn } from "@/lib/utils";

function WeekContent() {
  const compact = useTVCompact();

  return (
    <div className={cn("flex flex-col h-full", compact ? "gap-2" : "gap-4")}>
      {/* KPI tiles with conversion arrows */}
      <div className={cn("flex items-stretch shrink-0", compact ? "gap-1" : "gap-0")}>
        {weekFunnelMetrics.map((m, i) => (
          <div key={m.label} className="contents">
            <div className="flex-1 min-w-0">
              <SalesFunnelKPI metric={m} index={i} />
            </div>
            {i < weekFunnelMetrics.length - 1 && i < weekOverallConversions.length && (
              <ConversionArrow rate={weekOverallConversions[i].rate} />
            )}
          </div>
        ))}
      </div>

      {/* Unit breakdown + conversions merged - main focus */}
      <div className="flex-1 min-h-0 overflow-auto">
        <UnitFunnelBreakdown />
      </div>

      {/* Bottom row - compact */}
      <div className={cn("grid grid-cols-2 shrink-0", compact ? "gap-2 max-h-[180px]" : "gap-4")}>
        <CallStats mode="week" />
        <CandidatesPipeline />
      </div>
    </div>
  );
}

export default function TVSalesFunnelWeek() {
  return (
    <TVDashboardLayout title="Weekweergave Sales Funnel">
      <WeekContent />
    </TVDashboardLayout>
  );
}
