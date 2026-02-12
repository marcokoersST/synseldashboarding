import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { gamificationLevels, consultantLevels, qualityThreshold } from "@/data/hendrikData";
import { Trophy, AlertTriangle } from "lucide-react";

export default function GamificationLevels() {
  return (
    <ConsultantLayout title="Gamification Levels" subtitle="Levelstructuur, ondergrenzen, privileges en leaderboard">
      {/* Level structure */}
      <AnimatedCard delay={0} className="mb-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Level Structuur</CardTitle></CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-5 gap-3">
              {gamificationLevels.map((l) => (
                <div key={l.level} className={`p-4 rounded-lg border ${l.minScore < qualityThreshold ? "border-destructive/50 bg-destructive/5" : "border-border"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={l.color}>Level {l.level}</Badge>
                    <span className="text-sm font-bold">{l.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Score: {l.minScore} – {l.maxScore}</p>
                  <p className="text-xs text-accent">✓ {l.privileges}</p>
                  {l.sanctions !== "—" && <p className="text-xs text-destructive mt-1">⚠ {l.sanctions}</p>}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="w-4 h-4" />
              <span>Ondergrens: score {qualityThreshold} — daaronder beperkte toegang</span>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <div className="grid grid-cols-2 gap-4">
        {/* Consultant progress */}
        <AnimatedCard delay={100}>
          <Card className="h-full">
            <CardHeader><CardTitle className="text-base">Voortgang per Consultant</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {consultantLevels.map((c) => {
                  const levelInfo = gamificationLevels.find(l => l.level === c.level);
                  const belowThreshold = c.score < qualityThreshold;
                  return (
                    <div key={c.name} className={`p-3 rounded-lg border ${belowThreshold ? "border-destructive/40 bg-destructive/5" : "border-border"}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{c.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={levelInfo?.color || "secondary"}>L{c.level} – {levelInfo?.label}</Badge>
                          <span className="text-sm font-bold">{c.score}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={c.progress} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-10 text-right">{c.progress}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Leaderboard */}
        <AnimatedCard delay={200}>
          <Card className="h-full">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Trophy className="w-5 h-5" />Kwaliteits-Leaderboard</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {consultantLevels.map((c, i) => (
                  <div key={c.name} className={`flex items-center gap-3 p-2.5 rounded-lg ${i < 3 ? "bg-accent/10 border border-accent/30" : "hover:bg-muted/50"}`}>
                    <span className="text-lg font-bold text-muted-foreground w-8">#{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">Level {c.level}</p>
                    </div>
                    <span className="text-lg font-bold">{c.score}</span>
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
