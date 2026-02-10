import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { bonusData, salaryProgressData, earningsData, scenarioOptions, detavastValues, marginPerPlacement, noRegretDeals, bonusLeaderboard } from "@/data/consultantData";
import { DollarSign, TrendingUp, Target, Trophy, ArrowRight } from "lucide-react";

export default function GeldBonus() {
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);

  return (
    <ConsultantLayout title="Geld & Bonus" subtitle="Je verdiensten, bonusvoortgang en scenario's">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Bonusmeter */}
        <AnimatedCard delay={0} className="col-span-2">
          <Card>
            <CardHeader className="glass-header"><CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5" />Bonusmeter</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-foreground">€<AnimatedNumber value={bonusData.current} /></span>
                <span className="text-muted-foreground">/ €{bonusData.target.toLocaleString()}</span>
              </div>
              <Progress value={(bonusData.current / bonusData.target) * 100} className="h-3 mb-4" />
              <p className="text-sm text-muted-foreground">Nog <strong>€{(bonusData.target - bonusData.current).toLocaleString()}</strong> tot {bonusData.nextTier.label}</p>
              <div className="flex gap-2 mt-4">
                {bonusData.tiers.map((tier) => (
                  <div key={tier.level} className={`flex-1 text-center p-2 rounded-lg border ${tier.reached ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" : "bg-muted border-border"}`}>
                    <p className="text-xs font-medium text-muted-foreground">Trede {tier.level}</p>
                    <p className="text-sm font-bold">€{tier.bonus.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Salarisstap */}
        <AnimatedCard delay={100}>
          <Card className="h-full">
            <CardHeader className="glass-header"><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="w-5 h-5" />Salarisstap</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <span className="text-4xl font-bold text-foreground"><AnimatedNumber value={salaryProgressData.progress} />%</span>
                <p className="text-sm text-muted-foreground">van de weg</p>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>€{salaryProgressData.currentSalary}</span>
                <span className="font-medium">€{salaryProgressData.nextSalary}</span>
              </div>
              <Progress value={salaryProgressData.progress} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">Nog €{((salaryProgressData.requiredRevenue - salaryProgressData.currentRevenue) / 1000).toFixed(0)}k omzet nodig</p>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Totale verdiensten + Scenario's */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <AnimatedCard delay={200}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Totale Verdiensten</CardTitle></CardHeader>
            <CardContent className="p-4">
              <Tabs defaultValue="ytd">
                <TabsList className="mb-3"><TabsTrigger value="monthly">Maand</TabsTrigger><TabsTrigger value="ytd">YTD</TabsTrigger><TabsTrigger value="total">Totaal</TabsTrigger></TabsList>
                {(["monthly", "ytd", "total"] as const).map((period) => (
                  <TabsContent key={period} value={period}>
                    <div className="space-y-2">
                      {[
                        { label: "Salaris", value: earningsData[period].salary },
                        { label: "Bonus", value: earningsData[period].bonus },
                        { label: "Extra's", value: earningsData[period].extras },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                          <span className="text-sm font-medium">€{item.value.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Totaal</span>
                        <span>€{(earningsData[period].salary + earningsData[period].bonus + earningsData[period].extras).toLocaleString()}</span>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={300}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="flex items-center gap-2 text-base"><Target className="w-5 h-5" />Scenario Calculator</CardTitle></CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-3">Wat als ik deze maand...</p>
              <div className="space-y-2">
                {scenarioOptions.map((s) => (
                  <button
                    key={s.placements}
                    onClick={() => setSelectedScenario(s.placements)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedScenario === s.placements ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{s.placements} plaatsing{s.placements > 1 ? "en" : ""} doe</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    {selectedScenario === s.placements && (
                      <div className="mt-2 pt-2 border-t text-sm">
                        <p className="text-green-600 font-medium">+€{s.bonusIncrease.toLocaleString()} bonus</p>
                        <p className="text-muted-foreground">Nieuw totaal: €{s.newTotal.toLocaleString()}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Detavast waarde + Marge per plaatsing */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <AnimatedCard delay={400}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Detavast-waarde Indicator</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {detavastValues.map((d) => (
                  <div key={d.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">€{d.monthlyMargin}/mnd</p>
                      <p className="text-xs text-muted-foreground">Verwacht: €{d.totalExpected.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={500}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">Marge per Plaatsing</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {marginPerPlacement.map((m) => (
                  <div key={m.candidate} className="p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{m.candidate}</span>
                      <span className={`text-sm font-bold ${m.realized >= m.expected ? "text-green-600" : "text-red-500"}`}>
                        €{m.realized.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Verwacht: €{m.expected.toLocaleString()}</span>
                      <span>{m.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* No-regret lijst + Bonusranglijst */}
      <div className="grid grid-cols-2 gap-4">
        <AnimatedCard delay={600}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="text-base">🎯 No-Regret Lijst</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {noRegretDeals.map((deal, i) => (
                  <div key={deal.candidate} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{deal.candidate}</p>
                      <p className="text-xs text-muted-foreground">{deal.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">+€{deal.bonusImpact}</p>
                      <Badge variant={deal.chance >= 70 ? "default" : "secondary"} className="text-[10px]">{deal.chance}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={700}>
          <Card>
            <CardHeader className="glass-header"><CardTitle className="flex items-center gap-2 text-base"><Trophy className="w-5 h-5" />Bonusranglijst</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {bonusLeaderboard.map((person) => (
                  <div key={person.rank} className={`flex items-center gap-3 p-2 rounded-lg ${person.isUser ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"}`}>
                    <span className="text-lg font-bold text-muted-foreground w-6">#{person.rank}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${person.isUser ? "text-primary" : ""}`}>{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.team}</p>
                    </div>
                    <span className="text-sm font-bold">€{person.bonus.toLocaleString()}</span>
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
