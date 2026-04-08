import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { jobboardData, aggregateByUnit, totals as calcTotals, formatCurrency, previousPeriodValue, deltaPercent } from "@/data/marketingHubData";
import type { DateRange } from "react-day-picker";

interface Props { dateRange: DateRange; }

const JobboardsTab = ({ dateRange }: Props) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    const map = new Map<string, typeof jobboardData>();
    for (const row of jobboardData) {
      const arr = map.get(row.board) || [];
      arr.push(row);
      map.set(row.board, arr);
    }
    return Array.from(map.entries()).map(([board, children]) => ({
      board,
      conversions: children.reduce((s, c) => s + c.conversions, 0),
      registrations: children.reduce((s, c) => s + c.registrations, 0),
      spend: children.reduce((s, c) => s + c.spend, 0),
      children,
    }));
  }, []);

  const grand = useMemo(() => calcTotals(jobboardData), []);
  const unitChart = useMemo(() => aggregateByUnit(jobboardData), []);
  const grandCpr = grand.registrations > 0 ? grand.spend / grand.registrations : 0;

  const kpis = useMemo(() => {
    const prev = { conversions: previousPeriodValue(grand.conversions), registrations: previousPeriodValue(grand.registrations) };
    const cpr = grandCpr;
    const prevCpr = prev.registrations > 0 ? previousPeriodValue(grand.spend) / prev.registrations : 0;
    return [
      { label: "Conversions", value: grand.conversions, delta: deltaPercent(grand.conversions, prev.conversions) },
      { label: "Registrations", value: grand.registrations, delta: deltaPercent(grand.registrations, prev.registrations) },
      { label: "CPR", value: cpr, delta: deltaPercent(cpr, prevCpr), format: "currency" as const, invertDelta: true },
    ];
  }, [grand, grandCpr]);

  const toggle = (board: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(board) ? next.delete(board) : next.add(board);
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
        <CardHeader className="pb-3"><CardTitle className="text-base">Jobboards per categorie</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[480px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 bg-background z-10">Jobboard / Categorie</TableHead>
                  <TableHead className="sticky top-0 bg-background z-10">Conversions</TableHead>
                  <TableHead className="sticky top-0 bg-background z-10">Registrations</TableHead>
                  <TableHead className="sticky top-0 bg-background z-10">Spend</TableHead>
                  <TableHead className="sticky top-0 bg-background z-10">CPR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grouped.map((parent) => {
                  const isOpen = expanded.has(parent.board);
                  const cpr = parent.registrations > 0 ? parent.spend / parent.registrations : 0;
                  return (
                    <>
                      <TableRow key={parent.board} className="cursor-pointer hover:bg-muted/50" onClick={() => toggle(parent.board)}>
                        <TableCell className="font-semibold">
                          <div className="flex items-center gap-1">
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            {parent.board}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{parent.conversions.toLocaleString("nl-NL")}</TableCell>
                        <TableCell className="font-semibold">{parent.registrations.toLocaleString("nl-NL")}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(parent.spend)}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(Math.round(cpr))}</TableCell>
                      </TableRow>
                      {isOpen && parent.children.map((child) => {
                        const childCpr = child.registrations > 0 ? child.spend / child.registrations : 0;
                        return (
                          <TableRow key={`${parent.board}-${child.category}`} className="bg-muted/20">
                            <TableCell className="pl-10 text-muted-foreground">{child.category}</TableCell>
                            <TableCell>{child.conversions.toLocaleString("nl-NL")}</TableCell>
                            <TableCell>{child.registrations.toLocaleString("nl-NL")}</TableCell>
                            <TableCell>{formatCurrency(child.spend)}</TableCell>
                            <TableCell>{formatCurrency(Math.round(childCpr))}</TableCell>
                          </TableRow>
                        );
                      })}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="border-t bg-muted/30 px-4 py-3 flex text-sm font-bold">
            <span className="w-[28%]">Totaal</span>
            <span className="w-[18%]">{grand.conversions.toLocaleString("nl-NL")}</span>
            <span className="w-[18%]">{grand.registrations.toLocaleString("nl-NL")}</span>
            <span className="w-[18%]">{formatCurrency(grand.spend)}</span>
            <span className="w-[18%]">{formatCurrency(Math.round(grandCpr))}</span>
          </div>
        </CardContent>
      </Card>

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

export default JobboardsTab;
