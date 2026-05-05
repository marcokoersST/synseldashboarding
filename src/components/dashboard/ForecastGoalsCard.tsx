import { useState, useRef, useEffect } from "react";
import { Target, Pencil, Sparkles, Plus, ChevronDown } from "lucide-react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { useForecastGoals } from "@/contexts/ForecastGoalsContext";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ForecastGoalsCardProps {
  delay?: number;
}

type GoalField = 'revenue' | 'placements' | 'interviews';

interface EditableFieldProps {
  label: string;
  value: number;
  isCalculated: boolean;
  prefix?: string;
  suffix?: string;
  onEdit: (value: number) => void;
  formatValue: (value: number) => string;
}

function EditableField({ label, value, isCalculated, prefix, suffix, onEdit, formatValue }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString());
    }
  }, [value, isEditing]);

  const handleSubmit = () => {
    const parsed = parseFloat(inputValue.replace(/[^0-9.,]/g, '').replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) {
      onEdit(parsed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setInputValue(value.toString());
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center justify-between py-2 group/field">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {isCalculated && (
          <Sparkles className="w-3 h-3 text-primary/60" />
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {isEditing ? (
          <div className="flex items-center gap-1">
            {prefix && <span className="text-sm text-muted-foreground">{prefix}</span>}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleSubmit}
              onKeyDown={handleKeyDown}
              className="w-20 px-2 py-1 text-sm text-right bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded transition-colors",
              "hover:bg-muted/50",
              isCalculated ? "text-muted-foreground" : "text-foreground font-medium"
            )}
          >
            <span className="text-sm">
              {prefix}{formatValue(value)}{suffix}
            </span>
            <Pencil className="w-3 h-3 opacity-0 group-hover/field:opacity-50 transition-opacity" />
          </button>
        )}
      </div>
    </div>
  );
}

export function ForecastGoalsCard({ delay = 0 }: ForecastGoalsCardProps) {
  const { calculatedValues, lastEditedField, setGoal, hasGoals } = useForecastGoals();
  const [isOpen, setIsOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('nl-NL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value);
  };

  // Collapsed view when goals are set
  if (hasGoals && !isOpen) {
    return (
      <AnimatedCard delay={delay}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-card rounded-lg px-3 py-2 border border-border flex items-center gap-2 hover:bg-muted/50 transition-colors"
        >
          <Target className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">
            €{formatCurrency(calculatedValues.revenue)}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            {formatNumber(calculatedValues.placements)} pl.
          </span>
          <ChevronDown className="w-3 h-3 text-muted-foreground ml-1" />
        </button>
      </AnimatedCard>
    );
  }

  // Collapsed view when no goals are set
  if (!hasGoals && !isOpen) {
    return (
      <AnimatedCard delay={delay}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-card rounded-lg px-3 py-2 border border-border flex items-center gap-2 hover:bg-muted/50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">Forecast doelen</span>
        </button>
      </AnimatedCard>
    );
  }

  // Expanded view
  return (
    <AnimatedCard delay={delay}>
      <WatZieIkHier
        what="Je doelen voor deze periode in omzet, plaatsingen en gesprekken. Velden zijn aanpasbaar; andere velden worden automatisch berekend."
        insight="Stel één doel in (bijv. omzet) en zie meteen hoeveel plaatsingen en gesprekken je daar voor nodig hebt."
      />
      <div className="bg-card rounded-xl p-4 border border-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Forecast Doelen</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded hover:bg-muted/50 transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground rotate-180" />
          </button>
        </div>

        {/* Goal Fields */}
        <div className="divide-y divide-border/50">
          <EditableField
            label="Omzet"
            value={calculatedValues.revenue}
            isCalculated={hasGoals && lastEditedField !== 'revenue'}
            prefix="€ "
            onEdit={(value) => setGoal('revenue', value)}
            formatValue={formatCurrency}
          />
          <EditableField
            label="Plaatsingen"
            value={calculatedValues.placements}
            isCalculated={hasGoals && lastEditedField !== 'placements'}
            onEdit={(value) => setGoal('placements', value)}
            formatValue={formatNumber}
          />
          <EditableField
            label="Gesprekken"
            value={calculatedValues.interviews}
            isCalculated={hasGoals && lastEditedField !== 'interviews'}
            onEdit={(value) => setGoal('interviews', value)}
            formatValue={formatNumber}
          />
        </div>

        {/* AI Calculated Label */}
        {hasGoals && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3 text-primary/60" />
            <span>Overige waarden automatisch berekend</span>
          </div>
        )}

        {!hasGoals && (
          <div className="mt-3 text-xs text-muted-foreground">
            Klik op een waarde om je doel in te stellen
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}
