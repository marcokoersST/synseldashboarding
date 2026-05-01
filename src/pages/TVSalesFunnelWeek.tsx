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
import { DevNote } from "@/components/groeimodel/DevNote";

function WeekContent() {
  const compact = useTVCompact();

  return (
    <div className={cn("flex flex-col h-full", compact ? "gap-1" : "gap-4")}>
      {!compact && (
        <>
          <SalesFunnelFilterBar />
          <DevNote
            story={<><strong>As a user (manager/TV viewer)</strong>, I want to filter the Sales Funnel data by unit, consultant, date range, and visible column groups, <strong>so that</strong> I can focus on the exact slice of performance I need to analyse or present on TV.</>}
            logic={`The filter bar provides four controls:

  • Unit selector — multi-select popover with "Alle units"
    default and batch toggle. Filters all tiles below.
  • Consultant selector — depends on selected units, with
    search and active/inactive toggle.
  • Date range — calendar picker defining the rolling window
    (default: Mon → Today).
  • Column groups — checkboxes to show/hide funnel step
    groups in the breakdown table (e.g. hide Acquisitie).

All filters propagate through SalesFunnelFiltersContext
so every child tile reacts to the same selection.`}
          />
        </>
      )}

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
      <DevNote
        story={<><strong>As a user (manager/TV viewer)</strong>, I want to see the top-level funnel KPIs for the current week at a glance, with conversion rates between each step, <strong>so that</strong> I can immediately spot bottlenecks or momentum in the recruitment pipeline.</>}
        logic={`Five KPI cards represent the main funnel steps:
Inschrijvingen → Acquisities → Voorstellen →
Gesprekken → Plaatsingen.

Each card shows:
  • The absolute count for the selected week.
  • A percentage change vs. the previous equal-length
    period (green = positive, red = negative).

Between each pair of cards a ConversionArrow displays
the step-to-step conversion rate (e.g. Acquisities ÷
Inschrijvingen × 100).

Color coding on the arrow pill:
  ≥ 70 % → green (accent)
  40-69 % → neutral
  < 40 % → red (destructive)

Data source: weekFunnelMetrics + weekOverallConversions
from tvData.ts.`}
      />

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
