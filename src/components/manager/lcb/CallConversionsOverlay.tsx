import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Plus, Save, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LCBOverlay } from "./LCBOverlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { myTeamConsultants } from "@/data/managerData";
import { lcbMarketRows, getCandidatesForStep, getDealsForStep, lcbFunnelSteps, type LcbStepKey } from "@/data/lcbMarketData";
import { statusFromRatio } from "@/lib/lcbStatus";

// ─── Field catalogue ──────────────────────────────────────────────────
type FieldKey =
  | LcbStepKey
  | "voorstellen_mail" | "voorstellen_call"
  | "uitnodiging_mail" | "uitnodiging_call"
  | "gesprekken_voltooid"
  | "acquisities_met_intake"
  | "plaatsingen_met_intake";

interface Field { key: FieldKey; label: string }

const BASE_FIELDS: Field[] = lcbFunnelSteps.map((s) => ({ key: s.key as FieldKey, label: s.label }));
const DERIVED_FIELDS: Field[] = [
  { key: "voorstellen_mail", label: "Voorstellen per mail" },
  { key: "voorstellen_call", label: "Voorstellen per call" },
  { key: "uitnodiging_mail", label: "Uitnodigingen per mail" },
  { key: "uitnodiging_call", label: "Uitnodigingen per call" },
  { key: "gesprekken_voltooid", label: "Gesprekken voltooid" },
  { key: "acquisities_met_intake", label: "Acquisities met intake" },
  { key: "plaatsingen_met_intake", label: "Plaatsingen met intake" },
];
const ALL_FIELDS: Field[] = [...BASE_FIELDS, ...DERIVED_FIELDS];
const labelOf = (k: FieldKey) => ALL_FIELDS.find((f) => f.key === k)?.label ?? k;

// ─── Value resolver per consultant ────────────────────────────────────
function resolveField(consultantId: number, key: FieldKey): number {
  const row = lcbMarketRows.find((r) => r.consultantId === consultantId);
  if (!row) return 0;
  if (BASE_FIELDS.some((f) => f.key === key)) return (row as unknown as Record<string, number>)[key] ?? 0;
  // derived deterministic splits seeded by consultantId
  const seed = (consultantId * 13 + key.length * 7) % 100 / 100;
  switch (key) {
    case "voorstellen_mail": return Math.round(row.voorstellen * (0.55 + seed * 0.3));
    case "voorstellen_call": return Math.round(row.voorstellen * (0.45 - seed * 0.3));
    case "uitnodiging_mail": return Math.round(row.uitnodiging * (0.5 + seed * 0.3));
    case "uitnodiging_call": return Math.round(row.uitnodiging * (0.5 - seed * 0.3));
    case "gesprekken_voltooid": return Math.round(row.gesprekken * (0.7 + seed * 0.2));
    case "acquisities_met_intake": return Math.round(row.acquisities * (0.4 + seed * 0.3));
    case "plaatsingen_met_intake": return Math.round(row.plaatsingen * (0.6 + seed * 0.3));
    default: return 0;
  }
}

// ─── Standard conversions ─────────────────────────────────────────────
interface StdConv { id: string; label: string; base: FieldKey; result: FieldKey }
const STANDARD_CONVERSIONS: StdConv[] = [
  { id: "toe-vs-insch",   label: "Toegewezen vs Inschrijvingen",      base: "toegewezen",     result: "inschrijvingen" },
  { id: "insch-vs-acq",   label: "Inschrijvingen vs Acquisities",     base: "inschrijvingen", result: "acquisities" },
  { id: "insch-vs-intk",  label: "Inschrijvingen vs Intakes",         base: "inschrijvingen", result: "intakes" },
  { id: "voorst-vs-uitn", label: "Voorstellen vs Uitnodigingen",      base: "voorstellen",    result: "uitnodiging" },
  { id: "uitn-vs-gesp",   label: "Uitnodigingen vs Gesprekken",       base: "uitnodiging",    result: "gesprekken" },
  { id: "gesp-vs-vervolg",label: "Gesprekken vs Vervolggesprekken",   base: "gesprekken",     result: "vervolg" },
  { id: "voorst-vs-plts", label: "Voorstellen vs Plaatsingen",        base: "voorstellen",    result: "plaatsingen" },
];

interface CustomConv { id: string; base: FieldKey; result: FieldKey; saved?: boolean }

interface Props {
  open: boolean;
  consultantId: number | null;
  initialConversion?: string | null;
  period?: string;
  comparisonPeriod?: string | null;
  onClose: () => void;
}

const STORAGE_KEY = "lcb.customConversions";

export function CallConversionsOverlay({ open, consultantId, initialConversion, period, comparisonPeriod, onClose }: Props) {
  const consultant = consultantId != null ? myTeamConsultants.find((c) => c.id === consultantId) : null;
  const [search, setSearch] = useState("");
  const [selectedConv, setSelectedConv] = useState<string | null>(initialConversion ?? null);
  const [baseField, setBaseField] = useState<FieldKey>("voorstellen_call");
  const [resultField, setResultField] = useState<FieldKey>("uitnodiging_call");
  const [customs, setCustoms] = useState<CustomConv[]>([]);
  const [ephemeralCustom, setEphemeralCustom] = useState<CustomConv | null>(null);

  // Load saved customs on open
  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCustoms(JSON.parse(raw));
    } catch { /* ignore */ }
    setSelectedConv(initialConversion ?? null);
    setEphemeralCustom(null);
  }, [open, initialConversion]);

  const persist = (next: CustomConv[]) => {
    setCustoms(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  if (consultantId == null || !consultant) return null;

  const visibleStandard = STANDARD_CONVERSIONS.filter((c) =>
    !search.trim() || c.label.toLowerCase().includes(search.toLowerCase()),
  );

  const allCustom = [
    ...(ephemeralCustom ? [ephemeralCustom] : []),
    ...customs,
  ];

  const selected = (() => {
    if (!selectedConv) return null;
    const std = STANDARD_CONVERSIONS.find((c) => c.id === selectedConv);
    if (std) return { ...std, isCustom: false };
    const cu = allCustom.find((c) => c.id === selectedConv);
    if (cu) return { id: cu.id, label: `${labelOf(cu.result)} / ${labelOf(cu.base)}`, base: cu.base, result: cu.result, isCustom: true };
    return null;
  })();

  return (
    <LCBOverlay
      open={open}
      onClose={onClose}
      size="wide"
      breadcrumbs={["Candidate Market", consultant.name, "Call Conversions"]}
      title="Call Conversions"
      subtitle={`${consultant.name} · ${consultant.unit}`}
    >
      {/* Top strip */}
      <section className="mb-4 rounded-lg border border-border bg-card/40 px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
        <Pair label="Consultant" value={consultant.name} />
        <Pair label="Unit" value={consultant.unit} />
        <Pair label="Periode" value={period ?? "Rolling week"} />
        {comparisonPeriod && <Pair label="Vergelijking" value={comparisonPeriod} />}
        <div className="ml-auto">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek conversie…"
            className="h-7 w-[220px] text-xs"
          />
        </div>
      </section>

      {/* Standard conversions */}
      <section className="mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Standaard conversies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {visibleStandard.map((c) => (
            <ConversionCard
              key={c.id}
              consultantId={consultantId}
              conv={c}
              selected={selectedConv === c.id}
              onSelect={() => setSelectedConv(selectedConv === c.id ? null : c.id)}
            />
          ))}
          {allCustom.map((c) => (
            <ConversionCard
              key={c.id}
              consultantId={consultantId}
              conv={{ id: c.id, label: `${labelOf(c.result)} / ${labelOf(c.base)}`, base: c.base, result: c.result }}
              selected={selectedConv === c.id}
              onSelect={() => setSelectedConv(selectedConv === c.id ? null : c.id)}
              isCustom
              saved={c.saved}
              onRemove={() => {
                if (c.saved) persist(customs.filter((x) => x.id !== c.id));
                else setEphemeralCustom(null);
                if (selectedConv === c.id) setSelectedConv(null);
              }}
            />
          ))}
        </div>
      </section>

      {/* Custom builder */}
      <section className="mb-5 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Custom conversie bouwen</h3>
          <span className="text-[10px] text-muted-foreground">Resultaat (B) ÷ Basis (A) = conversie</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-3 items-end">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Basis (A · noemer)</div>
            <FieldSelect value={baseField} onChange={setBaseField} />
          </div>
          <div className="text-muted-foreground pb-2 hidden md:block">÷</div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Resultaat (B · teller)</div>
            <FieldSelect value={resultField} onChange={setResultField} />
          </div>
          <div className="flex gap-1.5 pb-0.5">
            <Button
              size="sm" variant="outline" className="h-8 text-xs gap-1"
              onClick={() => {
                const id = `cust-${baseField}-${resultField}-${Date.now()}`;
                setEphemeralCustom({ id, base: baseField, result: resultField });
                setSelectedConv(id);
              }}
            >
              <Plus className="h-3 w-3" /> Apply
            </Button>
            <Button
              size="sm" className="h-8 text-xs gap-1"
              onClick={() => {
                const id = `saved-${baseField}-${resultField}`;
                if (customs.some((c) => c.id === id)) return;
                const next = [...customs, { id, base: baseField, result: resultField, saved: true }];
                persist(next);
                setSelectedConv(id);
              }}
            >
              <Save className="h-3 w-3" /> Save view
            </Button>
          </div>
        </div>
        <PreviewFormula consultantId={consultantId} base={baseField} result={resultField} />
      </section>

      {/* Detail panel */}
      {selected && (
        <ConversionDetail consultantId={consultantId} conv={selected} onClose={() => setSelectedConv(null)} />
      )}
    </LCBOverlay>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────
function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

function FieldSelect({ value, onChange }: { value: FieldKey; onChange: (v: FieldKey) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as FieldKey)}>
      <SelectTrigger className="h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 py-1 text-[10px] uppercase text-muted-foreground">Funnel</div>
        {BASE_FIELDS.map((f) => (
          <SelectItem key={f.key} value={f.key} className="text-xs">{f.label}</SelectItem>
        ))}
        <div className="px-2 py-1 text-[10px] uppercase text-muted-foreground border-t border-border mt-1">Afgeleid</div>
        {DERIVED_FIELDS.map((f) => (
          <SelectItem key={f.key} value={f.key} className="text-xs">{f.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function calcRatio(base: number, result: number): number | null {
  if (base <= 0) return null;
  return (result / base) * 100;
}

function ConversionCard({
  consultantId, conv, selected, onSelect, isCustom, saved, onRemove,
}: {
  consultantId: number;
  conv: { id: string; label: string; base: FieldKey; result: FieldKey };
  selected: boolean;
  onSelect: () => void;
  isCustom?: boolean;
  saved?: boolean;
  onRemove?: () => void;
}) {
  const baseVal = resolveField(consultantId, conv.base);
  const resVal = resolveField(consultantId, conv.result);
  const pct = calcRatio(baseVal, resVal);
  // mock comparison delta — deterministic per id
  const seed = (conv.id.length * 7 + consultantId) % 20;
  const delta = seed - 10; // -10..+9 pp
  const ratio = pct != null ? (pct / 100) / 0.4 : 1; // benchmark ~40%
  const status = statusFromRatio(ratio);
  const statusDot = status === "clean" ? "bg-emerald-500" : status === "attention" ? "bg-amber-500" : "bg-red-500";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative text-left rounded-lg border bg-card px-3 py-2.5 transition-colors",
        selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30",
      )}
    >
      {(isCustom && onRemove) && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-1.5 right-1.5 h-5 w-5 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted"
          title={saved ? "Verwijder opgeslagen view" : "Sluit custom conversie"}
        >
          {saved ? <Trash2 className="h-3 w-3" /> : <X className="h-3 w-3" />}
        </button>
      )}
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className={cn("h-1.5 w-1.5 rounded-full", statusDot)} />
        <span className="text-[11px] font-semibold text-foreground truncate">{conv.label}</span>
        {isCustom && (
          <span className={cn(
            "ml-auto text-[9px] uppercase tracking-wider px-1.5 py-0 rounded-full border",
            saved ? "border-primary/40 text-primary bg-primary/5" : "border-border text-muted-foreground bg-muted",
          )}>{saved ? "Saved" : "Custom"}</span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold tabular-nums">{pct != null ? `${pct.toFixed(1)}%` : "—"}</span>
        <span className={cn(
          "text-[10px] tabular-nums font-medium",
          delta > 0 ? "text-emerald-600 dark:text-emerald-400" : delta < 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground",
        )}>
          {delta > 0 ? "+" : ""}{delta} pp
        </span>
      </div>
      <div className="text-[10px] text-muted-foreground mt-1 tabular-nums">
        {resVal} {labelOf(conv.result)} / {baseVal} {labelOf(conv.base)}
      </div>
    </button>
  );
}

function PreviewFormula({ consultantId, base, result }: { consultantId: number; base: FieldKey; result: FieldKey }) {
  const a = resolveField(consultantId, base);
  const b = resolveField(consultantId, result);
  const pct = calcRatio(a, b);
  return (
    <div className="mt-3 rounded-md border border-border bg-card px-3 py-2 grid grid-cols-[1fr_auto_1fr_auto_auto] items-center gap-3 text-xs">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">B · teller</div>
        <div className="font-medium tabular-nums">{labelOf(result)} <span className="text-muted-foreground">({b})</span></div>
      </div>
      <span className="text-muted-foreground text-lg leading-none">÷</span>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">A · noemer</div>
        <div className="font-medium tabular-nums">{labelOf(base)} <span className="text-muted-foreground">({a})</span></div>
      </div>
      <span className="text-muted-foreground text-lg leading-none">=</span>
      <div className="text-lg font-bold tabular-nums text-primary">{pct != null ? `${pct.toFixed(1)}%` : "—"}</div>
    </div>
  );
}

// ─── Detail: underlying records ───────────────────────────────────────
function ConversionDetail({
  consultantId, conv, onClose,
}: {
  consultantId: number;
  conv: { id: string; label: string; base: FieldKey; result: FieldKey; isCustom?: boolean };
  onClose: () => void;
}) {
  // Pick the underlying entity based on the result field
  const rows = useMemo(() => {
    const dealStep = stepKeyForField(conv.result) ?? stepKeyForField(conv.base);
    if (!dealStep) return { kind: "candidate" as const, items: [] as ReturnType<typeof getCandidatesForStep> };
    const stepDef = lcbFunnelSteps.find((s) => s.key === dealStep);
    if (stepDef?.entity === "deal") return buildDealRecords(consultantId, dealStep);
    return buildCandidateRecords(consultantId, dealStep);
  }, [consultantId, conv.base, conv.result]);

  return (
    <section className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/40">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Onderliggende records</div>
          <div className="text-sm font-semibold">{conv.label}</div>
        </div>
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead className="bg-muted/30">
            <tr className="text-left">
              {rows.kind === "deal" ? (
                <>
                  <Th>Deal</Th><Th>Deal ID</Th><Th>Kandidaat</Th><Th>Kand. ID</Th><Th>Opdrachtgever</Th>
                  <Th>Methode</Th><Th>Resultaat</Th><Th>Datum</Th><Th>Tijd</Th><Th>CRM</Th>
                </>
              ) : (
                <>
                  <Th>Kandidaat</Th><Th>Kand. ID</Th><Th>Cat.</Th><Th>Status</Th>
                  <Th>Datum</Th><Th>Tijd</Th><Th>CRM</Th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.items.map((r, i) => (
              <tr key={i} className="border-t border-border hover:bg-muted/20">
                {rows.kind === "deal" ? (
                  <>
                    <td className="px-2 py-1.5 font-medium whitespace-nowrap truncate max-w-[280px]">{r.dealName}</td>
                    <td className="px-2 py-1.5 tabular-nums text-muted-foreground">{r.dealId}</td>
                    <td className="px-2 py-1.5">{r.candidateName}</td>
                    <td className="px-2 py-1.5 tabular-nums text-muted-foreground">{r.candidateId}</td>
                    <td className="px-2 py-1.5">{r.opdrachtgeverName}</td>
                    <td className="px-2 py-1.5">
                      <span className="inline-flex items-center rounded-full border border-border bg-muted px-1.5 py-0 text-[10px]">{r.method}</span>
                    </td>
                    <td className="px-2 py-1.5">
                      <span className={cn(
                        "inline-flex items-center rounded-full border px-1.5 py-0 text-[10px]",
                        r.ledToNext ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                    : "border-border bg-muted text-muted-foreground",
                      )}>
                        {r.ledToNext ? "Ja" : "Nee"}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{r.date}</td>
                    <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{r.time}</td>
                    <td className="px-2 py-1.5">
                      <a href={`https://app.recruitcrm.io/v1/deal/${r.dealId}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary inline-flex">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-2 py-1.5 font-medium">{r.name}</td>
                    <td className="px-2 py-1.5 tabular-nums text-muted-foreground">{r.id}</td>
                    <td className="px-2 py-1.5">
                      <span className="inline-flex items-center rounded-full border border-border bg-muted px-1.5 py-0 text-[10px]">{r.category}</span>
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground">{r.status}</td>
                    <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{r.lastUpdatedDate}</td>
                    <td className="px-2 py-1.5 text-muted-foreground tabular-nums">{r.lastUpdatedTime}</td>
                    <td className="px-2 py-1.5">
                      <a href={`https://app.recruitcrm.io/v1/candidate/${r.id}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary inline-flex">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {rows.items.length === 0 && (
              <tr><td colSpan={10} className="px-2 py-6 text-center text-muted-foreground">Geen records.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-2 py-1.5 font-medium text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap text-left">{children}</th>;
}

function stepKeyForField(key: FieldKey): LcbStepKey | null {
  const base = lcbFunnelSteps.find((s) => s.key === key);
  if (base) return base.key;
  if (key === "voorstellen_mail" || key === "voorstellen_call") return "voorstellen";
  if (key === "uitnodiging_mail" || key === "uitnodiging_call") return "uitnodiging";
  if (key === "gesprekken_voltooid") return "gesprekken";
  if (key === "acquisities_met_intake") return "acquisities";
  if (key === "plaatsingen_met_intake") return "plaatsingen";
  return null;
}

function buildDealRecords(consultantId: number, step: LcbStepKey) {
  const deals = getDealsForStep(consultantId, step).slice(0, 12);
  return {
    kind: "deal" as const,
    items: deals.map((d, i) => ({
      ...d,
      method: i % 3 === 0 ? "Call" : "Mail",
      ledToNext: ((d.dealId.length + i) % 3) !== 0,
    })),
  };
}

function buildCandidateRecords(consultantId: number, step: LcbStepKey) {
  const cands = getCandidatesForStep(consultantId, step).slice(0, 12);
  return { kind: "candidate" as const, items: cands };
}

// Silence unused import warning
void ArrowRight;
