import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { speedMetrics, workloadData } from "@/data/consultantData";
import { Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const statusColors = { ok: "text-green-600", warning: "text-amber-600", danger: "text-red-500" };

export default function Snelheid() {
  return (
    <ConsultantLayout title="Snelheid & Efficiëntie" subtitle="Tijd is plaatsingskans — meet je snelheid">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {speedMetrics.map((m, i) => (
          <AnimatedCard key={m.label} delay={i * 50}>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                <p className={`text-2xl font-bold ${statusColors[m.status]}`}>{m.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Target: {m.target}</p>
              </CardContent>
            </Card>
          </AnimatedCard>
        ))}
      </div>

      <AnimatedCard delay={200}>
        <Card>
          <CardHeader className="glass-header"><CardTitle className="flex items-center gap-2"><AlertCircle className="w-5 h-5" />Werkdrukmeter</CardTitle></CardHeader>
          <CardContent className="p-4">
            <div className="flex gap-6 mb-4">
              <div className="text-center"><p className="text-3xl font-bold">{workloadData.openTasks}</p><p className="text-xs text-muted-foreground">Open taken</p></div>
              <div className="text-center"><p className="text-3xl font-bold">{workloadData.openProcesses}</p><p className="text-xs text-muted-foreground">Open processen</p></div>
              <div className="text-center"><p className="text-3xl font-bold text-red-500">{workloadData.urgentTasks}</p><p className="text-xs text-muted-foreground">Urgent</p></div>
            </div>
            <div className="space-y-2">
              {workloadData.items.map((item) => (
                <div key={item.task} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <span className="text-sm">{item.task}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{item.count}</span>
                    <Badge variant={item.priority === "high" ? "destructive" : item.priority === "medium" ? "default" : "secondary"} className="text-[10px]">{item.priority}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>
    </ConsultantLayout>
  );
}
