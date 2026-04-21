import { Badge } from "@/components/ui/badge";

interface FilterSummaryProps {
  years: number[];
  periodRange: [number, number];
  units: string[];
  status: "all" | "active" | "terminated";
  className?: string;
}

const STATUS_LABEL: Record<FilterSummaryProps["status"], string> = {
  all: "Alle statussen",
  active: "Actief",
  terminated: "Uit dienst",
};

export function FilterSummary({ years, periodRange, units, status, className = "" }: FilterSummaryProps) {
  const isPeriodFull = periodRange[0] === 1 && periodRange[1] === 13;
  const noFilters = years.length === 0 && isPeriodFull && units.length === 0 && status === "all";

  if (noFilters) {
    return (
      <div className={`text-[11px] text-muted-foreground italic ${className}`}>
        Toont: alle consultants
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground ${className}`}>
      <span className="italic">Toont:</span>
      {years.length > 0 && (
        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-5 font-normal">
          Jaar {years.sort((a, b) => a - b).join(", ")}
        </Badge>
      )}
      {!isPeriodFull && (
        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-5 font-normal">
          P{periodRange[0]}–P{periodRange[1]}
        </Badge>
      )}
      {units.length > 0 && (
        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-5 font-normal">
          Unit: {units.join(", ")}
        </Badge>
      )}
      {status !== "all" && (
        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-5 font-normal">
          {STATUS_LABEL[status]}
        </Badge>
      )}
    </div>
  );
}
