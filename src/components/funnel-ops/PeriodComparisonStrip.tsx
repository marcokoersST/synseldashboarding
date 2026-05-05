import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { TrendingDown, TrendingUp, Minus, CalendarRange } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useFunnelOpsFilters } from "@/contexts/FunnelOpsFiltersContext";
import { rangeStats } from "@/data/funnelOperationsData";
import { TileInfo } from "./TileInfo";
import { cn } from "@/lib/utils";

function fmtPeriod(from: number, to: number) {
  return `${format(from, "d MMM", { locale: nl })} – ${format(to, "d MMM yy", { locale: nl })}`;
}

function Delta({ cur, prev, suffix = "" }: { cur: number; prev: number | null; suffix?: string }) {
  if (prev === null) return <span className="text-[10px] text-muted-foreground">geen vergelijking</span>;
  const diff = cur - prev;
  const pct = prev === 0 ? null : Math.round((diff / prev) * 100);
  const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const color = diff > 0 ? "text-success" : diff < 0 ? "text-destructive" : "text-muted-foreground";
  return (
    <span className={cn("text-[11px] font-medium inline-flex items-center gap-0.5 tabular-nums", color)}>
      <Icon className="w-3 h-3" />
      {diff > 0 ? "+" : ""}{diff}{suffix}
      {pct !== null && <span className="text-muted-foreground">({diff > 0 ? "+" : ""}{pct}%)</span>}
    </span>
  );
}

export function PeriodComparisonStrip() {
  const { filters } = useFunnelOpsFilters();
  const cur = rangeStats(filters.current.from, filters.current.to);
  const prev = filters.compare ? rangeStats(filters.compare.from, filters.compare.to) : null;

  const items: { label: string; cur: number; prev: number | null; suffix?: string }[] = [
    { label: "Instroom", cur: cur.instroom, prev: prev?.instroom ?? null },
    { label: "Gem. score", cur: cur.avgScore, prev: prev?.avgScore ?? null },
    { label: "Gecontacteerd", cur: cur.contacted, prev: prev?.contacted ?? null },
    { label: "Contact-SLA", cur: cur.contactSLApct, prev: prev?.contactSLApct ?? null, suffix: "%" },
    { label: "Geplaatst", cur: cur.geplaatst, prev: prev?.geplaatst ?? null },
  ];

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 text-xs">
          <CalendarRange className="w-4 h-4 text-primary" />
          <span className="font-semibold">Periode:</span>
          <span className="tabular-nums">{fmtPeriod(filters.current.from, filters.current.to)}</span>
          {filters.compare && (
            <>
              <span className="text-muted-foreground">vs</span>
              <span className="tabular-nums text-muted-foreground">{fmtPeriod(filters.compare.from, filters.compare.to)}</span>
            </>
          )}
        </div>
        <TileInfo
          title="5 blokken bovenaan"
          what={
            "Instroom: aantal kandidaten die in deze periode op kandidaat-status '1 | Inschrijven' zijn gekomen.\n\n" +
            "Gem. score: gemiddelde plaatsbaarheidsscore (0-100) over alle kandidaten die in de periode op status Inschrijven zijn gezet.\n\n" +
            "Gecontacteerd: aantal kandidaten waarmee daadwerkelijk een inschrijvingsgesprek is geweest (gebeld + opgenomen).\n\n" +
            "Contact-SLA: % kandidaten waarbij binnen de tier-termijn een belpoging is gedaan (telt poging, niet daadwerkelijk gesprek).\n\n" +
            "Verwachte plaatsingen: op basis van plaatsbaarheidsscore en volume voorspeld aantal plaatsingen voor deze instroom."
          }
          formula={
            "instroom        = count(candidates where status = '1 | Inschrijven' in [from, to))\n" +
            "avgScore        = mean(score) over instroom\n" +
            "gecontacteerd   = count(candidates with inschrijvingsgesprek)\n" +
            "contactSLApct   = poging_binnen_tier_SLA / instroom × 100\n" +
            "verwacht        = Σ historische plaatsingsratio(functietitel, score-bucket) × instroom"
          }
          source="rangeStats() · FunnelOpsFiltersContext · RecruitCRM kandidaat-status + callrecordings"
          notes="Verwachte plaatsingen vereist historische analyse van genormaliseerde functietitels × plaatsbaarheidsscore × werkelijke plaatsingen."
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {items.map(it => (
          <div key={it.label} className="border border-border rounded-md p-2.5">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{it.label}</div>
            <div className="text-lg font-semibold tabular-nums">{it.cur}{it.suffix ?? ""}</div>
            <Delta cur={it.cur} prev={it.prev} suffix={it.suffix} />
          </div>
        ))}
      </div>
    </Card>
  );
}
