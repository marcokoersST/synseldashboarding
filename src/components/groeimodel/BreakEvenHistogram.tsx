import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { getBreakEvenDistribution } from "@/data/groeimodelData";
import { DevNote } from "./DevNote";

export function BreakEvenHistogram() {
  const data = getBreakEvenDistribution();
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
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <DevNote
        story={<><strong>As a user (C-level)</strong>, I want to see how consultants are distributed across break-even time windows (M0–M3, M3–M6, M6–M9, M9–M12, M12+, and "Not yet"), <strong>so that</strong> I can benchmark our ramp-up speed, spot whether the bulk of hires reach profitability within an acceptable window, and identify a long-tail of slow performers.</>}
        source={<><code>getBreakEvenDistribution()</code> in <code>groeimodelData.ts</code>, which buckets every consultant by their <code>result.breakEvenMonth</code>.</>}
        logic={<>For each bucket: <code>count = #consultants where breakEvenMonth ∈ [bucket.min, bucket.max)</code>. Consultants with <code>breakEvenMonth === null</code> (still in startup phase or terminated before break-even) are placed in the "Not yet" bucket.</>}
      />
    </div>
  );
}
