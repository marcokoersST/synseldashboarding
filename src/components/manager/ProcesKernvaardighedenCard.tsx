import { useState } from "react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { cn } from "@/lib/utils";
import { consultantSkillData } from "@/data/managerPerformanceData";
import { ChevronDown, ChevronRight } from "lucide-react";

function scoreColor(value: number, max: number): string {
  const pct = (value / max) * 100;
  if (pct >= 75) return "bg-success/15 text-success";
  if (pct >= 50) return "bg-amber-500/15 text-amber-600";
  return "bg-destructive/15 text-destructive";
}

function npsColor(value: number): string {
  if (value >= 50) return "bg-success/15 text-success";
  if (value >= 20) return "bg-amber-500/15 text-amber-600";
  return "bg-destructive/15 text-destructive";
}

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({ title, defaultOpen = true, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium text-muted-foreground hover:text-foreground transition-colors mb-2 w-full"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {title}
      </button>
      {open && children}
    </div>
  );
}

interface ProcesKernvaardighedenCardProps {
  delay?: number;
}

export function ProcesKernvaardighedenCard({ delay = 0 }: ProcesKernvaardighedenCardProps) {
  return (
    <AnimatedCard delay={delay}>
      <div className="bg-card rounded-xl p-5 border border-border h-full flex flex-col">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-foreground">Proces & Kernvaardigheden</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Scores per consultant</p>
        </div>

        <div className="space-y-4 overflow-x-auto">
          {/* Kernvaardigheden */}
          <CollapsibleSection title="Kernvaardigheden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Consultant</th>
                  <th className="text-center py-1.5 px-1 font-medium text-muted-foreground">Rel. Klant</th>
                  <th className="text-center py-1.5 px-1 font-medium text-muted-foreground">Rel. Kand.</th>
                  <th className="text-center py-1.5 px-1 font-medium text-muted-foreground">Pitching</th>
                  <th className="text-center py-1.5 px-1 font-medium text-muted-foreground">Response</th>
                  <th className="text-center py-1.5 px-1 font-medium text-muted-foreground">Netwerk</th>
                </tr>
              </thead>
              <tbody>
                {consultantSkillData.map(c => (
                  <tr key={c.consultantId} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="py-1.5 px-2 font-medium text-foreground whitespace-nowrap">{c.consultantName}</td>
                    <td className="text-center py-1.5 px-1">
                      <span className={cn("inline-block px-2 py-0.5 rounded-md text-xs font-semibold", scoreColor(c.relatieScoreKlant, 10))}>
                        {c.relatieScoreKlant.toFixed(1)}
                      </span>
                    </td>
                    <td className="text-center py-1.5 px-1">
                      <span className={cn("inline-block px-2 py-0.5 rounded-md text-xs font-semibold", scoreColor(c.relatieScoreKandidaat, 10))}>
                        {c.relatieScoreKandidaat.toFixed(1)}
                      </span>
                    </td>
                    <td className="text-center py-1.5 px-1">
                      <span className={cn("inline-block px-2 py-0.5 rounded-md text-xs font-semibold", scoreColor(c.pitchingPower, 100))}>
                        {c.pitchingPower}
                      </span>
                    </td>
                    <td className="text-center py-1.5 px-1">
                      <span className={cn("inline-block px-2 py-0.5 rounded-md text-xs font-semibold", scoreColor(c.responsiveness, 100))}>
                        {c.responsiveness}
                      </span>
                    </td>
                    <td className="text-center py-1.5 px-1">
                      <span className={cn("inline-block px-2 py-0.5 rounded-md text-xs font-semibold", scoreColor(c.networking, 100))}>
                        {c.networking}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CollapsibleSection>

          {/* Procedure & NPS */}
          <CollapsibleSection title="Procedure & NPS">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Consultant</th>
                  <th className="text-center py-1.5 px-1 font-medium text-muted-foreground">Inschr.</th>
                  <th className="text-center py-1.5 px-1 font-medium text-muted-foreground">Acq.</th>
                  <th className="text-center py-1.5 px-1 font-medium text-muted-foreground">NPS Klant</th>
                  <th className="text-center py-1.5 px-1 font-medium text-muted-foreground">NPS Kand.</th>
                </tr>
              </thead>
              <tbody>
                {consultantSkillData.map(c => (
                  <tr key={c.consultantId} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="py-1.5 px-2 font-medium text-foreground whitespace-nowrap">{c.consultantName}</td>
                    <td className="text-center py-1.5 px-1">
                      <span className={cn("inline-block px-2 py-0.5 rounded-md text-xs font-semibold", scoreColor(c.procedureInschrijving, 100))}>
                        {c.procedureInschrijving}
                      </span>
                    </td>
                    <td className="text-center py-1.5 px-1">
                      <span className={cn("inline-block px-2 py-0.5 rounded-md text-xs font-semibold", scoreColor(c.procedureAcquisities, 100))}>
                        {c.procedureAcquisities}
                      </span>
                    </td>
                    <td className="text-center py-1.5 px-1">
                      <span className={cn("inline-block px-2 py-0.5 rounded-md text-xs font-semibold", npsColor(c.npsKlant))}>
                        {c.npsKlant}
                      </span>
                    </td>
                    <td className="text-center py-1.5 px-1">
                      <span className={cn("inline-block px-2 py-0.5 rounded-md text-xs font-semibold", npsColor(c.npsKandidaat))}>
                        {c.npsKandidaat}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CollapsibleSection>

          {/* Systeem Hygiëne */}
          <CollapsibleSection title="Systeem Hygiëne" defaultOpen={false}>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Consultant</th>
                  <th className="text-center py-1.5 px-1 font-medium text-muted-foreground">Score</th>
                  <th className="text-center py-1.5 px-1 font-medium text-muted-foreground">Vac. +</th>
                  <th className="text-center py-1.5 px-1 font-medium text-muted-foreground">Kl. nieuw</th>
                  <th className="text-center py-1.5 px-1 font-medium text-muted-foreground">Ct. +</th>
                  <th className="text-center py-1.5 px-1 font-medium text-muted-foreground">Ct. lost</th>
                </tr>
              </thead>
              <tbody>
                {consultantSkillData.map(c => (
                  <tr key={c.consultantId} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="py-1.5 px-2 font-medium text-foreground whitespace-nowrap">{c.consultantName}</td>
                    <td className="text-center py-1.5 px-1">
                      <span className={cn("inline-block px-2 py-0.5 rounded-md text-xs font-semibold", scoreColor(c.systeemHygieneScore, 100))}>
                        {c.systeemHygieneScore}
                      </span>
                    </td>
                    <td className="text-center py-1.5 px-1 tabular-nums">{c.systeemHygiene.vacaturesAdded}</td>
                    <td className="text-center py-1.5 px-1 tabular-nums">{c.systeemHygiene.klantenNew}</td>
                    <td className="text-center py-1.5 px-1 tabular-nums">{c.systeemHygiene.contactenAdded}</td>
                    <td className="text-center py-1.5 px-1 tabular-nums text-destructive">{c.systeemHygiene.contactenLost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CollapsibleSection>
        </div>
      </div>
    </AnimatedCard>
  );
}
