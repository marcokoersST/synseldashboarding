import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { funnelSteps, funnelPerConsultant } from "@/data/hendrikData";
import { ArrowRight } from "lucide-react";

export default function ConversieFunnel() {
  // Calculate conversion rates between steps
  const conversions = funnelSteps.slice(1).map((step, i) => ({
    from: funnelSteps[i].label,
    to: step.label,
    rate: Math.round((step.value / funnelSteps[i].value) * 100),
  }));
  const lowestRate = Math.min(...conversions.map(c => c.rate));

  return (
    <ConsultantLayout title="Conversie Funnel" subtitle="Stapsgewijze conversierates van inschrijving tot gesprek">
      {/* Horizontal funnel */}
      <AnimatedCard delay={0} className="mb-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Funnel Overzicht</CardTitle></CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {funnelSteps.map((step, i) => (
                <div key={step.label} className="flex items-center">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-xl bg-accent/10 border border-accent/30 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-foreground"><AnimatedNumber value={step.value} /></span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 font-medium">{step.label}</p>
                  </div>
                  {i < funnelSteps.length - 1 && (
                    <div className="flex flex-col items-center mx-2">
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      <span className={`text-xs font-bold mt-1 ${conversions[i].rate === lowestRate ? "text-destructive" : "text-accent"}`}>
                        {conversions[i].rate}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Per consultant table */}
      <AnimatedCard delay={150}>
        <Card>
          <CardHeader><CardTitle className="text-base">Conversie per Consultant</CardTitle></CardHeader>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left py-2 font-medium">Consultant</th>
                    <th className="text-center py-2 font-medium">Inschr.</th>
                    <th className="text-center py-2 font-medium">Acqu.</th>
                    <th className="text-center py-2 font-medium">Voorst.</th>
                    <th className="text-center py-2 font-medium">Uitn.</th>
                    <th className="text-center py-2 font-medium">Gespr.</th>
                    <th className="text-center py-2 font-medium">Conv. %</th>
                  </tr>
                </thead>
                <tbody>
                  {funnelPerConsultant.map((c) => {
                    const totalConv = Math.round((c.gesprekken / c.inschrijvingen) * 100);
                    const isLow = totalConv < 5;
                    return (
                      <tr key={c.name} className="border-b border-border/50">
                        <td className="py-2 font-medium">{c.name}</td>
                        <td className="text-center">{c.inschrijvingen}</td>
                        <td className="text-center">{c.acquisities}</td>
                        <td className="text-center">{c.voorstellen}</td>
                        <td className="text-center">{c.uitnodigingen}</td>
                        <td className="text-center">{c.gesprekken}</td>
                        <td className="text-center">
                          <Badge variant={isLow ? "destructive" : "default"}>{totalConv}%</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>
    </ConsultantLayout>
  );
}
