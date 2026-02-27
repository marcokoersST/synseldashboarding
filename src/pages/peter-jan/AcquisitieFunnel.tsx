import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { acquisitionFunnelData } from "@/data/acquisitionFunnelData";

function conversionColor(pct: number) {
  if (pct >= 50) return "text-emerald-500";
  if (pct >= 25) return "text-amber-500";
  return "text-red-500";
}

const AcquisitieFunnel = () => {
  const totals = acquisitionFunnelData.reduce(
    (acc, r) => ({
      toegewezen: acc.toegewezen + r.toegewezen,
      ingeschreven: acc.ingeschreven + r.ingeschreven,
      acquisitie: acc.acquisitie + r.acquisitie,
    }),
    { toegewezen: 0, ingeschreven: 0, acquisitie: 0 }
  );

  const totalConv1 = (totals.ingeschreven / totals.toegewezen) * 100;
  const totalConv2 = (totals.acquisitie / totals.ingeschreven) * 100;

  return (
    <ConsultantLayout
      title="Acquisitie Funnel"
      subtitle="Conversie van toegewezen kandidaten naar acquisitie"
    >
      <Card className="border border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold">Consultant</TableHead>
                <TableHead className="font-semibold">Unit</TableHead>
                <TableHead className="text-right font-semibold">Toegewezen</TableHead>
                <TableHead className="text-right font-semibold">Ingeschreven</TableHead>
                <TableHead className="text-right font-semibold">Conversie %</TableHead>
                <TableHead className="text-right font-semibold">Acquisitie</TableHead>
                <TableHead className="text-right font-semibold">Conversie %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acquisitionFunnelData.map((row) => {
                const conv1 = (row.ingeschreven / row.toegewezen) * 100;
                const conv2 = (row.acquisitie / row.ingeschreven) * 100;
                return (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-muted-foreground">{row.unit}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.toegewezen}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.ingeschreven}</TableCell>
                    <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(conv1)}`}>
                      {conv1.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.acquisitie}</TableCell>
                    <TableCell className={`text-right tabular-nums font-semibold ${conversionColor(conv2)}`}>
                      {conv2.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* Totaalrij */}
              <TableRow className="bg-muted/40 border-t-2 border-border font-bold">
                <TableCell className="font-bold">Totaal</TableCell>
                <TableCell />
                <TableCell className="text-right tabular-nums font-bold">{totals.toegewezen}</TableCell>
                <TableCell className="text-right tabular-nums font-bold">{totals.ingeschreven}</TableCell>
                <TableCell className={`text-right tabular-nums font-bold ${conversionColor(totalConv1)}`}>
                  {totalConv1.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right tabular-nums font-bold">{totals.acquisitie}</TableCell>
                <TableCell className={`text-right tabular-nums font-bold ${conversionColor(totalConv2)}`}>
                  {totalConv2.toFixed(1)}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ConsultantLayout>
  );
};

export default AcquisitieFunnel;
