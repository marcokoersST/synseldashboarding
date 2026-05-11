import { cn } from "@/lib/utils";
import { usePrognosePeriod, type PrognosePeriod } from "@/contexts/PrognosePeriodContext";

export function PeriodFilter() {
  const { period, setPeriod } = usePrognosePeriod();
  const opts: { value: PrognosePeriod; label: string }[] = [
    { value: "week", label: "Week" },
    { value: "period", label: "Periode" },
  ];
  return (
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
  );
}
