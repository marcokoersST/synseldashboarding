import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import {
  paidChannelData,
  jobboardData,
  paidSocialData,
  adLevelData,
  reverseMatchingSteps,
  totals,
  formatCurrency,
  previousPeriodValue,
  deltaPercent,
} from "@/data/marketingHubData";
import type { DateRange } from "react-day-picker";

interface Props {
  dateRange: DateRange;
  onTabChange: (tab: string) => void;
}

const OverviewTab = ({ dateRange, onTabChange }: Props) => {
  const kpis = useMemo(() => {
    const pc = totals(paidChannelData);
    const jb = totals(jobboardData);
    const ps = totals(paidSocialData);
    const totalConversions = pc.conversions + jb.conversions + ps.conversions;
    const totalRegistrations = pc.registrations + jb.registrations + ps.registrations;
    const totalSpend = pc.spend + jb.spend + ps.spend;
    const cpr = totalRegistrations > 0 ? totalSpend / totalRegistrations : 0;
    const rmVolume = reverseMatchingSteps[0]?.volume ?? 0;

    return [
      {
        label: "Conversions",
        value: totalConversions,
        previous: previousPeriodValue(totalConversions),
        tab: "paid-channels",
      },
      {
        label: "Registrations",
        value: totalRegistrations,
        previous: previousPeriodValue(totalRegistrations),
        tab: "paid-channels",
      },
      {
        label: "Cost per Registration",
        value: cpr,
        previous: previousPeriodValue(Math.round(cpr)),
        format: "currency" as const,
        tab: "paid-channels",
        invertDelta: true,
      },
      {
        label: "Reverse Matching",
        value: rmVolume,
        previous: previousPeriodValue(rmVolume),
        tab: "reverse-matching",
      },
    ];
  }, []);

  const categoryBreakdown = useMemo(() => {
    const pc = totals(paidChannelData);
    const jb = totals(jobboardData);
    const ps = totals(paidSocialData);
    return [
      { label: "Paid Channels", registrations: pc.registrations, conversions: pc.conversions, spend: pc.spend, tab: "paid-channels" },
      { label: "Jobboards", registrations: jb.registrations, conversions: jb.conversions, spend: jb.spend, tab: "jobboards" },
      { label: "Paid Social", registrations: ps.registrations, conversions: ps.conversions, spend: ps.spend, tab: "paid-social" },
    ];
  }, []);

  const unitDistribution = useMemo(() => {
    const allData = [...paidChannelData, ...jobboardData, ...paidSocialData];
    const units = new Map<string, { registrations: number; conversions: number }>();
    for (const row of allData) {
      const existing = units.get(row.unit) || { registrations: 0, conversions: 0 };
      existing.registrations += row.registrations;
      existing.conversions += row.conversions;
      units.set(row.unit, existing);
    }
    return Array.from(units.entries()).map(([unit, vals]) => ({ unit, ...vals }));
  }, []);

  const highlights = useMemo(() => {
    const sources = new Map<string, number>();
    for (const row of paidChannelData) {
      sources.set(row.source, (sources.get(row.source) || 0) + row.registrations);
    }
    const sorted = Array.from(sources.entries()).sort((a, b) => b[1] - a[1]);
    return {
      bestSource: sorted[0]?.[0] ?? "-",
      bestSourceVolume: sorted[0]?.[1] ?? 0,
      highestCPR: "Technicus.nl",
      lowestCPR: "Indeed",
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const delta = deltaPercent(kpi.value, kpi.previous);
          const isPositive = kpi.invertDelta ? (delta !== null && delta < 0) : (delta !== null && delta > 0);
          return (
            <Card
              key={kpi.label}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onTabChange(kpi.tab)}
            >
              <CardContent className="p-5">
                <p className="text-xs font-medium text-muted-foreground mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold text-foreground">
                  {kpi.format === "currency" ? formatCurrency(Math.round(kpi.value)) : kpi.value.toLocaleString("nl-NL")}
                </p>
                {delta !== null && (
                  <div className={`flex items-center gap-1 mt-1 text-xs ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{delta > 0 ? "+" : ""}{delta.toFixed(1)}%</span>
                    <span className="text-muted-foreground ml-1">vs vorige periode</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Kanaal Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categoryBreakdown.map((cat) => (
              <div
                key={cat.label}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onTabChange(cat.tab)}
              >
                <span className="font-medium text-sm">{cat.label}</span>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <span className="text-muted-foreground text-xs">Registrations</span>
                    <p className="font-semibold">{cat.registrations.toLocaleString("nl-NL")}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground text-xs">Conversions</span>
                    <p className="font-semibold">{cat.conversions.toLocaleString("nl-NL")}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground text-xs">Spend</span>
                    <p className="font-semibold">{formatCurrency(cat.spend)}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Unit distribution + Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Unit Verdeling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unitDistribution.map((u) => {
                const totalReg = unitDistribution.reduce((s, x) => s + x.registrations, 0);
                const pct = totalReg > 0 ? (u.registrations / totalReg) * 100 : 0;
                return (
                  <div key={u.unit}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{u.unit}</span>
                      <span className="text-muted-foreground">{u.registrations} reg. / {u.conversions} conv.</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-2 rounded bg-emerald-500/10">
                <span className="text-muted-foreground">Best performing source</span>
                <span className="font-semibold text-emerald-700">{highlights.bestSource} ({highlights.bestSourceVolume})</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-blue-500/10">
                <span className="text-muted-foreground">Laagste CPR</span>
                <span className="font-semibold text-blue-700">{highlights.lowestCPR}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-amber-500/10">
                <span className="text-muted-foreground">Hoogste CPR</span>
                <span className="font-semibold text-amber-700">{highlights.highestCPR}</span>
              </div>
              <div
                className="flex justify-between items-center p-2 rounded bg-purple-500/10 cursor-pointer hover:bg-purple-500/20 transition-colors"
                onClick={() => onTabChange("paid-social-ad")}
              >
                <span className="text-muted-foreground">Top ad type</span>
                <span className="font-semibold text-purple-700">Go Video <ArrowRight className="inline h-3 w-3 ml-1" /></span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
