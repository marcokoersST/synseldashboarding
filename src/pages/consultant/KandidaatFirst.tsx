import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { candidateStatus, candidateNPS, matchQuality, profileCompleteness } from "@/data/consultantData";

const phases = [
  { key: "intake", label: "Intake", color: "bg-blue-100 dark:bg-blue-950 border-blue-300" },
  { key: "matching", label: "Matching", color: "bg-teal-100 dark:bg-teal-950 border-teal-300" },
  { key: "voorgesteld", label: "Voorgesteld", color: "bg-amber-100 dark:bg-amber-950 border-amber-300" },
  { key: "gesprek", label: "Gesprek", color: "bg-purple-100 dark:bg-purple-950 border-purple-300" },
  { key: "geplaatst", label: "Geplaatst", color: "bg-green-100 dark:bg-green-950 border-green-300" },
] as const;

export default function KandidaatFirst() {
  return (
    <ConsultantLayout title="Kandidaat-First" subtitle="Jouw kandidaten in het proces — tevredenheid en matchkwaliteit">
      {/* Kanban */}
      <AnimatedCard delay={0} className="mb-4">
        <Card>
          <CardHeader className="glass-header"><CardTitle>Kandidaatstatus Overzicht</CardTitle></CardHeader>
          <CardContent className="p-4">
            <div className="flex gap-3">
              {phases.map((phase) => (
                <div key={phase.key} className={`flex-1 rounded-lg border p-3 ${phase.color}`}>
                  <p className="text-xs font-medium mb-2">{phase.label} ({candidateStatus[phase.key].length})</p>
                  <div className="space-y-1.5">
                    {candidateStatus[phase.key].map((c) => (
                      <div key={c.name} className="bg-white dark:bg-card p-2 rounded text-xs shadow-sm">
                        <p className="font-medium">{c.name}</p>
                        <p className="text-muted-foreground">{c.days}d</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <div className="grid grid-cols-3 gap-4">
        {/* NPS */}
        <AnimatedCard delay={100}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Kandidaat NPS</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-4">
              {[
                { label: "Na intake", value: candidateNPS.naIntake },
                { label: "Na gesprek", value: candidateNPS.naGesprek },
                { label: "Na plaatsing", value: candidateNPS.naPlaatsing },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm">{item.label}</span>
                  <span className={`text-xl font-bold ${item.value >= 8 ? "text-green-600" : item.value >= 7 ? "text-amber-600" : "text-red-500"}`}>{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Match kwaliteit */}
        <AnimatedCard delay={200}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Match Kwaliteit</CardTitle></CardHeader>
            <CardContent className="p-6 text-center">
              <span className="text-4xl font-bold text-foreground"><AnimatedNumber value={Math.round((matchQuality.matchesToInterview / matchQuality.totalMatches) * 100)} />%</span>
              <p className="text-sm text-muted-foreground mt-1">van matches leidt tot gesprek</p>
              <p className="text-xs text-muted-foreground mt-2">{matchQuality.matchesToInterview} / {matchQuality.totalMatches} matches</p>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Profiel compleetheid */}
        <AnimatedCard delay={300}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Profiel Compleetheid</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3">
              {profileCompleteness.map((f) => (
                <div key={f.field}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{f.field}</span>
                    <span className="font-medium">{f.complete}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${f.complete}%`, backgroundColor: f.complete >= 80 ? "hsl(var(--success))" : f.complete >= 60 ? "hsl(var(--gold))" : "hsl(var(--destructive))" }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </ConsultantLayout>
  );
}
