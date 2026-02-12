import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { complaintData } from "@/data/hendrikData";
import { AlertTriangle, MessageSquareWarning } from "lucide-react";

export default function KlachtRisico() {
  const top5 = complaintData.perConsultant.slice(0, 5);

  return (
    <ConsultantLayout title="Klacht & Risico" subtitle="Quick win: negatieve reacties/klachten per consultant en koppeling aan afwijzingen">
      {/* Top 5 risk consultants */}
      <AnimatedCard delay={0} className="mb-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="w-5 h-5 text-destructive" />Top 5 Risicoconsultants</CardTitle></CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-5 gap-3">
              {top5.map((c, i) => (
                <div key={c.name} className="text-center p-4 rounded-lg border border-border bg-destructive/5">
                  <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
                  <p className="text-sm font-medium mt-1">{c.name}</p>
                  <p className="text-2xl font-bold text-destructive mt-2">{c.riskScore}</p>
                  <p className="text-xs text-muted-foreground">Risicoscore</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <div className="grid grid-cols-2 gap-4">
        {/* Full table */}
        <AnimatedCard delay={100}>
          <Card className="h-full">
            <CardHeader><CardTitle className="text-base">Overzicht per Consultant</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="grid grid-cols-5 text-xs font-medium text-muted-foreground pb-2 border-b">
                  <span className="col-span-1">Consultant</span>
                  <span className="text-center">Neg. reacties</span>
                  <span className="text-center">Klachten</span>
                  <span className="text-center">Afwijzingen</span>
                  <span className="text-center">Risico</span>
                </div>
                {complaintData.perConsultant.map((c) => (
                  <div key={c.name} className="grid grid-cols-5 items-center py-1.5 text-sm">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-center">{c.negativeReactions}</span>
                    <span className="text-center">{c.complaints}</span>
                    <span className="text-center">{c.rejections}</span>
                    <span className="text-center">
                      <Badge variant={c.riskScore >= 7 ? "destructive" : c.riskScore >= 5 ? "secondary" : "default"}>
                        {c.riskScore}
                      </Badge>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Recent complaints feed */}
        <AnimatedCard delay={200}>
          <Card className="h-full">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><MessageSquareWarning className="w-5 h-5" />Recente Klachten</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {complaintData.recentComplaints.map((c, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border bg-muted/30">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium">{c.consultant}</span>
                      <span className="text-xs text-muted-foreground">{c.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Klant: {c.client}</p>
                    <p className="text-sm">{c.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </ConsultantLayout>
  );
}
