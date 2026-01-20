const funnelStages = [
  { label: "Leads", count: 450, percentage: 100, width: 100 },
  { label: "Eerste contact", count: 245, percentage: 54, width: 80 },
  { label: "Intake gesprek", count: 89, percentage: 20, width: 60 },
  { label: "CV Check", count: 34, percentage: 8, width: 40 },
  { label: "Geplaatst", count: 5, percentage: 1, width: 20 },
];

export function RecruitmentFunnel() {
  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="mb-6">
        <h3 className="text-sm font-medium text-foreground">Wervingstrechter</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Conversie per fase</p>
      </div>
      
      <div className="relative">
        {/* Funnel visualization */}
        <div className="flex items-end justify-between gap-2 h-32 mb-4">
          {funnelStages.map((stage, index) => (
            <div 
              key={stage.label} 
              className="flex-1 flex flex-col items-center"
            >
              <div 
                className="w-full rounded-t-lg bg-gradient-to-t from-teal to-teal/60 transition-all"
                style={{ 
                  height: `${stage.width}%`,
                  opacity: 1 - (index * 0.15)
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Labels */}
        <div className="flex justify-between gap-2">
          {funnelStages.map((stage) => (
            <div key={stage.label} className="flex-1 text-center">
              <p className="text-xs font-medium text-foreground">{stage.count}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{stage.label}</p>
              <p className="text-[10px] font-medium text-teal mt-0.5">{stage.percentage}%</p>
            </div>
          ))}
        </div>
        
        {/* Connecting lines */}
        <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none">
          <svg className="w-full h-full" preserveAspectRatio="none">
            {funnelStages.slice(0, -1).map((_, index) => {
              const x1 = (100 / funnelStages.length) * (index + 0.5);
              const x2 = (100 / funnelStages.length) * (index + 1.5);
              return (
                <line
                  key={index}
                  x1={`${x1}%`}
                  y1="50%"
                  x2={`${x2}%`}
                  y2="50%"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
