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
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { DevNote } from "./DevNote";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Hand, Play, LogOut } from "lucide-react";
import { FilterSummary } from "./FilterSummary";
import { makeSplitScale } from "./splitScale";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface CohortChartProps {
  filterUnits: string[];
  filterStatus: "all" | "active" | "terminated";
  filterYears: number[];
  filterPeriodRange: [number, number];
}

type AnimPhase = "intro-zoom" | "drawing" | "zoom-out" | "done";

// Split-scale helper lives in ./splitScale (imported above) so it can be unit-tested.

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

  const { data, consultants, minBal, maxBal, maxMonths, breakEvenPoints, exitPoints, breakEvenMaxMonth } = useMemo(() => {
    const maxMonths = Math.max(...filtered.map((x) => x.result.totalMonths), 1);
    const consultants = filtered.map(({ lifecycle, result }) => ({
      id: lifecycle.id,
      name: lifecycle.name,
      color: lifecycle.unitColor,
      series: result.cumulativeSeries,
      breakEvenMonth: result.breakEvenMonth,
      exitMonth: result.exitMonth,
    }));
    const data: Record<string, number | null>[] = [];
    let minBal = 0;
    let maxBal = 0;
    for (let m = 0; m < maxMonths; m++) {
      const row: Record<string, number | null> = { month: m };
      consultants.forEach((c) => {
        const point = c.series[m];
        if (point) {
          // Active phase line
          row[`c_${c.id}`] = point.postExit ? null : point.balance;
          // Post-exit phase line (overlaps at exit month for continuity)
          if (point.postExit || point.isExit) {
            row[`x_${c.id}`] = point.balance;
          } else {
            row[`x_${c.id}`] = null;
          }
          if (point.balance < minBal) minBal = point.balance;
          if (point.balance > maxBal) maxBal = point.balance;
        } else {
          row[`c_${c.id}`] = null;
          row[`x_${c.id}`] = null;
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
    const breakEvenMaxMonth = breakEvenPoints.length
      ? Math.max(...breakEvenPoints.map((p) => p.month))
      : Math.min(maxMonths - 1, 12);
    const exitPoints = filtered
      .filter(({ result }) => result.exitMonth !== null)
      .map(({ lifecycle, result }) => ({
        id: lifecycle.id,
        name: lifecycle.name,
        color: lifecycle.unitColor,
        month: result.exitMonth as number,
        balance: result.cumulativeSeries[result.exitMonth as number]?.balance ?? 0,
        exitDate: lifecycle.endDate as Date,
      }));
    return { data, consultants, minBal, maxBal, maxMonths, breakEvenPoints, exitPoints, breakEvenMaxMonth };
  }, [filtered]);

  // Split scale based on actual range with padding
  const splitScale = useMemo(
    () => makeSplitScale(minBal * 1.05, maxBal * 1.05),
    [minBal, maxBal],
  );

  // Transform data through split scale
  const transformedData = useMemo(() => {
    return data.map((row) => {
      const newRow: Record<string, number | null> = { month: row.month as number };
      Object.keys(row).forEach((k) => {
        if (k === "month") return;
        const v = row[k];
        newRow[k] = v == null ? null : splitScale.transform(v);
      });
      return newRow;
    });
  }, [data, splitScale]);

  // Y-axis ticks: pick nice values then transform
  const yTicks = useMemo(() => {
    const candidates = [minBal, -50_000, -25_000, -10_000, 0, 25_000, 50_000, 100_000, 200_000, 350_000, 500_000, 750_000, 1_000_000, maxBal];
    const inRange = candidates.filter((v) => v >= minBal * 1.05 && v <= maxBal * 1.05);
    const unique = Array.from(new Set(inRange.map((v) => Math.round(v))));
    return unique.sort((a, b) => a - b).map((v) => splitScale.transform(v));
  }, [minBal, maxBal, splitScale]);

  const tickToReal = useMemo(() => {
    const map = new Map<number, number>();
    [minBal, -50_000, -25_000, -10_000, 0, 25_000, 50_000, 100_000, 200_000, 350_000, 500_000, 750_000, 1_000_000, maxBal]
      .filter((v) => v >= minBal * 1.05 && v <= maxBal * 1.05)
      .forEach((v) => map.set(splitScale.transform(v), v));
    return map;
  }, [minBal, maxBal, splitScale]);

  // Zoom & pan state
  const [domain, setDomain] = useState<[number, number]>([0, maxMonths - 1]);
  const [panMode, setPanMode] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startDomain: [number, number] } | null>(null);

  // Animation state
  const [animPhase, setAnimPhase] = useState<AnimPhase>("intro-zoom");
  const [animTick, setAnimTick] = useState(0); // forces re-render during draw
  const animTimers = useRef<number[]>([]);
  const animRafRef = useRef<number | null>(null);

  // Exit marker hover/focus tooltip
  const [exitHover, setExitHover] = useState<
    | { id: string; name: string; date: Date; balance: number; x: number; y: number }
    | null
  >(null);

  // Hover-highlight state for line emphasis
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  // Reduced-motion preference
  const prefersReducedMotion = useReducedMotion();

  // Hard-reset every line path: cancel transitions, hide instantly via dashoffset.
  const resetLinePaths = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const paths = wrapper.querySelectorAll<SVGPathElement>(".recharts-line-curve");
    paths.forEach((path) => {
      try {
        const len = path.getTotalLength() || 1;
        path.style.transition = "none";
        path.style.strokeDasharray = `${len}`;
        path.style.strokeDashoffset = `${len}`;
        // Force reflow so the "hidden" state is committed before the next transition.
        void path.getBoundingClientRect();
      } catch {
        // ignore
      }
    });
  }, []);

  const startAnimation = useCallback(() => {
    // 1. Cancel anything in flight
    animTimers.current.forEach((t) => window.clearTimeout(t));
    animTimers.current = [];
    if (animRafRef.current !== null) {
      cancelAnimationFrame(animRafRef.current);
      animRafRef.current = null;
    }
    setExitHover(null);

    // Reduced-motion: jump straight to done state with full domain & visible lines
    if (prefersReducedMotion) {
      setAnimPhase("done");
      setDomain([0, Math.max(1, maxMonths - 1)]);
      // Make sure any previously-hidden paths become visible
      const wrapper = wrapperRef.current;
      if (wrapper) {
        const paths = wrapper.querySelectorAll<SVGPathElement>(".recharts-line-curve");
        paths.forEach((path) => {
          path.style.transition = "none";
          path.style.strokeDasharray = "none";
          path.style.strokeDashoffset = "0";
        });
      }
      return;
    }

    // 2. Reset to phase 1 + zoomed-in domain + hide lines immediately
    setAnimPhase("intro-zoom");
    setDomain([0, Math.min(maxMonths - 1, breakEvenMaxMonth + 2)]);
    // Hide lines now AND on next frame (covers the case where new paths haven't mounted yet)
    resetLinePaths();
    requestAnimationFrame(() => resetLinePaths());

    // 3. Phase progression
    const t1 = window.setTimeout(() => {
      setAnimPhase("drawing");
      setAnimTick((t) => t + 1); // re-trigger the draw effect even if phase was already "drawing"
    }, 400);
    const t2 = window.setTimeout(() => {
      setAnimPhase("zoom-out");
      const startTime = performance.now();
      const startMax = Math.min(maxMonths - 1, breakEvenMaxMonth + 2);
      const endMax = maxMonths - 1;
      const duration = 1000;
      const tick = (now: number) => {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        setDomain([0, startMax + (endMax - startMax) * eased]);
        if (t < 1) {
          animRafRef.current = requestAnimationFrame(tick);
        } else {
          animRafRef.current = null;
        }
      };
      animRafRef.current = requestAnimationFrame(tick);
    }, 2200);
    const t3 = window.setTimeout(() => {
      setAnimPhase("done");
    }, 3300);
    animTimers.current.push(t1, t2, t3);
  }, [maxMonths, breakEvenMaxMonth, resetLinePaths, prefersReducedMotion]);

  // Trigger intro animation ONLY on initial mount + manual replay (not on filter changes).
  // Filter changes still re-render data but do not restart the intro.
  useEffect(() => {
    startAnimation();
    // Keyboard shortcut: R = replay
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        startAnimation();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      animTimers.current.forEach((t) => window.clearTimeout(t));
      if (animRafRef.current !== null) {
        cancelAnimationFrame(animRafRef.current);
        animRafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Path-draw animation: apply strokeDasharray to all path elements after draw phase begins
  useEffect(() => {
    if (animPhase !== "drawing") return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    // Defer to allow recharts to render paths
    const id = window.setTimeout(() => {
      const paths = wrapper.querySelectorAll<SVGPathElement>(".recharts-line-curve");
      paths.forEach((path, idx) => {
        try {
          const len = path.getTotalLength();
          path.style.transition = "none";
          path.style.strokeDasharray = `${len}`;
          path.style.strokeDashoffset = `${len}`;
          // Force reflow
          void path.getBoundingClientRect();
          path.style.transition = `stroke-dashoffset 1600ms cubic-bezier(0.22, 1, 0.36, 1) ${idx * 30}ms`;
          path.style.strokeDashoffset = "0";
        } catch {
          // ignore
        }
      });
    }, 30);
    return () => window.clearTimeout(id);
  }, [animPhase, animTick]);

  // Custom layer for break-even pulsing dots
  const BreakEvenDots = (props: any) => {
    const { xAxisMap, yAxisMap } = props;
    const xAxis = xAxisMap?.[Object.keys(xAxisMap || {})[0]];
    const yAxis = yAxisMap?.[Object.keys(yAxisMap || {})[0]];
    if (!xAxis || !yAxis) return null;
    const xScale = xAxis.scale;
    const yScale = yAxis.scale;
    const visible = animPhase === "zoom-out" || animPhase === "done";
    return (
      <g style={{ opacity: visible ? 1 : 0, transition: "opacity 300ms ease-out" }}>
        {breakEvenPoints.map((p) => {
          if (p.month < domain[0] || p.month > domain[1]) return null;
          const cx = xScale(p.month);
          const cy = yScale(splitScale.transform(p.balance));
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

  // Custom layer for exit markers
  const ExitMarkers = (props: any) => {
    const { xAxisMap, yAxisMap } = props;
    const xAxis = xAxisMap?.[Object.keys(xAxisMap || {})[0]];
    const yAxis = yAxisMap?.[Object.keys(yAxisMap || {})[0]];
    if (!xAxis || !yAxis) return null;
    const xScale = xAxis.scale;
    const yScale = yAxis.scale;
    const visible = animPhase === "done";
    return (
      <g style={{ opacity: visible ? 1 : 0, transition: "opacity 400ms ease-out" }}>
        {exitPoints.map((p) => {
          if (p.month < domain[0] || p.month > domain[1]) return null;
          const cx = xScale(p.month);
          const cy = yScale(splitScale.transform(p.balance));
          if (cx == null || cy == null) return null;
          const showTip = (clientX: number, clientY: number) => {
            const rect = wrapperRef.current?.getBoundingClientRect();
            setExitHover({
              id: String(p.id),
              name: p.name,
              date: p.exitDate,
              balance: p.balance,
              x: clientX - (rect?.left ?? 0),
              y: clientY - (rect?.top ?? 0),
            });
          };
          const onEnter = (e: React.MouseEvent) => showTip(e.clientX, e.clientY);
          const onLeave = () => setExitHover(null);
          const onFocus = () => {
            // Position tip near the marker itself when keyboard-focused
            const rect = wrapperRef.current?.getBoundingClientRect();
            setExitHover({
              id: String(p.id),
              name: p.name,
              date: p.exitDate,
              balance: p.balance,
              x: cx,
              y: cy,
            });
            void rect;
          };
          return (
            <g
              key={String(p.id)}
              tabIndex={0}
              role="img"
              aria-label={`Uit dienst — ${p.name} op ${formatExitDate(p.exitDate)}, saldo ${formatEuro(p.balance)}`}
              style={{ cursor: "pointer", outline: "none" }}
              className="focus-visible:[&>circle:nth-child(2)]:stroke-foreground"
              onMouseEnter={onEnter}
              onMouseMove={onEnter}
              onMouseLeave={onLeave}
              onFocus={onFocus}
              onBlur={onLeave}
            >
              <circle cx={cx} cy={cy} r={10} fill="transparent" />
              <circle cx={cx} cy={cy} r={8} fill="hsl(var(--destructive))" stroke="hsl(var(--background))" strokeWidth={2} />
              <foreignObject x={cx - 6} y={cy - 6} width={12} height={12} style={{ pointerEvents: "none" }}>
                <div style={{ color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LogOut size={10} />
                </div>
              </foreignObject>
            </g>
          );
        })}
      </g>
    );
  };

  const formatExitDate = (d: Date) =>
    d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

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
          <Button variant="outline" size="sm" className="h-7 px-2" onClick={startAnimation} title="Animatie opnieuw afspelen (R)" aria-label="Animatie opnieuw afspelen">
            <Play className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => zoom(0.75)} title="Zoom in" aria-label="Zoom in">
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => zoom(1.33)} title="Zoom uit" aria-label="Zoom uit">
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2" onClick={reset} title="Reset venster" aria-label="Reset venster">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={panMode ? "default" : "outline"}
            size="sm"
            className="h-7 px-2"
            onClick={() => setPanMode((p) => !p)}
            title="Pan / verschuif"
            aria-label="Pan / verschuif"
            aria-pressed={panMode}
          >
            <Hand className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div
        ref={wrapperRef}
        className={`relative w-full h-[520px] select-none ${panMode ? (dragRef.current ? "cursor-grabbing" : "cursor-grab") : ""}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={transformedData} margin={{ top: 10, right: 70, left: 10, bottom: 20 }}>
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
              ticks={yTicks}
              tickFormatter={(v) => {
                const real = tickToReal.get(v);
                return real != null ? formatEuro(real) : "";
              }}
              domain={[splitScale.displayMin, splitScale.displayMax]}
            />
            <ReferenceArea y1={splitScale.displayMin} y2={0} fill="hsl(var(--destructive))" fillOpacity={0.05} />
            <ReferenceArea y1={0} y2={splitScale.displayMax} fill="hsl(var(--primary))" fillOpacity={0.04} />
            <ReferenceLine
              y={0}
              stroke="hsl(var(--destructive))"
              strokeWidth={2.5}
              label={{
                value: "Break-even",
                position: "insideTopLeft",
                fontSize: 11,
                fontWeight: 700,
                fill: "hsl(var(--destructive))",
                offset: 8,
              }}
            />
            {!panMode && animPhase === "done" && (
              <Tooltip
                wrapperStyle={{ outline: "none" }}
                cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "3 3" }}
                content={(tipProps: any) => {
                  const { active, payload, label, coordinate } = tipProps || {};
                  if (!active || !payload || !payload.length) return null;
                  const cy = coordinate?.y ?? 0;
                  const items = payload
                    .filter((p: any) => p.value != null)
                    .map((p: any) => {
                      const c = consultants.find((x) => `c_${x.id}` === p.dataKey || `x_${x.id}` === p.dataKey);
                      // Recharts payload entries don't always carry pixel-y; approximate by re-projecting via the value.
                      // We can compute distance using transformed value vs cursor's data-Y if available.
                      const dist = Math.abs((p.value as number) - (tipProps?.payload?.[0]?.payload?.month != null ? (p.value as number) : (p.value as number)));
                      return {
                        key: String(p.dataKey),
                        name: c?.name ?? String(p.dataKey),
                        color: (p.stroke as string) || (c?.color ?? "hsl(var(--foreground))"),
                        real: splitScale.inverse(p.value as number),
                        transformedY: p.value as number,
                        dist,
                      };
                    });
                  // Sort by absolute |display-y - cursor-y in chart space|. Without per-point pixel-y,
                  // approximate with distance between transformed value and the average — good enough for ranking.
                  const cursorTransformed = items.length
                    ? items.reduce((s: number, x: any) => s + x.transformedY, 0) / items.length
                    : 0;
                  // Better proxy: use coordinate.y indirectly via re-projection of cursor; fallback to cursorTransformed.
                  void cy;
                  items.sort(
                    (a: any, b: any) =>
                      Math.abs(a.transformedY - cursorTransformed) - Math.abs(b.transformedY - cursorTransformed),
                  );
                  const top = items.slice(0, 3);
                  const rest = items.length - top.length;
                  return (
                    <div
                      style={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                        padding: "8px 10px",
                        minWidth: 180,
                      }}
                    >
                      <div className="font-semibold mb-1.5">Maand {label}</div>
                      {top.map((it: any) => (
                        <div key={it.key} className="flex items-center justify-between gap-3 py-0.5">
                          <span className="flex items-center gap-1.5 truncate">
                            <span
                              className="inline-block w-2 h-2 rounded-full shrink-0"
                              style={{ background: it.color }}
                            />
                            <span className="truncate">{it.name}</span>
                          </span>
                          <span className="font-medium">{formatEuro(it.real)}</span>
                        </div>
                      ))}
                      {rest > 0 && (
                        <div className="mt-1 pt-1 border-t border-border text-[11px] text-muted-foreground">
                          +{rest} andere consultant{rest === 1 ? "" : "s"}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            )}
            {consultants.map((c) => {
              const isHovered = hoveredLine === c.id;
              const isOther = hoveredLine !== null && hoveredLine !== c.id;
              return (
                <Line
                  key={`active_${c.id}`}
                  type="monotone"
                  dataKey={`c_${c.id}`}
                  stroke={c.color}
                  strokeWidth={isHovered ? 3 : 1.5}
                  strokeOpacity={isOther ? 0.15 : isHovered ? 1 : 0.55}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                  activeDot={panMode ? false : { r: 4 }}
                  onMouseEnter={() => setHoveredLine(c.id)}
                  onMouseLeave={() => setHoveredLine(null)}
                  style={{ transition: "stroke-opacity 300ms ease-out, stroke-width 300ms ease-out" }}
                />
              );
            })}
            {consultants
              .filter((c) => c.exitMonth !== null)
              .map((c) => {
                const isHovered = hoveredLine === c.id;
                const isOther = hoveredLine !== null && hoveredLine !== c.id;
                return (
                  <Line
                    key={`exit_${c.id}`}
                    type="monotone"
                    dataKey={`x_${c.id}`}
                    stroke={c.color}
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    strokeOpacity={isOther ? 0.1 : isHovered ? 0.9 : 0.45}
                    strokeDasharray="4 3"
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                    activeDot={panMode ? false : { r: 4 }}
                    onMouseEnter={() => setHoveredLine(c.id)}
                    onMouseLeave={() => setHoveredLine(null)}
                    style={{ transition: "stroke-opacity 300ms ease-out, stroke-width 300ms ease-out" }}
                  />
                );
              })}
            <Customized component={BreakEvenDots} />
            <Customized component={ExitMarkers} />
          </LineChart>
        </ResponsiveContainer>
        {exitHover && (
          <div
            className="pointer-events-none absolute z-50 rounded-md border border-border bg-card shadow-lg px-3 py-2 text-xs"
            style={{
              left: Math.min(exitHover.x + 14, (wrapperRef.current?.clientWidth ?? 0) - 200),
              top: Math.max(exitHover.y - 60, 4),
              minWidth: 180,
            }}
          >
            <div className="flex items-center gap-1.5 font-semibold text-destructive mb-1">
              <LogOut className="w-3 h-3" />
              Uit dienst
            </div>
            <div className="font-medium text-foreground">{exitHover.name}</div>
            <div className="text-muted-foreground mt-0.5">{formatExitDate(exitHover.date)}</div>
            <div className="mt-1.5 pt-1.5 border-t border-border flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Saldo:</span>
              <span className={`font-semibold ${exitHover.balance >= 0 ? "text-foreground" : "text-destructive"}`}>
                {formatEuro(exitHover.balance)}
              </span>
            </div>
          </div>
        )}
      </div>

      <DevNote
        story={<><strong>As a user (C-level)</strong>, I want to see each consultant's cumulative financial balance plotted over the months since their start date, with a clear pulsing marker exactly where they cross break-even, exit markers when consultants leave, and a smooth intro animation that draws the lines from the startup phase outward, <strong>so that</strong> I can visually identify who is still loss-making, when each becomes profitable, and how revenue tapers when someone exits.</>}
        logic={`Each line shows ONE consultant. Y-axis uses a split scale:
the lower 45% covers the loss zone (yMin → €0) and the upper
55% covers the profit zone (€0 → yMax) — so the startup phase
is visually amplified.

   Balance(M) =  Σ ( Margin − Cost )   from month 0 → M

   Balance < 0   →   startup phase (red zone, expanded)
   Balance = 0   →   BREAK-EVEN (red reference line + pulsing dot)
   Balance > 0   →   profitable (green zone)

When a consultant exits (endDate), a red LogOut marker is placed
at the exit month and the line continues as a dashed segment that
gradually declines (mirror of the rise) — representing residual
revenue tapering off after departure.

Intro animation: chart starts zoomed on the break-even window,
draws each line stroke-by-stroke, then zooms out to show the full
horizon. Replay via the ▶ button.`}
      />
    </div>
  );
}
