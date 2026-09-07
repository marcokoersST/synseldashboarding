import { Download, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BusinessPage, Section } from "@/components/business/BusinessPage";
import { CONSULTANT, REPORT_DATE, portfolio, upcomingExits, upcomingStarts } from "@/data/synselBusiness";
import { DEFAULT_ASSUMPTIONS, formatDate, formatEuro } from "@/lib/synselBusiness/calc";

const documents = [
  {
    id: "DOC-01",
    name: "Persoonlijk businessplan",
    description: "Portefeuille, mijlpaal, brug over 4 weken, prioriteitsdeals en afgesproken oefening",
    audience: "Consultant en toegewezen manager",
  },
  {
    id: "DOC-02",
    name: "Portefeuille-playbook",
    description: "Opdrachtepisodes, uitstroomplanning en vervangingsacties",
    audience: "Consultant en toegewezen manager",
  },
];

export default function MijnDocumenten() {
  const active = portfolio.filter((p) => p.status === "actief").length;

  return (
    <BusinessPage
      title="Mijn documenten"
      subtitle="Documenten worden gegenereerd uit dezelfde snapshot als de dashboards"
    >
      <Section title="Beschikbare documenten" description="Elke export bevat de rapportagedatum, de modelaannames en de conceptmelding.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Inhoud</TableHead>
              <TableHead>Toegang</TableHead>
              <TableHead className="text-right">Actie</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">
                  <span className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {d.name}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{d.description}</TableCell>
                <TableCell className="text-xs">{d.audience}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="mr-2 h-3.5 w-3.5" />
                    Printweergave
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      <Section
        title="Voorbeeld: persoonlijk businessplan"
        description={`Snapshot van ${formatDate(REPORT_DATE)}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            Download mijn plan
          </Button>
        }
      >
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-semibold text-foreground">{CONSULTANT.name} · {CONSULTANT.team}</p>
            <p className="text-xs text-muted-foreground">
              Rapportagedatum {formatDate(REPORT_DATE)} · tijdzone Europe/Amsterdam
            </p>
          </div>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>Actieve professionals vandaag: {active}</li>
            <li>Bevestigde starts komende 4 weken: {upcomingStarts.length}</li>
            <li>Verwachte uitstroom komende 4 weken: {upcomingExits.length} (1 bevestigd, 1 geschat)</li>
            <li>Projectie einde 4 weken: {active + upcomingStarts.length - upcomingExits.length}</li>
            <li>Doel 13 professionals, nog 3 extra starts nodig onder deze aannames</li>
          </ul>
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
            Modelaannames: {DEFAULT_ASSUMPTIONS.hoursPerWeek} factureerbare uren per week,{" "}
            {formatEuro(DEFAULT_ASSUMPTIONS.marginPerHour, 2)} brutomarge per uur,{" "}
            {DEFAULT_ASSUMPTIONS.durationWeeks} weken looptijd, {DEFAULT_ASSUMPTIONS.annualWeeks} weken
            annualisatie. Concept met voorbeelddata.
          </div>
        </div>
      </Section>
    </BusinessPage>
  );
}
