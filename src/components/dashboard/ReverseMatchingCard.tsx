import { useState } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Users,
  MessageSquare,
  Trophy,
  Maximize2,
  Minimize2,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
  Send,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Mock data ───

const kpis = [
  {
    key: "approached",
    label: "Benaderd",
    value: 96,
    trend: 10,
    icon: Send,
    color: "gold",
    bgClass: "bg-gold/10",
    iconClass: "text-gold",
  },
  {
    key: "pitched",
    label: "Voorgesteld",
    value: 42,
    trend: 12,
    icon: Users,
    color: "primary",
    bgClass: "bg-primary/10",
    iconClass: "text-primary",
  },
  {
    key: "applications",
    label: "Gesprekken",
    value: 18,
    trend: 8,
    icon: MessageSquare,
    color: "teal",
    bgClass: "bg-teal/10",
    iconClass: "text-teal",
  },
  {
    key: "deals",
    label: "Plaatsingen",
    value: 7,
    trend: 16,
    icon: Trophy,
    color: "success",
    bgClass: "bg-success/10",
    iconClass: "text-success",
  },
] as const;

const conversions = [
  { rate: 43.8, label: "Benaderd → Voorgesteld" },
  { rate: 42.9, label: "Pitch → Gesprek" },
  { rate: 38.9, label: "Gesprek → Plaatsing" },
];

const trendData = [
  { period: "P8", approached: 80, pitched: 35, applications: 14, deals: 4 },
  { period: "P9", approached: 85, pitched: 38, applications: 15, deals: 5 },
  { period: "P10", approached: 72, pitched: 30, applications: 12, deals: 4 },
  { period: "P11", approached: 100, pitched: 44, applications: 20, deals: 6 },
  { period: "P12", approached: 92, pitched: 40, applications: 16, deals: 5 },
  { period: "P13", approached: 96, pitched: 42, applications: 18, deals: 7 },
];

const recentPlacements = [
  { name: "Sophie de Vries", company: "Randstad NL", date: "12 jan" },
  { name: "Tom Bakker", company: "ASML", date: "8 jan" },
  { name: "Lisa Jansen", company: "Philips", date: "3 jan" },
];

// ─── Detail toggle hook (same pattern as CommunicationStatsCard) ───

function useDetailToggle() {
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayMode, setDisplayMode] = useState(false);

  const toggle = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      const newMode = !isDetailMode;
      setIsDetailMode(newMode);
      setDisplayMode(newMode);
      setTimeout(() => setIsTransitioning(false), 120);
    }, 300);
  };

  return { isDetailMode, isTransitioning, displayMode, toggle };
}

// ─── Component ───

interface ReverseMatchingCardProps {
  delay?: number;
}

export function ReverseMatchingCard({ delay = 0 }: ReverseMatchingCardProps) {
  const { isTransitioning, displayMode, toggle } = useDetailToggle();

  return (
    <AnimatedCard delay={delay} className="h-full">
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Reverse Matching</h3>
              <p className="text-[10px] text-muted-foreground">Engine prestaties</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-7 w-7 rounded-full bg-secondary hover:bg-secondary/80"
            title={displayMode ? "Overzicht" : "Details"}
          >
            {displayMode ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {/* Content with transition */}
        <div
          className={cn(
            "flex-1 transition-all duration-400 ease-in-out",
            isTransitioning
              ? "opacity-0 scale-[0.97] translate-y-2"
              : "opacity-100 scale-100 translate-y-0"
          )}
        >
          {displayMode ? (
            <DetailView delay={delay} />
          ) : (
            <OverviewView delay={delay} />
          )}
        </div>
      </div>
    </AnimatedCard>
  );
}

// ─── Overview ───

function OverviewView({ delay }: { delay: number }) {
  return (
    <div className="flex flex-col h-full justify-between gap-4">
      {/* KPI flow */}
      <div className="flex items-stretch gap-0">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          const isPositive = kpi.trend > 0;
          return (
            <div key={kpi.key} className="flex items-stretch flex-1">
              {/* KPI block */}
              <div
                className={cn(
                  "flex-1 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 transition-all",
                  kpi.bgClass
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center",
                    `bg-${kpi.color}/20`
                  )}
                >
                  <Icon className={cn("h-4 w-4", kpi.iconClass)} />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  {kpi.label}
                </span>
                <AnimatedNumber
                  value={kpi.value}
                  delay={delay + 200 + i * 100}
                  className="text-2xl font-bold text-foreground"
                />
                <span
                  className={cn(
                    "text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5",
                    isPositive
                      ? "bg-success/15 text-success"
                      : "bg-destructive/15 text-destructive"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isPositive ? "+" : ""}
                  {kpi.trend}%
                </span>
              </div>

              {/* Conversion arrow */}
              {i < conversions.length && (
                <div className="flex flex-col items-center justify-center px-2 gap-0.5">
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                  <span className="text-[9px] font-semibold text-muted-foreground tabular-nums whitespace-nowrap">
                    {conversions[i].rate}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Gradient funnel bar */}
      <div className="flex items-center gap-1 h-2.5">
        <div
          className="h-full rounded-l-full transition-all duration-700"
          style={{
            width: "100%",
            background:
              "linear-gradient(to right, hsl(var(--primary) / 0.6), hsl(var(--primary) / 0.3))",
          }}
        />
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${(18 / 42) * 100}%`,
            background:
              "linear-gradient(to right, hsl(var(--teal) / 0.6), hsl(var(--teal) / 0.3))",
          }}
        />
        <div
          className="h-full rounded-r-full transition-all duration-700"
          style={{
            width: `${(7 / 42) * 100}%`,
            background:
              "linear-gradient(to right, hsl(var(--success) / 0.6), hsl(var(--success) / 0.3))",
          }}
        />
      </div>
    </div>
  );
}

// ─── Detail ───

function DetailView({ delay }: { delay: number }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Conversion funnel */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-2 block">
          Conversie funnel
        </span>
        <div className="space-y-3">
          {kpis.map((kpi, i) => {
            const width =
              i === 0 ? 100 : Math.round((kpi.value / kpis[0].value) * 100);
            return (
              <div key={kpi.key}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs text-muted-foreground">
                    {kpi.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground tabular-nums">
                      {kpi.value}
                    </span>
                    {i > 0 && (
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {conversions[i - 1].rate}%
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className="h-7 rounded-md transition-all duration-700"
                  style={{
                    width: `${width}%`,
                    background: `linear-gradient(to right, hsl(var(--${kpi.color}) / 0.3), hsl(var(--${kpi.color}) / 0.7))`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Trend chart */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-2 block">
          Trend per periode
        </span>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <XAxis
                dataKey="period"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
              />
              <Line
                type="monotone"
                dataKey="pitched"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                name="Voorgesteld"
              />
              <Line
                type="monotone"
                dataKey="applications"
                stroke="hsl(var(--teal))"
                strokeWidth={2}
                dot={false}
                name="Gesprekken"
              />
              <Line
                type="monotone"
                dataKey="deals"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={false}
                name="Plaatsingen"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent placements */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium mb-2 block">
          Recente plaatsingen
        </span>
        <div className="space-y-2">
          {recentPlacements.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors"
            >
              <div className="h-7 w-7 rounded-full bg-success/10 flex items-center justify-center">
                <Trophy className="h-3.5 w-3.5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {p.name}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  <span>{p.company}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{p.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
