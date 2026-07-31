import { useState } from "react";
import { subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import PreMatchingFilterBar from "@/components/pre-matching/PreMatchingFilterBar";
import OverviewTab from "@/pages/pre-matching/tabs/OverviewTab";
import VacatureDrilldownTab from "@/pages/pre-matching/tabs/VacatureDrilldownTab";
import ConsultantInzichtTab from "@/pages/pre-matching/tabs/ConsultantInzichtTab";
import { emptyFilters, type PreMatchingFilters } from "@/data/preMatchingData";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "vacature", label: "Vacature drill-down" },
  { id: "consultant", label: "Consultant-inzicht" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const today = new Date();

const PreMatchingHub = () => {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [dateRange, setDateRange] = useState<DateRange>({ from: subDays(today, 89), to: today });
  const [filters, setFilters] = useState<PreMatchingFilters>(emptyFilters);
  const [selectedVacature, setSelectedVacature] = useState<string | null>(null);

  const effectiveFilters: PreMatchingFilters = {
    ...filters,
    from: dateRange.from,
    to: dateRange.to,
  };

  const openVacature = (id: string) => {
    setSelectedVacature(id);
    setActiveTab("vacature");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pre-Matching Engine</h1>
        <p className="text-sm text-muted-foreground">
          Welke plaatsingskansen worden daadwerkelijk gerealiseerd — en waar blijven ze liggen?
        </p>
      </div>

      <PreMatchingFilterBar
        filters={filters}
        onChange={setFilters}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === t.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <OverviewTab filters={effectiveFilters} onSelectVacature={openVacature} />
      )}
      {activeTab === "vacature" && (
        <VacatureDrilldownTab
          vacatureId={selectedVacature ?? ""}
          filters={effectiveFilters}
          onBack={() => setActiveTab("overview")}
          onSelectVacature={setSelectedVacature}
        />
      )}
      {activeTab === "consultant" && (
        <ConsultantInzichtTab filters={effectiveFilters} onSelectVacature={openVacature} />
      )}
    </div>
  );
};

export default PreMatchingHub;
