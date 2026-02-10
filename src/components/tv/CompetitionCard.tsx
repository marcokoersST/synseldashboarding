import { Crown, Trophy, Wallet, MessageCircle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompetitionEntry } from "@/data/tvData";

const iconMap = {
  crown: Crown,
  trophy: Trophy,
  wallet: Wallet,
  message: MessageCircle,
};

const medalColors = ["text-[hsl(45,80%,50%)]", "text-muted-foreground", "text-[hsl(25,60%,45%)]"];

interface CompetitionCardProps {
  title: string;
  icon: keyof typeof iconMap;
  entries: CompetitionEntry[];
  formatValue: (v: number) => string;
  dalers?: CompetitionEntry[];
  subtitle?: string;
}

export function CompetitionCard({ title, icon, entries, formatValue, dalers, subtitle }: CompetitionCardProps) {
  const Icon = iconMap[icon];

  return (
    <div className="bg-card rounded-xl p-5 border border-border h-full animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>}

      <div className="space-y-2.5">
        {entries.slice(0, 5).map((entry, i) => (
          <div key={entry.name} className="flex items-center gap-3">
            <span className={cn("text-sm font-bold w-5 text-center", i < 3 ? medalColors[i] : "text-muted-foreground")}>
              {entry.rank}
            </span>
            <span className="flex-1 text-sm text-foreground truncate">{entry.name}</span>
            <span className="text-sm font-semibold text-foreground">{formatValue(entry.value)}</span>
            {entry.change !== undefined && (
              <span className={cn("flex items-center gap-0.5 text-xs", entry.change >= 0 ? "text-accent" : "text-destructive")}>
                {entry.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              </span>
            )}
          </div>
        ))}
      </div>

      {dalers && dalers.length > 0 && (
        <>
          <div className="border-t border-border my-3" />
          <p className="text-xs text-muted-foreground mb-2">Grootste dalers</p>
          <div className="space-y-2">
            {dalers.map((entry) => (
              <div key={entry.name} className="flex items-center gap-3">
                <TrendingDown className="w-4 h-4 text-destructive" />
                <span className="flex-1 text-sm text-foreground truncate">{entry.name}</span>
                <span className="text-sm font-semibold text-destructive">{formatValue(entry.value)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
