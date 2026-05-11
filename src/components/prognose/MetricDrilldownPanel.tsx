import { createPortal } from "react-dom";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PrognoseConsultantRow } from "@/data/prognoseData";
import {
  getIntakes,
  getAcquisities,
  getVoorstellen,
  getGesprekken,
  getPlaatsingen,
} from "@/data/prognoseDrilldownData";

export type MetricKey =
  | "intakes"
  | "acquisities"
  | "voorstellen"
  | "gesprekken"
  | "plaatsingen";

const METRIC_LABEL: Record<MetricKey, string> = {
  intakes: "Intakes",
  acquisities: "Acquisities",
  voorstellen: "Voorstellen",
  gesprekken: "Gesprekken",
  plaatsingen: "Plaatsingen",
};

interface Props {
  metric: MetricKey;
  row: PrognoseConsultantRow;
  onClose: () => void;
}

function RBadge() {
  return (
    <button
      className="inline-flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-[10px] font-bold text-white hover:bg-blue-700"
      title="Open in Recruit CRM"
    >
      R
    </button>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={cn(
        "h-9 px-3 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      {children}
    </th>
  );
}

export function MetricDrilldownPanel({ metric, row, onClose }: Props) {
  const periodLabel = "Rolling week (ma–vandaag)";

  const renderTable = () => {
    if (metric === "intakes") {
      const rows = getIntakes(row);
      return (
        <table className="w-full text-sm">
          <thead><tr><Th>Kandidaat</Th><Th>Datum</Th><Th>Type</Th><Th>Status</Th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2"><span className="inline-flex items-center gap-2"><RBadge />{r.kandidaat}</span></td>
                <td className="px-3 py-2 text-muted-foreground">{r.datum}</td>
                <td className="px-3 py-2"><Badge variant="secondary" className="text-xs">{r.type}</Badge></td>
                <td className="px-3 py-2 text-xs">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (metric === "acquisities") {
      const rows = getAcquisities(row);
      return (
        <table className="w-full text-sm">
          <thead><tr><Th>Kandidaat</Th><Th>Van</Th><Th>Naar</Th><Th>Datum</Th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2"><span className="inline-flex items-center gap-2"><RBadge />{r.kandidaat}</span></td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{r.vanStage}</td>
                <td className="px-3 py-2 text-xs"><Badge variant="outline" className="border-emerald-500 text-emerald-600">{r.naarStage}</Badge></td>
                <td className="px-3 py-2 text-muted-foreground">{r.datum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (metric === "voorstellen") {
      const { promoted, openDeals } = getVoorstellen(row);
      return (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold mb-2 px-3">Verplaatst naar 2.0 Kandidaat voorgesteld ({promoted.length})</h4>
            <table className="w-full text-sm">
              <thead><tr><Th>Kandidaat</Th><Th>Klant</Th><Th>Vorige stage</Th><Th>Datum</Th></tr></thead>
              <tbody>
                {promoted.map((r, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2"><span className="inline-flex items-center gap-2"><RBadge />{r.kandidaat}</span></td>
                    <td className="px-3 py-2 text-xs">{r.klant}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{r.vorigeStage}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.datum}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2 px-3 flex items-center gap-2">
              Open deals zonder eindstage
              <Badge variant="outline" className="border-amber-500 text-amber-600">{openDeals.length} kandidaten</Badge>
            </h4>
            <table className="w-full text-sm">
              <thead><tr><Th>Kandidaat</Th><Th align="right">Open deals</Th><Th>Oudste stage</Th></tr></thead>
              <tbody>
                {openDeals.map((r, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2"><span className="inline-flex items-center gap-2"><RBadge />{r.kandidaat}</span></td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold text-amber-600">{r.openDeals}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{r.oudsteStage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    if (metric === "gesprekken") {
      const rows = getGesprekken(row);
      return (
        <table className="w-full text-sm">
          <thead><tr><Th>Kandidaat</Th><Th>Klant</Th><Th>Type</Th><Th>Datum</Th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2"><span className="inline-flex items-center gap-2"><RBadge />{r.kandidaat}</span></td>
                <td className="px-3 py-2 text-xs">{r.klant}</td>
                <td className="px-3 py-2"><Badge variant="secondary" className="text-xs">{r.type}</Badge></td>
                <td className="px-3 py-2 text-muted-foreground">{r.datum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    // plaatsingen
    const rows = getPlaatsingen(row);
    return (
      <table className="w-full text-sm">
        <thead><tr><Th>Kandidaat</Th><Th>Klant</Th><Th>Type</Th><Th>Startdatum</Th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b hover:bg-muted/30">
              <td className="px-3 py-2"><span className="inline-flex items-center gap-2"><RBadge />{r.kandidaat}</span></td>
              <td className="px-3 py-2 text-xs">{r.klant}</td>
              <td className="px-3 py-2"><Badge variant="outline" className="text-xs">{r.type}</Badge></td>
              <td className="px-3 py-2 text-muted-foreground">{r.startdatum}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const totalCount =
    metric === "voorstellen"
      ? row.voorstellen.actual
      : (row[metric] as { actual: number }).actual;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[59] bg-transparent"
        onClick={onClose}
      />
      <div
        className="fixed top-0 right-[640px] h-full w-[640px] bg-card border-l border-r border-border shadow-2xl z-[60] overflow-y-auto animate-in slide-in-from-right duration-200"
      >
        <div className="sticky top-0 z-10 bg-card border-b px-4 py-3 flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold">
              {METRIC_LABEL[metric]} <span className="text-muted-foreground font-normal">({totalCount})</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {row.name} · {periodLabel}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Open in Recruit CRM">
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-3">{renderTable()}</div>
      </div>
    </>,
    document.body,
  );
}
