import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { priorityTasks, hotMatches, openClientResponses, coolingCandidates, riskyDeals } from "@/data/consultantData";
import { Clock, AlertTriangle, Phone, Mail, Users, FileText, Settings, Search } from "lucide-react";

const typeIcons: Record<string, typeof Phone> = { call: Phone, email: Mail, meeting: Users, admin: Settings, research: Search };

export default function NextActions() {
  return (
    <ConsultantLayout title="Volgende Beste Actie" subtitle="Je dagelijkse to-do dashboard — prioriteit op basis van plaatsingskans">
      <div className="grid grid-cols-3 gap-4">
        {/* Top 15 taken */}
        <AnimatedCard delay={0} className="col-span-2">
          <Card>
            <CardHeader className="glass-header"><CardTitle>Top 15 Taken</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="space-y-1.5">
                {priorityTasks.map((t) => {
                  const Icon = typeIcons[t.type] || FileText;
                  return (
                    <div key={t.id} className={`flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 ${t.overdue ? "bg-red-50 dark:bg-red-950/30" : ""}`}>
                      <span className="text-xs font-bold text-muted-foreground w-5">#{t.id}</span>
                      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm flex-1">{t.task}</span>
                      <Badge variant={t.priority >= 80 ? "destructive" : t.priority >= 60 ? "default" : "secondary"} className="text-[10px]">
                        {t.priority}%
                      </Badge>
                      {t.overdue && <span className="text-[10px] text-red-500 font-medium">OVERDUE</span>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Right column */}
        <div className="space-y-4">
          {/* Hot Matches */}
          <AnimatedCard delay={100}>
            <Card>
              <CardHeader className="glass-header"><CardTitle className="flex items-center gap-2 text-base"><Clock className="w-4 h-4" />Hot Matches</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-2">
                {hotMatches.map((m) => (
                  <div key={m.candidate} className={`p-3 rounded-lg border ${m.urgency === "critical" ? "border-red-300 bg-red-50 dark:bg-red-950/30" : m.urgency === "high" ? "border-orange-300 bg-orange-50 dark:bg-orange-950/30" : "border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30"}`}>
                    <p className="text-sm font-medium">{m.candidate} → {m.company}</p>
                    <p className="text-xs text-muted-foreground">Al {m.hoursAgo}u niet opgevolgd</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </AnimatedCard>

          {/* Openstaande klantreacties */}
          <AnimatedCard delay={200}>
            <Card>
              <CardHeader className="glass-header"><CardTitle className="text-base">Klantreacties</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-2">
                {openClientResponses.map((r) => (
                  <div key={r.company} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{r.company}</p>
                      <p className="text-xs text-muted-foreground">{r.contact} · {r.daysPending}d</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${r.sla === "green" ? "bg-green-500" : r.sla === "orange" ? "bg-orange-500" : "bg-red-500"}`} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </AnimatedCard>

          {/* Afkoelende kandidaten */}
          <AnimatedCard delay={300}>
            <Card>
              <CardHeader className="glass-header"><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="w-4 h-4" />Afkoelend</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-2">
                {coolingCandidates.map((c) => (
                  <div key={c.name} className="p-2 rounded-lg hover:bg-muted/50">
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.daysSinceContact} dagen stil · {c.lastAction}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </AnimatedCard>

          {/* Deals met risico */}
          <AnimatedCard delay={400}>
            <Card>
              <CardHeader className="glass-header"><CardTitle className="text-base">Deals met Risico</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-2">
                {riskyDeals.map((d) => (
                  <div key={d.candidate} className={`p-2 rounded-lg border ${d.level === "high" ? "border-red-200 bg-red-50 dark:bg-red-950/30" : "border-orange-200 bg-orange-50 dark:bg-orange-950/30"}`}>
                    <p className="text-sm font-medium">{d.candidate}</p>
                    <p className="text-xs text-muted-foreground">{d.risk}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>
      </div>
    </ConsultantLayout>
  );
}
