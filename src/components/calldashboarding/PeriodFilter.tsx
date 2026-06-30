import { useState } from "react";
import { Calendar as CalendarIcon, Check, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { presetPeriods, Period } from "@/data/callDashboardingData";

interface Props {
  value: Period;
  onChange: (p: Period) => void;
}

function toInputDate(ms: number) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-2 w-2", className)}>
      <span className="absolute inset-0 rounded-full bg-success/60 animate-ping" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
    </span>
  );
}

export function PeriodFilter({ value, onChange }: Props) {
  const presets = presetPeriods();
  const [customFrom, setCustomFrom] = useState(toInputDate(value.from));
  const [customTo, setCustomTo] = useState(toInputDate(value.to));

  const fromMs = new Date(customFrom + "T00:00:00").getTime();
  const toMs = new Date(customTo + "T23:59:59").getTime();
  const customInvalid = isNaN(fromMs) || isNaN(toMs) || fromMs > toMs;

  const applyCustom = () => {
    if (customInvalid) return;
    onChange({
      key: "custom",
      label: `${customFrom} → ${customTo}`,
      from: fromMs,
      to: toMs,
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
          <CalendarIcon className="h-3.5 w-3.5" />
          <span>{value.label}</span>
          {value.live && <LiveDot />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0 overflow-hidden" align="end">
        <div className="px-3 py-2 border-b border-border bg-muted/30 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Periode</span>
          <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <LiveDot /> live data
          </span>
        </div>

        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-1.5">
            {presets.map((p) => {
              const active = p.key === value.key;
              return (
                <button
                  key={p.key}
                  onClick={() => onChange(p)}
                  className={cn(
                    "group relative flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition-colors",
                    active
                      ? "border-primary/60 bg-primary/10 text-foreground"
                      : "border-border bg-card hover:bg-secondary/60 text-foreground",
                  )}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="truncate">{p.label}</span>
                    {p.live && <LiveDot />}
                  </span>
                  {active && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="rounded-md border border-border bg-muted/20 p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Aangepaste periode
              </span>
              <CalendarIcon className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-[36px_1fr] items-center gap-x-2 gap-y-1.5">
              <label className="text-[11px] text-muted-foreground">Van</label>
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-7 text-xs"
              />
              <label className="text-[11px] text-muted-foreground">Tot</label>
              <Input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-7 text-xs"
              />
            </div>
            {customInvalid && (
              <div className="text-[10px] text-destructive">Einddatum moet na de startdatum liggen.</div>
            )}
            <Button
              size="sm"
              className="h-7 w-full text-xs"
              onClick={applyCustom}
              disabled={customInvalid}
            >
              Toepassen
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
