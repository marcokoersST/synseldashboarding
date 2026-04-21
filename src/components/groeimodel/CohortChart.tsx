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
} from "recharts";
import { lifecyclesWithBreakEven, formatEuro, ConsultantLifecycle, BreakEvenResult } from "@/data/groeimodelData";
import { useMemo } from "react";
import { DevNote } from "./DevNote";

interface CohortChartProps {
  filterUnits: string[]; // empty = all
  filterStatus: "all" | "active" | "terminated";
}

export function CohortChart({ filterUnits, filterStatus }: CohortChartProps) {
  const filtered = useMemo(() => {
    return lifecyclesWithBreakEven.filter(({ lifecycle }) => {
      if (filterUnits.length > 0 && !filterUnits.includes(lifecycle.unit)) return false;
      if (filterStatus === "active" && lifecycle.endDate) return false;
      if (filterStatus === "terminated" && !lifecycle.endDate) return false;
      return true;
    });
  }, [filterUnits, filterStatus]);

  // Build a unified dataset: months 0..maxMonth with one column per consultant
  const { data, consultants, minBal, maxBal } = useMemo(() => {
    const maxMonths = Math.max(...filtered.map((x) => x.result.totalMonths), 1);
    const consultants = filtered.map(({ lifecycle, result }) => ({
      id: lifecycle.id,
      name: lifecycle.name,
      color: lifecycle.unitColor,
      series: result.cumulativeSeries,
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
    return { data, consultants, minBal, maxBal };
  }, [filtered]);

  return (
    <div className="w-full">
      <div className="w-full h-[460px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => `M${v}`}
              label={{ value: "Maanden sinds startdatum", position: "insideBottom", offset: -2, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => formatEuro(v)}
              domain={[minBal * 1.05, maxBal * 1.05]}
            />
            <ReferenceArea y1={minBal * 1.05} y2={0} fill="hsl(var(--destructive))" fillOpacity={0.05} />
            <ReferenceArea y1={0} y2={maxBal * 1.05} fill="hsl(var(--primary))" fillOpacity={0.04} />
            <ReferenceLine y={0} stroke="hsl(var(--foreground))" strokeWidth={1.5} strokeDasharray="4 4" label={{ value: "Break-even", position: "right", fontSize: 10, fill: "hsl(var(--foreground))" }} />
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
            {consultants.map((c) => (
              <Line
                key={c.id}
                type="monotone"
                dataKey={`c_${c.id}`}
                stroke={c.color}
                strokeWidth={1.5}
                strokeOpacity={0.6}
                dot={false}
                connectNulls
                isAnimationActive={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <DevNote
        story={<><strong>As a user (C-level)</strong>, I want to see each consultant's cumulative financial balance plotted over the months since their start date, <strong>so that</strong> I can visually identify who is still loss-making, when each one crosses break-even, and how steep their profit curve becomes afterwards.</>}
        logic={`Each line shows ONE consultant. For every month since their
start date we keep a running total:

                  ┌─ this month's margin earned
                  │
   Balance(M) =   Σ  ( Margin  −  Cost )      from month 0 → M
                  │
                  └─ this month's salary + overhead

   Balance < 0   →   still in startup phase   (red zone)
   Balance = 0   →   BREAK-EVEN  (the dashed line)
   Balance > 0   →   profitable                (green zone)

The chart filters live on the selected units and status (active /
out of service).`}
      />
    </div>
  );
}
