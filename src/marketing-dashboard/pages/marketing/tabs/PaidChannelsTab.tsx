import JobTitleTable from "@/marketing-dashboard/components/marketing/JobTitleTable";
import KpiIcon from "@/marketing-dashboard/components/marketing/KpiIcon";
import KpiQualityBadge from "@/marketing-dashboard/components/marketing/KpiQualityBadge";
import QualityScoreComparison from "@/marketing-dashboard/components/marketing/QualityScoreComparison";
import { aggregateQualityScore } from "@/marketing-dashboard/lib/marketingQuality";
import { useMemo, useState, useCallback } from "react";
import MarketingTrendChart from "@/marketing-dashboard/components/marketing/MarketingTrendChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/marketing-dashboard/components/ui/card";
import { Switch } from "@/marketing-dashboard/components/ui/switch";
import { ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import MarketingGroupChart from "@/marketing-dashboard/components/marketing/MarketingGroupChart";
import { Button } from "@/marketing-dashboard/components/ui/button";
import { getCompareDisplayText, getComparisonValue } from "@/marketing-dashboard/lib/marketingCompare";
import DeltaCell from "@/marketing-dashboard/components/marketing/DeltaCell";
import type { DeltaMode } from "@/marketing-dashboard/components/marketing/DeltaCell";
import {
  paidChannelData,
  aggregatePaidChannels,
  aggregateByUnit,
  aggregateByFunctiegroep,
  totals as calcTotals,
  formatCurrency,
  deltaPercent,
} from "@/marketing-dashboard/data/marketingHubData";
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

type SortKey = "qualityScore" | "source" | "conversions" | "registrations" | "spend" | "cpr" | "cpc";

const PaidChannelsTab = ({ dateRange, compareRange, deltaMode = "percent", filters, onFiltersChange }: Props) => {
  const [sortKey, setSortKey] = useState<SortKey>("registrations");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showConversion, setShowConversion] = useState(false);
  const [chartView, setChartView] = useState<"unit" | "functiegroep">("unit");
  const [manualSpends, setManualSpends] = useState<Record<string, ManualSpendSetting>>({});
  const filteredData = useMemo(() => filterMarketingRows(paidChannelData, filters, (row) => ({
    unit: row.unit, functiegroep: row.functiegroep, bron: row.source,
  })), [filters]);
  const tableData = useMemo(() => filterMarketingRows(paidChannelData, withoutQuickFilter(filters, "bron"), (row) => ({
    unit: row.unit, functiegroep: row.functiegroep, bron: row.source,
  })), [filters]);

  const handleSaveSpend = useCallback((source: string, value: ManualSpendSetting) => {
    setManualSpends(prev => ({ ...prev, [source]: value }));
  }, []);

  const rows = useMemo(() => {
    const agg = aggregatePaidChannels(tableData).map(r => ({
      ...r,
      cpc: r.conversions > 0 ? r.spend / r.conversions : 0,
    }));
    return agg.sort((a, b) => {
      const av = a[sortKey as keyof typeof a] ?? 0;
      const bv = b[sortKey as keyof typeof b] ?? 0;
      if (typeof av === "string" && typeof bv === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [tableData, sortKey, sortDir]);

  const grand = useMemo(() => calcTotals(filteredData), [filteredData]);
  const unitChart = useMemo(() => aggregateByUnit(filterMarketingRows(paidChannelData, withoutQuickFilter(filters, "unit"), (row) => ({
    unit: row.unit, functiegroep: row.functiegroep, bron: row.source,
  }))), [filters]);
  const fgChart = useMemo(() => aggregateByFunctiegroep(filterMarketingRows(paidChannelData, withoutQuickFilter(filters, "functiegroep"), (row) => ({
    unit: row.unit, functiegroep: row.functiegroep, bron: row.source,
  }))), [filters]);
  const grandCpr = grand.registrations > 0 ? grand.spend / grand.registrations : 0;
  const grandCpc = grand.conversions > 0 ? grand.spend / grand.conversions : 0;
  const compareText = getCompareDisplayText(compareRange);

  const kpis = useMemo(() => {
    const prev = {
      conversions: getComparisonValue(grand.conversions, { dateRange, compareRange, seed: "paid-channels-conversions" }),
      registrations: getComparisonValue(grand.registrations, { dateRange, compareRange, seed: "paid-channels-registrations" }),
      spend: getComparisonValue(grand.spend, { dateRange, compareRange, seed: "paid-channels-spend" }),
    };
    const cpr = grandCpr;
    const prevCpr = prev.registrations > 0 ? prev.spend / prev.registrations : 0;
    const items: { label: string; value: number; prevValue: number; delta: number | null; format?: string; invertDelta?: boolean }[] = [
      { label: "Conversions", value: grand.conversions, prevValue: prev.conversions, delta: deltaPercent(grand.conversions, prev.conversions) },
      { label: "Inschrijven", value: grand.registrations, prevValue: prev.registrations, delta: deltaPercent(grand.registrations, prev.registrations) },
      { label: "Cost per Inschrijving", value: cpr, prevValue: prevCpr, delta: deltaPercent(cpr, prevCpr), format: "currency", invertDelta: true },
    ];
    return items;
  }, [dateRange, compareRange, grand, grandCpr]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  type ColDef = { key: SortKey; label: string; show: boolean };
  const columns: ColDef[] = [
    { key: "source", label: "Bron", show: true },
    { key: "conversions", label: "Conversions", show: true },
    { key: "registrations", label: "Inschrijven", show: true },
    { key: "registrations", label: "% Bem.", show: showConversion },
    { key: "cpr", label: "CPA", show: showConversion },
    { key: "cpc", label: "Cost/Inschrijven.", show: showConversion },
    { key: "qualityScore", label: "Quality score conv.", show: showConversion },
    { key: "qualityScore", label: "Quality score bem.", show: showConversion },
    { key: "spend", label: "Spend", show: true },
  ];
  const visibleCols = columns.filter(c => c.show);

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
          <CardTitle className="text-base">Paid Channels / Bron</CardTitle>
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
                  {visibleCols.map((col) => (
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
                {rows.map((row) => {
                  const bemPct = row.conversions > 0 ? (row.registrations / row.conversions) * 100 : 0;
                  const spendMissing = row.spend === 0 && manualSpends[row.source] === undefined;
                  const displayedSpend = calculateManualSpend(manualSpends[row.source], dateRange) ?? row.spend;
                  return (
                  <tr key={row.source} className={`${quickDimClass(filters, "bron", row.source)} border-b transition-colors hover:bg-muted/50`}>
                    <td className="px-3 py-2.5 align-middle font-medium"><button type="button" onClick={(e) => { onFiltersChange?.(toggleQuickFilter(filters, "bron", row.source)); }} aria-pressed={isQuickFilter(filters, "bron", row.source)} className={`text-left underline-offset-2 hover:underline ${isQuickFilter(filters, "bron", row.source) ? "text-primary underline" : ""}`}>{row.source}</button></td>
                    <td className="px-3 py-2.5 align-middle">{dc(row.conversions, `pc-${row.source}-conv`)}</td>
                    <td className="px-3 py-2.5 align-middle">{dc(row.registrations, `pc-${row.source}-reg`)}</td>
                    {showConversion && <td className="px-3 py-2.5 align-middle">{dc(bemPct, `pc-${row.source}-bem`, "percentage", false, prevBemPct(row.conversions, row.registrations, `pc-${row.source}-conv`, `pc-${row.source}-reg`))}</td>}
                    {showConversion && <td className="px-3 py-2.5 align-middle">{spendMissing ? <span className="text-red-500 text-xs font-medium">—</span> : dc(row.cpr, `pc-${row.source}-cpr`, "currency", true)}</td>}
                    {showConversion && <td className="px-3 py-2.5 align-middle">{spendMissing ? <span className="text-red-500 text-xs font-medium">—</span> : dc(row.cpc, `pc-${row.source}-cpc`, "currency", true)}</td>}
                    {showConversion && <td className="px-3 py-2.5 align-middle tabular-nums" data-quality-score-conv={row.qualityScore}><QualityScoreComparison value={row.qualityScore ?? 0} rows={filteredData.filter(item => item.source === row.source)} dateRange={dateRange} compareRange={compareRange} factor={0.94} /></td>}
                    {showConversion && <td className="px-3 py-2.5 align-middle tabular-nums" data-quality-score={row.qualityScore}><QualityScoreComparison value={row.qualityScore ?? 0} rows={filteredData.filter(item => item.source === row.source)} dateRange={dateRange} compareRange={compareRange} /></td>}
                    <td className="px-3 py-2.5 align-middle">
                      <EditableSpendCell
                        spend={row.spend}
                        manualSpend={manualSpends[row.source]}
                        dateRange={dateRange}
                        onSave={(v) => handleSaveSpend(row.source, v)}
                        info={row.source === "Indeed" ? INDEED_DISCOUNT_INFO : undefined}
                      >
                        {dc(displayedSpend, `pc-${row.source}-spend`, "currency")}
                      </EditableSpendCell>
                    </td>
                  </tr>
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
                  <td className="px-3 py-2.5">{dc(grand.conversions, "pc-total-conv")}</td>
                  <td className="px-3 py-2.5">{dc(grand.registrations, "pc-total-reg")}</td>
                  {showConversion && <td className="px-3 py-2.5">{dc(grand.conversions > 0 ? (grand.registrations / grand.conversions) * 100 : 0, "pc-total-bem", "percentage", false, prevBemPct(grand.conversions, grand.registrations, "pc-total-conv", "pc-total-reg"))}</td>}
                  {showConversion && <td className="px-3 py-2.5">{dc(grandCpr, "pc-total-cpr", "currency", true)}</td>}
                  {showConversion && <td className="px-3 py-2.5">{dc(grandCpc, "pc-total-cpc", "currency", true)}</td>}
                  {showConversion && <td className="px-3 py-2.5 tabular-nums" data-quality-score-conv={grand.qualityScore}><QualityScoreComparison value={grand.qualityScore ?? 0} rows={filteredData} dateRange={dateRange} compareRange={compareRange} factor={0.94} /></td>}
                  {showConversion && <td className="px-3 py-2.5 tabular-nums" data-quality-score={grand.qualityScore}><QualityScoreComparison value={grand.qualityScore ?? 0} rows={filteredData} dateRange={dateRange} compareRange={compareRange} /></td>}
                  <td className="px-3 py-2.5">{dc(grand.spend, "pc-total-spend", "currency")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <JobTitleTable filters={filters} onFiltersChange={onFiltersChange} seed="pc-titles" totals={grand} dateRange={dateRange} compareRange={compareRange} deltaMode={deltaMode} />

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

export default PaidChannelsTab;
