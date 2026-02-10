import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { deployedStaff, aftercareTasks } from "@/data/consultantData";
import { CheckCircle, Clock } from "lucide-react";

export default function Detavast() {
  return (
    <ConsultantLayout title="Detavast & Retentie" subtitle="Na plaatsing — proeftijd, uren en aftercare">
      <AnimatedCard delay={0} className="mb-4">
        <Card>
          <CardHeader className="glass-header"><CardTitle>Uren richting Overname (1700u)</CardTitle></CardHeader>
          <CardContent className="p-4 space-y-4">
            {deployedStaff.map((s) => {
              const pct = Math.round((s.hoursWorked / s.totalRequired) * 100);
              return (
                <div key={s.name} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium">{s.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">@ {s.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold"><AnimatedNumber value={s.hoursWorked} />u / {s.totalRequired}u</span>
                      {s.proefTijd && <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-600">Proeftijd</Badge>}
                      <Badge variant={s.risk === "low" ? "secondary" : s.risk === "medium" ? "default" : "destructive"} className="text-[10px]">{s.risk}</Badge>
                    </div>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </AnimatedCard>

      <AnimatedCard delay={100}>
        <Card>
          <CardHeader className="glass-header"><CardTitle className="text-base">Aftercare Taken</CardTitle></CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {aftercareTasks.map((t, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${t.done ? "bg-green-50 dark:bg-green-950/30" : "bg-muted/50"}`}>
                  <div className="flex items-center gap-3">
                    {t.done ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                    <div>
                      <p className="text-sm font-medium">{t.staff}</p>
                      <p className="text-xs text-muted-foreground">{t.type}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{t.planned}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>
    </ConsultantLayout>
  );
}
