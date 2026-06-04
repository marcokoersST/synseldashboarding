import React, { useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getCompareDisplayText, getComparisonValue } from "@/lib/marketingCompare";
import DeltaCell from "@/components/marketing/DeltaCell";
import type { DeltaMode } from "@/components/marketing/DeltaCell";
import { formatCurrency, deltaPercent, MARKETING_COLORS } from "@/data/marketingHubData";
import type { DateRange } from "react-day-picker";
import EditableSpendCell from "@/components/marketing/EditableSpendCell";
import { TileInfo } from "@/components/funnel-ops/TileInfo";

const KPI_DEV_INFO: Record<string, string> = {
  "Conversions": "amount of total applies",
  "Inschrijven": 'count unique (one candidate counts as 1 every 7 days) status changes from all statusses except "acquisitie" and "in procedure" to "inschrijven", but only if the "Bron" does NOT contain "RCM" or "Recruit Robin" or "Campus"',
  "Cost per Inschrijving": "Cost per inschrijving = totaal ad spend / inschrijven",
};

interface Props {
  dateRange: DateRange;
  compareRange: DateRange | null;
  deltaMode?: DeltaMode;
}

type SortKey = "name" | "conversions" | "registrations" | "spend" | "cpr";

type UnitLabel = "Sales" | "Stage" | "HR";

interface Row {
  board: string;
  category: UnitLabel; // campaign label = sales/stage/HR
  conversions: number;
  registrations: number;
  spend: number;
  unit: UnitLabel;
}

const CAMPAIGNS: UnitLabel[] = ["Sales", "Stage", "HR"];

const RAW: Row[] = [
  // Indeed
  { board: "Indeed", category: "Sales", conversions: 142, registrations: 98, spend: 4200, unit: "Sales" },
  { board: "Indeed", category: "Stage", conversions: 66, registrations: 44, spend: 2100, unit: "Stage" },
  { board: "Indeed", category: "HR", conversions: 67, registrations: 45, spend: 2100, unit: "HR" },
  // Werkzoeken.nl
  { board: "Werkzoeken.nl", category: "Sales", conversions: 89, registrations: 61, spend: 2800, unit: "Sales" },
  { board: "Werkzoeken.nl", category: "Stage", conversions: 44, registrations: 30, spend: 1300, unit: "Stage" },
  { board: "Werkzoeken.nl", category: "HR", conversions: 34, registrations: 22, spend: 1400, unit: "HR" },
  // Facebook (was Technicus.nl)
  { board: "Facebook", category: "Sales", conversions: 54, registrations: 36, spend: 1800, unit: "Sales" },
  { board: "Facebook", category: "Stage", conversions: 42, registrations: 28, spend: 1400, unit: "Stage" },
  { board: "Facebook", category: "HR", conversions: 24, registrations: 16, spend: 900, unit: "HR" },
  // Jobster
  { board: "Jobster", category: "Sales", conversions: 52, registrations: 36, spend: 0, unit: "Sales" },
  { board: "Jobster", category: "Stage", conversions: 38, registrations: 25, spend: 0, unit: "Stage" },
  { board: "Jobster", category: "HR", conversions: 21, registrations: 14, spend: 0, unit: "HR" },
  // Google Ads
  { board: "Google Ads", category: "Sales", conversions: 110, registrations: 74, spend: 3800, unit: "Sales" },
  { board: "Google Ads", category: "Stage", conversions: 48, registrations: 32, spend: 1600, unit: "Stage" },
  { board: "Google Ads", category: "HR", conversions: 31, registrations: 21, spend: 1100, unit: "HR" },
  // TikTok
  { board: "TikTok", category: "Sales", conversions: 64, registrations: 42, spend: 2100, unit: "Sales" },
  { board: "TikTok", category: "Stage", conversions: 28, registrations: 18, spend: 900, unit: "Stage" },
  { board: "TikTok", category: "HR", conversions: 12, registrations: 8, spend: 500, unit: "HR" },
];

const REDENEN_AFGEWEZEN = [
  { reden: "Woont te ver", aantal: 12 },
  { reden: "Parttime werken", aantal: 9 },
  { reden: "Slecht CV", aantal: 7 },
  { reden: "Niet Nederlands", aantal: 5 },
  { reden: "Niet passend", aantal: 4 },
];

function totals(data: Row[]) {
  return data.reduce(
    (acc, r) => ({
      conversions: acc.conversions + r.conversions,
      registrations: acc.registrations + r.registrations,
      spend: acc.spend + r.spend,
    }),
    { conversions: 0, registrations: 0, spend: 0 }
  );
}

function aggregateByUnit(data: Row[]) {
  const grouped = new Map<string, { registrations: number; acquisitions: number }>();
  for (const row of data) {
    const existing = grouped.get(row.unit) || { registrations: 0, acquisitions: 0 };
    existing.registrations += row.registrations;
    existing.acquisitions += row.conversions;
    grouped.set(row.unit, existing);
  }
  return Array.from(grouped.entries()).map(([unit, vals]) => ({ unit, ...vals }));
}

const RecruitmentMarketingTab = ({ dateRange, compareRange, deltaMode = "percent" }: Props) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("registrations");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showConversion, setShowConversion] = useState(false);
  const [manualSpends, setManualSpends] = useState<Record<string, number>>({});

  const handleSaveSpend = useCallback((key: string, value: number) => {
    setManualSpends(prev => ({ ...prev, [key]: value }));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const row of RAW) {
      const arr = map.get(row.board) || [];
      arr.push(row);
      map.set(row.board, arr);
    }
    const parents = Array.from(map.entries()).map(([board, children]) => ({
      board,
      conversions: children.reduce((s, c) => s + c.conversions, 0),
      registrations: children.reduce((s, c) => s + c.registrations, 0),
      spend: children.reduce((s, c) => s + c.spend, 0),
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
  }, [sortKey, sortDir]);

  const grand = useMemo(() => totals(RAW), []);
  const unitChart = useMemo(() => aggregateByUnit(RAW), []);
  const grandCpr = grand.registrations > 0 ? grand.spend / grand.registrations : 0;
  const grandCpc = grand.conversions > 0 ? grand.spend / grand.conversions : 0;
  const compareText = getCompareDisplayText(compareRange);

  const kpis = useMemo(() => {
    const prev = {
      conversions: getComparisonValue(grand.conversions, { dateRange, compareRange, seed: "rm-conversions" }),
      registrations: getComparisonValue(grand.registrations, { dateRange, compareRange, seed: "rm-registrations" }),
      spend: getComparisonValue(grand.spend, { dateRange, compareRange, seed: "rm-spend" }),
    };
    const prevCpr = prev.registrations > 0 ? prev.spend / prev.registrations : 0;
    return [
      { label: "Conversions", value: grand.conversions, prevValue: prev.conversions, delta: deltaPercent(grand.conversions, prev.conversions) },
      { label: "Inschrijven", value: grand.registrations, prevValue: prev.registrations, delta: deltaPercent(grand.registrations, prev.registrations) },
      { label: "Cost per Inschrijving", value: grandCpr, prevValue: prevCpr, delta: deltaPercent(grandCpr, prevCpr), format: "currency", invertDelta: true },
    ] as { label: string; value: number; prevValue: number; delta: number | null; format?: string; invertDelta?: boolean }[];
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
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                  <TileInfo title={kpi.label} what={KPI_DEV_INFO[kpi.label] ?? ""} />
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

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">Bron</CardTitle>
            <TileInfo
              title="Bron"
              what={`rows are the sources "bron" only include "Indeed CPC", "Google Ad", "Facebook CPC", "Werkzoeken.nl CPC", "LinkedIn CPC", "Jobster" and "TikTok".
% Bem. = inschrijven * 100 / conversions
CPA = spend / conversions
Cost/Inschrijven = spend / Inschrijven`}
            />
          </div>
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
                  {visCols.map((col) => (
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
                  const isOpen = expanded.has(parent.board);
                  const cpr = parent.registrations > 0 ? parent.spend / parent.registrations : 0;
                  const cpc = parent.conversions > 0 ? parent.spend / parent.conversions : 0;
                  const bemPct = parent.conversions > 0 ? (parent.registrations / parent.conversions) * 100 : 0;
                  const parentSpendMissing = parent.spend === 0 && manualSpends[parent.board] === undefined;
                  return (
                    <React.Fragment key={parent.board}>
                      <tr className="border-b transition-colors cursor-pointer hover:bg-muted/50" onClick={() => toggle(parent.board)}>
                        <td className="p-4 align-middle font-semibold">
                          <div className="flex items-center gap-1">
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            {parent.board}
                          </div>
                        </td>
                        <td className="p-4 align-middle font-semibold">{dc(parent.conversions, `rm-${parent.board}-conv`)}</td>
                        <td className="p-4 align-middle font-semibold">{dc(parent.registrations, `rm-${parent.board}-reg`)}</td>
                        {showConversion && <td className="p-4 align-middle font-semibold">{dc(bemPct, `rm-${parent.board}-bem`, "percentage", false, prevBemPct(parent.conversions, parent.registrations, `rm-${parent.board}-conv`, `rm-${parent.board}-reg`))}</td>}
                        {showConversion && <td className="p-4 align-middle font-semibold">{parentSpendMissing ? <span className="text-red-500 text-xs font-medium">—</span> : dc(cpr, `rm-${parent.board}-cpr`, "currency", true)}</td>}
                        {showConversion && <td className="p-4 align-middle font-semibold">{parentSpendMissing ? <span className="text-red-500 text-xs font-medium">—</span> : dc(cpc, `rm-${parent.board}-cpc`, "currency", true)}</td>}
                        <td className="p-4 align-middle font-semibold">
                          <EditableSpendCell
                            spend={parent.spend}
                            manualSpend={manualSpends[parent.board]}
                            onSave={(v) => handleSaveSpend(parent.board, v)}
                          >
                            {dc(manualSpends[parent.board] ?? parent.spend, `rm-${parent.board}-spend`, "currency")}
                          </EditableSpendCell>
                        </td>
                      </tr>
                      {isOpen && parent.children.map((child) => {
                        const childCpr = child.registrations > 0 ? child.spend / child.registrations : 0;
                        const childCpc = child.conversions > 0 ? child.spend / child.conversions : 0;
                        const childBemPct = child.conversions > 0 ? (child.registrations / child.conversions) * 100 : 0;
                        const childKey = `${parent.board}-${child.category}`;
                        const childSpendMissing = child.spend === 0 && manualSpends[childKey] === undefined;
                        return (
                          <tr key={childKey} className="border-b transition-colors bg-muted/20">
                            <td className="p-4 pl-10 align-middle text-muted-foreground">{child.category}</td>
                            <td className="p-4 align-middle">{dc(child.conversions, `rm-${childKey}-conv`)}</td>
                            <td className="p-4 align-middle">{dc(child.registrations, `rm-${childKey}-reg`)}</td>
                            {showConversion && <td className="p-4 align-middle">{dc(childBemPct, `rm-${childKey}-bem`, "percentage", false, prevBemPct(child.conversions, child.registrations, `rm-${childKey}-conv`, `rm-${childKey}-reg`))}</td>}
                            {showConversion && <td className="p-4 align-middle">{childSpendMissing ? <span className="text-red-500 text-xs font-medium">—</span> : dc(childCpr, `rm-${childKey}-cpr`, "currency", true)}</td>}
                            {showConversion && <td className="p-4 align-middle">{childSpendMissing ? <span className="text-red-500 text-xs font-medium">—</span> : dc(childCpc, `rm-${childKey}-cpc`, "currency", true)}</td>}
                            <td className="p-4 align-middle">
                              <EditableSpendCell
                                spend={child.spend}
                                manualSpend={manualSpends[childKey]}
                                onSave={(v) => handleSaveSpend(childKey, v)}
                              >
                                {dc(manualSpends[childKey] ?? child.spend, `rm-${childKey}-spend`, "currency")}
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
          <div className="border-t bg-muted/30">
            <table className="w-full text-sm table-fixed">
              <tbody>
                <tr className="font-bold">
                  <td className="p-4">Totaal</td>
                  <td className="p-4">{dc(grand.conversions, "rm-total-conv")}</td>
                  <td className="p-4">{dc(grand.registrations, "rm-total-reg")}</td>
                  {showConversion && <td className="p-4">{dc(grand.conversions > 0 ? (grand.registrations / grand.conversions) * 100 : 0, "rm-total-bem", "percentage", false, prevBemPct(grand.conversions, grand.registrations, "rm-total-conv", "rm-total-reg"))}</td>}
                  {showConversion && <td className="p-4">{dc(grandCpr, "rm-total-cpr", "currency", true)}</td>}
                  {showConversion && <td className="p-4">{dc(grandCpc, "rm-total-cpc", "currency", true)}</td>}
                  <td className="p-4">{dc(grand.spend, "rm-total-spend", "currency")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Per Unit</CardTitle>
          <TileInfo
            title="Per Unit"
            what={'showcase the amount of inschrijven and cost per inschrijving per unit ("functie" from rcrm)'}
          />
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={unitChart} layout="vertical" margin={{ left: 20 }}>
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

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Redenen afgewezen</CardTitle>
          <TileInfo
            title="Redenen afgewezen"
            what={'Contains a count list of the amount of candidate put on status "afgewezen" and given a "Reden afgewezen", list options are the options from under "Reden afgewezen" from rcrm exclude candidate profiles which contain the sources "RCM: Indeed cv database", "RCM: Werkzoeken cv database", "Recruit Robin".'}
          />
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left font-medium text-muted-foreground">Reden</th>
                <th className="py-2 px-4 text-right font-medium text-muted-foreground w-32">Aantal</th>
              </tr>
            </thead>
            <tbody>
              {REDENEN_AFGEWEZEN.map((r) => (
                <tr key={r.reden} className="border-b hover:bg-muted/50">
                  <td className="font-medium py-2 px-4">{r.reden}</td>
                  <td className="text-right tabular-nums py-2 px-4">{r.aantal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecruitmentMarketingTab;
