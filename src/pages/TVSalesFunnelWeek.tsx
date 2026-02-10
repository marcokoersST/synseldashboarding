import { TVDashboardLayout } from "@/components/tv/TVDashboardLayout";
import { SalesFunnelKPI } from "@/components/tv/SalesFunnelKPI";
import { CandidatesPipeline } from "@/components/tv/CandidatesPipeline";
import { CallStats } from "@/components/tv/CallStats";
import { weekFunnelMetrics } from "@/data/tvData";

export default function TVSalesFunnelWeek() {
  return (
    <TVDashboardLayout title="Weekweergave Sales Funnel">
      <div className="grid grid-cols-6 gap-4 mb-6">
        {weekFunnelMetrics.map((m, i) => (
          <SalesFunnelKPI key={m.label} metric={m} index={i} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <CandidatesPipeline />
        <CallStats mode="week" />
      </div>
    </TVDashboardLayout>
  );
}
