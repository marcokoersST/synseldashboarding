import { useState, useMemo } from "react";
import { getISOWeek, getYear, startOfWeek, differenceInDays, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import type { DeltaMode } from "@/components/marketing/DeltaCell";

import DateFilterPanel from "@/components/marketing/DateFilterPanel";
import RecruitmentOverviewTab from "./tabs/RecruitmentOverviewTab";
import RecruitmentTab from "./tabs/RecruitmentTab";
import RecruitmentMarketingTab from "./tabs/RecruitmentMarketingTab";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "recruitment", label: "Recruitment" },
  { id: "marketing", label: "Marketing" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const today = new Date();
const monday = startOfWeek(today, { weekStartsOn: 1 });

function getDefaultCompareRange(range: DateRange): DateRange | null {
  if (!range.from || !range.to) return null;
  const days = differenceInDays(range.to, range.from) + 1;
  return { from: subDays(range.from, days), to: subDays(range.from, 1) };
}

const RecruitmentInternHub = () => {
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
      case "overview": return <RecruitmentOverviewTab {...sharedProps} onTabChange={setActiveTab} />;
      case "recruitment": return <RecruitmentTab {...sharedProps} />;
      case "marketing": return <RecruitmentMarketingTab {...sharedProps} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recruitment Intern Hub</h1>
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

export default RecruitmentInternHub;
