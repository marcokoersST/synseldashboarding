import { useState } from "react";
import { Search, User, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { emulationUsers, EmulationUser } from "@/data/adminData";
import { cn } from "@/lib/utils";

interface UserSelectorProps {
  selectedUser: EmulationUser | null;
  onSelectUser: (user: EmulationUser) => void;
}

export function UserSelector({ selectedUser, onSelectUser }: UserSelectorProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = emulationUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.department.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = {
    manager: filtered.filter(u => u.role === "manager"),
    consultant: filtered.filter(u => u.role === "consultant"),
  };

  return (
    <div className="bg-card rounded-xl p-5 border border-border mb-5">
      <h3 className="text-sm font-medium text-foreground mb-3">Selecteer een gebruiker om te emuleren</h3>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder="Zoek op naam, rol of afdeling..."
          className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {isOpen && (
        <div className="mt-2 max-h-[350px] overflow-y-auto border border-border rounded-lg bg-card divide-y divide-border">
          {grouped.manager.length > 0 && (
            <div>
              <div className="px-3 py-2 bg-muted/30">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3" /> Managers
                </span>
              </div>
              {grouped.manager.map(user => (
                <UserRow key={user.id} user={user} isSelected={selectedUser?.id === user.id} onClick={() => { onSelectUser(user); setIsOpen(false); setSearch(""); }} />
              ))}
            </div>
          )}
          {grouped.consultant.length > 0 && (
            <div>
              <div className="px-3 py-2 bg-muted/30">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3 h-3" /> Consultants
                </span>
              </div>
              {grouped.consultant.map(user => (
                <UserRow key={user.id} user={user} isSelected={selectedUser?.id === user.id} onClick={() => { onSelectUser(user); setIsOpen(false); setSearch(""); }} />
              ))}
            </div>
          )}
          {filtered.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">Geen gebruikers gevonden</div>
          )}
        </div>
      )}
    </div>
  );
}

function UserRow({ user, isSelected, onClick }: { user: EmulationUser; isSelected: boolean; onClick: () => void }) {
  const initials = user.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  return (
    <button onClick={onClick} className={cn(
      "w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors",
      isSelected && "bg-primary/10"
    )}>
      <Avatar className="w-8 h-8">
        <AvatarImage src={user.avatar} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.department} · {user.role === "manager" ? "Manager" : "Consultant"}</p>
      </div>
    </button>
  );
}
