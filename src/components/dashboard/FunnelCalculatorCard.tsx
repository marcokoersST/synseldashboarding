import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { ArrowRight } from "lucide-react";

const STEPS = ["Inschrijvingen", "Intakes", "Acquisities", "Uitnodigingen", "Gesprekken", "Plaatsingen"] as const;

// Conversion rate FROM step[i] TO step[i+1]
const CONVERSIONS = [0.62, 0.78, 0.63, 0.72, 0.22];

// Current funnel data
const CURRENT = [65, 40, 51, 32, 23, 5];

type GoalRow = (number | null)[];

function recalcLeft(goals: GoalRow, changedIndex: number): GoalRow {
  const next = [...goals];
  // Back-calculate leftward from changedIndex
  for (let i = changedIndex - 1; i >= 0; i--) {
    const rightVal = next[i + 1];
    if (rightVal == null) break;
    if (i === 0 && changedIndex > 0) {
      // Intakes is a forward calc from Inschrijvingen, but here we need Inschrijvingen from Intakes
      // Step 0→1 conv = 0.62, so Inschrijvingen = Intakes / 0.62
      next[i] = Math.ceil(rightVal / CONVERSIONS[i]);
    } else {
      next[i] = Math.ceil(rightVal / CONVERSIONS[i]);
    }
  }
  // Forward-calculate Intakes if Inschrijvingen changed and index was 0
  // Actually: Intakes is step index 1, conv from 0→1
  // If user changed index 0, recalc 1 forward
  if (changedIndex === 0 && next[0] != null) {
    next[1] = Math.ceil(next[0] * CONVERSIONS[0]);
  }
  return next;
}

interface FunnelCalculatorCardProps {
  delay?: number;
}

export function FunnelCalculatorCard({ delay = 0 }: FunnelCalculatorCardProps) {
  const [goals, setGoals] = useState<GoalRow>([null, null, null, null, null, null]);

  const handleChange = useCallback((index: number, value: string) => {
    const num = value === "" ? null : Math.max(0, Math.round(Number(value)));
    if (value !== "" && isNaN(Number(value))) return;

    const newGoals: GoalRow = [...goals];
    newGoals[index] = num;

    if (num != null) {
      // Back-calculate everything to the left
      for (let i = index - 1; i >= 0; i--) {
        const rightVal = newGoals[i + 1];
        if (rightVal == null) break;
        newGoals[i] = Math.ceil(rightVal / CONVERSIONS[i]);
      }
      // Forward-calculate Intakes when Inschrijvingen is the input
      if (index === 0) {
        newGoals[1] = Math.ceil(num * CONVERSIONS[0]);
      }
    }

    setGoals(newGoals);
  }, [goals]);

  return (
    <AnimatedCard delay={delay}>
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Wervingstrechter Calculator</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-muted-foreground font-medium pr-3 py-1.5 w-[100px]" />
                  {STEPS.map((step, i) => (
                    <th key={step} className="text-center font-medium text-foreground py-1.5 px-1">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs">{step}</span>
                        {i < STEPS.length - 1 && (
                          <div className="flex items-center text-muted-foreground ml-1">
                            <ArrowRight className="w-3 h-3" />
                            <span className="text-[10px] text-muted-foreground/70 ml-0.5">
                              {(CONVERSIONS[i] * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Row 1: Conversions */}
                <tr className="border-t border-border/50">
                  <td className="text-xs text-muted-foreground font-medium pr-3 py-2">Jouw conversie</td>
                  {STEPS.map((step, i) => (
                    <td key={step} className="text-center py-2 px-1">
                      {i > 0 && (
                        <span className={cn(
                          "text-xs font-semibold tabular-nums",
                          CONVERSIONS[i - 1] >= 0.5 ? "text-accent" : CONVERSIONS[i - 1] >= 0.3 ? "text-foreground" : "text-destructive"
                        )}>
                          {(CONVERSIONS[i - 1] * 100).toFixed(0)}%
                        </span>
                      )}
                      {i === 0 && <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                  ))}
                </tr>
                {/* Row 2: Current */}
                <tr className="border-t border-border/50">
                  <td className="text-xs text-muted-foreground font-medium pr-3 py-2">Jouw funnel</td>
                  {CURRENT.map((val, i) => (
                    <td key={i} className="text-center py-2 px-1">
                      <span className="text-xs font-semibold tabular-nums text-foreground">{val}</span>
                    </td>
                  ))}
                </tr>
                {/* Row 3: Goal input */}
                <tr className="border-t border-border/50">
                  <td className="text-xs text-muted-foreground font-medium pr-3 py-2">Doel</td>
                  {STEPS.map((step, i) => {
                    const isCalculated = goals[i] != null && document.activeElement?.getAttribute("data-idx") !== String(i);
                    return (
                      <td key={step} className="text-center py-2 px-1">
                        <Input
                          data-idx={i}
                          type="number"
                          min={0}
                          className={cn(
                            "h-7 w-16 mx-auto text-center text-xs tabular-nums",
                            goals[i] != null && "font-semibold"
                          )}
                          placeholder="—"
                          value={goals[i] ?? ""}
                          onChange={(e) => handleChange(i, e.target.value)}
                        />
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}