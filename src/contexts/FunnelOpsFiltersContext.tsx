import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { BusinessUnit, Tier, SourceTopLevel } from "@/data/funnelOperationsData";

export interface FunnelOpsFilters {
  units: BusinessUnit[];
  tiers: Tier[];
  bronnen: SourceTopLevel[];
  recruiterId: string | null;
  consultantId: string | null;
}

const DEFAULT: FunnelOpsFilters = {
  units: [], tiers: [], bronnen: [], recruiterId: null, consultantId: null,
};

const KEY = "funnel-ops-filters";

interface Ctx {
  filters: FunnelOpsFilters;
  setFilters: (f: FunnelOpsFilters) => void;
  reset: () => void;
}

const FunnelOpsFiltersContext = createContext<Ctx | null>(null);

export function FunnelOpsFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<FunnelOpsFilters>(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) return { ...DEFAULT, ...JSON.parse(raw) };
    } catch {}
    return DEFAULT;
  });

  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify(filters)); } catch {}
  }, [filters]);

  return (
    <FunnelOpsFiltersContext.Provider value={{ filters, setFilters: setFiltersState, reset: () => setFiltersState(DEFAULT) }}>
      {children}
    </FunnelOpsFiltersContext.Provider>
  );
}

export function useFunnelOpsFilters() {
  const ctx = useContext(FunnelOpsFiltersContext);
  if (!ctx) throw new Error("useFunnelOpsFilters outside provider");
  return ctx;
}
