import { useMemo, useRef, useState } from "react";
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
import { ChevronLeft, ChevronRight, Mail, Smartphone, Settings, Plus, Pencil, CheckCircle2, Eye, MessageSquare, AlertTriangle, X, Check, Phone, CalendarDays, Trash2, CalendarIcon } from "lucide-react";
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
import { Slider } from "@/components/ui/slider";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TileInfo } from "@/components/funnel-ops/TileInfo";
import { ChangeScheduler, PendingChangeBadge } from "../components/ChangeScheduler";
import { Calendar } from "@/components/ui/calendar";

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

interface PlanChange {
  label: string;
  from: string;
  to: string;
}

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
  manualAdded?: boolean;
  changes?: PlanChange[];
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

const VERZENDDAG_OPTS = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

interface Contact {
  name: string;
  functie: string;
  categorie: string;
  status: Status;
  telefoon: string;
  email: string;
}

const VOORNAMEN = ["Jan","Lisa","Mark","Sofie","Ahmed","Eva","Tom","Anna","Karim","Iris","Luuk","Noor","Daan","Sara","Bram","Fleur","Sam","Naomi","Pieter","Mila","Joris","Yara","Ruben","Lotte","Sven","Maud","Bas","Femke","Niels","Lieke"];
const ACHTERNAMEN = ["de Vries","Jansen","Bakker","Visser","Smit","Meijer","de Boer","Mulder","Hendriks","Peters","Dekker","Brouwer","van Dijk","van den Berg","Kuiper","Vermeulen","Bos","de Jong","Hoekstra","van Leeuwen"];

function genContacts(seed: string, count: number, functie: string, status: Status, fixedCat?: string): Contact[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cats = ["A+", "A", "B"];
  const out: Contact[] = [];
  for (let i = 0; i < count; i++) {
    h = (h * 1103515245 + 12345 + i * 2654435761) >>> 0;
    const vn = VOORNAMEN[(h >> 4) % VOORNAMEN.length];
    const an = ACHTERNAMEN[(h >> 8) % ACHTERNAMEN.length];
    const cat = fixedCat ?? cats[(h >> 12) % cats.length];
    const tel = `06 ${String(((h >> 2) % 90) + 10)} ${String(((h >> 5) % 9000) + 1000)} ${String(((h >> 9) % 9000) + 1000)}`;
    const email = `${vn.toLowerCase()}.${an.toLowerCase().replace(/[^a-z]/g, "")}@mail.nl`;
    out.push({ name: `${vn} ${an}`, functie, categorie: cat, status, telefoon: tel, email });
  }
  return out;
}

function buildMockItems(monthDate: Date): PlanItem[] {
  const base = startOfMonth(monthDate);
  const items: PlanItem[] = [];
  const plan: Array<[number, string, Status, "app" | "mail", number]> = [
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
    const date = addDays(base, offset);
    if (date.getDay() === 0) return; // skip Sunday
    for (let i = 0; i < count; i++) {
      items.push({ id: `m-${counter++}`, date, title: `${functie} bericht`, status, channel, functie });
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
  const [timeWarning, setTimeWarning] = useState<string | null>(null);
  const [editTimeWarning, setEditTimeWarning] = useState<string | null>(null);
  const [verzenddagen, setVerzenddagen] = useState<string[]>([...VERZENDDAG_OPTS]);
  const [contactDialog, setContactDialog] = useState<{ title: string; subtitle?: string; contacts: Contact[] } | null>(null);
  const openContacts = (title: string, subtitle: string, count: number, functie: string, status: Status, fixedCat?: string) => {
    const seed = `${title}|${functie}|${subtitle}`;
    setContactDialog({ title, subtitle, contacts: genContacts(seed, count, functie, status, fixedCat) });
  };

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
  const [maxPerDag, setMaxPerDag] = useState<number>(150);
  const [berichtVersies, setBerichtVersies] = useState<Record<string, string>>(
    Object.fromEntries(BERICHT_OPTS.map((b, i) => [b, VERSIE_OPTS[i % VERSIE_OPTS.length]]))
  );

  // Pending scheduled changes per tile (apply on a future date)
  type PendingTile = { label: string; date: Date };
  type TileKey = "verzendtijd" | "verzenddagen" | "medium" | "verdeling" | "functies" | "berichten" | "categorieen" | "maxPerDag";
  const [pendingTiles, setPendingTiles] = useState<Record<TileKey, PendingTile | null>>({
    verzendtijd: null,
    verzenddagen: null,
    medium: null,
    verdeling: null,
    functies: null,
    berichten: null,
    categorieen: null,
    maxPerDag: null,
  });
  const setPending = (k: TileKey, p: PendingTile | null) =>
    setPendingTiles((prev) => ({ ...prev, [k]: p }));

  // Previous values captured when popover/dialog opens, so scheduling can revert
  const [prevSnap, setPrevSnap] = useState<Record<TileKey, any>>({
    verzendtijd: verzendtijd,
    verzenddagen: [...verzenddagen],
    medium: medium,
    verdeling: verdeling,
    functies: [...functies],
    berichten: [...berichten],
    categorieen: [...categorieen],
    maxPerDag: maxPerDag,
  });
  const captureSnap = (k: TileKey, value: any) =>
    setPrevSnap((prev) => ({ ...prev, [k]: Array.isArray(value) ? [...value] : value }));

  // Track which tiles were explicitly applied (or scheduled) during a popover session.
  // If the popover closes without apply, we revert the live value to the captured snap.
  const appliedRef = useRef<Set<TileKey>>(new Set());
  const setters: Record<TileKey, (v: any) => void> = {
    verzendtijd: setVerzendtijd,
    verzenddagen: setVerzenddagen,
    medium: setMedium,
    verdeling: setVerdeling,
    functies: setFuncties,
    berichten: setBerichten,
    categorieen: setCategorieen,
    maxPerDag: setMaxPerDag,
  };
  const handleOpenChange = (key: TileKey, currentValue: any) => (open: boolean) => {
    if (open) {
      captureSnap(key, currentValue);
      appliedRef.current.delete(key);
    } else if (!appliedRef.current.has(key)) {
      // revert unapplied edits
      setters[key](Array.isArray(prevSnap[key]) ? [...prevSnap[key]] : prevSnap[key]);
    }
  };
  const markApplied = (key: TileKey) => { appliedRef.current.add(key); };

  const summarizeDagen = (arr: string[]) =>
    arr.length === VERZENDDAG_OPTS.length ? "Ma t/m Za" : arr.length === 0 ? "Geen" : `${arr.length} dagen`;

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
  const [editForm, setEditForm] = useState<{ verzendtijd: string; functies: string[]; berichttypes: string[]; categorieen: string[]; maxPerDag: number }>({
    verzendtijd: verzendtijd,
    functies: [FUNCTIE_OPTS[0]],
    berichttypes: [BERICHT_OPTS[0]],
    categorieen: [CATEGORIE_OPTS[0]],
    maxPerDag: 150,
  });

  const openEdit = (item: PlanItem) => {
    setEditItemId(item.id);
    setEditForm({
      verzendtijd: item.verzendtijd ?? verzendtijd,
      functies: [item.functie],
      berichttypes: item.berichttype ? [item.berichttype] : [BERICHT_OPTS[0]],
      categorieen: item.categorie ? [item.categorie] : [CATEGORIE_OPTS[0]],
      maxPerDag: 150,
    });
    setEditOpen(true);
  };

  const saveEdit = (overrideTime?: string) => {
    if (!editItemId) return;
    const validTime = overrideTime ?? (/^([01]\d|2[0-3]):([0-5]\d)$/.test(editForm.verzendtijd) ? editForm.verzendtijd : "11:00");
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== editItemId) return it;
        const beforeTijd = it.verzendtijd ?? verzendtijd;
        const beforeFunctie = it.functie;
        const beforeBericht = it.berichttype ?? "Alle berichttypes";
        const beforeCat = it.categorie ?? "Alle categorieën";
        const afterFunctie = editForm.functies[0] ?? it.functie;
        const afterBericht = editForm.berichttypes.join(", ");
        const afterCat = editForm.categorieen.join(", ");
        const newChanges: PlanChange[] = [...(it.changes ?? [])];
        const push = (label: string, from: string, to: string) => {
          if (from === to) return;
          // replace existing entry for this label so we only show latest delta vs original
          const existingIdx = newChanges.findIndex((c) => c.label === label);
          if (existingIdx >= 0) newChanges[existingIdx] = { label, from: newChanges[existingIdx].from, to };
          else newChanges.push({ label, from, to });
        };
        push("Verzendtijd", beforeTijd, validTime);
        push("Functiegroep", beforeFunctie, afterFunctie);
        push("Berichttype", beforeBericht, afterBericht);
        push("Categorie", beforeCat, afterCat);
        return {
          ...it,
          verzendtijd: validTime,
          functie: afterFunctie,
          berichttype: afterBericht,
          categorie: afterCat,
          customized: newChanges.length > 0 || it.customized,
          changes: newChanges,
        };
      })
    );
    setEditOpen(false);
    setEditItemId(null);
  };

  // Delete confirmation for edit dialog
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setDeleteConfirm(null);
    setEditOpen(false);
    setEditItemId(null);
  };

  // "Nieuw bericht" dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<{
    date: Date | undefined;
    verzendtijd: string;
    functies: string[];
    berichttypes: string[];
    categorieen: string[];
    maxPerDag: number;
  }>({
    date: undefined,
    verzendtijd,
    functies: [FUNCTIE_OPTS[0]],
    berichttypes: [BERICHT_OPTS[0]],
    categorieen: [CATEGORIE_OPTS[0]],
    maxPerDag: 150,
  });
  const [addCalOpen, setAddCalOpen] = useState(false);

  const openAdd = () => {
    setAddForm({
      date: undefined,
      verzendtijd,
      functies: [FUNCTIE_OPTS[0]],
      berichttypes: [BERICHT_OPTS[0]],
      categorieen: [CATEGORIE_OPTS[0]],
      maxPerDag: 150,
    });
    setAddOpen(true);
  };

  const saveAdd = (overrideTime?: string) => {
    if (!addForm.date) return;
    const validTime = overrideTime ?? (/^([01]\d|2[0-3]):([0-5]\d)$/.test(addForm.verzendtijd) ? addForm.verzendtijd : verzendtijd);
    const functie = addForm.functies[0] ?? FUNCTIE_OPTS[0];
    const berichttype = addForm.berichttypes.join(", ");
    const categorie = addForm.categorieen.join(", ");
    const newItem: PlanItem = {
      id: `new-${Date.now()}`,
      date: addForm.date,
      title: `${functie} bericht`,
      status: effectiveStatus(addForm.date),
      channel: medium === "Mail" ? "mail" : "app",
      functie,
      verzendtijd: validTime,
      berichttype,
      categorie,
      customized: false,
      manualAdded: true,
      changes: [],
    };
    setItems((prev) => [...prev, newItem]);
    setAddOpen(false);
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

  const [pendingMove, setPendingMove] = useState<{ id: string; from: Date; to: Date; functie: string; count: number } | null>(null);

  const requestMove = (id: string, target: Date) => {
    const src = items.find((i) => i.id === id);
    if (!src) return;
    if (isSameDay(src.date, target)) return;
    const count = items.filter((i) => isSameDay(i.date, src.date) && i.functie === src.functie).length;
    setPendingMove({ id, from: src.date, to: target, functie: src.functie, count });
  };

  const confirmMove = () => {
    if (!pendingMove) return;
    const { from, to, functie } = pendingMove;
    setItems((prev) => prev.map((it) => (isSameDay(it.date, from) && it.functie === functie ? { ...it, date: to } : it)));
    setPendingMove(null);
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
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Verzendtijd</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{verzendtijd}</p>
                </div>
                <div className="flex items-center gap-2">
                  <TileInfo title="Verzendtijd" what="verzendtijd = sending time, 24 hour clock, which shows a warning when trying to change to outside of regular business hours" />
                  <button
                    onClick={() => { captureSnap("verzendtijd", verzendtijd); setTempTime(verzendtijd); setTimeOpen(true); }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Verzendtijd aanpassen"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {pendingTiles.verzendtijd && (
                <PendingChangeBadge
                  label={pendingTiles.verzendtijd.label}
                  date={pendingTiles.verzendtijd.date}
                  onCancel={() => setPending("verzendtijd", null)}
                />
              )}
            </Card>

            {/* Verzenddagen */}
            <Popover onOpenChange={handleOpenChange("verzenddagen", verzenddagen)}>
              <PopoverTrigger asChild>
                <Card className="p-4 cursor-pointer hover:bg-accent/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Verzenddagen</p>
                      <p className="mt-1 text-2xl font-bold text-foreground whitespace-nowrap">{summarizeDagen(verzenddagen)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TileInfo title="Verzenddagen" what="verzenddagen = sending days, option to select on which days we want to automatically send messages" />
                      <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                  {pendingTiles.verzenddagen && (
                    <PendingChangeBadge
                      label={pendingTiles.verzenddagen.label}
                      date={pendingTiles.verzenddagen.date}
                      onCancel={() => setPending("verzenddagen", null)}
                    />
                  )}
                </Card>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <div className="flex items-center justify-between mb-1 px-1">
                  <span className="text-xs font-medium text-muted-foreground">Verzenddagen</span>
                  <button className="text-xs text-primary hover:underline" onClick={() => setVerzenddagen(verzenddagen.length === VERZENDDAG_OPTS.length ? [] : [...VERZENDDAG_OPTS])}>
                    {verzenddagen.length === VERZENDDAG_OPTS.length ? "Alles uit" : "Alles aan"}
                  </button>
                </div>
                {VERZENDDAG_OPTS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-accent cursor-pointer text-sm">
                    <Checkbox checked={verzenddagen.includes(opt)} onCheckedChange={() => setVerzenddagen(toggle(verzenddagen, opt))} />
                    <span>{opt}</span>
                  </label>
                ))}
                <p className="px-2 pt-1 text-[10px] text-muted-foreground">Op zondag worden geen berichten verstuurd.</p>
                <ChangeScheduler
                  onApplyNow={() => { markApplied("verzenddagen"); }}
                  onSchedule={(date) => {
                    markApplied("verzenddagen");
                    setPending("verzenddagen", { label: summarizeDagen(verzenddagen), date });
                    setVerzenddagen(prevSnap.verzenddagen);
                  }}
                />
              </PopoverContent>
            </Popover>

            <Popover onOpenChange={handleOpenChange("medium", medium)}>
              <PopoverTrigger asChild>
                <Card className="p-4 cursor-pointer hover:bg-accent/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Medium</p>
                      <p className="mt-1 text-2xl font-bold text-foreground whitespace-nowrap">{medium}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TileInfo title="Medium" what="medium gives the option to choose between app or mail or both" />
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  {pendingTiles.medium && (
                    <PendingChangeBadge
                      label={pendingTiles.medium.label}
                      date={pendingTiles.medium.date}
                      onCancel={() => setPending("medium", null)}
                    />
                  )}
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
                <div className="px-1">
                  <ChangeScheduler
                    onApplyNow={() => { /* live applied */ }}
                    onSchedule={(date) => {
                      setPending("medium", { label: medium, date });
                      setMedium(prevSnap.medium);
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>

            {/* Standaard verdeling */}
            <Popover onOpenChange={(o) => { if (o) captureSnap("verdeling", verdeling); }}>
              <PopoverTrigger asChild>
                <Card className="p-4 cursor-pointer hover:bg-accent/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Standaard verdeling</p>
                      <p className="mt-1 text-2xl font-bold text-foreground whitespace-nowrap">{verdeling}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TileInfo title="Standaard verdeling" what="standaard verdeling = possibility to change the distribution of the messages send." />
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  {pendingTiles.verdeling && (
                    <PendingChangeBadge
                      label={pendingTiles.verdeling.label}
                      date={pendingTiles.verdeling.date}
                      onCancel={() => setPending("verdeling", null)}
                    />
                  )}
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
                <div className="px-1">
                  <ChangeScheduler
                    onApplyNow={() => { /* live applied */ }}
                    onSchedule={(date) => {
                      setPending("verdeling", { label: verdeling, date });
                      setVerdeling(prevSnap.verdeling);
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>

            {/* Functiegroep */}
            <Popover onOpenChange={(o) => { if (o) captureSnap("functies", functies); }}>
              <PopoverTrigger asChild>
                <Card className="p-4 cursor-pointer hover:bg-accent/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Functiegroep</p>
                      <p className="mt-1 text-2xl font-bold text-foreground whitespace-nowrap">{summarize(functies, FUNCTIE_OPTS)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TileInfo title="Functiegroep" what="option to select which functiegroups automatically get a message, based on functiongroups in candidate profile." />
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  {pendingTiles.functies && (
                    <PendingChangeBadge
                      label={pendingTiles.functies.label}
                      date={pendingTiles.functies.date}
                      onCancel={() => setPending("functies", null)}
                    />
                  )}
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
                <ChangeScheduler
                  onApplyNow={() => { /* live applied */ }}
                  onSchedule={(date) => {
                    setPending("functies", { label: summarize(functies, FUNCTIE_OPTS), date });
                    setFuncties(prevSnap.functies);
                  }}
                />
              </PopoverContent>
            </Popover>

            {/* Berichttype */}
            <Popover onOpenChange={(o) => { if (o) captureSnap("berichten", berichten); }}>
              <PopoverTrigger asChild>
                <Card className="p-4 cursor-pointer hover:bg-accent/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Berichttype</p>
                      <p className="mt-1 text-2xl font-bold text-foreground whitespace-nowrap">{summarize(berichten, BERICHT_OPTS)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TileInfo title="Berichttype" what="option to select which flows to turn on and off." />
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  {pendingTiles.berichten && (
                    <PendingChangeBadge
                      label={pendingTiles.berichten.label}
                      date={pendingTiles.berichten.date}
                      onCancel={() => setPending("berichten", null)}
                    />
                  )}
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
                <ChangeScheduler
                  onApplyNow={() => { /* live applied */ }}
                  onSchedule={(date) => {
                    setPending("berichten", { label: summarize(berichten, BERICHT_OPTS), date });
                    setBerichten(prevSnap.berichten);
                  }}
                />
              </PopoverContent>
            </Popover>

            {/* Categorie */}
            <Popover onOpenChange={(o) => { if (o) captureSnap("categorieen", categorieen); }}>
              <PopoverTrigger asChild>
                <Card className="p-4 cursor-pointer hover:bg-accent/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Categorie</p>
                      <p className="mt-1 text-2xl font-bold text-foreground whitespace-nowrap">{summarize(categorieen, CATEGORIE_OPTS)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TileInfo title="Categorie" what="option to select which categories automatically get a message, based on the category from the candidate profile." />
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  {pendingTiles.categorieen && (
                    <PendingChangeBadge
                      label={pendingTiles.categorieen.label}
                      date={pendingTiles.categorieen.date}
                      onCancel={() => setPending("categorieen", null)}
                    />
                  )}
                </Card>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
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
                <ChangeScheduler
                  onApplyNow={() => { /* live applied */ }}
                  onSchedule={(date) => {
                    setPending("categorieen", { label: summarize(categorieen, CATEGORIE_OPTS), date });
                    setCategorieen(prevSnap.categorieen);
                  }}
                />
              </PopoverContent>
            </Popover>

            {/* Max. berichten per dag */}
            <Popover onOpenChange={(o) => { if (o) captureSnap("maxPerDag", maxPerDag); }}>
              <PopoverTrigger asChild>
                <Card className="p-4 cursor-pointer hover:bg-accent/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Max. berichten per dag</p>
                      <p className="mt-1 text-2xl font-bold text-foreground whitespace-nowrap">{maxPerDag}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TileInfo title="Max. berichten per dag" what="option to change the limit of amount of send messages per day" />
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  {pendingTiles.maxPerDag && (
                    <PendingChangeBadge
                      label={pendingTiles.maxPerDag.label}
                      date={pendingTiles.maxPerDag.date}
                      onCancel={() => setPending("maxPerDag", null)}
                    />
                  )}
                </Card>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4" align="end">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground">Max. per dag</span>
                  <span className="text-sm font-bold tabular-nums">{maxPerDag}</span>
                </div>
                <Slider
                  value={[maxPerDag]}
                  min={0}
                  max={500}
                  step={5}
                  onValueChange={(v) => setMaxPerDag(v[0] ?? 0)}
                />
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                  <span>0</span>
                  <span>500</span>
                </div>
                <ChangeScheduler
                  onApplyNow={() => { /* live applied */ }}
                  onSchedule={(date) => {
                    setPending("maxPerDag", { label: String(maxPerDag), date });
                    setMaxPerDag(prevSnap.maxPerDag);
                  }}
                />
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
                variant="outline"
                onClick={openAdd}
                className="h-7 gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Nieuw
              </Button>
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
              // Filters in de tegels gelden alleen voor geplande berichten.
              // Verzonden berichten blijven altijd zichtbaar.
              const dayItems = items.filter((i) => {
                if (!isSameDay(i.date, day)) return false;
                const future = effectiveStatus(i.date) === "gepland";
                if (!future) return true;
                return functies.includes(i.functie);
              });
              const isSel = selected && isSameDay(selected, day);
              const dayKey = format(day, "yyyy-MM-dd");
              const isDragOver = dragOverKey === dayKey;
              const presentFuncties = Array.from(new Set(dayItems.map((i) => i.functie)));
              const byFunctie = FUNCTIE_OPTS
                .filter((f) => presentFuncties.includes(f))
                .map((f) => ({ functie: f, count: dayItems.filter((i) => i.functie === f).length }))
                .filter((g) => g.count > 0);

              const isSunday = day.getDay() === 0;
              return (
                <div
                  key={idx}
                  onClick={() => { if (!isSunday) setSelected(day); }}
                  onDragOver={(e) => { if (isSunday) return; e.preventDefault(); setDragOverKey(dayKey); }}
                  onDragLeave={() => setDragOverKey((k) => (k === dayKey ? null : k))}
                  onDrop={(e) => {
                    if (isSunday) { setDragOverKey(null); setDragId(null); return; }
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/plain");
                    if (id) requestMove(id, day);
                    setDragOverKey(null);
                    setDragId(null);
                  }}
                  className={cn(
                    "min-h-[90px] border-b border-r border-border p-1.5 text-left transition-colors",
                    isSunday
                      ? "bg-muted/40 text-muted-foreground/60 cursor-not-allowed [background-image:repeating-linear-gradient(45deg,transparent,transparent_6px,hsl(var(--muted))_6px,hsl(var(--muted))_7px)]"
                      : "hover:bg-muted/50 cursor-pointer",
                    !inMonth && !isSunday && "bg-muted/20 text-muted-foreground/50",
                    isSel && !isSunday && "ring-2 ring-primary ring-inset",
                    isDragOver && !isSunday && "bg-primary/10 ring-2 ring-primary/40 ring-inset",
                    (idx + 1) % 7 === 0 && "border-r-0"
                  )}
                  title={isSunday ? "Op zondag worden geen berichten verstuurd" : undefined}
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
                    {isSunday ? (
                      <span className="text-[9px] uppercase tracking-wide text-muted-foreground/70">Geen verz.</span>
                    ) : (
                      dayItems.length > 0 && (
                        <span className="text-[10px] font-medium text-muted-foreground">{dayItems.length}</span>
                      )
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
                              draggable={!!repr && isFuture}
                              onDragStart={(e) => {
                                if (repr && isFuture) {
                                  e.stopPropagation();
                                  e.dataTransfer.setData("text/plain", repr.id);
                                  e.dataTransfer.effectAllowed = "move";
                                  setDragId(repr.id);
                                }
                              }}
                              onDragEnd={() => setDragId(null)}
                              className={cn(
                                "flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium transition-opacity",
                                isFuture && "cursor-grab active:cursor-grabbing",
                                meta?.bg,
                                meta?.text,
                                isFuture ? "opacity-50" : "opacity-100",
                                dragId === repr?.id && "opacity-30"
                              )}
                            >
                              <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", meta?.dot)} />
                              <span className="truncate flex-1">{meta?.short ?? functie}</span>
                              {(repr?.customized || repr?.manualAdded) && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span
                                      onClick={(e) => e.stopPropagation()}
                                      className={cn(
                                        "rounded-sm px-1 py-px text-[9px] font-semibold uppercase tracking-wide cursor-help",
                                        repr.manualAdded
                                          ? "bg-blue-500/20 text-blue-700 dark:text-blue-300"
                                          : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                      )}
                                    >
                                      {repr.manualAdded ? "Nieuw" : "Gewijzigd"}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs p-2.5">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                                      {repr.manualAdded ? "Handmatig toegevoegd" : "Wijzigingen"}
                                    </p>
                                    {repr.changes && repr.changes.length > 0 ? (
                                      <ul className="space-y-1.5 text-xs">
                                        {repr.changes.map((c, i) => (
                                          <li key={i}>
                                            <p className="font-semibold text-foreground">{c.label}</p>
                                            <p className="text-muted-foreground">
                                              <span className="line-through">{c.from}</span>
                                              <span className="mx-1">→</span>
                                              <span className="text-foreground font-medium">{c.to}</span>
                                            </p>
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="text-xs text-muted-foreground">
                                        {repr.manualAdded
                                          ? "Dit bericht is handmatig toegevoegd aan de planning."
                                          : "Handmatig aangepast"}
                                      </p>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              <span className="font-bold">{count}</span>
                              {editMode && repr && isFuture && (
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
                                    {berichten.map((bt) => {
                                      const n = btSplit[bt] ?? 0;
                                      return (
                                        <div key={bt} className="flex items-center justify-between text-xs">
                                          <span className="truncate text-foreground">{bt}</span>
                                          <button
                                            type="button"
                                            disabled={n === 0}
                                            onClick={(e) => { e.stopPropagation(); openContacts(`${functie} – ${bt}`, `${format(day, "EEEE d MMMM", { locale: nl })}`, n, functie, isFuture ? "gepland" : "verzonden"); }}
                                            className={cn(
                                              "font-semibold tabular-nums",
                                              n === 0 ? "text-muted-foreground/50" : "text-primary hover:underline cursor-pointer"
                                            )}
                                          >
                                            {n}
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Per categorie</p>
                                  <div className="flex items-center gap-2">
                                    {categorieen.map((c) => {
                                      const n = catSplit[c] ?? 0;
                                      return (
                                        <button
                                          key={c}
                                          type="button"
                                          disabled={n === 0}
                                          onClick={(e) => { e.stopPropagation(); openContacts(`${functie} – Categorie ${c}`, `${format(day, "EEEE d MMMM", { locale: nl })}`, n, functie, isFuture ? "gepland" : "verzonden", c); }}
                                          className={cn(
                                            "flex-1 rounded-md border border-border px-2 py-1.5 text-center transition-colors",
                                            n === 0 ? "opacity-50 cursor-default" : "hover:border-primary hover:bg-primary/5 cursor-pointer"
                                          )}
                                        >
                                          <p className="text-[10px] text-muted-foreground">{c}</p>
                                          <p className={cn("text-sm font-bold tabular-nums", n > 0 && "text-primary")}>{n}</p>
                                        </button>
                                      );
                                    })}
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
          <div className="py-2 space-y-3">
            <div>
              <Label htmlFor="verzendtijd-input" className="text-xs text-muted-foreground">Tijd (24-uurs)</Label>
              <Input
                id="verzendtijd-input"
                type="text"
                inputMode="numeric"
                placeholder="09:00"
                maxLength={5}
                value={tempTime}
                onChange={(e) => setTempTime(e.target.value.replace(/[^0-9:]/g, ""))}
                className="mt-1"
              />
            </div>
            <ChangeScheduler
              onApplyNow={() => {
                const t = /^([01]\d|2[0-3]):([0-5]\d)$/.test(tempTime) ? tempTime : "11:00";
                setTimeOpen(false);
                setTimeWarning(t);
              }}
              onSchedule={(date) => {
                const t = /^([01]\d|2[0-3]):([0-5]\d)$/.test(tempTime) ? tempTime : "11:00";
                setPending("verzendtijd", { label: t, date });
                setTimeOpen(false);
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTimeOpen(false)}>Annuleren</Button>
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
              <Label className="text-xs text-muted-foreground">Verzendtijd (24-uurs)</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="09:00"
                maxLength={5}
                value={editForm.verzendtijd}
                onChange={(e) => setEditForm((f) => ({ ...f, verzendtijd: e.target.value.replace(/[^0-9:]/g, "") }))}
                className="mt-1"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Max. berichten per dag</Label>
                <span className="text-xs font-semibold tabular-nums">{editForm.maxPerDag}</span>
              </div>
              <Slider
                className="mt-2"
                value={[editForm.maxPerDag]}
                min={0}
                max={500}
                step={5}
                onValueChange={(v) => setEditForm((f) => ({ ...f, maxPerDag: v[0] ?? 0 }))}
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>0</span>
                <span>500</span>
              </div>
            </div>
            {([
              { key: "functies" as const, label: "Functiegroepen", opts: FUNCTIE_OPTS },
              { key: "berichttypes" as const, label: "Berichttypes", opts: BERICHT_OPTS },
              { key: "categorieen" as const, label: "Categorieën", opts: CATEGORIE_OPTS },
            ]).map(({ key, label, opts }) => {
              const sel = editForm[key];
              const isEmpty = sel.length === 0;
              return (
                <div key={key}>
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <div className={cn("mt-1 rounded-md border p-2 space-y-1 max-h-44 overflow-y-auto", isEmpty ? "border-destructive" : "border-border")}>
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
                  {isEmpty && (
                    <p className="mt-1 text-xs text-destructive font-medium">Selecteer minimaal één {label.toLowerCase().replace("functiegroepen", "functiegroep").replace("berichttypes", "berichttype").replace("categorieën", "categorie")}.</p>
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter className="sm:justify-between gap-2 flex-row">
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10 gap-1"
              onClick={() => {
                const item = items.find((i) => i.id === editItemId);
                if (item) setDeleteConfirm({ id: item.id, title: `${item.functie} bericht` });
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Verwijderen
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setEditOpen(false)}>Annuleren</Button>
              <Button
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={editForm.functies.length === 0 || editForm.berichttypes.length === 0 || editForm.categorieen.length === 0}
                onClick={() => {
                  const t = /^([01]\d|2[0-3]):([0-5]\d)$/.test(editForm.verzendtijd) ? editForm.verzendtijd : "11:00";
                  const hour = parseInt(t.split(":")[0], 10);
                  if (hour < 8 || hour >= 18) {
                    setEditTimeWarning(t);
                    setEditOpen(false);
                  } else {
                    saveEdit(t);
                  }
                }}
              >
                Opslaan
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => { if (!o) setDeleteConfirm(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Bericht verwijderen</DialogTitle>
          </DialogHeader>
          <div className="py-2 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              Weet je zeker dat je dit bericht <span className="font-semibold">{deleteConfirm?.title}</span> wil verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Annuleren</Button>
            <Button
              variant="destructive"
              className="gap-1"
              onClick={() => deleteConfirm && deleteItem(deleteConfirm.id)}
            >
              <Trash2 className="h-4 w-4" /> Verwijderen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nieuw bericht dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nieuw bericht toevoegen</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs text-muted-foreground">Datum</Label>
              <Popover open={addCalOpen} onOpenChange={setAddCalOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "mt-1 w-full justify-start text-left font-normal",
                      !addForm.date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {addForm.date ? format(addForm.date, "EEEE d MMMM yyyy", { locale: nl }) : "Kies een datum"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={addForm.date}
                    onSelect={(d) => {
                      setAddForm((f) => ({ ...f, date: d ?? undefined }));
                      setAddCalOpen(false);
                    }}
                    disabled={(d) => d.getDay() === 0}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Verzendtijd (24-uurs)</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="09:00"
                maxLength={5}
                value={addForm.verzendtijd}
                onChange={(e) => setAddForm((f) => ({ ...f, verzendtijd: e.target.value.replace(/[^0-9:]/g, "") }))}
                className="mt-1"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Max. berichten per dag</Label>
                <span className="text-xs font-semibold tabular-nums">{addForm.maxPerDag}</span>
              </div>
              <Slider
                className="mt-2"
                value={[addForm.maxPerDag]}
                min={0}
                max={500}
                step={5}
                onValueChange={(v) => setAddForm((f) => ({ ...f, maxPerDag: v[0] ?? 0 }))}
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>0</span>
                <span>500</span>
              </div>
            </div>
            {([
              { key: "functies" as const, label: "Functiegroepen", opts: FUNCTIE_OPTS },
              { key: "berichttypes" as const, label: "Berichttypes", opts: BERICHT_OPTS },
              { key: "categorieen" as const, label: "Categorieën", opts: CATEGORIE_OPTS },
            ]).map(({ key, label, opts }) => {
              const sel = addForm[key];
              const isEmpty = sel.length === 0;
              return (
                <div key={key}>
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <div className={cn("mt-1 rounded-md border p-2 space-y-1 max-h-44 overflow-y-auto", isEmpty ? "border-destructive" : "border-border")}>
                    <div className="flex items-center justify-between pb-1 border-b border-border mb-1">
                      <span className="text-[10px] text-muted-foreground">{sel.length} van {opts.length} geselecteerd</span>
                      <button
                        type="button"
                        className="text-[10px] text-primary hover:underline"
                        onClick={() => setAddForm((f) => ({ ...f, [key]: sel.length === opts.length ? [] : [...opts] }))}
                      >
                        {sel.length === opts.length ? "Alles uit" : "Alles aan"}
                      </button>
                    </div>
                    {opts.map((o) => (
                      <label key={o} className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-accent cursor-pointer text-sm">
                        <Checkbox
                          checked={sel.includes(o)}
                          onCheckedChange={() => setAddForm((f) => ({ ...f, [key]: toggle(f[key], o) }))}
                        />
                        <span>{o}</span>
                      </label>
                    ))}
                  </div>
                  {isEmpty && (
                    <p className="mt-1 text-xs text-destructive font-medium">Selecteer minimaal één optie.</p>
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Annuleren</Button>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1"
              disabled={
                !addForm.date ||
                addForm.functies.length === 0 ||
                addForm.berichttypes.length === 0 ||
                addForm.categorieen.length === 0
              }
              onClick={() => saveAdd()}
            >
              <Plus className="h-4 w-4" /> Toevoegen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move confirm dialog */}
      <Dialog open={!!pendingMove} onOpenChange={(o) => { if (!o) setPendingMove(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Bericht verplaatsen</DialogTitle>
          </DialogHeader>
          {pendingMove && (
            <div className="py-2 text-sm text-foreground">
              Je verplaatst <span className="font-semibold">{pendingMove.count}</span>{" "}
              <span className="font-semibold">{pendingMove.functie}</span>{" "}
              bericht{pendingMove.count === 1 ? "" : "en"} van{" "}
              <span className="font-semibold capitalize">{format(pendingMove.from, "EEEE d MMMM", { locale: nl })}</span>{" "}
              naar{" "}
              <span className="font-semibold capitalize">{format(pendingMove.to, "EEEE d MMMM", { locale: nl })}</span>.
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="icon" onClick={() => setPendingMove(null)} aria-label="Annuleren">
              <X className="h-4 w-4" />
            </Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1" onClick={confirmMove}>
              <Check className="h-4 w-4" /> Akkoord
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verzendtijd warning dialog */}
      <Dialog open={!!timeWarning} onOpenChange={(o) => { if (!o) setTimeWarning(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Verzendmoment verplaatst</DialogTitle>
          </DialogHeader>
          <div className="py-2 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              <span className="font-semibold">Let op!</span> Je verplaatst de verzendtijd naar{" "}
              <span className="font-semibold">{timeWarning}</span>, buiten de standaard werktijden (08:00 – 18:00).
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="icon" onClick={() => setTimeWarning(null)} aria-label="Annuleren">
              <X className="h-4 w-4" />
            </Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1" onClick={() => { if (timeWarning) setVerzendtijd(timeWarning); setTimeWarning(null); }}>
              <Check className="h-4 w-4" /> Akkoord
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit verzendtijd warning dialog */}
      <Dialog open={!!editTimeWarning} onOpenChange={(o) => { if (!o) setEditTimeWarning(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Verzendmoment verplaatst</DialogTitle>
          </DialogHeader>
          <div className="py-2 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              <span className="font-semibold">Let op!</span> Je verplaatst de verzendtijd naar{" "}
              <span className="font-semibold">{editTimeWarning}</span>, buiten de standaard werktijden (08:00 – 18:00).
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="icon" onClick={() => setEditTimeWarning(null)} aria-label="Annuleren">
              <X className="h-4 w-4" />
            </Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1" onClick={() => { if (editTimeWarning) saveEdit(editTimeWarning); setEditTimeWarning(null); }}>
              <Check className="h-4 w-4" /> Akkoord
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contactenlijst dialog */}
      <Dialog open={!!contactDialog} onOpenChange={(o) => { if (!o) setContactDialog(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{contactDialog?.title}</DialogTitle>
            {contactDialog?.subtitle && (
              <p className="text-xs text-muted-foreground capitalize">{contactDialog.subtitle} · {contactDialog.contacts.length} contactpersonen</p>
            )}
          </DialogHeader>
          <div className="overflow-y-auto -mx-2 px-2">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background border-b border-border">
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-2 font-medium">Naam</th>
                  <th className="py-2 pr-2 font-medium">Functie</th>
                  <th className="py-2 pr-2 font-medium">Categorie</th>
                  <th className="py-2 pr-2 font-medium">Status</th>
                  <th className="py-2 pr-2 font-medium">Telefoon</th>
                  <th className="py-2 pr-2 font-medium">Email</th>
                </tr>
              </thead>
              <tbody>
                {contactDialog?.contacts.map((c, i) => {
                  const sMeta = STATUS_META[c.status];
                  return (
                    <tr key={i} className="border-b border-border/60 hover:bg-muted/40">
                      <td className="py-2 pr-2 font-medium text-foreground">{c.name}</td>
                      <td className="py-2 pr-2 text-muted-foreground">{c.functie}</td>
                      <td className="py-2 pr-2">
                        <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">{c.categorie}</span>
                      </td>
                      <td className="py-2 pr-2">
                        <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold", sMeta.bg, sMeta.text)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", sMeta.dot)} />
                          {sMeta.label}
                        </span>
                      </td>
                      <td className="py-2 pr-2 text-muted-foreground tabular-nums whitespace-nowrap">
                        <a href={`tel:${c.telefoon.replace(/\s/g, "")}`} className="hover:text-primary inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {c.telefoon}
                        </a>
                      </td>
                      <td className="py-2 pr-2 text-muted-foreground">
                        <a href={`mailto:${c.email}`} className="hover:text-primary inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {c.email}
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default PlanningTab;
