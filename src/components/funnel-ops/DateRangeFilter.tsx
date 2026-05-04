import { useState } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { CalendarIcon, ArrowLeftRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  useFunnelOpsFilters,
  presetToRange,
  compareForRange,
  type DateRange as DR,
} from "@/contexts/FunnelOpsFiltersContext";
import type { DateRange as DPRange } from "react-day-picker";

const PRESETS: { id: string; label: string }[] = [
  { id: "rolling7", label: "Laatste 7 dagen" },
  { id: "rolling14", label: "Laatste 14 dagen" },
  { id: "rolling30", label: "Laatste 30 dagen" },
  { id: "thisMonth", label: "Deze maand" },
  { id: "lastMonth", label: "Vorige maand" },
  { id: "custom", label: "Aangepast…" },
];

const COMPARE_PRESETS: { id: string; label: string }[] = [
  { id: "previous", label: "Vorige periode (gelijk)" },
  { id: "yearAgo", label: "1 jaar terug" },
  { id: "none", label: "Geen vergelijking" },
  { id: "custom", label: "Aangepast…" },
];

function fmt(r: DR) {
  return `${format(r.from, "d MMM", { locale: nl })} – ${format(r.to, "d MMM yy", { locale: nl })}`;
}

export function DateRangeFilter() {
  const { filters, setFilters } = useFunnelOpsFilters();
  const [open, setOpen] = useState(false);

  const setPreset = (id: string) => {
    if (id === "custom") {
      setFilters({ ...filters, presetId: "custom" });
      return;
    }
    const r = presetToRange(id);
    if (!r) return;
    const cmp = filters.comparePresetId === "custom"
      ? filters.compare
      : compareForRange(r, filters.comparePresetId);
    setFilters({ ...filters, presetId: id, current: r, compare: cmp });
  };

  const setComparePreset = (id: string) => {
    if (id === "custom") { setFilters({ ...filters, comparePresetId: "custom" }); return; }
    const cmp = compareForRange(filters.current, id);
    setFilters({ ...filters, comparePresetId: id, compare: cmp });
  };

  const onCurrentSelect = (range: DPRange | undefined) => {
    if (!range?.from) return;
    const to = range.to ?? range.from;
    const cur: DR = { from: range.from.getTime(), to: to.getTime() + 24 * 3600 * 1000 - 1 };
    const cmp = filters.comparePresetId === "custom"
      ? filters.compare
      : compareForRange(cur, filters.comparePresetId);
    setFilters({ ...filters, presetId: "custom", current: cur, compare: cmp });
  };

  const onCompareSelect = (range: DPRange | undefined) => {
    if (!range?.from) return;
    const to = range.to ?? range.from;
    setFilters({
      ...filters,
      comparePresetId: "custom",
      compare: { from: range.from.getTime(), to: to.getTime() + 24 * 3600 * 1000 - 1 },
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 font-normal text-xs">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span className="tabular-nums">{fmt(filters.current)}</span>
          {filters.compare && (
            <>
              <ArrowLeftRight className="w-3 h-3 text-muted-foreground" />
              <span className="tabular-nums text-muted-foreground">{fmt(filters.compare)}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex">
          {/* Preset column */}
          <div className="border-r border-border p-2 space-y-3 w-56">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground px-2 mb-1">Periode</div>
              {PRESETS.map(p => (
                <button key={p.id} onClick={() => setPreset(p.id)}
                  className={cn("w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted", filters.presetId === p.id && "bg-muted font-medium")}>
                  {p.label}
                </button>
              ))}
            </div>
            <Separator />
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground px-2 mb-1">Vergelijk met</div>
              {COMPARE_PRESETS.map(p => (
                <button key={p.id} onClick={() => setComparePreset(p.id)}
                  className={cn("w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted", filters.comparePresetId === p.id && "bg-muted font-medium")}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calendars */}
          <div className="flex flex-col">
            <div className="p-2">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground px-1 mb-1">Huidige periode</div>
              <Calendar
                mode="range"
                numberOfMonths={2}
                defaultMonth={new Date(filters.current.from)}
                selected={{ from: new Date(filters.current.from), to: new Date(filters.current.to) }}
                onSelect={onCurrentSelect}
                className={cn("p-2 pointer-events-auto")}
              />
            </div>
            {filters.comparePresetId === "custom" && filters.compare && (
              <>
                <Separator />
                <div className="p-2">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground px-1 mb-1">Vergelijkperiode</div>
                  <Calendar
                    mode="range"
                    numberOfMonths={2}
                    defaultMonth={new Date(filters.compare.from)}
                    selected={{ from: new Date(filters.compare.from), to: new Date(filters.compare.to) }}
                    onSelect={onCompareSelect}
                    className={cn("p-2 pointer-events-auto")}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helper hook used by tabs to fetch counts per range
export function useRangeStats() {
  const { filters } = useFunnelOpsFilters();
  return { current: filters.current, compare: filters.compare };
}
