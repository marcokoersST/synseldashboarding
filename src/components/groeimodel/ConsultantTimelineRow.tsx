import { LineChart, Line, ResponsiveContainer, ReferenceLine } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  ConsultantLifecycle,
  BreakEvenResult,
  formatDate,
  formatEuro,
  getStatus,
} from "@/data/groeimodelData";

interface Props {
  lifecycle: ConsultantLifecycle;
  result: BreakEvenResult;
}

export function ConsultantTimelineRow({ lifecycle, result }: Props) {
  const status = getStatus(lifecycle, result);
  const sparkData = result.cumulativeSeries.map((s) => ({ month: s.month, balance: s.balance }));

  const statusBadge = {
    startup: { label: "Opstart", className: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
    profitable: { label: "Winstgevend", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
    terminated: { label: "Uit dienst", className: "bg-muted text-muted-foreground border-border" },
  }[status];

  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={lifecycle.avatar} />
            <AvatarFallback>{lifecycle.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">{lifecycle.name}</div>
            <div className="text-xs text-muted-foreground">{lifecycle.role}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lifecycle.unitColor }} />
          <span className="text-sm">{lifecycle.unit}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDate(lifecycle.startDate)}
        {lifecycle.endDate && <div className="text-xs">→ {formatDate(lifecycle.endDate)}</div>}
      </td>
      <td className="px-4 py-3 w-32">
        <div className="h-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="2 2" />
              <Line
                type="monotone"
                dataKey="balance"
                stroke={lifecycle.unitColor}
                strokeWidth={1.8}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-destructive">
        {formatEuro(result.startupCost)}
      </td>
      <td className="px-4 py-3 text-sm">
        {result.breakEvenMonth !== null ? (
          <span className="font-semibold">M{result.breakEvenMonth}</span>
        ) : (
          <span className="text-muted-foreground">Nog niet</span>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={cn("font-normal", statusBadge.className)}>
          {statusBadge.label}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm font-medium">
        <span className={cn(result.profitSinceBreakEven > 0 ? "text-emerald-600" : "text-muted-foreground")}>
          {result.breakEvenMonth !== null ? formatEuro(result.profitSinceBreakEven) : "—"}
        </span>
      </td>
    </tr>
  );
}
