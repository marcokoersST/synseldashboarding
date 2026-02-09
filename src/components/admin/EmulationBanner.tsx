import { AlertTriangle, X } from "lucide-react";
import { EmulationUser } from "@/data/adminData";

interface EmulationBannerProps {
  user: EmulationUser;
  onStop: () => void;
}

export function EmulationBanner({ user, onStop }: EmulationBannerProps) {
  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Je bekijkt het dashboard als: <span className="text-amber-600 font-semibold">{user.name}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {user.department} · {user.role === "manager" ? "Manager" : "Consultant"}
          </p>
        </div>
      </div>
      <button
        onClick={onStop}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 text-sm font-medium transition-colors"
      >
        <X className="w-4 h-4" />
        Stoppen
      </button>
    </div>
  );
}
