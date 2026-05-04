import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FunnelOpsFiltersProvider } from "@/contexts/FunnelOpsFiltersContext";
import { OverviewTab } from "@/components/funnel-ops/tabs/OverviewTab";
import { InstroomTab } from "@/components/funnel-ops/tabs/InstroomTab";
import { DistributieTab } from "@/components/funnel-ops/tabs/DistributieTab";
import { ForecastTab } from "@/components/funnel-ops/tabs/ForecastTab";
import { OpvolgingTab } from "@/components/funnel-ops/tabs/OpvolgingTab";
import { WatchlistTab } from "@/components/funnel-ops/tabs/WatchlistTab";
import { DevInfoTab } from "@/components/funnel-ops/tabs/DevInfoTab";
import { Lock } from "lucide-react";
import { DateRangeFilter } from "@/components/funnel-ops/DateRangeFilter";

const TABS = [
  { value: "overzicht", label: "Overzicht" },
  { value: "instroom", label: "Instroom" },
  { value: "distributie", label: "Distributie" },
  { value: "forecast", label: "Forecast" },
  { value: "opvolging", label: "Opvolging" },
  { value: "watchlist", label: "Watchlist" },
  { value: "dev", label: "Dev info" },
];

export default function FunnelOperations() {
  const [params, setParams] = useSearchParams();
  const current = params.get("tab") ?? "overzicht";
  const goTo = (tab: string) => setParams({ tab });

  return (
    <FunnelOpsFiltersProvider>
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Funnel Operations</h1>
            <p className="text-sm text-muted-foreground">
              Stuurinformatie voor het hele Synsel-team — instroomkwaliteit, distributie-optimalisatie,
              opvolg-discipline. Eén dashboard, geen rollen.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DateRangeFilter />
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider bg-muted text-muted-foreground border border-border rounded-full px-2.5 py-1">
              <Lock className="w-3 h-3" /> Read-only · acties via RecruitCRM
            </span>
          </div>
        </header>

        <Tabs value={current} onValueChange={goTo}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50">
            {TABS.map(t => (
              <TabsTrigger key={t.value} value={t.value} className="text-xs md:text-sm">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overzicht" className="mt-4"><OverviewTab goTo={goTo} /></TabsContent>
          <TabsContent value="instroom" className="mt-4"><InstroomTab /></TabsContent>
          <TabsContent value="distributie" className="mt-4"><DistributieTab /></TabsContent>
          <TabsContent value="forecast" className="mt-4"><ForecastTab /></TabsContent>
          <TabsContent value="opvolging" className="mt-4"><OpvolgingTab /></TabsContent>
          <TabsContent value="watchlist" className="mt-4"><WatchlistTab /></TabsContent>
          <TabsContent value="dev" className="mt-4"><DevInfoTab /></TabsContent>
        </Tabs>
      </div>
    </FunnelOpsFiltersProvider>
  );
}
