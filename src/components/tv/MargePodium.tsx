import { Crown, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTVCompact } from "@/components/tv/TVDashboardLayout";
import { Separator } from "@/components/ui/separator";
import type { CompetitionEntry } from "@/data/tvData";

const medalStyles = [
  { color: "text-[hsl(45,80%,50%)]", bg: "bg-[hsl(45,80%,50%,0.15)]", border: "border-[hsl(45,80%,50%,0.3)]", height: "h-32", heightCompact: "flex-[3]" },
  { color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border", height: "h-24", heightCompact: "flex-[2.2]" },
  { color: "text-[hsl(25,60%,45%)]", bg: "bg-[hsl(25,60%,45%,0.15)]", border: "border-[hsl(25,60%,45%,0.3)]", height: "h-20", heightCompact: "flex-[1.8]" },
];

const fmt = (v: number) => `€${(v / 1000).toFixed(0)}K`;

interface MargePodiumProps {
  entries: CompetitionEntry[];
  plaatsingen?: CompetitionEntry[];
  gesprekken?: CompetitionEntry[];
}

function findValue(entries: CompetitionEntry[] | undefined, name: string): number | undefined {
  return entries?.find((e) => e.name === name)?.value;
}

export function MargePodium({ entries, plaatsingen, gesprekken }: MargePodiumProps) {
  const compact = useTVCompact();
  const top3 = entries.slice(0, 3);
  if (top3.length < 3) return null;

  const order = [top3[1], top3[0], top3[2]];
  const styleOrder = [medalStyles[1], medalStyles[0], medalStyles[2]];
  const ranks = [2, 1, 3];

  return (
    <div className={cn(
      "bg-card rounded-xl border border-border animate-fade-in flex flex-col",
      compact ? "p-3 h-full" : "p-4 mb-4"
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Medal className={cn("text-primary", compact ? "w-4 h-4" : "w-5 h-5")} />
        <h3 className={cn("font-semibold text-foreground", compact ? "text-xs" : "text-sm")}>Top 3 Margebaas</h3>
      </div>

      {/* Podium Visual */}
      <div className={cn("flex items-end justify-center gap-3", compact ? "flex-[6] min-h-0" : "")}>
        {order.map((entry, i) => {
          const style = styleOrder[i];
          const rank = ranks[i];
          return (
            <div key={entry.name} className={cn(
              "flex flex-col items-center flex-1 max-w-[200px]",
              compact ? "h-full justify-end" : ""
            )}>
              {rank === 1 && <Crown className={cn("mb-1", style.color, compact ? "w-5 h-5" : "w-6 h-6")} />}
              <span className={cn("text-muted-foreground mb-1 truncate max-w-full", compact ? "text-[10px]" : "text-xs")}>{entry.name}</span>
              <span className={cn("font-bold mb-2", style.color, compact ? "text-xs" : "text-sm")}>{fmt(entry.value)}</span>
              <div className={cn(
                "w-full rounded-t-lg border-t border-x flex items-end justify-center pb-2",
                style.bg, style.border,
                compact ? style.heightCompact : style.height
              )}>
                <span className={cn("font-black", style.color, compact ? "text-xl" : "text-2xl")}>{rank}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Table */}
      {(plaatsingen || gesprekken) && (
        <>
          <Separator className="my-2" />
          <div className={cn("flex-[4] min-h-0 overflow-auto")}>
            <table className="w-full">
              <thead>
                <tr className={cn("text-muted-foreground", compact ? "text-[10px]" : "text-xs")}>
                  <th className="text-left font-medium pb-1 pl-1">Naam</th>
                  <th className="text-right font-medium pb-1">Marge</th>
                  {plaatsingen && <th className="text-right font-medium pb-1">Pl.</th>}
                  {gesprekken && <th className="text-right font-medium pb-1 pr-1">Gespr.</th>}
                </tr>
              </thead>
              <tbody>
                {top3.map((entry, i) => (
                  <tr key={entry.name} className={cn(
                    "border-t border-border/50",
                    compact ? "text-[11px]" : "text-xs"
                  )}>
                    <td className={cn("py-1 pl-1 font-medium text-foreground truncate max-w-[120px]", medalStyles[i].color)}>
                      {entry.name}
                    </td>
                    <td className="py-1 text-right text-foreground font-semibold">{fmt(entry.value)}</td>
                    {plaatsingen && (
                      <td className="py-1 text-right text-foreground">
                        {findValue(plaatsingen, entry.name) ?? "–"}
                      </td>
                    )}
                    {gesprekken && (
                      <td className="py-1 text-right text-foreground pr-1">
                        {findValue(gesprekken, entry.name) ?? "–"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
