import { TVDashboardLayout } from "@/components/tv/TVDashboardLayout";
import { CompetitionCard } from "@/components/tv/CompetitionCard";
import { MargePodium } from "@/components/tv/MargePodium";
import { omzetKoning, plaatsingsKoning, margeBaas, gesprekkenGuru, totalPotentialMargin } from "@/data/tvData";
const fmt = (v: number) => `€${Math.abs(v) >= 1000 ? `${(Math.abs(v) / 1000).toFixed(0)}K` : Math.abs(v).toLocaleString("nl-NL")}`;
const fmtCount = (v: number) => `${v} pl.`;
const fmtGesprekken = (v: number) => `${v}`;

export default function TVBekerDashboard() {
  return (
    <TVDashboardLayout title="Beker Dashboard - Periode 6">
      <div className="flex gap-4 h-full min-h-0 flex-1">
        <div className="w-1/2">
          <MargePodium entries={margeBaas} />
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-3 w-1/2">
          <CompetitionCard
            title="Omzetkoning"
            icon="crown"
            entries={omzetKoning.stijgers}
            dalers={omzetKoning.dalers}
            formatValue={(v) => `${v >= 0 ? "+" : ""}${fmt(v)}`}
            subtitle="Grootste stijgers & dalers in omzet"
          />
          <CompetitionCard
            title="Plaatsingskoning"
            icon="trophy"
            entries={plaatsingsKoning}
            formatValue={fmtCount}
            subtitle={`Potentiële marge: €${(totalPotentialMargin / 1000000).toFixed(1)}M`}
          />
          <CompetitionCard
            title="Margebaas"
            icon="wallet"
            entries={margeBaas}
            formatValue={fmt}
            subtitle="Dealbedrag alle plaatsingen"
          />
          <CompetitionCard
            title="Gesprekken Guru"
            icon="message"
            entries={gesprekkenGuru}
            formatValue={fmtGesprekken}
            subtitle="Totaal gesprekken in de periode"
          />
        </div>
      </div>
    </TVDashboardLayout>
  );
}
