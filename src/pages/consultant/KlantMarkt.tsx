import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clientCoverage, marketInsights } from "@/data/consultantData";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

const tempColors = { warm: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400", lauw: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400", koud: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400" };

export default function KlantMarkt() {
  return (
    <ConsultantLayout title="Klant & Markt" subtitle="Klantcoverage, beslissers en marktinzichten">
      <AnimatedCard delay={0} className="mb-4">
        <Card>
          <CardHeader className="glass-header"><CardTitle>Klantcoverage & Warmtekaart</CardTitle></CardHeader>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left py-2 px-3">Bedrijf</th><th className="text-left py-2 px-3">Laatste contact</th><th className="text-left py-2 px-3">Beslisser</th><th className="text-left py-2 px-3">Rol</th><th className="text-left py-2 px-3">Status</th></tr></thead>
                <tbody>
                  {clientCoverage.map((c) => (
                    <tr key={c.company} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3 font-medium">{c.company}</td>
                      <td className="py-2 px-3 text-muted-foreground">{c.lastContact}</td>
                      <td className="py-2 px-3">{c.decisionMaker ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}</td>
                      <td className="py-2 px-3 text-muted-foreground">{c.role}</td>
                      <td className="py-2 px-3"><Badge className={`text-[10px] ${tempColors[c.temperature]}`}>{c.temperature}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <AnimatedCard delay={100}>
        <Card>
          <CardHeader className="glass-header"><CardTitle className="text-base">Marktinzicht Capture</CardTitle></CardHeader>
          <CardContent className="p-6 text-center">
            <span className="text-4xl font-bold text-foreground"><AnimatedNumber value={marketInsights.thisWeek} /></span>
            <p className="text-sm text-muted-foreground mt-1">nieuwe commerciële inzichten deze week</p>
            <p className="text-xs text-muted-foreground mt-2">Vorige week: {marketInsights.lastWeek}</p>
          </CardContent>
        </Card>
      </AnimatedCard>
    </ConsultantLayout>
  );
}
