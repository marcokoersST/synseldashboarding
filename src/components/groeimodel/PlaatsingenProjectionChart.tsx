import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  historischePlaatsingenPerWeek,
  detacheerdenProjectiePerWeek,
  huidigeWeekLabel,
} from "@/data/plaatsingenProjectionData";

// Color tokens (HSL vars from index.css)
const COLOR_WS = "hsl(var(--primary))";
const COLOR_DET = "hsl(var(--accent))";
const COLOR_MARGE = "hsl(var(--teal))";

// One continuous total-line that switches color per historical period.
const PERIOD_COLORS = [
  { idx: -3, label: "P11", color: "hsl(265 60% 60%)" },
  { idx: -2, label: "P12", color: "hsl(175 60% 45%)" },
  { idx: -1, label: "P13", color: "hsl(35 90% 55%)" },
];

const COLOR_PROJECTION = "hsl(var(--accent))";

interface Row {
  weekLabel: string;
  // bars
  ws: number | null;
  detachering: number | null;
  margeFac: number | null;
  // 3 period-coloured total lines (only one is non-null per week, with
  // 1 connector point overlap to the next period so segments touch)
  total_p11: number | null;
  total_p12: number | null;
  total_p13: number | null;
  // projection
  gedetacheerden: number | null;
}

function buildChartData(): Row[] {
  const rows: Row[] = [];

  // Historical weeks
  historischePlaatsingenPerWeek.forEach((wk, i) => {
    const isLastOfP11 = wk.periodIndex === -3 && wk.weekInPeriod === 4;
    const isLastOfP12 = wk.periodIndex === -2 && wk.weekInPeriod === 4;
    rows.push({
      weekLabel: wk.weekLabel,
      ws: wk.ws,
      detachering: wk.detachering,
      margeFac: wk.margeFac,
      total_p11:
        wk.periodIndex === -3 ? wk.total : null,
      total_p12:
        wk.periodIndex === -2 ? wk.total : isLastOfP11 ? wk.total : null,
      total_p13:
        wk.periodIndex === -1 ? wk.total : isLastOfP12 ? wk.total : null,
      gedetacheerden: null,
    });
    // Make connector: set the next-period color value at the boundary
    // (handled above with isLastOfP11/P12 on the SAME week as last of prev).
    void i;
  });

  // Projection weeks
  // Connector from last historical week to first projection week:
  // set first projection point on the gedetacheerden line equal to a baseline
  // by also assigning gedetacheerden on the boundary historical week.
  const baseline = 124;
  if (rows.length > 0) {
    rows[rows.length - 1].gedetacheerden = baseline;
  }
  detacheerdenProjectiePerWeek.forEach((wk) => {
    rows.push({
      weekLabel: wk.weekLabel,
      ws: null,
      detachering: null,
      margeFac: null,
      total_p11: null,
      total_p12: null,
      total_p13: null,
      gedetacheerden: wk.actieveGedetacheerden,
    });
  });

  return rows;
}

interface PlaatsingenProjectionChartProps {
  filterUnits?: string[];
  statusFilter?: string;
  filterYears?: number[];
  filterPeriodRange?: [number, number];
}

export function PlaatsingenProjectionChart(_props: PlaatsingenProjectionChartProps) {
  const data = useMemo(() => buildChartData(), []);

  return (
    <div className="w-full h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="weekLabel"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            interval={0}
            angle={-35}
            textAnchor="end"
            height={60}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            label={{
              value: "Plaatsingen / wk",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            label={{
              value: "Actieve gedetacheerden",
              angle: 90,
              position: "insideRight",
              style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
            }}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number | string, name: string) => {
              if (value === null || value === undefined) return ["-", name];
              const labels: Record<string, string> = {
                ws: "W&S",
                detachering: "Detachering",
                margeFac: "Marge Facturatie",
                total_p11: "Totaal (P11)",
                total_p12: "Totaal (P12)",
                total_p13: "Totaal (P13)",
                gedetacheerden: "Actieve gedetacheerden",
              };
              return [value, labels[name] ?? name];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            payload={[
              { value: "W&S", type: "square", color: COLOR_WS, id: "ws" },
              { value: "Detachering", type: "square", color: COLOR_DET, id: "det" },
              { value: "Marge Fac", type: "square", color: COLOR_MARGE, id: "marge" },
              { value: "Totaal P11", type: "line", color: PERIOD_COLORS[0].color, id: "p11" },
              { value: "Totaal P12", type: "line", color: PERIOD_COLORS[1].color, id: "p12" },
              { value: "Totaal P13", type: "line", color: PERIOD_COLORS[2].color, id: "p13" },
              { value: "Gedetacheerden (projectie)", type: "line", color: COLOR_PROJECTION, id: "proj" },
            ]}
          />

          {/* Stacked bars per week — historical placements by type */}
          <Bar yAxisId="left" dataKey="ws" stackId="plaatsingen" fill={COLOR_WS} name="ws" />
          <Bar yAxisId="left" dataKey="detachering" stackId="plaatsingen" fill={COLOR_DET} name="detachering" />
          <Bar yAxisId="left" dataKey="margeFac" stackId="plaatsingen" fill={COLOR_MARGE} name="margeFac" radius={[3, 3, 0, 0]} />

          {/* Continuous total line in 3 segments, one color per period.
              Each segment overlaps 1 point with the next so the line is visually unbroken. */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="total_p11"
            stroke={PERIOD_COLORS[0].color}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            connectNulls={false}
            name="total_p11"
            isAnimationActive={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="total_p12"
            stroke={PERIOD_COLORS[1].color}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            connectNulls={false}
            name="total_p12"
            isAnimationActive={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="total_p13"
            stroke={PERIOD_COLORS[2].color}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            connectNulls={false}
            name="total_p13"
            isAnimationActive={false}
          />

          {/* Projection: active gedetacheerden, dashed */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="gedetacheerden"
            stroke={COLOR_PROJECTION}
            strokeWidth={2.5}
            strokeDasharray="6 4"
            dot={{ r: 3 }}
            connectNulls={false}
            name="gedetacheerden"
            isAnimationActive={false}
          />

          {/* "Nu" marker */}
          <ReferenceLine
            yAxisId="left"
            x={huidigeWeekLabel}
            stroke="hsl(var(--foreground))"
            strokeDasharray="2 2"
            label={{ value: "Nu", position: "top", fontSize: 11, fill: "hsl(var(--foreground))" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
