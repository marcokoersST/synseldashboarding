import { TrendingUp } from "lucide-react";

export function RevenueTargetCard() {
  const current = 36000;
  const goal = 40000;
  const remaining = goal - current;
  const percentage = (current / goal) * 100;
  
  // Calculate the stroke dasharray for the semi-circle
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
  
  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Omzet Doelstelling</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Maandelijks target</p>
        </div>
        <div className="flex items-center gap-1.5 text-success text-xs font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>90%</span>
        </div>
      </div>
      
      {/* Semi-circular Progress */}
      <div className="relative flex justify-center mb-4">
        <svg width="180" height="100" viewBox="0 0 180 100">
          {/* Background arc */}
          <path
            d="M 10 90 A 80 80 0 0 1 170 90"
            fill="none"
            stroke="hsl(var(--progress-bg))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d="M 10 90 A 80 80 0 0 1 170 90"
            fill="none"
            stroke="hsl(var(--teal))"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            className="transition-all duration-500"
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
          <span className="text-2xl font-bold text-foreground">€{(current / 1000).toFixed(0)}k</span>
          <p className="text-xs text-muted-foreground">van €{(goal / 1000).toFixed(0)}k</p>
        </div>
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Huidige omzet</p>
          <p className="text-lg font-semibold text-foreground">€{current.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Nog te gaan</p>
          <p className="text-lg font-semibold text-primary">€{remaining.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
