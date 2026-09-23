import { Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface RankingDevInfoProps {
  source: string;
  filters: string;
  ranking: string;
  calculations: string[];
  rowCount: number;
}

export function RankingDevInfo({ source, filters, ranking, calculations, rowCount }: RankingDevInfoProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" className="h-8 shrink-0 gap-1.5 bg-destructive px-2.5 text-xs text-destructive-foreground hover:bg-destructive/90">
          <Code2 className="h-3.5 w-3.5" />
          Dev info
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(420px,calc(100vw-2rem))] p-0 text-xs">
        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">Developer info</span>
          <Badge variant="secondary" className="text-[10px]">n = {rowCount}</Badge>
        </div>
        <div className="max-h-[70vh] space-y-3 overflow-y-auto p-3">
          <InfoBlock label="Databron" value={source} />
          <InfoBlock label="Filters" value={filters} />
          <InfoBlock label="Rangschikking" value={ranking} />
          <div>
            <div className="mb-1 text-[10px] font-medium uppercase text-muted-foreground">Berekeningen</div>
            <ul className="list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-foreground/90">
              {calculations.map((calculation) => <li key={calculation}>{calculation}</li>)}
            </ul>
          </div>
          <div className="rounded border border-destructive/20 bg-destructive/5 p-2 text-[11px] leading-relaxed text-muted-foreground">
            Mockdata voor ontwikkeldoeleinden; later vervangen door de definitieve bronkoppeling.
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-medium uppercase text-muted-foreground">{label}</div>
      <p className="text-[11px] leading-relaxed text-foreground/90">{value}</p>
    </div>
  );
}