import { TVDashboardLayout } from "@/components/tv/TVDashboardLayout";
import { SalesFunnelKPI } from "@/components/tv/SalesFunnelKPI";
import { CandidatesPipeline } from "@/components/tv/CandidatesPipeline";
import { CallStats } from "@/components/tv/CallStats";
import { UnitFunnelBreakdown } from "@/components/tv/UnitFunnelBreakdown";
import { FunnelConversions } from "@/components/tv/FunnelConversions";
import { weekFunnelMetrics } from "@/data/tvData";

export default function TVSalesFunnelWeek() {
  return (
    <TVDashboardLayout title="Weekweergave Sales Funnel">
      <div className="grid grid-cols-6 gap-4 mb-6">
        {weekFunnelMetrics.map((m, i) => (
          <SalesFunnelKPI key={m.label} metric={m} index={i} />
        ))}
      </div>
      <UnitFunnelBreakdown />
      <div className="grid grid-cols-2 gap-4 mt-4">
        <FunnelConversions />
        <div className="flex flex-col gap-4">
          <CallStats mode="week" />
          <CandidatesPipeline />
        </div>
      </div>
    </TVDashboardLayout>
  );
}
