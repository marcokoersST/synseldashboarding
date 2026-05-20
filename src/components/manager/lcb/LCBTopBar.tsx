import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  datePreset: string;
  onDatePreset: (v: string) => void;
  comparison: string;
  onComparison: (v: string) => void;
  units: string[];
  selectedUnits: string[];
  onSelectedUnits: (v: string[]) => void;
  consultants: { id: number; name: string }[];
  selectedConsultants: number[];
  onSelectedConsultants: (v: number[]) => void;
  search: string;
  onSearch: (v: string) => void;
  onReset: () => void;
}

const DATE_PRESETS = [
  "Vandaag",
  "Gisteren",
  "Laatste 7 dagen",
  "Laatste 14 dagen",
  "Laatste 30 dagen",
  "Huidige week",
  "Vorige week",
  "Huidige periode",
  "Vorige periode",
  "Huidig jaar",
];
const COMPARE_OPTIONS = ["Vorige vergelijkbare periode", "Vorig jaar", "Geen"];

export function LCBTopBar({
  datePreset,
  onDatePreset,
  comparison,
  onComparison,
  units,
  selectedUnits,
  onSelectedUnits,
  consultants,
  selectedConsultants,
  onSelectedConsultants,
  search,
  onSearch,
  onReset,
}: Props) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card/40">
      <SelectFilter label="Periode" value={datePreset} options={DATE_PRESETS} onSelect={onDatePreset} width="w-[160px]" />
      <SelectFilter label="Vergelijk" value={comparison} options={COMPARE_OPTIONS} onSelect={onComparison} width="w-[200px]" />
      <MultiFilter
        label="Units"
        placeholder="Alle units"
        values={selectedUnits.map(String)}
        options={units.map((u) => ({ value: u, label: u }))}
        onChange={(v) => onSelectedUnits(v)}
        width="w-[150px]"
      />
      <MultiFilter
        label="Consultants"
        placeholder="Alle consultants"
        values={selectedConsultants.map(String)}
        options={consultants.map((c) => ({ value: String(c.id), label: c.name }))}
        onChange={(v) => onSelectedConsultants(v.map(Number))}
        width="w-[180px]"
      />
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Zoek consultant of kandidaat…"
          className="h-8 pl-7 w-[240px] text-xs"
        />
      </div>
      <div className="flex-1" />
      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" onClick={onReset}>
        <RotateCcw className="h-3 w-3" /> Reset filters
      </Button>
    </div>
  );
}

function SelectFilter({
  label,
  value,
  options,
  onSelect,
  width,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  width?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-8 justify-between text-xs", width)}>
          <span className="truncate text-muted-foreground mr-1">{label}:</span>
          <span className="truncate flex-1 text-left text-foreground">{value}</span>
          <ChevronDown className="h-3 w-3 shrink-0 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1" align="start">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={cn(
              "w-full text-left px-2 py-1.5 text-xs rounded hover:bg-muted",
              value === opt && "bg-primary/10 text-primary",
            )}
          >
            {opt}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function MultiFilter({
  label,
  placeholder,
  values,
  options,
  onChange,
  width,
}: {
  label: string;
  placeholder: string;
  values: string[];
  options: { value: string; label: string }[];
  onChange: (v: string[]) => void;
  width?: string;
}) {
  const display = values.length === 0 ? placeholder : `${values.length} geselecteerd`;
  const allOn = () => onChange(options.map((o) => o.value));
  const allOff = () => onChange([]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-8 justify-between text-xs", width)}>
          <span className="truncate text-muted-foreground mr-1">{label}:</span>
          <span className="truncate flex-1 text-left text-foreground">{display}</span>
          <ChevronDown className="h-3 w-3 shrink-0 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2 max-h-[400px] overflow-y-auto" align="start">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-border">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={allOn}>Alles aan</Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={allOff}>Alles uit</Button>
          </div>
        </div>
        <div className="space-y-1">
          {options.map((o) => {
            const checked = values.includes(o.value);
            return (
              <label key={o.value} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-muted cursor-pointer">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) => {
                    if (v) onChange([...values, o.value]);
                    else onChange(values.filter((x) => x !== o.value));
                  }}
                />
                <span className="text-xs truncate">{o.label}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
