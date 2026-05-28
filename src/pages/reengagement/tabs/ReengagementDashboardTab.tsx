import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { TrendingUp, TrendingDown, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getCompareDisplayText, getComparisonValue } from "@/lib/marketingCompare";
import { deltaPercent, MARKETING_COLORS } from "@/data/marketingHubData";
import type { DateRange } from "react-day-picker";

interface Props {
  dateRange: DateRange;
  compareRange: DateRange | null;
  deltaMode?: string;
  onTabChange: (tab: any) => void;
}

const BERICHT_TYPES = [
  "Niet kunnen spreken",
  "Bezig met Studie",
  "ZZP/Freelance",
  "Nu niet werkzoekend",
  "Nieuwe baan eigen",
  "Blijft bij huidige werkgever",
];

const FUNCTIEGROEPEN = ["Engineering Mechanical", "Engineering Allround", "Operators", "Productie"];
const MEDIA = ["Whatsapp", "Mail"];
const CATEGORIEEN = ["A+", "A", "B"];
const PERIODES = ["Per dag", "Per week", "Per maand"];

// Mock data per berichttype
const berichtData: Record<string, { verzonden: number; gelezen: number; reactie: number; inschrijven: number; failed: number }> = {
  "Niet kunnen spreken": { verzonden: 210, gelezen: 178, reactie: 32, inschrijven: 18, failed: 6 },
  "Bezig met Studie": { verzonden: 140, gelezen: 119, reactie: 24, inschrijven: 12, failed: 3 },
  "ZZP/Freelance": { verzonden: 165, gelezen: 132, reactie: 22, inschrijven: 9, failed: 4 },
  "Nu niet werkzoekend": { verzonden: 198, gelezen: 154, reactie: 26, inschrijven: 11, failed: 5 },
  "Nieuwe baan eigen": { verzonden: 122, gelezen: 96, reactie: 17, inschrijven: 7, failed: 2 },
  "Blijft bij huidige werkgever": { verzonden: 88, gelezen: 64, reactie: 9, inschrijven: 3, failed: 2 },
};

const trendBaseData = [
  { verzonden: 180, inschrijven: 12 },
  { verzonden: 195, inschrijven: 14 },
  { verzonden: 210, inschrijven: 13 },
  { verzonden: 188, inschrijven: 16 },
  { verzonden: 225, inschrijven: 18 },
  { verzonden: 240, inschrijven: 21 },
  { verzonden: 215, inschrijven: 17 },
];

const PERIODE_LABELS: Record<string, string[]> = {
  "Per week": ["W1", "W2", "W3", "W4", "W5", "W6", "W7"],
  "Per dag": ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"],
  "Per maand": ["December", "Januari", "Februari", "Maart", "April", "Mei"],
};

function DeltaBadge({ current, previous, compareLabel, invert }: { current: number; previous: number; compareLabel: string; invert?: boolean }) {
  const d = deltaPercent(current, previous);
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
  const d = deltaPercent(current, previous);
  const isPositive = d === null ? true : invert ? d < 0 : d > 0;
  const ratio = previous > 0 ? Math.min((current / previous) * 100, 150) : 100;
  const ratioLabel = previous > 0 ? Math.round((current / previous) * 100) : 100;
  return (
    <div className="mt-2">
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", isPositive ? "bg-emerald-500" : "bg-red-400")}
          style={{ width: `${Math.min(ratio / 1.5, 100)}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-0.5">{ratioLabel}% van vorige week</p>
    </div>
  );
}

interface MultiFilterProps {
  label: string;
  options: string[];
  selected: Set<string>;
  onChange: (s: Set<string>) => void;
}
const MultiFilter = ({ label, options, selected, onChange }: MultiFilterProps) => {
  const buttonLabel = selected.size === options.length
    ? `Alle`
    : selected.size === 0
      ? `Geen`
      : `${selected.size}`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs h-8 px-2 gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60">
          <span className="text-[11px] uppercase tracking-wide">{label}</span>
          <span className="font-medium text-foreground">{buttonLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{label}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => onChange(new Set(options))}>Alles aan</Button>
            <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => onChange(new Set())}>Alles uit</Button>
          </div>
        </div>
        <div className="space-y-2">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox checked={selected.has(opt)} onCheckedChange={() => {
                const n = new Set(selected); n.has(opt) ? n.delete(opt) : n.add(opt); onChange(n);
              }} />
              {opt}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface SingleFilterProps {
  options: string[];
  selected: string;
  onChange: (v: string) => void;
  label?: string;
}
const SingleFilter = ({ options, selected, onChange, label }: SingleFilterProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs h-8 px-2 gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60">
          {label && <span className="text-[11px] uppercase tracking-wide">{label}</span>}
          <span className="font-medium text-foreground">{selected}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="space-y-1">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={cn(
                "w-full text-left text-sm rounded px-2 py-1.5 hover:bg-muted transition-colors",
                selected === opt && "bg-primary/10 text-primary font-medium"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface ViewBarProps {
  scope: string;
  periode?: string;
  setPeriode?: (v: string) => void;
  functiegroep: Set<string>;
  setFunctiegroep: (s: Set<string>) => void;
  berichttype: Set<string>;
  setBerichttype: (s: Set<string>) => void;
  medium: Set<string>;
  setMedium: (s: Set<string>) => void;
  categorie: Set<string>;
  setCategorie: (s: Set<string>) => void;
  showPeriode?: boolean;
}
const ViewBar = ({ scope, periode, setPeriode, functiegroep, setFunctiegroep, berichttype, setBerichttype, medium, setMedium, categorie, setCategorie, showPeriode }: ViewBarProps) => {
  return (
    <div className="flex items-center gap-1 flex-wrap rounded-md border border-dashed border-border bg-muted/30 px-3 py-1.5">
      <div className="flex items-center gap-1.5 mr-2 text-xs text-muted-foreground">
        <Eye className="h-3.5 w-3.5" />
        <span className="font-medium">Weergave {scope}</span>
      </div>
      <div className="h-4 w-px bg-border mr-1" />
      {showPeriode && periode && setPeriode && (
        <SingleFilter options={PERIODES} selected={periode} onChange={setPeriode} label="Periode" />
      )}
      <MultiFilter label="Functiegroep" options={FUNCTIEGROEPEN} selected={functiegroep} onChange={setFunctiegroep} />
      <MultiFilter label="Berichttype" options={BERICHT_TYPES} selected={berichttype} onChange={setBerichttype} />
      <MultiFilter label="Medium" options={MEDIA} selected={medium} onChange={setMedium} />
      <MultiFilter label="Categorie" options={CATEGORIEEN} selected={categorie} onChange={setCategorie} />
    </div>
  );
};

const ReengagementDashboardTab = ({ dateRange, compareRange }: Props) => {
  const compareLabel = getCompareDisplayText(compareRange);

  // Chart-specific view state
  const [periode, setPeriode] = useState<string>("Per dag");
  const [chartFunctiegroep, setChartFunctiegroep] = useState<Set<string>>(new Set(FUNCTIEGROEPEN));
  const [chartBerichttype, setChartBerichttype] = useState<Set<string>>(new Set(BERICHT_TYPES));
  const [chartMedium, setChartMedium] = useState<Set<string>>(new Set(MEDIA));
  const [chartCategorie, setChartCategorie] = useState<Set<string>>(new Set(CATEGORIEEN));
  // Table-specific view state
  const [tableFunctiegroep, setTableFunctiegroep] = useState<Set<string>>(new Set(FUNCTIEGROEPEN));
  const [tableBerichttype, setTableBerichttype] = useState<Set<string>>(new Set(BERICHT_TYPES));
  const [tableMedium, setTableMedium] = useState<Set<string>>(new Set(MEDIA));
  const [tableCategorie, setTableCategorie] = useState<Set<string>>(new Set(CATEGORIEEN));
  const [showPct, setShowPct] = useState(false);

  const kpis = useMemo(() => {
    const verzonden = 923;
    const reacties = 130;
    const inschrijven = 15;
    return [
      {
        label: "Verzonden",
        value: verzonden,
        previous: getComparisonValue(verzonden, { dateRange, compareRange, seed: "re-verzonden" }),
      },
      {
        label: "Reacties",
        value: reacties,
        previous: getComparisonValue(reacties, { dateRange, compareRange, seed: "re-reacties" }),
      },
      {
        label: "Inschrijven",
        value: inschrijven,
        previous: getComparisonValue(inschrijven, { dateRange, compareRange, seed: "re-inschrijven" }),
      },
    ];
  }, [dateRange, compareRange]);

  // Chart scaling — driven by chart view state
  const chartFilterScale = useMemo(() => {
    const fg = chartFunctiegroep.size / FUNCTIEGROEPEN.length || 0.01;
    const md = chartMedium.size / MEDIA.length || 0.01;
    const cat = chartCategorie.size / CATEGORIEEN.length || 0.01;
    return fg * md * cat;
  }, [chartFunctiegroep, chartMedium, chartCategorie]);

  // Table scaling — driven by table view state
  const tableFilterScale = useMemo(() => {
    const fg = tableFunctiegroep.size / FUNCTIEGROEPEN.length || 0.01;
    const md = tableMedium.size / MEDIA.length || 0.01;
    const cat = tableCategorie.size / CATEGORIEEN.length || 0.01;
    return fg * md * cat;
  }, [tableFunctiegroep, tableMedium, tableCategorie]);

  const scaleTable = (n: number) => Math.round(n * tableFilterScale);

  const filteredRows = useMemo(
    () => BERICHT_TYPES.filter((b) => tableBerichttype.has(b)).map((b) => {
      const d = berichtData[b];
      return {
        name: b,
        verzonden: scaleTable(d.verzonden),
        gelezen: scaleTable(d.gelezen),
        reactie: scaleTable(d.reactie),
        inschrijven: scaleTable(d.inschrijven),
        failed: scaleTable(d.failed),
      };
    }),
    [tableBerichttype, tableFilterScale]
  );

  const totals = useMemo(() => filteredRows.reduce(
    (acc, r) => ({
      verzonden: acc.verzonden + r.verzonden,
      gelezen: acc.gelezen + r.gelezen,
      reactie: acc.reactie + r.reactie,
      inschrijven: acc.inschrijven + r.inschrijven,
      failed: acc.failed + r.failed,
    }),
    { verzonden: 0, gelezen: 0, reactie: 0, inschrijven: 0, failed: 0 }
  ), [filteredRows]);

  // Trend uses chart view state
  const chartBerichtScale = chartBerichttype.size / BERICHT_TYPES.length || 0.01;
  const scaledTrendData = useMemo(() => {
    const labels = PERIODE_LABELS[periode] || PERIODE_LABELS["Per week"];
    return trendBaseData.slice(0, labels.length).map((d, i) => ({
      label: labels[i],
      verzonden: Math.round(d.verzonden * chartFilterScale * chartBerichtScale),
      inschrijven: Math.round(d.inschrijven * chartFilterScale * chartBerichtScale),
    }));
  }, [chartFilterScale, chartBerichtScale, periode]);

  const pct = (n: number, d: number) => d > 0 ? `${((n / d) * 100).toFixed(1)}%` : "0%";

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


      {/* Chart view bar */}
      <ViewBar
        scope="grafiek"
        showPeriode
        periode={periode}
        setPeriode={setPeriode}
        functiegroep={functiegroep}
        setFunctiegroep={setFunctiegroep}
        berichttype={berichttype}
        setBerichttype={setBerichttype}
        medium={medium}
        setMedium={setMedium}
        categorie={categorie}
        setCategorie={setCategorie}
      />

      {/* Trend chart */}
      <Card>
        <CardContent className="p-5">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={scaledTrendData} margin={{ left: 10, right: 20, top: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} label={{ value: "Verzonden", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" } }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} label={{ value: "Inschrijven", angle: 90, position: "insideRight", style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" } }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line yAxisId="left" type="monotone" dataKey="verzonden" name="Verzonden" stroke={MARKETING_COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="inschrijven" name="Inschrijven" stroke={MARKETING_COLORS[1]} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table view bar */}
      <ViewBar
        scope="tabel"
        functiegroep={functiegroep}
        setFunctiegroep={setFunctiegroep}
        berichttype={berichttype}
        setBerichttype={setBerichttype}
        medium={medium}
        setMedium={setMedium}
        categorie={categorie}
        setCategorie={setCategorie}
      />

      {/* Full-width berichttype table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-end">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <Switch checked={showPct} onCheckedChange={setShowPct} />
            Show %
          </label>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3 text-left font-medium text-muted-foreground">Berichttype</th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground">Verzonden</th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground">Gelezen</th>
                  {showPct && <th className="py-2 px-3 text-right font-medium text-muted-foreground">% Gelezen</th>}
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground">Reactie</th>
                  {showPct && <th className="py-2 px-3 text-right font-medium text-muted-foreground">% Reactie</th>}
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground">Inschrijven</th>
                  {showPct && <th className="py-2 px-3 text-right font-medium text-muted-foreground">% Inschrijven</th>}
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground">Verzonden Failed</th>
                  {showPct && <th className="py-2 px-3 text-right font-medium text-muted-foreground">% Failed</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.name} className="border-b hover:bg-muted/50">
                    <td className="font-medium py-2 px-3">{r.name}</td>
                    <td className="text-right tabular-nums py-2 px-3">{r.verzonden}</td>
                    <td className="text-right tabular-nums py-2 px-3">{r.gelezen}</td>
                    {showPct && <td className="text-right tabular-nums py-2 px-3 text-muted-foreground">{pct(r.gelezen, r.verzonden)}</td>}
                    <td className="text-right tabular-nums py-2 px-3">{r.reactie}</td>
                    {showPct && <td className="text-right tabular-nums py-2 px-3 text-muted-foreground">{pct(r.reactie, r.verzonden)}</td>}
                    <td className="text-right tabular-nums py-2 px-3">{r.inschrijven}</td>
                    {showPct && <td className="text-right tabular-nums py-2 px-3 text-muted-foreground">{pct(r.inschrijven, r.verzonden)}</td>}
                    <td className="text-right tabular-nums py-2 px-3">{r.failed}</td>
                    {showPct && <td className="text-right tabular-nums py-2 px-3 text-muted-foreground">{pct(r.failed, r.verzonden)}</td>}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-muted/50 font-semibold">
                  <td className="py-2 px-3">Totaal</td>
                  <td className="text-right tabular-nums py-2 px-3">{totals.verzonden}</td>
                  <td className="text-right tabular-nums py-2 px-3">{totals.gelezen}</td>
                  {showPct && <td className="text-right tabular-nums py-2 px-3 text-muted-foreground">{pct(totals.gelezen, totals.verzonden)}</td>}
                  <td className="text-right tabular-nums py-2 px-3">{totals.reactie}</td>
                  {showPct && <td className="text-right tabular-nums py-2 px-3 text-muted-foreground">{pct(totals.reactie, totals.verzonden)}</td>}
                  <td className="text-right tabular-nums py-2 px-3">{totals.inschrijven}</td>
                  {showPct && <td className="text-right tabular-nums py-2 px-3 text-muted-foreground">{pct(totals.inschrijven, totals.verzonden)}</td>}
                  <td className="text-right tabular-nums py-2 px-3">{totals.failed}</td>
                  {showPct && <td className="text-right tabular-nums py-2 px-3 text-muted-foreground">{pct(totals.failed, totals.verzonden)}</td>}
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Highlights */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Highlights</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-2 rounded bg-emerald-500/10">
              <span className="text-muted-foreground">Best presterende bericht type</span>
              <span className="font-semibold text-emerald-700">Niet kunnen spreken (18)</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-blue-500/10">
              <span className="text-muted-foreground">Hoogste reactie %</span>
              <span className="font-semibold text-blue-700">Bezig met studie (8,6%)</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-red-500/10">
              <span className="text-muted-foreground">Snelst dalende % Inschrijven</span>
              <span className="font-semibold text-red-700">ZZP/Freelance (-6,4%)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReengagementDashboardTab;
