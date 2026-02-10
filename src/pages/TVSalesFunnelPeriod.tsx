import { TVDashboardLayout } from "@/components/tv/TVDashboardLayout";
import { SalesFunnelKPI } from "@/components/tv/SalesFunnelKPI";
import { CandidatesPipeline } from "@/components/tv/CandidatesPipeline";
import { CallStats } from "@/components/tv/CallStats";
import { periodFunnelMetrics } from "@/data/tvData";

export default function TVSalesFunnelPeriod() {
  return (
    <TVDashboardLayout title="Periodeweergave Sales Funnel">
      <div className="grid grid-cols-5 gap-4 mb-6">
        {periodFunnelMetrics.map((m, i) => (
          <SalesFunnelKPI key={m.label} metric={m} index={i} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <CallStats mode="period" />
        <CandidatesPipeline />
      </div>
    </TVDashboardLayout>
  );
}
