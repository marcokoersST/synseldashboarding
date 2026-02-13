import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { consultantCoachRankings, coachCategories } from "@/data/aiCoachData";
import { Trophy, Phone, Handshake, UserCheck, Sparkles } from "lucide-react";

const coachIcons = [Phone, Phone, UserCheck, Handshake];
const coachColors = ["text-blue-400", "text-emerald-400", "text-amber-400", "text-purple-400"];

function scoreBadge(score: number) {
  if (score >= 8) return <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">{score.toFixed(1)}</Badge>;
  if (score >= 6) return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">{score.toFixed(1)}</Badge>;
  return <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">{score.toFixed(1)}</Badge>;
}

function rankIcon(rank: number) {
  if (rank === 1) return <span className="text-yellow-400 font-bold">🥇</span>;
  if (rank === 2) return <span className="text-gray-300 font-bold">🥈</span>;
  if (rank === 3) return <span className="text-amber-600 font-bold">🥉</span>;
  return <span className="text-muted-foreground text-sm">{rank}</span>;
}

export default function AICoachRanking() {
  const sorted = [...consultantCoachRankings].sort((a, b) => b.average - a.average);

  return (
    <ConsultantLayout title="AI-Coach Ranking" subtitle="Beoordeling per gespreksonderdeel op basis van transcript-analyse">
      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {coachCategories.map((cat, i) => {
          const Icon = coachIcons[i];
          const best = sorted.reduce((top, c) => {
            const s = c.scores.find(s => s.category === cat)?.score ?? 0;
            return s > top.score ? { name: c.name, score: s } : top;
          }, { name: "", score: 0 });

          return (
            <AnimatedCard key={cat} delay={i * 80}>
              <Card className="bg-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${coachColors[i]}`} />
                    <span className="text-xs text-muted-foreground font-medium truncate">{cat}</span>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    <AnimatedNumber value={best.score} decimals={1} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">Beste: {best.name}</span>
                </CardContent>
              </Card>
            </AnimatedCard>
          );
        })}
      </div>

      {/* Main ranking table */}
      <AnimatedCard delay={350}>
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              Ranking op AI-Coach Beoordeling
            </CardTitle>
            <p className="text-xs text-muted-foreground">Score per gespreksonderdeel (0 – 10) op basis van automatische transcript-analyse</p>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40">
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Consultant</TableHead>
                  {coachCategories.map((cat, i) => {
                    const Icon = coachIcons[i];
                    return (
                      <TableHead key={cat} className="text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <Icon className={`w-3.5 h-3.5 ${coachColors[i]}`} />
                          <span className="text-[10px] leading-tight">{cat}</span>
                        </div>
                      </TableHead>
                    );
                  })}
                  <TableHead className="text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                      <span className="text-[10px]">Gemiddeld</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((c, idx) => (
                  <TableRow key={c.name} className="border-border/30 hover:bg-muted/30">
                    <TableCell className="text-center">{rankIcon(idx + 1)}</TableCell>
                    <TableCell className="font-medium text-sm">{c.name}</TableCell>
                    {coachCategories.map(cat => {
                      const s = c.scores.find(s => s.category === cat)?.score ?? 0;
                      return <TableCell key={cat} className="text-center">{scoreBadge(s)}</TableCell>;
                    })}
                    <TableCell className="text-center font-bold text-sm">
                      {scoreBadge(c.average)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </AnimatedCard>
    </ConsultantLayout>
  );
}
