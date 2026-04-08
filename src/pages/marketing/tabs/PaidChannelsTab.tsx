import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
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
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props { dateRange: DateRange; }

type SortKey = "source" | "conversions" | "registrations" | "spend" | "cpr";

const PaidChannelsTab = ({ dateRange }: Props) => {
  const [sortKey, setSortKey] = useState<SortKey>("registrations");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const rows = useMemo(() => {
    const agg = aggregatePaidChannels(paidChannelData);
    return agg.sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      if (typeof av === "string" && typeof bv === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [sortKey, sortDir]);

  const grand = useMemo(() => calcTotals(paidChannelData), []);
  const unitChart = useMemo(() => aggregateByUnit(paidChannelData), []);

  const kpis = useMemo(() => {
    const prev = { conversions: previousPeriodValue(grand.conversions), registrations: previousPeriodValue(grand.registrations) };
    const cpr = grand.registrations > 0 ? grand.spend / grand.registrations : 0;
    const prevCpr = prev.registrations > 0 ? previousPeriodValue(grand.spend) / prev.registrations : 0;
    return [
      { label: "Conversions", value: grand.conversions, delta: deltaPercent(grand.conversions, prev.conversions) },
      { label: "Registrations", value: grand.registrations, delta: deltaPercent(grand.registrations, prev.registrations) },
      { label: "Cost per Registration", value: cpr, delta: deltaPercent(cpr, prevCpr), format: "currency" as const, invertDelta: true },
    ];
  }, [grand]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const grandCpr = grand.registrations > 0 ? grand.spend / grand.registrations : 0;

  return (
    <div className="space-y-6">
      {/* KPI cards */}
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

      {/* Table */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Paid Channels per bron</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[420px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {(["source", "conversions", "registrations", "spend", "cpr"] as SortKey[]).map((key) => (
                    <TableHead key={key} className="cursor-pointer select-none sticky top-0 bg-background z-10" onClick={() => toggleSort(key)}>
                      <div className="flex items-center gap-1">
                        {{ source: "Bron", conversions: "Conversions", registrations: "Registrations", spend: "Spend", cpr: "CPR" }[key]}
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.source}>
                    <TableCell className="font-medium">{row.source}</TableCell>
                    <TableCell>{row.conversions.toLocaleString("nl-NL")}</TableCell>
                    <TableCell>{row.registrations.toLocaleString("nl-NL")}</TableCell>
                    <TableCell>{formatCurrency(row.spend)}</TableCell>
                    <TableCell>{formatCurrency(Math.round(row.cpr))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Fixed total row */}
          <div className="border-t bg-muted/30 px-4 py-3 flex text-sm font-bold">
            <span className="w-[20%]">Totaal</span>
            <span className="w-[20%]">{grand.conversions.toLocaleString("nl-NL")}</span>
            <span className="w-[20%]">{grand.registrations.toLocaleString("nl-NL")}</span>
            <span className="w-[20%]">{formatCurrency(grand.spend)}</span>
            <span className="w-[20%]">{formatCurrency(Math.round(grandCpr))}</span>
          </div>
        </CardContent>
      </Card>

      {/* Unit chart */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Per Unit</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={unitChart} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
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
