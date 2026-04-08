import { useState, useMemo } from "react";
import { getISOWeek, getYear, startOfWeek, addDays } from "date-fns";
import { nl } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

import OverviewTab from "./tabs/OverviewTab";
import PaidChannelsTab from "./tabs/PaidChannelsTab";
import JobboardsTab from "./tabs/JobboardsTab";
import PaidSocialTab from "./tabs/PaidSocialTab";
import PaidSocialAdLevelTab from "./tabs/PaidSocialAdLevelTab";
import ReverseMatchingTab from "./tabs/ReverseMatchingTab";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "paid-channels", label: "Paid Channels" },
  { id: "jobboards", label: "Jobboards" },
  { id: "paid-social", label: "Paid Social" },
  { id: "paid-social-ad", label: "Paid Social – Ad level" },
  { id: "reverse-matching", label: "Reverse Matching" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const today = new Date();
const monday = startOfWeek(today, { weekStartsOn: 1 });

const MarketingHub = () => {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: monday,
    to: today,
  });

  const weekLabel = useMemo(() => {
    if (!dateRange.from) return "";
    return `Week ${getISOWeek(dateRange.from)}, ${getYear(dateRange.from)}`;
  }, [dateRange.from]);

  const renderTab = () => {
    const props = { dateRange, onTabChange: setActiveTab };
    switch (activeTab) {
      case "overview": return <OverviewTab {...props} />;
      case "paid-channels": return <PaidChannelsTab dateRange={dateRange} />;
      case "jobboards": return <JobboardsTab dateRange={dateRange} />;
      case "paid-social": return <PaidSocialTab dateRange={dateRange} />;
      case "paid-social-ad": return <PaidSocialAdLevelTab dateRange={dateRange} />;
      case "reverse-matching": return <ReverseMatchingTab dateRange={dateRange} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marketing Hub</h1>
          <p className="text-sm text-muted-foreground">{weekLabel}</p>
        </div>

        {/* Date range picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("justify-start text-left font-normal w-[260px]", !dateRange.from && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to
                  ? `${format(dateRange.from, "d MMM", { locale: nl })} – ${format(dateRange.to, "d MMM yyyy", { locale: nl })}`
                  : format(dateRange.from, "d MMM yyyy", { locale: nl })
              ) : "Selecteer periode"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={(range) => range && setDateRange(range)}
              numberOfMonths={2}
              locale={nl}
              modifiers={{ today: [today] }}
              modifiersClassNames={{ today: "ring-2 ring-primary rounded-md" }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Tab bar */}
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

      {/* Tab content */}
      {renderTab()}
    </div>
  );
};

export default MarketingHub;
