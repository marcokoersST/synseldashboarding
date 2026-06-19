import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { consultantSkillData } from "@/data/managerPerformanceData";
import { consultantFunnelDataV2, funnelStepsV2, type FunnelStepKey } from "@/data/managerOperationalDataV2";
import { managerGoalsData } from "@/data/managerPerformanceData";
import { LCB_STATUS_BG, LCB_STATUS_LABEL, statusFromScore } from "@/lib/lcbStatus";
import { AnimatedRing } from "@/components/animations/AnimatedRing";
import { DevNote } from "@/components/groeimodel/DevNote";

interface Props {
  selectedUnits: string[];
  selectedConsultants: number[];
  search: string;
  onOpenConsultant: (consultantId: number) => void;
}

function overall(c: typeof consultantSkillData[0]): number {
  const m = [
    (c.relatieScoreKlant / 10) * 100,
    (c.relatieScoreKandidaat / 10) * 100,
    c.pitchingPower, c.responsiveness, c.networking, c.bezwaarverlegging,
    c.procedureInschrijving, c.procedureAcquisities, c.systeemHygieneScore,
    c.npsKlant, c.npsKandidaat,
  ];
  return Math.round(m.reduce((a, b) => a + b, 0) / m.length);
}

function quality(c: typeof consultantSkillData[0]): number {
  return Math.round((c.pitchingPower + c.bezwaarverlegging + c.procedureInschrijving + c.systeemHygieneScore) / 4);
}
function volume(c: typeof consultantSkillData[0]): number {
  return Math.round((c.responsiveness + c.networking + c.procedureAcquisities) / 3);
}

function keyImprovement(consultantId: number): string {
  const f = consultantFunnelDataV2.find((x) => x.consultantId === consultantId);
  if (!f) return "—";
  let worst = { label: "Algemeen", ratio: 1 };
  for (let i = 1; i < funnelStepsV2.length; i++) {
    const cur = funnelStepsV2[i].key as FunnelStepKey;
    const prev = funnelStepsV2[i - 1].key as FunnelStepKey;
    const prevVal = f[prev] as number;
    if (prevVal <= 0) continue;
    const ratio = (f[cur] as number) / prevVal;
    if (ratio < worst.ratio) worst = { label: `${funnelStepsV2[i - 1].label} → ${funnelStepsV2[i].label}`, ratio };
  }
  return worst.label;
}

export function ConsultantDevelopmentTab({ selectedUnits, selectedConsultants, search, onOpenConsultant }: Props) {
  const rows = useMemo(() => {
    let r = consultantSkillData;
    if (selectedUnits.length > 0) r = r.filter((x) => selectedUnits.includes(x.unit));
    if (selectedConsultants.length > 0) r = r.filter((x) => selectedConsultants.includes(x.consultantId));
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((x) => x.consultantName.toLowerCase().includes(q));
    }
    return r;
  }, [selectedUnits, selectedConsultants, search]);

  return (
    <div className="relative h-full flex flex-col">
      <DevNote
        id={3}
        floating
        floatingClassName="top-1 right-1"
        story={<><strong>As a manager</strong>, I want overall, quality and volume scores plus open coaching goals per consultant, <strong>so that</strong> I can prioritise who to coach next.</>}
        logic={`Consultant Development table:

  • Rows: consultantSkillData, filtered by selectedUnits,
    selectedConsultants and search.
  • Overall score = average of 11 metrics
    (relatieScoreKlant×10, relatieScoreKandidaat×10,
     pitchingPower, responsiveness, networking,
     bezwaarverlegging, procedureInschrijving,
     procedureAcquisities, systeemHygieneScore,
     npsKlant, npsKandidaat). Status from statusFromScore.
  • Quality = avg(pitchingPower, bezwaarverlegging,
    procedureInschrijving, systeemHygieneScore).
  • Volume  = avg(responsiveness, networking,
    procedureAcquisities).
  • Open / Achieved = managerGoalsData filtered by
    consultantId, completed flag.
  • Key improvement = worst step ratio in
    consultantFunnelDataV2 (step / prevStep).
  • Coaching priority: critical → High, attention → Medium,
    clean → Low.
  • Click row → onOpenConsultant(id) opens
    DevelopmentOverlay.`}
      />
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Ontwikkeling per consultant</h2>
          <p className="text-[11px] text-muted-foreground">
            Klik een rij voor doelen, coaching en aanbevolen focus. Coaching-tips zijn gekoppeld aan de funnel-prestaties.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-border bg-card">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-20 bg-muted/60 backdrop-blur">
            <tr className="text-left">
              <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Consultant</th>
              <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Voortgang</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-muted-foreground">Open doelen</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-muted-foreground">Behaald</th>
              <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Key improvement</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-muted-foreground">Quality</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-muted-foreground">Volume</th>
              <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Coaching prio</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const score = overall(c);
              const status = statusFromScore(score);
              const goals = managerGoalsData.filter((g) => g.consultantId === c.consultantId);
              const open = goals.filter((g) => !g.completed).length;
              const done = goals.filter((g) => g.completed).length;
              const prio = status === "critical" ? "Hoog" : status === "attention" ? "Middel" : "Laag";
              return (
                <tr key={c.consultantId} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => onOpenConsultant(c.consultantId)}>
                  <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">{c.consultantName}</td>
                  <td className="px-3 py-2">
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", LCB_STATUS_BG[status])}>
                      {LCB_STATUS_LABEL[status]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <AnimatedRing value={score} size={28} strokeWidth={3} />
                      <span className="text-xs tabular-nums text-muted-foreground">{score}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{open}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{done}</td>
                  <td className="px-3 py-2 text-[11px] text-muted-foreground">{keyImprovement(c.consultantId)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{quality(c)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{volume(c)}</td>
                  <td className="px-3 py-2">
                    <span className={cn("text-[11px] font-medium", prio === "Hoog" ? "text-red-500" : prio === "Middel" ? "text-amber-500" : "text-emerald-500")}>{prio}</span>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-xs text-muted-foreground">Geen consultants gevonden.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
