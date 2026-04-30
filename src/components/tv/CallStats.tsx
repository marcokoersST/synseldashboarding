import { Phone, Clock, CalendarCheck, Mail, PhoneCall } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { weekCallStats, weekGesprekkenPerUnit, weekMailStats, periodCallStatsDaily, periodGesprekkenPerUnit, periodMailStats } from "@/data/tvData";
import { useTVCompact } from "./TVDashboardLayout";
import { cn } from "@/lib/utils";

interface CallStatsProps {
  mode: "week" | "period";
}

interface KPIBadgeProps { icon: React.ComponentType<{ className?: string }>; value: string; label: string; tone: "primary" | "accent" | "chart-primary" | "gold"; compact?: boolean; }
function KPIBadge({ icon: Icon, value, label, tone, compact }: KPIBadgeProps) {
  const toneMap = {
    primary: { bg: "bg-primary/10", text: "text-primary", under: "bg-primary" },
    accent: { bg: "bg-accent/10", text: "text-accent", under: "bg-accent" },
    "chart-primary": { bg: "bg-[hsl(var(--chart-primary)/0.12)]", text: "text-[hsl(var(--chart-primary))]", under: "bg-[hsl(var(--chart-primary))]" },
    gold: { bg: "bg-[hsl(var(--gold)/0.15)]", text: "text-[hsl(var(--gold))]", under: "bg-[hsl(var(--gold))]" },
  } as const;
  const t = toneMap[tone];
  return (
    <div className="flex flex-col items-center text-center gap-1">
      <div className={cn("rounded-full flex items-center justify-center", t.bg, compact ? "w-7 h-7" : "w-9 h-9")}>
        <Icon className={cn(t.text, compact ? "w-3.5 h-3.5" : "w-4 h-4")} />
      </div>
      <p className={cn("font-bold text-foreground tabular-nums leading-tight", compact ? "text-base" : "text-2xl")}>{value}</p>
      <div className={cn("rounded-full", t.under, compact ? "h-0.5 w-5" : "h-0.5 w-7")} />
      <p className={cn("text-muted-foreground", compact ? "text-[10px]" : "text-xs")}>{label}</p>
    </div>
  );
}

function UnitChip({ unit, gespr, mails, calls, compact }: { unit: string; gespr: number; mails: number; calls: number; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-lg bg-muted/40 border border-border/40", compact ? "px-2 py-1" : "px-2.5 py-1.5")}>
      <span className={cn("font-semibold text-foreground", compact ? "text-[11px]" : "text-xs")}>{unit}</span>
      <span className="flex items-center gap-1 text-[11px]">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        <span className="font-semibold text-foreground tabular-nums">{gespr}</span>
        <span className="text-muted-foreground text-[10px]">gespr</span>
      </span>
      <span className="flex items-center gap-1 text-[11px]">
        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--gold))]" />
        <span className="font-semibold text-foreground tabular-nums">{mails}</span>
        <span className="text-muted-foreground text-[10px]">mails</span>
      </span>
      <span className="flex items-center gap-1 text-[11px]">
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        <span className="font-semibold text-foreground tabular-nums">{calls}</span>
        <span className="text-muted-foreground text-[10px]">calls</span>
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
      {/* Header strip */}
      <div className={cn("flex items-center gap-2 -mx-3 -mt-3 mb-3 px-3 py-2 rounded-t-xl bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border-b border-border/50", compact && "-mx-3 -mt-3 mb-2 py-1.5")}>
        <Phone className={cn("text-primary", compact ? "w-3.5 h-3.5" : "w-4 h-4")} />
        <Mail className={cn("text-[hsl(var(--gold))]", compact ? "w-3.5 h-3.5" : "w-4 h-4")} />
        <h3 className={cn("font-semibold text-foreground", compact ? "text-xs" : "text-sm")}>Bel- & Mailstatistieken</h3>
      </div>

      {/* KPIs */}
      <div className={cn("grid grid-cols-5", compact ? "gap-1 mb-2" : "gap-2 mb-4")}>
        <KPIBadge icon={Phone} value={totalOutbound.toLocaleString("nl-NL")} label="Uitgaand" tone="primary" compact={compact} />
        <KPIBadge icon={Clock} value={`${hours}u${mins.toString().padStart(2, "0")}m`} label="Gesprekstijd" tone="chart-primary" compact={compact} />
        <KPIBadge icon={CalendarCheck} value={String(totalGesprekken)} label="Gesprekken" tone="accent" compact={compact} />
        <KPIBadge icon={Mail} value={String(mailStats.totalAcquisitieMails)} label="Acq. mails" tone="gold" compact={compact} />
        <KPIBadge icon={PhoneCall} value={String(totalAcqCalls)} label="Acq. calls" tone="primary" compact={compact} />
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
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-primary" /><span className="text-[10px] text-muted-foreground font-medium">Gesprekken</span></span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[hsl(var(--gold))]" /><span className="text-[10px] text-muted-foreground font-medium">Acq. mails</span></span>
      </div>
      <div className={cn("min-h-0", compact ? "flex-1" : "h-32")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={combinedDailyData} margin={{ top: 15, right: 0, bottom: 0, left: 0 }}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: compact ? 10 : 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="outbound" name="Gesprekken" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="outbound" position="top" fontSize={10} fill="hsl(var(--foreground))" fontWeight={600} />
            </Bar>
            <Bar dataKey="mails" name="Acq. mails" fill="hsl(var(--gold))" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="mails" position="top" fontSize={10} fill="hsl(var(--gold))" fontWeight={600} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
