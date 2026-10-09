import JobTitleTable from "@/marketing-dashboard/components/marketing/JobTitleTable";
import KpiIcon from "@/marketing-dashboard/components/marketing/KpiIcon";
import KpiQualityBadge from "@/marketing-dashboard/components/marketing/KpiQualityBadge";
import QualityScoreComparison from "@/marketing-dashboard/components/marketing/QualityScoreComparison";
import { aggregateQualityScore } from "@/marketing-dashboard/lib/marketingQuality";
import React, { useMemo, useState, useCallback } from "react";
import MarketingTrendChart from "@/marketing-dashboard/components/marketing/MarketingTrendChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/marketing-dashboard/components/ui/card";
import { Switch } from "@/marketing-dashboard/components/ui/switch";
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import MarketingGroupChart from "@/marketing-dashboard/components/marketing/MarketingGroupChart";
import { Button } from "@/marketing-dashboard/components/ui/button";
import { getCompareDisplayText, getComparisonValue } from "@/marketing-dashboard/lib/marketingCompare";
import DeltaCell from "@/marketing-dashboard/components/marketing/DeltaCell";
import type { DeltaMode } from "@/marketing-dashboard/components/marketing/DeltaCell";
import { jobboardData, aggregateByUnit, aggregateByFunctiegroep, totals as calcTotals, formatCurrency, deltaPercent } from "@/marketing-dashboard/data/marketingHubData";
import type { DateRange } from "react-day-picker-v9";
import EditableSpendCell, { INDEED_DISCOUNT_INFO } from "@/marketing-dashboard/components/marketing/EditableSpendCell";
import { filterMarketingRows, type MarketingFilterRule , toggleQuickFilter, isQuickFilter, withoutQuickFilter, quickFilterValues, quickDimClass } from "@/marketing-dashboard/lib/marketingFilters";
import { calculateManualSpend, type ManualSpendSetting } from "@/marketing-dashboard/lib/manualSpend";

interface Props {
  dateRange: DateRange;
  compareRange: DateRange | null;
  deltaMode?: DeltaMode;
  filters: MarketingFilterRule[];
  onFiltersChange?: (filters: MarketingFilterRule[]) => void;
}

type SortKey = "qualityScore" | "name" | "conversions" | "registrations" | "spend" | "cpr";


const JobboardsTab = ({ dateRange, compareRange, deltaMode = "percent", filters, onFiltersChange }: Props) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("registrations");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showConversion, setShowConversion] = useState(false);
  const [chartView, setChartView] = useState<"unit" | "functiegroep">("unit");
  const [manualSpends, setManualSpends] = useState<Record<string, ManualSpendSetting>>({});
  const filteredData = useMemo(() => filterMarketingRows(jobboardData, filters, (row) => ({
    unit: row.unit, functiegroep: row.category, bron: row.board, campagne: row.category,
  })), [filters]);
  const tableData = useMemo(() => filterMarketingRows(jobboardData, withoutQuickFilter(filters, "bron"), (row) => ({
    unit: row.unit, functiegroep: row.category, bron: row.board, campagne: row.category,
  })), [filters]);

  const handleSaveSpend = useCallback((key: string, value: ManualSpendSetting) => {
    setManualSpends(prev => ({ ...prev, [key]: value }));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof jobboardData>();
    for (const row of tableData) {
      const arr = map.get(row.board) || [];
      arr.push(row);
      map.set(row.board, arr);
    }
    const parents = Array.from(map.entries()).map(([board, children]) => ({
      board,
      conversions: children.reduce((s, c) => s + c.conversions, 0),
      registrations: children.reduce((s, c) => s + c.registrations, 0),
      spend: children.reduce((s, c) => s + c.spend, 0),
      qualityScore: aggregateQualityScore(children),
      cpr: 0,
      children,
    }));
    parents.forEach(p => { p.cpr = p.registrations > 0 ? p.spend / p.registrations : 0; });
    return parents.sort((a, b) => {
      const av = sortKey === "name" ? a.board : a[sortKey] ?? 0;
      const bv = sortKey === "name" ? b.board : b[sortKey] ?? 0;
      if (typeof av === "string" && typeof bv === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [tableData, sortKey, sortDir]);

  const grand = useMemo(() => calcTotals(filteredData), [filteredData]);
  const unitChart = useMemo(() => aggregateByUnit(filterMarketingRows(jobboardData, withoutQuickFilter(filters, "unit"), (row) => ({
    unit: row.unit, functiegroep: row.category, bron: row.board, campagne: row.category,
  }))), [filters]);
  const fgChart = useMemo(() => aggregateByFunctiegroep(filterMarketingRows(jobboardData, withoutQuickFilter(filters, "functiegroep"), (row) => ({
    unit: row.unit, functiegroep: row.category, bron: row.board, campagne: row.category,
  }))), [filters]);
  const grandCpr = grand.registrations > 0 ? grand.spend / grand.registrations : 0;
  const grandCpc = grand.conversions > 0 ? grand.spend / grand.conversions : 0;
  const compareText = getCompareDisplayText(compareRange);

  const kpis = useMemo(() => {
    const prev = {
      conversions: getComparisonValue(grand.conversions, { dateRange, compareRange, seed: "jobboards-conversions" }),
      registrations: getComparisonValue(grand.registrations, { dateRange, compareRange, seed: "jobboards-registrations" }),
      spend: getComparisonValue(grand.spend, { dateRange, compareRange, seed: "jobboards-spend" }),
    };
    const prevCpr = prev.registrations > 0 ? prev.spend / prev.registrations : 0;
    const items: { label: string; value: number; prevValue: number; delta: number | null; format?: string; invertDelta?: boolean }[] = [
      { label: "Conversions", value: grand.conversions, prevValue: prev.conversions, delta: deltaPercent(grand.conversions, prev.conversions) },
      { label: "Inschrijven", value: grand.registrations, prevValue: prev.registrations, delta: deltaPercent(grand.registrations, prev.registrations) },
      { label: "Cost per Inschrijving", value: grandCpr, prevValue: prevCpr, delta: deltaPercent(grandCpr, prevCpr), format: "currency", invertDelta: true },
    ];
    return items;
  }, [dateRange, compareRange, grand, grandCpr]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const toggle = (board: string) => {
    setExpanded(prev => { const n = new Set(prev); n.has(board) ? n.delete(board) : n.add(board); return n; });
  };

  const colHeaders: { key: SortKey; label: string; show: boolean }[] = [
    { key: "name", label: "Bron / Campaign", show: true },
    { key: "conversions", label: "Conversions", show: true },
    { key: "registrations", label: "Inschrijven", show: true },
    { key: "registrations", label: "% Bem.", show: showConversion },
    { key: "cpr", label: "CPA", show: showConversion },
    { key: "cpr", label: "Cost/Inschrijven.", show: showConversion },
    { key: "qualityScore", label: "Quality score conv.", show: showConversion },
    { key: "qualityScore", label: "Quality score bem.", show: showConversion },
    { key: "spend", label: "Spend", show: true },
  ];
  const visCols = colHeaders.filter(c => c.show);

  const dc = (value: number, seed: string, format?: "number" | "currency" | "percentage", invertDelta?: boolean, previousValue?: number) => (
    <DeltaCell value={value} dateRange={dateRange} compareRange={compareRange} seed={seed} format={format} invertDelta={invertDelta} deltaMode={deltaMode} previousValue={previousValue} />
  );

  const prevBemPct = (conversions: number, registrations: number, convSeed: string, regSeed: string) => {
    const prevConv = getComparisonValue(conversions, { dateRange, compareRange, seed: convSeed });
    const prevReg = getComparisonValue(registrations, { dateRange, compareRange, seed: regSeed });
    return prevConv > 0 ? (prevReg / prevConv) * 100 : 0;
  };

  const chartData = chartView === "unit" ? unitChart : fgChart;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const isPos = kpi.invertDelta ? (kpi.delta !== null && kpi.delta < 0) : (kpi.delta !== null && kpi.delta > 0);
          const ratio = kpi.prevValue > 0 ? Math.min((kpi.value / kpi.prevValue) * 100, 150) : 100;
          const ratioLabel = kpi.prevValue > 0 ? Math.round((kpi.value / kpi.prevValue) * 100) : 100;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-5">
                <div className="mb-1 flex min-h-[52px] items-start justify-between gap-3">
                  <KpiIcon label={kpi.label} title={kpi.label} />
                  <KpiQualityBadge label={kpi.label} rows={filteredData} dateRange={dateRange} compareRange={compareRange} />
                </div>

                <p className="text-2xl font-bold">{kpi.format === "currency" ? formatCurrency(Math.round(kpi.value)) : kpi.value.toLocaleString("nl-NL")}</p>
                {kpi.delta !== null && (
                  <div className={`flex items-center gap-1 mt-1 text-xs ${isPos ? "text-emerald-600" : "text-red-500"}`}>
                    {isPos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{kpi.delta > 0 ? "+" : ""}{kpi.delta.toFixed(1)}%</span>
                    <span className="text-muted-foreground ml-1">{compareText}</span>
                  </div>
                )}
                <div className="mt-2">
                  <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isPos ? "bg-emerald-500" : "bg-red-400"}`}
                      style={{ width: `${Math.min(ratio / 1.5 * 100 / 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{ratioLabel}% van vorige week</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <MarketingTrendChart dateRange={dateRange} compareRange={compareRange} qualityRows={filteredData} totals={grand} />

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Jobboards / Bron</CardTitle>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <Switch checked={showConversion} onCheckedChange={setShowConversion} />
            Show conversion
          </label>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[480px] overflow-auto">
            <table className={`marketing-table w-full caption-bottom text-sm table-fixed ${showConversion ? "min-w-[1220px]" : ""}`}>
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors">
                  {visCols.map((col, i) => (
                    <th key={col.label} className="h-11 px-3 text-left align-middle font-medium text-muted-foreground cursor-pointer select-none sticky top-0 bg-background z-10" onClick={() => toggleSort(col.key)}>
                      <div className="flex items-center gap-1">
                        {col.label}
                        <ArrowUpDown className={`h-3 w-3 ${sortKey === col.key ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {grouped.map((parent) => {
                  const isOpen = expanded.has(parent.board);
                  const cpr = parent.registrations > 0 ? parent.spend / parent.registrations : 0;
                  const cpc = parent.conversions > 0 ? parent.spend / parent.conversions : 0;
                  const bemPct = parent.conversions > 0 ? (parent.registrations / parent.conversions) * 100 : 0;
                  const parentSpendMissing = parent.spend === 0 && manualSpends[parent.board] === undefined;
                  const parentDisplayedSpend = calculateManualSpend(manualSpends[parent.board], dateRange) ?? parent.spend;
                  return (
                    <React.Fragment key={parent.board}>
                      <tr className={`${quickDimClass(filters, "bron", parent.board)} border-b transition-colors cursor-pointer hover:bg-muted/50`} onClick={() => toggle(parent.board)}>
                        <td className="px-3 py-2.5 align-middle font-semibold">
                          <div className="flex items-center gap-1">
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <button type="button" onClick={(e) => { e.stopPropagation(); onFiltersChange?.(toggleQuickFilter(filters, "bron", parent.board)); }} aria-pressed={isQuickFilter(filters, "bron", parent.board)} className={`text-left underline-offset-2 hover:underline ${isQuickFilter(filters, "bron", parent.board) ? "text-primary underline" : ""}`}>{parent.board}</button>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 align-middle font-semibold">{dc(parent.conversions, `jb-${parent.board}-conv`)}</td>
                        <td className="px-3 py-2.5 align-middle font-semibold">{dc(parent.registrations, `jb-${parent.board}-reg`)}</td>
                        {showConversion && <td className="px-3 py-2.5 align-middle font-semibold">{dc(bemPct, `jb-${parent.board}-bem`, "percentage", false, prevBemPct(parent.conversions, parent.registrations, `jb-${parent.board}-conv`, `jb-${parent.board}-reg`))}</td>}
                        {showConversion && <td className="px-3 py-2.5 align-middle font-semibold">{parentSpendMissing ? <span className="text-red-500 text-xs font-medium">—</span> : dc(cpr, `jb-${parent.board}-cpr`, "currency", true)}</td>}
                        {showConversion && <td className="px-3 py-2.5 align-middle font-semibold">{parentSpendMissing ? <span className="text-red-500 text-xs font-medium">—</span> : dc(cpc, `jb-${parent.board}-cpc`, "currency", true)}</td>}
                        {showConversion && <td className="px-3 py-2.5 align-middle font-semibold tabular-nums" data-quality-score-conv={parent.qualityScore}><QualityScoreComparison value={parent.qualityScore ?? 0} rows={parent.children} dateRange={dateRange} compareRange={compareRange} factor={0.94} /></td>}
                        {showConversion && <td className="px-3 py-2.5 align-middle font-semibold tabular-nums" data-quality-score={parent.qualityScore}><QualityScoreComparison value={parent.qualityScore ?? 0} rows={parent.children} dateRange={dateRange} compareRange={compareRange} /></td>}
                        <td className="px-3 py-2.5 align-middle font-semibold">
                          <EditableSpendCell
                            spend={parent.spend}
                            manualSpend={manualSpends[parent.board]}
                            dateRange={dateRange}
                            onSave={(v) => handleSaveSpend(parent.board, v)}
                            info={parent.board === "Indeed" ? INDEED_DISCOUNT_INFO : undefined}
                          >
                            {dc(parentDisplayedSpend, `jb-${parent.board}-spend`, "currency")}
                          </EditableSpendCell>
                        </td>
                      </tr>
                      {isOpen && parent.children.map((child) => {
                        const childCpr = child.registrations > 0 ? child.spend / child.registrations : 0;
                        const childCpc = child.conversions > 0 ? child.spend / child.conversions : 0;
                        const childBemPct = child.conversions > 0 ? (child.registrations / child.conversions) * 100 : 0;
                        const childKey = `${parent.board}-${child.category}`;
                        const childSpendMissing = child.spend === 0 && manualSpends[childKey] === undefined;
                        const childDisplayedSpend = calculateManualSpend(manualSpends[childKey], dateRange) ?? child.spend;
                        return (
                          <tr key={childKey} className="border-b transition-colors bg-muted/20">
                            <td className="px-3 py-2.5 pl-10 align-middle text-muted-foreground">{child.category}</td>
                            <td className="px-3 py-2.5 align-middle">{dc(child.conversions, `jb-${parent.board}-${child.category}-conv`)}</td>
                            <td className="px-3 py-2.5 align-middle">{dc(child.registrations, `jb-${parent.board}-${child.category}-reg`)}</td>
                            {showConversion && <td className="px-3 py-2.5 align-middle">{dc(childBemPct, `jb-${parent.board}-${child.category}-bem`, "percentage", false, prevBemPct(child.conversions, child.registrations, `jb-${parent.board}-${child.category}-conv`, `jb-${parent.board}-${child.category}-reg`))}</td>}
                            {showConversion && <td className="px-3 py-2.5 align-middle">{childSpendMissing ? <span className="text-red-500 text-xs font-medium">—</span> : dc(childCpr, `jb-${parent.board}-${child.category}-cpr`, "currency", true)}</td>}
                            {showConversion && <td className="px-3 py-2.5 align-middle">{childSpendMissing ? <span className="text-red-500 text-xs font-medium">—</span> : dc(childCpc, `jb-${parent.board}-${child.category}-cpc`, "currency", true)}</td>}
                            {showConversion && <td className="px-3 py-2.5 align-middle tabular-nums" data-quality-score-conv={child.qualityScore}><QualityScoreComparison value={child.qualityScore ?? 0} rows={[child]} dateRange={dateRange} compareRange={compareRange} factor={0.94} /></td>}
                            {showConversion && <td className="px-3 py-2.5 align-middle tabular-nums" data-quality-score={child.qualityScore}><QualityScoreComparison value={child.qualityScore ?? 0} rows={[child]} dateRange={dateRange} compareRange={compareRange} /></td>}
                            <td className="px-3 py-2.5 align-middle">
                              <EditableSpendCell
                                spend={child.spend}
                                manualSpend={manualSpends[childKey]}
                                dateRange={dateRange}
                                onSave={(v) => handleSaveSpend(childKey, v)}
                              >
                                {dc(childDisplayedSpend, `jb-${parent.board}-${child.category}-spend`, "currency")}
                              </EditableSpendCell>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t bg-muted overflow-auto">
            <table className={`marketing-table w-full text-sm table-fixed ${showConversion ? "min-w-[1220px]" : ""}`}>
              <tbody>
                <tr className="font-semibold">
                  <td className="px-3 py-2.5">Totaal</td>
                  <td className="px-3 py-2.5">{dc(grand.conversions, "jb-total-conv")}</td>
                  <td className="px-3 py-2.5">{dc(grand.registrations, "jb-total-reg")}</td>
                  {showConversion && <td className="px-3 py-2.5">{dc(grand.conversions > 0 ? (grand.registrations / grand.conversions) * 100 : 0, "jb-total-bem", "percentage", false, prevBemPct(grand.conversions, grand.registrations, "jb-total-conv", "jb-total-reg"))}</td>}
                  {showConversion && <td className="px-3 py-2.5">{dc(grandCpr, "jb-total-cpr", "currency", true)}</td>}
                  {showConversion && <td className="px-3 py-2.5">{dc(grandCpc, "jb-total-cpc", "currency", true)}</td>}
                  {showConversion && <td className="px-3 py-2.5 tabular-nums" data-quality-score-conv={grand.qualityScore}><QualityScoreComparison value={grand.qualityScore ?? 0} rows={filteredData} dateRange={dateRange} compareRange={compareRange} factor={0.94} /></td>}
                  {showConversion && <td className="px-3 py-2.5 tabular-nums" data-quality-score={grand.qualityScore}><QualityScoreComparison value={grand.qualityScore ?? 0} rows={filteredData} dateRange={dateRange} compareRange={compareRange} /></td>}
                  <td className="px-3 py-2.5">{dc(grand.spend, "jb-total-spend", "currency")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <JobTitleTable filters={filters} onFiltersChange={onFiltersChange} seed="jb-titles" totals={grand} dateRange={dateRange} compareRange={compareRange} deltaMode={deltaMode} />

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">{chartView === "unit" ? "Per Unit" : "Per Functiegroep"}</CardTitle>
          <div className="flex gap-1">
            <Button size="sm" variant={chartView === "unit" ? "default" : "secondary"} aria-pressed={chartView === "unit"} onClick={() => setChartView("unit")}>Per Unit</Button>
            <Button size="sm" variant={chartView === "functiegroep" ? "default" : "secondary"} aria-pressed={chartView === "functiegroep"} onClick={() => setChartView("functiegroep")}>Per Functiegroep</Button>
          </div>
        </CardHeader>
        <CardContent>
          <MarketingGroupChart key={chartView} data={chartData} selected={quickFilterValues(filters, chartView)} onSelect={onFiltersChange ? (v) => onFiltersChange(toggleQuickFilter(filters, chartView, v)) : undefined} dateRange={dateRange} compareRange={compareRange} deltaMode={deltaMode} />
        </CardContent>
      </Card>
    </div>
  );
};

export default JobboardsTab;
