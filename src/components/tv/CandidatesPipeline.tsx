import { candidatePipeline } from "@/data/tvData";

export function CandidatesPipeline() {
  const total = candidatePipeline.reduce((s, p) => s + p.count, 0);

  return (
    <div className="bg-card rounded-xl p-5 border border-border h-full">
      <h3 className="text-sm font-semibold text-foreground mb-1">Kandidaten in Procedure</h3>
      <p className="text-2xl font-bold text-foreground mb-4">{total} <span className="text-sm font-normal text-muted-foreground">kandidaten actief</span></p>
      <div className="space-y-3">
        {candidatePipeline.map((phase) => (
          <div key={phase.phase}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">{phase.phase}</span>
              <span className="font-medium text-foreground">{phase.count}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(phase.count / total) * 100}%`, backgroundColor: phase.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
