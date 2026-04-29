import { useMemo } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DEFAULT_OVERLAY_FILTERS,
  OWNERS,
  getStatusOptions,
  type EntityKey,
  type FieldScope,
  type OverlayFilters,
} from "@/data/systeemHygieneData";

interface Props {
  entity: EntityKey;
  filters: OverlayFilters;
  onChange: (next: OverlayFilters) => void;
  activeTab?: string;
}

export function OverlayFilterBar({ entity, filters, onChange, activeTab }: Props) {
  const statusOptions = useMemo(() => getStatusOptions(entity), [entity]);
  const ownerOptions = OWNERS;

  const isDirty =
    filters.owners.length > 0 ||
    filters.statuses.length > 0 ||
    filters.freshness !== "all" ||
    filters.fieldScope !== "mandatory";

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-border bg-card/80 px-6 py-2 text-xs backdrop-blur">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Filters</span>

      <MultiSelectPopover
        label="Owner"
        options={ownerOptions.map(o => ({ value: o.fullName, label: o.fullName }))}
        selected={filters.owners}
        onChange={v => onChange({ ...filters, owners: v })}
      />

      <MultiSelectPopover
        label="Status"
        options={statusOptions.map(s => ({ value: s, label: s }))}
        selected={filters.statuses}
        onChange={v => onChange({ ...filters, statuses: v })}
      />

      <div className="flex items-center gap-1">
        <span className="text-muted-foreground">Freshness</span>
        <ToggleGroup
          type="single"
          size="sm"
          value={filters.freshness}
          onValueChange={(v) => v && onChange({ ...filters, freshness: v as OverlayFilters["freshness"] })}
          className="h-7"
        >
          <ToggleGroupItem value="all" className="h-7 px-2 text-xs">Alles</ToggleGroupItem>
          <ToggleGroupItem value="fresh" className="h-7 px-2 text-xs">Vers</ToggleGroupItem>
          <ToggleGroupItem value="outdated" className="h-7 px-2 text-xs">Outdated</ToggleGroupItem>
          <ToggleGroupItem value="stale" className="h-7 px-2 text-xs">Stale</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {activeTab === "fields" && (
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Scope</span>
          <ToggleGroup
            type="single"
            size="sm"
            value={filters.fieldScope}
            onValueChange={(v) => v && onChange({ ...filters, fieldScope: v as FieldScope })}
            className="h-7"
          >
            <ToggleGroupItem value="mandatory" className="h-7 px-2 text-xs">Mandatory</ToggleGroupItem>
            <ToggleGroupItem value="mandatoryIfAvailable" className="h-7 px-2 text-xs">Mand. if avail.</ToggleGroupItem>
            <ToggleGroupItem value="wouldBeNice" className="h-7 px-2 text-xs">Would-be-nice</ToggleGroupItem>
            <ToggleGroupItem value="optional" className="h-7 px-2 text-xs">Optional</ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      <div className="ml-auto">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          disabled={!isDirty}
          onClick={() => onChange(DEFAULT_OVERLAY_FILTERS)}
        >
          <RotateCcw className="mr-1 h-3 w-3" /> Reset
        </Button>
      </div>
    </div>
  );
}

function MultiSelectPopover({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const all = options.length > 0 && selected.length === options.length;
  const summary =
    selected.length === 0
      ? "Alles"
      : selected.length === options.length
        ? "Alles"
        : selected.length === 1
          ? options.find(o => o.value === selected[0])?.label ?? `${selected.length}`
          : `${selected.length} geselecteerd`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs">
          <span className="text-muted-foreground">{label}:</span>
          <span className="font-medium text-foreground">{summary}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-xs font-medium">{label}</span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={() => onChange(all ? [] : options.map(o => o.value))}
            >
              {all ? "Alles uit" : "Alles aan"}
            </Button>
          </div>
        </div>
        <ScrollArea className="max-h-64">
          <div className="p-2">
            {options.map(opt => {
              const checked = selected.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs hover:bg-muted/50"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => {
                      if (checked) onChange(selected.filter(v => v !== opt.value));
                      else onChange([...selected, opt.value]);
                    }}
                  />
                  <span className="truncate">{opt.label}</span>
                </label>
              );
            })}
            {options.length === 0 && (
              <div className="px-2 py-3 text-center text-xs text-muted-foreground">Geen opties</div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
