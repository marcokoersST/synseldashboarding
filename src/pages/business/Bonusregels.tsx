import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BusinessPage, Section } from "@/components/business/BusinessPage";
import { ruleStatusBadge } from "@/components/business/badges";
import { bonusBlockers, ruleSets } from "@/data/synselBusiness";

export default function Bonusregels() {
  return (
    <BusinessPage
      title="Bonusregels"
      subtitle="Alleen voor beloningsbeheerders. Een concept mag worden bekeken, maar kan geen inkomenskaart, financieel label of export voeden."
    >
      <Section
        title="Regelsetstatussen"
        description="Een bron lezen of één blokkade oplossen promoveert een regel niet automatisch naar goedgekeurd. Alleen een bevoegde HR/Finance-goedkeurder keurt goed, met identiteit, tijdstempel en ingangsdatum."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Regeling</TableHead>
              <TableHead>Versie</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ingangsdatum</TableHead>
              <TableHead>Goedgekeurd door</TableHead>
              <TableHead>Goedgekeurd op</TableHead>
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
                <TableCell>{r.approvedAt ?? "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.sourceReference}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="mt-3 text-xs text-muted-foreground">
          Mogelijke statussen: concept, gevalideerd, goedgekeurd en ingetrokken. De actieve berekening vraagt
          expliciet om status goedgekeurd, een geldig datumbereik en een geldige medewerkerstoewijzing.
        </p>
      </Section>

      <Section
        title="Blokkaderegister"
        description="Zolang een blokkade voor een component en medewerker openstaat, levert die component geen bevestigde aanspraak of uitbetaalprognose."
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Onopgelost bronprobleem</TableHead>
                <TableHead>Vereist besluit</TableHead>
                <TableHead>Eigenaar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bronverwijzing</TableHead>
                <TableHead>Opgelost op</TableHead>
                <TableHead>Goedgekeurd door</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bonusBlockers.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{b.id}</TableCell>
                  <TableCell className="max-w-[320px] text-xs">{b.issue}</TableCell>
                  <TableCell className="max-w-[320px] text-xs text-muted-foreground">{b.decision}</TableCell>
                  <TableCell className="text-xs">{b.owner}</TableCell>
                  <TableCell>{ruleStatusBadge(b.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{b.sourceReference}</TableCell>
                  <TableCell>{b.resolvedAt ?? "—"}</TableCell>
                  <TableCell>{b.approvedBy ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section title="Concept-broninterpretatie" description="Vastgelegd als concept, met bronverwijzing per regel. Geen bedragen worden als iemands berekende inkomen getoond.">
        <ul className="list-inside list-disc space-y-2 text-xs text-muted-foreground">
          <li>HPC 7.5 Ton: rolling-forecastdrempel van minimaal € 750.000 en € 1.000 per kalendermaand.</li>
          <li>HPC Million: minimaal € 1.000.000 en € 2.000 per kalendermaand. Million gaat voor 7.5 Ton; de trappen zijn onderling exclusief en mogen niet worden opgeteld.</li>
          <li>Buiten vakantieperioden vereist continuering zowel de forecastdrempel als gemiddeld minimaal drie werkelijke starts per periode over de laatste drie niet-vakantieperioden.</li>
          <li>De clubbonus loopt volgens de bron door in vakantieperioden, maar de vakantiekalender is intern tegenstrijdig.</li>
          <li>Fast Growers: € 500 per maand, groei van minimaal € 7.500 bij vergelijking van de laatste drie met de voorgaande drie niet-vakantieperioden, met uitsluiting van wervingsfees en vroege overname-inkomsten.</li>
        </ul>
      </Section>
    </BusinessPage>
  );
}
