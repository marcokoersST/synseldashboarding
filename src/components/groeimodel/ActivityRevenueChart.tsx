import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { getActivityAndRevenueByPeriod, formatEuro } from "@/data/groeimodelData";
import { FilterSummary } from "./FilterSummary";
import { DevNote } from "./DevNote";

interface Props {
  filterUnits: string[];
  statusFilter: "all" | "active" | "terminated";
  filterYears: number[];
  filterPeriodRange: [number, number];
}

export function ActivityRevenueChart({
  filterUnits,
  statusFilter,
  filterYears,
  filterPeriodRange,
}: Props) {
  const data = useMemo(
    () => getActivityAndRevenueByPeriod({ filterUnits, statusFilter, filterYears, filterPeriodRange }),
    [filterUnits, statusFilter, filterYears, filterPeriodRange],
  );

  const empty = data.every((d) => d.active === 0 && d.revenue === 0);

  return (
    <div className="w-full">
      <FilterSummary
        years={filterYears}
        periodRange={filterPeriodRange}
        units={filterUnits}
        status={statusFilter}
        className="mb-2"
      />

      <div className="w-full h-[320px]">
        {empty ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
            Geen data voor deze selectie
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 60, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                interval="preserveStartEnd"
                angle={data.length > 14 ? -30 : 0}
                textAnchor={data.length > 14 ? "end" : "middle"}
                height={data.length > 14 ? 50 : 30}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "hsl(var(--primary))" }}
                allowDecimals={false}
                label={{
                  value: "Actieve consultants",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                  fill: "hsl(var(--muted-foreground))",
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "hsl(var(--gold))" }}
                tickFormatter={(v) => formatEuro(v)}
                label={{
                  value: "Omzet (marge)",
                  angle: 90,
                  position: "insideRight",
                  fontSize: 11,
                  fill: "hsl(var(--muted-foreground))",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number, name: string) => {
                  if (name === "Actieve consultants") return [`${value} actieve consultants`, name];
                  return [formatEuro(value), name];
                }}
                labelFormatter={(label) => `Periode ${label}`}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                iconType="circle"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="active"
                name="Actieve consultants"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                name="Omzet"
                stroke="hsl(var(--gold))"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <DevNote
        story={<><strong>As a user (C-level)</strong>, I want to see how many consultants were active per calendar period and how much margin they collectively generated, <strong>so that</strong> I can correlate workforce size with realised revenue across the selected timeframe.</>}
        logic={`Time axis = Cartesian product of (selected years) × (P{lo}..P{hi}).
Single year: ticks render as "P1, P2, … P13".
Multiple years: "P1 '25, P2 '25, …, P1 '26, …".

For each tick with absolute index  abs = year × 13 + (period − 1):

   Active   =  COUNT( consultant   where  startAbs ≤ abs ≤ endAbs )
   Revenue  =  Σ  monthlyMargin[ abs − startAbs ]
              across those active consultants

startAbs = startDate.year × 13 + (monthToPeriod(startDate.month) − 1)
endAbs   = endDate     ? same for endDate : ∞

Filter scope: identical to the KPI tiles and cohort chart
(Unit + Status + Year + P-range on start date).`}
      />
    </div>
  );
}
