import { Info, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function JiglerDataNotice() {
  return (
    <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2">
      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
      <p className="text-xs text-muted-foreground flex-1">
        Data via Jigler BV — dagelijks geüpdatet. Zie je iets misgaan?
      </p>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 px-2 text-[10px] gap-1 rounded-full">
            <HelpCircle className="w-3 h-3" />
            Help
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Data probleem melden</DialogTitle>
            <DialogDescription>
              De financiële data op deze pagina wordt dagelijks opgehaald vanuit Jigler BV. Als je een fout ziet of data niet klopt:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border p-3">
              <p className="font-medium mb-1">1. Neem contact op met je manager</p>
              <p className="text-muted-foreground text-xs">Je manager kan direct controleren of de data correct is doorgekomen.</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-medium mb-1">2. Mail support</p>
              <p className="text-muted-foreground text-xs">
                Stuur een mail naar <span className="font-medium text-foreground">support@synsel.nl</span> met een screenshot en beschrijving van het probleem.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Data wordt elke nacht gesynchroniseerd. Wijzigingen in Jigler zijn de volgende ochtend zichtbaar.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
