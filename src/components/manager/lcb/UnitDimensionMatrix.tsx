import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "clean" | "attention" | "critical";

const CELL: Record<Status, string> = {
  clean: "bg-emerald-500/80 hover:bg-emerald-500 border-emerald-600/40",
  attention: "bg-amber-500/80 hover:bg-amber-500 border-amber-600/40",
  critical: "bg-destructive/80 hover:bg-destructive border-destructive/40",
};

export interface MatrixCell {
  unit: string;
  dim: string;
  dimKey: string;
  score: number;
  status: Status;
}

interface Props {
  units: string[];
  dims: { key: string; label: string }[];
  cells: MatrixCell[];
  onSelect: (dimKey: string, unit: string) => void;
}

export function UnitDimensionMatrix({ units, dims, cells, onSelect }: Props) {
  const cellMap = new Map<string, MatrixCell>();
  cells.forEach((c) => cellMap.set(`${c.unit}::${c.dimKey}`, c));

  const worst = [...cells].sort((a, b) => a.score - b.score)[0];
  const worstId = worst ? `${worst.unit}::${worst.dimKey}` : null;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 pt-3 px-4 border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <Grid3x3 className="h-3.5 w-3.5 text-primary" />
          Unit × Dimensie
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <TooltipProvider delayDuration={100}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left font-medium text-muted-foreground pb-1.5 pr-2" />
                  {dims.map((d) => (
                    <th
                      key={d.key}
                      className="text-[10px] font-medium text-muted-foreground pb-1.5 px-1 text-center"
                    >
                      {d.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {units.map((u) => (
                  <tr key={u}>
                    <td className="text-[11px] font-medium pr-2 py-0.5 whitespace-nowrap truncate max-w-[110px]">
                      {u}
                    </td>
                    {dims.map((d) => {
                      const cell = cellMap.get(`${u}::${d.key}`);
                      const id = `${u}::${d.key}`;
                      if (!cell) {
                        return (
                          <td key={d.key} className="px-1 py-0.5">
                            <div className="h-7 w-full rounded bg-muted/40" />
                          </td>
                        );
                      }
                      return (
                        <td key={d.key} className="px-1 py-0.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => onSelect(d.key, u)}
                                className={cn(
                                  "h-7 w-full rounded border text-[10px] font-semibold text-white tabular-nums transition-all",
                                  CELL[cell.status],
                                  id === worstId && "ring-2 ring-offset-1 ring-destructive animate-pulse",
                                )}
                              >
                                {cell.score}%
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <div className="font-medium">{u} · {d.label}</div>
                              <div className="text-muted-foreground tabular-nums">Score: {cell.score}%</div>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TooltipProvider>
        <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground border-t pt-2">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500/80" /> Op koers
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-amber-500/80" /> Aandacht
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-destructive/80" /> Kritiek
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
