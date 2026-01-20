import { TrendingUp } from "lucide-react";

export function SalaryProgressCard() {
  const progress = 68;
  
  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Salaristrap Progressie</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Op weg naar je volgende salaristrap</p>
        </div>
        <div className="flex items-center gap-1.5 text-success text-xs font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+12%</span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative mb-3">
        <div className="h-2.5 bg-progress-bg rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-gold rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Progress Indicator */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-gold rounded-full border-2 border-card shadow-md"
          style={{ left: `calc(${progress}% - 8px)` }}
        />
      </div>
      
      {/* Labels */}
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="text-muted-foreground">Huidig: </span>
          <span className="font-semibold text-foreground">€3,000</span>
        </div>
        <div className="text-center">
          <span className="font-bold text-lg text-primary">{progress}%</span>
        </div>
        <div className="text-right">
          <span className="text-muted-foreground">Doel: </span>
          <span className="font-semibold text-foreground">€3,500</span>
        </div>
      </div>
      
      {/* Annual salary note */}
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Jaarsalaris doel: <span className="font-semibold text-foreground">€42,000</span>
        </p>
      </div>
    </div>
  );
}
