import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  VACATURE_CLUSTERS, REGIOS, KANALEN, TYPES,
  type VacatureCluster, type Regio, type Kanaal, type CandidateType,
} from "@/data/funnelQualityData";

interface FunnelQualityFilters {
  periodStart: string; // YYYY-MM
  periodEnd: string;
  clusters: VacatureCluster[];
  regios: Regio[];
  kanalen: Kanaal[];
  types: CandidateType[];
  scoreMin: number;
  scoreMax: number;
}

interface Ctx extends FunnelQualityFilters {
  set: <K extends keyof FunnelQualityFilters>(k: K, v: FunnelQualityFilters[K]) => void;
  reset: () => void;
}

const STORAGE_KEY = "funnel-quality-filters-v1";

const defaults: FunnelQualityFilters = {
  periodStart: "2023-01",
  periodEnd: "2026-03",
  clusters: [...VACATURE_CLUSTERS],
  regios: [...REGIOS],
  kanalen: [...KANALEN],
  types: [...TYPES],
  scoreMin: 0,
  scoreMax: 100,
};

const FunnelQualityCtx = createContext<Ctx | null>(null);

export function FunnelQualityFiltersProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FunnelQualityFilters>(() => {
    if (typeof window === "undefined") return defaults;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return { ...defaults, ...JSON.parse(raw) };
    } catch {}
    return defaults;
  });

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const value: Ctx = {
    ...state,
    set: (k, v) => setState((s) => ({ ...s, [k]: v })),
    reset: () => setState(defaults),
  };

  return <FunnelQualityCtx.Provider value={value}>{children}</FunnelQualityCtx.Provider>;
}

export function useFunnelQualityFilters() {
  const ctx = useContext(FunnelQualityCtx);
  if (!ctx) throw new Error("useFunnelQualityFilters must be used within FunnelQualityFiltersProvider");
  return ctx;
}
