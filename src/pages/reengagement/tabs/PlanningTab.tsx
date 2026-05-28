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
import { ChevronLeft, ChevronRight, Mail, Smartphone, Settings, Plus, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Status = "concept" | "gepland" | "verzonden";

interface PlanItem {
  id: string;
  date: Date;
  title: string;
  status: Status;
  channel: "app" | "mail";
}

const STATUS_META: Record<Status, { label: string; dot: string; bg: string; text: string }> = {
  concept: { label: "Concept", dot: "bg-muted-foreground", bg: "bg-muted", text: "text-muted-foreground" },
  gepland: { label: "Gepland", dot: "bg-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-300" },
  verzonden: { label: "Verzonden", dot: "bg-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-300" },
};

const WEEKDAYS = ["Maa", "Di", "Wo", "Do", "Vr", "Zat", "Zon"];

function buildMockItems(monthDate: Date): PlanItem[] {
  const base = startOfMonth(monthDate);
  return [
    { id: "1", date: addDays(base, 0), title: "Welkom terug", status: "verzonden", channel: "mail" },
    { id: "2", date: addDays(base, 1), title: "Nieuwe vacatures", status: "verzonden", channel: "app" },
    { id: "3", date: addDays(base, 3), title: "Tip van je consultant", status: "gepland", channel: "mail" },
    { id: "4", date: addDays(base, 6), title: "Beschikbaarheid check", status: "gepland", channel: "app" },
    { id: "5", date: addDays(base, 9), title: "CV update herinnering", status: "concept", channel: "mail" },
    { id: "6", date: addDays(base, 13), title: "Maandelijkse nieuwsbrief", status: "gepland", channel: "mail" },
    { id: "7", date: addDays(base, 16), title: "Marktupdate", status: "concept", channel: "app" },
    { id: "8", date: addDays(base, 20), title: "Re-engagement campagne", status: "gepland", channel: "mail" },
    { id: "9", date: addDays(base, 24), title: "Salaris benchmark", status: "concept", channel: "mail" },
  ];
}

type Medium = "App & Mail" | "App" | "Mail";

const PlanningTab = () => {
  const [cursor, setCursor] = useState<Date>(new Date(2026, 4, 1)); // mei 2026
  const [selected, setSelected] = useState<Date | null>(null);

  const [verzendtijd, setVerzendtijd] = useState("11:00");
  const [medium, setMedium] = useState<Medium>("App & Mail");
  const [timeOpen, setTimeOpen] = useState(false);
  const [mediumOpen, setMediumOpen] = useState(false);
  const [tempTime, setTempTime] = useState(verzendtijd);
  const [tempMedium, setTempMedium] = useState<Medium>(medium);

  const items = useMemo(() => buildMockItems(cursor), [cursor]);

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
    items.forEach((i) => c[i.status]++);
    return c;
  }, [items]);

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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <Card className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Medium</p>
                <p className="mt-1 text-2xl font-bold text-foreground whitespace-nowrap">{medium}</p>
              </div>
              <button
                onClick={() => { setTempMedium(medium); setMediumOpen(true); }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Medium aanpassen"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </Card>
          </div>
        </div>

        {/* Calendar card */}
        <Card className="p-4">
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
            <div className="flex items-center gap-4 text-xs">
              {(Object.keys(STATUS_META) as Status[]).map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <span className={cn("h-2 w-2 rounded-full", STATUS_META[s].dot)} />
                  <span className="text-muted-foreground">{STATUS_META[s].label}</span>
                </div>
              ))}
              <Button size="sm" className="h-7 gap-1">
                <Plus className="h-3.5 w-3.5" /> Nieuw
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
              const dayItems = items.filter((i) => isSameDay(i.date, day));
              const isSel = selected && isSameDay(selected, day);
              return (
                <button
                  key={idx}
                  onClick={() => setSelected(day)}
                  className={cn(
                    "min-h-[90px] border-b border-r border-border p-1.5 text-left transition-colors",
                    "hover:bg-muted/50",
                    !inMonth && "bg-muted/20 text-muted-foreground/50",
                    isSel && "ring-2 ring-primary ring-inset",
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
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {dayItems.slice(0, 2).map((it) => (
                      <div
                        key={it.id}
                        className={cn(
                          "truncate rounded px-1.5 py-0.5 text-[10px] font-medium",
                          STATUS_META[it.status].bg,
                          STATUS_META[it.status].text
                        )}
                      >
                        {it.title}
                      </div>
                    ))}
                    {dayItems.length > 2 && (
                      <div className="text-[10px] text-muted-foreground">+{dayItems.length - 2} meer</div>
                    )}
                  </div>
                </button>
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
            <h4 className="text-sm font-semibold">Standaard instellingen</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="rounded-md border border-border p-3 text-left hover:bg-muted/40 transition-colors">
              <p className="text-xs font-medium">Template A</p>
              <p className="text-[10px] text-muted-foreground mt-1">Standaard mail</p>
            </button>
            <button className="rounded-md border border-border p-3 text-left hover:bg-muted/40 transition-colors">
              <p className="text-xs font-medium">Template B</p>
              <p className="text-[10px] text-muted-foreground mt-1">Standaard app</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PlanningTab;
