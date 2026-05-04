import { useFunnelQualityFilters } from "@/contexts/FunnelQualityFiltersContext";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, RotateCcw } from "lucide-react";
import { VACATURE_CLUSTERS, REGIOS, KANALEN, TYPES } from "@/data/funnelQualityData";

interface MultiPopoverProps<T extends string> {
  label: string;
  options: readonly T[];
  selected: T[];
  onChange: (next: T[]) => void;
}

function MultiPopover<T extends string>({ label, options, selected, onChange }: MultiPopoverProps<T>) {
  const allSelected = selected.length === options.length;
  const toggle = (v: T) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  const summary = allSelected
    ? `Alle ${label.toLowerCase()}`
    : selected.length === 0
    ? `Geen ${label.toLowerCase()}`
    : `${selected.length} geselecteerd`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
          {label}
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">{summary}</Badge>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="flex items-center justify-between px-1 pb-2 mb-1 border-b">
          <span className="text-xs font-medium">{label}</span>
          <button
            className="text-xs text-primary hover:underline"
            onClick={() => onChange(allSelected ? [] : [...options])}
          >
            {allSelected ? "Alles uit" : "Alles aan"}
          </button>
        </div>
        <div className="max-h-60 overflow-y-auto space-y-0.5">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer text-xs">
              <Checkbox checked={selected.includes(opt)} onCheckedChange={() => toggle(opt)} />
              <span className="flex-1">{opt}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function FilterBar() {
  const f = useFunnelQualityFilters();
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-card border border-border">
      <span className="text-xs font-medium text-muted-foreground mr-1">Filters:</span>
      <MultiPopover label="Cluster" options={VACATURE_CLUSTERS} selected={f.clusters} onChange={(v) => f.set("clusters", v)} />
      <MultiPopover label="Regio" options={REGIOS} selected={f.regios} onChange={(v) => f.set("regios", v)} />
      <MultiPopover label="Kanaal" options={KANALEN} selected={f.kanalen} onChange={(v) => f.set("kanalen", v)} />
      <MultiPopover label="Type" options={TYPES} selected={f.types} onChange={(v) => f.set("types", v)} />
      <div className="flex items-center gap-2 px-3 h-8 rounded-md border border-input text-xs">
        <span className="text-muted-foreground">Score</span>
        <span className="tabular-nums font-medium w-7 text-right">{f.scoreMin}</span>
        <Slider
          value={[f.scoreMin, f.scoreMax]}
          min={0} max={100} step={5}
          minStepsBetweenThumbs={1}
          onValueChange={([lo, hi]) => { f.set("scoreMin", lo); f.set("scoreMax", hi); }}
          className="w-32"
        />
        <span className="tabular-nums font-medium w-8">{f.scoreMax}</span>
      </div>
      <div className="flex items-center gap-2 px-3 h-8 rounded-md border border-input text-xs">
        <span className="text-muted-foreground">Periode</span>
        <input
          type="month"
          value={f.periodStart}
          onChange={(e) => f.set("periodStart", e.target.value)}
          className="bg-transparent outline-none text-xs"
        />
        <span className="text-muted-foreground">→</span>
        <input
          type="month"
          value={f.periodEnd}
          onChange={(e) => f.set("periodEnd", e.target.value)}
          className="bg-transparent outline-none text-xs"
        />
      </div>
      <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs ml-auto" onClick={f.reset}>
        <RotateCcw className="w-3 h-3" />
        Reset
      </Button>
    </div>
  );
}
