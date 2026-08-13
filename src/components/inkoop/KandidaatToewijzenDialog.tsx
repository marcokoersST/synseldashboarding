import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronsUpDown, FileText, Mail, MapPin, Phone, Tag, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { ToeTeWijzenKandidaat } from "@/data/toewijzenKandidaten";

interface Props {
  kandidaat: ToeTeWijzenKandidaat | null;
  titels: string[];
  assignedTitel?: string | null;
  onAssign: (kandidaatId: string, titel: string) => void;
  onConfirm: (kandidaatId: string) => void;
  onClose: () => void;
}

function ProfileLinks({ crmId, synselId }: { crmId: string; synselId: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <a
        href={`https://app.recruitcrm.io/v1/candidates?q=${encodeURIComponent(crmId)}`}
        target="_blank" rel="noopener noreferrer" title="Open in Recruit CRM"
        className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs hover:bg-muted transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#0066FF" />
          <text x="12" y="17" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif">R</text>
        </svg>
        Recruit CRM
      </a>
      <a
        href={`https://ai.synsel.nl/candidates/${encodeURIComponent(synselId)}`}
        target="_blank" rel="noopener noreferrer" title="Open in Synsel AI"
        className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs hover:bg-muted transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="hsl(var(--accent))" />
          <text x="12" y="17" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif">S</text>
        </svg>
        Synsel AI
      </a>
    </span>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <Icon className="h-3.5 w-3.5 mt-0.5 text-[#bfa16b] shrink-0" />
      <span className="text-muted-foreground w-28 shrink-0">{label}</span>
      <span className="font-medium break-words">{value}</span>
    </div>
  );
}

export function KandidaatToewijzenDialog({ kandidaat, titels, assignedTitel, onAssign, onClose }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!kandidaat) return null;
  const cv = kandidaat.cv;

  return (
    <Dialog open={!!kandidaat} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border">
          <DialogTitle className="text-base flex items-center gap-2 flex-wrap">
            {kandidaat.naam}
            <Badge variant="secondary" className="text-xs">{kandidaat.status}</Badge>
            {assignedTitel && (
              <Badge className="text-xs bg-emerald-600 hover:bg-emerald-600">Toegewezen: {assignedTitel}</Badge>
            )}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">{kandidaat.rcrmFunctie} · {kandidaat.functiegroep}</p>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-0 max-h-[calc(90vh-6rem)]">
          {/* ─── Links: kandidaatinfo + toewijzen ─── */}
          <div className="p-6 space-y-5 overflow-y-auto border-r border-border">
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">RecruitCRM-informatie</div>
              <Row icon={User} label="Naam" value={kandidaat.naam} />
              <Row icon={Tag} label="Functiegroep" value={kandidaat.functiegroep} />
              <Row icon={Tag} label="Functie" value={kandidaat.rcrmFunctie} />
              <Row icon={MapPin} label="Provincie" value={kandidaat.provincie} />
              <Row icon={User} label="Consultant" value={kandidaat.consultant} />
              <Row icon={FileText} label="Binnenkomst" value={kandidaat.datumBinnenkomst} />
              <Row icon={FileText} label="Bron" value={kandidaat.bron} />
              <Row icon={Phone} label="Telefoon" value={cv.telefoon} />
              <Row icon={Mail} label="E-mail" value={cv.email} />
            </div>

            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Profielen</div>
              <ProfileLinks crmId={kandidaat.crmId} synselId={kandidaat.synselId} />
            </div>

            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Genormaliseerde titel</div>
              <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                <PopoverTrigger asChild>
                  <Button className="w-full justify-between" size="sm">
                    {assignedTitel ? `Wijzig titel — ${assignedTitel}` : "Toewijzen aan genormaliseerde titel"}
                    <ChevronsUpDown className="h-4 w-4 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[340px] p-0">
                  <Command>
                    <CommandInput placeholder="Zoek genormaliseerde titel..." />
                    <CommandList className="max-h-[280px]">
                      <CommandEmpty>Geen titel gevonden.</CommandEmpty>
                      <CommandGroup heading={`${titels.length} titels`}>
                        {titels.map((t) => (
                          <CommandItem
                            key={t}
                            value={t}
                            onSelect={() => {
                              onAssign(kandidaat.id, t);
                              setPickerOpen(false);
                              toast({ title: "Titel toegewezen", description: `${kandidaat.naam} → ${t}` });
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${assignedTitel === t ? "opacity-100" : "opacity-0"}`} />
                            {t}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-[11px] text-muted-foreground">
                Zoek en scroll door de volledige lijst met genormaliseerde titels.
              </p>
            </div>
          </div>

          {/* ─── Rechts: CV ─── */}
          <div className="bg-muted/30">
            <div className="px-5 py-2 border-b border-border flex items-center gap-2 text-xs font-medium">
              <FileText className="h-3.5 w-3.5 text-[#bfa16b]" /> CV — {kandidaat.naam}
            </div>
            <ScrollArea className="h-[calc(90vh-9rem)]">
              <div className="p-5">
                <div className="bg-background border border-border rounded-md p-6 space-y-5 shadow-sm">
                  <div className="border-b border-border pb-3">
                    <div className="text-lg font-semibold">{kandidaat.naam}</div>
                    <div className="text-sm text-muted-foreground">{cv.headline}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                      {cv.woonplaats} · {cv.telefoon} · {cv.email}
                    </div>
                  </div>

                  <section className="space-y-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#bfa16b]">Profiel</h4>
                    <p className="text-xs leading-relaxed">{cv.samenvatting}</p>
                  </section>

                  <section className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#bfa16b]">Werkervaring</h4>
                    {cv.ervaring.map((e, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs font-medium">{e.rol} — {e.bedrijf}</span>
                          <span className="text-[11px] text-muted-foreground shrink-0">{e.periode}</span>
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {e.bullets.map((b, j) => <li key={j} className="text-[11px] text-muted-foreground">{b}</li>)}
                        </ul>
                      </div>
                    ))}
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#bfa16b]">Opleiding</h4>
                    {cv.opleiding.map((o, i) => (
                      <div key={i} className="flex items-baseline justify-between gap-2">
                        <span className="text-xs">{o.opleiding} — {o.instituut}</span>
                        <span className="text-[11px] text-muted-foreground shrink-0">{o.periode}</span>
                      </div>
                    ))}
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#bfa16b]">Vaardigheden</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {cv.skills.map((s) => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#bfa16b]">Talen</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {cv.talen.map((s) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                    </div>
                  </section>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
