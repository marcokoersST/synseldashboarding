import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/synselBusiness/calc";

export function isoWeek(dateIso: string): number {
  const d = new Date(dateIso + "T00:00:00Z");
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const fday = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - fday + 3);
  return 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));
}

interface LevelHeaderProps {
  level: number;
  gap: number;
  reportDate: string;
}

export function LevelHeader({ level, gap, reportDate }: LevelHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Jouw volgende level: {level}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nog {gap} actieve professionals. Bouw de starts die dat mogelijk maken.
        </p>
      </div>
      <div className="text-right text-xs text-muted-foreground">
        <p>
          Week {isoWeek(reportDate)} · {formatDate(reportDate)}
        </p>
        <p className="text-primary">Voorbeeld van jouw weekstart</p>
      </div>
    </div>
  );
}

interface BridgeItem {
  label: string;
  value: string | number;
  highlight?: boolean;
}

interface BridgeStripProps {
  items: BridgeItem[];
  horizonDate: string;
  note: string;
}

export function PortfolioBridgeStrip({ items, horizonDate, note }: BridgeStripProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-base font-semibold text-foreground">Je portefeuille over 4 weken</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(horizonDate)} · Basisforecast
          </p>
        </div>
        <div className="mt-4 grid divide-border sm:grid-cols-3 lg:grid-cols-5 lg:divide-x">
          {items.map((item) => (
            <div
              key={item.label}
              className={cn("px-4 py-2", item.highlight && "rounded-md bg-primary/10")}
            >
              <p className="text-3xl font-bold text-foreground">{item.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 border-t border-border pt-3 text-xs text-primary">{note}</p>
      </CardContent>
    </Card>
  );
}

export interface WeekAction {
  id: string;
  text: string;
  day: string;
}

export function WeekChecklist({ actions, focus }: { actions: WeekAction[]; focus: string }) {
  const [done, setDone] = useState<string[]>([]);
  const toggle = (id: string) =>
    setDone((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-semibold text-foreground">Dit maakt jouw week</p>
          <p className="text-xs text-muted-foreground">
            {done.length} van {actions.length} gedaan
          </p>
        </div>
        <ul className="mt-4 flex-1 space-y-4">
          {actions.map((a) => (
            <li key={a.id} className="flex items-start gap-3">
              <Checkbox
                id={a.id}
                checked={done.includes(a.id)}
                onCheckedChange={() => toggle(a.id)}
                className="mt-0.5"
              />
              <label htmlFor={a.id} className="cursor-pointer">
                <span
                  className={cn(
                    "block text-sm text-foreground",
                    done.includes(a.id) && "text-muted-foreground line-through",
                  )}
                >
                  {a.text}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{a.day}</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-border pt-3 text-sm text-foreground">
          <span className="text-muted-foreground">Focus deze week</span> {focus}
        </p>
      </CardContent>
    </Card>
  );
}

interface YieldPanelProps {
  actualMargin: string;
  actualBasis: string;
  runRate: string;
  runRateBasis: string;
}

export function PortfolioYieldPanel({
  actualMargin,
  actualBasis,
  runRate,
  runRateBasis,
}: YieldPanelProps) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col p-5">
        <p className="text-base font-semibold text-foreground">Wat je portefeuille oplevert</p>
        <div className="mt-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-foreground">Gerealiseerde brutomarge</p>
              <p className="text-[11px] text-muted-foreground">{actualBasis}</p>
            </div>
            <p className="whitespace-nowrap text-base font-semibold text-foreground">{actualMargin}</p>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-foreground">Jaarlijkse run-rate</p>
              <p className="text-[11px] text-muted-foreground">{runRateBasis}</p>
            </div>
            <p className="whitespace-nowrap text-base font-semibold text-foreground">{runRate}</p>
          </div>
        </div>
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-sm text-primary">Jouw bonus en totaal bruto inkomen</p>
          <p className="mt-1 flex items-center gap-1.5 text-base font-semibold text-foreground">
            <Check className="h-4 w-4 text-muted-foreground" />
            Nog niet berekenbaar
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Goedgekeurde bonusregeling en persoonlijke voorwaarden ontbreken.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
