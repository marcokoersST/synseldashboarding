import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BusinessPage, Section } from "@/components/business/BusinessPage";
import { statusBadge } from "@/components/business/badges";
import { priorityDeals } from "@/data/synselBusiness";
import { DEFAULT_ASSUMPTIONS, formatDate, formatEuro } from "@/lib/synselBusiness/calc";

export default function MijnDeals() {
  return (
    <BusinessPage
      title="Mijn deals"
      subtitle="De twee of drie deals die deze week moeten bewegen"
    >
      <Section
        title="Prioriteitsdeals"
        description="Een actie afronden werkt de lokale coachingregistratie bij. Het bron-CRM wordt nooit stil bijgewerkt; gebruik Bron bekijken om het juiste record te openen."
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal</TableHead>
                <TableHead>Opdrachtgever</TableHead>
                <TableHead>Fase</TableHead>
                <TableHead>Reden</TableHead>
                <TableHead>Volgende actie</TableHead>
                <TableHead>Eigenaar</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Potentiële marge</TableHead>
                <TableHead>Bron</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priorityDeals.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.deal}</TableCell>
                  <TableCell>{d.employer}</TableCell>
                  <TableCell>{d.stage}</TableCell>
                  <TableCell className="max-w-[220px] text-xs text-muted-foreground">{d.reason}</TableCell>
                  <TableCell className="max-w-[240px] text-xs">{d.nextAction}</TableCell>
                  <TableCell>{d.owner}</TableCell>
                  <TableCell>{formatDate(d.dueDate)}</TableCell>
                  <TableCell>
                    {statusBadge(d.status)}
                    {d.status === "Geblokkeerd" && (
                      <p className="mt-1 text-[11px] text-destructive">
                        {d.blocker} · herbeoordeling {formatDate(d.reviewDate ?? null, "onbekend")}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatEuro(d.potentialMarginPerWeek * d.expectedDurationWeeks)}
                    <p className="text-[11px] text-muted-foreground">
                      potentieel over {d.expectedDurationWeeks} weken
                    </p>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={d.sourceUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Potentiële marge is een expliciet potentieel: verwachte factureerbare uren over de looptijd maal de
          marge per uur, bij {DEFAULT_ASSUMPTIONS.hoursPerWeek} uur per week als aanname. Het is geen
          gerealiseerde of geboekte marge.
        </p>
      </Section>

      <Section title="Coaching bij deze deals" description="Notities en oefeningen die door de manager zijn vastgelegd.">
        <div className="space-y-3">
          {priorityDeals.map((d) => (
            <div key={d.id} className="rounded-lg border border-border p-4 text-sm">
              <p className="font-medium text-foreground">{d.deal} · {d.employer}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Coachingnotitie: {d.coachingNote ?? "nog geen notitie"}
              </p>
              <p className="text-xs text-muted-foreground">
                Afgesproken oefening: {d.skillPractice ?? "nog geen oefening"}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </BusinessPage>
  );
}
