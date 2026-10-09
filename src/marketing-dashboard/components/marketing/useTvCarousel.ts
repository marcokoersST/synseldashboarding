import { useEffect, useState } from "react";
import type { CarouselApi } from "@/marketing-dashboard/components/ui/carousel";

/** Shared TV rotation cadence, accessibility and pause behavior. */
export function useTvCarousel(rotating: boolean) {
  const [api, setApi] = useState<CarouselApi>();
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!api) return;
    const update = () => setIndex(api.selectedScrollSnap());
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => { api.off("select", update); api.off("reInit", update); };
  }, [api]);
  useEffect(() => {
    if (!api || !rotating || paused || hovered || reducedMotion) return;
    const timer = window.setInterval(() => { if (!document.hidden) api.scrollNext(); }, 8000);
    return () => window.clearInterval(timer);
  }, [api, rotating, paused, hovered, reducedMotion]);
  return { api, setApi, paused, setPaused, setHovered, reducedMotion, index };
}