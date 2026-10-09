import { useState } from "react";
import { Filter, Plus, Trash2, X } from "lucide-react";
import { Badge } from "@/marketing-dashboard/components/ui/badge";
import { Button } from "@/marketing-dashboard/components/ui/button";
import { Input } from "@/marketing-dashboard/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/marketing-dashboard/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/marketing-dashboard/components/ui/select";
import {
  marketingFilterLabels,
  marketingOperatorLabels,
  type MarketingFilterField,
  type MarketingFilterOperator,
  type MarketingFilterRule,
} from "@/marketing-dashboard/lib/marketingFilters";

interface Props {
  filters: MarketingFilterRule[];
  onChange: (filters: MarketingFilterRule[]) => void;
}

const fields = Object.entries(marketingFilterLabels) as [MarketingFilterField, string][];
const operators = Object.entries(marketingOperatorLabels) as [MarketingFilterOperator, string][];

const newRule = (): MarketingFilterRule => ({
  id: crypto.randomUUID(),
  field: "unit",
  operator: "bevat",
  value: "",
});

export default function MarketingFilterPanel({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<MarketingFilterRule[]>(filters.length ? filters : [newRule()]);

  const handleOpen = (nextOpen: boolean) => {
    if (nextOpen) setDraft(filters.length ? filters : [newRule()]);
    setOpen(nextOpen);
  };

  const updateRule = (id: string, patch: Partial<MarketingFilterRule>) => {
    setDraft((current) => current.map((rule) => rule.id === id ? { ...rule, ...patch } : rule));
  };

  const apply = () => {
    onChange(draft.filter((rule) => rule.value.trim()));
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={open} onOpenChange={handleOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-10 gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {filters.length > 0 && <Badge variant="secondary" className="h-5 min-w-5 justify-center px-1.5">{filters.length}</Badge>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(94vw,760px)] p-4" align="end">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Filters</p>
              <p className="text-xs text-muted-foreground">Scheid meerdere waarden met een komma.</p>
            </div>
            {filters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => { onChange([]); setDraft([newRule()]); setOpen(false); }}>
                Alles wissen
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {draft.map((rule) => (
              <div key={rule.id} className="grid grid-cols-[1fr_1fr_minmax(180px,2fr)_36px] gap-2">
                <Select value={rule.field} onValueChange={(field) => updateRule(rule.id, { field: field as MarketingFilterField })}>
                  <SelectTrigger aria-label="Filterveld"><SelectValue /></SelectTrigger>
                  <SelectContent>{fields.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={rule.operator} onValueChange={(operator) => updateRule(rule.id, { operator: operator as MarketingFilterOperator })}>
                  <SelectTrigger aria-label="Vergelijking"><SelectValue /></SelectTrigger>
                  <SelectContent>{operators.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                </Select>
                <Input
                  value={rule.value}
                  onChange={(event) => updateRule(rule.id, { value: event.target.value })}
                  onKeyDown={(event) => { if (event.key === "Enter") apply(); }}
                  placeholder={rule.field === "unit" ? "bijv. monteurs, engineers" : "Typ een waarde"}
                  aria-label="Filterwaarde"
                />
                <Button variant="ghost" size="icon" aria-label="Verwijder filterregel" onClick={() => setDraft((current) => current.length === 1 ? [newRule()] : current.filter((item) => item.id !== rule.id))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <Button variant="ghost" size="sm" onClick={() => setDraft((current) => [...current, newRule()])}>
              <Plus className="mr-1.5 h-4 w-4" />Regel toevoegen
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Annuleren</Button>
              <Button size="sm" onClick={apply}>Toepassen</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {filters.map((filter) => (
        <Badge key={filter.id} variant="secondary" className="h-8 gap-1.5 pl-2.5 pr-1.5">
          <span>{marketingFilterLabels[filter.field]} {marketingOperatorLabels[filter.operator]} {filter.value}</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" aria-label={`Verwijder filter ${marketingFilterLabels[filter.field]}`} onClick={() => onChange(filters.filter((item) => item.id !== filter.id))}>
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  );
}