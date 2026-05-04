import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type Status = "groen" | "oranje" | "rood" | "neutraal";

interface Props {
  label: string;
  value: string;
  sub?: string;
  status?: Status;
  onClick?: () => void;
  className?: string;
}

const STATUS_BORDER: Record<Status, string> = {
  groen: "border-l-success",
  oranje: "border-l-orange-500",
  rood: "border-l-destructive",
  neutraal: "border-l-border",
};

const STATUS_DOT: Record<Status, string> = {
  groen: "bg-success",
  oranje: "bg-orange-500",
  rood: "bg-destructive",
  neutraal: "bg-muted-foreground",
};

export function KPITile({ label, value, sub, status = "neutraal", onClick, className }: Props) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "border-l-4 p-4 flex flex-col gap-1 group cursor-pointer hover:bg-muted/30 transition-colors",
        STATUS_BORDER[status],
        !onClick && "cursor-default",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[status])} />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        </div>
        {onClick && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </Card>
  );
}

export function statusFromPct(pct: number, green = 100, orange = 80): Status {
  if (pct >= green) return "groen";
  if (pct >= orange) return "oranje";
  return "rood";
}
