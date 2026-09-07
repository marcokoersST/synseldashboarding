import { Badge } from "@/components/ui/badge";
import type { EvidenceState } from "@/lib/synselBusiness/calc";

export function evidenceBadge(state: EvidenceState) {
  const map: Record<EvidenceState, string> = {
    waargenomen: "bg-success/10 text-success border-success/30",
    bevestigd: "bg-primary/10 text-primary border-primary/30",
    geschat: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={`capitalize ${map[state]}`}>
      {state}
    </Badge>
  );
}

export function statusBadge(status: string) {
  const map: Record<string, string> = {
    Open: "bg-muted text-muted-foreground border-border",
    Bezig: "bg-primary/10 text-primary border-primary/30",
    Geblokkeerd: "bg-destructive/10 text-destructive border-destructive/30",
    Afgerond: "bg-success/10 text-success border-success/30",
    actief: "bg-success/10 text-success border-success/30",
    "bevestigde-start": "bg-primary/10 text-primary border-primary/30",
    afgerond: "bg-muted text-muted-foreground border-border",
    geannuleerd: "bg-destructive/10 text-destructive border-destructive/30",
    "no-show": "bg-destructive/10 text-destructive border-destructive/30",
  };
  return (
    <Badge variant="outline" className={map[status] ?? "bg-muted text-muted-foreground border-border"}>
      {status}
    </Badge>
  );
}

export function ruleStatusBadge(status: string) {
  const map: Record<string, string> = {
    concept: "bg-muted text-muted-foreground border-border",
    gevalideerd: "bg-primary/10 text-primary border-primary/30",
    goedgekeurd: "bg-success/10 text-success border-success/30",
    ingetrokken: "bg-destructive/10 text-destructive border-destructive/30",
    open: "bg-destructive/10 text-destructive border-destructive/30",
    "in behandeling": "bg-primary/10 text-primary border-primary/30",
    opgelost: "bg-success/10 text-success border-success/30",
  };
  return (
    <Badge variant="outline" className={map[status] ?? "bg-muted text-muted-foreground border-border"}>
      {status}
    </Badge>
  );
}
