import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, ArrowLeftRight } from "lucide-react";
import { format, startOfWeek, startOfMonth, subDays, differenceInDays } from "date-fns";
import { nl } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type LcbDatePresetId = "week" | "month" | "period" | "custom";

export interface LcbDateState {
  presetId: LcbDatePresetId;
  range: DateRange;
  compareEnabled: boolean;
  compareRange: DateRange | null;
}

const today = new Date();

function startOfSalesPeriod(d: Date): Date {
  // Approx 4-week period (28 days), tied to ISO year — good enough for mock.
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const daysSince = Math.floor((d.getTime() - yearStart.getTime()) / 86400000);
  const periodIdx = Math.floor(daysSince / 28);
  return new Date(yearStart.getTime() + periodIdx * 28 * 86400000);
}

export function presetRange(id: Exclude<LcbDatePresetId, "custom">): DateRange {
  switch (id) {
    case "week": return { from: startOfWeek(today, { weekStartsOn: 1 }), to: today };
    case "month": return { from: startOfMonth(today), to: today };
    case "period": return { from: startOfSalesPeriod(today), to: today };
  }
}

export function defaultCompareRange(r: DateRange): DateRange | null {
  if (!r.from || !r.to) return null;
  const days = differenceInDays(r.to, r.from) + 1;
  return { from: subDays(r.from, days), to: subDays(r.from, 1) };
}

export const initialLcbDateState: LcbDateState = {
  presetId: "week",
  range: presetRange("week"),
  compareEnabled: true,
  compareRange: defaultCompareRange(presetRange("week")),
};

function fmtRange(r: DateRange | null | undefined): string {
  if (!r?.from) return "—";
  if (!r.to || r.from.getTime() === r.to.getTime()) return format(r.from, "d MMM", { locale: nl });
  return `${format(r.from, "d MMM", { locale: nl })} – ${format(r.to, "d MMM", { locale: nl })}`;
}

const PRESETS: { id: Exclude<LcbDatePresetId, "custom">; label: string }[] = [
  { id: "week", label: "Week" },
  { id: "month", label: "Maand" },
  { id: "period", label: "Periode" },
];

interface Props {
  value: LcbDateState;
  onChange: (next: LcbDateState) => void;
}

export function LcbDateFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const triggerLabel = useMemo(() => {
    const base =
      value.presetId === "week" ? "Week" :
      value.presetId === "month" ? "Maand" :
      value.presetId === "period" ? "Periode" : "Aangepast";
    return `${base} · ${fmtRange(value.range)}`;
  }, [value]);

  const compareLabel = value.compareEnabled && value.compareRange ? `vs ${fmtRange(value.compareRange)}` : null;

  const setPreset = (id: LcbDatePresetId) => {
    if (id === "custom") {
      onChange({ ...value, presetId: "custom" });
      return;
    }
    const range = presetRange(id);
    onChange({
      ...value,
      presetId: id,
      range,
      compareRange: value.compareEnabled ? defaultCompareRange(range) : value.compareRange,
    });
  };

  const setRange = (range: DateRange | undefined) => {
    const r = range ?? { from: undefined, to: undefined };
    onChange({
      ...value,
      presetId: "custom",
      range: r,
      compareRange: value.compareEnabled ? defaultCompareRange(r) : value.compareRange,
    });
  };

  const setCompareEnabled = (enabled: boolean) => {
    onChange({
      ...value,
      compareEnabled: enabled,
      compareRange: enabled ? (value.compareRange ?? defaultCompareRange(value.range)) : value.compareRange,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-[11px] whitespace-nowrap",
            "border border-border bg-card hover:bg-muted/60 text-foreground",
          )}
        >
          <CalendarIcon className="h-3 w-3 opacity-70" />
          <span className="font-medium">{triggerLabel}</span>
          {compareLabel && (
            <>
              <ArrowLeftRight className="h-3 w-3 opacity-50 mx-0.5" />
              <span className="text-muted-foreground">{compareLabel}</span>
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-0 overflow-hidden" align="start" collisionPadding={16}>
        <div className="flex">
          {/* Presets column */}
          <div className="w-32 border-r border-border p-2 space-y-0.5">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                className={cn(
                  "w-full text-left px-2 py-1.5 text-xs rounded",
                  value.presetId === p.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted",
                )}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPreset("custom")}
              className={cn(
                "w-full text-left px-2 py-1.5 text-xs rounded",
                value.presetId === "custom" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted",
              )}
            >
              Aangepast
            </button>

            <div className="mt-3 pt-3 border-t border-border space-y-2">
              <div className="flex items-center justify-between gap-2 px-1">
                <span className="text-[11px] text-foreground">Vergelijk</span>
                <Switch checked={value.compareEnabled} onCheckedChange={setCompareEnabled} />
              </div>
              <p className="text-[10px] text-muted-foreground px-1 leading-tight">
                Vergelijkt met de vorige even lange periode.
              </p>
            </div>
          </div>

          {/* Calendars */}
          <div className="flex-1 p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-1 pb-1">Periode</div>
            <Calendar
              mode="range"
              selected={value.range}
              onSelect={setRange}
              numberOfMonths={2}
              locale={nl}
              weekStartsOn={1}
              className="p-0"
            />
            <div className="mt-2 flex items-center justify-between gap-2 px-1 text-[11px]">
              <div>
                <span className="text-muted-foreground">Hoofd:</span>{" "}
                <span className="font-medium">{fmtRange(value.range)}</span>
              </div>
              {value.compareEnabled && (
                <div>
                  <span className="text-muted-foreground">Vergelijk:</span>{" "}
                  <span className="font-medium">{fmtRange(value.compareRange)}</span>
                </div>
              )}
              <Button size="sm" className="h-7 text-[11px]" onClick={() => setOpen(false)}>Sluiten</Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
