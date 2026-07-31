import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import DateFilterPanel from "@/components/marketing/DateFilterPanel";
import type { DateRange } from "react-day-picker";
import {
  CONSULTANTS,
  FUNCTIEGROEPEN,
  KLANTEN,
  type PreMatchingFilters,
} from "@/data/preMatchingData";

interface MultiProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}

function MultiSelect({ label, options, value, onChange }: MultiProps) {
  const summary = value.length === 0 ? "Alle" : value.length === 1 ? value[0] : `${value.length} geselecteerd`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 font-normal text-xs">
          <span className="text-muted-foreground">{label}:</span>
          <span className="max-w-[140px] truncate">{summary}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => onChange(options)}>
              Alles aan
            </Button>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => onChange([])}>
              Alles uit
            </Button>
          </div>
        </div>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {options.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-xs hover:bg-muted">
              <Checkbox
                checked={value.includes(opt)}
                onCheckedChange={(c) =>
                  onChange(c ? [...value, opt] : value.filter((v) => v !== opt))
                }
              />
              <span className="truncate">{opt}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface Props {
  filters: PreMatchingFilters;
  onChange: (f: PreMatchingFilters) => void;
  dateRange?: DateRange;
  onDateRangeChange?: (r: DateRange) => void;
  showDate?: boolean;
  showFilters?: boolean;
}

const STATUS: { id: PreMatchingFilters["vacatureStatus"]; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "actief", label: "Actief" },
  { id: "gesloten", label: "Gesloten" },
];

export function PreMatchingFilterBar({
  filters,
  onChange,
  dateRange,
  onDateRangeChange,
  showDate = true,
  showFilters = true,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showDate && dateRange && onDateRangeChange && (
        <DateFilterPanel
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
          compareEnabled={false}
          onCompareEnabledChange={() => {}}
          compareRange={null}
          onCompareRangeChange={() => {}}
          deltaMode="percent"
          onDeltaModeChange={() => {}}
        />
      )}
      {showFilters && (
        <>
      <MultiSelect

        label="Consultant"
        options={CONSULTANTS}
        value={filters.consultants}
        onChange={(consultants) => onChange({ ...filters, consultants })}
      />
      <MultiSelect
        label="Functiegroep"
        options={FUNCTIEGROEPEN}
        value={filters.functiegroepen}
        onChange={(functiegroepen) => onChange({ ...filters, functiegroepen })}
      />
      <MultiSelect
        label="Klant"
        options={KLANTEN}
        value={filters.klanten}
        onChange={(klanten) => onChange({ ...filters, klanten })}
      />
      <div className="inline-flex rounded-md border bg-muted/40 p-0.5">
        {STATUS.map((s) => (
          <button
            key={s.id}
            onClick={() => onChange({ ...filters, vacatureStatus: s.id })}
            className={cn(
              "rounded px-3 py-1 text-xs font-medium transition-colors",
              filters.vacatureStatus === s.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PreMatchingFilterBar;
