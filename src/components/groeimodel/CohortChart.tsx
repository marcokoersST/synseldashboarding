import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  Customized,
} from "recharts";
import {
  lifecyclesWithBreakEven,
  formatEuro,
  monthToPeriod,
} from "@/data/groeimodelData";
import { useMemo, useRef, useState, useCallback } from "react";
import { DevNote } from "./DevNote";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Hand } from "lucide-react";
import { FilterSummary } from "./FilterSummary";

interface CohortChartProps {
  filterUnits: string[];
  filterStatus: "all" | "active" | "terminated";
  filterYears: number[];
  filterPeriodRange: [number, number];
}

export function CohortChart({
  filterUnits,
  filterStatus,
  filterYears,
  filterPeriodRange,
}: CohortChartProps) {
  const filtered = useMemo(() => {
    return lifecyclesWithBreakEven.filter(({ lifecycle }) => {
      if (filterUnits.length > 0 && !filterUnits.includes(lifecycle.unit)) return false;
      if (filterStatus === "active" && lifecycle.endDate) return false;
      if (filterStatus === "terminated" && !lifecycle.endDate) return false;
      if (filterYears.length > 0 && !filterYears.includes(lifecycle.startDate.getFullYear())) return false;
      const p = monthToPeriod(lifecycle.startDate.getMonth());
      if (p < filterPeriodRange[0] || p > filterPeriodRange[1]) return false;
      return true;
    });
  }, [filterUnits, filterStatus, filterYears, filterPeriodRange]);

  const { data, consultants, minBal, maxBal, maxMonths, breakEvenPoints } = useMemo(() => {
    const maxMonths = Math.max(...filtered.map((x) => x.result.totalMonths), 1);
    const consultants = filtered.map(({ lifecycle, result }) => ({
      id: lifecycle.id,
      name: lifecycle.name,
      color: lifecycle.unitColor,
      series: result.cumulativeSeries,
      breakEvenMonth: result.breakEvenMonth,
    }));
    const data: Record<string, number | null>[] = [];
    let minBal = 0;
    let maxBal = 0;
    for (let m = 0; m < maxMonths; m++) {
      const row: Record<string, number | null> = { month: m };
      consultants.forEach((c) => {
        const point = c.series[m];
        if (point) {
          row[`c_${c.id}`] = point.balance;
          if (point.balance < minBal) minBal = point.balance;
          if (point.balance > maxBal) maxBal = point.balance;
        } else {
          row[`c_${c.id}`] = null;
        }
      });
      data.push(row);
    }
    const breakEvenPoints = consultants
      .filter((c) => c.breakEvenMonth !== null)
      .map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        month: c.breakEvenMonth as number,
        balance: c.series[c.breakEvenMonth as number]?.balance ?? 0,
      }));
    return { data, consultants, minBal, maxBal, maxMonths, breakEvenPoints };
  }, [filtered]);

  // Zoom & pan state — domain on x-axis, in months
  const [domain, setDomain] = useState<[number, number]>([0, maxMonths - 1]);
  const [panMode, setPanMode] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startDomain: [number, number] } | null>(null);

  // Reset domain when filter changes the maxMonths significantly
  useMemo(() => {
    setDomain([0, Math.max(1, maxMonths - 1)]);
  }, [maxMonths]);

  const zoom = (factor: number) => {
    setDomain(([a, b]) => {
      const center = (a + b) / 2;
      const half = ((b - a) / 2) * factor;
      const min = Math.max(0, center - half);
      const max = Math.min(maxMonths - 1, center + half);
      if (max - min < 1) return [a, b];
      return [min, max];
    });
  };

  const reset = () => setDomain([0, Math.max(1, maxMonths - 1)]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!panMode) return;
      dragRef.current = { startX: e.clientX, startDomain: domain };
    },
    [panMode, domain],
  );
  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!panMode || !dragRef.current || !wrapperRef.current) return;
      const w = wrapperRef.current.clientWidth;
      const span = dragRef.current.startDomain[1] - dragRef.current.startDomain[0];
      const dxMonths = ((e.clientX - dragRef.current.startX) / w) * span;
      let newMin = dragRef.current.startDomain[0] - dxMonths;
      let newMax = dragRef.current.startDomain[1] - dxMonths;
      if (newMin < 0) {
        newMax -= newMin;
        newMin = 0;
      }
      if (newMax > maxMonths - 1) {
        newMin -= newMax - (maxMonths - 1);
        newMax = maxMonths - 1;
      }
      setDomain([Math.max(0, newMin), Math.min(maxMonths - 1, newMax)]);
    },
    [panMode, maxMonths],
  );
  const endDrag = () => {
    dragRef.current = null;
  };

  // Custom layer for animated break-even points using chart's internal scales
  const BreakEvenDots = (props: any) => {
    const { xAxisMap, yAxisMap } = props;
    const xAxis = xAxisMap?.[Object.keys(xAxisMap || {})[0]];
    const yAxis = yAxisMap?.[Object.keys(yAxisMap || {})[0]];
    if (!xAxis || !yAxis) return null;
    const xScale = xAxis.scale;
    const yScale = yAxis.scale;
    return (
      <g>
        {breakEvenPoints.map((p) => {
          if (p.month < domain[0] || p.month > domain[1]) return null;
          const cx = xScale(p.month);
          const cy = yScale(p.balance);
          if (cx == null || cy == null) return null;
          return (
            <g key={p.id}>
              <circle cx={cx} cy={cy} r={5} fill={p.color} stroke="hsl(var(--background))" strokeWidth={1.5} />
              <circle cx={cx} cy={cy} r={5} fill="none" stroke={p.color} strokeWidth={2} className="pulse-ring" />
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div className="w-full">
      <FilterSummary
        years={filterYears}
        periodRange={filterPeriodRange}
        units={filterUnits}
        status={filterStatus}
        className="mb-2"
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] text-muted-foreground">
          Venster: M{Math.round(domain[0])} – M{Math.round(domain[1])}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => zoom(0.75)} title="Zoom in">
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => zoom(1.33)} title="Zoom uit">
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2" onClick={reset} title="Reset">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={panMode ? "default" : "outline"}
            size="sm"
            className="h-7 px-2"
            onClick={() => setPanMode((p) => !p)}
            title="Pan / verschuif"
          >
            <Hand className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div
        ref={wrapperRef}
        className={`w-full h-[520px] select-none ${panMode ? (dragRef.current ? "cursor-grabbing" : "cursor-grab") : ""}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 70, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              type="number"
              domain={domain}
              allowDataOverflow
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => `M${Math.round(v)}`}
              label={{
                value: "Maanden sinds startdatum",
                position: "insideBottom",
                offset: -5,
                fontSize: 11,
                fill: "hsl(var(--muted-foreground))",
              }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => formatEuro(v)}
              domain={[minBal * 1.05, maxBal * 1.05]}
            />
            <ReferenceArea y1={minBal * 1.05} y2={0} fill="hsl(var(--destructive))" fillOpacity={0.05} />
            <ReferenceArea y1={0} y2={maxBal * 1.05} fill="hsl(var(--primary))" fillOpacity={0.04} />
            <ReferenceLine
              y={0}
              stroke="hsl(var(--gold, var(--primary)))"
              strokeWidth={2}
              label={{
                value: "Break-even",
                position: "insideTopLeft",
                fontSize: 11,
                fontWeight: 600,
                fill: "hsl(var(--foreground))",
                offset: 8,
              }}
            />
            {!panMode && (
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelFormatter={(v) => `Maand ${v}`}
                formatter={(value: number, name: string) => {
                  const c = consultants.find((x) => `c_${x.id}` === name);
                  return [formatEuro(value), c?.name ?? name];
                }}
              />
            )}
            {consultants.map((c) => (
              <Line
                key={c.id}
                type="monotone"
                dataKey={`c_${c.id}`}
                stroke={c.color}
                strokeWidth={1.5}
                strokeOpacity={0.55}
                dot={false}
                connectNulls
                isAnimationActive={false}
                activeDot={panMode ? false : { r: 4 }}
              />
            ))}
            <Customized component={BreakEvenDots} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <DevNote
        story={<><strong>As a user (C-level)</strong>, I want to see each consultant's cumulative financial balance plotted over the months since their start date, with a clear pulsing marker exactly where they cross break-even, and the ability to zoom and pan into a specific period, <strong>so that</strong> I can visually identify who is still loss-making, when each one becomes profitable, and inspect dense parts of the chart in detail.</>}
        logic={`Each line shows ONE consultant. For every month since their
start date we keep a running total:

                  ┌─ this month's margin earned
                  │
   Balance(M) =   Σ  ( Margin  −  Cost )      from month 0 → M
                  │
                  └─ this month's salary + overhead

   Balance < 0   →   still in startup phase   (red zone)
   Balance = 0   →   BREAK-EVEN  (the gold line + pulsing dot)
   Balance > 0   →   profitable                (green zone)

The pulsing dot on each line marks the FIRST month that
consultant's balance reached zero. Zoom and pan let you
focus on a specific window of months.`}
      />
    </div>
  );
}
