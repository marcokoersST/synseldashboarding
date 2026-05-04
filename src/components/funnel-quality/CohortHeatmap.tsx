import { useState } from "react";
import { cohortHeatmapNew, cohortHeatmapReact, type HeatmapRow } from "@/data/funnelQualityData";
import { cn } from "@/lib/utils";

interface Props {
  onSelectMonth?: (month: string) => void;
  selectedMonth?: string | null;
}

const COLS: { key: keyof HeatmapRow; label: string }[] = [
  { key: "conv3m", label: "3m" },
  { key: "conv6m", label: "6m" },
  { key: "conv9m", label: "9m" },
  { key: "conv12m", label: "12m" },
];

function colorFor(value: number, max: number) {
  if (isNaN(value)) return "transparent";
  const t = Math.min(1, value / max);
  // white → purple
  const hue = 270, sat = 70;
  const light = 100 - t * 60;
  return `hsl(${hue} ${sat}% ${light}%)`;
}

export function CohortHeatmap({ onSelectMonth, selectedMonth }: Props) {
  const [tab, setTab] = useState<"nieuw" | "heractivering">("nieuw");
  const data = tab === "nieuw" ? cohortHeatmapNew : cohortHeatmapReact;
  const max = data.reduce((m, r) => Math.max(m, r.conv12m || 0), 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-0.5 rounded-md bg-muted text-xs">
          {(["nieuw", "heractivering"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-2.5 py-1 rounded font-medium transition-colors",
                tab === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "nieuw" ? "Nieuw" : "Heractivering"}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">conversie %</span>
      </div>
      <div className="overflow-y-auto max-h-[360px] rounded-md border border-border">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-card z-10">
            <tr>
              <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Inschr. mnd</th>
              {COLS.map((c) => (
                <th key={c.key} className="text-center px-2 py-1.5 font-medium text-muted-foreground">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const active = selectedMonth === row.month;
              return (
                <tr
                  key={row.month}
                  onClick={() => onSelectMonth?.(row.month)}
                  className={cn(
                    "cursor-pointer hover:bg-muted/40 transition-colors",
                    active && "bg-primary/10"
                  )}
                >
                  <td className="px-2 py-1 tabular-nums">{row.month}</td>
                  {COLS.map((c) => {
                    const v = row[c.key] as number;
                    return (
                      <td key={c.key} className="text-center px-1 py-1">
                        <div
                          className="rounded-sm py-0.5 tabular-nums font-medium"
                          style={{ background: colorFor(v, max), color: !isNaN(v) && v / max > 0.5 ? "white" : undefined }}
                        >
                          {isNaN(v) ? "—" : `${v.toFixed(1)}`}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
