import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TrendingUp, TrendingDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCompareDisplayText, getComparisonValue } from "@/lib/marketingCompare";
import { WeeklyFunnelDropOff, type WeeklyFunnelDatum, type WeeklyFunnelSeries } from "@/components/recruitment-intern/WeeklyFunnelDropOff";
import { ChartTableToggle } from "@/components/recruitment-intern/ChartTableToggle";
import { MARKETING_COLORS } from "@/data/marketingHubData";
import type { DateRange } from "react-day-picker";
import type { DeltaMode } from "@/components/marketing/DeltaCell";

interface Props {
  dateRange: DateRange;
  compareRange: DateRange | null;
  deltaMode?: DeltaMode;
}

const AFDELINGEN = ["Sales", "Customer Service", "Marketing", "Stagiaire", "Bijbaan", "Overig"];

const BRONNEN = [
  { source: "LinkedIn", inschrijven: 1 },
  { source: "Werkzoeken CV Database", inschrijven: 1 },
  { source: "RecruitRobin", inschrijven: 0 },
  { source: "Indeed CV Database", inschrijven: 1 },
];

const LINKEDIN_WEEKLY = [
  { week: "W1", connectieverzoeken: 35, berichten: 18, inschrijvingen: 1 },
  { week: "W2", connectieverzoeken: 42, berichten: 22, inschrijvingen: 0 },
  { week: "W3", connectieverzoeken: 38, berichten: 20, inschrijvingen: 1 },
  { week: "W4", connectieverzoeken: 50, berichten: 28, inschrijvingen: 2 },
  { week: "W5", connectieverzoeken: 46, berichten: 25, inschrijvingen: 1 },
  { week: "W6", connectieverzoeken: 55, berichten: 32, inschrijvingen: 2 },
  { week: "W7", connectieverzoeken: 48, berichten: 27, inschrijvingen: 1 },
  { week: "W8", connectieverzoeken: 60, berichten: 35, inschrijvingen: 3 },
];

const BRONNEN_WEEKLY = [
  { week: "W1", values: { linkedin: 1, werkzoeken: 0, recruitrobin: 0, indeed: 1 } },
  { week: "W2", values: { linkedin: 0, werkzoeken: 1, recruitrobin: 0, indeed: 0 } },
  { week: "W3", values: { linkedin: 1, werkzoeken: 1, recruitrobin: 0, indeed: 1 } },
  { week: "W4", values: { linkedin: 2, werkzoeken: 1, recruitrobin: 1, indeed: 1 } },
  { week: "W5", values: { linkedin: 1, werkzoeken: 2, recruitrobin: 0, indeed: 1 } },
  { week: "W6", values: { linkedin: 2, werkzoeken: 1, recruitrobin: 1, indeed: 2 } },
  { week: "W7", values: { linkedin: 1, werkzoeken: 2, recruitrobin: 0, indeed: 1 } },
  { week: "W8", values: { linkedin: 3, werkzoeken: 2, recruitrobin: 1, indeed: 2 } },
];

const REDENEN = [
  { reden: "Parttime werken", aantal: 8 },
  { reden: "Thuiswerken", aantal: 6 },
  { reden: "Auto van de zaak", aantal: 5 },
  { reden: "Vindt rol niet interessant", aantal: 4 },
  { reden: "Wil buitendienst", aantal: 3 },
  { reden: "Voor andere optie gekozen", aantal: 2 },
];

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

const RecruitmentTab = ({ dateRange, compareRange }: Props) => {
  const compareLabel = getCompareDisplayText(compareRange);
  const [bronFilter, setBronFilter] = useState<Set<string>>(new Set(AFDELINGEN));

  const kpis = useMemo(() => {
    const items = [
      { label: "Inschrijvingen Recruitment", value: 3 },
      { label: "Gesprekken uit Recruitment Bronnen", value: 2 },
      { label: "Aangenomen vanuit Recruitment", value: 1 },
    ];
    return items.map((it) => ({
      ...it,
      previous: getComparisonValue(it.value, { dateRange, compareRange, seed: `rt-${it.label}` }),
    }));
  }, [dateRange, compareRange]);

  const bronFilterLabel = bronFilter.size === AFDELINGEN.length
    ? "Totaal"
    : bronFilter.size === 0
      ? "Geen afdelingen"
      : `${bronFilter.size} afdeling${bronFilter.size > 1 ? "en" : ""}`;

  const totalInschrijven = BRONNEN.reduce((s, r) => s + r.inschrijven, 0);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Inschrijvingen per bron */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Inschrijvingen per bron</CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <Filter className="mr-1.5 h-3 w-3" />{bronFilterLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="end">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Afdelingen</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setBronFilter(new Set(AFDELINGEN))}>Alles aan</Button>
                  <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setBronFilter(new Set())}>Alles uit</Button>
                </div>
              </div>
              <div className="space-y-2">
                {AFDELINGEN.map((a) => (
                  <label key={a} className="flex items-center gap-2 cursor-pointer text-sm">
                    <Checkbox
                      checked={bronFilter.has(a)}
                      onCheckedChange={() => {
                        setBronFilter((prev) => {
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
        </CardHeader>
        <CardContent>
          <WeeklyFunnelDropOff
            weeks={BRONNEN_WEEKLY}
            series={[
              { key: "linkedin", label: "LinkedIn", color: MARKETING_COLORS[0] },
              { key: "werkzoeken", label: "Werkzoeken CV Database", color: MARKETING_COLORS[1] },
              { key: "recruitrobin", label: "RecruitRobin", color: MARKETING_COLORS[2] },
              { key: "indeed", label: "Indeed CV Database", color: MARKETING_COLORS[3] },
            ]}
          />
        </CardContent>
      </Card>

      {/* LinkedIn weekly funnel */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">LinkedIn</CardTitle></CardHeader>
        <CardContent>
          <WeeklyFunnelDropOff
            weeks={LINKEDIN_WEEKLY.map((w) => ({
              week: w.week,
              values: { connectieverzoeken: w.connectieverzoeken, berichten: w.berichten, inschrijvingen: w.inschrijvingen },
            }))}
            series={[
              { key: "connectieverzoeken", label: "Connectieverzoeken", color: MARKETING_COLORS[0] },
              { key: "berichten", label: "Verstuurde berichten", color: MARKETING_COLORS[1] },
              { key: "inschrijvingen", label: "Inschrijvingen", color: MARKETING_COLORS[2] },
            ]}
          />
        </CardContent>
      </Card>

      {/* Redenen afgevallen */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Redenen afgevallen</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left font-medium text-muted-foreground">Reden</th>
                <th className="py-2 px-4 text-right font-medium text-muted-foreground w-32">Aantal</th>
              </tr>
            </thead>
            <tbody>
              {REDENEN.map((r) => (
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

export default RecruitmentTab;
