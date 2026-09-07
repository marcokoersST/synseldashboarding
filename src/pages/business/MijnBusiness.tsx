import { Download, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BusinessPage, Metric, Section } from "@/components/business/BusinessPage";
import {
  CONSULTANT,
  actualGrossMarginToDate,
  financialYear,
  forecastAnnualMargin,
  historicalEvents,
  portfolio,
  upcomingExits,
  upcomingStarts,
  weeklyActions,
} from "@/data/synselBusiness";
import {
  DEFAULT_ASSUMPTIONS,
  MILESTONES,
  annualizedCurrentMargin,
  formatDate,
  formatEuro,
  formatNumber,
  netCommercialGrowth,
  nextMilestone,
  requiredStarts,
  weeklyPlannedMargin,
} from "@/lib/synselBusiness/calc";
import { evidenceBadge, statusBadge } from "@/components/business/badges";

export default function MijnBusiness() {
  const active = portfolio.filter((p) => p.status === "actief").length;
  const milestone = nextMilestone(active) ?? MILESTONES[MILESTONES.length - 1];
  const gap = Math.max(0, milestone - active);
  const startsLast28 = historicalEvents.filter((e) => e.type === "start").length;
  const exitsLast28 = historicalEvents.filter((e) => e.type === "uitstroom").length;
  const projected = active + upcomingStarts.length - upcomingExits.length;
  const target = 13;
  const extraStartsNeeded = requiredStarts({
    targetActive: target,
    currentActive: active,
    exitsBeforeTarget: upcomingExits.length,
    confirmedStartsBeforeTarget: upcomingStarts.length,
  });
  const weekMargin = weeklyPlannedMargin(portfolio);
  const annualized = annualizedCurrentMargin(portfolio);

  const ladder = MILESTONES.filter((m) => m >= milestone).slice(0, 2);

  return (
    <BusinessPage
      title="Mijn business"
      subtitle={`${CONSULTANT.name} · ${CONSULTANT.team}`}
      actions={
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Download mijn plan
        </Button>
      }
    >
      {/* Hoofdkaart */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Actieve professionals
              </p>
              <p className="mt-1 text-5xl font-bold text-foreground">{active}</p>
              <p className="mt-1 text-xs text-muted-foreground">Waargenomen op de rapportagedatum</p>
            </div>
            <div className="min-w-[260px] flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Volgende mijlpaal</span>
                <span className="font-semibold text-foreground">{milestone} professionals</span>
              </div>
              <Progress value={(active / milestone) * 100} className="mt-2 h-2" />
              <p className="mt-2 text-sm">
                <span className="font-semibold text-foreground">Nog nodig: {gap}</span>{" "}
                <span className="text-muted-foreground">professionals tot mijlpaal {milestone}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Daarna: {ladder.slice(1).concat(MILESTONES.filter((m) => m > ladder[ladder.length - 1])).slice(0, 2).join(" en ")} · volledige ladder: {MILESTONES.join(", ")}
              </p>
            </div>
            <div className="min-w-[220px]">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Geannualiseerde marge nu
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">{formatEuro(annualized)}</p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                Constant-niveau scenario: weekmarge {formatEuro(weekMargin)} × {DEFAULT_ASSUMPTIONS.annualWeeks} weken.
                Mijlpalen 13 en 26 zijn benaderende communicatiestappen, geen exacte € 500.000 of € 1 miljoen.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steunkaarten */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Netto groei"
          value={`${netCommercialGrowth(startsLast28, exitsLast28) >= 0 ? "+" : ""}${netCommercialGrowth(startsLast28, exitsLast28)}`}
          basis="Afgeronde periode: werkelijke starts min werkelijke uitstroom"
          hint="Exclusief eigendomsoverdrachten"
        />
        <Metric
          label="Starts laatste 4 weken"
          value={String(startsLast28)}
          basis="Werkelijke starts in de laatste 28 dagen"
          hint="Waargenomen"
        />
        <Metric
          label="Bevestigde starts komende 4 weken"
          value={String(upcomingStarts.length)}
          basis={upcomingStarts.map((s) => formatDate(s.date)).join(" · ")}
          hint="Bevestigd, nog geen afgeronde start"
        />
        <Metric
          label="Verwachte uitstroom komende 4 weken"
          value={String(upcomingExits.length)}
          basis={upcomingExits.map((s) => formatDate(s.date)).join(" · ")}
          hint="1 bevestigd, 1 geschat"
        />
      </div>

      {/* Weekacties */}
      <Section
        title="Deze week"
        description="Maximaal drie acties. Een actie afronden werkt de lokale coachingregistratie bij en wijzigt het bron-CRM niet."
      >
        <div className="space-y-3">
          {weeklyActions.map((a) => (
            <div key={a.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">
                    {a.deal} · {a.employer}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{a.reason}</p>
                  <p className="mt-2 text-sm text-foreground">
                    <span className="font-medium">Mijn volgende stap:</span> {a.nextAction}
                  </p>
                  {a.status === "Geblokkeerd" && (
                    <p className="mt-2 text-xs text-destructive">
                      Blokkade: {a.blocker} · Nieuwe beoordeling {formatDate(a.reviewDate ?? null, "onbekend")}
                    </p>
                  )}
                  {a.coachingNote && (
                    <p className="mt-1 text-xs text-muted-foreground">Coachingnotitie: {a.coachingNote}</p>
                  )}
                  {a.skillPractice && (
                    <p className="mt-1 text-xs text-muted-foreground">Oefening: {a.skillPractice}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {statusBadge(a.status)}
                  <span className="text-xs text-muted-foreground">Deadline {formatDate(a.dueDate)}</span>
                  <span className="text-xs text-muted-foreground">Eigenaar {a.owner}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={a.sourceUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      Bron bekijken
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 4-wekenbrug */}
      <Section
        title="Portefeuillebrug komende 4 weken"
        description="Bevestigde weergave. Onzekere pipeline staat apart en wordt niet dubbel geteld."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Portefeuille nu", value: active, note: "Waargenomen" },
            { label: "Bevestigde starts", value: `+${upcomingStarts.length}`, note: "Bevestigd" },
            { label: "Verwachte uitstroom", value: `−${upcomingExits.length}`, note: "1 bevestigd, 1 geschat" },
            { label: "Projectie einde 4 weken", value: projected, note: "Berekend" },
            { label: "Doel", value: target, note: `${extraStartsNeeded} extra starts nodig` },
          ].map((b) => (
            <div key={b.label} className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">{b.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{b.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{b.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          De projectie wijkt af van het huidige aantal omdat bevestigde starts nog niet zijn begonnen en
          verwachte uitstroom nog niet is afgerond. Een ondertekend contract is geen afgeronde start.
        </p>

        <div className="mt-4 rounded-lg border border-dashed border-border p-4">
          <p className="text-sm font-medium text-foreground">Aanvullend scenario met onzekere pipeline</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Met 2 extra aangenomen starts uit de pipeline komt de projectie op {projected + 2}. Deze starts zijn
            niet bevestigd en tellen niet mee in de bevestigde weergave.
          </p>
        </div>

        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <TableHead>Gebeurtenis</TableHead>
              <TableHead>Professional</TableHead>
              <TableHead>Opdrachtgever</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Gepland einde</TableHead>
              <TableHead>Werkelijk einde</TableHead>
              <TableHead>Bewijsdatum</TableHead>
              <TableHead>Staat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...upcomingStarts, ...upcomingExits].map((e) => (
              <TableRow key={e.id}>
                <TableCell className="capitalize">{e.type}</TableCell>
                <TableCell className="font-medium">{e.professional}</TableCell>
                <TableCell>{e.employer}</TableCell>
                <TableCell>{formatDate(e.date)}</TableCell>
                <TableCell>{formatDate(e.scheduledEnd ?? null, "—")}</TableCell>
                <TableCell>{formatDate(e.actualEnd ?? null, "—")}</TableCell>
                <TableCell>{formatDate(e.evidenceDate ?? null, "—")}</TableCell>
                <TableCell>{evidenceBadge(e.evidence)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      {/* Financiële kerncijfers */}
      <div className="grid gap-4 md:grid-cols-3">
        <Metric
          label="Werkelijke brutomarge"
          value={formatEuro(actualGrossMarginToDate)}
          basis={`Boekjaar ${financialYear} tot afkapdatum, inclusief correcties`}
          hint="Bron: goedgekeurde financiële dataset (voorbeeld)"
        />
        <Metric
          label="Geannualiseerde marge nu"
          value={formatEuro(annualized)}
          basis={`Weekmarge × ${DEFAULT_ASSUMPTIONS.annualWeeks} weken, constant niveau`}
          hint="Geen prognose van werkelijke jaarproductie"
        />
        <Metric
          label="Prognose brutomarge"
          value={formatEuro(forecastAnnualMargin)}
          basis={`Boekjaar ${financialYear}: werkelijk tot afkapdatum plus gedateerde bijdrage daarna`}
          hint="Zonder overlap tussen werkelijk en prognose"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Aannames in deze weergave: {DEFAULT_ASSUMPTIONS.hoursPerWeek} factureerbare uren per week,{" "}
        {formatEuro(DEFAULT_ASSUMPTIONS.marginPerHour, 2)} marge per uur,{" "}
        {DEFAULT_ASSUMPTIONS.durationWeeks} weken looptijd en {DEFAULT_ASSUMPTIONS.annualWeeks} weken
        annualisatie. Per identiek gemodelleerde professional: {formatEuro(731)} per week,{" "}
        {formatEuro(38012)} geannualiseerd en {formatEuro(21930)} over {DEFAULT_ASSUMPTIONS.durationWeeks} weken.
        Dit zijn aannames, geen gemeten portefeuillegemiddelden ({formatNumber(13.15)} equivalente
        professionals voor {formatEuro(500000)}, dus 14 hele professionals).
      </p>
    </BusinessPage>
  );
}
