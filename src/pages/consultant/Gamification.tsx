import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { badges, streakData, teamChallenges, wallOfFame } from "@/data/consultantData";

export default function Gamification() {
  return (
    <ConsultantLayout title="Gamification" subtitle="Badges, streaks en challenges — maak recruitment een game">
      {/* Badges */}
      <AnimatedCard delay={0} className="mb-4">
        <Card>
          <CardHeader className="glass-header"><CardTitle>Badges</CardTitle></CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-3">
              {badges.map((b) => (
                <div key={b.name} className={`text-center p-3 rounded-lg border ${b.earned ? "border-primary/30 bg-primary/5" : "border-border opacity-50 grayscale"}`}>
                  <span className="text-3xl">{b.icon}</span>
                  <p className="text-xs font-medium mt-1">{b.name}</p>
                  <p className="text-[10px] text-muted-foreground">{b.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <div className="grid grid-cols-3 gap-4">
        {/* Streak */}
        <AnimatedCard delay={100}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">🔥 Streaks</CardTitle></CardHeader>
            <CardContent className="p-6 text-center">
              <p className="text-5xl font-bold text-foreground"><AnimatedNumber value={streakData.current} /></p>
              <p className="text-sm text-muted-foreground mt-1">dagen {streakData.type}</p>
              <p className="text-xs text-muted-foreground mt-2">Record: {streakData.best} dagen</p>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Team challenges */}
        <AnimatedCard delay={200}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Team Challenges</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-4">
              {teamChallenges.map((ch) => (
                <div key={ch.challenge}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{ch.challenge}</span>
                    <span className="text-xs text-muted-foreground">{ch.deadline}</span>
                  </div>
                  <Progress value={(ch.current / ch.target) * 100} className="h-2 mb-1" />
                  <p className="text-xs text-muted-foreground">{ch.current} / {ch.target}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Wall of Fame */}
        <AnimatedCard delay={300}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">🏆 Wall of Fame</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3">
              {wallOfFame.map((w) => (
                <div key={w.category} className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
                  <span className="text-lg mr-2">{w.icon}</span>
                  <p className="text-xs text-muted-foreground">{w.category}</p>
                  <p className="text-sm font-bold">{w.winner}</p>
                  <p className="text-xs text-primary">{w.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </ConsultantLayout>
  );
}
