import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fitScores, interviewQuality, offerRate, acceptRate, rejectionReasons } from "@/data/consultantData";
import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function MatchKwaliteit() {
  const radarData = Object.entries(fitScores).map(([key, value]) => ({ subject: key.charAt(0).toUpperCase() + key.slice(1), score: value, fullMark: 100 }));

  return (
    <ConsultantLayout title="Match Kwaliteit" subtitle="De 'beste baan' meetbaar maken">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <AnimatedCard delay={0}>
          <Card className="h-full">
            <CardHeader className="glass-header"><CardTitle className="text-base">Fit-Score Radar</CardTitle></CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <RechartsRadar data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Fit" dataKey="score" stroke="hsl(var(--teal))" fill="hsl(var(--teal))" fillOpacity={0.3} />
                </RechartsRadar>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={100}>
          <Card className="h-full">
            <CardHeader className="glass-header"><CardTitle className="text-base">Gesprekskwaliteit bij Klant</CardTitle></CardHeader>
            <CardContent className="p-6 text-center">
              <div className="flex gap-4 justify-center">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg flex-1">
                  <p className="text-3xl font-bold text-green-600"><AnimatedNumber value={interviewQuality.goodFit} /></p>
                  <p className="text-xs text-muted-foreground">Goede klik</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg flex-1">
                  <p className="text-3xl font-bold text-red-500"><AnimatedNumber value={interviewQuality.notFit} /></p>
                  <p className="text-xs text-muted-foreground">Niet passend</p>
                </div>
              </div>
              <p className="text-sm font-bold mt-3">{((interviewQuality.goodFit / (interviewQuality.goodFit + interviewQuality.notFit)) * 100).toFixed(0)}% match rate</p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={200}>
          <Card className="h-full">
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Offer Rate</p>
                <p className="text-3xl font-bold"><AnimatedNumber value={offerRate.rate} decimals={1} />%</p>
                <p className="text-xs text-muted-foreground">{offerRate.offers}/{offerRate.interviews} gesprekken</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Accept Rate</p>
                <p className="text-3xl font-bold"><AnimatedNumber value={acceptRate.rate} decimals={1} />%</p>
                <p className="text-xs text-muted-foreground">{acceptRate.placements}/{acceptRate.offers} aanbiedingen</p>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <AnimatedCard delay={300}>
        <Card>
          <CardHeader className="glass-header"><CardTitle className="text-base">Top 5 Afwijzingsredenen</CardTitle></CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={rejectionReasons} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="reason" width={130} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </AnimatedCard>
    </ConsultantLayout>
  );
}
