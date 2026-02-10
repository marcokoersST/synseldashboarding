import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trainingModules, callSkills, coachingTrend, nextSkillFocus, bestPractices } from "@/data/consultantData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Star, BookOpen } from "lucide-react";

export default function SkillsTraining() {
  return (
    <ConsultantLayout title="Skills & Training" subtitle="Van onboarding naar pro — je ontwikkeling in beeld">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Module progressie */}
        <AnimatedCard delay={0}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="flex items-center gap-2 text-base"><BookOpen className="w-4 h-4" />Modules</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3">
              {trainingModules.map((m) => (
                <div key={m.name} className="flex items-center gap-3">
                  {m.completed ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> : <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{m.name}</p>
                    {m.completed ? (
                      <p className="text-xs text-green-600">Score: {m.score}%</p>
                    ) : (
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${m.progress}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Belvaardigheid */}
        <AnimatedCard delay={100}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Belvaardigheid</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3">
              {Object.entries(callSkills).map(([skill, value]) => (
                <div key={skill}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{skill}</span>
                    <span className="font-bold">{value}%</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: value >= 75 ? "hsl(var(--success))" : value >= 60 ? "hsl(var(--gold))" : "hsl(var(--destructive))" }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Coaching trend */}
        <AnimatedCard delay={200}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Coachingscore Trend</CardTitle></CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={coachingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis domain={[5, 10]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--teal))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Next skill focus */}
        <AnimatedCard delay={300}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="flex items-center gap-2 text-base"><Star className="w-4 h-4" />Volgende Skill om te Levelen</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-lg font-bold text-foreground">{nextSkillFocus.skill}</p>
                <p className="text-sm text-muted-foreground mt-1">{nextSkillFocus.reason}</p>
                <div className="mt-3 space-y-1">
                  {nextSkillFocus.actions.map((a, i) => (
                    <p key={i} className="text-sm flex items-center gap-2">
                      <span className="text-primary">→</span> {a}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Best practices */}
        <AnimatedCard delay={400}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Best-Practice Library</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3">
              {bestPractices.map((bp) => (
                <div key={bp.title} className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px]">{bp.type}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{bp.tag}</Badge>
                  </div>
                  <p className="text-sm font-medium">{bp.title}</p>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>{bp.author}</span>
                    <span>⭐ {bp.rating}</span>
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
