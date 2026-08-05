import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { nl } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown, CalendarIcon, ChevronDown, RotateCcw, Info, AlertTriangle, ExternalLink,
} from "lucide-react";
import {
  REVERSE_FUNNEL_STEPS, KPI_STEP_INDEX, candidatesAtStep, vacaturesAtStep,
  matchesPerVacature, stepDistribution, emptyDeepDiveFilters, vacatureTitelOptions,
  CONSULTANTS, BEDRIJVEN, TODAY, rcrmCandidateUrl, synselCandidateUrl,
  type DeepDiveFilters, type ReverseStepIndex, type ReverseCandidate,
} from "@/data/reverseMatchingCandidates";

interface Props {
  kpiKey: string | null;
  kpiLabel: string;
  onClose: () => void;
}

const STEP_TONE: Record<number, string> = {
  1: "bg-muted text-muted-foreground",
  2: "bg-primary/10 text-primary",
  3: "bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold-dark))]",
  4: "bg-[hsl(var(--chart-primary)/0.12)] text-[hsl(var(--chart-primary))]",
  5: "bg-accent/15 text-accent",
};

function MultiSelect({
  label, options, selected, onChange,
}: { label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs justify-between min-w-[130px]">
          <span className="truncate">
            {label}{selected.length ? `: ${selected.length}` : ""}
          </span>
          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-border">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs" onClick={() => onChange(options)}>Alles aan</Button>
            <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs" onClick={() => onChange([])}>Uit</Button>
          </div>
        </div>
        <Command>
          <CommandInput placeholder={`Zoek ${label.toLowerCase()}...`} className="h-8 text-xs" />
          <CommandList className="max-h-64">
            <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">Geen resultaten</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem key={o} onSelect={() => toggle(o)} className="text-xs gap-2">
                  <Checkbox checked={selected.includes(o)} className="pointer-events-none" />
                  <span className="truncate">{o}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DateRangeButton({
  from, to, onChange,
}: { from?: Date; to?: Date; onChange: (from?: Date, to?: Date) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <CalendarIcon className="w-3.5 h-3.5" />
          {from && to
            ? `${format(from, "d MMM", { locale: nl })} – ${format(to, "d MMM yyyy", { locale: nl })}`
            : "Selecteer periode"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          defaultMonth={from}
          selected={{ from, to }}
          onSelect={(r) => onChange(r?.from, r?.to)}
          className={cn("p-3 pointer-events-auto")}
        />
        <div className="flex flex-wrap gap-1.5 border-t border-border p-2">
          {[7, 30, 90].map((d) => (
            <Button key={d} variant="ghost" size="sm" className="h-7 px-2 text-xs"
              onClick={() => onChange(subDays(TODAY, d - 1), TODAY)}>
              Laatste {d}d
            </Button>
          ))}
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onChange(undefined, undefined)}>
            Alles
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function StepBadge({ step }: { step: ReverseStepIndex }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap", STEP_TONE[step])}>
      {REVERSE_FUNNEL_STEPS[step]}
    </span>
  );
}

function StepDots({ step }: { step: ReverseStepIndex }) {
  return (
    <span className="inline-flex items-center gap-0.5 align-middle">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cn("w-1.5 h-1.5 rounded-full", i <= step ? "bg-foreground/70" : "bg-border")} />
      ))}
    </span>
  );
}

function ProfileLinks({ candidateId }: { candidateId: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <a href={rcrmCandidateUrl(candidateId)} target="_blank" rel="noopener noreferrer"
        title="Open in Recruit CRM" onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#0066FF]/10 hover:bg-[#0066FF]/25 transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#0066FF" />
          <text x="12" y="17" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif">R</text>
        </svg>
      </a>
      <a href={synselCandidateUrl(candidateId)} target="_blank" rel="noopener noreferrer"
        title="Open in Synsel AI" onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center justify-center w-6 h-6 rounded bg-accent/15 hover:bg-accent/30 transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="hsl(var(--accent))" />
          <text x="12" y="17" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif">S</text>
        </svg>
      </a>
    </span>
  );
}

type SortKey = "name" | "vacature" | "consultant" | "date" | "reached" | "status" | "matches";

export function FunnelStepDialog({ kpiKey, kpiLabel, onClose }: Props) {
  const stepIndex = kpiKey ? KPI_STEP_INDEX[kpiKey] : undefined;
  const [filters, setFilters] = useState<DeepDiveFilters>({
    ...emptyDeepDiveFilters,
    from: subDays(TODAY, 29),
    to: TODAY,
  });
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [asc, setAsc] = useState(false);

  const isVacatureStep = stepIndex === 0;

  const candidates = useMemo(
    () => (stepIndex === undefined || isVacatureStep ? [] : candidatesAtStep(stepIndex, filters)),
    [stepIndex, isVacatureStep, filters]
  );
  const vacs = useMemo(() => (isVacatureStep ? vacaturesAtStep(filters) : []), [isVacatureStep, filters]);
  const dist = useMemo(() => stepDistribution(candidates), [candidates]);

  const sortedCandidates = useMemo(() => {
    const arr = [...candidates];
    const val = (c: ReverseCandidate) => {
      switch (sortKey) {
        case "name": return c.name.toLowerCase();
        case "vacature": return `${c.vacature} ${c.bedrijf}`.toLowerCase();
        case "consultant": return c.consultant.toLowerCase();
        case "reached": return c.reachedStep;
        case "status": return c.status;
        default: return (stepIndex && c.stepDates[stepIndex]?.getTime()) || 0;
      }
    };
    arr.sort((a, b) => {
      const va = val(a), vb = val(b);
      if (va === vb) return 0;
      return (va > vb ? 1 : -1) * (asc ? 1 : -1);
    });
    return arr;
  }, [candidates, sortKey, asc, stepIndex]);

  const sortedVacs = useMemo(() => {
    const arr = [...vacs];
    arr.sort((a, b) => {
      const val = (v: typeof a) => {
        switch (sortKey) {
          case "vacature": return `${v.titel} ${v.bedrijf}`.toLowerCase();
          case "consultant": return v.consultant.toLowerCase();
          case "matches": return matchesPerVacature(v.id).count;
          case "reached": return matchesPerVacature(v.id).furthest;
          default: return v.geopend.getTime();
        }
      };
      const va = val(a), vb = val(b);
      if (va === vb) return 0;
      return (va > vb ? 1 : -1) * (asc ? 1 : -1);
    });
    return arr;
  }, [vacs, sortKey, asc]);

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setAsc(!asc);
    else { setSortKey(k); setAsc(k === "name" || k === "vacature" || k === "consultant"); }
  };

  const Th = ({ k, children, className }: { k: SortKey; children: React.ReactNode; className?: string }) => (
    <th className={cn("px-3 py-2 font-semibold text-[10px] uppercase tracking-wider text-left", className)}>
      <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
        {children}
        <ArrowUpDown className={cn("w-3 h-3", sortKey === k ? "text-foreground" : "opacity-40")} />
      </button>
    </th>
  );

  const total = isVacatureStep ? sortedVacs.length : sortedCandidates.length;

  return (
    <Dialog open={kpiKey !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 flex flex-col gap-0">
        <DialogHeader className="p-5 pb-3 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-base font-semibold">{kpiLabel} — deep dive</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {total.toLocaleString("nl-NL")} {isVacatureStep ? "vacatures" : "kandidaten"} binnen de gekozen periode en filters
                {!isVacatureStep && stepIndex !== undefined && ` · verst bereikte funnelstap per kandidaat`}
              </DialogDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" className="h-7 px-2.5 text-xs gap-1.5 bg-red-600 hover:bg-red-700 text-white shrink-0 mr-8">
                  <Info className="w-3.5 h-3.5" />
                  Dev info
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 text-xs space-y-3" align="end">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Info className="w-3.5 h-3.5" /> For the development team
                </div>
                <div className="flex items-start gap-1.5 text-red-600 font-medium border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 rounded p-2">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>Delete this button after development.</span>
                </div>
                <pre className="bg-muted/60 p-3 rounded text-[11px] leading-snug font-mono whitespace-pre-wrap text-foreground/90">{`Deep dive per funnel KPI

Clicking a funnel KPI tile opens this modal with all records
that reached that step.

Vacatures opgepakt: amount of vacancies for which a workflow was started within Synsel AI
Kandidaten gematched: amount of candidates that were accepted within Synsel AI
Kandidaten doorgezet: amount of candidates that were set on the status Vacature aanvraag within RCRM
Voorgesteld bij bedrijf: amount of candidates that were proposed to the specific vacancy they were matched on.
Op gesprek: amount of candidates that went on a interview to the specific vacancy they were matched on.
Geplaatst: amount of candidates that were placed on the specific vacancy they were matched on.

Date filter applies to the timestamp on which the record
reached the selected step (for vacancies: workflow start date).
Filters (consultant / bedrijf / vacature) are local to this
modal and independent of the page filter bar.

"Verst bereikte stap" = highest funnel step the candidate
reached on the vacancy they were matched on.`}</pre>
              </PopoverContent>
            </Popover>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-3">
            <DateRangeButton from={filters.from} to={filters.to} onChange={(from, to) => setFilters((f) => ({ ...f, from, to }))} />
            <MultiSelect label="Consultant" options={[...CONSULTANTS]} selected={filters.consultants}
              onChange={(v) => setFilters((f) => ({ ...f, consultants: v }))} />
            <MultiSelect label="Bedrijf" options={[...BEDRIJVEN]} selected={filters.bedrijven}
              onChange={(v) => setFilters((f) => ({ ...f, bedrijven: v }))} />
            <MultiSelect label="Vacature" options={vacatureTitelOptions} selected={filters.vacatures}
              onChange={(v) => setFilters((f) => ({ ...f, vacatures: v }))} />
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs"
              onClick={() => setFilters({ ...emptyDeepDiveFilters, from: subDays(TODAY, 29), to: TODAY })}>
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>
          </div>
        </DialogHeader>

        {/* Verdeling verst bereikte stap */}
        {!isVacatureStep && candidates.length > 0 && (
          <div className="px-5 py-3 border-b border-border bg-muted/20">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Verdeling verst bereikte stap
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {dist.map((d) => (
                <div key={d.index} className={cn("rounded-md border border-border/60 px-2.5 py-2", d.count === 0 && "opacity-50")}>
                  <div className="text-[10px] text-muted-foreground truncate" title={d.step}>{d.step}</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold tabular-nums text-foreground">{d.count.toLocaleString("nl-NL")}</span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">{d.share.toFixed(1)}%</span>
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-border overflow-hidden">
                    <div className="h-full bg-primary/70" style={{ width: `${Math.min(100, d.share)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabel */}
        <div className="flex-1 overflow-auto">
          {isVacatureStep ? (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card border-b border-border z-10 text-muted-foreground">
                <tr>
                  <Th k="vacature">Vacature · bedrijf</Th>
                  <Th k="consultant">Consultant</Th>
                  <Th k="date">Workflow gestart</Th>
                  <Th k="matches" className="text-right">Kandidaten gematched</Th>
                  <Th k="reached">Verst bereikte stap</Th>
                </tr>
              </thead>
              <tbody>
                {sortedVacs.map((v) => {
                  const m = matchesPerVacature(v.id);
                  return (
                    <tr key={v.id} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-2">
                        <div className="font-medium text-foreground">{v.titel}</div>
                        <div className="text-[11px] text-muted-foreground">{v.bedrijf} · {v.id}</div>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{v.consultant}</td>
                      <td className="px-3 py-2 text-muted-foreground whitespace-nowrap tabular-nums">
                        {format(v.geopend, "d MMM yyyy", { locale: nl })}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-semibold text-foreground">{m.count}</td>
                      <td className="px-3 py-2">
                        {m.count ? (
                          <span className="inline-flex items-center gap-2">
                            <StepBadge step={m.furthest} />
                            <StepDots step={m.furthest} />
                          </span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card border-b border-border z-10 text-muted-foreground">
                <tr>
                  <Th k="name">Kandidaat</Th>
                  <Th k="vacature">Vacature · bedrijf</Th>
                  <Th k="consultant">Consultant</Th>
                  <Th k="date">Datum stap</Th>
                  <Th k="reached">Verst bereikte stap</Th>
                  <Th k="status">Status</Th>
                  <th className="px-3 py-2 font-semibold text-[10px] uppercase tracking-wider text-center">Profiel</th>
                </tr>
              </thead>
              <tbody>
                {sortedCandidates.map((c) => {
                  const d = stepIndex !== undefined ? c.stepDates[stepIndex] : undefined;
                  return (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">{c.name}</td>
                      <td className="px-3 py-2">
                        <div className="text-foreground/90">{c.vacature}</div>
                        <div className="text-[11px] text-muted-foreground">{c.bedrijf}</div>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{c.consultant}</td>
                      <td className="px-3 py-2 text-muted-foreground whitespace-nowrap tabular-nums">
                        {d ? format(d, "d MMM yyyy", { locale: nl }) : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-2">
                          <StepBadge step={c.reachedStep} />
                          <StepDots step={c.reachedStep} />
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={cn(
                          "text-[10px] capitalize",
                          c.status === "geplaatst" && "border-accent/40 text-accent",
                          c.status === "afgevallen" && "border-destructive/40 text-destructive",
                        )}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-center"><ProfileLinks candidateId={c.candidateId} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {total === 0 && (
            <div className="p-10 text-center text-xs text-muted-foreground">
              Geen resultaten binnen deze periode en filters.
            </div>
          )}
        </div>

        <div className="px-5 py-2.5 border-t border-border bg-muted/30 text-[11px] text-muted-foreground flex items-center justify-between">
          <span className="inline-flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> Klik op R (Recruit CRM) of S (Synsel AI) voor het kandidaatprofiel.
          </span>
          <span className="tabular-nums">{total.toLocaleString("nl-NL")} resultaten</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FunnelStepDialog;
