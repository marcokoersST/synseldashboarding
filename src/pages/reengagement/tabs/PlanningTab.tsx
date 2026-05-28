import { useMemo, useState } from "react";
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  addDays,
  isSameDay,
} from "date-fns";
import { nl } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Mail, Smartphone, Settings, Plus, Pencil, CheckCircle2, Eye, MessageSquare, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Deterministic split of `total` across `keys` based on a stable seed
function distribute(total: number, keys: string[], seed: string): Record<string, number> {
  const result: Record<string, number> = {};
  if (keys.length === 0 || total <= 0) {
    keys.forEach((k) => (result[k] = 0));
    return result;
  }
  // simple hash
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const weights = keys.map((_, i) => ((h >> (i % 16)) & 7) + 1);
  const sum = weights.reduce((a, b) => a + b, 0);
  let assigned = 0;
  keys.forEach((k, i) => {
    const v = i === keys.length - 1 ? total - assigned : Math.max(0, Math.round((total * weights[i]) / sum));
    result[k] = v;
    assigned += v;
  });
  // fix rounding drift
  const drift = total - Object.values(result).reduce((a, b) => a + b, 0);
  if (drift !== 0) result[keys[0]] = Math.max(0, result[keys[0]] + drift);
  return result;
}

type Status = "concept" | "gepland" | "verzonden";

interface PlanItem {
  id: string;
  date: Date;
  title: string;
  status: Status;
  channel: "app" | "mail";
  functie: string;
  verzendtijd?: string;
  berichttype?: string;
  categorie?: string;
  customized?: boolean;
}

const STATUS_META: Record<Status, { label: string; dot: string; bg: string; text: string }> = {
  concept: { label: "Concept", dot: "bg-muted-foreground", bg: "bg-muted", text: "text-muted-foreground" },
  gepland: { label: "Gepland", dot: "bg-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-300" },
  verzonden: { label: "Verzonden", dot: "bg-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-300" },
};

const FUNCTIE_META: Record<string, { short: string; dot: string; bg: string; text: string }> = {
  "Engineering Mechanical": { short: "EM", dot: "bg-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-700 dark:text-blue-300" },
  "Engineering Allround": { short: "EA", dot: "bg-violet-500", bg: "bg-violet-100 dark:bg-violet-500/20", text: "text-violet-700 dark:text-violet-300" },
  "Operators": { short: "OP", dot: "bg-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-300" },
  "Productie": { short: "PR", dot: "bg-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-300" },
};

const WEEKDAYS = ["Maa", "Di", "Wo", "Do", "Vr", "Zat", "Zon"];

const FUNCTIES_DEFAULT = ["Engineering Mechanical", "Engineering Allround", "Operators", "Productie"];

function buildMockItems(monthDate: Date): PlanItem[] {
  const base = startOfMonth(monthDate);
  const items: PlanItem[] = [];
  // Spread items across the month per functie
  const plan: Array<[number, string, Status, "app" | "mail", number]> = [
    // [dayOffset, functie, status, channel, count]
    [0, "Engineering Mechanical", "verzonden", "mail", 3],
    [0, "Operators", "verzonden", "app", 2],
    [1, "Engineering Allround", "verzonden", "mail", 4],
    [2, "Productie", "verzonden", "app", 2],
    [3, "Engineering Mechanical", "gepland", "mail", 5],
    [4, "Operators", "gepland", "app", 3],
    [5, "Productie", "gepland", "mail", 4],
    [6, "Engineering Allround", "gepland", "app", 2],
    [7, "Engineering Mechanical", "gepland", "mail", 3],
    [8, "Operators", "gepland", "app", 5],
    [9, "Productie", "gepland", "mail", 2],
    [10, "Engineering Allround", "gepland", "mail", 4],
    [11, "Engineering Mechanical", "gepland", "app", 3],
    [13, "Productie", "gepland", "mail", 6],
    [14, "Operators", "gepland", "app", 2],
    [15, "Engineering Allround", "gepland", "mail", 3],
    [16, "Engineering Mechanical", "concept", "app", 4],
    [17, "Productie", "concept", "mail", 2],
    [18, "Operators", "concept", "app", 3],
    [20, "Engineering Allround", "gepland", "mail", 5],
    [21, "Engineering Mechanical", "gepland", "app", 2],
    [22, "Productie", "concept", "mail", 3],
    [23, "Operators", "concept", "app", 4],
    [24, "Engineering Mechanical", "concept", "mail", 2],
    [25, "Engineering Allround", "concept", "mail", 3],
    [27, "Productie", "concept", "app", 2],
    [28, "Operators", "concept", "mail", 3],
  ];
  let counter = 1;
  plan.forEach(([offset, functie, status, channel, count]) => {
    for (let i = 0; i < count; i++) {
      items.push({
        id: `m-${counter++}`,
        date: addDays(base, offset),
        title: `${functie} bericht`,
        status,
        channel,
        functie,
      });
    }
  });
  return items;
}

type Medium = "App & Mail" | "App" | "Mail";

const PlanningTab = () => {
  const [cursor, setCursor] = useState<Date>(new Date(2026, 4, 1)); // mei 2026
  const [selected, setSelected] = useState<Date | null>(null);

  const [verzendtijd, setVerzendtijd] = useState("11:00");
  const [medium, setMedium] = useState<Medium>("App & Mail");
  const [timeOpen, setTimeOpen] = useState(false);
  const [tempTime, setTempTime] = useState(verzendtijd);

  type Verdeling = "Evenredig" | "Begin week" | "Eind week" | "Begin maand" | "Eind maand";
  const VERDELING_OPTS: Verdeling[] = ["Evenredig", "Begin week", "Eind week", "Begin maand", "Eind maand"];
  const MEDIUM_OPTS: Medium[] = ["App & Mail", "App", "Mail"];
  const FUNCTIE_OPTS = FUNCTIES_DEFAULT;
  const BERICHT_OPTS = ["Bezig met Studie", "ZZP/Freelance", "Nu niet werkzoekend", "Nieuwe baan eigen", "Blijft bij huidige werkgever"];
  const CATEGORIE_OPTS = ["A+", "A", "B"];
  const VERSIE_OPTS = ["Versie 1", "Versie 2", "Versie 3"];

  const [verdeling, setVerdeling] = useState<Verdeling>("Evenredig");
  const [functies, setFuncties] = useState<string[]>([...FUNCTIE_OPTS]);
  const [berichten, setBerichten] = useState<string[]>([...BERICHT_OPTS]);
  const [categorieen, setCategorieen] = useState<string[]>([...CATEGORIE_OPTS]);
  const [berichtVersies, setBerichtVersies] = useState<Record<string, string>>(
    Object.fromEntries(BERICHT_OPTS.map((b, i) => [b, VERSIE_OPTS[i % VERSIE_OPTS.length]]))
  );

  const summarize = (sel: string[], all: string[]) =>
    sel.length === 0 ? "Geen" : sel.length === all.length ? "Alle" : `${sel.length} geselecteerd`;

  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const [items, setItems] = useState<PlanItem[]>(() => buildMockItems(cursor));
  // Rebuild when month changes
  const monthKey = format(cursor, "yyyy-MM");
  useMemo(() => {
    setItems(buildMockItems(cursor));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey]);

  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ verzendtijd: string; functies: string[]; berichttypes: string[]; categorieen: string[] }>({
    verzendtijd: verzendtijd,
    functies: [FUNCTIE_OPTS[0]],
    berichttypes: [BERICHT_OPTS[0]],
    categorieen: [CATEGORIE_OPTS[0]],
  });

  const openEdit = (item: PlanItem) => {
    setEditItemId(item.id);
    setEditForm({
      verzendtijd: item.verzendtijd ?? verzendtijd,
      functies: [item.functie],
      berichttypes: item.berichttype ? [item.berichttype] : [BERICHT_OPTS[0]],
      categorieen: item.categorie ? [item.categorie] : [CATEGORIE_OPTS[0]],
    });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!editItemId) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === editItemId
          ? {
              ...it,
              verzendtijd: editForm.verzendtijd,
              functie: editForm.functies[0] ?? it.functie,
              berichttype: editForm.berichttypes.join(", "),
              categorie: editForm.categorieen.join(", "),
              customized: true,
            }
          : it
      )
    );
    setEditOpen(false);
    setEditItemId(null);
  };

  // status afleiden uit datum: verleden = verzonden, vandaag/toekomst = gepland
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const effectiveStatus = (date: Date): Status => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today ? "verzonden" : "gepland";
  };

  const moveItem = (id: string, target: Date) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, date: target } : it)));
  };

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    const days: Date[] = [];
    let d = start;
    while (d <= end) {
      days.push(d);
      d = addDays(d, 1);
    }
    return days;
  }, [cursor]);

  const counts = useMemo(() => {
    const c: Record<Status, number> = { concept: 0, gepland: 0, verzonden: 0 };
    items.forEach((i) => c[effectiveStatus(i.date)]++);
    return c;
  }, [items, today]);

  const last7 = useMemo(
    () => items.filter((i) => i.status === "verzonden").length,
    [items]
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      {/* LEFT: KPI row + calendar */}
      <div className="space-y-4">
        {/* Standaard Instellingen */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Standaard Instellingen</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Verzendtijd</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{verzendtijd}</p>
              </div>
              <button
                onClick={() => { setTempTime(verzendtijd); setTimeOpen(true); }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Verzendtijd aanpassen"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </Card>
            <Popover>
              <PopoverTrigger asChild>
                <Card className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/30 transition-colors">
                  <div>
                    <p className="text-xs text-muted-foreground">Medium</p>
                    <p className="mt-1 text-2xl font-bold text-foreground whitespace-nowrap">{medium}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Card>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1" align="end">
                <RadioGroup value={medium} onValueChange={(v) => setMedium(v as Medium)} className="space-y-0">
                  {MEDIUM_OPTS.map((opt) => (
                    <label key={opt} htmlFor={`med-${opt}`} className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-accent cursor-pointer text-sm">
                      <RadioGroupItem value={opt} id={`med-${opt}`} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </RadioGroup>
              </PopoverContent>
            </Popover>

            {/* Standaard verdeling */}
            <Popover>
              <PopoverTrigger asChild>
                <Card className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/30 transition-colors">
                  <div>
                    <p className="text-xs text-muted-foreground">Standaard verdeling</p>
                    <p className="mt-1 text-2xl font-bold text-foreground whitespace-nowrap">{verdeling}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Card>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-1" align="end">
                <RadioGroup value={verdeling} onValueChange={(v) => setVerdeling(v as Verdeling)} className="space-y-0">
                  {VERDELING_OPTS.map((opt) => (
                    <label key={opt} htmlFor={`verd-${opt}`} className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-accent cursor-pointer text-sm">
                      <RadioGroupItem value={opt} id={`verd-${opt}`} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </RadioGroup>
              </PopoverContent>
            </Popover>

            {/* Functiegroep */}
            <Popover>
              <PopoverTrigger asChild>
                <Card className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/30 transition-colors">
                  <div>
                    <p className="text-xs text-muted-foreground">Functiegroep</p>
                    <p className="mt-1 text-2xl font-bold text-foreground whitespace-nowrap">{summarize(functies, FUNCTIE_OPTS)}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Card>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="end">
                <div className="flex items-center justify-between mb-1 px-1">
                  <span className="text-xs font-medium text-muted-foreground">Functiegroepen</span>
                  <button className="text-xs text-primary hover:underline" onClick={() => setFuncties(functies.length === FUNCTIE_OPTS.length ? [] : [...FUNCTIE_OPTS])}>
                    {functies.length === FUNCTIE_OPTS.length ? "Alles uit" : "Alles aan"}
                  </button>
                </div>
                {FUNCTIE_OPTS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-accent cursor-pointer text-sm">
                    <Checkbox checked={functies.includes(opt)} onCheckedChange={() => setFuncties(toggle(functies, opt))} />
                    <span>{opt}</span>
                  </label>
                ))}
              </PopoverContent>
            </Popover>

            {/* Berichttype */}
            <Popover>
              <PopoverTrigger asChild>
                <Card className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/30 transition-colors">
                  <div>
                    <p className="text-xs text-muted-foreground">Berichttype</p>
                    <p className="mt-1 text-2xl font-bold text-foreground whitespace-nowrap">{summarize(berichten, BERICHT_OPTS)}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Card>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="end">
                <div className="flex items-center justify-between mb-1 px-1">
                  <span className="text-xs font-medium text-muted-foreground">Berichttypes</span>
                  <button className="text-xs text-primary hover:underline" onClick={() => setBerichten(berichten.length === BERICHT_OPTS.length ? [] : [...BERICHT_OPTS])}>
                    {berichten.length === BERICHT_OPTS.length ? "Alles uit" : "Alles aan"}
                  </button>
                </div>
                {BERICHT_OPTS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-accent cursor-pointer text-sm">
                    <Checkbox checked={berichten.includes(opt)} onCheckedChange={() => setBerichten(toggle(berichten, opt))} />
                    <span>{opt}</span>
                  </label>
                ))}
              </PopoverContent>
            </Popover>

            {/* Categorie */}
            <Popover>
              <PopoverTrigger asChild>
                <Card className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/30 transition-colors">
                  <div>
                    <p className="text-xs text-muted-foreground">Categorie</p>
                    <p className="mt-1 text-2xl font-bold text-foreground whitespace-nowrap">{summarize(categorieen, CATEGORIE_OPTS)}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Card>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="end">
                <div className="flex items-center justify-between mb-1 px-1">
                  <span className="text-xs font-medium text-muted-foreground">Categorieën</span>
                  <button className="text-xs text-primary hover:underline" onClick={() => setCategorieen(categorieen.length === CATEGORIE_OPTS.length ? [] : [...CATEGORIE_OPTS])}>
                    {categorieen.length === CATEGORIE_OPTS.length ? "Alles uit" : "Alles aan"}
                  </button>
                </div>
                {CATEGORIE_OPTS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-accent cursor-pointer text-sm">
                    <Checkbox checked={categorieen.includes(opt)} onCheckedChange={() => setCategorieen(toggle(categorieen, opt))} />
                    <span>{opt}</span>
                  </label>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Calendar card */}
        <Card className={cn("p-4 transition-colors", editMode && "border-2 border-emerald-500 shadow-[0_0_0_3px_hsl(var(--background))_inset]")}>

          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCursor(addMonths(cursor, -1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-base font-semibold capitalize">
                {format(cursor, "LLLL yyyy", { locale: nl })}
              </h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCursor(addMonths(cursor, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4 text-xs flex-wrap justify-end">
              {FUNCTIE_OPTS.filter((f) => functies.includes(f)).map((f) => {
                const meta = FUNCTIE_META[f];
                return (
                  <div key={f} className="flex items-center gap-1.5">
                    <span className={cn("h-2 w-2 rounded-full", meta?.dot)} />
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                );
              })}
              <span className="h-4 w-px bg-border" />
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-foreground/80" />
                <span className="text-muted-foreground">Verzonden</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-foreground/80 opacity-50" />
                <span className="text-muted-foreground">Gepland</span>
              </div>
              <Button
                size="sm"
                variant={editMode ? "default" : "outline"}
                onClick={() => setEditMode((v) => !v)}
                className={cn(
                  "h-7 gap-1",
                  editMode && "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500"
                )}
              >
                <Pencil className="h-3.5 w-3.5" /> {editMode ? "Klaar" : "Pas aan"}
              </Button>
            </div>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 border-b border-border">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-2 py-2 text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {gridDays.map((day, idx) => {
              const inMonth = isSameMonth(day, cursor);
              const dayItems = items.filter((i) => isSameDay(i.date, day) && functies.includes(i.functie));
              const isSel = selected && isSameDay(selected, day);
              const dayKey = format(day, "yyyy-MM-dd");
              const isDragOver = dragOverKey === dayKey;
              const byFunctie = FUNCTIE_OPTS
                .filter((f) => functies.includes(f))
                .map((f) => ({ functie: f, count: dayItems.filter((i) => i.functie === f).length }))
                .filter((g) => g.count > 0);

              return (
                <div
                  key={idx}
                  onClick={() => setSelected(day)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverKey(dayKey); }}
                  onDragLeave={() => setDragOverKey((k) => (k === dayKey ? null : k))}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/plain");
                    if (id) moveItem(id, day);
                    setDragOverKey(null);
                    setDragId(null);
                  }}
                  className={cn(
                    "min-h-[90px] border-b border-r border-border p-1.5 text-left transition-colors cursor-pointer",
                    "hover:bg-muted/50",
                    !inMonth && "bg-muted/20 text-muted-foreground/50",
                    isSel && "ring-2 ring-primary ring-inset",
                    isDragOver && "bg-primary/10 ring-2 ring-primary/40 ring-inset",
                    (idx + 1) % 7 === 0 && "border-r-0"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isToday(day) && "flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {dayItems.length > 0 && (
                      <span className="text-[10px] font-medium text-muted-foreground">{dayItems.length}</span>
                    )}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {byFunctie.map(({ functie, count }) => {
                      const meta = FUNCTIE_META[functie];
                      const repr = dayItems.find((i) => i.functie === functie);
                      const isFuture = effectiveStatus(day) === "gepland";
                      const seed = `${dayKey}-${functie}`;
                      const btSplit = distribute(count, berichten, seed + "-bt");
                      const catSplit = distribute(count, categorieen, seed + "-cat");
                      const sent = count;
                      const read = Math.round(count * 0.72);
                      const replies = Math.round(count * 0.18);
                      const failed = Math.max(0, count - read - replies > 0 ? Math.round(count * 0.04) : 0);
                      return (
                        <HoverCard key={functie} openDelay={120} closeDelay={80}>
                          <HoverCardTrigger asChild>
                            <div
                              draggable={!!repr}
                              onDragStart={(e) => {
                                if (repr) {
                                  e.stopPropagation();
                                  e.dataTransfer.setData("text/plain", repr.id);
                                  e.dataTransfer.effectAllowed = "move";
                                  setDragId(repr.id);
                                }
                              }}
                              onDragEnd={() => setDragId(null)}
                              className={cn(
                                "flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium cursor-grab active:cursor-grabbing",
                                meta?.bg,
                                meta?.text,
                                dragId === repr?.id && "opacity-50"
                              )}
                            >
                              <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", meta?.dot)} />
                              <span className="truncate flex-1">{meta?.short ?? functie}</span>
                              {repr?.customized && (
                                <span className="rounded-sm bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1 py-px text-[9px] font-semibold uppercase tracking-wide">
                                  Aangepast
                                </span>
                              )}
                              <span className="font-bold">{count}</span>
                              {editMode && repr && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); openEdit(repr); }}
                                  className="ml-0.5 rounded p-0.5 hover:bg-background/60"
                                  aria-label="Bericht aanpassen"
                                >
                                  <Pencil className="h-2.5 w-2.5" />
                                </button>
                              )}
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent side="right" align="start" className="w-72 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <span className={cn("h-2 w-2 rounded-full", meta?.dot)} />
                                <span className="text-sm font-semibold">{functie}</span>
                              </div>
                              <span className={cn(
                                "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                                isFuture ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                              )}>
                                {isFuture ? "Gepland" : "Verzonden"}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {format(day, "EEEE d MMMM", { locale: nl })} · {count} bericht{count > 1 ? "en" : ""}
                            </p>
                            {isFuture ? (
                              <div className="space-y-3">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Per berichttype</p>
                                  <div className="space-y-1">
                                    {berichten.map((bt) => (
                                      <div key={bt} className="flex items-center justify-between text-xs">
                                        <span className="truncate text-foreground">{bt}</span>
                                        <span className="font-semibold tabular-nums text-muted-foreground">{btSplit[bt] ?? 0}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Per categorie</p>
                                  <div className="flex items-center gap-2">
                                    {categorieen.map((c) => (
                                      <div key={c} className="flex-1 rounded-md border border-border px-2 py-1.5 text-center">
                                        <p className="text-[10px] text-muted-foreground">{c}</p>
                                        <p className="text-sm font-bold tabular-nums">{catSplit[c] ?? 0}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                <div className="rounded-md border border-border p-2">
                                  <div className="flex items-center gap-1.5 text-muted-foreground"><CheckCircle2 className="h-3 w-3" /><span className="text-[10px]">Verzonden</span></div>
                                  <p className="mt-0.5 text-base font-bold tabular-nums">{sent}</p>
                                </div>
                                <div className="rounded-md border border-border p-2">
                                  <div className="flex items-center gap-1.5 text-muted-foreground"><Eye className="h-3 w-3" /><span className="text-[10px]">Gelezen</span></div>
                                  <p className="mt-0.5 text-base font-bold tabular-nums">{read}</p>
                                </div>
                                <div className="rounded-md border border-border p-2">
                                  <div className="flex items-center gap-1.5 text-muted-foreground"><MessageSquare className="h-3 w-3" /><span className="text-[10px]">Reacties</span></div>
                                  <p className="mt-0.5 text-base font-bold tabular-nums">{replies}</p>
                                </div>
                                <div className="rounded-md border border-border p-2">
                                  <div className="flex items-center gap-1.5 text-muted-foreground"><AlertTriangle className="h-3 w-3" /><span className="text-[10px]">Failed</span></div>
                                  <p className="mt-0.5 text-base font-bold tabular-nums">{failed}</p>
                                </div>
                              </div>
                            )}
                          </HoverCardContent>
                        </HoverCard>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* RIGHT: side panel */}
      <div className="space-y-4">
        <Card className="p-4">
          <h4 className="text-sm font-semibold capitalize mb-3">
            {format(cursor, "LLLL yyyy", { locale: nl })} overzicht
          </h4>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="rounded-md border border-border p-2.5">
              <p className="text-xs text-muted-foreground">Gepland</p>
              <p className="text-lg font-bold text-foreground">{counts.gepland}</p>
            </div>
            <div className="rounded-md border border-border p-2.5">
              <p className="text-xs text-muted-foreground">Verzonden</p>
              <p className="text-lg font-bold text-foreground">{counts.verzonden}</p>
            </div>
          </div>

          {/* mini bar chart */}
          <div className="mb-4">
            <div className="flex items-end gap-1 h-16">
              {[40, 70, 55, 90, 60, 75, 45, 80, 35, 65].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-primary/70"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">Bericht per kanaal</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>App</span>
              </div>
              <span className="text-muted-foreground">{items.filter((i) => i.channel === "app").length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Mail</span>
              </div>
              <span className="text-muted-foreground">{items.filter((i) => i.channel === "mail").length}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold">Instellingen Berichttype</h4>
          </div>
          <div className="space-y-2">
            {BERICHT_OPTS.map((bt) => (
              <div key={bt} className="flex items-center justify-between gap-2 rounded-md border border-border p-2">
                <span className="text-xs font-medium text-foreground flex-1 truncate" title={bt}>{bt}</span>
                <Select
                  value={berichtVersies[bt]}
                  onValueChange={(v) => setBerichtVersies((prev) => ({ ...prev, [bt]: v }))}
                >
                  <SelectTrigger className="h-7 w-[92px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VERSIE_OPTS.map((v) => (
                      <SelectItem key={v} value={v} className="text-xs">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Verzendtijd dialog */}
      <Dialog open={timeOpen} onOpenChange={setTimeOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Verzendtijd aanpassen</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="verzendtijd-input" className="text-xs text-muted-foreground">Tijd</Label>
            <Input
              id="verzendtijd-input"
              type="time"
              value={tempTime}
              onChange={(e) => setTempTime(e.target.value)}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTimeOpen(false)}>Annuleren</Button>
            <Button onClick={() => { setVerzendtijd(tempTime || "11:00"); setTimeOpen(false); }}>Opslaan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit message dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bericht aanpassen</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs text-muted-foreground">Verzendtijd</Label>
              <Input
                type="time"
                value={editForm.verzendtijd}
                onChange={(e) => setEditForm((f) => ({ ...f, verzendtijd: e.target.value }))}
                className="mt-1"
              />
            </div>
            {([
              { key: "functies" as const, label: "Functiegroepen", opts: FUNCTIE_OPTS },
              { key: "berichttypes" as const, label: "Berichttypes", opts: BERICHT_OPTS },
              { key: "categorieen" as const, label: "Categorieën", opts: CATEGORIE_OPTS },
            ]).map(({ key, label, opts }) => {
              const sel = editForm[key];
              return (
                <div key={key}>
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <div className="mt-1 rounded-md border border-border p-2 space-y-1 max-h-44 overflow-y-auto">
                    <div className="flex items-center justify-between pb-1 border-b border-border mb-1">
                      <span className="text-[10px] text-muted-foreground">{sel.length} van {opts.length} geselecteerd</span>
                      <button
                        type="button"
                        className="text-[10px] text-primary hover:underline"
                        onClick={() => setEditForm((f) => ({ ...f, [key]: sel.length === opts.length ? [] : [...opts] }))}
                      >
                        {sel.length === opts.length ? "Alles uit" : "Alles aan"}
                      </button>
                    </div>
                    {opts.map((o) => (
                      <label key={o} className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-accent cursor-pointer text-sm">
                        <Checkbox
                          checked={sel.includes(o)}
                          onCheckedChange={() => setEditForm((f) => ({ ...f, [key]: toggle(f[key], o) }))}
                        />
                        <span>{o}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Annuleren</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={saveEdit}>Opslaan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default PlanningTab;
