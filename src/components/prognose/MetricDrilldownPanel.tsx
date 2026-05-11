import { X, FileText, Megaphone, Send, MessageCircle, CheckCircle2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PrognoseConsultantRow } from "@/data/prognoseData";
import { metricTier } from "@/data/prognoseData";
import {
  getIntakes,
  getAcquisities,
  getVoorstellen,
  getGesprekken,
  getPlaatsingen,
  getTelefonie,
} from "@/data/prognoseDrilldownData";
import { RecruitCRMLink, RECRUITCRM_URL } from "./RecruitCRMLink";
import { usePrognosePeriod } from "@/contexts/PrognosePeriodContext";
import { MetricSummary, type Stat } from "./MetricSummary";

export type MetricKey =
  | "intakes"
  | "acquisities"
  | "voorstellen"
  | "gesprekken"
  | "plaatsingen"
  | "telefonie";

const METRIC_LABEL: Record<MetricKey, string> = {
  intakes: "Intakes",
  acquisities: "Acquisities",
  voorstellen: "Voorstellen",
  gesprekken: "Gesprekken",
  plaatsingen: "Plaatsingen",
  telefonie: "Telefonie",
};

const METRIC_ICON: Record<MetricKey, typeof FileText> = {
  intakes: FileText,
  acquisities: Megaphone,
  voorstellen: Send,
  gesprekken: MessageCircle,
  plaatsingen: CheckCircle2,
  telefonie: Phone,
};

const TIER_BAND: Record<ReturnType<typeof metricTier>, string> = {
  good: "bg-emerald-500",
  ok: "bg-yellow-500",
  warn: "bg-orange-500",
  bad: "bg-destructive",
};

interface Props {
  metric: MetricKey;
  row: PrognoseConsultantRow;
  onClose: () => void;
}

function Th({ children, align = "left", className }: { children: React.ReactNode; align?: "left" | "right"; className?: string }) {
  return (
    <th
      className={cn(
        "h-9 px-3 text-[11px] font-semibold text-muted-foreground bg-muted/60 sticky top-0 uppercase tracking-wide",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

const ROW = "border-b last:border-0 even:bg-muted/20 hover:bg-primary/5 transition-colors";

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
        <FileText className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">Geen {label} in deze periode.</p>
    </div>
  );
}

export function MetricDrilldownPanel({ metric, row, onClose }: Props) {
  const { label: periodLabel, maxDays } = usePrognosePeriod();
  const Icon = METRIC_ICON[metric];

  // Determine the tier for the band
  let tier: ReturnType<typeof metricTier> = "good";
  let count = 0;
  let target = 0;
  if (metric !== "telefonie") {
    const m = row[metric] as { actual: number; target: number };
    count = m.actual;
    target = m.target;
    tier = metricTier(m.actual, m.target);
  } else {
    const totalSec = row.telefonie.hours * 3600 + row.telefonie.minutes * 60 + row.telefonie.seconds;
    tier = totalSec >= 4 * 3600 ? "good" : totalSec >= 3 * 3600 ? "ok" : totalSec >= 2 * 3600 ? "warn" : "bad";
  }

  // Build summary stats per metric
  const summary: Stat[] = (() => {
    if (metric === "voorstellen") {
      const { promoted, openDeals } = getVoorstellen(row);
      const total = promoted.length + openDeals.length;
      const conv = total ? Math.round((promoted.length / total) * 100) : 0;
      return [
        { label: "Verplaatst", value: promoted.length, tone: "good" as const },
        { label: "Open deals", value: openDeals.reduce((s, d) => s + d.openDeals, 0), tone: "warn" as const },
        { label: "Conversie", value: `${conv}%`, tone: conv >= 60 ? "good" : ("warn" as const) },
      ];
    }
    if (metric === "telefonie") {
      const rows = getTelefonie(row, maxDays);
      const beantwoord = rows.filter((r) => r.resultaat === "Beantwoord").length;
      const ratePct = rows.length ? Math.round((beantwoord / rows.length) * 100) : 0;
      const totalSec = row.telefonie.hours * 3600 + row.telefonie.minutes * 60 + row.telefonie.seconds;
      const avgSec = rows.length ? Math.round(totalSec / rows.length) : 0;
      return [
        { label: "Calls", value: rows.length },
        { label: "Avg duur", value: `${Math.floor(avgSec / 60)}:${(avgSec % 60).toString().padStart(2, "0")}` },
        { label: "Beantwoord", value: `${ratePct}%`, tone: ratePct >= 60 ? "good" : ("warn" as const) },
      ];
    }
    if (metric === "intakes") {
      const rows = getIntakes(row);
      const office = rows.filter((r) => r.type === "Kantoor Intake").length;
      return [
        { label: "Totaal", value: rows.length },
        { label: "Kantoor", value: office },
        { label: "Doel", value: target, tone: count >= target ? "good" : ("warn" as const) },
      ];
    }
    if (metric === "acquisities") {
      return [
        { label: "Totaal", value: count, tone: count >= target ? "good" : ("warn" as const) },
        { label: "Doel", value: target },
        { label: "Realisatie", value: `${Math.round((count / Math.max(1, target)) * 100)}%` },
      ];
    }
    if (metric === "gesprekken") {
      const rows = getGesprekken(row);
      const dealsl = rows.filter((r) => r.type === "Dealsluiter").length;
      return [
        { label: "Totaal", value: rows.length },
        { label: "Dealsluiters", value: dealsl, tone: "good" as const },
        { label: "Doel", value: target },
      ];
    }
    // plaatsingen
    const rows = getPlaatsingen(row);
    const det = rows.filter((r) => r.type === "Detavast").length;
    return [
      { label: "Totaal", value: rows.length, tone: count >= target ? "good" : ("warn" as const) },
      { label: "Detavast", value: det },
      { label: "Doel", value: target },
    ];
  })();

  const renderTable = () => {
    if (metric === "intakes") {
      const rows = getIntakes(row);
      if (rows.length === 0) return <EmptyState label="intakes" />;
      return (
        <table className="w-full text-sm">
          <thead><tr><Th>Kandidaat</Th><Th>Datum</Th><Th>Type</Th><Th>Status</Th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={ROW}>
                <td className="px-3 py-2"><span className="inline-flex items-center gap-2"><RecruitCRMLink />{r.kandidaat}</span></td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{r.datum}</td>
                <td className="px-3 py-2"><Badge variant="secondary" className="text-[10px]">{r.type}</Badge></td>
                <td className="px-3 py-2 text-xs">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (metric === "acquisities") {
      const rows = getAcquisities(row);
      if (rows.length === 0) return <EmptyState label="acquisities" />;
      return (
        <table className="w-full text-sm">
          <thead><tr><Th>Kandidaat</Th><Th>Van</Th><Th>Naar</Th><Th>Datum</Th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={ROW}>
                <td className="px-3 py-2"><span className="inline-flex items-center gap-2"><RecruitCRMLink />{r.kandidaat}</span></td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{r.vanStage}</td>
                <td className="px-3 py-2 text-xs"><Badge variant="outline" className="border-emerald-500 text-emerald-600 text-[10px]">{r.naarStage}</Badge></td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{r.datum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (metric === "voorstellen") {
      const { promoted, openDeals } = getVoorstellen(row);
      return (
        <div className="space-y-5">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 px-3">
              Verplaatst naar 2.0 Kandidaat voorgesteld ({promoted.length})
            </h4>
            {promoted.length === 0 ? <EmptyState label="voorstellen" /> : (
              <table className="w-full text-sm">
                <thead><tr><Th>Kandidaat</Th><Th>Klant</Th><Th>Vorige stage</Th><Th>Datum</Th></tr></thead>
                <tbody>
                  {promoted.map((r, i) => (
                    <tr key={i} className={ROW}>
                      <td className="px-3 py-2"><span className="inline-flex items-center gap-2"><RecruitCRMLink />{r.kandidaat}</span></td>
                      <td className="px-3 py-2 text-xs">{r.klant}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{r.vorigeStage}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{r.datum}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 px-3 flex items-center gap-2">
              Open deals zonder eindstage
              <Badge variant="outline" className="border-amber-500 text-amber-600 text-[10px]">{openDeals.length} kandidaten</Badge>
            </h4>
            {openDeals.length === 0 ? <EmptyState label="open deals" /> : (
              <table className="w-full text-sm">
                <thead><tr><Th>Kandidaat</Th><Th align="right">Open deals</Th><Th>Oudste stage</Th></tr></thead>
                <tbody>
                  {openDeals.map((r, i) => (
                    <tr key={i} className={ROW}>
                      <td className="px-3 py-2"><span className="inline-flex items-center gap-2"><RecruitCRMLink />{r.kandidaat}</span></td>
                      <td className="px-3 py-2 text-right tabular-nums font-semibold text-amber-600">{r.openDeals}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{r.oudsteStage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      );
    }
    if (metric === "gesprekken") {
      const rows = getGesprekken(row);
      if (rows.length === 0) return <EmptyState label="gesprekken" />;
      return (
        <table className="w-full text-sm">
          <thead><tr><Th>Kandidaat</Th><Th>Klant</Th><Th>Type</Th><Th>Datum</Th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={ROW}>
                <td className="px-3 py-2"><span className="inline-flex items-center gap-2"><RecruitCRMLink />{r.kandidaat}</span></td>
                <td className="px-3 py-2 text-xs">{r.klant}</td>
                <td className="px-3 py-2"><Badge variant="secondary" className="text-[10px]">{r.type}</Badge></td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{r.datum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (metric === "telefonie") {
      const rows = getTelefonie(row, maxDays);
      if (rows.length === 0) return <EmptyState label="calls" />;
      return (
        <table className="w-full text-sm">
          <thead><tr><Th>Kandidaat</Th><Th>Klant</Th><Th>Richting</Th><Th align="right">Duur</Th><Th>Resultaat</Th><Th>Datum</Th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={ROW}>
                <td className="px-3 py-2"><span className="inline-flex items-center gap-2"><RecruitCRMLink />{r.kandidaat}</span></td>
                <td className="px-3 py-2 text-xs">{r.klant}</td>
                <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{r.richting}</Badge></td>
                <td className="px-3 py-2 text-right tabular-nums">{r.duur}</td>
                <td className="px-3 py-2 text-xs">
                  <span className={cn(
                    "inline-block px-1.5 py-0.5 rounded text-[10px] font-medium",
                    r.resultaat === "Beantwoord" ? "bg-emerald-500/15 text-emerald-700"
                      : r.resultaat === "Voicemail" ? "bg-yellow-500/15 text-yellow-700"
                        : "bg-destructive/15 text-destructive",
                  )}>
                    {r.resultaat}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{r.datum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    const rows = getPlaatsingen(row);
    if (rows.length === 0) return <EmptyState label="plaatsingen" />;
    return (
      <table className="w-full text-sm">
        <thead><tr><Th>Kandidaat</Th><Th>Klant</Th><Th>Type</Th><Th>Startdatum</Th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={ROW}>
              <td className="px-3 py-2"><span className="inline-flex items-center gap-2"><RecruitCRMLink />{r.kandidaat}</span></td>
              <td className="px-3 py-2 text-xs">{r.klant}</td>
              <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{r.type}</Badge></td>
              <td className="px-3 py-2 text-xs text-muted-foreground">{r.startdatum}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const headerCount =
    metric === "telefonie"
      ? `${row.telefonie.hours}u${row.telefonie.minutes}m`
      : `${count}/${target}`;

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Colored tier band */}
      <div className={cn("h-1 w-full shrink-0", TIER_BAND[tier])} />
      {/* Header */}
      <div className="bg-card border-b px-4 py-3 flex items-start justify-between gap-3 shrink-0">
        <div className="flex items-start gap-3 min-w-0">
          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center text-white shrink-0", TIER_BAND[tier])}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold">{METRIC_LABEL[metric]}</h3>
              <Badge variant="outline" className="text-[10px] font-mono">{headerCount}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {row.name} · {periodLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={RECRUITCRM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 px-2.5 rounded-md border hover:bg-muted text-xs font-medium"
            title="Open in Recruit CRM"
          >
            <RecruitCRMLink size={14} /> CRM
          </a>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Summary */}
      <MetricSummary stats={summary} />
      {/* Body */}
      <div className="py-3 overflow-y-auto flex-1">{renderTable()}</div>
    </div>
  );
}
