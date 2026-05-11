import { LineChart, Line, ResponsiveContainer } from "recharts";

interface Props {
  data: number[];
  color: string;
}

export function TileSparkline({ data, color }: Props) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-6 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
