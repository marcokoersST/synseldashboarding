import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { mixSliderConstants } from "@/data/funnelQualityData";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const C = mixSliderConstants;

export function MixSlider() {
  const [nieuw, setNieuw] = useState(C.defaultNieuw);
  const [react, setReact] = useState(C.defaultReact);

  const expected = useMemo(() => {
    return Math.round((nieuw * C.conversionNieuw + react * C.conversionHeractivering));
  }, [nieuw, react]);

  // Baseline: defaults
  const baseline = Math.round(C.defaultNieuw * C.conversionNieuw + C.defaultReact * C.conversionHeractivering);
  const diff = expected - baseline;

  // Sensitivity: what if +200 nieuwe?
  const sensitivity = Math.round(200 * C.conversionNieuw);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium">Nieuwe kandidaten / mnd</span>
            <span className="tabular-nums font-bold text-emerald-600">{nieuw.toLocaleString("nl-NL")}</span>
          </div>
          <Slider value={[nieuw]} min={C.minNieuw} max={C.maxNieuw} step={50} onValueChange={([v]) => setNieuw(v)} />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium">Heractiveringen / mnd</span>
            <span className="tabular-nums font-bold text-orange-600">{react.toLocaleString("nl-NL")}</span>
          </div>
          <Slider value={[react]} min={C.minReact} max={C.maxReact} step={50} onValueChange={([v]) => setReact(v)} />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <p className="text-xs text-muted-foreground">Verwachte plaatsingen / mnd</p>
        <div className="flex items-baseline gap-3 mt-1">
          <span className="text-3xl font-bold tabular-nums">{expected}</span>
          <span className={cn(
            "inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5",
            diff >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
          )}>
            {diff >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {diff >= 0 ? "+" : ""}{diff} vs baseline
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Conversies (vast): nieuw {(C.conversionNieuw * 100).toFixed(0)}% · heractivering {(C.conversionHeractivering * 100).toFixed(0)}%
        </p>
      </div>

      <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Gevoeligheid:</span> +200 nieuwe kandidaten/mnd ≈ <span className="font-semibold text-emerald-600">+{sensitivity} plaatsingen/mnd</span>.
      </div>
    </div>
  );
}
