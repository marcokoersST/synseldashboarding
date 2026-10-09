import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker-v9";
import { ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/marketing-dashboard/components/ui/card";
import { Switch } from "@/marketing-dashboard/components/ui/switch";
import DeltaCell, { type DeltaMode } from "@/marketing-dashboard/components/marketing/DeltaCell";
import QualityScoreComparison from "@/marketing-dashboard/components/marketing/QualityScoreComparison";
import { aggregateQualityScore } from "@/marketing-dashboard/lib/marketingQuality";
import { JOB_TITLES } from "@/marketing-dashboard/lib/marketingJobTitles";
import { jobTitleShare, matchesMarketingFilters, toggleQuickFilter, isQuickFilter, withoutQuickFilter, quickDimClass, type MarketingFilterRule } from "@/marketing-dashboard/lib/marketingFilters";

const TITLES = JOB_TITLES;

function allocate(total: number, integer: boolean) {
  const sum = TITLES.reduce((s, t) => s + t.weight, 0);
  let cum = 0, prev = 0;
  return TITLES.map((t, i) => {
    cum += t.weight;
    const target = i === TITLES.length - 1 ? total : total * cum / sum;
    const next = integer ? Math.round(target) : target;
    const v = next - prev; prev = next; return v;
  });
}

type SortKey = "name" | "conversions" | "registrations" | "bem" | "cpa" | "cpr" | "quality" | "spend";
const CONV_FACTOR = 0.94;
const eur = (v: number) => v.toLocaleString("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

interface Props {
  totals: { conversions: number; registrations: number; spend?: number };
  dateRange: DateRange;
  compareRange: DateRange | null;
  deltaMode?: DeltaMode;
  /** Overview variant: no spend (and so no spend-derived columns), conversion columns always visible. */
  showSpend?: boolean;
  seed: string;
  filters?: MarketingFilterRule[];
  onFiltersChange?: ((filters: MarketingFilterRule[]) => void) | undefined;
}

export default function JobTitleTable({ totals, dateRange, compareRange, deltaMode = "percent", showSpend = true, seed, filters = [], onFiltersChange }: Props) {
  // Incoming totals are already narrowed by title filters; undo that to allocate the full base,
  // then show titles passing panel rules (the own quick filter only dims rows).
  const fullShare = jobTitleShare(filters) || 1;
  const panelRules = withoutQuickFilter(filters, "functietitel").filter((f) => f.field === "functietitel");
  const [showConversion, setShowConversion] = useState(!showSpend);
  const [sortKey, setSortKey] = useState<SortKey>("conversions");
  const [asc, setAsc] = useState(false);
  const rows = useMemo(() => {
    const conv = allocate(Math.round(totals.conversions / fullShare), true).map(v => v ?? 0);
    const reg = allocate(Math.round(totals.registrations / fullShare), true).map(v => v ?? 0);
    const spend = allocate((totals.spend ?? 0) / fullShare, false).map(v => v ?? 0);
    return TITLES.map((t, i) => ({
      name: t.name, conversions: conv[i] ?? 0, registrations: reg[i] ?? 0, spend: spend[i] ?? 0, qualityScore: t.quality,
      bem: (conv[i] ?? 0) > 0 ? (reg[i] ?? 0) / (conv[i] ?? 1) * 100 : 0,
      cpa: (conv[i] ?? 0) > 0 ? (spend[i] ?? 0) / (conv[i] ?? 1) : 0,
      cpr: (reg[i] ?? 0) > 0 ? (spend[i] ?? 0) / (reg[i] ?? 1) : 0,
    })).filter((r) => matchesMarketingFilters({ functietitel: r.name }, panelRules));
  }, [totals, fullShare, panelRules]);
  const shown = useMemo(() => rows.reduce((a, r) => ({ conversions: a.conversions + r.conversions, registrations: a.registrations + r.registrations, spend: a.spend + r.spend }), { conversions: 0, registrations: 0, spend: 0 }), [rows]);
  const sorted = useMemo(() => [...rows].sort((a, b) => {
    const k = sortKey === "quality" ? "qualityScore" : sortKey;
    const r = k === "name" ? a.name.localeCompare(b.name) : (a[k] as number) - (b[k] as number);
    return asc ? r : -r;
  }), [rows, sortKey, asc]);
  const qualityTotal = aggregateQualityScore(rows) ?? 0;
  const spendTotal = shown.spend;
  const conv = showConversion;
  const withSpendCols = conv && showSpend;
  const cols: { key: SortKey; label: string; show: boolean }[] = [
    { key: "name", label: "Functietitel", show: true },
    { key: "conversions", label: "Conversions", show: true },
    { key: "registrations", label: "Inschrijven", show: true },
    { key: "bem", label: "% Bem.", show: conv },
    { key: "cpa", label: "CPA", show: withSpendCols },
    { key: "cpr", label: "Cost/Inschrijven", show: withSpendCols },
    { key: "quality", label: "Quality score conv.", show: conv },
    { key: "quality", label: "Quality score bem.", show: conv },
    { key: "spend", label: "Spend", show: showSpend },
  ];
  const toggle = (k: SortKey) => { if (k === sortKey) setAsc(!asc); else { setSortKey(k); setAsc(k === "name"); } };
  const dc = (v: number, s: string, format?: "number" | "currency" | "percentage", invert?: boolean) =>
    <DeltaCell value={v} dateRange={dateRange} compareRange={compareRange} seed={`${seed}-${s}`} format={format} invertDelta={invert} deltaMode={deltaMode} />;
  const quality = (v: number, rs: { qualityScore: number; conversions: number }[], foot = false) => {
    const cls = `px-3 py-2.5 tabular-nums${foot ? " bg-muted" : ""}`;
    return <>
      <td className={cls}><QualityScoreComparison value={v} rows={rs} dateRange={dateRange} compareRange={compareRange} factor={CONV_FACTOR} /></td>
      <td className={cls}><QualityScoreComparison value={v} rows={rs} dateRange={dateRange} compareRange={compareRange} /></td>
    </>;
  };
  const totalBem = shown.conversions > 0 ? shown.registrations / shown.conversions * 100 : 0;
  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Per genormaliseerde functietitel</CardTitle>
        {showSpend && <label className="flex items-center gap-2 text-sm text-muted-foreground"><Switch checked={showConversion} onCheckedChange={setShowConversion} />Show conversion</label>}
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[480px] overflow-auto">
          <table className="marketing-table w-full text-sm table-fixed">
            <thead>
              <tr className="border-b">
                {cols.filter(c => c.show).map(c => (
                  <th key={c.label} onClick={() => toggle(c.key)} className="h-11 px-3 text-left font-medium text-muted-foreground cursor-pointer select-none sticky top-0 bg-background z-10">
                    <span className="flex items-center gap-1">{c.label}<ArrowUpDown className={`h-3 w-3 ${sortKey === c.key ? "text-primary" : ""}`} /></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(r => (
                <tr key={r.name} className={`border-b hover:bg-muted/50 ${quickDimClass(filters, "functietitel", r.name)}`}>
                  <td className="px-3 py-2.5 font-medium">{onFiltersChange ? <button type="button" onClick={() => onFiltersChange(toggleQuickFilter(filters, "functietitel", r.name))} aria-pressed={isQuickFilter(filters, "functietitel", r.name)} className={`text-left underline-offset-2 hover:underline ${isQuickFilter(filters, "functietitel", r.name) ? "text-primary underline" : ""}`}>{r.name}</button> : r.name}</td>
                  <td className="px-3 py-2.5 tabular-nums">{dc(r.conversions, `${r.name}-c`)}</td>
                  <td className="px-3 py-2.5 tabular-nums">{dc(r.registrations, `${r.name}-r`)}</td>
                  {conv && <td className="px-3 py-2.5 tabular-nums">{dc(r.bem, `${r.name}-b`, "percentage")}</td>}
                  {withSpendCols && <td className="px-3 py-2.5 tabular-nums">{dc(r.cpa, `${r.name}-cpa`, "currency", true)}</td>}
                  {withSpendCols && <td className="px-3 py-2.5 tabular-nums">{dc(r.cpr, `${r.name}-cpr`, "currency", true)}</td>}
                  {conv && quality(r.qualityScore, [r])}
                  {showSpend && <td className="px-3 py-2.5 tabular-nums">{dc(r.spend, `${r.name}-s`, "currency")}</td>}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted font-semibold sticky bottom-0 z-10">
                <td className="px-3 py-2.5 bg-muted">Totaal</td>
                <td className="px-3 py-2.5 tabular-nums bg-muted">{dc(shown.conversions, "tc")}</td>
                <td className="px-3 py-2.5 tabular-nums bg-muted">{dc(shown.registrations, "tr")}</td>
                {conv && <td className="px-3 py-2.5 tabular-nums bg-muted">{dc(totalBem, "tb", "percentage")}</td>}
                {withSpendCols && <td className="px-3 py-2.5 tabular-nums bg-muted">{shown.conversions > 0 ? eur(spendTotal / shown.conversions) : "—"}</td>}
                {withSpendCols && <td className="px-3 py-2.5 tabular-nums bg-muted">{shown.registrations > 0 ? eur(spendTotal / shown.registrations) : "—"}</td>}
                {conv && quality(qualityTotal, rows, true)}
                {showSpend && <td className="px-3 py-2.5 tabular-nums bg-muted">{dc(spendTotal, "ts", "currency")}</td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
