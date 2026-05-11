import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { type PrognoseConsultantRow, formatTelefonie } from "@/data/prognoseData";

interface Props {
  rows: PrognoseConsultantRow[];
  onIntervene: (row: PrognoseConsultantRow) => void;
}

type SortKey =
  | "name"
  | "unit"
  | "intakes"
  | "acquisities"
  | "voorstellen"
  | "gesprekken"
  | "plaatsingen"
  | "telefonie"
  | "status";

function statusClasses(status: PrognoseConsultantRow["status"]) {
  if (status === "kritiek") return "bg-destructive/10 hover:bg-destructive/15";
  if (status === "risico") return "bg-amber-500/10 hover:bg-amber-500/15";
  return "hover:bg-muted/40";
}

function StatusPill({ status }: { status: PrognoseConsultantRow["status"] }) {
  const map = {
    "op-koers": { label: "Op koers", cls: "border-emerald-500 text-emerald-600" },
    risico: { label: "Risico", cls: "border-amber-500 text-amber-600" },
    kritiek: { label: "Kritiek", cls: "border-destructive text-destructive" },
  } as const;
  const s = map[status];
  return (
    <Badge variant="outline" className={s.cls}>
      {s.label}
    </Badge>
  );
}

function ActualTarget({ a, t }: { a: number; t: number }) {
  const pct = (a / t) * 100;
  const color = pct >= 100 ? "text-emerald-600" : pct >= 70 ? "text-foreground" : "text-destructive";
  return (
    <span className={cn("tabular-nums", color)}>
      {a}
      <span className="text-muted-foreground">/{t}</span>
    </span>
  );
}

export function PrognoseTable({ rows, onIntervene }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = [...rows].sort((a, b) => {
    let av: number | string;
    let bv: number | string;
    switch (sortKey) {
      case "name": av = a.name; bv = b.name; break;
      case "unit": av = a.unit; bv = b.unit; break;
      case "intakes": av = a.intakes.actual; bv = b.intakes.actual; break;
      case "acquisities": av = a.acquisities.actual; bv = b.acquisities.actual; break;
      case "voorstellen": av = a.voorstellen.actual; bv = b.voorstellen.actual; break;
      case "gesprekken": av = a.gesprekken.actual; bv = b.gesprekken.actual; break;
      case "plaatsingen": av = a.plaatsingen.actual; bv = b.plaatsingen.actual; break;
      case "telefonie":
        av = a.telefonie.hours * 3600 + a.telefonie.minutes * 60 + a.telefonie.seconds;
        bv = b.telefonie.hours * 3600 + b.telefonie.minutes * 60 + b.telefonie.seconds;
        break;
      case "status":
        av = a.status === "kritiek" ? 0 : a.status === "risico" ? 1 : 2;
        bv = b.status === "kritiek" ? 0 : b.status === "risico" ? 1 : 2;
        break;
    }
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const toggle = (k: SortKey) => {
    if (k === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir(k === "name" || k === "unit" ? "asc" : "desc");
    }
  };

  const totals = rows.reduce(
    (acc, r) => ({
      intakes: acc.intakes + r.intakes.actual,
      acquisities: acc.acquisities + r.acquisities.actual,
      voorstellen: acc.voorstellen + r.voorstellen.actual,
      gesprekken: acc.gesprekken + r.gesprekken.actual,
      plaatsingen: acc.plaatsingen + r.plaatsingen.actual,
      telefonie:
        acc.telefonie + r.telefonie.hours * 3600 + r.telefonie.minutes * 60 + r.telefonie.seconds,
    }),
    { intakes: 0, acquisities: 0, voorstellen: 0, gesprekken: 0, plaatsingen: 0, telefonie: 0 },
  );

  const totalH = Math.floor(totals.telefonie / 3600);
  const totalM = Math.floor((totals.telefonie % 3600) / 60);
  const totalS = totals.telefonie % 60;

  const Th = ({ k, label, align = "left" }: { k: SortKey; label: string; align?: "left" | "right" }) => (
    <th
      className={cn(
        "h-10 px-3 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0 z-20 cursor-pointer select-none",
        align === "right" ? "text-right" : "text-left",
      )}
      onClick={() => toggle(k)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </span>
    </th>
  );

  return (
    <Card className="overflow-hidden">
      <div className="max-h-[640px] overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="h-10 px-3 text-left text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0 left-0 z-50">
                <button onClick={() => toggle("name")} className="inline-flex items-center gap-1">
                  Naam <ArrowUpDown className="h-3 w-3 opacity-50" />
                </button>
              </th>
              <Th k="unit" label="Unit" />
              <Th k="intakes" label="Intakes" align="right" />
              <Th k="acquisities" label="Acquisities" align="right" />
              <Th k="voorstellen" label="Voorstellen" align="right" />
              <Th k="gesprekken" label="Gesprekken" align="right" />
              <Th k="plaatsingen" label="Plaatsingen" align="right" />
              <Th k="telefonie" label="Uitg. telefonie" align="right" />
              <Th k="status" label="Prognose" />
              <th className="h-10 px-3 text-right text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0 z-20">
                Interventie
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className={cn("border-b transition-colors", statusClasses(r.status))}>
                <td className="px-3 py-2 sticky left-0 z-10 bg-card font-medium">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-[10px] font-bold text-white">
                      R
                    </span>
                    {r.name}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{r.unit}</td>
                <td className="px-3 py-2 text-right"><ActualTarget a={r.intakes.actual} t={r.intakes.target} /></td>
                <td className="px-3 py-2 text-right"><ActualTarget a={r.acquisities.actual} t={r.acquisities.target} /></td>
                <td className="px-3 py-2 text-right"><ActualTarget a={r.voorstellen.actual} t={r.voorstellen.target} /></td>
                <td className="px-3 py-2 text-right"><ActualTarget a={r.gesprekken.actual} t={r.gesprekken.target} /></td>
                <td className="px-3 py-2 text-right"><ActualTarget a={r.plaatsingen.actual} t={r.plaatsingen.target} /></td>
                <td className="px-3 py-2 text-right tabular-nums">{formatTelefonie(r.telefonie)}</td>
                <td className="px-3 py-2"><StatusPill status={r.status} /></td>
                <td className="px-3 py-2 text-right">
                  <Button size="sm" variant="outline" onClick={() => onIntervene(r)}>
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Noteer actie
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/60 font-semibold sticky bottom-0">
              <td className="px-3 py-2 sticky left-0 bg-muted/60 z-10">Totaal ({rows.length})</td>
              <td />
              <td className="px-3 py-2 text-right tabular-nums">{totals.intakes}</td>
              <td className="px-3 py-2 text-right tabular-nums">{totals.acquisities}</td>
              <td className="px-3 py-2 text-right tabular-nums">{totals.voorstellen}</td>
              <td className="px-3 py-2 text-right tabular-nums">{totals.gesprekken}</td>
              <td className="px-3 py-2 text-right tabular-nums">{totals.plaatsingen}</td>
              <td className="px-3 py-2 text-right tabular-nums">
                [{totalH}:{String(totalM).padStart(2, "0")}:{String(totalS).padStart(2, "0")}]
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
