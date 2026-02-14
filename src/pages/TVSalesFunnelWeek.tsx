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
    <div className={cn("flex flex-col", compact ? "gap-2 h-full" : "gap-4")}>
      {/* KPI tiles with conversion arrows */}
      <div className="flex items-stretch gap-0">
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

      {/* Unit breakdown + conversions merged */}
      <UnitFunnelBreakdown />

      {/* Bottom row */}
      <div className={cn("grid grid-cols-2", compact ? "gap-2 flex-1 min-h-0" : "gap-4")}>
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
