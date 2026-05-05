import { useState, useMemo } from "react";
import { getISOWeek, getYear, startOfWeek, differenceInDays, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import type { DeltaMode } from "@/components/marketing/DeltaCell";

import DateFilterPanel from "@/components/marketing/DateFilterPanel";
import OverviewTab from "./tabs/OverviewTab";
import PaidChannelsTab from "./tabs/PaidChannelsTab";
import JobboardsTab from "./tabs/JobboardsTab";
import PaidSocialTab from "./tabs/PaidSocialTab";
import PaidSocialAdLevelTab from "./tabs/PaidSocialAdLevelTab";
import InschrijvingenTab from "./tabs/InschrijvingenTab";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "paid-channels", label: "Paid Channels" },
  { id: "jobboards", label: "Jobboards" },
  { id: "paid-social", label: "Paid Social" },
  { id: "paid-social-ad", label: "Paid Social – Ad level" },
  { id: "inschrijvingen", label: "Inschrijvingen" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const today = new Date();
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

  const weekLabel = useMemo(() => {
    if (!dateRange.from) return "";
    return `Week ${getISOWeek(dateRange.from)}, ${getYear(dateRange.from)}`;
  }, [dateRange.from]);

  const effectiveCompareRange = compareEnabled ? (compareRange ?? getDefaultCompareRange(dateRange)) : null;

  const renderTab = () => {
    const sharedProps = { dateRange, compareRange: effectiveCompareRange, deltaMode };
    switch (activeTab) {
      case "overview": return <OverviewTab {...sharedProps} onTabChange={setActiveTab} />;
      case "paid-channels": return <PaidChannelsTab {...sharedProps} />;
      case "jobboards": return <JobboardsTab {...sharedProps} />;
      case "paid-social": return <PaidSocialTab {...sharedProps} />;
      case "paid-social-ad": return <PaidSocialAdLevelTab {...sharedProps} />;
      case "inschrijvingen": return <InschrijvingenTab {...sharedProps} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marketing Hub</h1>
          <p className="text-sm text-muted-foreground">{weekLabel}</p>
        </div>
        <DateFilterPanel
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          compareEnabled={compareEnabled}
          onCompareEnabledChange={setCompareEnabled}
          compareRange={compareRange}
          onCompareRangeChange={setCompareRange}
          deltaMode={deltaMode}
          onDeltaModeChange={setDeltaMode}
        />
      </div>

      <div className="flex gap-0 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderTab()}
    </div>
  );
};

export default MarketingHub;
