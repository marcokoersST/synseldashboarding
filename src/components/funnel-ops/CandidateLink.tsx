import { ExternalLink } from "lucide-react";
import { rcrmCandidateUrl, rcrmUserUrl } from "@/data/funnelOperationsData";
import { cn } from "@/lib/utils";

interface Props { id: string; name: string; className?: string; }

export function CandidateLink({ id, name, className }: Props) {
  return (
    <a
      href={rcrmCandidateUrl(id)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex items-center gap-1 text-foreground hover:text-primary transition-colors group", className)}
    >
      <span className="truncate">{name}</span>
      <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 shrink-0" />
    </a>
  );
}

export function UserLink({ id, name, className }: Props) {
  return (
    <a
      href={rcrmUserUrl(id)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex items-center gap-1 text-foreground hover:text-primary transition-colors group", className)}
    >
      <span className="truncate">{name}</span>
      <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 shrink-0" />
    </a>
  );
}
