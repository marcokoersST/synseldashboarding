import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TrendingUp, TrendingDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCompareDisplayText, getComparisonValue } from "@/lib/marketingCompare";
import { WeeklyFunnelDropOff, type WeeklyFunnelDatum, type WeeklyFunnelSeries } from "@/components/recruitment-intern/WeeklyFunnelDropOff";
import { TileInfo } from "@/components/funnel-ops/TileInfo";

const KPI_DEV_INFO: Record<string, string> = {
  "Inschrijvingen Recruitment": `count unique (one candidate counts as 1 every 7 days) status changes from all statusses except "acquisitie" and "in procedure" to "inschrijven", but only if the "Bron" contains "RCM" or "Recruit Robin" or "Campus"`,
  "Gesprekken uit Recruitment Bronnen": `count amount of meetings names containing "1" or "2" but only if the "Bron" contains "RCM" or "Recruit Robin" or "Campus"`,
  "Aangenomen vanuit Recruitment": `count unique (one candidate counts as 1 every 7 days) status changes from all statusses to "Aangenomen" but only if the "Bron" contains "RCM" or "Recruit Robin" or "Campus"`,
};
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

const BRON_SERIES: WeeklyFunnelSeries[] = [
  { key: "linkedin", label: "LinkedIn", color: MARKETING_COLORS[0] },
  { key: "werkzoeken", label: "Werkzoeken CV Database", color: MARKETING_COLORS[1] },
  { key: "recruitrobin", label: "RecruitRobin", color: MARKETING_COLORS[2] },
  { key: "indeed", label: "Indeed CV Database", color: MARKETING_COLORS[3] },
];

const LINKEDIN_WEEKS: WeeklyFunnelDatum[] = LINKEDIN_WEEKLY.map((w) => ({
  week: w.week,
  values: { connectieverzoeken: w.connectieverzoeken, berichten: w.berichten, inschrijvingen: w.inschrijvingen },
}));

const LINKEDIN_SERIES: WeeklyFunnelSeries[] = [
  { key: "connectieverzoeken", label: "Connectieverzoeken", color: MARKETING_COLORS[0] },
  { key: "berichten", label: "Verstuurde berichten", color: MARKETING_COLORS[1] },
  { key: "inschrijvingen", label: "Inschrijvingen", color: MARKETING_COLORS[2] },
];

const CV_DB_WEEKLY = [
  { week: "W1", bekeken: 120, downloads: 28, inschrijvingen: 1 },
  { week: "W2", bekeken: 135, downloads: 32, inschrijvingen: 0 },
  { week: "W3", bekeken: 128, downloads: 30, inschrijvingen: 2 },
  { week: "W4", bekeken: 150, downloads: 38, inschrijvingen: 1 },
  { week: "W5", bekeken: 142, downloads: 34, inschrijvingen: 1 },
  { week: "W6", bekeken: 165, downloads: 42, inschrijvingen: 2 },
  { week: "W7", bekeken: 155, downloads: 40, inschrijvingen: 1 },
  { week: "W8", bekeken: 180, downloads: 48, inschrijvingen: 3 },
];

const CV_DB_WEEKS: WeeklyFunnelDatum[] = CV_DB_WEEKLY.map((w) => ({
  week: w.week,
  values: { bekeken: w.bekeken, downloads: w.downloads, inschrijvingen: w.inschrijvingen },
}));

const CV_DB_SERIES: WeeklyFunnelSeries[] = [
  { key: "bekeken", label: "Bekeken cv's", color: MARKETING_COLORS[0] },
  { key: "downloads", label: "CV downloads", color: MARKETING_COLORS[1] },
  { key: "inschrijvingen", label: "Inschrijvingen", color: MARKETING_COLORS[2] },
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
  const [bronView, setBronView] = useState<"chart" | "table">("table");
  const [linkedinView, setLinkedinView] = useState<"chart" | "table">("table");
  const [cvDbView, setCvDbView] = useState<"chart" | "table">("table");

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

  const renderWeeklyTable = (weeks: WeeklyFunnelDatum[], series: WeeklyFunnelSeries[]) => (
    <div className="max-h-[480px] overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground sticky top-0 bg-background z-10">Bron</th>
            {weeks.map((w) => (
              <th key={w.week} className="h-12 px-3 text-right align-middle font-medium text-muted-foreground sticky top-0 bg-background z-10">
                {w.week}
              </th>
            ))}
            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground sticky top-0 bg-background z-10">Totaal</th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {series.map((s) => {
            const total = weeks.reduce((sum, w) => sum + (w.values[s.key] ?? 0), 0);
            const avg = total / Math.max(weeks.length, 1);
            return (
              <tr key={s.key} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4 align-middle font-medium">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                    {s.label}
                  </div>
                </td>
                {weeks.map((w) => {
                  const v = w.values[s.key] ?? 0;
                  const below = avg > 0 && v < avg;
                  const pct = avg > 0 ? ((v - avg) / avg) * 100 : 0;
                  return (
                    <td key={w.week} className={`p-3 align-middle text-right tabular-nums ${below ? "text-destructive" : ""}`}>
                      <div>{v}</div>
                      <div className={`text-[10px] font-medium ${below ? "text-destructive/80" : "invisible"}`}>
                        {below ? `${pct.toFixed(0)}%` : "0%"}
                      </div>
                    </td>
                  );
                })}
                <td className="p-4 align-middle text-right tabular-nums font-semibold">{total}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="border-t bg-muted/30">
          <tr className="font-bold">
            <td className="p-4">Totaal</td>
            {weeks.map((w) => (
              <td key={w.week} className="p-3 text-right tabular-nums">
                {series.reduce((sum, s) => sum + (w.values[s.key] ?? 0), 0)}
              </td>
            ))}
            <td className="p-4 text-right tabular-nums">
              {weeks.reduce((sum, w) => sum + series.reduce((s2, s) => s2 + (w.values[s.key] ?? 0), 0), 0)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );


  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                {KPI_DEV_INFO[kpi.label] && (
                  <TileInfo title={kpi.label} what={KPI_DEV_INFO[kpi.label]} />
                )}
              </div>
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
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Inschrijvingen per bron</CardTitle>
            <TileInfo
              title="Inschrijvingen per bron"
              what={`"inschrijven" per week and source, includes the Recruitment sources "RCM: Indeed cv database" and "RCM: LinkedIn" and "RCM: Werkzoeken cv database" and "RCM Retentie Whatsapp" and "Recruit Robin" and "Campus".`}
            />
          </div>
          <div className="flex items-center gap-2">
            <ChartTableToggle view={bronView} onChange={setBronView} />
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
          </div>
        </CardHeader>
        <CardContent className={bronView === "table" ? "p-0" : undefined}>
          {bronView === "chart" ? (
            <WeeklyFunnelDropOff
              weeks={BRONNEN_WEEKLY}
              series={BRON_SERIES}
            />
          ) : (
            renderWeeklyTable(BRONNEN_WEEKLY, BRON_SERIES)
          )}
        </CardContent>
      </Card>

      {/* LinkedIn weekly funnel */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">LinkedIn</CardTitle>
            <TileInfo
              title="LinkedIn"
              what={`Data for the source "RCM: LinkedIn".
Connectieverzoeken = amount of connection invites send.
Verstuurde berichten = amount of send messages, only count one message per connection (is it possible to gather this data via the recruiter seat?).
Inschrijvingen = Inschrijven amount only for the source "RCM: LinkedIn".`}
            />
          </div>
          <ChartTableToggle view={linkedinView} onChange={setLinkedinView} />
        </CardHeader>
        <CardContent className={linkedinView === "table" ? "p-0" : undefined}>
          {linkedinView === "chart" ? (
            <WeeklyFunnelDropOff weeks={LINKEDIN_WEEKS} series={LINKEDIN_SERIES} />
          ) : (
            renderWeeklyTable(LINKEDIN_WEEKS, LINKEDIN_SERIES)
          )}
        </CardContent>
      </Card>

      {/* CV databases weekly funnel */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">CV databases</CardTitle>
            <TileInfo
              title="CV databases"
              what={`Data from the sources "RCM: Indeed cv database", "RCM: Werkzoeken cv database", "Recruit Robin".
Bekeken cv's = amount of opened profiles on the platforms.
CV downloads = amount of resume downloads.
Inschrijvingen = Inschrijven amount for only these sources.`}
            />
          </div>
          <ChartTableToggle view={cvDbView} onChange={setCvDbView} />
        </CardHeader>
        <CardContent className={cvDbView === "table" ? "p-0" : undefined}>
          {cvDbView === "chart" ? (
            <WeeklyFunnelDropOff weeks={CV_DB_WEEKS} series={CV_DB_SERIES} />
          ) : (
            renderWeeklyTable(CV_DB_WEEKS, CV_DB_SERIES)
          )}
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
