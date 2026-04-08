import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, differenceInDays } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface DateFilterPanelProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  compareEnabled: boolean;
  onCompareEnabledChange: (enabled: boolean) => void;
  compareRange: DateRange | null;
  onCompareRangeChange: (range: DateRange | null) => void;
}

const today = new Date();

type PresetId = "today" | "yesterday" | "last7" | "last14" | "last30" | "thisWeek" | "prevWeek" | "thisMonth" | "prevMonth" | "max";

const presets: { id: PresetId; label: string; getRange: () => DateRange }[] = [
  { id: "today", label: "Vandaag", getRange: () => ({ from: today, to: today }) },
  { id: "yesterday", label: "Gisteren", getRange: () => ({ from: subDays(today, 1), to: subDays(today, 1) }) },
  { id: "last7", label: "Laatste 7 dagen", getRange: () => ({ from: subDays(today, 6), to: today }) },
  { id: "last14", label: "Laatste 14 dagen", getRange: () => ({ from: subDays(today, 13), to: today }) },
  { id: "last30", label: "Laatste 30 dagen", getRange: () => ({ from: subDays(today, 29), to: today }) },
  { id: "thisWeek", label: "Deze week", getRange: () => ({ from: startOfWeek(today, { weekStartsOn: 1 }), to: today }) },
  { id: "prevWeek", label: "Vorige week", getRange: () => {
    const pw = subWeeks(today, 1);
    return { from: startOfWeek(pw, { weekStartsOn: 1 }), to: endOfWeek(pw, { weekStartsOn: 1 }) };
  }},
  { id: "thisMonth", label: "Deze maand", getRange: () => ({ from: startOfMonth(today), to: today }) },
  { id: "prevMonth", label: "Vorige maand", getRange: () => {
    const pm = subMonths(today, 1);
    return { from: startOfMonth(pm), to: endOfMonth(pm) };
  }},
  { id: "max", label: "Maximum", getRange: () => ({ from: subDays(today, 365), to: today }) },
];

function getDefaultCompareRange(range: DateRange): DateRange | null {
  if (!range.from || !range.to) return null;
  const days = differenceInDays(range.to, range.from) + 1;
  return { from: subDays(range.from, days), to: subDays(range.from, 1) };
}

const DateFilterPanel = ({
  dateRange,
  onDateRangeChange,
  compareEnabled,
  onCompareEnabledChange,
  compareRange,
  onCompareRangeChange,
}: DateFilterPanelProps) => {
  const [open, setOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(dateRange);
  const [tempCompare, setTempCompare] = useState(compareEnabled);
  const [tempCompareRange, setTempCompareRange] = useState<DateRange | null>(compareRange);
  const [customCompare, setCustomCompare] = useState(false);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setTempRange(dateRange);
      setTempCompare(compareEnabled);
      setTempCompareRange(compareRange);
      setCustomCompare(false);
    }
    setOpen(isOpen);
  };

  const applyPreset = (preset: typeof presets[number]) => {
    const range = preset.getRange();
    setTempRange(range);
    if (tempCompare && !customCompare) {
      setTempCompareRange(getDefaultCompareRange(range));
    }
  };

  const handleApply = () => {
    onDateRangeChange(tempRange);
    onCompareEnabledChange(tempCompare);
    onCompareRangeChange(tempCompare ? (tempCompareRange ?? getDefaultCompareRange(tempRange)) : null);
    setOpen(false);
  };

  const handleCancel = () => setOpen(false);

  const displayLabel = useMemo(() => {
    if (!dateRange.from) return "Selecteer periode";
    if (dateRange.to) return `${format(dateRange.from, "d MMM", { locale: nl })} – ${format(dateRange.to, "d MMM yyyy", { locale: nl })}`;
    return format(dateRange.from, "d MMM yyyy", { locale: nl });
  }, [dateRange]);

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-start text-left font-normal w-[280px]", !dateRange.from && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayLabel}
          {compareEnabled && <span className="ml-2 text-xs text-primary font-semibold">vs</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end" side="bottom">
        <div className="flex">
          {/* Presets */}
          <div className="border-r border-border p-3 w-[180px] space-y-1">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Periode</p>
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p)}
                className={cn(
                  "w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted/50 transition-colors",
                  tempRange.from && p.getRange().from?.getTime() === tempRange.from?.getTime() && p.getRange().to?.getTime() === tempRange.to?.getTime()
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Calendar + Compare */}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={tempRange}
              onSelect={(range) => {
                if (range) {
                  setTempRange(range);
                  if (tempCompare && !customCompare) {
                    setTempCompareRange(getDefaultCompareRange(range));
                  }
                }
              }}
              numberOfMonths={2}
              locale={nl}
              className="pointer-events-auto"
              modifiers={{ today: [today] }}
              modifiersClassNames={{ today: "ring-2 ring-primary rounded-md" }}
            />

            {/* Compare section */}
            <div className="border-t border-border mt-3 pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch checked={tempCompare} onCheckedChange={(v) => {
                    setTempCompare(v);
                    if (v) setTempCompareRange(getDefaultCompareRange(tempRange));
                    else setTempCompareRange(null);
                  }} />
                  <span className="text-sm font-medium">Vergelijken</span>
                </div>
                {tempCompare && (
                  <button
                    onClick={() => setCustomCompare(!customCompare)}
                    className="text-xs text-primary hover:underline"
                  >
                    {customCompare ? "Standaard periode" : "Aangepaste periode"}
                  </button>
                )}
              </div>

              {tempCompare && tempCompareRange && !customCompare && (
                <p className="text-xs text-muted-foreground">
                  Vergelijken met: {format(tempCompareRange.from!, "d MMM", { locale: nl })} – {format(tempCompareRange.to!, "d MMM yyyy", { locale: nl })}
                </p>
              )}

              {tempCompare && customCompare && (
                <Calendar
                  mode="range"
                  selected={tempCompareRange ?? undefined}
                  onSelect={(range) => range && setTempCompareRange(range)}
                  numberOfMonths={2}
                  locale={nl}
                  className="pointer-events-auto"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-border">
              <Button variant="ghost" size="sm" onClick={handleCancel}>Annuleren</Button>
              <Button size="sm" onClick={handleApply}>Toepassen</Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateFilterPanel;
