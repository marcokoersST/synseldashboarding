import { Info, Percent, Target, Crosshair, Clock, type LucideIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import React from "react";

interface FormulaRow {
  group: string;
  label: string;
  formula: string;
  benchmark: string;
  icon: LucideIcon;
}

/** Map of conversion label → icon component */
const conversionIconMap: Record<string, LucideIcon> = {
  "#": Percent,
  "Acq. ratio": Target,
  "Hit rate": Crosshair,
  "Gem. dagen": Clock,
};

function getConversionIcon(label: string): LucideIcon | undefined {
  return conversionIconMap[label];
}

const conversionFormulas: FormulaRow[] = [
  { group: "1. Inschrijvingen", label: "#", formula: "Ingeschreven / Toegewezen", benchmark: "≥ 75%", icon: Percent },
  { group: "2. Acquisitie", label: "#", formula: "Acquisities / Ingeschreven", benchmark: "≥ 35%", icon: Percent },
  { group: "2. Acquisitie", label: "Acq. ratio", formula: "Acquisities / Toegewezen", benchmark: "≥ 25%", icon: Target },
  { group: "3. Voorstellen", label: "#", formula: "Voorstellen via email / Ingeschreven", benchmark: "≥ 40%", icon: Percent },
  { group: "4. Uitnodigingen", label: "#", formula: "Uitnodigingen totaal / Acquisities", benchmark: "≥ 60%", icon: Percent },
  { group: "5. Gesprekken", label: "#", formula: "1e gesprek / Acquisities", benchmark: "≥ 50%", icon: Percent },
  { group: "6. Vervolg", label: "#", formula: "Wel 1e gesprek / Vervolg gesprek", benchmark: "≥ 70%", icon: Percent },
  { group: "7. Geplaatst", label: "#", formula: "Geplaatst / Ingeschreven", benchmark: "≥ 15%", icon: Percent },
  { group: "7. Geplaatst", label: "Hit rate", formula: "Geplaatst / Toegewezen", benchmark: "≥ 10%", icon: Crosshair },
];

export { conversionFormulas, conversionIconMap, getConversionIcon };
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
        className="w-[440px] p-4 bg-card border border-border z-50"
        align="start"
        sideOffset={8}
      >
        <h4 className="font-semibold text-sm text-foreground mb-3">Conversieformules & Benchmarks</h4>
        <div className="space-y-1.5">
          {conversionFormulas.map((f, i) => {
            const IconComp = f.icon;
            return (
              <div key={i} className="grid grid-cols-[16px_120px_1fr_60px] gap-2 items-center text-xs">
                <IconComp className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground truncate">{f.group}</span>
                <span className="font-medium text-foreground">{f.formula}</span>
                <span className="text-right font-bold text-accent">{f.benchmark}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-2 border-t border-border">
          <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground mb-2">
            <span><span className="inline-block w-2 h-2 rounded-full bg-accent mr-1" />≥ benchmark</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-foreground mr-1" />40-69%</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-destructive mr-1" />&lt; 40%</span>
          </div>
          <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Percent className="w-2.5 h-2.5" /> Stap-conversie</span>
            <span className="flex items-center gap-1"><Target className="w-2.5 h-2.5" /> Acquisitie ratio</span>
            <span className="flex items-center gap-1"><Crosshair className="w-2.5 h-2.5" /> Hit rate</span>
            <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Dagen</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
