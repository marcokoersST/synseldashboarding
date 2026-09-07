import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BusinessPage, Metric, Section } from "@/components/business/BusinessPage";
import { portfolio, skillStages, upcomingExits, upcomingStarts } from "@/data/synselBusiness";
import {
  DEFAULT_ASSUMPTIONS,
  FINANCIAL_TARGETS,
  buildUpScenario,
  equivalentActiveCount,
  formatEuro,
  formatNumber,
  maintenanceStartsPerWeek,
  maintenanceStartsPerYear,
  requiredStarts,
  requiredWholeActiveCount,
  weeklyMargin,
} from "@/lib/synselBusiness/calc";

export default function MijnGroeipad() {
  const active = portfolio.filter((p) => p.status === "actief").length;
  const [targetActive, setTargetActive] = useState(13);
  const [targetDate, setTargetDate] = useState("2026-12-31");
  const [hours, setHours] = useState(DEFAULT_ASSUMPTIONS.hoursPerWeek);
  const [margin, setMargin] = useState(DEFAULT_ASSUMPTIONS.marginPerHour);
  const [duration, setDuration] = useState(DEFAULT_ASSUMPTIONS.durationWeeks);
  const [assumedStarts, setAssumedStarts] = useState(2);

  const assumptions = { ...DEFAULT_ASSUMPTIONS, hoursPerWeek: hours, marginPerHour: margin, durationWeeks: duration };

  const confirmed = active + upcomingStarts.length - upcomingExits.length;
  const ownScenario = confirmed + assumedStarts;
  const needed = requiredStarts({
    targetActive,
    currentActive: active,
    exitsBeforeTarget: upcomingExits.length,
    confirmedStartsBeforeTarget: upcomingStarts.length,
  });

  const weeks13 = useMemo(() => {
    const rows = [];
    let confirmedLevel = active;
    let scenarioLevel = active;
    for (let w = 0; w <= 13; w++) {
      if (w === 1) confirmedLevel += 1;
      if (w === 2) { confirmedLevel += 1; confirmedLevel -= 1; }
      if (w === 3) { confirmedLevel += 1; confirmedLevel -= 1; }
      scenarioLevel = confirmedLevel + Math.min(assumedStarts, Math.floor(w / 4));
      rows.push({ week: `W${w}`, Bevestigd: confirmedLevel, "Mijn scenario": scenarioLevel });
    }
    return rows;
  }, [active, assumedStarts]);

  return (
    <BusinessPage title="Mijn groeipad" subtitle="Scenario's over 4 en 13 weken plus de vaardighedenladder">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Portefeuille nu" value={String(active)} basis="Waargenomen op rapportagedatum" />
        <Metric label="Bevestigd over 4 weken" value={String(confirmed)} basis="Alleen vastgelegde gebeurtenissen" />
        <Metric label="Mijn scenario over 4 weken" value={String(ownScenario)} basis={`Inclusief ${assumedStarts} aangenomen starts`} />
        <Metric label="Extra starts nodig" value={String(needed)} basis={`Voor doel ${targetActive} op ${targetDate}`} />
      </div>

      <Section
        title="Scenario-instellingen"
        description="Scenario's worden apart bewaard en wijzigen nooit werkelijke portefeuille- of boekhoudfeiten."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div>
            <Label className="text-xs">Doelaantal actief</Label>
            <Input type="number" value={targetActive} onChange={(e) => setTargetActive(Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-xs">Doeldatum</Label>
            <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Uren per week</Label>
            <Input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-xs">Marge per uur</Label>
            <Input type="number" step="0.1" value={margin} onChange={(e) => setMargin(Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-xs">Looptijd in weken</Label>
            <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-xs">Extra aangenomen starts</Label>
            <Input type="number" value={assumedStarts} onChange={(e) => setAssumedStarts(Number(e.target.value))} />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Weekmarge per professional bij deze instellingen: {formatEuro(weeklyMargin(assumptions))}. Benodigde
          starts = doelportefeuille − huidige portefeuille + uitstroom vóór de doeldatum − bevestigde starts,
          minimaal 0.
        </p>
      </Section>

      <Section title="Scenario's over 13 weken" description="Bevestigd, basisscenario en mijn scenario naast elkaar.">
        <Tabs defaultValue="bevestigd">
          <TabsList>
            <TabsTrigger value="bevestigd">Bevestigd</TabsTrigger>
            <TabsTrigger value="basis">Basisscenario</TabsTrigger>
            <TabsTrigger value="eigen">Mijn scenario</TabsTrigger>
          </TabsList>
          <TabsContent value="bevestigd" className="pt-4">
            <ChartBlock data={weeks13} keys={["Bevestigd"]} />
            <p className="mt-2 text-xs text-muted-foreground">
              Alleen vastgelegde starts en uitstroom. Onzekere pipeline blijft hier buiten.
            </p>
          </TabsContent>
          <TabsContent value="basis" className="pt-4">
            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Onvoldoende historie</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Een basisscenario met kansen per fase is pas mogelijk als Synsel de methode heeft goedgekeurd
                  en gekalibreerd. Tot die tijd tonen we alleen bandbreedtes en aannames en verzinnen we geen
                  fasekansen.
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="eigen" className="pt-4">
            <ChartBlock data={weeks13} keys={["Bevestigd", "Mijn scenario"]} />
            <p className="mt-2 text-xs text-muted-foreground">
              Mijn scenario telt {assumedStarts} aangenomen starts mee. Dit is een apart bewaard scenario.
            </p>
          </TabsContent>
        </Tabs>
      </Section>

      <Section
        title="Financiële doelen, steady-state planningsmodel"
        description="Drempels worden op onafgeronde waarden getoetst en hele professionals naar boven afgerond. Dit model claimt geen werkelijke eerstejaarsproductie."
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Geannualiseerd margedoel</TableHead>
                <TableHead className="text-right">Equivalent gemiddeld actief</TableHead>
                <TableHead className="text-right">Hele professionals nodig</TableHead>
                <TableHead className="text-right">Onderhoudsstarts per jaar</TableHead>
                <TableHead className="text-right">Onderhoudsstarts per week</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FINANCIAL_TARGETS.map((t) => (
                <TableRow key={t}>
                  <TableCell className="font-medium">{formatEuro(t)}</TableCell>
                  <TableCell className="text-right">{formatNumber(equivalentActiveCount(t))}</TableCell>
                  <TableCell className="text-right">{requiredWholeActiveCount(t)}</TableCell>
                  <TableCell className="text-right">{formatNumber(maintenanceStartsPerYear(t), 2)}</TableCell>
                  <TableCell className="text-right">{formatNumber(maintenanceStartsPerWeek(t), 3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section
        title="Opbouw vanaf nul, continue benadering"
        description="Een gerealiseerd eerstejaarsdoel is een ander doel dan een geannualiseerd niveau aan het einde van het jaar. Deze benadering is educatief; de live prognose telt gedateerde opdrachtbijdragen op."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gerealiseerd eerstejaarsdoel</TableHead>
              <TableHead className="text-right">Continue starts per week</TableHead>
              <TableHead className="text-right">Verwachte starts per jaar</TableHead>
              <TableHead className="text-right">Gemiddeld per kalendermaand</TableHead>
              <TableHead className="text-right">Verwacht actief eind jaar</TableHead>
              <TableHead className="text-right">Geannualiseerde marge eind jaar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[500000, 750000, 1000000].map((t) => {
              const s = buildUpScenario(t);
              return (
                <TableRow key={t}>
                  <TableCell className="font-medium">{formatEuro(t)}</TableCell>
                  <TableCell className="text-right">{formatNumber(s.startsPerWeek, 3)}</TableCell>
                  <TableCell className="text-right">{formatNumber(s.startsPerYear, 2)}</TableCell>
                  <TableCell className="text-right">{formatNumber(s.startsPerCalendarMonth, 2)}</TableCell>
                  <TableCell className="text-right">{formatNumber(s.activeAtYearEnd, 2)}</TableCell>
                  <TableCell className="text-right">{formatEuro(s.annualizedMarginAtYearEnd)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <p className="mt-3 text-xs text-muted-foreground">
          Dit beschrijft een verwachte continue stroom, geen concreet startschema met hele plaatsingen.
          32,04 starts op willekeurige data garanderen geen {formatEuro(500000)}.
        </p>
      </Section>

      <Section title="Vaardighedenladder" description="Ontwikkelfocus per portefeuillefase met waarneembaar bewijs.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Portefeuillefase</TableHead>
              <TableHead>Ontwikkelfocus</TableHead>
              <TableHead>Waarneembaar bewijs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skillStages.map((s) => (
              <TableRow key={s.stage}>
                <TableCell className="font-medium">{s.stage}</TableCell>
                <TableCell>{s.focus}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{s.evidence}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="mt-3 text-xs text-muted-foreground">
          Een vaardigheid is niet beheerst omdat een video is geopend. Bewijs is een waargenomen resultaat.
        </p>
      </Section>
    </BusinessPage>
  );
}

function ChartBlock({ data, keys }: { data: Record<string, string | number>[]; keys: string[] }) {
  const colors = ["hsl(var(--chart-2))", "hsl(var(--primary))"];
  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          {keys.map((k, i) => (
            <Line key={k} type="monotone" dataKey={k} stroke={colors[i % colors.length]} strokeWidth={2.5} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
