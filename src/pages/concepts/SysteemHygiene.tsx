import { useMemo, useState } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import { AnimatedRing } from "@/components/animations/AnimatedRing";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  ENTITY_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
  getAllSummaries,
  getGlobalActionPointers,
  getGlobalHygieneScore,
  getInsights,
  OWNERS,
  type EntityKey,
} from "@/data/systeemHygieneData";
import { HygieneTile } from "@/components/systeem-hygiene/HygieneTile";
import { HygieneOverlay } from "@/components/systeem-hygiene/HygieneOverlay";
import { InsightCard } from "@/components/systeem-hygiene/InsightCard";
import { ActionPointerList } from "@/components/systeem-hygiene/ActionPointerList";

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
  "Custom",
];

const HYGIENE_DIMENSIONS = ["All", "Required field completeness", "Administrative process", "Freshness / recently updated"];

const MAJOR: EntityKey[] = ["candidates", "companies", "deals"];
const MINOR: EntityKey[] = ["contacts", "jobs", "ai_synsel", "notities"];

export default function SysteemHygiene() {
  const [openEntity, setOpenEntity] = useState<EntityKey | null>(null);
  const [datePreset, setDatePreset] = useState("Huidige periode");
  const [comparison, setComparison] = useState("Vorige vergelijkbare periode");
  const [dimension, setDimension] = useState("All");
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<EntityKey[]>([]);

  const summaries = useMemo(() => getAllSummaries(), []);
  const global = useMemo(() => getGlobalHygieneScore(), []);
  const insights = useMemo(() => getInsights("global"), []);
  const globalActions = useMemo(() => getGlobalActionPointers(6), []);

  const visibleEntities = (e: EntityKey) => selectedEntities.length === 0 || selectedEntities.includes(e);

  const summaryByEntity = (e: EntityKey) => summaries.find(s => s.entity === e)!;
  const globalColor = STATUS_COLOR[global.status];

  const refreshLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleString("nl-NL", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Title + global score */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative shrink-0">
                <AnimatedRing value={global.score} size={64} strokeWidth={6} strokeColor={globalColor} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-bold tabular-nums" style={{ color: globalColor }}>
                    <AnimatedNumber value={global.score} />
                  </span>
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-foreground">Systeem Hygiene</h1>
                <p className="text-xs text-muted-foreground">
                  Global hygiene score:{" "}
                  <span className="font-medium" style={{ color: globalColor }}>{STATUS_LABEL[global.status]}</span>
                  {" · "}Required {global.componentBreakdown.requiredFields}% · Process {global.componentBreakdown.adminProcess}% · Freshness {global.componentBreakdown.freshness}%
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <SelectFilter label="Datum" value={datePreset} options={DATE_PRESETS} onSelect={setDatePreset} triggerClassName="min-w-[190px]" />
              <SelectFilter label="Compare" value={comparison} options={["Vorige vergelijkbare periode", "Vorig jaar", "Geen"]} onSelect={setComparison} triggerClassName="min-w-[260px]" />
              <MultiSelectFilter
                label="Entiteiten"
                placeholder="Alles"
                values={selectedEntities}
                options={[...MAJOR, ...MINOR].map(e => ({ value: e, label: ENTITY_LABEL[e] }))}
                onChange={vals => setSelectedEntities(vals as EntityKey[])}
                triggerClassName="min-w-[150px]"
              />
              <MultiSelectFilter
                label="Owners"
                placeholder="Alle owners"
                values={selectedOwners}
                options={OWNERS.map(o => ({ value: o.fullName, label: o.fullName }))}
                onChange={setSelectedOwners}
                triggerClassName="min-w-[160px]"
              />
              <SelectFilter label="Hygiene dim." value={dimension} options={HYGIENE_DIMENSIONS} onSelect={setDimension} triggerClassName="min-w-[280px]" />
              <div className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-[10px] text-muted-foreground">
                <RefreshCw className="h-3 w-3" />
                <span>Updated {refreshLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main grid */}
      <main className="px-6 py-6 space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_320px]">
          {MAJOR.map(e =>
            visibleEntities(e) ? (
              <HygieneTile key={e} entity={e} summary={summaryByEntity(e)} variant="major" onOpen={setOpenEntity} />
            ) : null,
          )}
          <div className="grid grid-rows-4 gap-3">
            {MINOR.map(e =>
              visibleEntities(e) ? (
                <HygieneTile key={e} entity={e} summary={summaryByEntity(e)} variant="minor" onOpen={setOpenEntity} />
              ) : null,
            )}
          </div>
        </div>

        {/* Insight + Action row */}
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Global insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
            </div>
          </section>
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Top actie-prioriteiten</h2>
            <ActionPointerList items={globalActions} showEntity />
          </section>
        </div>
      </main>

      <HygieneOverlay entity={openEntity} open={openEntity !== null} onOpenChange={open => !open && setOpenEntity(null)} />
    </div>
  );
}

// ---- Filter primitives -----------------------------------------------------

function SelectFilter({ label, value, options, onSelect, triggerClassName }: { label: string; value: string; options: string[]; onSelect: (v: string) => void; triggerClassName?: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-8 gap-1.5 text-xs justify-between", triggerClassName)}>
          <span className="flex items-center gap-1.5 min-w-0">
            <span className="text-muted-foreground shrink-0">{label}:</span>
            <span className="font-medium truncate">{value}</span>
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1">
        {options.map(o => (
          <button
            key={o}
            type="button"
            onClick={() => onSelect(o)}
            className={cn(
              "w-full text-left rounded-md px-2 py-1.5 text-xs hover:bg-accent",
              value === o && "bg-accent text-accent-foreground",
            )}
          >
            {o}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function MultiSelectFilter({
  label,
  placeholder,
  values,
  options,
  onChange,
  triggerClassName,
}: {
  label: string;
  placeholder: string;
  values: string[];
  options: { value: string; label: string }[];
  onChange: (vals: string[]) => void;
  triggerClassName?: string;
}) {
  const allValues = options.map(o => o.value);
  const display = values.length === 0 ? placeholder : `${values.length} geselecteerd`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-8 gap-1.5 text-xs justify-between", triggerClassName)}>
          <span className="flex items-center gap-1.5 min-w-0">
            <span className="text-muted-foreground shrink-0">{label}:</span>
            <span className="font-medium truncate">{display}</span>
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => onChange(allValues)}>Alles aan</Button>
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => onChange([])}>Alles uit</Button>
          </div>
        </div>
        <div className="max-h-[260px] overflow-y-auto space-y-0.5">
          {options.map(o => {
            const checked = values.includes(o.value);
            return (
              <label key={o.value} className="flex items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-accent cursor-pointer">
                <Checkbox
                  checked={checked}
                  onCheckedChange={c => {
                    if (c) onChange([...values, o.value]);
                    else onChange(values.filter(v => v !== o.value));
                  }}
                />
                <span className="truncate">{o.label}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
