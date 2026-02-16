import { Phone, Clock, CalendarCheck, Mail } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { weekCallStats, periodCallStats, weekGesprekkenPerUnit, weekMailStats } from "@/data/tvData";
import { useTVCompact } from "./TVDashboardLayout";
import { cn } from "@/lib/utils";

interface CallStatsProps {
  mode: "week" | "period";
}

export function CallStats({ mode }: CallStatsProps) {
  const compact = useTVCompact();

  if (mode === "period") {
    return (
      <div className={cn("bg-card rounded-xl border border-border h-full", compact ? "p-3" : "p-5")}>
        <h3 className={cn("font-semibold text-foreground", compact ? "text-xs mb-2" : "text-sm mb-4")}>Belstatistieken</h3>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            <div>
              <p className={cn("font-bold text-foreground", compact ? "text-lg" : "text-2xl")}>{periodCallStats.totalOutbound.toLocaleString("nl-NL")}</p>
              <p className="text-xs text-muted-foreground">Uitgaande gesprekken</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <div>
              <p className={cn("font-bold text-foreground", compact ? "text-lg" : "text-2xl")}>{periodCallStats.totalDurationHours}u</p>
              <p className="text-xs text-muted-foreground">Totale gesprekstijd</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Gem. {periodCallStats.avgPerDay} gesprekken/dag</p>
      </div>
    );
  }

  const totalOutbound = weekCallStats.reduce((s, d) => s + d.outbound, 0);
  const totalMinutes = weekCallStats.reduce((s, d) => s + d.duration, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const totalGesprekken = weekGesprekkenPerUnit.reduce((s, u) => s + u.gesprekken, 0);

  // Merge call and mail daily data for combined chart
  const combinedDailyData = weekCallStats.map((d, i) => ({
    day: d.day,
    outbound: d.outbound,
    mails: weekMailStats.perDay[i]?.mails ?? 0,
  }));

  return (
    <div className={cn("bg-card rounded-xl border border-border h-full overflow-hidden flex flex-col", compact ? "p-3" : "p-5")}>
      <h3 className={cn("font-semibold text-foreground", compact ? "text-xs mb-1" : "text-sm mb-4")}>Bel- & Mailstatistieken</h3>
      <div className={cn("grid grid-cols-4", compact ? "gap-2 mb-2" : "gap-4 mb-4")}>
        <div className="text-center">
          <Phone className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className={cn("font-bold text-foreground", compact ? "text-base" : "text-2xl")}>{totalOutbound}</p>
          <p className="text-xs text-muted-foreground">Uitgaand</p>
        </div>
        <div className="text-center">
          <Clock className="w-4 h-4 text-accent mx-auto mb-1" />
          <p className={cn("font-bold text-foreground", compact ? "text-base" : "text-2xl")}>{hours}u {mins}m</p>
          <p className="text-xs text-muted-foreground">Gesprekstijd</p>
        </div>
        <div className="text-center">
          <CalendarCheck className="w-4 h-4 text-chart-primary mx-auto mb-1" />
          <p className={cn("font-bold text-foreground", compact ? "text-base" : "text-2xl")}>{totalGesprekken}</p>
          <p className="text-xs text-muted-foreground">Gesprekken</p>
        </div>
        <div className="text-center">
          <Mail className="w-4 h-4 text-gold mx-auto mb-1" />
          <p className={cn("font-bold text-foreground", compact ? "text-base" : "text-2xl")}>{weekMailStats.totalAcquisitieMails}</p>
          <p className="text-xs text-muted-foreground">Acq. mails</p>
        </div>
      </div>
      {(
        <div className={cn("flex flex-wrap gap-2", compact ? "mb-1" : "mb-4")}>
          {weekGesprekkenPerUnit.map((u, i) => (
            <div key={u.unit} className="bg-muted/50 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">{u.unit}: </span>
              <span className="font-semibold text-foreground">{u.gesprekken} gespr.</span>
              <span className="text-muted-foreground"> / </span>
              <span className="font-semibold text-foreground">{weekMailStats.perUnit[i]?.mails ?? 0} mails</span>
            </div>
          ))}
        </div>
      )}
      <div className={cn("min-h-0", compact ? "flex-1" : "h-36")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={combinedDailyData} margin={{ top: 15, right: 0, bottom: 0, left: 0 }}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: compact ? 10 : 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="outbound" name="Gesprekken" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="outbound" position="top" fontSize={10} fill="hsl(var(--foreground))" fontWeight={600} />
            </Bar>
            <Bar dataKey="mails" name="Acq. mails" fill="hsl(var(--gold))" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="mails" position="top" fontSize={10} fill="hsl(var(--gold))" fontWeight={600} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
