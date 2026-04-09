import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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

type PresetId = "today" | "todayYesterday" | "last7" | "last14" | "last28" | "last30" | "thisWeek" | "prevWeek" | "thisMonth" | "prevMonth" | "max" | "custom";

const presets: { id: PresetId; label: string; getRange: () => DateRange | null }[] = [
  { id: "today", label: "Vandaag", getRange: () => ({ from: today, to: today }) },
  { id: "todayYesterday", label: "Vandaag en gisteren", getRange: () => ({ from: subDays(today, 1), to: today }) },
  { id: "last7", label: "Afgelopen 7 dagen", getRange: () => ({ from: subDays(today, 6), to: today }) },
  { id: "last14", label: "Afgelopen 14 dagen", getRange: () => ({ from: subDays(today, 13), to: today }) },
  { id: "last28", label: "Afgelopen 28 dagen", getRange: () => ({ from: subDays(today, 27), to: today }) },
  { id: "last30", label: "Afgelopen 30 dagen", getRange: () => ({ from: subDays(today, 29), to: today }) },
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
  { id: "custom", label: "Aangepast", getRange: () => null },
];

function getDefaultCompareRange(range: DateRange): DateRange | null {
  if (!range.from || !range.to) return null;
  const days = differenceInDays(range.to, range.from) + 1;
  return { from: subDays(range.from, days), to: subDays(range.from, 1) };
}

function detectPreset(range: DateRange): PresetId {
  if (!range.from || !range.to) return "custom";
  for (const p of presets) {
    if (p.id === "custom") continue;
    const pr = p.getRange();
    if (pr && pr.from && pr.to && pr.from.getTime() === range.from.getTime() && pr.to.getTime() === range.to.getTime()) {
      return p.id;
    }
  }
  return "custom";
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
  const [compareMode, setCompareMode] = useState<"previous" | "custom">("previous");
  const [overlapData, setOverlapData] = useState(false);

  const activePreset = detectPreset(tempRange);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setTempRange(dateRange);
      setTempCompare(compareEnabled);
      setTempCompareRange(compareRange);
      setCompareMode(compareRange ? "previous" : "previous");
    }
    setOpen(isOpen);
  };

  const applyPreset = (presetId: PresetId) => {
    if (presetId === "custom") return;
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;
    const range = preset.getRange();
    if (range) {
      setTempRange(range);
      if (tempCompare && compareMode === "previous") {
        setTempCompareRange(getDefaultCompareRange(range));
      }
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

  const formatRange = (r: DateRange | null) => {
    if (!r?.from || !r?.to) return "";
    return `${format(r.from, "d MMMM yyyy", { locale: nl })} - ${format(r.to, "d MMMM yyyy", { locale: nl })}`;
  };

  const defaultCompare = getDefaultCompareRange(tempRange);

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
          {/* Presets column */}
          <div className="border-r border-border p-4 w-[200px]">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Periode</p>
            <RadioGroup
              value={activePreset}
              onValueChange={(val) => applyPreset(val as PresetId)}
              className="space-y-1"
            >
              {presets.map((p) => (
                <div key={p.id} className="flex items-center gap-2.5 py-1">
                  <RadioGroupItem value={p.id} id={`preset-${p.id}`} className="h-3.5 w-3.5" />
                  <Label
                    htmlFor={`preset-${p.id}`}
                    className={cn(
                      "text-sm cursor-pointer",
                      activePreset === p.id ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    {p.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Calendar + Compare + Footer */}
          <div className="p-4 flex flex-col">
            <Calendar
              mode="range"
              selected={tempRange}
              onSelect={(range) => {
                if (range) {
                  setTempRange(range);
                  if (tempCompare && compareMode === "previous") {
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
              <div className="flex items-center gap-2">
                <Checkbox
                  id="compare-toggle"
                  checked={tempCompare}
                  onCheckedChange={(v) => {
                    const enabled = v === true;
                    setTempCompare(enabled);
                    if (enabled) {
                      setCompareMode("previous");
                      setTempCompareRange(getDefaultCompareRange(tempRange));
                    } else {
                      setTempCompareRange(null);
                    }
                  }}
                />
                <Label htmlFor="compare-toggle" className="text-sm font-medium cursor-pointer">
                  Vergelijken
                </Label>
              </div>

              {tempCompare && (
                <div className="space-y-2 pl-6">
                  {/* Previous period option */}
                  <div
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                      compareMode === "previous" ? "bg-accent" : "hover:bg-accent/50"
                    )}
                    onClick={() => {
                      setCompareMode("previous");
                      setTempCompareRange(getDefaultCompareRange(tempRange));
                    }}
                  >
                    <div className={cn(
                      "h-3 w-3 rounded-full border-2 border-primary flex items-center justify-center",
                    )}>
                      {compareMode === "previous" && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">Vorige periode</span>
                      {defaultCompare && (
                        <p className="text-xs text-muted-foreground truncate">
                          {formatRange(defaultCompare)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Custom period option */}
                  <div
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                      compareMode === "custom" ? "bg-accent" : "hover:bg-accent/50"
                    )}
                    onClick={() => setCompareMode("custom")}
                  >
                    <div className={cn(
                      "h-3 w-3 rounded-full border-2 border-primary flex items-center justify-center",
                    )}>
                      {compareMode === "custom" && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">Aangepast</span>
                      {compareMode === "custom" && tempCompareRange && (
                        <p className="text-xs text-muted-foreground truncate">
                          {formatRange(tempCompareRange)}
                        </p>
                      )}
                    </div>
                  </div>

                  {compareMode === "custom" && (
                    <Calendar
                      mode="range"
                      selected={tempCompareRange ?? undefined}
                      onSelect={(range) => range && setTempCompareRange(range)}
                      numberOfMonths={2}
                      locale={nl}
                      className="pointer-events-auto mt-2"
                    />
                  )}

                  {/* Overlap data toggle */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setOverlapData(!overlapData)}
                      className={cn(
                        "h-3.5 w-3.5 rounded-full border-2 transition-colors",
                        overlapData ? "border-primary bg-primary" : "border-muted-foreground"
                      )}
                    />
                    <span className="text-sm text-muted-foreground">Overlap data</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border mt-3 pt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Datums worden weergegeven in Amsterdam</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancel}>Annuleren</Button>
                <Button size="sm" onClick={handleApply}>Bijwerken</Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateFilterPanel;
