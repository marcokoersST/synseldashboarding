import { useState, useEffect } from "react";
import { TVDashboardLayout } from "@/components/tv/TVDashboardLayout";
import { NetherlandsHeatmap } from "@/components/tv/NetherlandsHeatmap";

export default function TVHeatmap() {
  const [isTVMode, setIsTVMode] = useState(false);

  useEffect(() => {
    const handler = () => {
      setIsTVMode(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <TVDashboardLayout title="Heatmap — Plaatsingen & Gesprekken">
      <NetherlandsHeatmap isTVMode={isTVMode} />
    </TVDashboardLayout>
  );
}
