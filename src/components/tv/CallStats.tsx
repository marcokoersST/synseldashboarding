import { Phone, Clock, CalendarCheck, Mail, PhoneCall } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { weekCallStats, weekGesprekkenPerUnit, weekMailStats, periodCallStatsDaily, periodGesprekkenPerUnit, periodMailStats } from "@/data/tvData";
import { useTVCompact } from "./TVDashboardLayout";
import { TileHeader } from "./TileHeader";
import { KPIBadge } from "./KPIBadge";
import { cn } from "@/lib/utils";
import { DevNote } from "@/components/groeimodel/DevNote";

interface CallStatsProps {
  mode: "week" | "period";
}

function UnitChip({ unit, gespr, mails, calls, compact }: { unit: string; gespr: number; mails: number; calls: number; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-lg bg-muted/40 border border-border/40", compact ? "px-2.5 py-1.5" : "px-2.5 py-1.5")}>
      <span className={cn("font-semibold text-foreground", compact ? "text-sm" : "text-xs")}>{unit}</span>
      <span className={cn("flex items-center gap-1", compact ? "text-sm" : "text-[11px]")}>
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        <span className="font-semibold text-foreground tabular-nums">{gespr}</span>
        <span className={cn("text-muted-foreground", compact ? "text-xs" : "text-[10px]")}>gespr</span>
      </span>
      <span className={cn("flex items-center gap-1", compact ? "text-sm" : "text-[11px]")}>
        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--gold))]" />
        <span className="font-semibold text-foreground tabular-nums">{mails}</span>
        <span className={cn("text-muted-foreground", compact ? "text-xs" : "text-[10px]")}>mails</span>
      </span>
      <span className={cn("flex items-center gap-1", compact ? "text-sm" : "text-[11px]")}>
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        <span className="font-semibold text-foreground tabular-nums">{calls}</span>
        <span className={cn("text-muted-foreground", compact ? "text-xs" : "text-[10px]")}>calls</span>
      </span>
    </div>
  );
}

export function CallStats({ mode }: CallStatsProps) {
  const compact = useTVCompact();
  const isPeriod = mode === "period";

  const callsDaily = isPeriod ? periodCallStatsDaily : weekCallStats;
  const mailStats = isPeriod ? periodMailStats : weekMailStats;
  const perUnit = isPeriod ? periodGesprekkenPerUnit : weekGesprekkenPerUnit;

  const totalOutbound = callsDaily.reduce((s, d) => s + d.outbound, 0);
  const totalMinutes = callsDaily.reduce((s, d) => s + d.duration, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const totalGesprekken = perUnit.reduce((s, u) => s + u.gesprekken, 0);
  const totalAcqCalls = perUnit.reduce((s, u) => s + (u.acquisitieCalls ?? 0), 0);

  const combinedDailyData = callsDaily.map((d, i) => ({
    day: d.day,
    outbound: d.outbound,
    mails: mailStats.perDay[i]?.mails ?? 0,
  }));

  return (
    <div className={cn("bg-card rounded-xl border border-border h-full overflow-hidden flex flex-col", compact ? "p-3" : "p-5")}>
      <TileHeader
        icons={[
          { icon: Phone, className: "text-primary" },
          { icon: Mail, className: "text-[hsl(var(--gold))]" },
        ]}
        title="Bel- & Mailstatistieken"
        compact={compact}
      />

      {/* KPIs */}
      <div className={cn("grid grid-cols-5", compact ? "gap-2 mb-3" : "gap-2 mb-4")}>
        <KPIBadge icon={Phone} value={totalOutbound.toLocaleString("nl-NL")} label="Uitgaand" tone="primary" compact={false} size={compact ? "md" : "md"} />
        <KPIBadge icon={Clock} value={`${hours}u${mins.toString().padStart(2, "0")}m`} label="Gesprekstijd" tone="chart-primary" compact={false} size={compact ? "md" : "md"} />
        <KPIBadge icon={CalendarCheck} value={String(totalGesprekken)} label="Gesprekken" tone="accent" compact={false} size={compact ? "md" : "md"} />
        <KPIBadge icon={Mail} value={String(mailStats.totalAcquisitieMails)} label="Acq. mails" tone="gold" compact={false} size={compact ? "md" : "md"} />
        <KPIBadge icon={PhoneCall} value={String(totalAcqCalls)} label="Acq. calls" tone="primary" compact={false} size={compact ? "md" : "md"} />
      </div>

      {/* Per-unit chips */}
      <div className={cn("flex flex-wrap gap-1.5", compact ? "mb-2" : "mb-3")}>
        {perUnit.map((u, i) => (
          <UnitChip
            key={u.unit}
            unit={u.unit}
            gespr={u.gesprekken}
            mails={mailStats.perUnit[i]?.mails ?? 0}
            calls={u.acquisitieCalls ?? 0}
            compact={compact}
          />
        ))}
      </div>

      {/* Chart */}
      <div className={cn("flex items-center justify-end gap-3", compact ? "mb-1" : "mb-2")}>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-primary" /><span className={cn("text-muted-foreground font-medium", compact ? "text-xs" : "text-[10px]")}>Gesprekken</span></span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[hsl(var(--gold))]" /><span className={cn("text-muted-foreground font-medium", compact ? "text-xs" : "text-[10px]")}>Acq. mails</span></span>
      </div>
      <div className={cn("min-h-0", compact ? "flex-1" : "h-32")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={combinedDailyData} margin={{ top: 15, right: 0, bottom: 0, left: 0 }}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: compact ? 13 : 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="outbound" name="Gesprekken" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="outbound" position="top" fontSize={compact ? 12 : 10} fill="hsl(var(--foreground))" fontWeight={600} />
            </Bar>
            <Bar dataKey="mails" name="Acq. mails" fill="hsl(var(--gold))" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="mails" position="top" fontSize={compact ? 12 : 10} fill="hsl(var(--gold))" fontWeight={600} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {!compact && (
        <DevNote
          id={5}
          story={<><strong>As a user (manager/TV viewer)</strong>, I want to see total outbound calls, call duration, gesprekken, acquisition mails and acquisition calls for the week, broken down by unit, <strong>so that</strong> I can track daily calling and mailing effort across the team.</>}
          logic={`Five KPI badges at the top:
  • Uitgaand — sum of daily outbound calls
  • Gesprekstijd — total minutes converted to Hu:MMm
  • Gesprekken — total gesprekken across units
  • Acq. mails — acquisition mails from mailStats
  • Acq. calls — acquisition calls per unit

Per-unit chips break these numbers down by unit.

Bar chart shows daily outbound calls (blue) and
acquisition mails (gold) side by side.

Mode prop switches between week data and period data
from tvData.ts.`}
        />
      )}
    </div>
  );
}
