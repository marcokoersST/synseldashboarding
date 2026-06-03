import { useState } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { CalendarIcon, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  /** Called when user wants to keep changes applied immediately (just closes). */
  onApplyNow: () => void;
  /** Called when user picks a future date — caller should revert current value and save pending. */
  onSchedule: (date: Date) => void;
}

export function ChangeScheduler({ onApplyNow, onSchedule }: Props) {
  const [mode, setMode] = useState<"now" | "later">("now");
  const [date, setDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="border-t border-border mt-2 pt-2 space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Wanneer toepassen?
      </p>
      <div className="grid grid-cols-2 gap-1">
        <Button
          size="sm"
          type="button"
          variant={mode === "now" ? "default" : "outline"}
          className="h-7 text-xs gap-1"
          onClick={() => setMode("now")}
        >
          <Check className="h-3 w-3" /> Direct
        </Button>
        <Button
          size="sm"
          type="button"
          variant={mode === "later" ? "default" : "outline"}
          className="h-7 text-xs gap-1"
          onClick={() => setMode("later")}
        >
          <Clock className="h-3 w-3" /> Vanaf datum
        </Button>
      </div>
      {mode === "later" && (
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-full h-7 text-xs justify-start gap-2",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="h-3 w-3" />
              {date ? format(date, "EEE d MMM yyyy", { locale: nl }) : "Kies een datum"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                setDate(d ?? undefined);
                setCalendarOpen(false);
              }}
              disabled={(d) => {
                const t = new Date();
                t.setHours(0, 0, 0, 0);
                return d < t;
              }}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      )}
      <Button
        size="sm"
        type="button"
        className="w-full h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-white gap-1"
        disabled={mode === "later" && !date}
        onClick={() => {
          if (mode === "now") onApplyNow();
          else if (date) onSchedule(date);
        }}
      >
        {mode === "now" ? "Toepassen" : "Inplannen"}
      </Button>
    </div>
  );
}

interface BadgeProps {
  label: string;
  date: Date;
  onCancel?: () => void;
}

export function PendingChangeBadge({ label, date, onCancel }: BadgeProps) {
  return (
    <div className="mt-1.5 flex items-center gap-1 rounded bg-amber-100 dark:bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:text-amber-300">
      <Clock className="h-2.5 w-2.5 shrink-0" />
      <span className="truncate">
        Gepland: <span className="font-semibold">{label}</span> · {format(date, "d MMM", { locale: nl })}
      </span>
      {onCancel && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          className="ml-auto text-amber-900/70 hover:text-amber-900 dark:text-amber-200/70 dark:hover:text-amber-100"
          aria-label="Geplande wijziging verwijderen"
        >
          ×
        </button>
      )}
    </div>
  );
}
