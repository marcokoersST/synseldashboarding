import JobTitleTable from "@/marketing-dashboard/components/marketing/JobTitleTable";
import KpiIcon from "@/marketing-dashboard/components/marketing/KpiIcon";
import KpiQualityBadge from "@/marketing-dashboard/components/marketing/KpiQualityBadge";
import QualityScoreComparison from "@/marketing-dashboard/components/marketing/QualityScoreComparison";
import { aggregateQualityScore } from "@/marketing-dashboard/lib/marketingQuality";
import React, { useMemo, useState } from "react";
import MarketingTrendChart from "@/marketing-dashboard/components/marketing/MarketingTrendChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/marketing-dashboard/components/ui/card";
import { Switch } from "@/marketing-dashboard/components/ui/switch";
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import MarketingGroupChart from "@/marketing-dashboard/components/marketing/MarketingGroupChart";
import { Button } from "@/marketing-dashboard/components/ui/button";
import { getCompareDisplayText, getComparisonValue } from "@/marketing-dashboard/lib/marketingCompare";
import DeltaCell from "@/marketing-dashboard/components/marketing/DeltaCell";
import type { DeltaMode } from "@/marketing-dashboard/components/marketing/DeltaCell";
import { adLevelData, aggregateByUnit, aggregateByFunctiegroep, totals as calcTotals, formatCurrency, deltaPercent } from "@/marketing-dashboard/data/marketingHubData";
import type { DateRange } from "react-day-picker-v9";
import { filterMarketingRows, toggleQuickFilter, isQuickFilter, withoutQuickFilter, quickFilterValues, quickDimClass, type MarketingFilterRule } from "@/marketing-dashboard/lib/marketingFilters";

interface Props {
  dateRange: DateRange;
  compareRange: DateRange | null;
  deltaMode?: DeltaMode;
  filters: MarketingFilterRule[];
  onFiltersChange?: (filters: MarketingFilterRule[]) => void;
}

type SortKey = "qualityScore" | "name" | "conversions" | "registrations" | "spend" | "cpr";

const PaidSocialAdLevelTab = ({ dateRange, compareRange, deltaMode = "percent", filters, onFiltersChange }: Props) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("registrations");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showConversion, setShowConversion] = useState(false);
  const [chartView, setChartView] = useState<"unit" | "functiegroep">("unit");
  const filteredData = useMemo(() => filterMarketingRows(adLevelData, filters, (row) => ({
    unit: row.unit, functiegroep: row.functiegroep, bron: row.platform, ad: row.adType,
  })), [filters]);
  const tableData = useMemo(() => filterMarketingRows(adLevelData, withoutQuickFilter(filters, "ad"), (row) => ({
    unit: row.unit, functiegroep: row.functiegroep, bron: row.platform, ad: row.adType,
  })), [filters]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof adLevelData>();
    for (const row of tableData) {
      const arr = map.get(row.adType) || [];
      arr.push(row);
      map.set(row.adType, arr);
    }
    const parents = Array.from(map.entries()).map(([adType, children]) => ({
      adType,
      conversions: children.reduce((s, c) => s + c.conversions, 0),
      registrations: children.reduce((s, c) => s + c.registrations, 0),
      spend: children.reduce((s, c) => s + c.spend, 0),
      qualityScore: aggregateQualityScore(children),
      cpr: 0,
      children,
    }));
    parents.forEach(p => { p.cpr = p.registrations > 0 ? p.spend / p.registrations : 0; });
    return parents.sort((a, b) => {
      const av = sortKey === "name" ? a.adType : a[sortKey] ?? 0;
      const bv = sortKey === "name" ? b.adType : b[sortKey] ?? 0;
      if (typeof av === "string" && typeof bv === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [tableData, sortKey, sortDir]);

  const grand = useMemo(() => calcTotals(filteredData), [filteredData]);
  const unitChart = useMemo(() => aggregateByUnit(filterMarketingRows(adLevelData, withoutQuickFilter(filters, "unit"), (row) => ({
    unit: row.unit, functiegroep: row.functiegroep, bron: row.platform, ad: row.adType,
  }))), [filters]);
  const fgChart = useMemo(() => aggregateByFunctiegroep(filterMarketingRows(adLevelData, withoutQuickFilter(filters, "functiegroep"), (row) => ({
    unit: row.unit, functiegroep: row.functiegroep, bron: row.platform, ad: row.adType,
  }))), [filters]);
  const grandCpr = grand.registrations > 0 ? grand.spend / grand.registrations : 0;
  const grandCpc = grand.conversions > 0 ? grand.spend / grand.conversions : 0;
  const compareText = getCompareDisplayText(compareRange);

  const kpis = useMemo(() => {
    const prev = {
      conversions: getComparisonValue(grand.conversions, { dateRange, compareRange, seed: "ad-level-conversions" }),
      registrations: getComparisonValue(grand.registrations, { dateRange, compareRange, seed: "ad-level-registrations" }),
      spend: getComparisonValue(grand.spend, { dateRange, compareRange, seed: "ad-level-spend" }),
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

  const toggle = (adType: string) => {
    setExpanded(prev => { const n = new Set(prev); n.has(adType) ? n.delete(adType) : n.add(adType); return n; });
  };

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
          <CardTitle className="text-base">Pail Social / Ad</CardTitle>
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
                  {[
                    { label: "Ad / Bron", key: "name" as SortKey },
                    { label: "Conversions", key: "conversions" as SortKey },
                    { label: "Inschrijven", key: "registrations" as SortKey },
                    ...(showConversion ? [{ label: "% Bem.", key: "registrations" as SortKey }, { label: "CPA", key: "cpr" as SortKey }, { label: "Cost/Inschrijven", key: "cpr" as SortKey }, { label: "Quality score conv.", key: "qualityScore" as SortKey }, { label: "Quality score bem.", key: "qualityScore" as SortKey }] : []),
                    { label: "Spend", key: "spend" as SortKey },
                  ].map((col) => (
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
                  const isOpen = expanded.has(parent.adType);
                  const cpr = parent.registrations > 0 ? parent.spend / parent.registrations : 0;
                  const cpc = parent.conversions > 0 ? parent.spend / parent.conversions : 0;
                  const bemPct = parent.conversions > 0 ? (parent.registrations / parent.conversions) * 100 : 0;
                  return (
                    <React.Fragment key={parent.adType}>
                      <tr className={`${quickDimClass(filters, "ad", parent.adType)} border-b transition-colors cursor-pointer hover:bg-muted/50`} onClick={() => toggle(parent.adType)}>
                        <td className="px-3 py-2.5 align-middle font-semibold">
                          <div className="flex items-center gap-1">
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <button type="button" onClick={(e) => { e.stopPropagation(); onFiltersChange?.(toggleQuickFilter(filters, "ad", parent.adType)); }} aria-pressed={isQuickFilter(filters, "ad", parent.adType)} className={`text-left underline-offset-2 hover:underline ${isQuickFilter(filters, "ad", parent.adType) ? "text-primary underline" : ""}`}>{parent.adType}</button>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 align-middle font-semibold">{dc(parent.conversions, `al-${parent.adType}-conv`)}</td>
                        <td className="px-3 py-2.5 align-middle font-semibold">{dc(parent.registrations, `al-${parent.adType}-reg`)}</td>
                        {showConversion && <td className="px-3 py-2.5 align-middle font-semibold">{dc(bemPct, `al-${parent.adType}-bem`, "percentage", false, prevBemPct(parent.conversions, parent.registrations, `al-${parent.adType}-conv`, `al-${parent.adType}-reg`))}</td>}
                        {showConversion && <td className="px-3 py-2.5 align-middle font-semibold">{dc(cpr, `al-${parent.adType}-cpr`, "currency", true)}</td>}
                        {showConversion && <td className="px-3 py-2.5 align-middle font-semibold">{dc(cpc, `al-${parent.adType}-cpc`, "currency", true)}</td>}
                        {showConversion && <td className="px-3 py-2.5 align-middle font-semibold tabular-nums" data-quality-score-conv={parent.qualityScore}><QualityScoreComparison value={parent.qualityScore ?? 0} rows={parent.children} dateRange={dateRange} compareRange={compareRange} factor={0.94} /></td>}
                        {showConversion && <td className="px-3 py-2.5 align-middle font-semibold tabular-nums" data-quality-score={parent.qualityScore}><QualityScoreComparison value={parent.qualityScore ?? 0} rows={parent.children} dateRange={dateRange} compareRange={compareRange} /></td>}
                        <td className="px-3 py-2.5 align-middle font-semibold">{dc(parent.spend, `al-${parent.adType}-spend`, "currency")}</td>
                      </tr>
                      {isOpen && parent.children.map((child) => {
                        const childCpr = child.registrations > 0 ? child.spend / child.registrations : 0;
                        const childCpc = child.conversions > 0 ? child.spend / child.conversions : 0;
                        const childBemPct = child.conversions > 0 ? (child.registrations / child.conversions) * 100 : 0;
                        return (
                          <tr key={`${parent.adType}-${child.platform}`} className="border-b transition-colors bg-muted/20">
                            <td className="px-3 py-2.5 pl-10 align-middle text-muted-foreground">{child.platform}</td>
                            <td className="px-3 py-2.5 align-middle">{dc(child.conversions, `al-${parent.adType}-${child.platform}-conv`)}</td>
                            <td className="px-3 py-2.5 align-middle">{dc(child.registrations, `al-${parent.adType}-${child.platform}-reg`)}</td>
                            {showConversion && <td className="px-3 py-2.5 align-middle">{dc(childBemPct, `al-${parent.adType}-${child.platform}-bem`, "percentage", false, prevBemPct(child.conversions, child.registrations, `al-${parent.adType}-${child.platform}-conv`, `al-${parent.adType}-${child.platform}-reg`))}</td>}
                            {showConversion && <td className="px-3 py-2.5 align-middle">{dc(childCpr, `al-${parent.adType}-${child.platform}-cpr`, "currency", true)}</td>}
                            {showConversion && <td className="px-3 py-2.5 align-middle">{dc(childCpc, `al-${parent.adType}-${child.platform}-cpc`, "currency", true)}</td>}
                            {showConversion && <td className="px-3 py-2.5 align-middle tabular-nums" data-quality-score-conv={child.qualityScore}><QualityScoreComparison value={child.qualityScore ?? 0} rows={[child]} dateRange={dateRange} compareRange={compareRange} factor={0.94} /></td>}
                            {showConversion && <td className="px-3 py-2.5 align-middle tabular-nums" data-quality-score={child.qualityScore}><QualityScoreComparison value={child.qualityScore ?? 0} rows={[child]} dateRange={dateRange} compareRange={compareRange} /></td>}
                            <td className="px-3 py-2.5 align-middle">{dc(child.spend, `al-${parent.adType}-${child.platform}-spend`, "currency")}</td>
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
                  <td className="px-3 py-2.5">{dc(grand.conversions, "al-total-conv")}</td>
                  <td className="px-3 py-2.5">{dc(grand.registrations, "al-total-reg")}</td>
                  {showConversion && <td className="px-3 py-2.5">{dc(grand.conversions > 0 ? (grand.registrations / grand.conversions) * 100 : 0, "al-total-bem", "percentage", false, prevBemPct(grand.conversions, grand.registrations, "al-total-conv", "al-total-reg"))}</td>}
                  {showConversion && <td className="px-3 py-2.5">{dc(grandCpr, "al-total-cpr", "currency", true)}</td>}
                  {showConversion && <td className="px-3 py-2.5">{dc(grandCpc, "al-total-cpc", "currency", true)}</td>}
                  {showConversion && <td className="px-3 py-2.5 tabular-nums" data-quality-score-conv={grand.qualityScore}><QualityScoreComparison value={grand.qualityScore ?? 0} rows={filteredData} dateRange={dateRange} compareRange={compareRange} factor={0.94} /></td>}
                  {showConversion && <td className="px-3 py-2.5 tabular-nums" data-quality-score={grand.qualityScore}><QualityScoreComparison value={grand.qualityScore ?? 0} rows={filteredData} dateRange={dateRange} compareRange={compareRange} /></td>}
                  <td className="px-3 py-2.5">{dc(grand.spend, "al-total-spend", "currency")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <JobTitleTable filters={filters} onFiltersChange={onFiltersChange} seed="ad-titles" totals={grand} dateRange={dateRange} compareRange={compareRange} deltaMode={deltaMode} />

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

export default PaidSocialAdLevelTab;
