import { useMemo } from "react";
import {
  Bar, BarChart, CartesianGrid, ComposedChart, Line,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { CallRecord, aggregateHourly } from "@/data/callDashboardingData";
import { HeroCounter } from "../HeroCounter";

interface Props {
  calls: CallRecord[];
}

export function TVHourlyCallsTile({ calls }: Props) {
  const data = useMemo(() => aggregateHourly(calls), [calls]);

  const peakBucket = useMemo(() => {
    let max = -1;
    let idx = 0;
    data.forEach((b, i) => {
      if (b.total > max) { max = b.total; idx = i; }
    });
    return data[idx];
  }, [data]);

  const bestPickup = useMemo(() => {
    let max = -1;
    let idx = 0;
    data.forEach((b, i) => {
      if (b.total >= 5 && b.pickupRate > max) { max = b.pickupRate; idx = i; }
    });
    return data[idx];
  }, [data]);

  const totalCalls = data.reduce((s, b) => s + b.total, 0);

  return (
    <div className="rounded-xl bg-card border border-border h-full flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Belactiviteit per half uur</h3>
          <p className="text-[0.7em] text-muted-foreground">07:30 – 19:00 · stapelbalk = inkomend + uitgaand · lijn = oppakratio</p>
        </div>
        <div className="flex items-center gap-4">
          <HeroCounter
            label="Piekuur"
            value={peakBucket?.total ?? 0}
            total={totalCalls}
            size="sm"
            shareLabel={`bij ${peakBucket?.label ?? "—"}`}
          />
          <HeroCounter
            label="Beste oppakratio"
            value={Math.round((bestPickup?.pickupRate ?? 0) * 100)}
            size="sm"
            hideShare
            tone="positive"
          />
        </div>
      </div>
      <div className="flex-1 p-2 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={10} interval={1} />
            <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="hsl(var(--success))"
              fontSize={10}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }}
              formatter={(value: number, name: string) => {
                if (name === "Oppakratio") return [`${Math.round(value)}%`, name];
                return [value, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="left" dataKey="inbound" name="Inkomend" stackId="a" fill="hsl(var(--teal))" />
            <Bar yAxisId="left" dataKey="outbound" name="Uitgaand" stackId="a" fill="hsl(var(--primary))" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey={(d: any) => Math.round(d.pickupRate * 100)}
              name="Oppakratio"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
