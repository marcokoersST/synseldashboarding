import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { alerts } from "@/data/consultantData";
import { AlertTriangle, UserX, Building2, FileX, Clock, Database } from "lucide-react";

const urgencyColors = { red: "border-red-300 bg-red-50 dark:bg-red-950/30", orange: "border-orange-300 bg-orange-50 dark:bg-orange-950/30", yellow: "border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30" };
const urgencyDots = { red: "bg-red-500", orange: "bg-orange-500", yellow: "bg-yellow-500" };

export default function AlertsRisicos() {
  return (
    <ConsultantLayout title="Alerts & Risico's" subtitle="Dashboard dat je problemen vóór is">
      <div className="grid grid-cols-2 gap-4">
        <AnimatedCard delay={0}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="flex items-center gap-2 text-base"><UserX className="w-4 h-4" />Kandidaat dreigt af te haken</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-2">
              {alerts.candidateRisk.map((a) => (
                <div key={a.name} className={`p-3 rounded-lg border ${urgencyColors[a.urgency]}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${urgencyDots[a.urgency]}`} />
                    <span className="text-sm font-medium">{a.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{a.days}d stil</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{a.signal}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={100}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="flex items-center gap-2 text-base"><Building2 className="w-4 h-4" />Klant blijft vaag</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-2">
              {alerts.vagueClients.map((a) => (
                <div key={a.company} className={`p-3 rounded-lg border ${urgencyColors[a.urgency]}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${urgencyDots[a.urgency]}`} />
                    <span className="text-sm font-medium">{a.company}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{a.days}d</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{a.issue}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={200}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="flex items-center gap-2 text-base"><FileX className="w-4 h-4" />Deal zonder CTA</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-2">
              {alerts.noCTA.map((a) => (
                <div key={a.candidate} className={`p-3 rounded-lg border ${urgencyColors[a.urgency]}`}>
                  <p className="text-sm font-medium">{a.candidate} → {a.company}</p>
                  <p className="text-xs text-muted-foreground">Verstuurd {a.sentDaysAgo}d geleden, geen CTA</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={300}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="flex items-center gap-2 text-base"><Clock className="w-4 h-4" />Te late opvolging</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-2">
              {alerts.lateFollowUp.map((a) => (
                <div key={a.match} className={`p-3 rounded-lg border ${urgencyColors[a.urgency]}`}>
                  <p className="text-sm font-medium">{a.match}</p>
                  <p className="text-xs text-muted-foreground">Al {a.hours}u niet opgepakt</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={400} className="col-span-2">
          <Card>
            <CardHeader className="glass-header"><CardTitle className="flex items-center gap-2 text-base"><Database className="w-4 h-4" />CRM Risico</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-2">
              {alerts.crmRisk.map((a) => (
                <div key={a.candidate} className={`p-3 rounded-lg border ${urgencyColors[a.urgency]}`}>
                  <p className="text-sm font-medium">{a.candidate}</p>
                  <p className="text-xs text-muted-foreground">Ontbrekend: {a.missing.join(", ")}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </ConsultantLayout>
  );
}
