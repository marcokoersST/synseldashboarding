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
  formatTelefonie,
  loadInterventions,
  saveIntervention,
} from "@/data/prognoseData";
import { MetricDrilldownPanel, type MetricKey } from "./MetricDrilldownPanel";

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

  useEffect(() => {
    if (row) {
      setCategory(row.bottleneck === "Geen knelpunt" ? "" : row.bottleneck);
      setNote("");
      setFollowUp("");
      setOwner("");
      setHistory(loadInterventions().filter((n) => n.consultantId === row.id));
      setActiveMetric(null);
    }
  }, [row]);

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

  const breakdown = useMemo(() => {
    if (!row) return [];
    return [
      { label: "Intakes", a: row.intakes.actual, t: row.intakes.target },
      { label: "Acquisities", a: row.acquisities.actual, t: row.acquisities.target },
      { label: "Voorstellen", a: row.voorstellen.actual, t: row.voorstellen.target },
      { label: "Gesprekken", a: row.gesprekken.actual, t: row.gesprekken.target },
      { label: "Plaatsingen", a: row.plaatsingen.actual, t: row.plaatsingen.target },
    ];
  }, [row]);

  return (
    <Sheet open={!!row} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {row && (
          <>
            <SheetHeader>
              <SheetTitle>{row.name}</SheetTitle>
              <SheetDescription>
                {row.unit} · Prognose score{" "}
                <span className="font-semibold text-foreground">{row.prognoseScore}%</span>
                {" · "}
                <Badge
                  variant="outline"
                  className={
                    row.status === "kritiek"
                      ? "border-destructive text-destructive"
                      : row.status === "risico"
                        ? "border-amber-500 text-amber-600"
                        : "border-emerald-500 text-emerald-600"
                  }
                >
                  {row.status}
                </Badge>
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-2">Prognose breakdown</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {breakdown.map((b) => {
                    const pct = Math.round((b.a / b.t) * 100);
                    return (
                      <div key={b.label} className="rounded border bg-card p-2">
                        <div className="text-xs text-muted-foreground">{b.label}</div>
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
                      </div>
                    );
                  })}
                  <div className="rounded border bg-card p-2 col-span-2">
                    <div className="text-xs text-muted-foreground">Telefonie</div>
                    <div className="font-semibold tabular-nums">{formatTelefonie(row.telefonie)}</div>
                  </div>
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
