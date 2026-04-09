import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getCompareDisplayText, getComparisonValue } from "@/lib/marketingCompare";
import DeltaCell from "@/components/marketing/DeltaCell";
import type { DeltaMode } from "@/components/marketing/DeltaCell";
import { paidSocialData, aggregateByUnit, totals as calcTotals, formatCurrency, deltaPercent } from "@/data/marketingHubData";
import type { DateRange } from "react-day-picker";

interface Props {
  dateRange: DateRange;
  compareRange: DateRange | null;
  deltaMode?: DeltaMode;
}

type SortKey = "name" | "conversions" | "registrations" | "spend" | "cpr";

const PaidSocialTab = ({ dateRange, compareRange, deltaMode = "percent" }: Props) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("registrations");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showConversion, setShowConversion] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof paidSocialData>();
    for (const row of paidSocialData) {
      const arr = map.get(row.platform) || [];
      arr.push(row);
      map.set(row.platform, arr);
    }
    const parents = Array.from(map.entries()).map(([platform, children]) => ({
      platform,
      conversions: children.reduce((s, c) => s + c.conversions, 0),
      registrations: children.reduce((s, c) => s + c.registrations, 0),
      spend: children.reduce((s, c) => s + c.spend, 0),
      cpr: 0,
      children,
    }));
    parents.forEach(p => { p.cpr = p.registrations > 0 ? p.spend / p.registrations : 0; });
    return parents.sort((a, b) => {
      const av = sortKey === "name" ? a.platform : a[sortKey] ?? 0;
      const bv = sortKey === "name" ? b.platform : b[sortKey] ?? 0;
      if (typeof av === "string" && typeof bv === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [sortKey, sortDir]);

  const grand = useMemo(() => calcTotals(paidSocialData), []);
  const unitChart = useMemo(() => aggregateByUnit(paidSocialData), []);
  const grandCpr = grand.registrations > 0 ? grand.spend / grand.registrations : 0;
  const grandCpc = grand.conversions > 0 ? grand.spend / grand.conversions : 0;
  const compareText = getCompareDisplayText(compareRange);

  const kpis = useMemo(() => {
    const prev = {
      conversions: getComparisonValue(grand.conversions, { dateRange, compareRange, seed: "paid-social-conversions" }),
      registrations: getComparisonValue(grand.registrations, { dateRange, compareRange, seed: "paid-social-registrations" }),
      spend: getComparisonValue(grand.spend, { dateRange, compareRange, seed: "paid-social-spend" }),
    };
    const prevCpr = prev.registrations > 0 ? prev.spend / prev.registrations : 0;
    const items: { label: string; value: number; delta: number | null; format?: string; invertDelta?: boolean }[] = [
      { label: "Conversions", value: grand.conversions, delta: deltaPercent(grand.conversions, prev.conversions) },
      { label: "Registrations", value: grand.registrations, delta: deltaPercent(grand.registrations, prev.registrations) },
      { label: "CPR", value: grandCpr, delta: deltaPercent(grandCpr, prevCpr), format: "currency", invertDelta: true },
    ];
    return items;
  }, [dateRange, compareRange, grand, grandCpr]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const toggle = (platform: string) => {
    setExpanded(prev => { const n = new Set(prev); n.has(platform) ? n.delete(platform) : n.add(platform); return n; });
  };

  const dc = (value: number, seed: string, format?: "number" | "currency", invertDelta?: boolean) => (
    <DeltaCell value={value} dateRange={dateRange} compareRange={compareRange} seed={seed} format={format} invertDelta={invertDelta} deltaMode={deltaMode} />
  );

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
                    <span className="text-muted-foreground ml-1">{compareText}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Paid Social per platform</CardTitle>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <Switch checked={showConversion} onCheckedChange={setShowConversion} />
            Show conversion
          </label>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[480px] overflow-auto">
            <table className="w-full caption-bottom text-sm table-fixed">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors">
                  {[
                    { label: "Platform / Segment", key: "name" as SortKey },
                    { label: "Conversions", key: "conversions" as SortKey },
                    { label: "Registrations", key: "registrations" as SortKey },
                    ...(showConversion ? [{ label: "CPR", key: "cpr" as SortKey }, { label: "Cost/Conv.", key: "cpr" as SortKey }] : []),
                    { label: "Spend", key: "spend" as SortKey },
                  ].map((col) => (
                    <th key={col.label} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer select-none sticky top-0 bg-background z-10" onClick={() => toggleSort(col.key)}>
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
                  const isOpen = expanded.has(parent.platform);
                  const cpr = parent.registrations > 0 ? parent.spend / parent.registrations : 0;
                  const cpc = parent.conversions > 0 ? parent.spend / parent.conversions : 0;
                  return (
                    <React.Fragment key={parent.platform}>
                      <tr className="border-b transition-colors cursor-pointer hover:bg-muted/50" onClick={() => toggle(parent.platform)}>
                        <td className="p-4 align-middle font-semibold">
                          <div className="flex items-center gap-1">
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            {parent.platform}
                          </div>
                        </td>
                        <td className="p-4 align-middle font-semibold">{dc(parent.conversions, `ps-${parent.platform}-conv`)}</td>
                        <td className="p-4 align-middle font-semibold">{dc(parent.registrations, `ps-${parent.platform}-reg`)}</td>
                        {showConversion && <td className="p-4 align-middle font-semibold">{dc(cpr, `ps-${parent.platform}-cpr`, "currency", true)}</td>}
                        {showConversion && <td className="p-4 align-middle font-semibold">{dc(cpc, `ps-${parent.platform}-cpc`, "currency", true)}</td>}
                        <td className="p-4 align-middle font-semibold">{dc(parent.spend, `ps-${parent.platform}-spend`, "currency")}</td>
                      </tr>
                      {isOpen && parent.children.map((child) => {
                        const childCpr = child.registrations > 0 ? child.spend / child.registrations : 0;
                        const childCpc = child.conversions > 0 ? child.spend / child.conversions : 0;
                        return (
                          <tr key={`${parent.platform}-${child.segment}`} className="border-b transition-colors bg-muted/20">
                            <td className="p-4 pl-10 align-middle text-muted-foreground">{child.segment}</td>
                            <td className="p-4 align-middle">{dc(child.conversions, `ps-${parent.platform}-${child.segment}-conv`)}</td>
                            <td className="p-4 align-middle">{dc(child.registrations, `ps-${parent.platform}-${child.segment}-reg`)}</td>
                            {showConversion && <td className="p-4 align-middle">{dc(childCpr, `ps-${parent.platform}-${child.segment}-cpr`, "currency", true)}</td>}
                            {showConversion && <td className="p-4 align-middle">{dc(childCpc, `ps-${parent.platform}-${child.segment}-cpc`, "currency", true)}</td>}
                            <td className="p-4 align-middle">{dc(child.spend, `ps-${parent.platform}-${child.segment}-spend`, "currency")}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
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
                  <td className="p-4">{dc(grand.conversions, "ps-total-conv")}</td>
                  <td className="p-4">{dc(grand.registrations, "ps-total-reg")}</td>
                  {showConversion && <td className="p-4">{dc(grandCpr, "ps-total-cpr", "currency", true)}</td>}
                  {showConversion && <td className="p-4">{dc(grandCpc, "ps-total-cpc", "currency", true)}</td>}
                  <td className="p-4">{dc(grand.spend, "ps-total-spend", "currency")}</td>
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

export default PaidSocialTab;
