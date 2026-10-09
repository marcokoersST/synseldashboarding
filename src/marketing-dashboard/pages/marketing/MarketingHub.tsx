import { useEffect, useMemo, useRef, useState } from "react";
import { getISOWeek, getYear, startOfDay, startOfWeek, differenceInDays, subDays } from "date-fns";
import { LoaderCircle, Tv, X } from "lucide-react";
import type { DateRange } from "react-day-picker-v9";
import type { DeltaMode } from "@/marketing-dashboard/components/marketing/DeltaCell";

import DateFilterPanel from "@/marketing-dashboard/components/marketing/DateFilterPanel";
import MarketingFilterPanel from "@/marketing-dashboard/components/marketing/MarketingFilterPanel";
import type { MarketingFilterRule } from "@/marketing-dashboard/lib/marketingFilters";
import OverviewTab from "./tabs/OverviewTab";
import PaidChannelsTab from "./tabs/PaidChannelsTab";
import JobboardsTab from "./tabs/JobboardsTab";
import PaidSocialTab from "./tabs/PaidSocialTab";
import PaidSocialAdLevelTab from "./tabs/PaidSocialAdLevelTab";
import PrognoseTab from "./tabs/PrognoseTab";
import { Button } from "@/marketing-dashboard/components/ui/button";
import { cn } from "@/marketing-dashboard/lib/utils";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "paid-channels", label: "Paid Channels" },
  { id: "jobboards", label: "Jobboards" },
  { id: "paid-social", label: "Paid Social" },
  { id: "paid-social-ad", label: "Paid Social – Ad level" },
  { id: "prognose", label: "Prognose" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const today = startOfDay(new Date());
const monday = startOfWeek(today, { weekStartsOn: 1 });

function getDefaultCompareRange(range: DateRange): DateRange | null {
  if (!range.from || !range.to) return null;
  const days = differenceInDays(range.to, range.from) + 1;
  return { from: subDays(range.from, days), to: subDays(range.from, 1) };
}

const MarketingHub = () => {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [dateRange, setDateRange] = useState<DateRange>({ from: monday, to: today });
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [compareRange, setCompareRange] = useState<DateRange | null>(null);
  const [deltaMode, setDeltaMode] = useState<DeltaMode>("percent");
  const [filters, setFilters] = useState<MarketingFilterRule[]>([]);
  // Click-selections (quick-* rules) belong to one tab; only the top filter panel applies across tabs.
  const [tabQuickFilters, setTabQuickFilters] = useState<Record<string, MarketingFilterRule[]>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  }, []);

  const [tvOpen, setTvOpen] = useState(false);
  const tvRef = useRef<HTMLDivElement | null>(null);
  const openTv = () => {
    setTvOpen(true);
    document.documentElement.requestFullscreen?.().catch(() => {});
  };
  const closeTv = () => {
    setTvOpen(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  };
  useEffect(() => {
    if (!tvOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setTvOpen(false); };
    const onFs = () => { if (!document.fullscreenElement) setTvOpen(false); };
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFs);
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("fullscreenchange", onFs); };
  }, [tvOpen]);

  const showRefresh = () => {
    setIsRefreshing(true);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => {
      setIsRefreshing(false);
      refreshTimer.current = null;
    }, 500);
  };

  const updateData = <T,>(setter: (value: T) => void) => (value: T) => {
    showRefresh();
    setter(value);
  };

  const weekLabel = useMemo(() => {
    if (!dateRange.from) return "";
    return `Week ${getISOWeek(dateRange.from)}, ${getYear(dateRange.from)}`;
  }, [dateRange.from]);

  const effectiveCompareRange = compareEnabled ? (compareRange ?? getDefaultCompareRange(dateRange)) : null;

  const renderTab = () => {
    const tabFilters = [...filters, ...(tabQuickFilters[activeTab] ?? [])];
    const setTabFilters = updateData((next: MarketingFilterRule[]) => {
      setFilters(next.filter((f) => !f.id.startsWith("quick-")));
      setTabQuickFilters((cur) => ({ ...cur, [activeTab]: next.filter((f) => f.id.startsWith("quick-")) }));
    });
    const sharedProps = { dateRange, compareRange: effectiveCompareRange, deltaMode, filters: tabFilters };
    switch (activeTab) {
      case "overview": return <OverviewTab {...sharedProps} onTabChange={setActiveTab} onFiltersChange={setTabFilters} />;
      case "paid-channels": return <PaidChannelsTab {...sharedProps} onFiltersChange={setTabFilters} />;
      case "jobboards": return <JobboardsTab {...sharedProps} onFiltersChange={setTabFilters} />;
      case "paid-social": return <PaidSocialTab {...sharedProps} onFiltersChange={setTabFilters} />;
      case "paid-social-ad": return <PaidSocialAdLevelTab {...sharedProps} onFiltersChange={setTabFilters} />;
      case "prognose": return <PrognoseTab {...sharedProps} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Marketing Hub</h1>
            <p className="text-sm text-muted-foreground">{weekLabel}</p>
          </div>
          <Button variant="outline" size="sm" onClick={openTv}><Tv className="size-4" />TV Weergave</Button>
        </div>
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <MarketingFilterPanel filters={filters} onChange={updateData(setFilters)} />
            <DateFilterPanel
              dateRange={dateRange}
              onDateRangeChange={updateData(setDateRange)}
              compareEnabled={compareEnabled}
              onCompareEnabledChange={updateData(setCompareEnabled)}
              compareRange={compareRange}
              onCompareRangeChange={updateData(setCompareRange)}
              deltaMode={deltaMode}
              onDeltaModeChange={updateData(setDeltaMode)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-0 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <Button
            variant="ghost"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "h-auto rounded-none px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors hover:bg-muted/50 hover:text-foreground",
              activeTab === tab.id
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {renderTab()}

      {tvOpen && (
        <div ref={tvRef} className="fixed inset-0 z-40 flex flex-col gap-6 overflow-auto bg-background p-8 [@media(max-height:850px)]:gap-2 [@media(max-height:850px)]:p-5" role="dialog" aria-label="TV Weergave">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Marketing Hub <span className="font-normal text-muted-foreground">· {weekLabel}</span></h1>
            <Button variant="ghost" size="icon" onClick={closeTv} aria-label="TV Weergave sluiten"><X className="size-5" /></Button>
          </div>
          <OverviewTab dateRange={dateRange} compareRange={effectiveCompareRange} deltaMode={deltaMode} filters={filters} onTabChange={() => {}} tvMode />
          <PrognoseTab dateRange={dateRange} filters={filters} tvMode />
        </div>
      )}

      {isRefreshing && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background/35 backdrop-blur-[1px]"
          role="status"
          aria-live="polite"
          aria-label="Data wordt bijgewerkt"
        >
          <div className="flex items-center gap-3 rounded-md border border-border bg-card px-5 py-4 text-card-foreground shadow-lg">
            <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none text-primary" aria-hidden="true" />
            <span className="text-sm font-medium">Data bijwerken…</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingHub;
