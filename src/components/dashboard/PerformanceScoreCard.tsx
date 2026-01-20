import { TrendingUp } from "lucide-react";

const metrics = [
  { label: "Activiteit", value: 8.5, color: "bg-teal" },
  { label: "Conversie", value: 8.2, color: "bg-primary" },
  { label: "Omzet", value: 9.4, color: "bg-success" },
];

export function PerformanceScoreCard() {
  const overallScore = 8.7;
  
  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Prestatie Score</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Totale prestatie indicator</p>
        </div>
        <div className="flex items-center gap-1.5 text-success text-xs font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+12%</span>
        </div>
      </div>
      
      {/* Main Score */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <div className="w-28 h-28 rounded-full border-8 border-progress-bg flex items-center justify-center">
            <div className="text-center">
              <span className="text-3xl font-bold text-foreground">{overallScore}</span>
              <p className="text-xs text-muted-foreground">/10</p>
            </div>
          </div>
          {/* Progress ring overlay */}
          <svg className="absolute inset-0 w-28 h-28 -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="48"
              fill="none"
              stroke="hsl(var(--teal))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(overallScore / 10) * 301.6} 301.6`}
            />
          </svg>
        </div>
      </div>
      
      {/* Metric bars */}
      <div className="space-y-3">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{metric.label}</span>
              <span className="text-xs font-medium text-foreground">{metric.value}/10</span>
            </div>
            <div className="h-1.5 bg-progress-bg rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${metric.color}`}
                style={{ width: `${(metric.value / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
