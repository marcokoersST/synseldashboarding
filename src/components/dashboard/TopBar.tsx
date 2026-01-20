import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const periods = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12", "P13"];

export function TopBar() {
  return (
    <div className="h-14 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Zoeken..." 
          className="pl-10 h-9 bg-secondary border-0 text-sm"
        />
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
        {periods.map((period, index) => (
          <button
            key={period}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              index === 5 
                ? "bg-card text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {period}
          </button>
        ))}
      </div>
    </div>
  );
}
