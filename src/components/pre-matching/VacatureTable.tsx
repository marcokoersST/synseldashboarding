import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import PreMatchingFilterBar from "@/components/pre-matching/PreMatchingFilterBar";
import { DevNote } from "@/components/groeimodel/DevNote";
import { vacatureRows, type PreMatchingFilters } from "@/data/preMatchingData";

type SortKey = "gemisteKansen" | "matches" | "plaatsingen" | "conversie" | "titel";

interface Props {
  /** Filters incl. datumrange (voor data) */
  filters: PreMatchingFilters;
  /** Ruwe filterstate voor de filterbalk in de tabelkop */
  filterState: PreMatchingFilters;
  onFiltersChange: (f: PreMatchingFilters) => void;
  onSelectVacature: (id: string) => void;
  title?: string;
  showFilters?: boolean;
}

export function VacatureTable({
  filters,
  filterState,
  onFiltersChange,
  onSelectVacature,
  title = "Alle vacatures — gesorteerd op grootste gemiste kans",
  showFilters = true,
}: Props) {

  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "gemisteKansen", dir: "desc" });
  const rows = useMemo(() => vacatureRows(filters), [filters]);

  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      const val = (r: typeof a) => (sort.key === "titel" ? r.vacature.titel : (r[sort.key] as number));
      const av = val(a);
      const bv = val(b);
      if (typeof av === "string" && typeof bv === "string") {
        return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sort.dir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return arr;
  }, [rows, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "desc" ? "asc" : "desc" } : { key, dir: "desc" }));

  const Th = ({ k, children, align = "right" }: { k: SortKey; children: React.ReactNode; align?: "left" | "right" }) => (
    <th className={cn("px-3 py-2 font-medium", align === "right" ? "text-right" : "text-left")}>
      <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-foreground">
        {children}
        <ArrowUpDown className={cn("h-3 w-3", sort.key === k ? "opacity-100" : "opacity-30")} />
      </button>
    </th>
  );

  return (
    <Card>
      <CardHeader className="gap-3 pb-2">
        <div>
          <CardTitle className="text-sm">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            Gemiste kans = matches met matchscore &gt; 80% die nooit bij de consultant zijn aangekomen.
          </p>
        </div>

        {showFilters && (
          <PreMatchingFilterBar
            filters={filterState}
            onChange={onFiltersChange}
            showDate={false}
          />
        )}
      </CardHeader>


      <CardContent className="p-0">
        <div className="max-h-[520px] overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10 bg-muted/60 text-muted-foreground backdrop-blur">
              <tr>
                <Th k="titel" align="left">Vacature</Th>
                <th className="px-3 py-2 text-left font-medium">Klant</th>
                <th className="px-3 py-2 text-left font-medium">Consultant</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <Th k="matches"># Matches</Th>
                <Th k="plaatsingen"># Plaatsingen</Th>
                <Th k="conversie">Conversie%</Th>
                <Th k="gemisteKansen">Gemiste kansen</Th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr
                  key={r.vacature.id}
                  onClick={() => onSelectVacature(r.vacature.id)}
                  className="cursor-pointer border-t border-border hover:bg-muted/40"
                >
                  <td className="px-3 py-2 font-medium text-foreground">{r.vacature.titel}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.vacature.klant}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.vacature.consultant}</td>
                  <td className="px-3 py-2">
                    <Badge variant={r.vacature.status === "actief" ? "default" : "secondary"} className="text-[10px]">
                      {r.vacature.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.matches}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.plaatsingen}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.conversie.toFixed(1)}%</td>
                  <td
                    className={cn(
                      "px-3 py-2 text-right font-semibold tabular-nums",
                      r.gemisteKansen >= 5
                        ? "text-destructive"
                        : r.gemisteKansen >= 2
                          ? "text-amber-600"
                          : "text-muted-foreground",
                    )}
                  >
                    {r.gemisteKansen}
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                    Geen vacatures binnen de huidige filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default VacatureTable;
