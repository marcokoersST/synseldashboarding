import { MARKETING_COLORS } from "@/data/marketingHubData";

export interface WeeklyFunnelSeries {
  key: string;
  label: string;
  color?: string;
}

export interface WeeklyFunnelDatum {
  week: string;
  values: Record<string, number>;
}

interface Props {
  weeks: WeeklyFunnelDatum[];
  series: WeeklyFunnelSeries[];
  height?: number;
}

export function WeeklyFunnelDropOff({ weeks, series, height = 280 }: Props) {
  const W = 1100;
  const H = height;
  const padX = 24;
  const padTop = 30;
  const padBottom = 48;
  const legendH = 28;
  const chartTop = padTop + legendH;
  const chartH = H - chartTop - padBottom;

  const nWeeks = weeks.length;
  const nBars = series.length;
  const slot = (W - padX * 2) / nWeeks;
  const groupPad = slot * 0.12;
  const groupW = slot - groupPad * 2;
  const barW = groupW / (nBars + (nBars - 1) * 0.18);
  const gap = barW * 0.18;

  const allVals = weeks.flatMap((w) => series.map((s) => w.values[s.key] ?? 0));
  const max = Math.max(...allVals, 1);
  const yFor = (v: number) => chartTop + chartH - (v / max) * chartH;
  const xBar = (weekIdx: number, barIdx: number) =>
    padX + slot * weekIdx + groupPad + barIdx * (barW + gap);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {/* Legend */}
        {series.map((s, i) => {
          const spacing = 180;
          const totalW = spacing * series.length;
          const startX = (W - totalW) / 2 + spacing / 2;
          const cx = startX + i * spacing;
          return (
            <g key={`leg-${s.key}`}>
              <rect x={cx - 70} y={10} width={10} height={10} rx={2} fill={s.color ?? MARKETING_COLORS[i]} />
              <text x={cx - 55} y={19} fontSize={12} fill="hsl(var(--muted-foreground))">{s.label}</text>
            </g>
          );
        })}

        {/* Per-week groups */}
        {weeks.map((w, wi) => (
          <g key={w.week}>
            {/* Drop-off trapezoids between adjacent bars in the group */}
            {series.map((s, bi) => {
              if (bi === 0) return null;
              const prevS = series[bi - 1];
              const prevV = w.values[prevS.key] ?? 0;
              const curV = w.values[s.key] ?? 0;
              const x1 = xBar(wi, bi - 1) + barW;
              const x2 = xBar(wi, bi);
              const y1 = yFor(prevV);
              const y2 = yFor(curV);
              const baseY = chartTop + chartH;
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;
              const dropPct = prevV > 0 ? Math.round(((prevV - curV) / prevV) * 100) : 0;
              const dropLabel = `${dropPct >= 0 ? "-" : "+"}${Math.abs(dropPct)}%`;
              return (
                <g key={`drop-${wi}-${bi}`} className="group cursor-pointer">
                  <polygon
                    points={`${x1},${y1} ${x2},${y2} ${x2},${baseY} ${x1},${baseY}`}
                    fill={prevS.color ?? MARKETING_COLORS[bi - 1]}
                    fillOpacity={0.18}
                    className="transition-opacity duration-200"
                    style={{ opacity: 0.45 }}
                  />
                  <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <rect x={midX - 26} y={midY - 11} width={52} height={20} rx={5} fill="hsl(var(--foreground))" />
                    <text x={midX} y={midY + 3} textAnchor="middle" fontSize={11} fontWeight={600} fill="hsl(var(--background))">
                      {dropLabel}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Bars */}
            {series.map((s, bi) => {
              const v = w.values[s.key] ?? 0;
              const x = xBar(wi, bi);
              const y = yFor(v);
              const h = chartTop + chartH - y;
              return (
                <g key={`bar-${wi}-${bi}`}>
                  <rect x={x} y={y} width={barW} height={Math.max(h, 1)} rx={3} fill={s.color ?? MARKETING_COLORS[bi]} />
                  {v > 0 && (
                    <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={10} fontWeight={600} fill="hsl(var(--foreground))">
                      {v}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Week label */}
            <text
              x={padX + slot * wi + slot / 2}
              y={chartTop + chartH + 22}
              textAnchor="middle"
              fontSize={12}
              fill="hsl(var(--muted-foreground))"
            >
              {w.week}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default WeeklyFunnelDropOff;
