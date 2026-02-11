import { TVDashboardLayout } from "@/components/tv/TVDashboardLayout";
import { NetherlandsHeatmap } from "@/components/tv/NetherlandsHeatmap";

export default function TVHeatmap() {
  return (
    <TVDashboardLayout title="Heatmap — Plaatsingen & Gesprekken">
      <NetherlandsHeatmap />
    </TVDashboardLayout>
  );
}
