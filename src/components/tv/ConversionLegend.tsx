import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FormulaRow {
  group: string;
  label: string;
  formula: string;
  benchmark: string;
}

const conversionFormulas: FormulaRow[] = [
  { group: "1. Inschrijvingen", label: "#", formula: "Ingeschreven / Toegewezen", benchmark: "≥ 75%" },
  { group: "2. Acquisitie", label: "#", formula: "Acquisities / Ingeschreven", benchmark: "≥ 35%" },
  { group: "2. Acquisitie", label: "Acq. ratio", formula: "Acquisities / Toegewezen", benchmark: "≥ 25%" },
  { group: "3. Voorstellen", label: "#", formula: "Voorstellen via email / Ingeschreven", benchmark: "≥ 40%" },
  { group: "4. Uitnodigingen", label: "#", formula: "Uitnodigingen totaal / Acquisities", benchmark: "≥ 60%" },
  { group: "5. Gesprekken", label: "#", formula: "1e gesprek / Acquisities", benchmark: "≥ 50%" },
  { group: "6. Vervolg", label: "#", formula: "Wel 1e gesprek / Vervolg gesprek", benchmark: "≥ 70%" },
  { group: "7. Geplaatst", label: "#", formula: "Geplaatst / Ingeschreven", benchmark: "≥ 15%" },
  { group: "7. Geplaatst", label: "Hit rate", formula: "Geplaatst / Toegewezen", benchmark: "≥ 10%" },
];

export { conversionFormulas };
export type { FormulaRow };

export function ConversionLegendPopover({ compact }: { compact?: boolean }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
            compact ? "w-5 h-5" : "w-6 h-6"
          )}
          aria-label="Conversieformules"
        >
          <Info className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[420px] p-4 bg-card border border-border z-50"
        align="start"
        sideOffset={8}
      >
        <h4 className="font-semibold text-sm text-foreground mb-3">Conversieformules & Benchmarks</h4>
        <div className="space-y-1.5">
          {conversionFormulas.map((f, i) => (
            <div key={i} className="grid grid-cols-[120px_1fr_60px] gap-2 items-center text-xs">
              <span className="text-muted-foreground truncate">{f.group}</span>
              <span className="font-medium text-foreground">{f.formula}</span>
              <span className="text-right font-bold text-accent">{f.benchmark}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-border flex gap-4 text-[10px] text-muted-foreground">
          <span><span className="inline-block w-2 h-2 rounded-full bg-accent mr-1" />≥ benchmark</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-foreground mr-1" />40-69%</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-destructive mr-1" />&lt; 40%</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
