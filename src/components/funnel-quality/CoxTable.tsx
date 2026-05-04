import { coxModel, type CoxRow } from "@/data/funnelQualityData";
import { cn } from "@/lib/utils";

function pStr(p: number) {
  if (p < 0.0001) return "< 0.0001";
  if (p < 0.001) return p.toExponential(1);
  return p.toFixed(3);
}

function sigClass(p: number) {
  if (p < 0.001) return "text-emerald-600 font-bold";
  if (p < 0.05) return "text-emerald-600 font-medium";
  return "text-muted-foreground";
}

export function CoxTable({ rows = coxModel as CoxRow[] }: { rows?: CoxRow[] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-xs">
        <thead className="bg-muted/40">
          <tr className="text-left">
            <th className="px-3 py-2 font-medium">Covariate</th>
            <th className="px-3 py-2 font-medium text-right">Coef (β)</th>
            <th className="px-3 py-2 font-medium text-right">HR</th>
            <th className="px-3 py-2 font-medium text-right">95% CI</th>
            <th className="px-3 py-2 font-medium text-right">p-value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.covariate} className="border-t border-border hover:bg-muted/20">
              <td className="px-3 py-2">{r.covariate}</td>
              <td className="px-3 py-2 text-right tabular-nums">{r.coef.toFixed(3)}</td>
              <td className="px-3 py-2 text-right tabular-nums font-medium">{r.hr.toFixed(2)}</td>
              <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">[{r.ciLow.toFixed(2)}–{r.ciHigh.toFixed(2)}]</td>
              <td className={cn("px-3 py-2 text-right tabular-nums", sigClass(r.p))}>{pStr(r.p)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
