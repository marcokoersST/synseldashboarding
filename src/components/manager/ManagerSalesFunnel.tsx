import { useState, useMemo } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Maximize2, Minimize2, ArrowUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { consultantFunnelData, unitFunnelTotals, type ConsultantFunnelData } from "@/data/managerOperationalData";

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

// ─── Overview: simplified funnel bars ───

const funnelSteps = [
  { key: "toegewezen", label: "Toegewezen" },
  { key: "inschrijvingen", label: "Inschrijvingen" },
  { key: "intakes", label: "Intakes", optional: true },
  { key: "acquisities", label: "Acquisities" },
  { key: "uitnodiging", label: "Uitnodiging" },
  { key: "gesprekken", label: "Gesprekken" },
  { key: "vervolg", label: "Vervolg", optional: true },
  { key: "plaatsingen", label: "Plaatsingen" },
] as const;

const mainSteps = funnelSteps.filter(s => !s.optional);
const stepColors = [
  "hsl(175, 50%, 75%)", "hsl(175, 50%, 67%)", "hsl(175, 55%, 59%)",
  "hsl(175, 55%, 51%)", "hsl(175, 60%, 43%)", "hsl(175, 65%, 27%)",
];

function FunnelOverview({ delay }: { delay: number }) {
  const max = unitFunnelTotals.toegewezen;
  const mainData = mainSteps.map(s => ({
    ...s,
    value: unitFunnelTotals[s.key as keyof typeof unitFunnelTotals],
  }));

  return (
    <div className="space-y-3">
      {mainData.map((step, i) => {
        const pct = Math.round((step.value / max) * 100);
        const convPct = i > 0 ? Math.round((step.value / mainData[i - 1].value) * 100) : null;
        return (
          <div key={step.key} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-24 text-right shrink-0">{step.label}</span>
            <div className="flex-1 h-6 bg-secondary/30 rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct}%`, backgroundColor: stepColors[i] }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
                <AnimatedNumber value={step.value} delay={delay + i * 80} />
              </span>
            </div>
            {convPct !== null && (
              <span className="text-xs text-muted-foreground w-12 shrink-0">{convPct}%</span>
            )}
          </div>
        );
      })}
      {/* Optional steps */}
      <div className="flex gap-4 mt-2 px-28">
        {funnelSteps.filter(s => s.optional).map(s => (
          <div key={s.key} className="flex items-center gap-2 border border-dashed border-border/50 rounded-lg px-3 py-1.5">
            <span className="text-xs text-muted-foreground italic">{s.label}</span>
            <span className="text-xs font-semibold text-foreground">
              {unitFunnelTotals[s.key as keyof typeof unitFunnelTotals]}
            </span>
          </div>
        ))}
      </div>
      {/* Total conversion */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 mt-2">
        <span className="text-xs font-medium text-foreground">
          Totaal: {unitFunnelTotals.toegewezen} → {unitFunnelTotals.plaatsingen}
        </span>
        <span className="text-sm font-bold text-primary">
          {((unitFunnelTotals.plaatsingen / unitFunnelTotals.toegewezen) * 100).toFixed(1)}% conversie
        </span>
      </div>
    </div>
  );
}

// ─── Detail: sortable table ───

type SortKey = keyof ConsultantFunnelData;

function FunnelDetailTable({ delay }: { delay: number }) {
  const [sortKey, setSortKey] = useState<SortKey>("consultantName");
  const [sortAsc, setSortAsc] = useState(true);
  const [search, setSearch] = useState("");

  const sorted = useMemo(() => {
    let data = [...consultantFunnelData];
    if (search) {
      data = data.filter(d => d.consultantName.toLowerCase().includes(search.toLowerCase()));
    }
    data.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string") return sortAsc ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return data;
  }, [sortKey, sortAsc, search]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: "consultantName", label: "Consultant" },
    { key: "toegewezen", label: "Toegew." },
    { key: "inschrijvingen", label: "Inschr." },
    { key: "intakes", label: "Intakes" },
    { key: "acquisities", label: "Acq." },
    { key: "uitnodiging", label: "Uitnod." },
    { key: "gesprekken", label: "Gespr." },
    { key: "vervolg", label: "Vervolg" },
    { key: "plaatsingen", label: "Plaats." },
  ];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Zoek consultant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-8 text-xs"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {columns.map(col => (
                <th key={col.key}
                  className="text-left py-2 px-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => toggleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
              ))}
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Conv.%</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const conv = ((row.plaatsingen / row.toegewezen) * 100).toFixed(1);
              return (
                <tr key={row.consultantId} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="py-2 px-2 font-medium text-foreground">{row.consultantName}</td>
                  <td className="py-2 px-2 tabular-nums">{row.toegewezen}</td>
                  <td className="py-2 px-2 tabular-nums">{row.inschrijvingen}</td>
                  <td className="py-2 px-2 tabular-nums text-muted-foreground italic">{row.intakes}</td>
                  <td className="py-2 px-2 tabular-nums">{row.acquisities}</td>
                  <td className="py-2 px-2 tabular-nums">{row.uitnodiging}</td>
                  <td className="py-2 px-2 tabular-nums">{row.gesprekken}</td>
                  <td className="py-2 px-2 tabular-nums text-muted-foreground italic">{row.vervolg}</td>
                  <td className="py-2 px-2 tabular-nums font-semibold">{row.plaatsingen}</td>
                  <td className="py-2 px-2 tabular-nums font-semibold text-primary">{conv}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Component ───

interface ManagerSalesFunnelProps {
  delay?: number;
}

export function ManagerSalesFunnel({ delay = 0 }: ManagerSalesFunnelProps) {
  const { isTransitioning, displayMode, toggle } = useDetailToggle();

  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Sales Funnel</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {displayMode ? "Conversies per consultant" : "Unit-niveau overzicht"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={toggle}
            className="h-7 w-7 rounded-full bg-secondary hover:bg-secondary/80">
            {displayMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <div className={cn(
          "flex-1 transition-all duration-400 ease-in-out",
          isTransitioning ? "opacity-0 scale-[0.97] translate-y-2" : "opacity-100 scale-100 translate-y-0"
        )}>
          {displayMode ? <FunnelDetailTable delay={delay} /> : <FunnelOverview delay={delay} />}
        </div>
      </div>
    </AnimatedCard>
  );
}
