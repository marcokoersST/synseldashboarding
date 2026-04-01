import { useState, useMemo, useCallback } from "react";
import { TVDashboardLayout, useTVCompact } from "@/components/tv/TVDashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown, Users } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";
import {
  getRanglijstenTimeSeries,
  getTopConsultants,
  getAllConsultantNames,
  getAllUnits,
  CHART_COLORS,
  type ColumnTimeSeries
} from "@/data/ranglijstenChartData";
import { getCurrentWeekNumber, getCurrentPeriodNumber } from "@/data/ranglijstenData";

function Content() {
  const isCompact = useTVCompact();
  const currentWeek = getCurrentWeekNumber();
  const currentPeriod = getCurrentPeriodNumber();

  const [year, setYear] = useState(2026);
  const [mode, setMode] = useState<"week" | "periode">("week");
  const [fromNum, setFromNum] = useState(() => Math.max(1, currentWeek - 8));
  const [toNum, setToNum] = useState(currentWeek);
  const [selectedUnits, setSelectedUnits] = useState<string[]>(getAllUnits());
  const [selectedConsultants, setSelectedConsultants] = useState<Record<number, string[]>>({});
  const [showTeamTotal, setShowTeamTotal] = useState(false);

  const maxNum = mode === "week" ? 53 : 13;

  const handleModeChange = useCallback((newMode: string) => {
    const m = newMode as "week" | "periode";
    setMode(m);
    if (m === "week") {
      setFromNum(Math.max(1, currentWeek - 8));
      setToNum(currentWeek);
    } else {
      setFromNum(1);
      setToNum(currentPeriod);
    }
    setSelectedConsultants({});
  }, [currentWeek, currentPeriod]);

  const timeSeries = useMemo(() =>
    getRanglijstenTimeSeries(year, mode, fromNum, toNum, selectedUnits.length < getAllUnits().length ? selectedUnits : undefined),
    [year, mode, fromNum, toNum, selectedUnits]
  );

  const getConsultantsForCol = useCallback((colIdx: number) => {
    if (selectedConsultants[colIdx]?.length) return selectedConsultants[colIdx];
    return getTopConsultants(year, mode, toNum, colIdx, 5,
      selectedUnits.length < getAllUnits().length ? selectedUnits : undefined);
  }, [selectedConsultants, year, mode, toNum, selectedUnits]);

  const allNames = useMemo(() =>
    getAllConsultantNames(year, mode, toNum),
    [year, mode, toNum]
  );

  const toggleUnit = (unit: string) => {
    setSelectedUnits(prev =>
      prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit]
    );
  };

  const setConsultantsForCol = (colIdx: number, names: string[]) => {
    setSelectedConsultants(prev => ({ ...prev, [colIdx]: names }));
  };

  const nums = Array.from({ length: maxNum }, (_, i) => i + 1);

  return (
    <div className={cn("space-y-4", isCompact && "space-y-2")}>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
          <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{[2024, 2025, 2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
        </Select>

        <Select value={mode} onValueChange={handleModeChange}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="periode">Periode</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground">Van</span>
        <Select value={String(fromNum)} onValueChange={v => setFromNum(Number(v))}>
          <SelectTrigger className="w-20 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{nums.filter(n => n <= toNum).map(n =>
            <SelectItem key={n} value={String(n)}>{mode === "week" ? `W${n}` : `P${n}`}</SelectItem>
          )}</SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground">t/m</span>
        <Select value={String(toNum)} onValueChange={v => setToNum(Number(v))}>
          <SelectTrigger className="w-20 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{nums.filter(n => n >= fromNum).map(n =>
            <SelectItem key={n} value={String(n)}>{mode === "week" ? `W${n}` : `P${n}`}</SelectItem>
          )}</SelectContent>
        </Select>

        {/* Unit filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
              <Users className="w-3 h-3" />
              Units ({selectedUnits.length})
              <ChevronDown className="w-3 h-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="flex gap-1 mb-2">
              <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => setSelectedUnits(getAllUnits())}>Alle aan</Button>
              <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => setSelectedUnits([])}>Alle uit</Button>
            </div>
            {getAllUnits().map(unit => (
              <label key={unit} className="flex items-center gap-2 py-1 px-1 text-xs cursor-pointer hover:bg-muted rounded">
                <Checkbox checked={selectedUnits.includes(unit)} onCheckedChange={() => toggleUnit(unit)} />
                {unit}
              </label>
            ))}
          </PopoverContent>
        </Popover>

        <label className="flex items-center gap-1.5 text-xs cursor-pointer ml-auto">
          <Checkbox checked={showTeamTotal} onCheckedChange={v => setShowTeamTotal(!!v)} />
          Team totaal
        </label>
      </div>

      {/* Charts Grid */}
      <div className={cn("grid gap-4", isCompact ? "grid-cols-2 gap-2" : "grid-cols-1 md:grid-cols-2")}>
        {timeSeries.map((col, colIdx) => (
          <ChartCard
            key={col.title}
            col={col}
            colIdx={colIdx}
            consultants={getConsultantsForCol(colIdx)}
            allNames={allNames}
            onConsultantsChange={(names) => setConsultantsForCol(colIdx, names)}
            showTeamTotal={showTeamTotal}
            isCompact={isCompact}
          />
        ))}
      </div>
    </div>
  );
}

interface ChartCardProps {
  col: ColumnTimeSeries;
  colIdx: number;
  consultants: string[];
  allNames: string[];
  onConsultantsChange: (names: string[]) => void;
  showTeamTotal: boolean;
  isCompact: boolean;
}

function shortDisplayName(fullName: string): string {
  const parts = fullName.split(" ");
  if (parts.length <= 2) return fullName;
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

function ChartCard({ col, colIdx, consultants, allNames, onConsultantsChange, showTeamTotal, isCompact }: ChartCardProps) {
  const [showSecondary, setShowSecondary] = useState(false);

  const data = showSecondary && col.secondaryData ? col.secondaryData : col.primaryData;
  const label = showSecondary && col.secondaryLabel ? col.secondaryLabel : col.primaryLabel;

  // Compute team total line
  const chartData = useMemo(() => {
    if (!showTeamTotal) return data;
    return data.map(point => {
      const total = Object.entries(point).reduce((sum, [key, val]) => {
        if (key === "label" || key === "num") return sum;
        return sum + (typeof val === "number" ? val : 0);
      }, 0);
      return { ...point, "Team Totaal": total };
    });
  }, [data, showTeamTotal]);

  const isIntakePercent = colIdx === 3 && showSecondary;

  return (
    <div className={cn(
      "bg-card border border-border rounded-lg p-3",
      isCompact && "p-2"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className={cn("font-semibold text-foreground", isCompact ? "text-xs" : "text-sm")}>{col.title}</h3>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{label}</Badge>
        </div>
        <div className="flex items-center gap-1">
          {col.secondaryLabel && (
            <Button
              variant={showSecondary ? "default" : "outline"}
              size="sm"
              className="h-5 text-[10px] px-1.5"
              onClick={() => setShowSecondary(!showSecondary)}
            >
              {col.secondaryLabel}
            </Button>
          )}
          {/* Consultant selector */}
          <ConsultantSelector
            selected={consultants}
            allNames={allNames}
            onChange={onConsultantsChange}
          />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={isCompact ? 180 : 240}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="label" tick={{ fontSize: isCompact ? 9 : 11 }} className="fill-muted-foreground" />
          <YAxis tick={{ fontSize: isCompact ? 9 : 11 }} className="fill-muted-foreground"
            {...(isIntakePercent ? { domain: [0, 100], tickFormatter: (v: number) => `${v}%` } : {})}
          />
          <Tooltip
            contentStyle={{ fontSize: 11, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
            labelStyle={{ fontWeight: 600 }}
            formatter={(value: number, name: string) => [
              isIntakePercent ? `${value}%` : value,
              shortDisplayName(name)
            ]}
          />
          <Legend
            formatter={(value: string) => <span className="text-[10px]">{shortDisplayName(value)}</span>}
          />
          {consultants.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
              connectNulls
            />
          ))}
          {showTeamTotal && (
            <Line
              type="monotone"
              dataKey="Team Totaal"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ConsultantSelector({ selected, allNames, onChange }: {
  selected: string[];
  allNames: string[];
  onChange: (names: string[]) => void;
}) {
  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter(n => n !== name));
    } else if (selected.length < 10) {
      onChange([...selected, name]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-5 text-[10px] px-1.5 gap-0.5">
          {selected.length} <ChevronDown className="w-2.5 h-2.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2 max-h-72 overflow-y-auto" align="end">
        <div className="flex gap-1 mb-2">
          <Button variant="ghost" size="sm" className="text-[10px] h-5" onClick={() => onChange(allNames.slice(0, 5))}>Top 5</Button>
          <Button variant="ghost" size="sm" className="text-[10px] h-5" onClick={() => onChange([])}>Geen</Button>
        </div>
        {allNames.map(name => (
          <label key={name} className="flex items-center gap-1.5 py-0.5 px-1 text-[11px] cursor-pointer hover:bg-muted rounded">
            <Checkbox checked={selected.includes(name)} onCheckedChange={() => toggle(name)} className="w-3 h-3" />
            {shortDisplayName(name)}
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export default function TVRanglijstenGrafiek() {
  return (
    <TVDashboardLayout title="Ranglijsten Grafiek">
      <Content />
    </TVDashboardLayout>
  );
}
