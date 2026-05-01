import { useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getCompareDisplayText, getComparisonValue } from "@/lib/marketingCompare";
import DeltaCell from "@/components/marketing/DeltaCell";
import type { DeltaMode } from "@/components/marketing/DeltaCell";
import {
  paidChannelData,
  aggregatePaidChannels,
  aggregateByUnit,
  aggregateByFunctiegroep,
  totals as calcTotals,
  formatCurrency,
  deltaPercent,
  MARKETING_COLORS,
} from "@/data/marketingHubData";
import type { DateRange } from "react-day-picker";
import EditableSpendCell from "@/components/marketing/EditableSpendCell";
interface Props {
  dateRange: DateRange;
  compareRange: DateRange | null;
  deltaMode?: DeltaMode;
}

type SortKey = "source" | "conversions" | "registrations" | "spend" | "cpr" | "cpc";

const PaidChannelsTab = ({ dateRange, compareRange, deltaMode = "percent" }: Props) => {
  const [sortKey, setSortKey] = useState<SortKey>("registrations");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showConversion, setShowConversion] = useState(false);
  const [chartView, setChartView] = useState<"unit" | "functiegroep">("unit");
  const [manualSpends, setManualSpends] = useState<Record<string, number>>({});

  const handleSaveSpend = useCallback((source: string, value: number) => {
    setManualSpends(prev => ({ ...prev, [source]: value }));
  }, []);

  const rows = useMemo(() => {
    const agg = aggregatePaidChannels(paidChannelData).map(r => ({
      ...r,
      cpc: r.conversions > 0 ? r.spend / r.conversions : 0,
    }));
    return agg.sort((a, b) => {
      const av = a[sortKey as keyof typeof a] ?? 0;
      const bv = b[sortKey as keyof typeof b] ?? 0;
      if (typeof av === "string" && typeof bv === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [sortKey, sortDir]);

  const grand = useMemo(() => calcTotals(paidChannelData), []);
  const unitChart = useMemo(() => aggregateByUnit(paidChannelData), []);
  const fgChart = useMemo(() => aggregateByFunctiegroep(paidChannelData), []);
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
                <p className="text-xs font-medium text-muted-foreground mb-1">{kpi.label}</p>
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

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Paid Channels / Bron</CardTitle>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <Switch checked={showConversion} onCheckedChange={setShowConversion} />
            Show conversion
          </label>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full caption-bottom text-sm table-fixed">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors">
                  {visibleCols.map((col) => (
                    <th key={col.key} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer select-none sticky top-0 bg-background z-10" onClick={() => toggleSort(col.key)}>
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
                  return (
                  <tr key={row.source} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{row.source}</td>
                    <td className="p-4 align-middle">{dc(row.conversions, `pc-${row.source}-conv`)}</td>
                    <td className="p-4 align-middle">{dc(row.registrations, `pc-${row.source}-reg`)}</td>
                    {showConversion && <td className="p-4 align-middle">{dc(bemPct, `pc-${row.source}-bem`, "percentage", false, prevBemPct(row.conversions, row.registrations, `pc-${row.source}-conv`, `pc-${row.source}-reg`))}</td>}
                    {showConversion && <td className="p-4 align-middle">{spendMissing ? <span className="text-red-500 text-xs font-medium">—</span> : dc(row.cpr, `pc-${row.source}-cpr`, "currency", true)}</td>}
                    {showConversion && <td className="p-4 align-middle">{spendMissing ? <span className="text-red-500 text-xs font-medium">—</span> : dc(row.cpc, `pc-${row.source}-cpc`, "currency", true)}</td>}
                    <td className="p-4 align-middle">
                      <EditableSpendCell
                        spend={row.spend}
                        manualSpend={manualSpends[row.source]}
                        onSave={(v) => handleSaveSpend(row.source, v)}
                      >
                        {dc(manualSpends[row.source] ?? row.spend, `pc-${row.source}-spend`, "currency")}
                      </EditableSpendCell>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t bg-muted/30">
            <table className="w-full text-sm table-fixed">
              <tbody>
                <tr className="font-bold">
                  <td className="p-4">Totaal</td>
                  <td className="p-4">{dc(grand.conversions, "pc-total-conv")}</td>
                  <td className="p-4">{dc(grand.registrations, "pc-total-reg")}</td>
                  {showConversion && <td className="p-4">{dc(grand.conversions > 0 ? (grand.registrations / grand.conversions) * 100 : 0, "pc-total-bem", "percentage", false, prevBemPct(grand.conversions, grand.registrations, "pc-total-conv", "pc-total-reg"))}</td>}
                  {showConversion && <td className="p-4">{dc(grandCpr, "pc-total-cpr", "currency", true)}</td>}
                  {showConversion && <td className="p-4">{dc(grandCpc, "pc-total-cpc", "currency", true)}</td>}
                  <td className="p-4">{dc(grand.spend, "pc-total-spend", "currency")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">{chartView === "unit" ? "Per Unit" : "Per Functiegroep"}</CardTitle>
          <div className="flex gap-1">
            <button onClick={() => setChartView("unit")} className={`px-3 py-1 text-xs rounded-full transition-colors ${chartView === "unit" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>Per Unit</button>
            <button onClick={() => setChartView("functiegroep")} className={`px-3 py-1 text-xs rounded-full transition-colors ${chartView === "functiegroep" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>Per Functiegroep</button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.3)]} />
              <YAxis type="category" dataKey="unit" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="registrations" name="Inschrijven" fill={MARKETING_COLORS[0]} radius={[0, 4, 4, 0]} />
              <Bar dataKey="acquisitions" name="Cost per Inschrijving" fill={MARKETING_COLORS[1]} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaidChannelsTab;
