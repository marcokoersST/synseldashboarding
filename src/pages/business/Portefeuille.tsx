import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BusinessPage, Metric, Section } from "@/components/business/BusinessPage";
import { evidenceBadge, statusBadge } from "@/components/business/badges";
import { historicalEvents, ownershipTransfers, portfolio } from "@/data/synselBusiness";
import { formatDate, formatEuro, portfolioBalanceChange, netCommercialGrowth } from "@/lib/synselBusiness/calc";

export default function Portefeuille() {
  const starts = historicalEvents.filter((e) => e.type === "start").length;
  const exits = historicalEvents.filter((e) => e.type === "uitstroom").length;
  const transfersIn = ownershipTransfers.filter((e) => e.type === "overdracht-in").length;
  const transfersOut = ownershipTransfers.filter((e) => e.type === "overdracht-uit").length;

  return (
    <BusinessPage
      title="Portefeuille"
      subtitle="Register van alle opdrachtepisodes met starts, uitstroom en eigendomsoverdrachten"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Metric
          label="Netto commerciële groei"
          value={`${netCommercialGrowth(starts, exits) >= 0 ? "+" : ""}${netCommercialGrowth(starts, exits)}`}
          basis="Laatste 28 dagen, exclusief eigendomsoverdrachten"
        />
        <Metric
          label="Portefeuillemutatie"
          value={`${portfolioBalanceChange(starts, exits, transfersIn, transfersOut) >= 0 ? "+" : ""}${portfolioBalanceChange(starts, exits, transfersIn, transfersOut)}`}
          basis="Netto groei plus inkomende min uitgaande overdrachten"
        />
        <Metric
          label="Open einde vastgelegd"
          value={String(portfolio.filter((p) => p.openEnded).length)}
          basis="Opdrachten zonder vaste einddatum, expliciet als geldige status"
        />
      </div>

      <Section
        title="Opdrachtepisodes"
        description="Werkelijke start, verwacht einde en werkelijk einde staan apart. Een geannuleerde plaatsing levert geen toekomstige start en een no-show wordt geen werkelijke start."
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referentie</TableHead>
                <TableHead>Professional</TableHead>
                <TableHead>Opdrachtgever</TableHead>
                <TableHead>Eigenaar</TableHead>
                <TableHead>Werkelijke start</TableHead>
                <TableHead>Verwacht einde</TableHead>
                <TableHead>Werkelijk einde</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Uren/week</TableHead>
                <TableHead className="text-right">Marge/uur</TableHead>
                <TableHead>Bronstatus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolio.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.id}</TableCell>
                  <TableCell className="font-medium">{p.professional}</TableCell>
                  <TableCell>{p.employer}</TableCell>
                  <TableCell>{p.owner}</TableCell>
                  <TableCell>
                    {p.actualStart ? formatDate(p.actualStart) : `Gepland ${formatDate(p.plannedStart ?? null, "—")}`}
                  </TableCell>
                  <TableCell>{p.openEnded ? "Open einde" : formatDate(p.expectedEnd, "—")}</TableCell>
                  <TableCell>{formatDate(p.actualEnd, "—")}</TableCell>
                  <TableCell>{statusBadge(p.status)}</TableCell>
                  <TableCell className="text-right">{p.hoursPerWeek}</TableCell>
                  <TableCell className="text-right">{formatEuro(p.marginPerHour, 2)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.sourceStatus}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section
        title="Gebeurtenissen"
        description="Starts, uitstroom en eigendomsoverdrachten met bewijsdatum en bewijsstaat."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Professional</TableHead>
              <TableHead>Opdrachtgever</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Bewijsdatum</TableHead>
              <TableHead>Staat</TableHead>
              <TableHead>Toelichting</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...historicalEvents, ...ownershipTransfers].map((e) => (
              <TableRow key={e.id}>
                <TableCell className="capitalize">{e.type.replace("-", " ")}</TableCell>
                <TableCell className="font-medium">{e.professional}</TableCell>
                <TableCell>{e.employer}</TableCell>
                <TableCell>{formatDate(e.date)}</TableCell>
                <TableCell>{formatDate(e.evidenceDate ?? null, "—")}</TableCell>
                <TableCell>{evidenceBadge(e.evidence)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{e.note ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="mt-3 text-xs text-muted-foreground">
          Een vervanging en de voorganger zijn twee losse opdrachtepisodes. Voor het aantal actieve
          professionals worden dubbele tellingen per professional verwijderd. Eigendomsoverdrachten hebben
          altijd een eigen gebeurtenis, zodat individuele netto groei juist blijft.
        </p>
      </Section>
    </BusinessPage>
  );
}
