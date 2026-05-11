import { useMemo } from "react";
import { BottleneckRanking, type BottleneckRow } from "./BottleneckRanking";
import { UnitDimensionMatrix, type MatrixCell } from "./UnitDimensionMatrix";
import { TopRiskConsultants, type RiskConsultant } from "./TopRiskConsultants";
import { consultantFunnelDataV2, consultantOutreachData } from "@/data/managerOperationalDataV2";
import { consultantSkillData } from "@/data/managerPerformanceData";
import { revenueChartDataV2 } from "@/data/managerPerformanceDataV2";

type Status = "clean" | "attention" | "critical";

const DATA_UNITS = ["Engineering", "Monteurs", "Operators", "Trainingsunit"];

function statusFromScore(s: number): Status {
  if (s >= 75) return "clean";
  if (s >= 55) return "attention";
  return "critical";
}

function overallSkill(c: typeof consultantSkillData[0]): number {
  const m = [
    (c.relatieScoreKlant / 10) * 100,
    (c.relatieScoreKandidaat / 10) * 100,
    c.pitchingPower,
    c.responsiveness,
    c.networking,
    c.bezwaarverlegging,
    c.procedureInschrijving,
    c.procedureAcquisities,
    c.systeemHygieneScore,
    c.npsKlant,
    c.npsKandidaat,
  ];
  return Math.round(m.reduce((a, b) => a + b, 0) / m.length);
}

interface Props {
  selectedUnits: string[];
  bottleneckRows: BottleneckRow[];
  onSelectTile: (key: string) => void;
  onSelectTileWithUnit: (key: string, unit: string) => void;
}

export function BottleneckBand({
  selectedUnits,
  bottleneckRows,
  onSelectTile,
  onSelectTileWithUnit,
}: Props) {
  const activeUnits = selectedUnits.length === 0 ? DATA_UNITS : selectedUnits.filter((u) => DATA_UNITS.includes(u));
  const visibleUnits = activeUnits.length === 0 ? DATA_UNITS : activeUnits;

  // Matrix
  const matrix: MatrixCell[] = useMemo(() => {
    const dims = [
      { key: "salesfunnel", label: "Funnel" },
      { key: "outreach", label: "Outreach" },
      { key: "performance", label: "Performance" },
      { key: "omzet", label: "Omzet" },
    ];

    const cells: MatrixCell[] = [];
    visibleUnits.forEach((unit) => {
      // Funnel: plaatsingen vs intakes per unit
      const fnConsultants = consultantFunnelDataV2.filter((c) => c.unit === unit);
      const intakes = fnConsultants.reduce((s, c) => s + c.intakes, 0);
      const plaatsingen = fnConsultants.reduce((s, c) => s + c.plaatsingen, 0);
      const funnelScore = intakes > 0 ? Math.min(100, Math.round((plaatsingen / intakes) * 300)) : 0;

      // Outreach: avg totalOutreach normalized to 400
      const orConsultants = consultantOutreachData.filter((c) => c.unit === unit);
      const orAvg = orConsultants.length
        ? orConsultants.reduce((s, c) => s + c.totalOutreach, 0) / orConsultants.length
        : 0;
      const outreachScore = Math.min(100, Math.round((orAvg / 250) * 100));

      // Performance: avg overall skill
      const skConsultants = consultantSkillData.filter((c) => c.unit === unit);
      const perfScore = skConsultants.length
        ? Math.round(skConsultants.reduce((s, c) => s + overallSkill(c), 0) / skConsultants.length)
        : 0;

      // Omzet: shared chart, vary slightly per unit so the matrix isn't flat
      const last = revenueChartDataV2.filter((d) => d.realised > 0).pop();
      const omzetBase = last ? Math.round((last.realised / Math.max(last.target, 1)) * 100) : 0;
      const variance = (DATA_UNITS.indexOf(unit) - 1.5) * 6;
      const omzetScore = Math.max(0, Math.min(100, omzetBase + variance));

      const scoreMap: Record<string, number> = {
        salesfunnel: funnelScore,
        outreach: outreachScore,
        performance: perfScore,
        omzet: omzetScore,
      };

      dims.forEach((d) => {
        const s = scoreMap[d.key];
        cells.push({
          unit,
          dim: d.label,
          dimKey: d.key,
          score: s,
          status: statusFromScore(s),
        });
      });
    });
    return cells;
  }, [visibleUnits]);

  const dims = [
    { key: "salesfunnel", label: "Funnel" },
    { key: "outreach", label: "Outreach" },
    { key: "performance", label: "Perform." },
    { key: "omzet", label: "Omzet" },
  ];

  // Risk consultants
  const risk: RiskConsultant[] = useMemo(() => {
    const pool = consultantSkillData.filter(
      (c) => activeUnits.length === 0 || activeUnits.includes(c.unit),
    );
    return pool
      .map((c) => {
        const score = overallSkill(c);
        const reasons: string[] = [];
        if (c.systeemHygieneScore < 60) reasons.push("Hygiene laag");
        if (c.responsiveness < 70) reasons.push("Responstijd");
        if (c.pitchingPower < 60) reasons.push("Pitching");
        if (c.npsKlant < 30) reasons.push("Klant-NPS");
        return {
          id: c.consultantId,
          name: c.consultantName,
          unit: c.unit,
          score,
          reason: reasons.slice(0, 2).join(" · ") || "Score onder norm",
          status: statusFromScore(score),
        };
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, 6);
  }, [activeUnits]);

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-foreground">Knelpunten in één oogopslag</h2>
        <span className="text-[10px] text-muted-foreground">
          Klik om in te zoomen
        </span>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1.1fr_1fr]">
        <BottleneckRanking rows={bottleneckRows} onSelect={onSelectTile} />
        <UnitDimensionMatrix
          units={visibleUnits}
          dims={dims}
          cells={matrix}
          onSelect={onSelectTileWithUnit}
        />
        <TopRiskConsultants rows={risk} />
      </div>
    </section>
  );
}
