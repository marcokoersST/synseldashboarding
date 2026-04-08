import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { paidSocialData, aggregateByUnit, totals as calcTotals, formatCurrency, previousPeriodValue, deltaPercent } from "@/data/marketingHubData";
import type { DateRange } from "react-day-picker";

interface Props { dateRange: DateRange; }

const PaidSocialTab = ({ dateRange }: Props) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    const map = new Map<string, typeof paidSocialData>();
    for (const row of paidSocialData) {
      const arr = map.get(row.platform) || [];
      arr.push(row);
      map.set(row.platform, arr);
    }
    return Array.from(map.entries()).map(([platform, children]) => ({
      platform,
      conversions: children.reduce((s, c) => s + c.conversions, 0),
      registrations: children.reduce((s, c) => s + c.registrations, 0),
      spend: children.reduce((s, c) => s + c.spend, 0),
      children,
    }));
  }, []);

  const grand = useMemo(() => calcTotals(paidSocialData), []);
  const unitChart = useMemo(() => aggregateByUnit(paidSocialData), []);
  const grandCpr = grand.registrations > 0 ? grand.spend / grand.registrations : 0;

  const kpis = useMemo(() => {
    const prev = { conversions: previousPeriodValue(grand.conversions), registrations: previousPeriodValue(grand.registrations) };
    const prevCpr = prev.registrations > 0 ? previousPeriodValue(grand.spend) / prev.registrations : 0;
    const items: { label: string; value: number; delta: number | null; format?: "currency"; invertDelta?: boolean }[] = [
      { label: "Conversions", value: grand.conversions, delta: deltaPercent(grand.conversions, prev.conversions) },
      { label: "Registrations", value: grand.registrations, delta: deltaPercent(grand.registrations, prev.registrations) },
      { label: "CPR", value: grandCpr, delta: deltaPercent(grandCpr, prevCpr), format: "currency", invertDelta: true },
    ];
    return items;
  }, [grand, grandCpr]);

  const toggle = (platform: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(platform) ? next.delete(platform) : next.add(platform);
      return next;
    });
  };

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
        <CardHeader className="pb-3"><CardTitle className="text-base">Paid Social per platform</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[480px] overflow-auto">
            <table className="w-full caption-bottom text-sm table-fixed">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground sticky top-0 bg-background z-10 w-[28%]">Platform / Segment</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground sticky top-0 bg-background z-10 w-[18%]">Conversions</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground sticky top-0 bg-background z-10 w-[18%]">Registrations</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground sticky top-0 bg-background z-10 w-[18%]">Spend</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground sticky top-0 bg-background z-10 w-[18%]">CPR</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {grouped.map((parent) => {
                  const isOpen = expanded.has(parent.platform);
                  const cpr = parent.registrations > 0 ? parent.spend / parent.registrations : 0;
                  return (
                    <React.Fragment key={parent.platform}>
                      <tr className="border-b transition-colors cursor-pointer hover:bg-muted/50" onClick={() => toggle(parent.platform)}>
                        <td className="p-4 align-middle font-semibold w-[28%]">
                          <div className="flex items-center gap-1">
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            {parent.platform}
                          </div>
                        </td>
                        <td className="p-4 align-middle font-semibold w-[18%]">{parent.conversions.toLocaleString("nl-NL")}</td>
                        <td className="p-4 align-middle font-semibold w-[18%]">{parent.registrations.toLocaleString("nl-NL")}</td>
                        <td className="p-4 align-middle font-semibold w-[18%]">{formatCurrency(parent.spend)}</td>
                        <td className="p-4 align-middle font-semibold w-[18%]">{formatCurrency(Math.round(cpr))}</td>
                      </tr>
                      {isOpen && parent.children.map((child) => {
                        const childCpr = child.registrations > 0 ? child.spend / child.registrations : 0;
                        return (
                          <tr key={`${parent.platform}-${child.segment}`} className="border-b transition-colors bg-muted/20">
                            <td className="p-4 pl-10 align-middle text-muted-foreground w-[28%]">{child.segment}</td>
                            <td className="p-4 align-middle w-[18%]">{child.conversions.toLocaleString("nl-NL")}</td>
                            <td className="p-4 align-middle w-[18%]">{child.registrations.toLocaleString("nl-NL")}</td>
                            <td className="p-4 align-middle w-[18%]">{formatCurrency(child.spend)}</td>
                            <td className="p-4 align-middle w-[18%]">{formatCurrency(Math.round(childCpr))}</td>
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
                  <td className="p-4 w-[28%]">Totaal</td>
                  <td className="p-4 w-[18%]">{grand.conversions.toLocaleString("nl-NL")}</td>
                  <td className="p-4 w-[18%]">{grand.registrations.toLocaleString("nl-NL")}</td>
                  <td className="p-4 w-[18%]">{formatCurrency(grand.spend)}</td>
                  <td className="p-4 w-[18%]">{formatCurrency(Math.round(grandCpr))}</td>
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
