import { cn } from "@/lib/utils";

export type ChartTableView = "chart" | "table";

interface Props {
  view: ChartTableView;
  onChange: (v: ChartTableView) => void;
}

export function ChartTableToggle({ view, onChange }: Props) {
  return (
    <div className="flex gap-0.5 rounded-md border border-border p-0.5 bg-background">
      {(["chart", "table"] as const).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            "text-xs px-2.5 py-1 rounded transition-colors capitalize",
            view === v
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {v === "chart" ? "Chart" : "Tabel"}
        </button>
      ))}
    </div>
  );
}

export default ChartTableToggle;
