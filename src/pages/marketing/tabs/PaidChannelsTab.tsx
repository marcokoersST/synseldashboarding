import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  paidChannelData,
  aggregatePaidChannels,
  aggregateByUnit,
  totals as calcTotals,
  formatCurrency,
  previousPeriodValue,
  deltaPercent,
} from "@/data/marketingHubData";
import type { DateRange } from "react-day-picker";

interface Props {
  dateRange: DateRange;
  compareRange: DateRange | null;
}

type SortKey = "source" | "conversions" | "registrations" | "spend" | "cpr" | "cpc";

const PaidChannelsTab = ({ dateRange, compareRange }: Props) => {
  const [sortKey, setSortKey] = useState<SortKey>("registrations");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showConversion, setShowConversion] = useState(false);

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
  const grandCpr = grand.registrations > 0 ? grand.spend / grand.registrations : 0;
  const grandCpc = grand.conversions > 0 ? grand.spend / grand.conversions : 0;

  const kpis = useMemo(() => {
    const prev = { conversions: previousPeriodValue(grand.conversions), registrations: previousPeriodValue(grand.registrations) };
    const cpr = grandCpr;
    const prevCpr = prev.registrations > 0 ? previousPeriodValue(grand.spend) / prev.registrations : 0;
    return [
      { label: "Conversions", value: grand.conversions, delta: deltaPercent(grand.conversions, prev.conversions) },
      { label: "Registrations", value: grand.registrations, delta: deltaPercent(grand.registrations, prev.registrations) },
      { label: "Cost per Registration", value: cpr, delta: deltaPercent(cpr, prevCpr), format: "currency" as const, invertDelta: true },
    ];
  }, [grand, grandCpr]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const colW = showConversion ? "w-[14.3%]" : "w-[20%]";
  const firstColW = showConversion ? "w-[14.3%]" : "w-[20%]";

  type ColDef = { key: SortKey; label: string; show: boolean };
  const columns: ColDef[] = [
    { key: "source", label: "Bron", show: true },
    { key: "conversions", label: "Conversions", show: true },
    { key: "registrations", label: "Registrations", show: true },
    { key: "cpr", label: "CPR", show: showConversion },
    { key: "cpc", label: "Cost/Conv.", show: showConversion },
    { key: "spend", label: "Spend", show: true },
  ];
  const visibleCols = columns.filter(c => c.show);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const isPos = kpi.invertDelta ? (kpi.delta !== null && kpi.delta < 0) : (kpi.delta !== null && kpi.delta > 0);
          return (
            <Card key={kpi.label}>
              <CardContent className="p-5">
                <p className="text-xs font-medium text-muted-foreground mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold">{kpi.format === "currency" ? formatCurrency(Math.round(kpi.value)) : kpi.value.toLocaleString("nl-NL")}</p>
                {kpi.delta !== null && (
                  <div className={`flex items-center gap-1 mt-1 text-xs ${isPos ? "text-emerald-600" : "text-red-500"}`}>
                    {isPos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{kpi.delta > 0 ? "+" : ""}{kpi.delta.toFixed(1)}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Paid Channels per bron</CardTitle>
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
                    <th key={col.key} className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer select-none sticky top-0 bg-background z-10`} onClick={() => toggleSort(col.key)}>
                      <div className="flex items-center gap-1">
                        {col.label}
                        <ArrowUpDown className={`h-3 w-3 ${sortKey === col.key ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {rows.map((row) => (
                  <tr key={row.source} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{row.source}</td>
                    <td className="p-4 align-middle">{row.conversions.toLocaleString("nl-NL")}</td>
                    <td className="p-4 align-middle">{row.registrations.toLocaleString("nl-NL")}</td>
                    {showConversion && <td className="p-4 align-middle">{formatCurrency(Math.round(row.cpr))}</td>}
                    {showConversion && <td className="p-4 align-middle">{formatCurrency(Math.round(row.cpc))}</td>}
                    <td className="p-4 align-middle">{formatCurrency(row.spend)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t bg-muted/30">
            <table className="w-full text-sm table-fixed">
              <tbody>
                <tr className="font-bold">
                  <td className="p-4">Totaal</td>
                  <td className="p-4">{grand.conversions.toLocaleString("nl-NL")}</td>
                  <td className="p-4">{grand.registrations.toLocaleString("nl-NL")}</td>
                  {showConversion && <td className="p-4">{formatCurrency(Math.round(grandCpr))}</td>}
                  {showConversion && <td className="p-4">{formatCurrency(Math.round(grandCpc))}</td>}
                  <td className="p-4">{formatCurrency(grand.spend)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Per Unit</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={unitChart} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.3)]} />
              <YAxis type="category" dataKey="unit" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="registrations" name="Registrations" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              <Bar dataKey="acquisitions" name="Acquisitions" fill="hsl(var(--primary) / 0.5)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaidChannelsTab;
