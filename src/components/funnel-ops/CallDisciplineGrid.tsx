import { useMemo, useState } from "react";
import { recruiterCallGrids, candidates as allCandidates, type BusinessUnit } from "@/data/funnelOperationsData";
import { CandidateLink, UserLink } from "./CandidateLink";
import { TierBadge } from "./TierBadge";
import { MessageCircle, Voicemail, Check, X, Circle, ChevronDown, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const SLOTS: { dag: 1 | 2; dagdeel: "ochtend" | "middag" | "avond"; label: string; block: string }[] = [
  { dag: 1, dagdeel: "ochtend", label: "Moment 1", block: "blok 08:30" },
  { dag: 1, dagdeel: "middag",  label: "Moment 2", block: "blok 12:00" },
  { dag: 1, dagdeel: "avond",   label: "Moment 3", block: "blok 17:00" },
  { dag: 2, dagdeel: "ochtend", label: "Moment 4", block: "blok 08:30" },
  { dag: 2, dagdeel: "middag",  label: "Moment 5", block: "blok 12:00" },
  { dag: 2, dagdeel: "avond",   label: "Moment 6", block: "blok 17:00" },
];

const ALL_UNITS: BusinessUnit[] = ["Industrie", "Installatietechniek", "Utiliteit", "Maritiem"];

function MultiSelect<T extends string>({
  label, options, selected, onChange, getLabel,
}: { label: string; options: T[]; selected: T[]; onChange: (v: T[]) => void; getLabel?: (o: T) => string }) {
  const allSelected = selected.length === 0 || selected.length === options.length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Filter className="w-3 h-3" />
          {label}{!allSelected && ` · ${selected.length}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2 space-y-1">
        <div className="flex items-center justify-between px-1 pb-1 border-b">
          <span className="text-xs font-medium">{label}</span>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-6 px-1.5 text-xs" onClick={() => onChange(options)}>Alles aan</Button>
            <Button size="sm" variant="ghost" className="h-6 px-1.5 text-xs" onClick={() => onChange([])}>Alles uit</Button>
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto space-y-0.5">
          {options.map(o => {
            const checked = selected.includes(o);
            return (
              <label key={o} className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-muted cursor-pointer text-xs">
                <Checkbox checked={checked} onCheckedChange={(v) => {
                  if (v) onChange([...selected, o]);
                  else onChange(selected.filter(x => x !== o));
                }} />
                <span>{getLabel ? getLabel(o) : o}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function CallDisciplineGrid() {
  const all = recruiterCallGrids();
  const [units, setUnits] = useState<BusinessUnit[]>([]);
  const [recruiterIds, setRecruiterIds] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const recruiterOptions = useMemo(() => all.map(g => g.recruiter), [all]);
  const recruiterLabelById = useMemo(() => Object.fromEntries(recruiterOptions.map(r => [r.id, r.naam])), [recruiterOptions]);

  const filtered = useMemo(() => {
    const unitSet = new Set(units);
    const recSet = new Set(recruiterIds);
    return all
      .filter(g => recSet.size === 0 || recSet.has(g.recruiter.id))
      .map(g => {
        const grids = unitSet.size === 0
          ? g.grids
          : g.grids.filter(x => unitSet.has(x.candidate.unit));
        const six = grids.filter(x => x.attempts.length === 6 && x.attempts.every(a => a.uitgevoerd)).length;
        const totalAttempts = grids.reduce((s, x) => s + x.attempts.filter(a => a.uitgevoerd).length, 0);
        return { ...g, grids, six, total: grids.length, totalAttempts };
      })
      .filter(g => g.total > 0)
      .slice(0, 12);
  }, [all, units, recruiterIds]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <MultiSelect label="Unit" options={ALL_UNITS} selected={units} onChange={setUnits} />
        <MultiSelect
          label="Recruiter"
          options={recruiterOptions.map(r => r.id)}
          selected={recruiterIds}
          onChange={setRecruiterIds}
          getLabel={(id) => recruiterLabelById[id] ?? id}
        />
        <span className="text-[11px] text-muted-foreground ml-1">
          {filtered.length} recruiters · {filtered.reduce((s, g) => s + g.total, 0)} kandidaten
        </span>
      </div>

      {filtered.map(({ recruiter, grids, six, total, totalAttempts }) => {
        const isCollapsed = collapsed[recruiter.id] ?? false;
        const pct = total ? Math.round((six / total) * 100) : 0;
        const pctColor = pct >= 70 ? "text-success" : pct >= 40 ? "text-orange-500" : "text-destructive";
        return (
          <Collapsible
            key={recruiter.id}
            open={!isCollapsed}
            onOpenChange={(open) => setCollapsed(s => ({ ...s, [recruiter.id]: !open }))}
            className="border border-border rounded-md bg-card overflow-hidden"
          >
            <CollapsibleTrigger asChild>
              <button className="w-full flex flex-wrap items-center gap-3 px-3 py-2 border-b border-border bg-muted/20 hover:bg-muted/40 transition-colors text-left">
                {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                <UserLink id={recruiter.id} name={recruiter.naam} className="font-medium text-sm" />
                <span className="text-xs text-muted-foreground">{total} kandidaten · {totalAttempts} pogingen</span>
                <span className={`ml-auto text-xs font-semibold tabular-nums ${pctColor}`}>
                  {six}/{total} · 6/6 ({pct}%)
                </span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="text-left p-2 font-normal">Kandidaat</th>
                      <th className="p-2 font-normal">Tier</th>
                      {SLOTS.map(s => (
                        <th key={s.label} className="p-2 font-normal text-center whitespace-nowrap">
                          <div>{s.label}</div>
                          <div className="text-[10px] text-muted-foreground/70 font-normal">{s.block}</div>
                        </th>
                      ))}
                      <th className="p-2 font-normal text-center">WA</th>
                      <th className="p-2 font-normal text-center">VM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {grids.map(({ candidate, attempts }) => {
                      const first = attempts.find(a => a.dagOffset === 1 && a.dagdeel === "ochtend");
                      return (
                        <tr key={candidate.id}>
                          <td className="p-2"><CandidateLink id={candidate.id} name={candidate.naam} /></td>
                          <td className="p-2"><TierBadge tier={candidate.tier} /></td>
                          {SLOTS.map(s => {
                            const a = attempts.find(x => x.dagOffset === s.dag && x.dagdeel === s.dagdeel);
                            const Icon = !a || !a.uitgevoerd ? X : a.succesvol ? Check : Circle;
                            const color = !a || !a.uitgevoerd ? "text-destructive" : a.succesvol ? "text-success" : "text-orange-500";
                            return (
                              <td key={s.label} className="p-2 text-center">
                                <Icon className={`inline-block w-3.5 h-3.5 ${color}`} strokeWidth={3} />
                              </td>
                            );
                          })}
                          <td className="p-2 text-center">{first?.whatsapp ? <MessageCircle className="inline-block w-3.5 h-3.5 text-success" /> : <span className="text-muted-foreground">—</span>}</td>
                          <td className="p-2 text-center">{first?.voicemail ? <Voicemail className="inline-block w-3.5 h-3.5 text-orange-500" /> : <span className="text-muted-foreground">—</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
      <p className="text-xs text-muted-foreground text-center">
        Bel-data is read-only — wijzigen via RecruitCRM.
      </p>
    </div>
  );
}
