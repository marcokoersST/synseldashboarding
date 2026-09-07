import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusinessPage, Metric, Section } from "@/components/business/BusinessPage";
import { coachingRecords, teamConsultants } from "@/data/synselBusiness";
import { formatDate, formatEuro, netCommercialGrowth } from "@/lib/synselBusiness/calc";

export default function MijnTeam() {
  const [selected, setSelected] = useState(teamConsultants[0].name);
  const consultant = teamConsultants.find((c) => c.name === selected)!;
  const totalActive = teamConsultants.reduce((s, c) => s + c.active, 0);
  const attention = teamConsultants.filter((c) => c.attention);

  return (
    <BusinessPage
      title="Mijn team"
      subtitle="Alle toegewezen actieve consultants, waar groei stilvalt en wat te coachen"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Actieve professionals in team" value={String(totalActive)} basis="Som over toegewezen consultants" />
        <Metric label="Consultants" value={String(teamConsultants.length)} basis="Geautoriseerde, actieve consultants" />
        <Metric label="Aandachtspunten" value={String(attention.length)} basis="Consultants met stagnerende groei" />
        <Metric
          label="Weekmarge team"
          value={formatEuro(teamConsultants.reduce((s, c) => s + c.weeklyMargin, 0))}
          basis="Geplande weekmarge, geen geboekte marge"
        />
      </div>

      <Section title="Teamoverzicht" description="Gegroepeerd op team. Operationele teamresultaten geven geen toegang tot individuele salarisafspraken.">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Consultant</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">Actief</TableHead>
                <TableHead className="text-right">Volgende mijlpaal</TableHead>
                <TableHead className="text-right">Starts 28d</TableHead>
                <TableHead className="text-right">Uitstroom 28d</TableHead>
                <TableHead className="text-right">Netto groei</TableHead>
                <TableHead className="text-right">Bevestigde starts 4w</TableHead>
                <TableHead className="text-right">Verwachte uitstroom 4w</TableHead>
                <TableHead className="text-right">Weekmarge</TableHead>
                <TableHead>Aandacht</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamConsultants.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.team}</TableCell>
                  <TableCell className="text-right">{c.active}</TableCell>
                  <TableCell className="text-right">{c.nextMilestone}</TableCell>
                  <TableCell className="text-right">{c.startsLast28}</TableCell>
                  <TableCell className="text-right">{c.exitsLast28}</TableCell>
                  <TableCell className="text-right">
                    {netCommercialGrowth(c.startsLast28, c.exitsLast28) > 0 ? "+" : ""}
                    {netCommercialGrowth(c.startsLast28, c.exitsLast28)}
                  </TableCell>
                  <TableCell className="text-right">{c.confirmedStarts4w}</TableCell>
                  <TableCell className="text-right">{c.expectedExits4w}</TableCell>
                  <TableCell className="text-right">{formatEuro(c.weeklyMargin)}</TableCell>
                  <TableCell className="max-w-[220px] text-xs">
                    {c.attention ? (
                      <span className="inline-flex items-start gap-1 text-destructive">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {c.attention}
                      </span>
                    ) : (
                      <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                        Op koers
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section
        title="Wekelijkse coaching"
        description="Zes vaste vragen plus één concrete oefenopdracht met eigenaar, deadline en terugkoppeling."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Consultant</Label>
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teamConsultants.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">1. Huidige portefeuille</Label>
                <Input defaultValue={consultant.active} />
              </div>
              <div>
                <Label className="text-xs">2. Gat tot mijlpaal</Label>
                <Input defaultValue={consultant.nextMilestone - consultant.active} />
              </div>
            </div>
            <div>
              <Label className="text-xs">3. Uitstroom</Label>
              <Input defaultValue={`${consultant.expectedExits4w} verwacht komende 4 weken`} />
            </div>
            <div>
              <Label className="text-xs">4. Starts</Label>
              <Input defaultValue={`${consultant.confirmedStarts4w} bevestigd komende 4 weken`} />
            </div>
            <div>
              <Label className="text-xs">5. Prioriteitsdeals</Label>
              <Textarea rows={2} defaultValue="Benoem de twee of drie deals die deze week moeten bewegen" />
            </div>
            <div>
              <Label className="text-xs">6. Vaardigheid</Label>
              <Input defaultValue="Afsluiten en margeonderhandeling" />
            </div>
            <div>
              <Label className="text-xs">Oefenopdracht</Label>
              <Textarea
                rows={2}
                defaultValue="Bereid twee kandidaatevaluaties voor en oefen de afsluitvraag met je manager."
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Eigenaar</Label>
                <Input defaultValue={consultant.name} />
              </div>
              <div>
                <Label className="text-xs">Deadline</Label>
                <Input type="date" defaultValue="2026-09-14" />
              </div>
            </div>
            <Button size="sm">Coachingregistratie bewaren</Button>
            <p className="text-xs text-muted-foreground">
              Bewaren werkt alleen de lokale coachingregistratie bij en wijzigt het bron-CRM niet.
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Eerdere gesprekken</p>
            <div className="space-y-3">
              {coachingRecords.map((r) => (
                <div key={r.id} className="rounded-lg border border-border p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{r.consultant}</p>
                    <span className="text-xs text-muted-foreground">{formatDate(r.date)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Portefeuille {r.currentPortfolio} · gat {r.gap} · uitstroom {r.exits} · starts {r.starts}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Deals: {r.priorityDeals}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Vaardigheid: {r.skill}</p>
                  <p className="mt-2 text-xs">Oefening: {r.practice}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Deadline {formatDate(r.deadline)} · resultaat: {r.reviewResult ?? "nog niet beoordeeld"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </BusinessPage>
  );
}
