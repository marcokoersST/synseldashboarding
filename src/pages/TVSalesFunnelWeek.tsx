import { TVDashboardLayout, useTVCompact } from "@/components/tv/TVDashboardLayout";
import { SalesFunnelKPI } from "@/components/tv/SalesFunnelKPI";
import { ConversionArrow } from "@/components/tv/ConversionArrow";
import { CandidatesPipeline } from "@/components/tv/CandidatesPipeline";
import { CallStats } from "@/components/tv/CallStats";
import { UnitFunnelBreakdown } from "@/components/tv/UnitFunnelBreakdown";
import { ConversionFormulasCard } from "@/components/tv/ConversionFormulasCard";
import { ConversionIconLegend } from "@/components/tv/ConversionIconLegend";
import { SalesFunnelFilterBar } from "@/components/tv/SalesFunnelFilterBar";
import { SalesFunnelFiltersProvider } from "@/contexts/SalesFunnelFiltersContext";
import { weekFunnelMetrics, weekOverallConversions } from "@/data/tvData";
import { cn } from "@/lib/utils";
import { DevNote } from "@/components/groeimodel/DevNote";

function WeekContent() {
  const compact = useTVCompact();

  // TV mode: fixed grid that fills the viewport, never scrolls.
  if (compact) {
    return (
      <div
        className="h-full w-full grid gap-2 overflow-hidden"
        style={{ gridTemplateRows: "16fr 39fr 5fr 40fr" }}
      >
        {/* KPI row */}
        <div className="flex items-stretch gap-1 min-h-0">
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
        <div className="min-h-0 overflow-hidden">
          <UnitFunnelBreakdown />
        </div>

        {/* Icon legend strip */}
        <div className="min-h-0 flex items-center">
          <div className="w-full">
            <ConversionIconLegend />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-3 gap-2 min-h-0">
          <CallStats mode="week" />
          <CandidatesPipeline />
          <ConversionFormulasCard />
        </div>
      </div>
    );
  }

  // Normal preview mode (unchanged behaviour, with DevNotes)
  return (
    <div className="flex flex-col h-full gap-4">
      <SalesFunnelFilterBar />
      <DevNote
        story={<><strong>As a manager / TV viewer</strong>, I want to scope the Sales Funnel by unit, consultant, date range and which table columns are visible, <strong>so that</strong> I can focus on the exact slice of performance I need to analyse or present.</>}
        logic={`The filter bar exposes four controls, all wired through
SalesFunnelFiltersContext so every tile below reacts in sync:

  • Unit — multi-select popover, "Alle units" default,
    "Alles aan / Alles uit" batch toggles.
  • Consultant — depends on the selected units; supports
    search and an active/inactive toggle.
  • Date range — rolling window, default Monday → Today;
    comparisons use the previous equal-length window.
  • Tabelkolommen — unified popover that combines funnel-
    step group toggles and per-sub-column checkboxes
    (values + conversies). Toggling a group flips all its
    child sub-keys. Top bar offers Reset / Alles aan /
    Alles uit. Only affects the Unit Funnel breakdown.`}
      />

      {/* KPI tiles */}
      <div className="flex items-stretch shrink-0 gap-0">
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
        story={<><strong>As a manager / TV viewer</strong>, I want to see the top-level funnel KPIs for the rolling week at a glance, with conversion rates between each step, <strong>so that</strong> I can immediately spot bottlenecks or momentum across the recruitment pipeline.</>}
        logic={`Five KPI cards represent the main funnel steps:
Inschrijvingen → Acquisities → Voorstellen →
Gesprekken → Plaatsingen.

Each card shows:
  • The absolute count for the selected window.
  • Delta vs. the previous equal-length period
    (green = positive, red = negative).

Between each pair of cards, a ConversionArrow renders
the step-to-step conversion rate.

Data source: weekFunnelMetrics + weekOverallConversions
in src/data/tvData.ts.`}
      />

      {/* Unit breakdown */}
      <div className="min-h-0 overflow-auto flex-1">
        <UnitFunnelBreakdown />
      </div>
      <DevNote
        story={<><strong>As a manager</strong>, I want to compare every unit across the full funnel and its conversion ratios in one table, <strong>so that</strong> I can identify which units lag on which step and prioritise coaching.</>}
        logic={`Tile: "Uitsplitsing per Unit & Conversies".

  • Rows = units, filtered by visibleUnits from
    SalesFunnelFiltersContext.
  • Columns = 7 funnel-step groups defined in
    src/data/unitFunnelColumns.ts:
      1. Inschrijvingen   2. Acquisitie
      3. Voorstellen      4. Uitnodigingen
      5. Gesprekken       6. Vervolg
      7. Geplaatst
  • Each group exposes "value" sub-columns (raw counts)
    and "conv" sub-columns (ratio between two values,
    rendered with %-icon and dashed divider).
  • Visibility is driven by visibleColumnGroups +
    visibleSubKeys in context. The unified Tabelkolommen
    popover in the filter bar mutates both.
  • Default selection hides the "Toegewezen" value column;
    all other sub-keys are on by default.

Data source: weekUnitFunnelRows in src/data/tvData.ts.`}
      />

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4 shrink-0">
        <CallStats mode="week" />
        <CandidatesPipeline />
        <ConversionFormulasCard />
      </div>
      <DevNote
        story={<><strong>As a manager / TV viewer</strong>, I want supporting context next to the funnel — call activity, the live candidate pipeline and the conversie formulas — <strong>so that</strong> I can interpret the numbers above without leaving the screen.</>}
        logic={`Three tiles in the bottom row:

  • CallStats (mode="week") — Telefonie volume for the
    rolling week: total calls, success rate and average
    call duration formatted as [H:M:S].
  • CandidatesPipeline — current open candidate count
    per pipeline stage; counts are point-in-time, not
    period-bound.
  • ConversionFormulasCard — static reference card
    listing every conversie formula used in the Unit
    Funnel breakdown (e.g. Inschr. % = Ingeschreven ÷
    Toegewezen) so viewers can audit the ratios.`}
      />
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
