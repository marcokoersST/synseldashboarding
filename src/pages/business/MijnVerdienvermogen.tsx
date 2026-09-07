import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BusinessPage, Section } from "@/components/business/BusinessPage";
import { ruleStatusBadge } from "@/components/business/badges";
import { bonusBlockers, ruleSets } from "@/data/synselBusiness";

export default function MijnVerdienvermogen() {
  return (
    <BusinessPage
      title="Mijn verdienvermogen"
      subtitle="Persoonlijk verdienvermogen volgt uit gevalideerde prestaties en goedgekeurde beloningsregels"
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Lock className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold text-foreground">Nog niet berekenbaar</p>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                De bronregelingen zijn gevonden, maar de rekenregels en persoonlijke grondslag zijn nog niet
                definitief bevestigd.
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                <Mail className="mr-2 h-4 w-4" />
                Documenten opvragen bij de beheerder
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Section
        title="Regelsets"
        description="Alleen een regelset met status goedgekeurd, een geldig datumbereik en een geldige medewerkerstoewijzing kan een berekening voeden."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Regeling</TableHead>
              <TableHead>Versie</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ingangsdatum</TableHead>
              <TableHead>Goedgekeurd door</TableHead>
              <TableHead>Bronverwijzing</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ruleSets.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.version}</TableCell>
                <TableCell>{ruleStatusBadge(r.status)}</TableCell>
                <TableCell>{r.effectiveFrom ?? "—"}</TableCell>
                <TableCell>{r.approvedBy ?? "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.sourceReference}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      <Section
        title="Waarom er nog geen bedrag staat"
        description="Openstaande blokkades die een component blokkeren voor deze medewerker."
      >
        <ul className="space-y-2 text-sm">
          {bonusBlockers.slice(0, 5).map((b) => (
            <li key={b.id} className="flex gap-2">
              <span className="font-mono text-xs text-muted-foreground">{b.id}</span>
              <span className="text-muted-foreground">{b.issue}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Resultaatstaten die dit product gebruikt: Indicatief scenario, Berekend volgens regeling, Door Finance
          bevestigd en Uitbetaald. Een goedgekeurde regel bewijst niet dat iemand het bedrag verdiende of
          uitbetaald kreeg. Een portefeuillemijlpaal van 20 of 26 geeft geen HPC-lidmaatschap. Er is geen
          openbare inkomensranglijst.
        </p>
      </Section>
    </BusinessPage>
  );
}
