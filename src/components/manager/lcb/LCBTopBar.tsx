import { useState, forwardRef } from "react";
import { RotateCcw, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { LcbDateFilter, type LcbDateState } from "./LcbDateFilter";

interface Props {
  date: LcbDateState;
  onDate: (v: LcbDateState) => void;
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

export function LCBTopBar({
  date, onDate,
  units, selectedUnits, onSelectedUnits,
  consultants, selectedConsultants, onSelectedConsultants,
  search, onSearch, onReset,
}: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border bg-card">
      <LcbDateFilter value={date} onChange={onDate} />
      <MultiFilter
        label="Units" placeholder="Alle units"
        values={selectedUnits}
        options={units.map((u) => ({ value: u, label: u }))}
        onChange={onSelectedUnits}
      />
      <MultiFilter
        label="Consultants" placeholder="Alle consultants"
        values={selectedConsultants.map(String)}
        options={consultants.map((c) => ({ value: String(c.id), label: c.name }))}
        onChange={(v) => onSelectedConsultants(v.map(Number))}
      />
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Zoeken…"
          className={cn(
            "h-7 pl-6 text-xs transition-all duration-200 border-border/60 bg-transparent",
            focused || search ? "w-[240px]" : "w-[140px]",
          )}
        />
      </div>
      <div className="flex-1" />
      <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5 text-muted-foreground hover:text-foreground" onClick={onReset}>
        <RotateCcw className="h-3 w-3" /> Reset
      </Button>
    </div>
  );
}

const ChipButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; value: string; active?: boolean }>(
  ({ label, value, active, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      {...props}
      className={cn(
        "inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] transition-colors whitespace-nowrap",
        "hover:bg-muted/60",
        active ? "border border-border bg-card text-foreground" : "text-muted-foreground",
      )}
    >
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground font-medium">{value}</span>
      <ChevronDown className="h-3 w-3 opacity-60" />
    </button>
  ),
);
ChipButton.displayName = "ChipButton";

function MultiFilter({ label, placeholder, values, options, onChange }: { label: string; placeholder: string; values: string[]; options: { value: string; label: string }[]; onChange: (v: string[]) => void }) {
  const display = values.length === 0 ? placeholder : `${values.length}`;
  const allOn = () => onChange(options.map((o) => o.value));
  const allOff = () => onChange([]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <ChipButton label={label} value={display} active={values.length > 0} />
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
