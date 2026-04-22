import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from "recharts";
import { getBreakEvenDistributionFor, lifecyclesWithBreakEven, monthToPeriod } from "@/data/groeimodelData";
import { useMemo } from "react";
import { DevNote } from "./DevNote";
import { FilterSummary } from "./FilterSummary";

interface BreakEvenHistogramProps {
  filterUnits: string[];
  filterStatus: "all" | "active" | "terminated";
  filterYears: number[];
  filterPeriodRange: [number, number];
}

export function BreakEvenHistogram({
  filterUnits,
  filterStatus,
  filterYears,
  filterPeriodRange,
}: BreakEvenHistogramProps) {
  const data = useMemo(() => {
    const filtered = lifecyclesWithBreakEven.filter(({ lifecycle }) => {
      if (filterUnits.length > 0 && !filterUnits.includes(lifecycle.unit)) return false;
      if (filterStatus === "active" && lifecycle.endDate) return false;
      if (filterStatus === "terminated" && !lifecycle.endDate) return false;
      if (filterYears.length > 0 && !filterYears.includes(lifecycle.startDate.getFullYear())) return false;
      const p = monthToPeriod(lifecycle.startDate.getMonth());
      if (p < filterPeriodRange[0] || p > filterPeriodRange[1]) return false;
      return true;
    });
    return getBreakEvenDistributionFor(filtered);
  }, [filterUnits, filterStatus, filterYears, filterPeriodRange]);

  const colors = [
    "hsl(var(--primary))",
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(var(--accent))",
    "hsl(var(--destructive))",
    "hsl(var(--muted-foreground))",
  ];

  return (
    <div className="w-full">
      <FilterSummary
        years={filterYears}
        periodRange={filterPeriodRange}
        units={filterUnits}
        status={filterStatus}
        className="mb-2"
      />
      <div className="w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(v: number) => [`${v} consultants`, "Aantal"]}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={colors[i]} fillOpacity={d.count === 0 ? 0.2 : 1} />
              ))}
              <LabelList
                dataKey="count"
                position="top"
                style={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <DevNote
        story={<><strong>As a user (C-level)</strong>, I want to see how consultants are distributed across break-even time windows, <strong>so that</strong> I can benchmark our ramp-up speed and identify a long-tail of slow performers.</>}
        logic={`For every consultant in the current selection we look at how
many periods it took them to break even, and place them in
one of these buckets:

   • 0–3 periods
   • 3–6 periods
   • 6–9 periods
   • 9–12 periods
   • 12+ periods
   • Not yet — consultants who are still in startup, or who
     left the company before reaching break-even.

Each bar height is the number of consultants in that bucket.

Same filters as the rest of the page apply: unit, status,
year and period range.`}
      />
    </div>
  );
}
