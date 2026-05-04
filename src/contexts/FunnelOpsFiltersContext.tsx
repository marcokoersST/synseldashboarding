import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { BusinessUnit, Tier, SourceTopLevel } from "@/data/funnelOperationsData";
import { NOW_TS } from "@/data/funnelOperationsData";

export interface DateRange { from: number; to: number; }

export interface FunnelOpsFilters {
  units: BusinessUnit[];
  tiers: Tier[];
  bronnen: SourceTopLevel[];
  recruiterId: string | null;
  consultantId: string | null;
  current: DateRange;
  compare: DateRange | null;
  presetId: string; // 'rolling7' | 'rolling14' | 'rolling30' | 'thisMonth' | 'lastMonth' | 'custom'
  comparePresetId: string; // 'previous' | 'yearAgo' | 'none' | 'custom'
}

const DAY = 24 * 3600 * 1000;

function rolling(days: number): DateRange {
  return { from: NOW_TS - days * DAY, to: NOW_TS };
}

const DEFAULT_CURRENT = rolling(7);
const DEFAULT_COMPARE: DateRange = { from: DEFAULT_CURRENT.from - 7 * DAY, to: DEFAULT_CURRENT.from };

const DEFAULT: FunnelOpsFilters = {
  units: [], tiers: [], bronnen: [], recruiterId: null, consultantId: null,
  current: DEFAULT_CURRENT,
  compare: DEFAULT_COMPARE,
  presetId: "rolling7",
  comparePresetId: "previous",
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

export function presetToRange(id: string): DateRange | null {
  const d = new Date(NOW_TS);
  switch (id) {
    case "rolling7": return rolling(7);
    case "rolling14": return rolling(14);
    case "rolling30": return rolling(30);
    case "thisMonth": {
      const from = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
      return { from, to: NOW_TS };
    }
    case "lastMonth": {
      const from = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1);
      const to = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
      return { from, to };
    }
    default: return null;
  }
}

export function compareForRange(range: DateRange, mode: string): DateRange | null {
  const len = range.to - range.from;
  switch (mode) {
    case "previous": return { from: range.from - len, to: range.from };
    case "yearAgo": {
      const f = new Date(range.from); f.setUTCFullYear(f.getUTCFullYear() - 1);
      const t = new Date(range.to); t.setUTCFullYear(t.getUTCFullYear() - 1);
      return { from: f.getTime(), to: t.getTime() };
    }
    case "none": return null;
    default: return null;
  }
}
