import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TrendingUp, TrendingDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { getCompareDisplayText, getComparisonValue } from "@/lib/marketingCompare";
import { MARKETING_COLORS } from "@/data/marketingHubData";
import type { DateRange } from "react-day-picker";
import { FunnelDropOff } from "@/components/recruitment-intern/FunnelDropOff";

interface Props {
  dateRange: DateRange;
  compareRange: DateRange | null;
  deltaMode?: string;
  onTabChange: (tab: any) => void;
}

const AFDELINGEN = ["Sales", "Customer Service", "Marketing", "Stagiaire", "Bijbaan", "Overig"];

function deltaPct(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

function DeltaBadge({ current, previous, compareLabel, invert }: { current: number; previous: number; compareLabel: string; invert?: boolean }) {
  const d = deltaPct(current, previous);
  if (d === null) return null;
  const isPositive = invert ? d < 0 : d > 0;
  return (
    <div className={cn("flex items-center gap-1 mt-1 text-xs", isPositive ? "text-emerald-600" : "text-red-500")}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      <span>{d > 0 ? "+" : ""}{d.toFixed(1)}%</span>
      <span className="text-muted-foreground ml-1">{compareLabel}</span>
    </div>
  );
}

function ProgressBar({ current, previous, invert }: { current: number; previous: number; invert?: boolean }) {
  const d = deltaPct(current, previous);
  const isPositive = d === null ? true : invert ? d < 0 : d > 0;
  const ratio = previous > 0 ? Math.min((current / previous) * 100, 150) : 100;
  const ratioLabel = previous > 0 ? Math.round((current / previous) * 100) : 100;
  return (
    <div className="mt-2">
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", isPositive ? "bg-emerald-500" : "bg-red-400")}
          style={{ width: `${Math.min(ratio / 1.5 * 100 / 100, 100)}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-0.5">{ratioLabel}% van vorige week</p>
    </div>
  );
}

const FUNNEL_RAW = [
  { stage: "Conversions", value: 42 },
  { stage: "Inschrijvingen", value: 28 },
  { stage: "Assessment", value: 18 },
  { stage: "Eerste gesprek", value: 12 },
  { stage: "Tweede gesprek", value: 6 },
  { stage: "Aangenomen", value: 2 },
];

const FUNNEL_DATA = FUNNEL_RAW.map((s, i, arr) => {
  const prev = i === 0 ? null : arr[i - 1].value;
  const dropPct = prev ? Math.round(((prev - s.value) / prev) * 100) : 0;
  return { ...s, dropLabel: i === 0 ? "" : `-${dropPct}%` };
});

const WEEKLY_HIRES = [
  { week: "W1", hires: 1 },
  { week: "W2", hires: 2 },
  { week: "W3", hires: 1 },
  { week: "W4", hires: 3 },
  { week: "W5", hires: 2 },
  { week: "W6", hires: 4 },
  { week: "W7", hires: 2 },
  { week: "W8", hires: 3 },
];

// FunnelDropOff is imported from shared component below

const RecruitmentOverviewTab = ({ dateRange, compareRange }: Props) => {
  const compareLabel = getCompareDisplayText(compareRange);

  const kpis = useMemo(() => {
    const items = [
      { label: "Inschrijven", value: 4 },
      { label: "Gesprekken", value: 5 },
      { label: "Aangenomen", value: 2 },
    ];
    return items.map((it) => ({
      ...it,
      previous: getComparisonValue(it.value, { dateRange, compareRange, seed: `ri-${it.label}` }),
    }));
  }, [dateRange, compareRange]);

  const [selectedAfdelingen, setSelectedAfdelingen] = useState<Set<string>>(new Set(AFDELINGEN));

  const inschrijvingenRecruitment = 2;
  const inschrijvingenMarketing = 3;
  const prevRecruitment = useMemo(
    () => getComparisonValue(inschrijvingenRecruitment, { dateRange, compareRange, seed: "ri-recruitment" }),
    [dateRange, compareRange],
  );
  const prevMarketing = useMemo(
    () => getComparisonValue(inschrijvingenMarketing, { dateRange, compareRange, seed: "ri-marketing" }),
    [dateRange, compareRange],
  );

  const afdelingFilterLabel = selectedAfdelingen.size === AFDELINGEN.length
    ? "Afdelingen"
    : selectedAfdelingen.size === 0
      ? "Geen afdelingen"
      : `${selectedAfdelingen.size} afdeling${selectedAfdelingen.size > 1 ? "en" : ""}`;

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-foreground">{kpi.value.toLocaleString("nl-NL")}</p>
              <DeltaBadge current={kpi.value} previous={kpi.previous} compareLabel={compareLabel} />
              <ProgressBar current={kpi.value} previous={kpi.previous} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inflow section with afdeling filter */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-foreground">Inflow</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              <Filter className="mr-1.5 h-3 w-3" />{afdelingFilterLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Afdelingen</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setSelectedAfdelingen(new Set(AFDELINGEN))}>Alles aan</Button>
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setSelectedAfdelingen(new Set())}>Alles uit</Button>
              </div>
            </div>
            <div className="space-y-2">
              {AFDELINGEN.map((a) => (
                <label key={a} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={selectedAfdelingen.has(a)}
                    onCheckedChange={() => {
                      setSelectedAfdelingen((prev) => {
                        const n = new Set(prev);
                        n.has(a) ? n.delete(a) : n.add(a);
                        return n;
                      });
                    }}
                  />
                  {a}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Inflow scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-1">Inschrijvingen Recruitment</p>
            <p className="text-2xl font-bold">{inschrijvingenRecruitment}</p>
            <DeltaBadge current={inschrijvingenRecruitment} previous={prevRecruitment} compareLabel={compareLabel} />
            <ProgressBar current={inschrijvingenRecruitment} previous={prevRecruitment} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-1">Inschrijvingen Marketing</p>
            <p className="text-2xl font-bold">{inschrijvingenMarketing}</p>
            <DeltaBadge current={inschrijvingenMarketing} previous={prevMarketing} compareLabel={compareLabel} />
            <ProgressBar current={inschrijvingenMarketing} previous={prevMarketing} />
          </CardContent>
        </Card>
      </div>

      {/* Funnel drop-off chart */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Funnel drop-off</CardTitle>
          <ChartTableToggle view={funnelView} onChange={setFunnelView} />
        </CardHeader>
        <CardContent className={funnelView === "table" ? "p-0" : undefined}>
          {funnelView === "chart" ? (
            <FunnelDropOff data={FUNNEL_DATA} />
          ) : (
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Stage</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Aantal</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Drop-off vs vorige</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {FUNNEL_DATA.map((d, i) => (
                  <tr key={d.stage} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{d.stage}</td>
                    <td className="p-4 align-middle text-right tabular-nums">{d.value}</td>
                    <td className="p-4 align-middle text-right tabular-nums text-muted-foreground">{i === 0 ? "—" : d.dropLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Aangenomen per week */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Aangenomen per week</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={WEEKLY_HIRES} margin={{ left: 10, right: 30, top: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[0, (m: number) => Math.ceil(m * 1.5)]} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", fontSize: "12px" }} />
              <Bar dataKey="hires" name="Aangenomen" fill={MARKETING_COLORS[1]} radius={[6, 6, 0, 0]} barSize={32}>
                <LabelList dataKey="hires" position="top" style={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Highlights */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Highlights</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-2 rounded bg-emerald-500/10">
              <span className="text-muted-foreground">Best presterende bron conversies</span>
              <span className="font-semibold text-emerald-700">30</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-emerald-500/10">
              <span className="text-muted-foreground">Best presterende bron gesprekken</span>
              <span className="font-semibold text-emerald-700">12</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-emerald-500/10">
              <span className="text-muted-foreground">Best presterende vacature</span>
              <span className="font-semibold text-emerald-700">Junior Sales Consultant</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-blue-500/10">
              <span className="text-muted-foreground">Laagste CPA</span>
              <span className="font-semibold text-blue-700">€34,12</span>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default RecruitmentOverviewTab;
