import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type PrognoseConsultantRow,
  type InterventionNote,
  type BottleneckCategory,
  type PrognoseStatus,
  formatTelefonie,
  loadInterventions,
  saveIntervention,
  effectiveStatus,
  setStatusOverride,
  getStatusOverride,
} from "@/data/prognoseData";
import { MetricDrilldownPanel, type MetricKey } from "./MetricDrilldownPanel";
import { usePrognosePeriod } from "@/contexts/PrognosePeriodContext";

interface Props {
  row: PrognoseConsultantRow | null;
  onClose: () => void;
}

const CATEGORIES: (BottleneckCategory | "Anders")[] = [
  "Te weinig acquisities",
  "Lage voorstel-ratio",
  "Telefonie onder norm",
  "Intake-uitval",
  "Plaatsingsachterstand",
  "Anders",
];

export function InterventionPanel({ row, onClose }: Props) {
  const [category, setCategory] = useState<string>("");
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [owner, setOwner] = useState("");
  const [history, setHistory] = useState<InterventionNote[]>([]);
  const [activeMetric, setActiveMetric] = useState<MetricKey | null>(null);
  const [status, setStatus] = useState<PrognoseStatus>("op-koers");
  const [hasOverride, setHasOverride] = useState(false);
  const { label: periodLabel } = usePrognosePeriod();

  useEffect(() => {
    if (row) {
      setCategory(row.bottleneck === "Geen knelpunt" ? "" : row.bottleneck);
      setNote("");
      setFollowUp("");
      setOwner("");
      setHistory(loadInterventions().filter((n) => n.consultantId === row.id));
      setActiveMetric(null);
      setStatus(effectiveStatus(row));
      setHasOverride(getStatusOverride(row.id) !== undefined);
    }
  }, [row]);

  const handleStatusChange = (s: PrognoseStatus) => {
    if (!row) return;
    setStatus(s);
    setStatusOverride(row.id, s);
    setHasOverride(true);
  };
  const resetStatus = () => {
    if (!row) return;
    setStatusOverride(row.id, null);
    setStatus(row.status);
    setHasOverride(false);
  };

  const handleSave = () => {
    if (!row || !category || !note) return;
    const entry: InterventionNote = {
      id: `${Date.now()}`,
      consultantId: row.id,
      category: category as BottleneckCategory | "Anders",
      note,
      followUpDate: followUp,
      owner,
      createdAt: new Date().toISOString(),
    };
    saveIntervention(entry);
    setHistory([entry, ...history]);
    setNote("");
  };

  const breakdown: { key: MetricKey; label: string; a: number; t: number }[] = useMemo(() => {
    if (!row) return [];
    return [
      { key: "intakes", label: "Intakes", a: row.intakes.actual, t: row.intakes.target },
      { key: "acquisities", label: "Acquisities", a: row.acquisities.actual, t: row.acquisities.target },
      { key: "voorstellen", label: "Voorstellen", a: row.voorstellen.actual, t: row.voorstellen.target },
      { key: "gesprekken", label: "Gesprekken", a: row.gesprekken.actual, t: row.gesprekken.target },
      { key: "plaatsingen", label: "Plaatsingen", a: row.plaatsingen.actual, t: row.plaatsingen.target },
    ];
  }, [row]);

  return (
    <Sheet open={!!row} onOpenChange={(v) => !v && onClose()}>
      {row && activeMetric && (
        <MetricDrilldownPanel
          metric={activeMetric}
          row={row}
          onClose={() => setActiveMetric(null)}
        />
      )}
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {row && (
          <>
            <SheetHeader>
              <SheetTitle>{row.name}</SheetTitle>
              <SheetDescription asChild>
                <div className="flex items-center gap-2 flex-wrap">
                  <span>
                    {row.unit} · {periodLabel} · Prognose score{" "}
                    <span className="font-semibold text-foreground">{row.prognoseScore}%</span>
                  </span>
                  <Select value={status} onValueChange={(v) => handleStatusChange(v as PrognoseStatus)}>
                    <SelectTrigger
                      className={cn(
                        "h-7 w-auto px-2 text-xs gap-1",
                        status === "kritiek"
                          ? "border-destructive text-destructive"
                          : status === "risico"
                            ? "border-amber-500 text-amber-600"
                            : "border-emerald-500 text-emerald-600",
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="op-koers">Op koers</SelectItem>
                      <SelectItem value="risico">Risico</SelectItem>
                      <SelectItem value="kritiek">Kritiek</SelectItem>
                    </SelectContent>
                  </Select>
                  {hasOverride && (
                    <button
                      onClick={resetStatus}
                      className="text-xs underline text-muted-foreground hover:text-foreground"
                    >
                      Auto
                    </button>
                  )}
                </div>
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-2">Prognose breakdown</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {breakdown.map((b) => {
                    const pct = Math.round((b.a / b.t) * 100);
                    const isActive = activeMetric === b.key;
                    return (
                      <button
                        key={b.label}
                        type="button"
                        onClick={() => setActiveMetric(isActive ? null : b.key)}
                        className={cn(
                          "rounded border bg-card p-2 text-left transition-colors hover:border-primary/60 hover:bg-primary/5",
                          isActive && "border-primary bg-primary/10",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">{b.label}</div>
                          <ChevronRight
                            className={cn(
                              "h-3 w-3 text-muted-foreground transition-transform",
                              isActive && "rotate-90 text-primary",
                            )}
                          />
                        </div>
                        <div className="font-semibold tabular-nums">
                          {b.a} / {b.t}{" "}
                          <span
                            className={
                              pct >= 100 ? "text-emerald-600" : pct >= 70 ? "text-amber-600" : "text-destructive"
                            }
                          >
                            ({pct}%)
                          </span>
                        </div>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setActiveMetric(activeMetric === "telefonie" ? null : "telefonie")}
                    className={cn(
                      "rounded border bg-card p-2 col-span-2 text-left transition-colors hover:border-primary/60 hover:bg-primary/5",
                      activeMetric === "telefonie" && "border-primary bg-primary/10",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">Telefonie</div>
                      <ChevronRight
                        className={cn(
                          "h-3 w-3 text-muted-foreground transition-transform",
                          activeMetric === "telefonie" && "rotate-90 text-primary",
                        )}
                      />
                    </div>
                    <div className="font-semibold tabular-nums">{formatTelefonie(row.telefonie)}</div>
                  </button>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
                <h4 className="text-sm font-semibold">Noteer interventie</h4>
                <div className="space-y-2">
                  <Label>Categorie</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kies categorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notitie</Label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Wat moet er gebeuren..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Opvolging</Label>
                    <Input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Eigenaar</Label>
                    <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Naam" />
                  </div>
                </div>
                <Button onClick={handleSave} disabled={!category || !note} className="w-full">
                  Interventie opslaan
                </Button>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Geschiedenis</h4>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nog geen interventies vastgelegd.</p>
                ) : (
                  <div className="space-y-2">
                    {history.map((h) => (
                      <div key={h.id} className="rounded border bg-card p-2 text-sm">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{h.category}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(h.createdAt).toLocaleDateString("nl-NL")}
                          </span>
                        </div>
                        <p className="mt-1">{h.note}</p>
                        {(h.owner || h.followUpDate) && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {h.owner && <>Eigenaar: {h.owner}</>}
                            {h.owner && h.followUpDate && " · "}
                            {h.followUpDate && <>Opvolging: {h.followUpDate}</>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
