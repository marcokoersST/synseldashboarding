import { cn } from "@/lib/utils";
import { usePrognosePeriod, type PrognosePeriod } from "@/contexts/PrognosePeriodContext";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PeriodFilter() {
  const { period, setPeriod, offset, setOffset, label } = usePrognosePeriod();
  const opts: { value: PrognosePeriod; label: string }[] = [
    { value: "week", label: "Week" },
    { value: "period", label: "Periode" },
  ];
  return (
    <div className="inline-flex items-center gap-2">
      <div className="inline-flex rounded-md border bg-muted/40 p-0.5">
        {opts.map((o) => (
          <button
            key={o.value}
            onClick={() => setPeriod(o.value)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded transition-colors",
              period === o.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="inline-flex items-center gap-1 rounded-md border bg-background px-1 py-0.5">
        <button
          onClick={() => setOffset(offset + 1)}
          title="Verder terug in de tijd"
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-xs font-medium min-w-[140px] text-center tabular-nums">
          {label}
        </span>
        <button
          onClick={() => setOffset(offset - 1)}
          disabled={offset === 0}
          title="Dichter bij nu"
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {offset > 0 && (
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setOffset(0)}>
          <RotateCcw className="h-3 w-3 mr-1" />
          Vandaag
        </Button>
      )}
    </div>
  );
}
