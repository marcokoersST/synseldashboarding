import { MARKETING_COLORS } from "@/data/marketingHubData";

export interface FunnelDropOffDatum {
  stage: string;
  value: number;
}

interface Props {
  data: FunnelDropOffDatum[];
  height?: number;
  color?: string;
}

export function FunnelDropOff({ data, height = 240, color = MARKETING_COLORS[0] }: Props) {
  const W = 900;
  const H = height;
  const padX = 20;
  const padTop = 30;
  const padBottom = 40;
  const n = data.length;
  const slot = (W - padX * 2) / n;
  const barW = slot * 0.58;
  const max = Math.max(...data.map((d) => d.value), 1);
  const chartH = H - padTop - padBottom;
  const yFor = (v: number) => padTop + chartH - (v / max) * chartH;
  const xCenter = (i: number) => padX + slot * i + slot / 2;

  const enriched = data.map((d, i) => {
    const prev = i === 0 ? null : data[i - 1].value;
    const dropPct = prev && prev > 0 ? Math.round(((prev - d.value) / prev) * 100) : 0;
    return { ...d, dropLabel: i === 0 ? "" : `${dropPct > 0 ? "-" : "+"}${Math.abs(dropPct)}%` };
  });

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {enriched.map((d, i) => {
          if (i === 0) return null;
          const prev = enriched[i - 1];
          const x1 = xCenter(i - 1) + barW / 2;
          const x2 = xCenter(i) - barW / 2;
          const y1 = yFor(prev.value);
          const y2 = yFor(d.value);
          const baseY = padTop + chartH;
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          return (
            <g key={`drop-${i}`} className="group cursor-pointer">
              <polygon
                points={`${x1},${y1} ${x2},${y2} ${x2},${baseY} ${x1},${baseY}`}
                fill={color}
                fillOpacity={0.18}
                className="transition-opacity duration-200 group-hover:opacity-100"
                style={{ opacity: 0.55 }}
              />
              <g className="opacity-80 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <text x={midX} y={midY + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill="hsl(var(--foreground))" stroke="hsl(var(--background))" strokeWidth={3} paintOrder="stroke" strokeLinejoin="round">
                  {d.dropLabel}
                </text>
              </g>
            </g>
          );
        })}
        {enriched.map((d, i) => {
          const x = xCenter(i) - barW / 2;
          const y = yFor(d.value);
          const h = padTop + chartH - y;
          return (
            <g key={d.stage}>
              <rect x={x} y={y} width={barW} height={h} rx={6} fill={color} />
              <text x={xCenter(i)} y={y - 8} textAnchor="middle" fontSize={12} fontWeight={600} fill="hsl(var(--foreground))">
                {d.value}
              </text>
              <text x={xCenter(i)} y={padTop + chartH + 22} textAnchor="middle" fontSize={12} fill="hsl(var(--muted-foreground))">
                {d.stage}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default FunnelDropOff;
