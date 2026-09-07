import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BusinessPage, Section } from "@/components/business/BusinessPage";
import { auditTrail, sourceStatuses } from "@/data/synselBusiness";
import { DEFAULT_ASSUMPTIONS, formatEuro } from "@/lib/synselBusiness/calc";

const definitions = [
  { metric: "Actieve professionals op datum", definition: "Unieke professionals in geldige actieve opdrachtepisodes op die datum, met gedocumenteerde exclusieve einddatumconventie" },
  { metric: "Werkelijke starts", definition: "Vastgelegde werkelijke startgebeurtenissen binnen het geselecteerde datuminterval" },
  { metric: "Werkelijke uitstroom", definition: "Vastgelegde werkelijke uitstroomgebeurtenissen binnen hetzelfde interval" },
  { metric: "Netto commerciële groei", definition: "Werkelijke starts min werkelijke uitstroom, exclusief eigendomsoverdrachten" },
  { metric: "Portefeuillemutatie", definition: "Netto commerciële groei plus inkomende min uitgaande eigendomsoverdrachten" },
  { metric: "Geplande weekmarge", definition: "Som van verwachte factureerbare weekuren maal brutomarge per uur over actieve opdrachtepisodes" },
  { metric: "Geannualiseerde huidige marge", definition: "Geplande weekmarge maal 52, expliciet gelabeld als constant-niveau scenario" },
  { metric: "Werkelijke brutomarge", definition: "Gereconcilieerde geboekte of goedgekeurde financiële records over de werkelijke periode, inclusief correcties" },
  { metric: "Prognose jaarmarge", definition: "Werkelijke marge tot de afkapdatum plus prognosebijdrage daarna, zonder overlap" },
  { metric: "Potentiële plaatsingsmarge", definition: "Verwachte factureerbare uren over de resterende of volledige looptijd maal marge per uur, expliciet potentieel" },
  { metric: "Equivalent benodigd actief aantal", definition: "Financieel margedoel gedeeld door gevalideerde jaarmarge per vergelijkbare actieve professional" },
  { metric: "Benodigd heel actief aantal", definition: "Naar boven afgerond equivalent aantal, bij het vereenvoudigde homogene planningsmodel" },
  { metric: "Onderhoudsstarts per week", definition: "Benodigd equivalent actief aantal gedeeld door verwachte looptijd in weken, expliciet steady-state" },
];

export default function Beheer() {
  return (
    <BusinessPage title="Beheer" subtitle="Bronversheid, rekenregeldefinities en audittrail">
      <Section title="Bronnen en sync" description="Ontbrekende of verouderde data blijft zichtbaar en wordt nooit stil vervangen door voorbeelddata of nullen.">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bron</TableHead>
                <TableHead>Verantwoordelijkheid</TableHead>
                <TableHead>Laatste geslaagde sync</TableHead>
                <TableHead>Watermerk</TableHead>
                <TableHead className="text-right">In</TableHead>
                <TableHead className="text-right">Uit</TableHead>
                <TableHead className="text-right">Afgekeurd</TableHead>
                <TableHead>Staat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sourceStatuses.map((s) => (
                <TableRow key={s.name}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.role}</TableCell>
                  <TableCell>{s.lastSync ?? "—"}</TableCell>
                  <TableCell>{s.watermark ?? "—"}</TableCell>
                  <TableCell className="text-right">{s.recordsIn ?? "—"}</TableCell>
                  <TableCell className="text-right">{s.recordsOut ?? "—"}</TableCell>
                  <TableCell className="text-right">{s.rejected ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={s.state === "fixture" ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground"}>
                      {s.state}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section title="Rekenregeldefinities" description={`Aannameset: ${DEFAULT_ASSUMPTIONS.hoursPerWeek} uur per week, ${formatEuro(DEFAULT_ASSUMPTIONS.marginPerHour, 2)} per uur, ${DEFAULT_ASSUMPTIONS.durationWeeks} weken looptijd, ${DEFAULT_ASSUMPTIONS.annualWeeks} weken annualisatie.`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">Maatstaf</TableHead>
              <TableHead>Definitie</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {definitions.map((d) => (
              <TableRow key={d.metric}>
                <TableCell className="font-medium">{d.metric}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{d.definition}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="mt-3 text-xs text-muted-foreground">
          13 perioden van vier weken, kalendermaanden, een voortschrijdend venster van 28 dagen en een
          annualisatie over 52 weken zijn niet gelijk aan elkaar. De werkelijke rapportagekalender van Synsel
          moet worden geïmporteerd of expliciet geconfigureerd.
        </p>
      </Section>

      <Section title="Audittrail" description="Wie wat wanneer wijzigde, inclusief lokale coachingregistraties.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tijdstip</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Actie</TableHead>
              <TableHead>Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditTrail.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-mono text-xs">{a.at}</TableCell>
                <TableCell>{a.actor}</TableCell>
                <TableCell>{a.action}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{a.detail}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>
    </BusinessPage>
  );
}
