import { TVDashboardLayout, useTVCompact } from "@/components/tv/TVDashboardLayout";
import { SalesFunnelKPI } from "@/components/tv/SalesFunnelKPI";
import { ConversionArrow } from "@/components/tv/ConversionArrow";
import { CandidatesPipeline } from "@/components/tv/CandidatesPipeline";
import { CallStats } from "@/components/tv/CallStats";
import { UnitFunnelBreakdown } from "@/components/tv/UnitFunnelBreakdown";
import { ConversionFormulasCard } from "@/components/tv/ConversionFormulasCard";
import { SalesFunnelFilterBar } from "@/components/tv/SalesFunnelFilterBar";
import { SalesFunnelFiltersProvider } from "@/contexts/SalesFunnelFiltersContext";
import { weekFunnelMetrics, weekOverallConversions } from "@/data/tvData";
import { cn } from "@/lib/utils";

function WeekContent() {
  const compact = useTVCompact();

  return (
    <div className={cn("flex flex-col h-full", compact ? "gap-1" : "gap-4")}>
      {!compact && <SalesFunnelFilterBar />}

      {/* KPI tiles */}
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

      {/* Unit breakdown */}
      <div className={cn("min-h-0 overflow-auto", compact ? "flex-[3]" : "flex-1")}>
        <UnitFunnelBreakdown />
      </div>

      {/* Bottom row */}
      <div className={cn("grid min-h-0", compact ? "grid-cols-3 gap-1 flex-[2]" : "grid-cols-3 gap-4 shrink-0")}>
        <CallStats mode="week" />
        <CandidatesPipeline />
        <ConversionFormulasCard />
      </div>
    </div>
  );
}

export default function TVSalesFunnelWeek() {
  return (
    <SalesFunnelFiltersProvider defaultViewMode="week">
      <TVDashboardLayout title="Weekweergave Sales Funnel">
        <WeekContent />
      </TVDashboardLayout>
    </SalesFunnelFiltersProvider>
  );
}
