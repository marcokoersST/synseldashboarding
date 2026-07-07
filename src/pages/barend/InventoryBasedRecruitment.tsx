import { useMemo, useState } from "react";
import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Info, TrendingUp, TrendingDown, Target, MapPin, Users, Megaphone, Sparkles,
  ArrowRight, ChevronDown, ChevronRight, Check, ChevronDown as ChevDown,
  Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, Maximize2, Code2,
  Phone, MessagesSquare, PartyPopper, UsersRound, Lock,
} from "lucide-react";
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip as RTooltip,
  ResponsiveContainer, CartesianGrid, BarChart, Bar, LineChart, Line, Legend,
  ReferenceLine, LabelList, Cell,
} from "recharts";
import {
  kandidaten, applyFilter, applyFilterAllStatuses, metrics, statsPerTitel, statsPerProvincie,
  statsPerConsultant, weeklyTrend, classify, QUADRANT_LABEL,
  QUADRANT_COLOR, buildOpportunities, defaultFilter, TITELS, PROVINCIES,
  BUSINESS_UNITS, CONSULTANTS, DATE_MIN, DATE_MAX,
  titelsPerConsultant, regiosPerConsultant, combisPerConsultant, besteVoorConsultant,
  type FilterState, type Quadrant, type Metrics,
} from "@/data/inkoopYieldData";

const fmt = (n: number) => n.toLocaleString("nl-NL");
const pct = (n: number, d = 0) => `${(n * 100).toFixed(d)}%`;


// ─── Info-tooltip helper ───
const HELP: Record<string, string> = {
  conversies: "Alle instroom (bemiddelbaar + niet-bemiddelbaar) binnen de gekozen filters. Puur ter context — de rest van het dashboard focust op bemiddelbare kandidaten.",
  bemiddelbaar: "Kandidaten die door recruitment goedgekeurd en werkbaar zijn. Basis voor alle plaatsingsberekeningen.",
  acquisitie: "Bemiddelbare kandidaten die actief in het salestraject zitten (in gesprek/procedure/geplaatst óf matchscore ≥ 60).",
  gesprek: "Bemiddelbare kandidaten met minimaal één sales-gesprek.",
  plaatsing: "Bemiddelbare kandidaten die succesvol zijn geplaatst.",
  kand: "Aantal bemiddelbare kandidaten binnen de filters.",
  bem: "Aantal bemiddelbare kandidaten.",
  gespr: "Aantal kandidaten met minimaal één sales-gesprek.",
  totaalGespr: "Totaal aantal gesprekken (som van alle gesprekken per kandidaat).",
  
  plaats: "Aantal succesvolle plaatsingen.",
  plaatsingsPct: "Plaatsingen ÷ bemiddelbare kandidaten. Hoofd-yield metric.",
  gesprekPct: "Kandidaten met gesprek ÷ bemiddelbare kandidaten.",
  advies: "Automatisch kwadrant-advies op basis van volume vs plaatsingskans t.o.v. gemiddelde.",
  besteTitel: "Titel waarop deze consultant/provincie de hoogste plaatsingskans behaalt (minimaal 3 kandidaten).",
  besteRegio: "Provincie waarin deze consultant de hoogste plaatsingskans behaalt.",
  besteCombi: "Beste titel × regio combinatie, gescoord op plaatsingskans × ln(1+volume).",
  conversiePct: "Plaatsingen ÷ bemiddelbare kandidaten in deze regio. Efficiency onafhankelijk van volume.",
  
  prio: "Prioriteitscore van de aanbeveling — hoger = eerder oppakken.",
  impact: "Ingeschatte extra plaatsingen bij uitvoering van de aanbeveling.",
  kans: "Plaatsingskans die als basis dient voor deze aanbeveling.",
  huidig: "Huidige instroom die als basis dient voor deze aanbeveling.",
};

function InfoHint({ id, className }: { id: keyof typeof HELP; className?: string }) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className={`inline-flex items-center align-middle text-[#bfa16b] hover:text-amber-600 transition ${className ?? ""}`}>
            <Info className="h-3 w-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          {HELP[id]}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Rode dev-info badge voor KPI-kaarten (vervangt info-icon)
function DevInfoBadge({ id }: { id: keyof typeof HELP }) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 align-middle bg-red-600 text-white hover:bg-red-700 transition text-[10px] px-1.5 py-0.5 rounded font-medium"
          >
            <Code2 className="h-3 w-3" /> Dev info
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          {HELP[id]}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compacte header met info-icoon voor tabel-koppen
function ThInfo({ label, id, align = "left", icon: Icon }: { label: string; id: keyof typeof HELP; align?: "left" | "right"; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <span className={`inline-flex items-center gap-1 ${align === "right" ? "justify-end w-full" : ""}`}>
      {Icon && <Icon className="h-3.5 w-3.5 text-[#bfa16b]" />}
      {label}
      <InfoHint id={id} />
    </span>
  );
}

// ─── Dev info popover per tabel (voor developers) ───
interface DevInfoProps {
  source: string;              // waar komt de data vandaan (bestand / functie)
  filters: string;             // welke filters worden toegepast
  transforms?: string[];       // groepering / sortering / berekeningen
  formulas?: Array<{ name: string; expr: string }>;
  notes?: string[];
  rowCount?: number;
}
function DevInfo(props: DevInfoProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" className="h-6 px-2 text-[10px] gap-1 bg-red-600 text-white hover:bg-red-700 font-medium">
          <Code2 className="h-3 w-3" /> Dev info
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[420px] p-0 text-xs font-mono">
        <div className="px-3 py-2 border-b border-border bg-muted/50 flex items-center justify-between">
          <span className="font-semibold uppercase text-[10px] tracking-wider text-muted-foreground">Developer info</span>
          {props.rowCount !== undefined && (
            <Badge variant="secondary" className="text-[10px] font-mono">n = {props.rowCount}</Badge>
          )}
        </div>
        <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Databron</div>
            <div className="text-[11px] break-words">{props.source}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Filters</div>
            <div className="text-[11px] break-words">{props.filters}</div>
          </div>
          {props.transforms && props.transforms.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Transformaties</div>
              <ul className="list-disc pl-4 space-y-0.5">
                {props.transforms.map((t, i) => <li key={i} className="text-[11px] break-words">{t}</li>)}
              </ul>
            </div>
          )}
          {props.formulas && props.formulas.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Formules</div>
              <div className="space-y-1">
                {props.formulas.map((f, i) => (
                  <div key={i} className="rounded border border-border bg-muted/40 px-2 py-1">
                    <div className="text-[10px] text-muted-foreground">{f.name}</div>
                    <div className="text-[11px] break-words">{f.expr}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {props.notes && props.notes.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Notes</div>
              <ul className="list-disc pl-4 space-y-0.5">
                {props.notes.map((n, i) => <li key={i} className="text-[11px] break-words">{n}</li>)}
              </ul>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Basisbeschrijving van de kernfilter — gebruikt in DevInfo per tabel.
const CORE_FILTER = "applyFilter(kandidaten, filter) → r.bemiddelbaar === true én matchesCore(r, filter): titel ∈ f.titel · provincie ∈ f.provincie · consultant ∈ f.consultant · businessUnit ∈ f.businessUnit · kandidaatType ∈ f.kandidaatType · geplaatst ∈ f.geplaatst · datumBinnenkomst ∈ [f.dateFrom, f.dateTo]. Lege multi-select = 'alle'.";

// ─── datum-utilities ───
const iso = (d: Date) => d.toISOString().slice(0, 10);
const parseISO = (s: string) => new Date(s + "T00:00:00");
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

function nlLabel(s: string) {
  const d = parseISO(s);
  return d.toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" });
}

// Vorige periode = zelfde lengte, direct voor dateFrom
function previousPeriod(dateFrom: string, dateTo: string): { from: string; to: string } {
  const from = parseISO(dateFrom);
  const to = parseISO(dateTo);
  const spanDays = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1);
  const prevTo = addDays(from, -1);
  const prevFrom = addDays(prevTo, -(spanDays - 1));
  return { from: iso(prevFrom), to: iso(prevTo) };
}

// ─── KPI Card met optionele delta ───
function KPI({
  label, value, sub, icon: Icon, delta, compare, muted, helpId,
}: {
  label: string; value: string; sub?: string; icon?: any;
  delta?: number; compare?: boolean; muted?: boolean;
  helpId?: keyof typeof HELP;
}) {
  const showDelta = compare && delta !== undefined && Number.isFinite(delta);
  const up = (delta ?? 0) >= 0;
  return (
    <Card className={`border ${muted ? "border-dashed border-border/70 bg-muted/30" : "border-border"}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wide">
          <span className="inline-flex items-center gap-1">{label}{helpId && <DevInfoBadge id={helpId} />}</span>
          {Icon && <Icon className="h-3.5 w-3.5 text-[#bfa16b]" />}
        </div>
        <div className={`text-2xl font-bold mt-1 tabular-nums ${muted ? "text-muted-foreground" : "text-foreground"}`}>{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
        {showDelta && (
          <div className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {up ? "+" : ""}{(delta! * 100).toFixed(1)}% vs vorige periode
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Trend per week (checkbox selectie: kandidaten / plaatsingen / ratio) ───
function TrendCard({ trend }: { trend: Array<{ week: string; kandidaten: number; plaatsingen: number }> }) {
  const [show, setShow] = useState({ kandidaten: true, plaatsingen: true, ratio: false });
  const data = trend.map(w => ({
    ...w,
    ratio: w.kandidaten > 0 ? (w.plaatsingen / w.kandidaten) * 100 : 0,
  }));
  const pad = (min: number, max: number) => {
    const range = Math.max(1, max - min);
    return [Math.max(0, Math.floor(min - range * 0.15)), Math.ceil(max + range * 0.15)];
  };
  const [kMin, kMax] = pad(0, Math.max(...data.map(d => d.kandidaten), 1));
  const [pMin, pMax] = pad(0, Math.max(...data.map(d => d.plaatsingen), 1));
  const [rMin, rMax] = pad(0, Math.max(...data.map(d => d.ratio), 1));

  const toggle = (k: keyof typeof show) => setShow(s => ({ ...s, [k]: !s[k] }));

  const items: Array<{ key: keyof typeof show; label: string; color: string }> = [
    { key: "kandidaten", label: "Kandidaten", color: "hsl(200,70%,50%)" },
    { key: "plaatsingen", label: "Plaatsingen", color: "hsl(150,65%,45%)" },
    { key: "ratio", label: "Plaatsingsratio %", color: "hsl(260,60%,55%)" },
  ];

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base">Trend per week</CardTitle>
          <div className="flex items-center gap-4 text-[12px]">
            {items.map(it => (
              <label key={it.key} className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox checked={show[it.key]} onCheckedChange={() => toggle(it.key)} />
                <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: it.color }} />
                <span className="text-foreground">{it.label}</span>
              </label>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            {show.kandidaten && (
              <YAxis yAxisId="left" domain={[kMin, kMax]} tick={{ fontSize: 10, fill: "hsl(200,70%,50%)" }}
                label={{ value: "Kandidaten", angle: -90, position: "insideLeft", fontSize: 10, fill: "hsl(200,70%,50%)" }} />
            )}
            {show.plaatsingen && (
              <YAxis yAxisId="right" orientation="right" domain={[pMin, pMax]} tick={{ fontSize: 10, fill: "hsl(150,65%,45%)" }}
                label={{ value: "Plaatsingen", angle: 90, position: "insideRight", fontSize: 10, fill: "hsl(150,65%,45%)" }} />
            )}
            {show.ratio && (
              <YAxis yAxisId="ratio" orientation="right" domain={[rMin, rMax]} tick={{ fontSize: 10, fill: "hsl(260,60%,55%)" }}
                tickFormatter={v => `${v.toFixed(0)}%`}
                label={{ value: "Ratio %", angle: 90, position: "insideRight", fontSize: 10, fill: "hsl(260,60%,55%)" }} />
            )}
            {!show.kandidaten && !show.plaatsingen && !show.ratio && (
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            )}
            <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }}
              formatter={(v: any, n: any) => n === "Plaatsingsratio %" ? `${(+v).toFixed(1)}%` : v} />
            {show.kandidaten && (
              <Line yAxisId="left" type="monotone" dataKey="kandidaten" name="Kandidaten" stroke="hsl(200,70%,50%)" strokeWidth={2} dot={false} />
            )}
            {show.plaatsingen && (
              <Line yAxisId="right" type="monotone" dataKey="plaatsingen" name="Plaatsingen" stroke="hsl(150,65%,45%)" strokeWidth={2.5} dot={{ r: 2 }} />
            )}
            {show.ratio && (
              <Line yAxisId="ratio" type="monotone" dataKey="ratio" name="Plaatsingsratio %" stroke="hsl(260,60%,55%)" strokeWidth={2.5} dot={{ r: 2 }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}


// ─── Volledige lijst titels (popup) ───
function FullListDialog({
  title, allTitels, sortDir,
}: {
  title: string;
  allTitels: Array<{ titel: string; volume: number; bemiddelbaar: number; plaatsingen: number; plaatsingspct: number; gesprekken: number; gesprekspct: number }>;
  sortDir: "asc" | "desc";
}) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<"titel" | "volume" | "gesprekken" | "gesprekspct" | "plaatsingen" | "plaatsingspct">("plaatsingspct");
  const [dir, setDir] = useState<"asc" | "desc">(sortDir);
  const list = useMemo(() => {
    const filtered = allTitels.filter(t => t.titel.toLowerCase().includes(q.toLowerCase()));
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] as any, bv = b[sortKey] as any;
      if (typeof av === "string") return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return dir === "asc" ? av - bv : bv - av;
    });
  }, [allTitels, q, sortKey, dir]);
  const toggleSort = (k: typeof sortKey) => {
    if (sortKey === k) setDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setDir(k === "titel" ? "asc" : "desc"); }
  };
  const Th = ({ k, label, align }: { k: typeof sortKey; label: string; align?: "right" }) => (
    <TableHead className={align === "right" ? "text-right" : ""}>
      <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort(k)}>
        {label}
        {sortKey === k && (dir === "asc" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}
      </button>
    </TableHead>
  );
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] gap-1">
          <Maximize2 className="h-3 w-3 text-[#bfa16b]" /> Volledige lijst
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-base">{title} — volledige lijst</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 mb-2">
          <Input placeholder="Zoek op titel…" value={q} onChange={e => setQ(e.target.value)} className="h-8 text-xs max-w-xs" />
          <span className="text-[11px] text-muted-foreground">{list.length} titel{list.length === 1 ? "" : "s"}</span>
        </div>
        <div className="max-h-[60vh] overflow-y-auto border border-border rounded">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <Th k="titel" label="Titel" />
                <Th k="volume" label="n" align="right" />
                <Th k="gesprekken" label="Gespr." align="right" />
                <Th k="gesprekspct" label="Gespr. %" align="right" />
                <Th k="plaatsingen" label="Plaats." align="right" />
                <Th k="plaatsingspct" label="Plaatsings %" align="right" />
                
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map(t => (
                <TableRow key={t.titel}>
                  <TableCell className="text-xs font-medium py-1.5">{t.titel}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums py-1.5">{t.volume}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums py-1.5">{t.gesprekken}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums py-1.5">{pct(t.gesprekspct, 1)}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums py-1.5 font-semibold">{t.plaatsingen}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums py-1.5">{pct(t.plaatsingspct, 1)}</TableCell>
                  
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-6">Geen resultaten</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}


function MultiSelect({
  label, options, selected, onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const allSelected = selected.length === 0;
  const summary = allSelected
    ? `${label}: alle (${options.length})`
    : selected.length === 1
      ? `${label}: ${selected[0]}`
      : `${label}: ${selected.length}/${options.length}`;
  // Empty array = "alles geselecteerd". Bij eerste uncheck materialiseren we de rest.
  const toggle = (opt: string) => {
    if (allSelected) {
      onChange(options.filter(o => o !== opt));
    } else if (selected.includes(opt)) {
      const next = selected.filter(x => x !== opt);
      // Als hij alle opties opnieuw dekt, val terug op "alle"
      onChange(next.length === 0 ? [] : next);
    } else {
      const next = [...selected, opt];
      onChange(next.length === options.length ? [] : next);
    }
  };
  const isChecked = (opt: string) => allSelected || selected.includes(opt);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 text-xs gap-2 font-normal">
          {summary}
          <ChevDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <button
            className="text-[11px] font-medium text-primary hover:underline"
            onClick={() => onChange([])}
          >Alles aan</button>
          <button
            className="text-[11px] font-medium text-muted-foreground hover:underline"
            onClick={() => onChange([options[0]])}
          >Alles uit</button>
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted/60 cursor-pointer">
              <Checkbox
                checked={isChecked(opt)}
                onCheckedChange={() => toggle(opt)}
              />
              <span className="flex-1">{opt}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Smart date range picker ───
type PresetId = "week" | "maand" | "kwartaal" | "jaar" | "ytd" | "alles" | "custom";
const PRESETS: Array<{ id: PresetId; label: string }> = [
  { id: "week", label: "Laatste week" },
  { id: "maand", label: "Laatste maand" },
  { id: "kwartaal", label: "Laatste kwartaal" },
  { id: "jaar", label: "Laatste jaar" },
  { id: "ytd", label: "Year-to-date" },
  { id: "alles", label: "Alle data" },
];

function presetRange(id: PresetId): { from: string; to: string } {
  const to = parseISO(DATE_MAX); // demo: einde dataset
  const toISO = iso(to);
  if (id === "alles") return { from: DATE_MIN, to: toISO };
  if (id === "ytd") return { from: iso(new Date(to.getFullYear(), 0, 1)), to: toISO };
  const days = id === "week" ? 7 : id === "maand" ? 30 : id === "kwartaal" ? 90 : 365;
  return { from: iso(addDays(to, -(days - 1))), to: toISO };
}

function currentPresetLabel(f: FilterState): string {
  for (const p of PRESETS) {
    const r = presetRange(p.id);
    if (r.from === f.dateFrom && r.to === f.dateTo) return p.label;
  }
  return `${nlLabel(f.dateFrom)} – ${nlLabel(f.dateTo)}`;
}

function SmartDatePicker({ filter, setFilter }: { filter: FilterState; setFilter: (f: FilterState) => void }) {
  const prev = previousPeriod(filter.dateFrom, filter.dateTo);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 text-xs gap-2 font-normal">
          <CalendarIcon className="h-3.5 w-3.5" />
          {currentPresetLabel(filter)}
          <ChevDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b border-border grid grid-cols-2 gap-1">
          {PRESETS.map(p => {
            const r = presetRange(p.id);
            const active = r.from === filter.dateFrom && r.to === filter.dateTo;
            return (
              <button
                key={p.id}
                onClick={() => setFilter({ ...filter, dateFrom: r.from, dateTo: r.to })}
                className={`text-[11px] px-2 py-1.5 rounded text-left ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >{p.label}</button>
            );
          })}
        </div>
        <div className="p-3 space-y-2">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Aangepast</div>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={filter.dateFrom}
              min={DATE_MIN}
              max={DATE_MAX}
              onChange={e => setFilter({ ...filter, dateFrom: e.target.value })}
              className="text-xs border border-border rounded px-2 py-1 flex-1 bg-background"
            />
            <span className="text-xs text-muted-foreground">–</span>
            <input
              type="date"
              value={filter.dateTo}
              min={DATE_MIN}
              max={DATE_MAX}
              onChange={e => setFilter({ ...filter, dateTo: e.target.value })}
              className="text-xs border border-border rounded px-2 py-1 flex-1 bg-background"
            />
          </div>
        </div>
        <div className="p-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium">Vergelijk met vorige periode</div>
              <div className="text-[10px] text-muted-foreground">{nlLabel(prev.from)} – {nlLabel(prev.to)}</div>
            </div>
            <Switch
              checked={filter.compare}
              onCheckedChange={v => setFilter({ ...filter, compare: v })}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Filter bar ───
function FilterBar({ filter, setFilter }: { filter: FilterState; setFilter: (f: FilterState) => void }) {
  return (
    <div className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-background/95 backdrop-blur border-b border-border mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <MultiSelect label="Titel" options={TITELS} selected={filter.titel}
          onChange={v => setFilter({ ...filter, titel: v })} />
        <MultiSelect label="Provincie" options={PROVINCIES} selected={filter.provincie}
          onChange={v => setFilter({ ...filter, provincie: v })} />
        <MultiSelect label="Consultant" options={CONSULTANTS.map(c => c.naam)} selected={filter.consultant}
          onChange={v => setFilter({ ...filter, consultant: v })} />
        <MultiSelect label="Unit" options={BUSINESS_UNITS} selected={filter.businessUnit}
          onChange={v => setFilter({ ...filter, businessUnit: v })} />
        <MultiSelect label="Kandidaten" options={["Nieuw", "Heractivering"]} selected={filter.kandidaatType}
          onChange={v => setFilter({ ...filter, kandidaatType: v as any })} />
        <MultiSelect label="Geplaatst" options={["Ja", "Nee"]} selected={filter.geplaatst}
          onChange={v => setFilter({ ...filter, geplaatst: v as any })} />
        <SmartDatePicker filter={filter} setFilter={setFilter} />
        {filter.compare && (
          <Badge variant="secondary" className="h-9 rounded-md px-2 text-[11px] font-normal">
            Vergelijking aan
          </Badge>
        )}
        <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={() => setFilter(defaultFilter)}>Reset alles</Button>
      </div>
    </div>
  );
}

function ProvincieKaart({ stats, onSelect }: { stats: ReturnType<typeof statsPerProvincie>; onSelect?: (provincie: string) => void }) {
  const max = Math.max(...stats.map(s => s.plaatsingspct), 0.001);

  // Geografische grid-posities (col, row) — 5 cols × 6 rows
  const pos: Record<string, [number, number]> = {
    "Friesland": [2, 0], "Groningen": [3, 0],
    "Noord-Holland": [1, 1], "Drenthe": [3, 1],
    "Flevoland": [2, 2], "Overijssel": [3, 2],
    "Zuid-Holland": [1, 3], "Utrecht": [2, 3], "Gelderland": [3, 3],
    "Zeeland": [0, 4], "Noord-Brabant": [2, 4],
    "Limburg": [3, 5],
  };

  const cells: { provincie: string; col: number; row: number }[] = [];
  for (const [provincie, [col, row]] of Object.entries(pos)) {
    cells.push({ provincie, col, row });
  }

  return (
    <div
      className="relative w-full"
      style={{ maxWidth: 620 }}
    >
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(5, 1fr)`,
          gridTemplateRows: `repeat(6, minmax(72px, 1fr))`,
        }}
      >
        {Array.from({ length: 30 }).map((_, i) => {
          const col = i % 5;
          const row = Math.floor(i / 5);
          const cell = cells.find(c => c.col === col && c.row === row);
          if (!cell) return <div key={i} />;
          const s = stats.find(x => x.provincie === cell.provincie)!;
          const intensity = s.plaatsingspct / max;
          const bgLight = 95 - intensity * 55; // 95 → 40
          const textColor = intensity > 0.5 ? "text-white" : "text-foreground";

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect?.(cell.provincie)}
              className={`relative rounded-lg border border-border/60 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/70 transition flex flex-col items-start justify-between p-2.5 text-left ${textColor}`}
              style={{ background: `hsl(150, 65%, ${bgLight}%)`, gridColumn: `${col + 1}`, gridRow: `${row + 1}` }}
              title={`${cell.provincie}: ${pct(s.plaatsingspct, 1)} plaatsingskans · ${s.volume} kandidaten · ${s.plaatsingen} plaatsingen`}
            >
              <span className="text-[12px] font-semibold leading-tight">{cell.provincie}</span>
              <div className="w-full mt-1 space-y-0.5">
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-[9px] uppercase tracking-wide opacity-75">Kans</span>
                  <span className="text-[12px] font-bold tabular-nums">{pct(s.plaatsingspct, 0)}</span>
                </div>
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-[9px] uppercase tracking-wide opacity-75">Vol.</span>
                  <span className="text-[10px] font-medium tabular-nums">{s.volume}</span>
                </div>
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-[9px] uppercase tracking-wide opacity-75">Plts.</span>
                  <span className="text-[10px] font-medium tabular-nums">{s.plaatsingen}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Consultant row (met uitklap) ───
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const w = max > 0 ? (value / max) * 100 : 0;
  return <div className="h-1.5 rounded" style={{ width: `${w}%`, background: color, minWidth: 2 }} />;
}

function MiniTable({
  title, items, color, emptyMsg,
}: {
  title: string;
  items: Array<{ label: string; sub?: string; volume: number; plaatsingen: number; yieldPct: number }>;
  color: string;
  emptyMsg: string;
}) {
  const maxYield = Math.max(...items.map(i => i.yieldPct), 0.001);
  return (
    <div className="min-w-0">
      <div className="text-xs font-semibold text-foreground mb-2">{title}</div>
      {items.length === 0 ? (
        <div className="text-[11px] text-muted-foreground italic">{emptyMsg}</div>
      ) : (
        <div className="space-y-1.5">
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <div className="w-4 text-muted-foreground tabular-nums">{i + 1}.</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate font-medium">{it.label}{it.sub && <span className="text-muted-foreground font-normal"> · {it.sub}</span>}</div>
                  <div className="tabular-nums font-semibold whitespace-nowrap">{pct(it.yieldPct, 0)}</div>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1.5 bg-muted rounded overflow-hidden">
                    <MiniBar value={it.yieldPct} max={maxYield} color={color} />
                  </div>
                  <div className="text-[10px] text-muted-foreground w-16 text-right tabular-nums">n={it.volume} · {it.plaatsingen} pl</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type SortState<K extends string> = { key: K; dir: "asc" | "desc" };

function SortableMiniTable<T extends { label: string; volume: number; plaatsingen: number; yieldPct: number }>({
  title, items, color, emptyMsg,
}: {
  title: string;
  items: T[];
  color: string;
  emptyMsg: string;
}) {
  const maxYield = Math.max(...items.map(i => i.yieldPct), 0.001);
  return (
    <div className="min-w-0">
      <div className="text-xs font-semibold text-foreground mb-2">{title}</div>
      {items.length === 0 ? (
        <div className="text-[11px] text-muted-foreground italic">{emptyMsg}</div>
      ) : (
        <div className="space-y-1.5">
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <div className="w-4 text-muted-foreground tabular-nums">{i + 1}.</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate font-medium">{it.label}</div>
                  <div className="tabular-nums font-semibold whitespace-nowrap">{pct(it.yieldPct, 0)}</div>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1.5 bg-muted rounded overflow-hidden">
                    <MiniBar value={it.yieldPct} max={maxYield} color={color} />
                  </div>
                  <div className="text-[10px] text-muted-foreground w-16 text-right tabular-nums">n={it.volume} · {it.plaatsingen} pl</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sorteerbare tabel voor dialog-tabs ───
function FullSortableTable<T extends { label: string; volume: number; plaatsingen: number; yieldPct: number }>({
  items, labelHeader, dir = "desc", emptyMsg,
}: {
  items: T[];
  labelHeader: string;
  dir?: "asc" | "desc";
  emptyMsg: string;
}) {
  const [sort, setSort] = useState<SortState<"label" | "volume" | "plaatsingen" | "yieldPct">>({ key: "yieldPct", dir });
  const toggleSort = (k: typeof sort.key) => {
    setSort(s => s.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: k === "label" ? "asc" : "desc" });
  };
  const sorted = useMemo(() => {
    const d = sort.dir === "asc" ? 1 : -1;
    return [...items].sort((a, b) => {
      const av = a[sort.key] as any, bv = b[sort.key] as any;
      if (typeof av === "string") return d * av.localeCompare(bv);
      return d * (av - bv);
    });
  }, [items, sort]);
  const Th = ({ k, label, align }: { k: typeof sort.key; label: string; align?: "right" }) => (
    <th className={`px-2 py-1.5 font-medium ${align === "right" ? "text-right" : "text-left"}`}>
      <button type="button" className="inline-flex items-center gap-0.5 hover:text-foreground" onClick={() => toggleSort(k)}>
        {label}
        {sort.key === k && (sort.dir === "asc" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}
      </button>
    </th>
  );
  if (items.length === 0) return <div className="text-xs text-muted-foreground italic p-4">{emptyMsg}</div>;
  return (
    <div className="border border-border rounded bg-background overflow-hidden">
      <div className="max-h-[60vh] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/50 sticky top-0 text-muted-foreground">
            <tr>
              <th className="px-2 py-1.5 font-medium text-left">#</th>
              <Th k="label" label={labelHeader} />
              <Th k="volume" label="Kandidaten" align="right" />
              <Th k="plaatsingen" label="Plaatsingen" align="right" />
              <Th k="yieldPct" label="Plaatsingspercentage" align="right" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((it, i) => (
              <tr key={it.label} className="border-t border-border hover:bg-muted/30">
                <td className="px-2 py-1.5 tabular-nums text-muted-foreground">{i + 1}</td>
                <td className="px-2 py-1.5 font-medium">{it.label}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{it.volume}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{it.plaatsingen}</td>
                <td className="px-2 py-1.5 text-right tabular-nums font-semibold text-primary">{pct(it.yieldPct, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ConsultantRow({
  consultant, businessUnit, volume, plaatsingen, plaatsingspct, rows,
}: {
  consultant: string; businessUnit: string; volume: number; plaatsingen: number; plaatsingspct: number;
  rows: Parameters<typeof titelsPerConsultant>[0];
}) {
  const [open, setOpen] = useState(false);
  const [showAllCombis, setShowAllCombis] = useState(false);
  const [combiSortKey, setCombiSortKey] = useState<"score" | "titel" | "provincie" | "volume" | "plaatsingen" | "yieldPct">("yieldPct");
  const [combiSortDir, setCombiSortDir] = useState<"asc" | "desc">("desc");
  const best = useMemo(() => besteVoorConsultant(rows, consultant), [rows, consultant]);
  const titels = useMemo(() => titelsPerConsultant(rows, consultant).filter(t => t.volume >= 3), [rows, consultant]);
  const regios = useMemo(() => regiosPerConsultant(rows, consultant).filter(t => t.volume >= 3), [rows, consultant]);
  const combis = useMemo(() => combisPerConsultant(rows, consultant).filter(t => t.volume >= 2), [rows, consultant]);
  const allCombis = useMemo(() => combisPerConsultant(rows, consultant), [rows, consultant]);

  const topTitels = [...titels].sort((a, b) => b.yieldPct - a.yieldPct).slice(0, 5)
    .map(t => ({ label: t.titel, volume: t.volume, plaatsingen: t.plaatsingen, yieldPct: t.yieldPct }));
  const worstTitels = [...titels].sort((a, b) => a.yieldPct - b.yieldPct).slice(0, 5)
    .map(t => ({ label: t.titel, volume: t.volume, plaatsingen: t.plaatsingen, yieldPct: t.yieldPct }));
  const topRegios = [...regios].sort((a, b) => b.yieldPct - a.yieldPct).slice(0, 5)
    .map(t => ({ label: t.provincie, volume: t.volume, plaatsingen: t.plaatsingen, yieldPct: t.yieldPct }));
  const allTitelsSorted = [...titels].sort((a, b) => b.yieldPct - a.yieldPct)
    .map(t => ({ label: t.titel, volume: t.volume, plaatsingen: t.plaatsingen, yieldPct: t.yieldPct }));
  const allWorstTitelsSorted = [...titels].sort((a, b) => a.yieldPct - b.yieldPct)
    .map(t => ({ label: t.titel, volume: t.volume, plaatsingen: t.plaatsingen, yieldPct: t.yieldPct }));
  const allRegiosSorted = [...regios].sort((a, b) => b.yieldPct - a.yieldPct)
    .map(t => ({ label: t.provincie, volume: t.volume, plaatsingen: t.plaatsingen, yieldPct: t.yieldPct }));
  const topCombis = [...combis].sort((a, b) => b.score - a.score).slice(0, 3);
  const sortedAllCombis = useMemo(() => {
    const dir = combiSortDir === "asc" ? 1 : -1;
    return [...allCombis].sort((a, b) => {
      const av = a[combiSortKey] as any;
      const bv = b[combiSortKey] as any;
      if (typeof av === "string") return dir * av.localeCompare(bv);
      return dir * (av - bv);
    });
  }, [allCombis, combiSortKey, combiSortDir]);

  const toggleCombiSort = (k: typeof combiSortKey) => {
    if (combiSortKey === k) setCombiSortDir(d => d === "asc" ? "desc" : "asc");
    else { setCombiSortKey(k); setCombiSortDir(k === "titel" || k === "provincie" ? "asc" : "desc"); }
  };
  const CombiTh = ({ k, label, align }: { k: typeof combiSortKey; label: string; align?: "right" }) => (
    <th className={`px-2 py-1.5 font-medium ${align === "right" ? "text-right" : "text-left"}`}>
      <button type="button" className="inline-flex items-center gap-0.5 hover:text-foreground" onClick={() => toggleCombiSort(k)}>
        {label}
        {combiSortKey === k && (combiSortDir === "asc" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}
      </button>
    </th>
  );

  const heeftData = volume >= 5;

  return (
    <>
      <TableRow className="cursor-pointer" onClick={() => setOpen(o => !o)}>
        <TableCell className="py-2">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </TableCell>
        <TableCell className="text-xs font-medium">{consultant}</TableCell>
        <TableCell className="text-xs text-muted-foreground">{businessUnit}</TableCell>
        <TableCell className="text-xs text-right tabular-nums">{volume}</TableCell>
        <TableCell className="text-xs text-right tabular-nums font-semibold">{plaatsingen}</TableCell>
        <TableCell className="text-xs text-right tabular-nums">{pct(plaatsingspct, 1)}</TableCell>
        <TableCell className="text-xs">
          {best.besteTitel ? <span className="text-emerald-600 dark:text-emerald-400">{best.besteTitel.titel} <span className="text-muted-foreground">({pct(best.besteTitel.yieldPct, 0)})</span></span> : <span className="text-muted-foreground">—</span>}
        </TableCell>
        <TableCell className="text-xs">
          {best.besteRegio ? <span className="text-emerald-600 dark:text-emerald-400">{best.besteRegio.provincie} <span className="text-muted-foreground">({pct(best.besteRegio.yieldPct, 0)})</span></span> : <span className="text-muted-foreground">—</span>}
        </TableCell>
        <TableCell className="text-xs">
          {best.besteCombi ? (
            <span className="text-primary font-medium">{best.besteCombi.titel} · {best.besteCombi.provincie} <span className="text-muted-foreground font-normal">({pct(best.besteCombi.yieldPct, 0)}, n={best.besteCombi.volume})</span></span>
          ) : <span className="text-muted-foreground">—</span>}
        </TableCell>
      </TableRow>
      {open && (
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableCell colSpan={9} className="p-0">
            <div className="p-4">
              {!heeftData ? (
                <div className="text-xs text-muted-foreground italic">Onvoldoende data (minder dan 5 kandidaten).</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SortableMiniTable title="Top 5 titels" items={topTitels} color="hsl(150,65%,45%)" emptyMsg="Geen titels met voldoende volume (≥3)" />
                    <SortableMiniTable title="Slechtste 5 titels" items={worstTitels} color="hsl(0,70%,55%)" emptyMsg="Geen titels met voldoende volume (≥3)" />
                    <SortableMiniTable title="Top 5 regio's" items={topRegios} color="hsl(200,75%,50%)" emptyMsg="Geen regio's met voldoende volume (≥3)" />
                  </div>
                  <div className="mt-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                          Bekijk meer
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                        <DialogHeader>
                          <DialogTitle className="text-base">{consultant} — detailoverzicht</DialogTitle>
                        </DialogHeader>
                        <Tabs defaultValue="best" className="flex-1 flex flex-col min-h-0">
                          <TabsList>
                            <TabsTrigger value="best">Beste titels</TabsTrigger>
                            <TabsTrigger value="worst">Slechtste titels</TabsTrigger>
                            <TabsTrigger value="prov">Provincies</TabsTrigger>
                          </TabsList>
                          <TabsContent value="best" className="mt-3">
                            <FullSortableTable items={allTitelsSorted} labelHeader="Titel" dir="desc" emptyMsg="Geen titels met voldoende volume (≥3)" />
                          </TabsContent>
                          <TabsContent value="worst" className="mt-3">
                            <FullSortableTable items={allWorstTitelsSorted} labelHeader="Titel" dir="asc" emptyMsg="Geen titels met voldoende volume (≥3)" />
                          </TabsContent>
                          <TabsContent value="prov" className="mt-3">
                            <FullSortableTable items={allRegiosSorted} labelHeader="Provincie" dir="desc" emptyMsg="Geen regio's met voldoende volume (≥3)" />
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="mt-5">
                    <div className="text-xs font-semibold text-foreground mb-2">Top 3 titel × regio combinaties</div>
                    {topCombis.length === 0 ? (
                      <div className="text-[11px] text-muted-foreground italic">Geen combinaties met voldoende volume (≥2)</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {topCombis.map((c, i) => (
                          <div key={i} className="border border-border rounded p-3 bg-background">
                            <div className="flex items-center justify-between">
                              <Badge className="text-[10px]" style={{ background: "hsl(260,60%,55%)", color: "white" }}>#{i + 1}</Badge>
                              <span className="text-xs font-bold text-primary tabular-nums">{pct(c.yieldPct, 0)}</span>
                            </div>
                            <div className="mt-2 text-xs font-semibold">{c.titel}</div>
                            <div className="text-[11px] text-muted-foreground">{c.provincie}</div>
                            <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                              <span>n={c.volume}</span>
                              <span>{c.plaatsingen} plaatsing{c.plaatsingen === 1 ? "" : "en"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {sortedAllCombis.length > 0 && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => setShowAllCombis(v => !v)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                        >
                          {showAllCombis ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          {showAllCombis ? "Verberg alle combinaties" : `Bekijk alle combinaties (${sortedAllCombis.length})`}
                        </button>
                        {showAllCombis && (
                          <div className="mt-2 border border-border rounded bg-background overflow-hidden">
                            <div className="max-h-72 overflow-y-auto">
                              <table className="w-full text-[11px]">
                                <thead className="bg-muted/50 sticky top-0">
                                  <tr className="text-muted-foreground">
                                    <th className="px-2 py-1.5 font-medium text-left">#</th>
                                    <CombiTh k="titel" label="Titel" />
                                    <CombiTh k="provincie" label="Provincie" />
                                    <CombiTh k="volume" label="Kandidaten" align="right" />
                                    <CombiTh k="plaatsingen" label="Plaatsingen" align="right" />
                                    <CombiTh k="yieldPct" label="Plaatsingspercentage" align="right" />
                                  </tr>
                                </thead>
                                <tbody>
                                  {sortedAllCombis.map((c, i) => (
                                    <tr key={`${c.titel}-${c.provincie}`} className="border-t border-border hover:bg-muted/30">
                                      <td className="px-2 py-1.5 tabular-nums text-muted-foreground">{i + 1}</td>
                                      <td className="px-2 py-1.5 font-medium">{c.titel}</td>
                                      <td className="px-2 py-1.5">{c.provincie}</td>
                                      <td className="px-2 py-1.5 text-right tabular-nums">{c.volume}</td>
                                      <td className="px-2 py-1.5 text-right tabular-nums">{c.plaatsingen}</td>
                                      <td className="px-2 py-1.5 text-right tabular-nums font-semibold text-primary">{pct(c.yieldPct, 0)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ─── Hoofd ───
export default function InkoopYieldDashboard() {
  const [filter, setFilter] = useState<FilterState>(defaultFilter);
  const rows = useMemo(() => applyFilter(kandidaten, filter), [filter]);
  // Alle kandidaten (incl. niet-bemiddelbaar) binnen de filters — enkel voor Conversies-indicator
  const conversies = useMemo(() => applyFilterAllStatuses(kandidaten, filter).length, [filter]);
  const global = useMemo(() => metrics(rows), [rows]);
  const titelStats = useMemo(() => statsPerTitel(rows), [rows]);
  const provStats = useMemo(() => statsPerProvincie(rows), [rows]);
  const consStats = useMemo(() => statsPerConsultant(rows), [rows]);
  const trend = useMemo(() => weeklyTrend(rows), [rows]);
  const opportunities = useMemo(() => buildOpportunities(rows), [rows]);

  // Vorige periode voor vergelijking
  const prevRange = useMemo(() => previousPeriod(filter.dateFrom, filter.dateTo), [filter.dateFrom, filter.dateTo]);
  const prev = useMemo(() => {
    if (!filter.compare) return null;
    return metrics(applyFilter(kandidaten, { ...filter, dateFrom: prevRange.from, dateTo: prevRange.to }));
  }, [filter, prevRange]);
  const prevConversies = useMemo(() => {
    if (!filter.compare) return undefined;
    return applyFilterAllStatuses(kandidaten, { ...filter, dateFrom: prevRange.from, dateTo: prevRange.to }).length;
  }, [filter, prevRange]);
  const deltaOf = (curr: number, previous: number | undefined) => {
    if (previous === undefined || previous === 0) return undefined;
    return (curr - previous) / previous;
  };

  // Titel-universum: alleen titels met instroom binnen de huidige filters.
  // Zo matchen de KPI-som, kaarten, tabel en scatter exact op dezelfde basis.
  const activeTitels = useMemo(() => titelStats.filter(t => t.volume > 0), [titelStats]);
  const activeConsultants = useMemo(() => consStats.filter(c => c.volume > 0), [consStats]);

  // Titel-detail popup state
  const [titelDetail, setTitelDetail] = useState<string | null>(null);
  const [showTitelConsultants, setShowTitelConsultants] = useState(false);
  const titelDetailData = useMemo(() => {
    if (!titelDetail) return null;
    const titelRows = rows.filter(r => r.titel === titelDetail);
    const perProv = PROVINCIES.map(provincie => {
      const list = titelRows.filter(r => r.provincie === provincie);
      const bem = list.filter(r => r.bemiddelbaar).length;
      const gesp = list.filter(r => r.inGesprek || r.inProcedure || r.geplaatst).length;
      const pl = list.filter(r => r.geplaatst).length;
      return { provincie, ins: bem, gesprekken: gesp, plaatsingen: pl, plaatsingspct: bem ? pl / bem : 0 };
    }).filter(p => p.ins > 0).sort((a, b) => b.plaatsingen - a.plaatsingen);
    const perCons = CONSULTANTS.map(c => {
      const list = titelRows.filter(r => r.consultant === c.naam);
      const bem = list.filter(r => r.bemiddelbaar).length;
      const gesp = list.filter(r => r.inGesprek || r.inProcedure || r.geplaatst).length;
      const pl = list.filter(r => r.geplaatst).length;
      return { consultant: c.naam, unit: c.unit, ins: bem, gesprekken: gesp, plaatsingen: pl, plaatsingspct: bem ? pl / bem : 0 };
    }).filter(c => c.ins > 0).sort((a, b) => b.plaatsingspct - a.plaatsingspct || b.plaatsingen - a.plaatsingen);
    return { perProv, perCons };
  }, [titelDetail, rows]);

  // Provincie-detail popup state
  const [provincieDetail, setProvincieDetail] = useState<string | null>(null);
  const [showProvincieConsultants, setShowProvincieConsultants] = useState(false);
  const provincieDetailData = useMemo(() => {
    if (!provincieDetail) return null;
    const provRows = rows.filter(r => r.provincie === provincieDetail);
    const perTitel = TITELS.map(titel => {
      const list = provRows.filter(r => r.titel === titel);
      const bem = list.filter(r => r.bemiddelbaar).length;
      const gesp = list.filter(r => r.inGesprek || r.inProcedure || r.geplaatst).length;
      const pl = list.filter(r => r.geplaatst).length;
      return { titel, ins: bem, gesprekken: gesp, plaatsingen: pl, plaatsingspct: bem ? pl / bem : 0 };
    }).filter(t => t.ins > 0).sort((a, b) => b.plaatsingen - a.plaatsingen);
    const perCons = CONSULTANTS.map(c => {
      const list = provRows.filter(r => r.consultant === c.naam);
      const bem = list.filter(r => r.bemiddelbaar).length;
      const gesp = list.filter(r => r.inGesprek || r.inProcedure || r.geplaatst).length;
      const pl = list.filter(r => r.geplaatst).length;
      return { consultant: c.naam, unit: c.unit, ins: bem, gesprekken: gesp, plaatsingen: pl, plaatsingspct: bem ? pl / bem : 0 };
    }).filter(c => c.ins > 0).sort((a, b) => b.plaatsingspct - a.plaatsingspct || b.plaatsingen - a.plaatsingen);
    return { perTitel, perCons };
  }, [provincieDetail, rows]);

  const avgVol = activeTitels.reduce((s, t) => s + t.volume, 0) / (activeTitels.length || 1);
  const avgYield = activeTitels.reduce((s, t) => s + t.plaatsingspct, 0) / (activeTitels.length || 1);

  // Card 1: hoogste plaatsingsratio
  const topRatio = [...activeTitels].sort((a, b) => b.plaatsingspct - a.plaatsingspct).slice(0, 10);
  const topRatioSet = new Set(topRatio.map(t => t.titel));
  const topRatioMedVol = topRatio.length
    ? [...topRatio].sort((a, b) => a.volume - b.volume)[Math.floor(topRatio.length / 2)].volume
    : 0;

  // Card 2: extra instroom nodig — titels met een hoog plaatsingsratio (bovengemiddeld
  // of vergelijkbaar met de top 10) maar met een lager volume dan de top 10-mediaan.
  // Score = plaatsingsratio × (tekort t.o.v. top 10-mediaanvolume) → grootste potentiële
  // extra plaatsingen bij extra inkoop.
  const topExtraInstroom = [...activeTitels]
    .filter(t => !topRatioSet.has(t.titel))
    .filter(t => t.plaatsingspct >= avgYield && t.volume < topRatioMedVol)
    .map(t => ({ ...t, _potentie: t.plaatsingspct * Math.max(1, topRatioMedVol - t.volume) }))
    .sort((a, b) => b._potentie - a._potentie)
    .slice(0, 10);

  // Card 3: 10 titels met laagste plaatsingsratio → mogelijk te hoge instroom
  const topTeHoog = [...activeTitels]
    .sort((a, b) => a.plaatsingspct - b.plaatsingspct)
    .slice(0, 10);

  const scatterData = activeTitels.map(t => ({
    ...t, x: t.volume, y: Math.round(t.plaatsingspct * 100),
    q: classify(t, avgVol, avgYield),
    z: 100 + t.plaatsingen * 8,
  }));

  return (
    <ConsultantLayout
      title="Inventory Based Recruitment"
      subtitle="Welke kandidaten moeten we inkopen om het aantal plaatsingen maximaal te verhogen?"
    >
      <FilterBar filter={filter} setFilter={setFilter} />

      <Tabs defaultValue="exec" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="exec"><Target className="h-3.5 w-3.5 mr-1.5 text-[#bfa16b]" />Executive</TabsTrigger>
          <TabsTrigger value="titels"><Sparkles className="h-3.5 w-3.5 mr-1.5 text-[#bfa16b]" />Titels</TabsTrigger>
          <TabsTrigger value="regio" disabled><Lock className="h-3 w-3 mr-1.5 text-muted-foreground" />Regio</TabsTrigger>
          <TabsTrigger value="consultant" disabled><Lock className="h-3 w-3 mr-1.5 text-muted-foreground" />Consultants</TabsTrigger>
          <TabsTrigger value="opps" disabled><Lock className="h-3 w-3 mr-1.5 text-muted-foreground" />Actielijst</TabsTrigger>
        </TabsList>

        {/* ═══ 1. EXECUTIVE ═══ */}
        <TabsContent value="exec" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <KPI label="Conversies" value={fmt(conversies)} helpId="conversies"
              sub={`Alle instroom · ${pct(conversies ? global.bemiddelbaar / conversies : 0)} bemiddelbaar`}
              icon={Megaphone} muted
              compare={filter.compare} delta={deltaOf(conversies, prevConversies)} />
            <KPI label="Bemiddelbaar" value={fmt(global.bemiddelbaar)} sub="Inschrijvingen · werkbaar volume" helpId="bemiddelbaar" icon={UsersRound}
              compare={filter.compare} delta={deltaOf(global.bemiddelbaar, prev?.bemiddelbaar)} />
            <KPI label="Acquisitie" value={fmt(global.acquisitie)} sub={pct(global.acquisitiepct) + " van bemiddelbaar"} helpId="acquisitie" icon={Phone}
              compare={filter.compare} delta={deltaOf(global.acquisitie, prev?.acquisitie)} />
            <KPI label="Gesprek" value={fmt(global.gesprekken)} sub={pct(global.gesprekspct) + " van bemiddelbaar"} helpId="gesprek" icon={MessagesSquare}
              compare={filter.compare} delta={deltaOf(global.gesprekken, prev?.gesprekken)} />
            <KPI label="Plaatsing" value={fmt(global.plaatsingen)} sub={pct(global.plaatsingspct) + " van bemiddelbaar"} icon={PartyPopper} helpId="plaatsing"
              compare={filter.compare} delta={deltaOf(global.plaatsingen, prev?.plaatsingen)} />
          </div>


          <TrendCard trend={trend} />


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {([
              {
                title: "Top 10 titels op plaatsingsratio", data: topRatio, badge: "Bescherm",
                color: "hsl(150,65%,45%)", sortDir: "desc" as const,
                dev: {
                  source: "activeTitels = statsPerTitel(rows).filter(t => t.volume > 0)",
                  filters: CORE_FILTER,
                  transforms: [
                    "topRatio = [...activeTitels].sort((a,b) => b.plaatsingspct - a.plaatsingspct).slice(0, 10)",
                    "topRatioSet = new Set(topRatio.map(t => t.titel)) — hergebruikt door 'extra instroom'-kaart",
                  ],
                  formulas: [{ name: "plaatsingspct", expr: "plaatsingen / bemiddelbaar (per titel)" }],
                  rowCount: topRatio.length,
                },
              },
              {
                title: "Top 10 titels: extra instroom nodig", data: topExtraInstroom, badge: "Inkopen",
                color: "hsl(200,75%,50%)", sortDir: "desc" as const,
                dev: {
                  source: "activeTitels \\ topRatioSet",
                  filters: `${CORE_FILTER}\nExtra: t.plaatsingspct ≥ avgYield · t.volume < topRatioMedVol`,
                  transforms: [
                    "topRatioMedVol = mediaan van topRatio.volume",
                    "avgYield = Σ plaatsingspct / n (over activeTitels)",
                    "Sortering op _potentie descending → slice(0, 10)",
                  ],
                  formulas: [{ name: "_potentie", expr: "plaatsingspct × max(1, topRatioMedVol − volume)" }],
                  rowCount: topExtraInstroom.length,
                },
              },
              {
                title: "Top 10 titels: mogelijk te hoge instroom", data: topTeHoog, badge: "Kritisch",
                color: "hsl(0,70%,55%)", sortDir: "asc" as const,
                dev: {
                  source: "activeTitels",
                  filters: CORE_FILTER,
                  transforms: ["Sortering op plaatsingspct ascending → slice(0, 10)"],
                  notes: ["Bedoeld om overschot in instroom vs yield te signaleren"],
                  rowCount: topTeHoog.length,
                },
              },
            ]).map((section) => (
              <Card key={section.title} className="border border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm">{section.title}</CardTitle>
                    <div className="flex items-center gap-1.5">
                      <Badge style={{ background: section.color, color: "white" }} className="text-[10px]">{section.badge}</Badge>
                      <FullListDialog title={section.title} allTitels={activeTitels} sortDir={section.sortDir} />
                      <DevInfo {...section.dev} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableBody>
                      {section.data.map(t => (
                        <TableRow key={t.titel}>
                          <TableCell className="text-xs font-medium py-2">{t.titel}</TableCell>
                          <TableCell className="text-xs text-right text-muted-foreground py-2">n={t.volume}</TableCell>
                          <TableCell className="text-xs text-right font-semibold py-2 tabular-nums">{pct(t.plaatsingspct, 1)}</TableCell>
                        </TableRow>
                      ))}
                      {section.data.length === 0 && (
                        <TableRow><TableCell className="text-xs text-muted-foreground text-center py-4">Geen titels bij huidige filters</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>


        {/* ═══ 2. TITELS ═══ */}
        <TabsContent value="titels" className="space-y-6">
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">Instroom vs plaatsingskans — 4-kwadranten matrix</CardTitle>
                  <p className="text-xs text-muted-foreground">Elke bubble = genormaliseerde titel. Grootte = aantal plaatsingen. Kleur = kwadrant-advies.</p>
                </div>
                <DevInfo
                  source="scatterData = activeTitels.map(...) uit statsPerTitel(rows)"
                  filters={CORE_FILTER}
                  transforms={[
                    "x = t.volume · y = round(plaatsingspct × 100) · z = 100 + plaatsingen × 8 (bubble-grootte)",
                    "avgVol = Σ volume / n(activeTitels), avgYield = Σ plaatsingspct / n",
                    "Kwadrant q = classify(t, avgVol, avgYield) → {beschermen, extra_inkopen, kritisch, lage_prio}",
                  ]}
                  formulas={[{ name: "classify", expr: "hoogVol = volume ≥ avgVol; hoogYield = plaatsingspct ≥ avgYield" }]}
                  rowCount={scatterData.length}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-3">
                {(["beschermen", "extra_inkopen", "kritisch", "lage_prio"] as Quadrant[]).map(q => (
                  <div key={q} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ background: QUADRANT_COLOR[q] }} />
                    {QUADRANT_LABEL[q]}
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={420}>
                <ScatterChart margin={{ top: 10, right: 40, bottom: 40, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" dataKey="x" name="Instroom"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    label={{ value: "Instroom (kandidaten)", position: "bottom", offset: 0, fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis type="number" dataKey="y" name="Plaatsingskans"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    label={{ value: "Plaatsingskans %", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <ZAxis type="number" dataKey="z" range={[80, 500]} />
                  <ReferenceLine x={avgVol} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <ReferenceLine y={avgYield * 100} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }}
                    content={({ payload }: any) => {
                      if (!payload?.[0]) return null;
                      const p = payload[0].payload;
                      return (
                        <div className="bg-card border border-border rounded p-2 text-xs shadow-lg">
                          <div className="font-semibold">{p.titel}</div>
                          <div>Instroom: {p.volume} · Plaatsingen: {p.plaatsingen}</div>
                          <div>Plaatsingskans: {pct(p.plaatsingspct, 1)}</div>
                          <div className="mt-1 text-[10px]" style={{ color: QUADRANT_COLOR[p.q as Quadrant] }}>
                            → {QUADRANT_LABEL[p.q as Quadrant]}
                          </div>
                        </div>
                      );
                    }} />
                  <Scatter data={scatterData}>
                    {scatterData.map((d, i) => (
                      <Cell key={i} fill={QUADRANT_COLOR[d.q]} fillOpacity={0.8} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Alle titels — analyse</CardTitle>
              <DevInfo
                source="activeTitels = statsPerTitel(rows).filter(t => t.volume > 0)"
                filters={CORE_FILTER}
                transforms={[
                  "Sortering: plaatsingspct descending",
                  "Advies per rij: classify(t, avgVol, avgYield) met dezelfde thresholds als de kwadrant-matrix",
                ]}
                formulas={[
                  { name: "plaatsingspct", expr: "plaatsingen / bemiddelbaar" },
                  { name: "gesprekspct", expr: "gesprekken / bemiddelbaar" },
                  { name: "gemTijdPlaatsing", expr: "Ø dagen tussen datumBinnenkomst en plaatsingsdatum (alleen geplaatst)" },
                ]}
                rowCount={activeTitels.length}
              />
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titel</TableHead>
                    <TableHead className="text-right"><ThInfo label="Ins." id="bem" align="right" icon={UsersRound} /></TableHead>
                    <TableHead className="text-right"><ThInfo label="Kand. met gespr." id="gespr" align="right" icon={MessagesSquare} /></TableHead>
                    <TableHead className="text-right"><ThInfo label="Totaal gespr." id="totaalGespr" align="right" icon={MessagesSquare} /></TableHead>
                    <TableHead className="text-right"><ThInfo label="Plaats." id="plaats" align="right" icon={PartyPopper} /></TableHead>
                    <TableHead className="text-right"><ThInfo label="Plaatsings %" id="plaatsingsPct" align="right" icon={PartyPopper} /></TableHead>
                    <TableHead className="text-right"><ThInfo label="Gesprek %" id="gesprekPct" align="right" icon={MessagesSquare} /></TableHead>
                    <TableHead><ThInfo label="Advies" id="advies" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...activeTitels].sort((a, b) => b.plaatsingspct - a.plaatsingspct).map(t => {
                    const q = classify(t, avgVol, avgYield);
                    return (
                      <TableRow key={t.titel} className="cursor-pointer hover:bg-muted/50" onClick={() => { setTitelDetail(t.titel); setShowTitelConsultants(false); }}>
                        <TableCell className="text-xs font-medium underline-offset-2 hover:underline">{t.titel}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums">{t.bemiddelbaar}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums">{t.gesprekken}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums">{t.totaalGesprekken}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums font-semibold">{t.plaatsingen}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums">{pct(t.plaatsingspct, 1)}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums">{pct(t.gesprekspct, 0)}</TableCell>
                        <TableCell><Badge className="text-[10px]" style={{ background: QUADRANT_COLOR[q], color: "white" }}>{QUADRANT_LABEL[q]}</Badge></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* ─── Titel-detail popup ─── */}
          <Dialog open={!!titelDetail} onOpenChange={(o) => !o && setTitelDetail(null)}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base">{titelDetail} — scores per provincie</DialogTitle>
              </DialogHeader>
              {titelDetailData && (
                <div className="space-y-4">
                  <div className="border border-border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Provincie</TableHead>
                          <TableHead className="text-right">Ins.</TableHead>
                          <TableHead className="text-right">Gespr.</TableHead>
                          <TableHead className="text-right">Plaats.</TableHead>
                          <TableHead className="text-right">Plaatsings %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {titelDetailData.perProv.map(p => (
                          <TableRow key={p.provincie}>
                            <TableCell className="text-xs font-medium">{p.provincie}</TableCell>
                            <TableCell className="text-xs text-right tabular-nums">{p.ins}</TableCell>
                            <TableCell className="text-xs text-right tabular-nums">{p.gesprekken}</TableCell>
                            <TableCell className="text-xs text-right tabular-nums font-semibold">{p.plaatsingen}</TableCell>
                            <TableCell className="text-xs text-right tabular-nums">{pct(p.plaatsingspct, 1)}</TableCell>
                          </TableRow>
                        ))}
                        {titelDetailData.perProv.length === 0 && (
                          <TableRow><TableCell colSpan={5} className="text-xs text-center text-muted-foreground py-4">Geen data</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="border border-border rounded-md">
                    <button
                      type="button"
                      onClick={() => setShowTitelConsultants(v => !v)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-muted/50 transition"
                    >
                      <span className="flex items-center gap-2">
                        {showTitelConsultants ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        Consultants — wie scoort het best op {titelDetail}?
                      </span>
                      <span className="text-muted-foreground">{titelDetailData.perCons.length}</span>
                    </button>
                    {showTitelConsultants && (
                      <div className="border-t border-border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Consultant</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead className="text-right">Ins.</TableHead>
                              <TableHead className="text-right">Gespr.</TableHead>
                              <TableHead className="text-right">Plaats.</TableHead>
                              <TableHead className="text-right">Plaatsings %</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {titelDetailData.perCons.map(c => (
                              <TableRow key={c.consultant}>
                                <TableCell className="text-xs font-medium">{c.consultant}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{c.unit}</TableCell>
                                <TableCell className="text-xs text-right tabular-nums">{c.ins}</TableCell>
                                <TableCell className="text-xs text-right tabular-nums">{c.gesprekken}</TableCell>
                                <TableCell className="text-xs text-right tabular-nums font-semibold">{c.plaatsingen}</TableCell>
                                <TableCell className="text-xs text-right tabular-nums">{pct(c.plaatsingspct, 1)}</TableCell>
                              </TableRow>
                            ))}
                            {titelDetailData.perCons.length === 0 && (
                              <TableRow><TableCell colSpan={6} className="text-xs text-center text-muted-foreground py-4">Geen consultants</TableCell></TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

        </TabsContent>

        {/* ═══ 3. REGIO ═══ */}
        <TabsContent value="regio" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <Card className="border border-border h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">Nederland — plaatsingskans per provincie</CardTitle>
                    <p className="text-xs text-muted-foreground">Klik op een provincie voor details</p>
                  </div>
                  <DevInfo
                    source="statsPerProvincie(rows) uit inkoopYieldData.ts"
                    filters={CORE_FILTER}
                    transforms={[
                      "Kleur-intensiteit = plaatsingspct / max(plaatsingspct)",
                      "Bubble-diameter = 8 + (volume / max(volume)) × 22",
                      "Layout via vaste positie-mapping per provincie in ProvincieKaart",
                    ]}
                    rowCount={provStats.length}
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <ProvincieKaart stats={provStats} onSelect={setProvincieDetail} />
              </CardContent>
            </Card>
            <Card className="border border-border h-full flex flex-col">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Plaatsingen per provincie</CardTitle>
                <DevInfo
                  source="statsPerProvincie(rows)"
                  filters={CORE_FILTER}
                  transforms={["Sortering: plaatsingen descending", "Horizontale BarChart (recharts)"]}
                  rowCount={provStats.length}
                />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[...provStats]
                      .sort((a, b) => b.plaatsingen - a.plaatsingen)
                      .map(p => ({ ...p, plaatsingspctDisplay: +(p.plaatsingspct * 100).toFixed(1) }))}
                    layout="vertical"
                    margin={{ left: 10, right: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis xAxisId="count" type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <XAxis xAxisId="pct" type="number" orientation="top" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${v}%`} />
                    <YAxis type="category" dataKey="provincie" width={110} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <RTooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }}
                      formatter={(value: any, name: string) => {
                        if (name === "plaatsingspctDisplay") return [`${value}%`, "Plaatsingspercentage"];
                        return [value, name];
                      }}
                    />
                    <Bar xAxisId="count" dataKey="plaatsingen" fill="hsl(150,65%,45%)" radius={[0, 4, 4, 0]}>
                      <LabelList dataKey="plaatsingen" position="right" style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    </Bar>
                    <Bar xAxisId="pct" dataKey="plaatsingspctDisplay" fill="hsl(210,75%,50%)" radius={[0, 4, 4, 0]} barSize={8}>
                      <LabelList dataKey="plaatsingspctDisplay" position="right" formatter={(v: number) => `${v}%`} style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Provincie-analyse</CardTitle>
              <DevInfo
                source="statsPerProvincie(rows).filter(p => p.volume > 0)"
                filters={CORE_FILTER}
                transforms={[
                  "Sortering: plaatsingspct descending",
                  "Beste titel per provincie = statsPerTitel(rows[provincie]).sort(plaatsingspct desc)[0]",
                ]}
                formulas={[
                  { name: "Advies", expr: "plaatsingspct > avgYield → 'Opschalen' · < 0.75 × avgYield → 'Herzien' · anders 'Handhaven'" },
                  { name: "Kleur-highlight", expr: "≥1.15×avgYield emerald · ≤0.75×avgYield rose" },
                ]}
                rowCount={provStats.filter(p => p.volume > 0).length}
              />
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provincie</TableHead>
                    <TableHead className="text-right"><ThInfo label="Kand." id="kand" align="right" /></TableHead>
                    <TableHead className="text-right"><ThInfo label="Gespr." id="gespr" align="right" /></TableHead>
                    
                    <TableHead className="text-right"><ThInfo label="Plaats." id="plaats" align="right" /></TableHead>
                    <TableHead className="text-right"><ThInfo label="Conversie %" id="conversiePct" align="right" /></TableHead>
                    <TableHead><ThInfo label="Beste titel" id="besteTitel" /></TableHead>
                    <TableHead><ThInfo label="Advies" id="advies" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const active = provStats.filter(p => p.volume > 0);
                    return active.sort((a, b) => b.plaatsingspct - a.plaatsingspct).map(p => {
                      const inProv = rows.filter(r => r.provincie === p.provincie);
                      const beste = statsPerTitel(inProv).sort((a, b) => b.plaatsingspct - a.plaatsingspct)[0];
                      const advies = p.plaatsingspct > avgYield ? { label: "Opschalen", color: "hsl(150,65%,45%)" }
                        : p.plaatsingspct < avgYield * 0.75 ? { label: "Herzien", color: "hsl(0,70%,55%)" }
                        : { label: "Handhaven", color: "hsl(30,20%,55%)" };
                      const convColor = p.plaatsingspct >= avgYield * 1.15 ? "text-emerald-600 dark:text-emerald-400"
                        : p.plaatsingspct <= avgYield * 0.75 ? "text-rose-600 dark:text-rose-400"
                        : "";
                      return (
                        <TableRow key={p.provincie} className="cursor-pointer hover:bg-muted/50" onClick={() => setProvincieDetail(p.provincie)}>
                          <TableCell className="text-xs font-medium underline-offset-2 hover:underline">{p.provincie}</TableCell>
                          <TableCell className="text-xs text-right tabular-nums">{p.volume}</TableCell>
                          <TableCell className="text-xs text-right tabular-nums">{p.gesprekken}</TableCell>
                          
                          <TableCell className="text-xs text-right tabular-nums font-semibold">{p.plaatsingen}</TableCell>
                          <TableCell className={`text-xs text-right tabular-nums font-semibold ${convColor}`}>{pct(p.plaatsingspct, 1)}</TableCell>
                          <TableCell className="text-xs">{beste?.titel ?? "—"}</TableCell>
                          <TableCell><Badge className="text-[10px]" style={{ background: advies.color, color: "white" }}>{advies.label}</Badge></TableCell>
                        </TableRow>
                      );
                    });
                  })()}

                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ 4. CONSULTANTS ═══ */}
        <TabsContent value="consultant" className="space-y-6">
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">Consultant-performance</CardTitle>
                  <p className="text-xs text-muted-foreground">Klik op een rij om top/slechtste titels, beste regio en beste titel × regio-combinatie te zien.</p>
                </div>
                <DevInfo
                  source="activeConsultants = statsPerConsultant(rows).filter(c => c.volume > 0)"
                  filters={CORE_FILTER}
                  transforms={[
                    "Uitklap: titelsPerConsultant / regiosPerConsultant / combisPerConsultant met minimum-volume 3 (titels/regio's) resp. 2 (combi's)",
                    "besteVoorConsultant → beste titel/regio/combi (rank op yieldPct, combi ook op score)",
                  ]}
                  formulas={[
                    { name: "yieldPct", expr: "geplaatst-count / volume (per titel/regio)" },
                    { name: "combi.score", expr: "yieldPct × ln(1 + volume) — weegt zowel kans als volume" },
                  ]}
                  rowCount={activeConsultants.length}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Consultant</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right"><ThInfo label="Kand." id="kand" align="right" /></TableHead>
                    <TableHead className="text-right"><ThInfo label="Plaats." id="plaats" align="right" /></TableHead>
                    <TableHead className="text-right"><ThInfo label="Plaatsings %" id="plaatsingsPct" align="right" /></TableHead>
                    <TableHead><ThInfo label="Beste titel" id="besteTitel" /></TableHead>
                    <TableHead><ThInfo label="Beste regio" id="besteRegio" /></TableHead>
                    <TableHead><ThInfo label="Beste titel × regio" id="besteCombi" /></TableHead>

                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...activeConsultants].sort((a, b) => b.plaatsingspct - a.plaatsingspct).map(c => (
                    <ConsultantRow
                      key={c.consultant}
                      consultant={c.consultant}
                      businessUnit={c.businessUnit}
                      volume={c.volume}
                      plaatsingen={c.plaatsingen}
                      plaatsingspct={c.plaatsingspct}
                      rows={rows}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>



        {/* ═══ 6. OPPORTUNITY LIST ═══ */}
        <TabsContent value="opps" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KPI label="Aanbevelingen" value={fmt(opportunities.length)} />
            <KPI label="Extra inkopen" value={fmt(opportunities.filter(o => o.type === "inkopen").length)} sub="Titel × regio" />
            <KPI label="Budget verlagen" value={fmt(opportunities.filter(o => o.type === "verlagen").length)} />
            <KPI label="Consultant-acties" value={fmt(opportunities.filter(o => o.type === "consultant").length)} />
            <KPI label="Kanaal-acties" value={fmt(opportunities.filter(o => o.type === "bron").length)} />
          </div>

          <Card className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    Actielijst
                    <Badge variant="secondary" className="text-xs">Concrete acties op prioriteit</Badge>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Prioriteitscore = plaatsingskans × tekort aan instroom × performance × regiofactor
                  </p>
                </div>
                <DevInfo
                  source="buildOpportunities(rows) uit inkoopYieldData.ts"
                  filters={CORE_FILTER}
                  transforms={[
                    "Iterates titel × provincie (n ≥ 3), consultant × titel (n ≥ 4), per provincie, per bron",
                    "Alleen combinaties buiten avg (yield of volume) worden aanbevolen",
                    "Sort: prioriteit descending → slice(0, 30)",
                  ]}
                  formulas={[
                    { name: "extra_inkopen.prioriteit", expr: "plaatsingspct × 100 × (avgVol/12 / max(1, list.len))" },
                    { name: "verlagen.prioriteit", expr: "(1 − plaatsingspct) × 60 × (list.len / (avgVol/12))" },
                    { name: "impact (inkopen)", expr: "(avgVol/12 − list.len) × plaatsingspct" },
                  ]}
                  notes={["avgVol en avgYield hier berekend over statsPerTitel(rows) — dus consistent met de kaarten en scatter."]}
                  rowCount={opportunities.length}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"><ThInfo label="Prio" id="prio" /></TableHead>
                    <TableHead>Aanbeveling</TableHead>
                    <TableHead>Titel</TableHead>
                    <TableHead>Regio</TableHead>
                    <TableHead>Consultant</TableHead>
                    <TableHead className="text-right"><ThInfo label="Huidig" id="huidig" align="right" /></TableHead>
                    <TableHead className="text-right"><ThInfo label="Kans" id="kans" align="right" /></TableHead>
                    <TableHead className="text-right"><ThInfo label="Impact" id="impact" align="right" /></TableHead>
                    <TableHead>Actie</TableHead>
                    <TableHead>Reden</TableHead>

                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opportunities.map(o => {
                    const typeColor: Record<string, string> = {
                      inkopen: "hsl(200,75%,50%)", verlagen: "hsl(0,70%,55%)",
                      consultant: "hsl(260,60%,55%)", regio: "hsl(35,80%,55%)", bron: "hsl(150,65%,45%)",
                    };
                    return (
                      <TableRow key={o.id}>
                        <TableCell>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: typeColor[o.type] }}>
                            {o.prioriteit}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium">{o.aanbeveling}</TableCell>
                        <TableCell className="text-xs">{o.titel}</TableCell>
                        <TableCell className="text-xs">{o.provincie}</TableCell>
                        <TableCell className="text-xs">{o.consultant}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums">{o.huidigeInstroom}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums">{pct(o.plaatsingskans, 0)}</TableCell>
                        <TableCell className="text-xs text-right tabular-nums font-semibold text-primary">+{o.potentiëleImpact}</TableCell>
                        <TableCell className="text-xs">{o.actie}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{o.reden}</TableCell>
                      </TableRow>
                    );
                  })}
                  {opportunities.length === 0 && (
                    <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Geen aanbevelingen bij huidige filters</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Provincie-detail popup ─── */}
        <Dialog open={!!provincieDetail} onOpenChange={(o) => !o && setProvincieDetail(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base">{provincieDetail} — scores per functietitel</DialogTitle>
            </DialogHeader>
            {provincieDetailData && (
              <div className="space-y-4">
                <div className="border border-border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Functietitel</TableHead>
                        <TableHead className="text-right">Ins.</TableHead>
                        <TableHead className="text-right">Gespr.</TableHead>
                        <TableHead className="text-right">Plaats.</TableHead>
                        <TableHead className="text-right">Plaatsings %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {provincieDetailData.perTitel.map(t => (
                        <TableRow key={t.titel}>
                          <TableCell className="text-xs font-medium">{t.titel}</TableCell>
                          <TableCell className="text-xs text-right tabular-nums">{t.ins}</TableCell>
                          <TableCell className="text-xs text-right tabular-nums">{t.gesprekken}</TableCell>
                          <TableCell className="text-xs text-right tabular-nums font-semibold">{t.plaatsingen}</TableCell>
                          <TableCell className="text-xs text-right tabular-nums">{pct(t.plaatsingspct, 1)}</TableCell>
                        </TableRow>
                      ))}
                      {provincieDetailData.perTitel.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-xs text-center text-muted-foreground py-4">Geen data</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="border border-border rounded-md">
                  <button
                    type="button"
                    onClick={() => setShowProvincieConsultants(v => !v)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-muted/50 transition"
                  >
                    <span className="flex items-center gap-2">
                      {showProvincieConsultants ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      Consultants — wie scoort het best in {provincieDetail}?
                    </span>
                    <span className="text-muted-foreground">{provincieDetailData.perCons.length}</span>
                  </button>
                  {showProvincieConsultants && (
                    <div className="border-t border-border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Consultant</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-right">Ins.</TableHead>
                            <TableHead className="text-right">Gespr.</TableHead>
                            <TableHead className="text-right">Plaats.</TableHead>
                            <TableHead className="text-right">Plaatsings %</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {provincieDetailData.perCons.map(c => (
                            <TableRow key={c.consultant}>
                              <TableCell className="text-xs font-medium">{c.consultant}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{c.unit}</TableCell>
                              <TableCell className="text-xs text-right tabular-nums">{c.ins}</TableCell>
                              <TableCell className="text-xs text-right tabular-nums">{c.gesprekken}</TableCell>
                              <TableCell className="text-xs text-right tabular-nums font-semibold">{c.plaatsingen}</TableCell>
                              <TableCell className="text-xs text-right tabular-nums">{pct(c.plaatsingspct, 1)}</TableCell>
                            </TableRow>
                          ))}
                          {provincieDetailData.perCons.length === 0 && (
                            <TableRow><TableCell colSpan={6} className="text-xs text-center text-muted-foreground py-4">Geen consultants</TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Tabs>
    </ConsultantLayout>
  );
}
