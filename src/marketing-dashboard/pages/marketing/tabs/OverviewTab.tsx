import JobTitleTable from "@/marketing-dashboard/components/marketing/JobTitleTable";
import InflowBreakdownCard from "@/marketing-dashboard/components/marketing/InflowBreakdownCard";
import KpiQualityBadge from "@/marketing-dashboard/components/marketing/KpiQualityBadge";
import KpiIcon from "@/marketing-dashboard/components/marketing/KpiIcon";
import QualityScoreComparison from "@/marketing-dashboard/components/marketing/QualityScoreComparison";
import { consultantQuality } from "@/marketing-dashboard/components/marketing/ConsultantDetailDialog";
import DeltaCell, { type DeltaMode } from "@/marketing-dashboard/components/marketing/DeltaCell";
import { useMemo, useState } from "react";
import MarketingTrendChart from "@/marketing-dashboard/components/marketing/MarketingTrendChart";
import { aggregateQualityScore, formatQualityScore } from "@/marketing-dashboard/lib/marketingQuality";
import { Card, CardContent, CardHeader, CardTitle } from "@/marketing-dashboard/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/marketing-dashboard/components/ui/select";
import { Badge } from "@/marketing-dashboard/components/ui/badge";
import { Button } from "@/marketing-dashboard/components/ui/button";
import { Checkbox } from "@/marketing-dashboard/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/marketing-dashboard/components/ui/popover";
import { Progress } from "@/marketing-dashboard/components/ui/progress";
import { TrendingUp, TrendingDown, ArrowRight, ArrowUp, ArrowDown, ArrowUpDown, Filter, AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/marketing-dashboard/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Cell } from "recharts";
import { getCompareDisplayText, getComparisonValue } from "@/marketing-dashboard/lib/marketingCompare";
import {
  paidChannelData as rawPaidChannelData,
  jobboardData as rawJobboardData,
  paidSocialData as rawPaidSocialData,
  adLevelData as rawAdLevelData,
  
  totals,
  formatCurrency,
  previousPeriodValue,
  deltaPercent,
  aggregatePaidChannels,
  MARKETING_COLORS,
} from "@/marketing-dashboard/data/marketingHubData";
import {
  inflowSourceData as rawInflowSourceData,
  inflowConsultantData as rawInflowConsultantData,
  inflowCampaignData as rawInflowCampaignData,
  inflowCampaignCandidateTotal,
  inflowHeractiveringen,
  aggregateByUnit,
} from "@/marketing-dashboard/data/marketingInflowData";
import type { DateRange } from "react-day-picker-v9";
import { filterMarketingRows, toggleQuickFilter, isQuickFilter, withoutQuickFilter, quickFilterValues, quickDimClass, type MarketingFilterRule } from "@/marketing-dashboard/lib/marketingFilters";

interface Props {
  dateRange: DateRange;
  compareRange: DateRange | null;
  deltaMode?: DeltaMode;
  onTabChange: (tab: any) => void;
  tvMode?: boolean;
  filters: MarketingFilterRule[];
  onFiltersChange?: (filters: MarketingFilterRule[]) => void;
}

type SortDirection = "asc" | "desc";

function SortableHeader({
  label,
  active,
  direction,
  align = "left",
  onSort,
}: {
  label: string;
  active: boolean;
  direction: SortDirection;
  align?: "left" | "right";
  onSort: () => void;
}) {
  const Icon = active ? (direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("h-auto w-full max-w-full min-w-0 gap-1 whitespace-normal p-0 font-medium hover:bg-transparent", align === "right" ? "justify-end" : "justify-start")}
      onClick={onSort}
    >
      <span className="min-w-0 break-words whitespace-normal text-xs leading-tight">{label}</span>
      <Icon className={cn("h-3 w-3 shrink-0", !active && "text-muted-foreground/60")} />
    </Button>
  );
}

function DeltaBadge({ current, previous, compareLabel, invert }: { current: number; previous: number; compareLabel: string; invert?: boolean | undefined }) {
  const d = deltaPercent(current, previous);
  if (d === null) return null;
  const isPositive = invert ? d < 0 : d > 0;
  return (
    <div className={cn("flex items-center gap-1 mt-1 text-xs", isPositive ? "text-emerald-600" : "text-red-500")}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      <span>{d > 0 ? "+" : ""}{d.toFixed(1)}%</span>
      <span className="text-muted-foreground ml-1">{compareLabel}</span>
    </div>
  );
}

function ProgressBar({ current, previous, invert }: { current: number; previous: number; invert?: boolean | undefined }) {
  const d = deltaPercent(current, previous);
  const isPositive = d === null ? true : invert ? d < 0 : d > 0;
  const ratio = previous > 0 ? Math.min((current / previous) * 100, 150) : 100;
  const ratioLabel = previous > 0 ? Math.round((current / previous) * 100) : 100;
  return (
    <div className="mt-2">
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", isPositive ? "bg-emerald-500" : "bg-red-400")}
          style={{ width: `${Math.min(ratio / 1.5 * 100 / 100, 100)}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-0.5">{ratioLabel}% van vorige week</p>
    </div>
  );
}

/** Consultant selection: demo data has no per-consultant rows, so counts scale by the consultant's inflow share (scores untouched). */
function scaleRows<T>(rows: T[], share: number): T[] {
  if (share === 1) return rows;
  return rows.map((row) => Object.fromEntries(Object.entries(row as Record<string, unknown>).map(([k, v]) => [k, typeof v === "number" && !/quality/i.test(k) ? Math.round(v * share) : v])) as T);
}

/** Reuse existing local source scores for both labels: no separate candidate-quality cohort exists. */
const overviewSourceQualityRows = rawInflowSourceData.map((row) => {
  const all = [
    ...rawPaidChannelData.map((r) => ({ ...r, bron: r.source })),
    ...rawJobboardData.map((r) => ({ ...r, bron: r.board })),
    ...rawPaidSocialData.map((r) => ({ ...r, bron: r.platform })),
  ];
  const matching = all.filter((r) => r.bron === row.bron);
  return { ...row, qualityScore: aggregateQualityScore(matching.length ? matching : all) };
});

const OverviewTab = ({ dateRange, compareRange, deltaMode = "percent", onTabChange, filters, onFiltersChange, tvMode = false }: Props) => {
  const consultantRule = filters.find((f) => f.field === "consultant");
  const consultantShare = useMemo(() => {
    if (!consultantRule) return 1;
    const others = filters.filter((f) => f.field !== "consultant");
    const base = filterMarketingRows(rawInflowConsultantData, others, (row) => ({ unit: row.unit }));
    const picked = filterMarketingRows(base, [consultantRule], (row) => ({ consultant: row.consultant }));
    const total = base.reduce((a, r) => a + r.inschrijvingen, 0);
    return total > 0 ? picked.reduce((a, r) => a + r.inschrijvingen, 0) / total : 0;
  }, [filters, consultantRule]);
  const [inflowTypes, setInflowTypes] = useState<Array<"nieuw" | "heractivering">>([]);
  const toggleInflowType = (t: "nieuw" | "heractivering") => setInflowTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  const inflowShare = useMemo(() => {
    if (inflowTypes.length !== 1) return 1;
    const inflowType = inflowTypes[0];
    const nieuw = rawInflowConsultantData.reduce((a, r) => a + r.inschrijvingen, 0);
    const total = nieuw + inflowHeractiveringen.current;
    return total > 0 ? (inflowType === "nieuw" ? nieuw : inflowHeractiveringen.current) / total : 1;
  }, [inflowTypes]);
  const dataShare = consultantShare * inflowShare;
  const quickFilter = (field: "bron" | "consultant", value: string) => onFiltersChange?.(toggleQuickFilter(filters, field, value));
  const isQuick = (field: "bron" | "consultant", value: string) => isQuickFilter(filters, field, value);
  const compareLabel = getCompareDisplayText(compareRange);
  const paidChannelData = useMemo(() => scaleRows(filterMarketingRows(rawPaidChannelData, filters, (row) => ({ unit: row.unit, functiegroep: row.functiegroep, bron: row.source })), dataShare), [filters, dataShare]);
  const jobboardData = useMemo(() => scaleRows(filterMarketingRows(rawJobboardData, filters, (row) => ({ unit: row.unit, functiegroep: row.category, bron: row.board, campagne: row.category })), dataShare), [filters, dataShare]);
  const paidSocialData = useMemo(() => scaleRows(filterMarketingRows(rawPaidSocialData, filters, (row) => ({ unit: row.unit, functiegroep: row.segment, bron: row.platform, campagne: row.segment })), dataShare), [filters, dataShare]);
  const adLevelData = useMemo(() => scaleRows(filterMarketingRows(rawAdLevelData, filters, (row) => ({ unit: row.unit, functiegroep: row.functiegroep, bron: row.platform, ad: row.adType })), dataShare), [filters, dataShare]);
  const inflowSourceData = useMemo(() => scaleRows(filterMarketingRows(overviewSourceQualityRows, filters, (row) => ({ bron: row.bron })), dataShare), [filters, dataShare]);
  const sourceTableData = useMemo(() => scaleRows(filterMarketingRows(overviewSourceQualityRows, withoutQuickFilter(filters, "bron"), (row) => ({ bron: row.bron })), dataShare), [filters, dataShare]);
  // Consultant rows have no source dimension: scale counts by the selected sources' inflow share so source clicks propagate.
  const bronShare = useMemo(() => {
    const bronRules = filters.filter((f) => f.field === "bron" || f.field === "campagne");
    if (bronRules.length === 0) return 1;
    const all = overviewSourceQualityRows.reduce((a, r) => a + r.inschrijvingen, 0);
    const kept = rawInflowCampaignData.length && bronRules.some((f) => f.field === "campagne")
      ? (() => { const c = rawInflowCampaignData.reduce((a, r) => a + r.inschrijvingen, 0); const k = filterMarketingRows(rawInflowCampaignData, bronRules, (row) => ({ bron: row.bron, campagne: row.campagne })).reduce((a, r) => a + r.inschrijvingen, 0); return c > 0 ? (k / c) * all : 0; })()
      : filterMarketingRows(overviewSourceQualityRows, bronRules, (row) => ({ bron: row.bron })).reduce((a, r) => a + r.inschrijvingen, 0);
    return all > 0 ? kept / all : 1;
  }, [filters]);
  const consultantScale = bronShare * inflowShare;
  const consultantTableData = useMemo(() => scaleRows(filterMarketingRows(rawInflowConsultantData, withoutQuickFilter(filters, "consultant"), (row) => ({ unit: row.unit, consultant: row.consultant })), consultantScale), [filters, consultantScale]);
  const inflowConsultantData = useMemo(() => scaleRows(filterMarketingRows(rawInflowConsultantData, filters, (row) => ({ unit: row.unit, consultant: row.consultant })), consultantScale), [filters, consultantScale]);
  const inflowCampaignData = useMemo(() => scaleRows(filterMarketingRows(rawInflowCampaignData, filters, (row) => ({ bron: row.bron, campagne: row.campagne })), dataShare), [filters, dataShare]);

  const qualityRows = useMemo(() => [...paidChannelData, ...jobboardData, ...paidSocialData], [paidChannelData, jobboardData, paidSocialData]);

  // KPIs
  const kpis = useMemo(() => {
    const pc = totals(paidChannelData);
    const jb = totals(jobboardData);
    const ps = totals(paidSocialData);
    const totalConversions = pc.conversions + jb.conversions + ps.conversions;
    const totalRegistrations = pc.registrations + jb.registrations + ps.registrations;
    const totalSpend = pc.spend + jb.spend + ps.spend;
    const previousConversions = getComparisonValue(totalConversions, { dateRange, compareRange, seed: "overview-conversions" });
    const previousRegistrations = getComparisonValue(totalRegistrations, { dateRange, compareRange, seed: "overview-registrations" });
    const previousSpend = getComparisonValue(totalSpend, { dateRange, compareRange, seed: "overview-spend" });
    const matchableCandidates = inflowSourceData.reduce((sum, row) => sum + row.bemiddelbareKandidaten, 0);
    const previousMatchableCandidates = Math.round(matchableCandidates * (146 / 267));
    const cpr = totalRegistrations > 0 ? totalSpend / totalRegistrations : 0;
    const previousCpr = previousRegistrations > 0 ? previousSpend / previousRegistrations : 0;
    const qualityScore = aggregateQualityScore([...paidChannelData, ...jobboardData, ...paidSocialData]);
    const items: { label: string; value: number; previous: number; tab: string; format?: string; invertDelta?: boolean; qualityScore?: number; qualityLabel?: string }[] = [
      { label: "Conversions", value: totalConversions, previous: previousConversions, tab: "paid-channels", qualityScore, qualityLabel: "Quality score\nper conversion" },
      { label: "Quality Index Conv.", value: 38048, previous: getComparisonValue(38048, { dateRange, compareRange, seed: "overview-quality-index" }), tab: "paid-channels" },
      { label: "Bemiddelbare kandidaten", value: matchableCandidates, previous: previousMatchableCandidates, tab: "inschrijvingen", qualityScore, qualityLabel: "Quality score\nper bemiddelbare\nkandidaat" },
      { label: "Inschrijven", value: totalRegistrations, previous: previousRegistrations, tab: "paid-channels", qualityScore, qualityLabel: "Quality score\nper inschrijving" },

      { label: "Cost per Inschrijving", value: cpr, previous: previousCpr, format: "currency", tab: "paid-channels", invertDelta: true },
      { label: "Quality Index bem.", value: 41276, previous: getComparisonValue(41276, { dateRange, compareRange, seed: "overview-quality-index-bem" }), tab: "paid-channels" },
    ];
    return items;
  }, [dateRange, compareRange, paidChannelData, jobboardData, paidSocialData, inflowSourceData]);

  // Fastest rising CPR
  const fastestRisingCPR = useMemo(() => {
    const agg = aggregatePaidChannels(paidChannelData);
    let worst = { source: "-", currentCpr: 0, previousCpr: 0, rise: 0 };
    for (const row of agg) {
      const currentCpr = row.registrations > 0 ? row.spend / row.registrations : 0;
      const previousRegistrations = getComparisonValue(row.registrations, { dateRange, compareRange, seed: `${row.source}-overview-registrations` });
      const previousSpend = getComparisonValue(row.spend, { dateRange, compareRange, seed: `${row.source}-overview-spend` });
      const previousCpr = previousRegistrations > 0 ? previousSpend / previousRegistrations : 0;
      const rise = previousCpr > 0 ? ((currentCpr - previousCpr) / previousCpr) * 100 : 0;
      if (rise > worst.rise) worst = { source: row.source, currentCpr, previousCpr, rise };
    }
    return worst;
  }, [dateRange, compareRange, paidChannelData]);

  // Inflow data for inline display
  const allUnits = useMemo(() => {
    const set = new Set(inflowConsultantData.map((c) => c.unit));
    return Array.from(set).sort();
  }, [inflowConsultantData]);
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set(allUnits));
  const [unitViewMode, setUnitViewMode] = useState<"totaal" | "gemiddeld" | "mediaan">("totaal");
  const [sourceSort, setSourceSort] = useState<{ key: "bron" | "conversies" | "inschrijvingen" | "bemiddelbareKandidaten" | "acquisitie" | "qualityScore"; direction: SortDirection }>({ key: "inschrijvingen", direction: "desc" });
  const [consultantSort, setConsultantSort] = useState<{ key: "consultant" | "inschrijvingen" | "acquisitie" | "qualityScore"; direction: SortDirection }>({ key: "inschrijvingen", direction: "desc" });
  const [campaignSort, setCampaignSort] = useState<{ key: "campagne" | "bron" | "kandidaten" | "inschrijvingen" | "conversion"; direction: SortDirection }>({ key: "kandidaten", direction: "desc" });

  const toggleSort = <T extends string>(
    current: { key: T; direction: SortDirection },
    key: T,
  ): { key: T; direction: SortDirection } => ({
    key,
    direction: current.key === key && current.direction === "desc" ? "asc" : "desc",
  });

  const filteredConsultants = useMemo(
    () => inflowConsultantData.filter((c) => selectedUnits.has(c.unit)).map((c) => ({ ...c, qualityScore: consultantQuality(c) })),
    [selectedUnits, inflowConsultantData]
  );
  const consultantTableRows = useMemo(
    () => consultantTableData.filter((c) => selectedUnits.has(c.unit)).map((c) => ({ ...c, qualityScore: consultantQuality(c) })),
    [selectedUnits, consultantTableData]
  );
  const sortedSources = useMemo(() => [...sourceTableData].sort((a, b) => {
    const aValue = a[sourceSort.key];
    const bValue = b[sourceSort.key];
    const result = typeof aValue === "string"
      ? aValue.localeCompare(String(bValue), "nl")
      : aValue - Number(bValue);
    return sourceSort.direction === "asc" ? result : -result;
  }), [sourceTableData, sourceSort]);
  const sortedConsultants = useMemo(() => [...consultantTableRows].sort((a, b) => {
    const aValue = a[consultantSort.key];
    const bValue = b[consultantSort.key];
    const result = typeof aValue === "string"
      ? aValue.localeCompare(String(bValue), "nl")
      : aValue - Number(bValue);
    return consultantSort.direction === "asc" ? result : -result;
  }), [consultantTableRows, consultantSort]);
  const sortedCampaigns = useMemo(() => [...inflowCampaignData].sort((a, b) => {
    const aValue = campaignSort.key === "conversion"
      ? (a.kandidaten > 0 ? a.inschrijvingen / a.kandidaten : 0)
      : a[campaignSort.key];
    const bValue = campaignSort.key === "conversion"
      ? (b.kandidaten > 0 ? b.inschrijvingen / b.kandidaten : 0)
      : b[campaignSort.key];
    const result = typeof aValue === "string"
      ? aValue.localeCompare(String(bValue), "nl")
      : aValue - Number(bValue);
    return campaignSort.direction === "asc" ? result : -result;
  }), [inflowCampaignData, campaignSort]);
  const [openCampaigns, setOpenCampaigns] = useState<Set<string>>(new Set());
  const groupedCampaigns = useMemo(() => {
    const map = new Map<string, { campagne: string; bron: string; kandidaten: number; inschrijvingen: number; prevKandidaten: number; prevInschrijvingen: number; channels: typeof inflowCampaignData }>();
    for (const c of inflowCampaignData) {
      const g = map.get(c.campagne) ?? { campagne: c.campagne, bron: "", kandidaten: 0, inschrijvingen: 0, prevKandidaten: 0, prevInschrijvingen: 0, channels: [] };
      g.kandidaten += c.kandidaten; g.inschrijvingen += c.inschrijvingen; g.prevKandidaten += c.prevKandidaten; g.prevInschrijvingen += c.prevInschrijvingen; g.channels.push(c);
      map.set(c.campagne, g);
    }
    const value = (r: { campagne: string; kandidaten: number; inschrijvingen: number }) => campaignSort.key === "conversion" ? (r.kandidaten > 0 ? r.inschrijvingen / r.kandidaten : 0) : campaignSort.key === "campagne" || campaignSort.key === "bron" ? r.campagne : r[campaignSort.key];
    const cmp = (a: { campagne: string; kandidaten: number; inschrijvingen: number }, b: typeof a) => {
      const av = value(a), bv = value(b);
      const r = typeof av === "string" ? av.localeCompare(String(bv), "nl") : av - Number(bv);
      return campaignSort.direction === "asc" ? r : -r;
    };
    return [...map.values()].map(g => ({ ...g, channels: [...g.channels].sort(cmp) })).sort(cmp);
  }, [inflowCampaignData, campaignSort]);
  const sourceQualityRows = useMemo(() => inflowSourceData.map((s) => ({ qualityScore: s.qualityScore, conversions: s.conversies })), [inflowSourceData]);
  const sourceQualityTotal = aggregateQualityScore(sourceQualityRows);
  const consultantQualityTotal = useMemo(() => aggregateQualityScore(filteredConsultants.map((c) => ({ qualityScore: c.qualityScore, conversions: c.inschrijvingen }))), [filteredConsultants]);
  const consultantTotals = useMemo(() => filteredConsultants.reduce(
    (acc, c) => ({ inschrijvingen: acc.inschrijvingen + c.inschrijvingen, acquisitie: acc.acquisitie + c.acquisitie, prevInschrijvingen: acc.prevInschrijvingen + c.prevInschrijvingen, prevAcquisitie: acc.prevAcquisitie + c.prevAcquisitie }),
    { inschrijvingen: 0, acquisitie: 0, prevInschrijvingen: 0, prevAcquisitie: 0 }
  ), [filteredConsultants]);
  const sourceTotals = useMemo(() => inflowSourceData.reduce(
    (acc, s) => ({
      conversies: acc.conversies + s.conversies,
      prevConversies: acc.prevConversies + s.prevConversies,
      inschrijvingen: acc.inschrijvingen + s.inschrijvingen,
      bemiddelbareKandidaten: acc.bemiddelbareKandidaten + s.bemiddelbareKandidaten,
      acquisitie: acc.acquisitie + s.acquisitie,
      prevInschrijvingen: acc.prevInschrijvingen + s.prevInschrijvingen,
      prevBemiddelbareKandidaten: acc.prevBemiddelbareKandidaten + s.prevBemiddelbareKandidaten,
      prevAcquisitie: acc.prevAcquisitie + s.prevAcquisitie,
    }),
    { conversies: 0, prevConversies: 0, inschrijvingen: 0, bemiddelbareKandidaten: 0, acquisitie: 0, prevInschrijvingen: 0, prevBemiddelbareKandidaten: 0, prevAcquisitie: 0 },
  ), [inflowSourceData]);
  const campaignCandidateCount = useMemo(
    () => inflowCampaignData.reduce((total, campaign) => total + campaign.kandidaten, 0),
    [inflowCampaignData],
  );
  const campaignCoverage = inflowCampaignCandidateTotal > 0
    ? (campaignCandidateCount / inflowCampaignCandidateTotal) * 100
    : 0;

  const unitChartSource = useMemo(() => filterMarketingRows(rawInflowConsultantData, withoutQuickFilter(filters, "unit"), (row) => ({ unit: row.unit, consultant: row.consultant })), [filters]);
  const unitChartData = useMemo(() => {
    const filteredConsultants = unitChartSource;
    const baseData = aggregateByUnit(filteredConsultants);
    if (unitViewMode === "totaal") return baseData;

    const median = (arr: number[]) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const middle = sorted[mid] ?? 0;
      const lowerMiddle = sorted[mid - 1] ?? middle;
      return sorted.length % 2 !== 0 ? middle : (lowerMiddle + middle) / 2;
    };

    return baseData.map(unitRow => {
      const consultantsInUnit = filteredConsultants.filter(c => c.unit === unitRow.unit);
      const count = consultantsInUnit.length || 1;

      if (unitViewMode === "gemiddeld") {
        return {
          ...unitRow,
          inschrijvingen: Math.round((unitRow.inschrijvingen / count) * 10) / 10,
          acquisitie: Math.round((unitRow.acquisitie / count) * 10) / 10,
          prevInschrijvingen: Math.round((unitRow.prevInschrijvingen / count) * 10) / 10,
          prevAcquisitie: Math.round((unitRow.prevAcquisitie / count) * 10) / 10,
        };
      }
      // mediaan
      return {
        ...unitRow,
        inschrijvingen: median(consultantsInUnit.map(c => c.inschrijvingen)),
        acquisitie: median(consultantsInUnit.map(c => c.acquisitie)),
        prevInschrijvingen: median(consultantsInUnit.map(c => c.prevInschrijvingen)),
        prevAcquisitie: median(consultantsInUnit.map(c => c.prevAcquisitie)),
      };
    });
  }, [unitChartSource, unitViewMode]);
  const unitChartRows = useMemo(() => unitChartData.map(r => {
    const fmt = (cur: number, prev: number) => {
      const v = cur.toLocaleString("nl-NL");
      if (!compareRange) return v;
      if (deltaMode === "absolute") { const d = Math.round((cur - prev) * 10) / 10; return `${v} (${d > 0 ? "+" : ""}${d.toLocaleString("nl-NL")})`; }
      if (prev <= 0) return v;
      const d = ((cur - prev) / prev) * 100;
      return `${v} (${d > 0 ? "+" : ""}${d.toFixed(1).replace(".", ",")}%)`;
    };
    return { ...r, inschrijvingenLabel: fmt(r.inschrijvingen, r.prevInschrijvingen), acquisitieLabel: fmt(r.acquisitie, r.prevAcquisitie) };
  }), [unitChartData, compareRange, deltaMode]);
  const previousInflowRegistrations = useMemo(
    () => getComparisonValue(consultantTotals.inschrijvingen, { dateRange, compareRange, seed: "overview-inflow-registrations" }),
    [consultantTotals.inschrijvingen, dateRange, compareRange],
  );
  const previousHeractiveringen = useMemo(
    () => getComparisonValue(inflowHeractiveringen.current, { dateRange, compareRange, seed: "overview-heractiveringen" }),
    [dateRange, compareRange],
  );

  // Unit distribution
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
  }, [paidChannelData, jobboardData, paidSocialData]);

  const highlights = useMemo(() => {
    const sources = new Map<string, number>();
    for (const row of paidChannelData) {
      sources.set(row.source, (sources.get(row.source) || 0) + row.registrations);
    }
    const sorted = Array.from(sources.entries()).sort((a, b) => b[1] - a[1]);
    return {
      bestSource: sorted[0]?.[0] ?? "-",
      bestSourceVolume: sorted[0]?.[1] ?? 0,
      lowestCPR: "Indeed (€8,14)",
    };
  }, [paidChannelData]);

  const unitFilterLabel = selectedUnits.size === allUnits.length
    ? "Alle units"
    : selectedUnits.size === 0
      ? "Geen units"
      : `${selectedUnits.size} unit${selectedUnits.size > 1 ? "s" : ""}`;

  if (tvMode) {
    return (
      <>
      <div className="grid shrink-0 grid-cols-2 gap-6 lg:min-h-[18vh] lg:grid-cols-3 xl:grid-cols-[1.4fr_1.4fr_1.4fr_1fr_1fr_1fr] [@media(max-height:850px)]:gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="flex h-full flex-col justify-between p-6 [@media(max-height:850px)]:p-3">
               <div className="flex min-h-[64px] items-start justify-between gap-2 [@media(max-height:850px)]:min-h-[52px]">
                <KpiIcon label={kpi.label} title={kpi.label} size="lg" />
                <KpiQualityBadge label={kpi.label} rows={qualityRows} dateRange={dateRange} compareRange={compareRange} size="lg" />
              </div>




              <p className="my-2 text-5xl font-bold text-foreground tabular-nums [@media(max-height:850px)]:my-1 [@media(max-height:850px)]:text-4xl">
                {kpi.format === "currency" ? formatCurrency(Math.round(kpi.value)) : kpi.value.toLocaleString("nl-NL")}
              </p>
              <DeltaBadge current={kpi.value} previous={kpi.previous} compareLabel={compareLabel} invert={kpi.invertDelta} />
            </CardContent>
          </Card>
        ))}
      </div>
      <MarketingTrendChart dateRange={dateRange} qualityRows={qualityRows} totals={totals(qualityRows)} matchableCandidates={inflowSourceData.reduce((sum, row) => sum + row.bemiddelbareKandidaten, 0)} tvMode />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.4fr_1.4fr_1.4fr_1fr_1fr_1fr] gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange(kpi.tab)}>
            <CardContent className="p-5">
              <div className="mb-1 flex min-h-[56px] items-start justify-between gap-2">
                <KpiIcon label={kpi.label} title={kpi.label} />
                <KpiQualityBadge label={kpi.label} rows={qualityRows} dateRange={dateRange} compareRange={compareRange} />
              </div>




              <p className="mt-1 text-2xl font-bold text-foreground">
                {kpi.format === "currency" ? formatCurrency(Math.round(kpi.value)) : kpi.value.toLocaleString("nl-NL")}
              </p>
              <DeltaBadge current={kpi.value} previous={kpi.previous} compareLabel={compareLabel} invert={kpi.invertDelta} />
              <ProgressBar current={kpi.value} previous={kpi.previous} invert={kpi.invertDelta} />
            </CardContent>
          </Card>
        ))}
      </div>

      <MarketingTrendChart dateRange={dateRange} compareRange={compareRange} qualityRows={qualityRows} totals={totals(qualityRows)} />

      {/* Inflow section with unit filter */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-foreground">Inflow</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              <Filter className="mr-1.5 h-3 w-3" />{unitFilterLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Units</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setSelectedUnits(new Set(allUnits))}>Alles aan</Button>
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setSelectedUnits(new Set())}>Alles uit</Button>
              </div>
            </div>
            <div className="space-y-2">
              {allUnits.map((unit) => (
                <label key={unit} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox checked={selectedUnits.has(unit)} onCheckedChange={() => {
                    setSelectedUnits(prev => { const n = new Set(prev); n.has(unit) ? n.delete(unit) : n.add(unit); return n; });
                  }} />
                  {unit}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Inflow scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InflowBreakdownCard active={inflowTypes.includes("nieuw")} dimmed={inflowTypes.length > 0 && !inflowTypes.includes("nieuw")} onSelect={() => toggleInflowType("nieuw")} title="Inschrijvingen (nieuw in systeem)" value={consultantTotals.inschrijvingen} seed={1} qualityLabel={"Quality score per\nnieuwe inschrijving"}>
          <DeltaBadge current={consultantTotals.inschrijvingen} previous={previousInflowRegistrations} compareLabel={compareLabel} />
          <ProgressBar current={consultantTotals.inschrijvingen} previous={previousInflowRegistrations} />
        </InflowBreakdownCard>
        <InflowBreakdownCard active={inflowTypes.includes("heractivering")} dimmed={inflowTypes.length > 0 && !inflowTypes.includes("heractivering")} onSelect={() => toggleInflowType("heractivering")} title="Heractiveringen" value={inflowHeractiveringen.current} seed={2} qualityLabel={"Quality score per\nheractivering"}>
          <DeltaBadge current={inflowHeractiveringen.current} previous={previousHeractiveringen} compareLabel={compareLabel} />
          <ProgressBar current={inflowHeractiveringen.current} previous={previousHeractiveringen} />
        </InflowBreakdownCard>
      </div>

      {/* Inflow tables */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-6">
        <Card className="flex flex-col">
          <CardHeader className="pb-3"><CardTitle className="text-base">Per Bron</CardTitle></CardHeader>
          <CardContent className="p-0 flex flex-col flex-1">
            <div className="max-h-[300px] overflow-auto flex-1">
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col className="w-[12%]" />
                  <col className="w-[13%]" />
                  <col className="w-[16%]" />
                  <col className="w-[16%]" />
                  <col className="w-[13%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                </colgroup>
                <thead>
                  <tr className="border-b">
                    <th className="sticky top-0 bg-background z-10 h-11 px-3 text-left text-muted-foreground break-words"><SortableHeader label="Bron" active={sourceSort.key === "bron"} direction={sourceSort.direction} onSort={() => setSourceSort(current => toggleSort(current, "bron"))} /></th>
                    <th className="sticky top-0 bg-background z-10 h-11 px-3 text-right text-muted-foreground break-words"><SortableHeader label="Conversies" active={sourceSort.key === "conversies"} direction={sourceSort.direction} align="right" onSort={() => setSourceSort(current => toggleSort(current, "conversies"))} /></th>
                    <th className="sticky top-0 bg-background z-10 h-11 px-3 text-right text-muted-foreground break-words"><SortableHeader label="Bemiddelbare kandidaten" active={sourceSort.key === "bemiddelbareKandidaten"} direction={sourceSort.direction} align="right" onSort={() => setSourceSort(current => toggleSort(current, "bemiddelbareKandidaten"))} /></th>
                    <th className="sticky top-0 bg-background z-10 h-11 px-3 text-right text-muted-foreground break-words"><SortableHeader label="Inschrijvingen" active={sourceSort.key === "inschrijvingen"} direction={sourceSort.direction} align="right" onSort={() => setSourceSort(current => toggleSort(current, "inschrijvingen"))} /></th>
                    <th className="sticky top-0 bg-background z-10 h-11 px-3 text-right text-muted-foreground break-words"><SortableHeader label="Acquisitie" active={sourceSort.key === "acquisitie"} direction={sourceSort.direction} align="right" onSort={() => setSourceSort(current => toggleSort(current, "acquisitie"))} /></th>
                    {["Quality score conv.", "Quality score bem."].map((label) => (
                      <th key={label} className="sticky top-0 bg-background z-10 h-11 px-3 text-right text-muted-foreground break-words"><SortableHeader label={label} active={sourceSort.key === "qualityScore"} direction={sourceSort.direction} align="right" onSort={() => setSourceSort(current => toggleSort(current, "qualityScore"))} /></th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedSources.map((s) => (
                    <tr key={s.bron} className={cn("border-b hover:bg-muted/50", quickDimClass(filters, "bron", s.bron))}>
                      <td className="font-medium px-3 py-2.5"><button type="button" onClick={() => quickFilter("bron", s.bron)} aria-pressed={isQuick("bron", s.bron)} className={cn("text-left underline-offset-2 hover:underline", isQuick("bron", s.bron) && "text-primary underline")}>{s.bron}</button></td>
                      <td className="text-right tabular-nums px-3 py-2.5">
                        <DeltaCell value={s.conversies} dateRange={dateRange} compareRange={compareRange} seed={`source-${s.bron}-conversies`} previousValue={s.prevConversies} deltaMode={deltaMode} align="end" />
                      </td>
                      <td className="text-right tabular-nums px-3 py-2.5">
                        <DeltaCell value={s.bemiddelbareKandidaten} dateRange={dateRange} compareRange={compareRange} seed={`source-${s.bron}-bemiddelbare`} previousValue={s.prevBemiddelbareKandidaten} deltaMode={deltaMode} align="end" />
                      </td>
                      <td className="text-right tabular-nums px-3 py-2.5">
                        <DeltaCell value={s.inschrijvingen} dateRange={dateRange} compareRange={compareRange} seed={`source-${s.bron}-inschrijvingen`} previousValue={s.prevInschrijvingen} deltaMode={deltaMode} align="end" />
                      </td>
                      <td className="text-right tabular-nums px-3 py-2.5">
                        <DeltaCell value={s.acquisitie} dateRange={dateRange} compareRange={compareRange} seed={`source-${s.bron}-acquisitie`} previousValue={s.prevAcquisitie} deltaMode={deltaMode} align="end" />
                      </td>
                      {["conv", "bem"].map((kind) => <td key={kind} className="text-right tabular-nums px-3 py-2.5"><span className="inline-flex justify-end"><QualityScoreComparison factor={kind === "conv" ? 0.94 : 1} value={s.qualityScore} rows={[{ qualityScore: s.qualityScore, conversions: s.conversies }]} dateRange={dateRange} compareRange={compareRange} /></span></td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t bg-muted px-3 py-2.5 flex font-semibold text-sm">
              <span className="flex-[12] px-3">Totaal</span>
              <div className="flex-[13] px-3 tabular-nums flex justify-end"><DeltaCell value={sourceTotals.conversies} dateRange={dateRange} compareRange={compareRange} seed="source-totaal-conversies" previousValue={sourceTotals.prevConversies} deltaMode={deltaMode} align="end" /></div>
              <div className="flex-[16] px-3 tabular-nums flex justify-end"><DeltaCell value={sourceTotals.bemiddelbareKandidaten} dateRange={dateRange} compareRange={compareRange} seed="source-totaal-bemiddelbare" previousValue={sourceTotals.prevBemiddelbareKandidaten} deltaMode={deltaMode} align="end" /></div>
              <div className="flex-[16] px-3 tabular-nums flex justify-end"><DeltaCell value={sourceTotals.inschrijvingen} dateRange={dateRange} compareRange={compareRange} seed="source-totaal-inschrijvingen" previousValue={sourceTotals.prevInschrijvingen} deltaMode={deltaMode} align="end" /></div>
              <div className="flex-[13] px-3 tabular-nums flex justify-end"><DeltaCell value={sourceTotals.acquisitie} dateRange={dateRange} compareRange={compareRange} seed="source-totaal-acquisitie" previousValue={sourceTotals.prevAcquisitie} deltaMode={deltaMode} align="end" /></div>
              <div className="flex-[15] px-3 tabular-nums flex justify-end"><QualityScoreComparison factor={0.94} value={sourceQualityTotal} rows={sourceQualityRows} dateRange={dateRange} compareRange={compareRange} /></div>
              <div className="flex-[15] px-3 tabular-nums flex justify-end"><QualityScoreComparison value={sourceQualityTotal} rows={sourceQualityRows} dateRange={dateRange} compareRange={compareRange} /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-3"><CardTitle className="text-base">Per Consultant</CardTitle></CardHeader>
          <CardContent className="p-0 flex flex-col flex-1">
            <div className="max-h-[300px] overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="sticky top-0 bg-background z-10 h-11 px-3 text-left text-muted-foreground"><SortableHeader label="Consultant" active={consultantSort.key === "consultant"} direction={consultantSort.direction} onSort={() => setConsultantSort(current => toggleSort(current, "consultant"))} /></th>
                    <th className="sticky top-0 bg-background z-10 h-11 px-3 text-right text-muted-foreground w-28"><SortableHeader label="Inschrijvingen" active={consultantSort.key === "inschrijvingen"} direction={consultantSort.direction} align="right" onSort={() => setConsultantSort(current => toggleSort(current, "inschrijvingen"))} /></th>
                    <th className="sticky top-0 bg-background z-10 h-11 px-3 text-right text-muted-foreground w-28"><SortableHeader label="Acquisitie" active={consultantSort.key === "acquisitie"} direction={consultantSort.direction} align="right" onSort={() => setConsultantSort(current => toggleSort(current, "acquisitie"))} /></th>
                    <th className="sticky top-0 bg-background z-10 h-11 px-3 text-right text-muted-foreground w-32"><SortableHeader label="Quality score bem." active={consultantSort.key === "qualityScore"} direction={consultantSort.direction} align="right" onSort={() => setConsultantSort(current => toggleSort(current, "qualityScore"))} /></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedConsultants.map((c) => (
                    <tr key={c.consultant} className={cn("border-b hover:bg-muted/50", quickDimClass(filters, "consultant", c.consultant))}>
                      <td className="font-medium px-3 py-2.5"><button type="button" onClick={() => quickFilter("consultant", c.consultant)} aria-pressed={isQuick("consultant", c.consultant)} className={cn("text-left underline-offset-2 hover:underline", isQuick("consultant", c.consultant) && "text-primary underline")}>{c.consultant}</button></td>
                      <td className="text-right tabular-nums px-3 py-2.5">
                        <DeltaCell value={c.inschrijvingen} dateRange={dateRange} compareRange={compareRange} seed={`consultant-${c.consultant}-inschrijvingen`} previousValue={c.prevInschrijvingen} deltaMode={deltaMode} align="end" />
                      </td>
                      <td className="text-right tabular-nums px-3 py-2.5">
                        <DeltaCell value={c.acquisitie} dateRange={dateRange} compareRange={compareRange} seed={`consultant-${c.consultant}-acquisitie`} previousValue={c.prevAcquisitie} deltaMode={deltaMode} align="end" />
                      </td>
                      <td className="text-right tabular-nums px-3 py-2.5 font-semibold"><span className="inline-flex justify-end"><QualityScoreComparison value={c.qualityScore} rows={[{ qualityScore: c.qualityScore, conversions: c.inschrijvingen }]} dateRange={dateRange} compareRange={compareRange} /></span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t bg-muted px-3 py-2.5 flex font-semibold text-sm">
              <span className="flex-1">Totaal</span>
              <div className="w-28 tabular-nums">
                <DeltaCell value={consultantTotals.inschrijvingen} dateRange={dateRange} compareRange={compareRange} seed="consultant-totaal-inschrijvingen" previousValue={consultantTotals.prevInschrijvingen} deltaMode={deltaMode} align="end" />
              </div>
              <div className="w-28 tabular-nums">
                <DeltaCell value={consultantTotals.acquisitie} dateRange={dateRange} compareRange={compareRange} seed="consultant-totaal-acquisitie" previousValue={consultantTotals.prevAcquisitie} deltaMode={deltaMode} align="end" />
              </div>
              <div className="w-28 flex justify-end text-right tabular-nums"><QualityScoreComparison value={consultantQualityTotal} rows={filteredConsultants.map((c) => ({ qualityScore: c.qualityScore, conversions: c.inschrijvingen }))} dateRange={dateRange} compareRange={compareRange} /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Per Campagne</CardTitle>
          <p className="text-xs text-muted-foreground">
            {campaignCandidateCount} van de {inflowCampaignCandidateTotal} kandidaten in deze periode heeft een campagnenaam ({campaignCoverage.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%). De rest staat niet in deze tabel. Kandidaten zijn nieuwe kandidaten, niet inschrijvingen — deze tabel telt dus iets anders dan de instroom hierboven.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[330px] overflow-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b">
                  <th className="sticky top-0 z-10 bg-background h-11 px-3 text-left text-muted-foreground"><SortableHeader label="Campagne" active={campaignSort.key === "campagne"} direction={campaignSort.direction} onSort={() => setCampaignSort(current => toggleSort(current, "campagne"))} /></th>
                  <th className="sticky top-0 z-10 bg-background h-11 px-3 text-right text-muted-foreground"><SortableHeader label="Kandidaten" active={campaignSort.key === "kandidaten"} direction={campaignSort.direction} align="right" onSort={() => setCampaignSort(current => toggleSort(current, "kandidaten"))} /></th>
                  <th className="sticky top-0 z-10 bg-background h-11 px-3 text-right text-muted-foreground"><SortableHeader label="Inschrijvingen" active={campaignSort.key === "inschrijvingen"} direction={campaignSort.direction} align="right" onSort={() => setCampaignSort(current => toggleSort(current, "inschrijvingen"))} /></th>
                  <th className="sticky top-0 z-10 bg-background h-11 px-3 text-right text-muted-foreground"><SortableHeader label="Conv." active={campaignSort.key === "conversion"} direction={campaignSort.direction} align="right" onSort={() => setCampaignSort(current => toggleSort(current, "conversion"))} /></th>
                </tr>
              </thead>
              <tbody>
                {groupedCampaigns.flatMap((group) => {
                  const isOpen = openCampaigns.has(group.campagne);
                  const row = (r: { kandidaten: number; inschrijvingen: number; prevKandidaten: number; prevInschrijvingen: number }, key: string, label: React.ReactNode, child: boolean) => {
                    const conversion = r.kandidaten > 0 ? (r.inschrijvingen / r.kandidaten) * 100 : 0;
                    const previousConversion = r.prevKandidaten > 0 ? (r.prevInschrijvingen / r.prevKandidaten) * 100 : 0;
                    const seed = `campaign-${key}`;
                    return (
                      <tr key={key} className={cn("border-b hover:bg-muted/50", child && "bg-muted/30")}>
                        <td className={cn("px-3 py-2.5", child ? "pl-10 text-muted-foreground" : "font-medium")}>{label}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums"><DeltaCell value={r.kandidaten} dateRange={dateRange} compareRange={compareRange} seed={`${seed}-kandidaten`} previousValue={r.prevKandidaten} deltaMode={deltaMode} align="end" /></td>
                        <td className="px-3 py-2.5 text-right tabular-nums"><DeltaCell value={r.inschrijvingen} dateRange={dateRange} compareRange={compareRange} seed={`${seed}-inschrijvingen`} previousValue={r.prevInschrijvingen} deltaMode={deltaMode} align="end" /></td>
                        <td className="px-3 py-2.5 text-right tabular-nums"><DeltaCell value={conversion} dateRange={dateRange} compareRange={compareRange} seed={`${seed}-conv`} format="percentage" previousValue={previousConversion} deltaMode={deltaMode} align="end" /></td>
                      </tr>
                    );
                  };
                  const toggle = () => setOpenCampaigns(cur => { const n = new Set(cur); if (n.has(group.campagne)) n.delete(group.campagne); else n.add(group.campagne); return n; });
                  const label = (
                    <button type="button" onClick={toggle} aria-expanded={isOpen} className="flex items-center gap-1.5 text-left">
                      <ChevronRight className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-90")} />
                      {group.campagne}
                      <span className="text-xs font-normal text-muted-foreground">({group.channels.length} {group.channels.length === 1 ? "kanaal" : "kanalen"})</span>
                    </button>
                  );
                  return [
                    row(group, group.campagne, label, false),
                    ...(isOpen ? group.channels.map((c, i) => row(c, `${group.campagne}-${c.bron}-${i}`, c.bron, true)) : []),
                  ];
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <JobTitleTable filters={filters} onFiltersChange={onFiltersChange} seed="ov-titles" showSpend={false} totals={{ conversions: sourceTotals.conversies, registrations: sourceTotals.inschrijvingen }} dateRange={dateRange} compareRange={compareRange} deltaMode={deltaMode} />

      {/* Inflow unit chart */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Inflow per Unit</CardTitle>
          <Select value={unitViewMode} onValueChange={(v) => setUnitViewMode(v as "totaal" | "gemiddeld" | "mediaan")}>
            <SelectTrigger className="w-[200px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="totaal">Totaal</SelectItem>
              <SelectItem value="gemiddeld">Gemiddeld per consultant</SelectItem>
              <SelectItem value="mediaan">Mediaan per consultant</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={unitChartRows} margin={{ left: 10, right: 30, top: 18, bottom: 5 }} barGap={2} style={{ cursor: "pointer" }} onClick={(e) => { const u = (e as { activeLabel?: string } | null)?.activeLabel; if (u) onFiltersChange?.(toggleQuickFilter(filters, "unit", String(u))); }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="unit" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.3)]} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              {compareRange && (
                <Bar dataKey="prevInschrijvingen" name="Inschrijvingen (vorige periode)" fill={MARKETING_COLORS[0]} fillOpacity={0.35} radius={[6, 6, 0, 0]} barSize={20}>{unitChartRows.map(r => <Cell key={r.unit} fillOpacity={(quickFilterValues(filters, "unit").length && !isQuickFilter(filters, "unit", r.unit) ? 0.3 : 1) * (0.35)} />)}
                  <LabelList dataKey="prevInschrijvingen" position="top" style={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                </Bar>
              )}
              <Bar dataKey="inschrijvingen" name="Inschrijvingen" fill={MARKETING_COLORS[0]} radius={[6, 6, 0, 0]} barSize={28}>{unitChartRows.map(r => <Cell key={r.unit} fillOpacity={(quickFilterValues(filters, "unit").length && !isQuickFilter(filters, "unit", r.unit) ? 0.3 : 1) * (1)} />)}
                <LabelList dataKey="inschrijvingenLabel" position="top" style={{ fontSize: 10, fill: "hsl(var(--foreground))" }} />
              </Bar>
              {compareRange && (
                <Bar dataKey="prevAcquisitie" name="Acquisitie (vorige periode)" fill={MARKETING_COLORS[1]} fillOpacity={0.35} radius={[6, 6, 0, 0]} barSize={20}>{unitChartRows.map(r => <Cell key={r.unit} fillOpacity={(quickFilterValues(filters, "unit").length && !isQuickFilter(filters, "unit", r.unit) ? 0.3 : 1) * (0.35)} />)}
                  <LabelList dataKey="prevAcquisitie" position="top" style={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                </Bar>
              )}
              <Bar dataKey="acquisitie" name="Acquisitie" fill={MARKETING_COLORS[1]} radius={[6, 6, 0, 0]} barSize={28}>{unitChartRows.map(r => <Cell key={r.unit} fillOpacity={(quickFilterValues(filters, "unit").length && !isQuickFilter(filters, "unit", r.unit) ? 0.3 : 1) * (1)} />)}
                <LabelList dataKey="acquisitieLabel" position="top" style={{ fontSize: 10, fill: "hsl(var(--foreground))" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Highlights */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Highlights</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-2 rounded bg-emerald-500/10">
              <span className="text-muted-foreground">Best presterende bron</span>
              <span className="font-semibold text-emerald-700">{highlights.bestSource} ({highlights.bestSourceVolume})</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-blue-500/10">
              <span className="text-muted-foreground">Laagste CPA</span>
              <span className="font-semibold text-blue-700">{highlights.lowestCPR}</span>
            </div>
            <div
              className="flex justify-between items-center p-2 rounded bg-red-500/10 cursor-pointer hover:bg-red-500/20 transition-colors"
              onClick={() => onTabChange("paid-channels")}
            >
              <span className="text-muted-foreground flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                Snelst stijgende CPA
              </span>
              <span className="font-semibold text-red-700">
                {fastestRisingCPR.source} (+{fastestRisingCPR.rise.toFixed(1)}%)
                <ArrowRight className="inline h-3 w-3 ml-1" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unit distribution */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Unit Verdeling (Marketing)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {unitDistribution.map((u) => {
              const totalReg = unitDistribution.reduce((s, x) => s + x.registrations, 0);
              const pct = totalReg > 0 ? (u.registrations / totalReg) * 100 : 0;
              return (
                <div key={u.unit}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{u.unit}</span>
                    <span className="text-muted-foreground">{u.registrations} inschrijven / {u.conversions} conv.</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
