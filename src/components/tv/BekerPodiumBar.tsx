import { Crown, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BekerConsultant } from "@/data/tvData";

const medalConfig = [
  { color: "text-[hsl(45,80%,50%)]", bg: "bg-[hsl(45,80%,50%,0.12)]", border: "border-[hsl(45,80%,50%,0.3)]", icon: Crown },
  { color: "text-muted-foreground", bg: "bg-muted/20", border: "border-border", icon: Medal },
  { color: "text-[hsl(25,60%,45%)]", bg: "bg-[hsl(25,60%,45%,0.12)]", border: "border-[hsl(25,60%,45%,0.3)]", icon: Award },
];

const fmt = (v: number) => `€${(v / 1000).toFixed(0)}K`;

interface BekerPodiumBarProps {
  consultants: BekerConsultant[];
}

export function BekerPodiumBar({ consultants }: BekerPodiumBarProps) {
  const top3 = consultants.slice(0, 3);
  if (top3.length < 3) return null;

  // Display order: #2 | #1 | #3
  const displayOrder = [top3[1], top3[0], top3[2]];
  const styleOrder = [medalConfig[1], medalConfig[0], medalConfig[2]];
  const ranks = [2, 1, 3];

  return (
    <div className="bg-card rounded-xl border border-border p-3 flex items-center justify-center gap-6 animate-fade-in">
      {displayOrder.map((c, i) => {
        const style = styleOrder[i];
        const rank = ranks[i];
        const Icon = style.icon;
        const isFirst = rank === 1;

        return (
          <div
            key={c.name}
            className={cn(
              "flex items-center gap-3 px-5 py-2.5 rounded-lg border",
              style.bg, style.border,
              isFirst && "px-6 py-3"
            )}
          >
            <Icon className={cn(style.color, isFirst ? "w-6 h-6" : "w-5 h-5")} />
            <div className="flex flex-col">
              <span className={cn("font-semibold text-foreground", isFirst ? "text-sm" : "text-xs")}>
                {c.name}
              </span>
              <span className={cn("font-bold", style.color, isFirst ? "text-base" : "text-sm")}>
                {fmt(c.marge)}
              </span>
            </div>
            <span className={cn("font-black ml-2", style.color, isFirst ? "text-2xl" : "text-xl")}>
              #{rank}
            </span>
          </div>
        );
      })}
    </div>
  );
}
