import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BusinessPage, Metric, Section } from "@/components/business/BusinessPage";
import {
  LevelHeader,
  PortfolioBridgeStrip,
  PortfolioYieldPanel,
  WeekChecklist,
  type WeekAction,
} from "@/components/business/BusinessBlocks";
import {
  REPORT_DATE,
  actualGrossMarginToDate,
  financialYear,
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
} from "@/lib/synselBusiness/calc";
import { evidenceBadge } from "@/components/business/badges";

const HORIZON_DATE = "2026-10-05";

function weekday(dateIso: string) {
  const label = new Date(dateIso + "T00:00:00Z").toLocaleDateString("nl-NL", {
    weekday: "long",
    timeZone: "UTC",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function MijnBusiness() {
  const active = portfolio.filter((p) => p.status === "actief").length;
  const milestone = nextMilestone(active) ?? MILESTONES[MILESTONES.length - 1];
  const target = 13;
  const gap = Math.max(0, target - active);
  const startsLast28 = historicalEvents.filter((e) => e.type === "start").length;
  const exitsLast28 = historicalEvents.filter((e) => e.type === "uitstroom").length;
  const netGrowth = netCommercialGrowth(startsLast28, exitsLast28);
  const projected = active + upcomingStarts.length - upcomingExits.length;
  const remainingGap = Math.max(0, target - projected);
  const extraStartsNeeded = requiredStarts({
    targetActive: target,
    currentActive: active,
    exitsBeforeTarget: upcomingExits.length,
    confirmedStartsBeforeTarget: upcomingStarts.length,
  });
  const annualized = annualizedCurrentMargin(portfolio);

  const checklist: WeekAction[] = weeklyActions.slice(0, 3).map((a) => ({
    id: a.id,
    text: `${a.deal}: ${a.nextAction}`,
    day: weekday(a.dueDate),
  }));

  return (
    <BusinessPage title="Mijn business" hideHeader>
      <LevelHeader level={target} gap={gap} reportDate={REPORT_DATE} />

      <div className="grid gap-4 md:grid-cols-3">
        <Metric
          tone="dark"
          label="Actief vandaag"
          value={String(active)}
          basis={`${netGrowth >= 0 ? "+" : ""}${netGrowth} netto in 4 weken`}
        />
        <Metric label="Volgende level" value={String(target)} basis={`Nog ${gap} actief nodig`} />
        <Metric
          label="Starts laatste 4 weken"
          value={String(startsLast28)}
          basis={`${exitsLast28} uitstroom in die periode`}
        />
      </div>

      <PortfolioBridgeStrip
        horizonDate={HORIZON_DATE}
        items={[
          { label: "Actief nu", value: active },
          { label: "Bevestigde starts", value: `+${upcomingStarts.length}` },
          { label: "Geplande uitstroom", value: `−${upcomingExits.length}` },
          { label: "Actief verwacht", value: projected, highlight: true },
          { label: "Resterende gap", value: remainingGap },
        ]}
        note={`Voor ${target} actief zijn ${extraStartsNeeded + upcomingStarts.length} starts nodig in deze 4 weken. Daarvan zijn er ${upcomingStarts.length} bevestigd.`}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <WeekChecklist actions={checklist} focus="Commitment ophalen en concreet afsluiten." />
        <PortfolioYieldPanel
          actualMargin={formatEuro(actualGrossMarginToDate)}
          actualBasis={`1 januari t/m 6 september ${financialYear} · demo`}
          runRate={formatEuro(annualized)}
          runRateBasis={`${active} actief bij ${DEFAULT_ASSUMPTIONS.hoursPerWeek} uur en ${formatEuro(DEFAULT_ASSUMPTIONS.marginPerHour, 2)} marge`}
        />
      </div>

      <Section
        title="Starts en uitstroom komende 4 weken"
        description="Bevestigde weergave. Onzekere pipeline staat apart en wordt niet dubbel geteld."
      >
        <Table>
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
        <p className="mt-3 text-xs text-muted-foreground">
          Een ondertekend contract is geen afgeronde start. Met 2 extra aangenomen starts uit de pipeline komt
          de projectie op {projected + 2}; die starts zijn niet bevestigd en tellen niet mee in de bevestigde
          weergave. Volledige levelladder: {MILESTONES.join(", ")} — level {milestone} is de eerstvolgende stap
          in die reeks.
        </p>
      </Section>

      <p className="text-xs text-muted-foreground">
        Aannames in deze weergave: {DEFAULT_ASSUMPTIONS.hoursPerWeek} factureerbare uren per week,{" "}
        {formatEuro(DEFAULT_ASSUMPTIONS.marginPerHour, 2)} marge per uur,{" "}
        {DEFAULT_ASSUMPTIONS.durationWeeks} weken looptijd en {DEFAULT_ASSUMPTIONS.annualWeeks} weken
        annualisatie. Per identiek gemodelleerde professional: {formatEuro(731)} per week,{" "}
        {formatEuro(38012)} geannualiseerd en {formatEuro(21930)} over {DEFAULT_ASSUMPTIONS.durationWeeks} weken.
        Dit zijn aannames, geen gemeten portefeuillegemiddelden ({formatNumber(13.15)} equivalente
        professionals voor {formatEuro(500000)}, dus 14 hele professionals). Level 13 en 26 zijn benaderende
        communicatiestappen, geen exacte € 500.000 of € 1 miljoen.
      </p>
    </BusinessPage>
  );
}
