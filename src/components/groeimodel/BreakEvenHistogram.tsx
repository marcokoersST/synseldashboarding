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
        story={<><strong>As a user (C-level)</strong>, I want to see how consultants are distributed across break-even time windows, <strong>so that</strong> I can benchmark our ramp-up speed and identify a long-tail of slow performers.</>}
        logic={`For every consultant, look at the month they crossed break-even
and drop them into one of these buckets:

   ┌──────────┬──────────┬──────────┬──────────┬─────────┬──────────┐
   │  0 – 3   │  3 – 6   │  6 – 9   │  9 – 12  │  12 +   │ Not yet  │
   │  months  │  months  │  months  │  months  │ months  │          │
   └──────────┴──────────┴──────────┴──────────┴─────────┴──────────┘

Each bar height  =  number of consultants in that bucket.

"Not yet" = consultant has not (yet) reached break-even
            (still in startup phase, or left the company before it).`}
      />
    </div>
  );
}
