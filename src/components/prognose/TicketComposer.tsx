import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import type { BottleneckCategory } from "@/data/prognoseData";
import { createTicket, getLastAuthor } from "@/data/prognoseTickets";

const CATEGORIES: (BottleneckCategory | "Anders")[] = [
  "Te weinig acquisities",
  "Lage voorstel-ratio",
  "Telefonie onder norm",
  "Intake-uitval",
  "Plaatsingsachterstand",
  "Anders",
];

interface Props {
  consultantId: string;
  defaultCategory?: BottleneckCategory | "Anders";
  onCancel: () => void;
  onCreated: () => void;
}

export function TicketComposer({ consultantId, defaultCategory, onCancel, onCreated }: Props) {
  const [category, setCategory] = useState<string>(defaultCategory || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState(getLastAuthor());
  const [followUp, setFollowUp] = useState("");

  const submit = () => {
    if (!category || !title.trim()) return;
    createTicket({
      consultantId,
      category: category as BottleneckCategory | "Anders",
      title: title.trim(),
      description: description.trim(),
      owner,
      followUpDate: followUp || undefined,
    });
    onCreated();
  };

  return (
    <div className="rounded-lg border-2 border-primary/40 bg-card p-3 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Nieuwe interventie</h4>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Categorie *</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Kies categorie" /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Titel *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Korte omschrijving" className="h-9" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Beschrijving</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Wat moet er gebeuren..."
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label className="text-xs">Eigenaar</Label>
          <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Naam" className="h-9" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Opvolging</Label>
          <Input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="h-9" />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Button onClick={submit} disabled={!category || !title.trim()} className="flex-1">
          Ticket aanmaken
        </Button>
        <Button variant="outline" onClick={onCancel}>Annuleren</Button>
      </div>
    </div>
  );
}
