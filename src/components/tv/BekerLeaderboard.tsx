import { cn } from "@/lib/utils";
import { Trophy, Medal, Award, Flame } from "lucide-react";
import type { BekerConsultant } from "@/data/tvData";

const medalBorders = [
  "border-l-[hsl(45,80%,50%)]",
  "border-l-[hsl(0,0%,65%)]",
  "border-l-[hsl(25,60%,45%)]",
];

const medalIcons = [Trophy, Medal, Award];

const unitColors: Record<string, string> = {
  Engineering: "bg-primary",
  Monteurs: "bg-[hsl(var(--chart-primary))]",
  Operators: "bg-accent",
  Trainingsunit: "bg-[hsl(var(--gold))]",
  "New Performers": "bg-[hsl(var(--teal))]",
};

const fmt = (v: number) => `€${(Math.abs(v) / 1000).toFixed(0)}K`;

interface BekerLeaderboardProps {
  consultants: BekerConsultant[];
}

export function BekerLeaderboard({ consultants }: BekerLeaderboardProps) {
  return (
    <div className="bg-card rounded-xl border border-border flex-1 min-h-0 flex flex-col overflow-hidden animate-fade-in">
      <table className="w-full">
        <thead>
          <tr className="text-xs text-muted-foreground border-b border-border">
            <th className="text-left font-medium py-2.5 pl-4 pr-2 w-12">#</th>
            <th className="text-left font-medium py-2.5 px-2">Naam</th>
            <th className="text-left font-medium py-2.5 px-2">Unit</th>
            <th className="text-right font-medium py-2.5 px-2">Marge</th>
            <th className="text-right font-medium py-2.5 px-2">Plaatsingen</th>
            <th className="text-right font-medium py-2.5 px-2">Gesprekken</th>
            <th className="text-right font-medium py-2.5 px-2">Omzet +/−</th>
            <th className="text-right font-medium py-2.5 px-2 pr-4">Acq. mails</th>
          </tr>
        </thead>
        <tbody>
          {consultants.map((c, i) => {
            const isTop3 = i < 3;
            const MedalIcon = isTop3 ? medalIcons[i] : null;
            const isHot = c.marge > 0;

            return (
              <tr
                key={c.name}
                className={cn(
                  "border-b border-border/40 transition-colors",
                  isTop3 && "border-l-4",
                  isTop3 && medalBorders[i],
                  isTop3 && "bg-muted/20",
                  !isTop3 && "border-l-4 border-l-transparent"
                )}
              >
                <td className="py-2.5 pl-4 pr-2">
                  <div className="flex items-center gap-1.5">
                    {MedalIcon ? (
                      <MedalIcon className={cn("w-4 h-4", i === 0 ? "text-[hsl(45,80%,50%)]" : i === 1 ? "text-muted-foreground" : "text-[hsl(25,60%,45%)]")} />
                    ) : (
                      <span className="text-sm text-muted-foreground w-4 text-center">{c.rank}</span>
                    )}
                  </div>
                </td>
                <td className="py-2.5 px-2">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("text-sm font-medium text-foreground", isTop3 && "font-semibold")}>
                      {c.name}
                    </span>
                    {isHot && !isTop3 && c.omzetChange > 50000 && (
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                    )}
                  </div>
                </td>
                <td className="py-2.5 px-2">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", unitColors[c.unit] || "bg-muted")} />
                    <span className="text-sm text-muted-foreground">{c.unit}</span>
                  </div>
                </td>
                <td className="py-2.5 px-2 text-right">
                  <span className={cn("text-sm font-semibold text-foreground", isTop3 && "font-bold")}>
                    {fmt(c.marge)}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-right">
                  <span className="text-sm text-foreground">{c.plaatsingen}</span>
                </td>
                <td className="py-2.5 px-2 text-right">
                  <span className="text-sm text-foreground">{c.gesprekken}</span>
                </td>
                <td className="py-2.5 px-2 text-right">
                  <span className={cn(
                    "text-sm font-medium",
                    c.omzetChange >= 0 ? "text-accent" : "text-destructive"
                  )}>
                    {c.omzetChange >= 0 ? "+" : "−"}{fmt(c.omzetChange)}
                  </span>
                </td>
                <td className="py-2.5 px-2 pr-4 text-right">
                  <span className="text-sm text-foreground">{c.acqMails}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
