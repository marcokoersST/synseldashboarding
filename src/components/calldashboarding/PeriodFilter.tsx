import { useState } from "react";
import { Calendar as CalendarIcon, Check } from "lucide-react";
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

export function PeriodFilter({ value, onChange }: Props) {
  const presets = presetPeriods();
  const [customFrom, setCustomFrom] = useState(toInputDate(value.from));
  const [customTo, setCustomTo] = useState(toInputDate(value.to));

  const applyCustom = () => {
    const from = new Date(customFrom + "T00:00:00").getTime();
    const to = new Date(customTo + "T23:59:59").getTime();
    if (isNaN(from) || isNaN(to) || from > to) return;
    onChange({
      key: "custom",
      label: `${customFrom} → ${customTo}`,
      from,
      to,
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
          <CalendarIcon className="h-3.5 w-3.5" />
          {value.label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <div className="p-2 border-b border-border">
          <span className="text-xs font-medium text-foreground">Periode</span>
        </div>
        <div className="p-1">
          {presets.map((p) => {
            const active = p.key === value.key;
            return (
              <button
                key={p.key}
                onClick={() => onChange(p)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs hover:bg-secondary/60",
                  active && "bg-secondary/70 text-foreground",
                )}
              >
                <span className="flex-1">{p.label}</span>
                {active && <Check className="h-3 w-3 text-primary" />}
              </button>
            );
          })}
        </div>
        <div className="p-2 border-t border-border space-y-2">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Aangepast
          </div>
          <div className="flex gap-1.5">
            <Input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="h-7 text-xs"
            />
            <Input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <Button size="sm" className="h-7 w-full text-xs" onClick={applyCustom}>
            Toepassen
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
