import { useState } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { CalendarIcon, Info, Pencil } from "lucide-react";
import type { DateRange } from "react-day-picker-v9";
import { Button } from "@/marketing-dashboard/components/ui/button";
import { Calendar } from "@/marketing-dashboard/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/marketing-dashboard/components/ui/dialog";
import { Input } from "@/marketing-dashboard/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/marketing-dashboard/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/marketing-dashboard/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/marketing-dashboard/components/ui/tooltip";
import { cn } from "@/marketing-dashboard/lib/utils";
import type { ManualSpendSetting, SpendPeriod } from "@/marketing-dashboard/lib/manualSpend";

export const INDEED_DISCOUNT_INFO = "De spend is inclusief 14,16% korting.";

interface EditableSpendCellProps {
  spend: number;
  manualSpend: ManualSpendSetting | undefined;
  dateRange: DateRange;
  onSave: (value: ManualSpendSetting) => void;
  info?: string | undefined;
  children: React.ReactNode;
}

function toDateInput(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function parseDateInput(value: string): Date {
  const parts = value.split("-").map(Number);
  return new Date(parts[0] ?? 1970, (parts[1] ?? 1) - 1, parts[2] ?? 1);
}

const EditableSpendCell = ({ spend, manualSpend, dateRange, onSave, info, children }: EditableSpendCellProps) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [period, setPeriod] = useState<SpendPeriod>("day");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");

  const isMissing = spend === 0 && manualSpend === undefined;

  const startEditing = () => {
    setInputValue(manualSpend ? String(manualSpend.amount).replace(".", ",") : "");
    setPeriod(manualSpend?.period ?? "day");
    setValidFrom(manualSpend?.validFrom ?? (dateRange.from ? toDateInput(dateRange.from) : ""));
    setValidTo(manualSpend?.validTo ?? (dateRange.to ? toDateInput(dateRange.to) : ""));
    setOpen(true);
  };

  const commit = () => {
    const parsed = parseFloat(inputValue.replace(",", "."));
    if (!Number.isNaN(parsed) && parsed >= 0 && validFrom && validTo && validFrom <= validTo) {
      onSave({ amount: parsed, period, validFrom, validTo });
      setOpen(false);
    }
  };

  const DateField = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start font-normal", !value && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(parseDateInput(value), "d MMM yyyy", { locale: nl }) : "Kies datum"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value ? parseDateInput(value) : undefined} onSelect={(date) => date && onChange(toDateInput(date))} initialFocus className="pointer-events-auto p-3" />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className="inline-flex items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
      {isMissing ? (
        <Button variant="outline" size="sm" onClick={startEditing} className="h-7 border-destructive/30 px-2 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive">
          In te vullen
        </Button>
      ) : (
        <>
          {children}
          {info && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="inline-flex h-4 w-4 cursor-help items-center justify-center text-muted-foreground"
                    aria-label={info}
                    tabIndex={0}
                  >
                    <Info className="h-3.5 w-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-56 text-xs">{info}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {manualSpend && (
            <Button variant="ghost" size="icon" onClick={startEditing} className="h-6 w-6 text-muted-foreground" aria-label="Handmatig bedrag aanpassen" title="Handmatig bedrag aanpassen">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Handmatig bedrag</DialogTitle>
            <DialogDescription>Geef het bedrag, de frequentie en de periode waarin dit bedrag geldt.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-[1fr_150px] gap-3">
              <div className="space-y-1.5">
                <label htmlFor="manual-spend-amount" className="text-sm font-medium">Bedrag</label>
                <Input id="manual-spend-amount" inputMode="decimal" value={inputValue} onChange={(event) => setInputValue(event.target.value)} placeholder="€ 0,00" autoFocus />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Geldt per</label>
                <Select value={period} onValueChange={(value) => setPeriod(value as SpendPeriod)}>
                  <SelectTrigger aria-label="Bedrag geldt per"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="day">Per dag</SelectItem><SelectItem value="month">Per maand</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DateField label="Van" value={validFrom} onChange={setValidFrom} />
              <DateField label="Tot en met" value={validTo} onChange={setValidTo} />
            </div>
            {validFrom && validTo && validFrom > validTo && <p className="text-sm text-destructive">De einddatum moet na de begindatum liggen.</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuleren</Button>
            <Button onClick={commit} disabled={!inputValue || !validFrom || !validTo || validFrom > validTo}>Opslaan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditableSpendCell;
