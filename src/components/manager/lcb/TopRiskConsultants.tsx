import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "clean" | "attention" | "critical";

export interface RiskConsultant {
  id: number;
  name: string;
  unit: string;
  score: number;
  reason: string;
  status: Status;
}

const DOT: Record<Status, string> = {
  clean: "bg-emerald-500",
  attention: "bg-amber-500",
  critical: "bg-destructive",
};

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase() ?? "").join("");
}

interface Props {
  rows: RiskConsultant[];
}

export function TopRiskConsultants({ rows }: Props) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2 pt-3 px-4 border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-destructive" />
          Top risico-consultants
          <span className="ml-auto text-[10px] font-normal text-muted-foreground">
            {rows.length} consultants
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 space-y-1">
        {rows.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground">
            Geen consultants in risico.
          </div>
        ) : (
          rows.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/60 transition-colors"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
                {initials(r.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium truncate">{r.name}</span>
                  <span className={cn("inline-block h-1.5 w-1.5 rounded-full shrink-0", DOT[r.status])} />
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {r.unit} · {r.reason}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold tabular-nums leading-none">{r.score}</div>
                <div className="text-[9px] text-muted-foreground">score</div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
