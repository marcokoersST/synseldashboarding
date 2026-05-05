import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FunnelOpsFiltersProvider } from "@/contexts/FunnelOpsFiltersContext";
import { OverviewTab } from "@/components/funnel-ops/tabs/OverviewTab";
import { InstroomTab } from "@/components/funnel-ops/tabs/InstroomTab";
import { DistributieTab } from "@/components/funnel-ops/tabs/DistributieTab";
import { ForecastTab } from "@/components/funnel-ops/tabs/ForecastTab";
import { OpvolgingTab } from "@/components/funnel-ops/tabs/OpvolgingTab";
import { WatchlistTab } from "@/components/funnel-ops/tabs/WatchlistTab";
import { LayoutDashboard, Users, Shuffle, TrendingUp, PhoneCall, Eye, Activity, Monitor } from "lucide-react";
import { DateRangeFilter } from "@/components/funnel-ops/DateRangeFilter";
import { Link } from "react-router-dom";

const TABS = [
  { value: "overzicht", label: "Overzicht", icon: LayoutDashboard },
  { value: "instroom", label: "Instroom", icon: Users },
  { value: "distributie", label: "Distributie", icon: Shuffle },
  { value: "forecast", label: "Forecast", icon: TrendingUp },
  { value: "opvolging", label: "Opvolging", icon: PhoneCall },
  { value: "watchlist", label: "Watchlist", icon: Eye },
];

export default function FunnelOperations() {
  const [params, setParams] = useSearchParams();
  const current = params.get("tab") ?? "overzicht";
  const goTo = (tab: string) => setParams({ tab });

  return (
    <FunnelOpsFiltersProvider>
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <Activity className="w-7 h-7 text-primary mt-1" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Funnel Operations</h1>
              <p className="text-sm text-muted-foreground">
                Stuurinformatie voor het hele Synsel-team — instroomkwaliteit, distributie-optimalisatie,
                opvolg-discipline. Eén dashboard, geen rollen.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DateRangeFilter />
            {current === "overzicht" && (
              <>
                <Link
                  to="/tv/funnel-ops-overzicht"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted/50 text-xs transition-colors"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  TV Modus · Overzicht
                </Link>
                <Link
                  to="/tv/funnel-ops-acties"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted/50 text-xs transition-colors"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  TV Modus · Acties
                </Link>
              </>
            )}
          </div>
        </header>

        <Tabs value={current} onValueChange={goTo}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="text-xs md:text-sm flex items-center gap-1.5 rounded-none border-b-2 border-transparent bg-transparent data-[state=active]:border-[hsl(45,86%,52%)] data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="overzicht" className="mt-4 animate-fade-in"><OverviewTab goTo={goTo} /></TabsContent>
          <TabsContent value="instroom" className="mt-4 animate-fade-in"><InstroomTab /></TabsContent>
          <TabsContent value="distributie" className="mt-4 animate-fade-in"><DistributieTab /></TabsContent>
          <TabsContent value="forecast" className="mt-4 animate-fade-in"><ForecastTab /></TabsContent>
          <TabsContent value="opvolging" className="mt-4 animate-fade-in"><OpvolgingTab /></TabsContent>
          <TabsContent value="watchlist" className="mt-4 animate-fade-in"><WatchlistTab /></TabsContent>
          
        </Tabs>
      </div>
    </FunnelOpsFiltersProvider>
  );
}
