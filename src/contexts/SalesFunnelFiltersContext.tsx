import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import type { DateRange } from "react-day-picker";
import { ranglijstenFilters, getCurrentWeekNumber, getCurrentPeriodNumber, allConsultantsList } from "@/data/ranglijstenData";
import { DEFAULT_VISIBLE_SUBKEYS } from "@/data/unitFunnelColumns";

export type ViewMode = "week" | "periode" | "custom";

const COLUMN_GROUP_TITLES = [
  "1. Inschrijvingen",
  "2. Acquisitie",
  "3. Voorstellen",
  "4. Uitnodigingen",
  "5. Gesprekken",
  "6. Vervolg",
  "7. Geplaatst",
];

interface SalesFunnelFiltersValue {
  jaar: string;
  setJaar: (v: string) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  selectedWeek: string;
  setSelectedWeek: (v: string) => void;
  selectedPeriode: string;
  setSelectedPeriode: (v: string) => void;
  customRange: DateRange | undefined;
  setCustomRange: (v: DateRange | undefined) => void;
  selectedUnits: string[];
  setSelectedUnits: (v: string[]) => void;
  selectedConsultants: string[];
  setSelectedConsultants: (v: string[]) => void;
  visibleColumnGroups: string[];
  setVisibleColumnGroups: (v: string[]) => void;
  visibleSubKeys: string[];
  setVisibleSubKeys: (v: string[]) => void;
  rotationSec: number;
  setRotationSec: (v: number) => void;
  // Helpers
  filterUnits: (rows: { unit: string }[]) => { unit: string }[];
  isUnitVisible: (unit: string) => boolean;
  isConsultantVisible: (name: string) => boolean;
}

const SalesFunnelFiltersContext = createContext<SalesFunnelFiltersValue | null>(null);

export const ALL_COLUMN_GROUPS = COLUMN_GROUP_TITLES;
export const ALL_UNITS = ranglijstenFilters.units.filter(u => u !== "Alle units");

export function SalesFunnelFiltersProvider({ children, defaultViewMode = "week" }: { children: ReactNode; defaultViewMode?: ViewMode }) {
  const [jaar, setJaar] = useState(String(new Date().getFullYear()));
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [selectedWeek, setSelectedWeek] = useState(`W${getCurrentWeekNumber()}`);
  const [selectedPeriode, setSelectedPeriode] = useState(`P${getCurrentPeriodNumber()}`);
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);
  const [selectedUnits, setSelectedUnits] = useState<string[]>(["Alle units"]);
  const [selectedConsultants, setSelectedConsultants] = useState<string[]>(["Alle consultants"]);
  const [visibleColumnGroups, setVisibleColumnGroups] = useState<string[]>([...COLUMN_GROUP_TITLES]);
  const [visibleSubKeys, setVisibleSubKeys] = useState<string[]>([...DEFAULT_VISIBLE_SUBKEYS]);
  const [rotationSec, setRotationSec] = useState<number>(12);

  const value = useMemo<SalesFunnelFiltersValue>(() => {
    const isUnitVisible = (unit: string) =>
      selectedUnits.includes("Alle units") || selectedUnits.includes(unit);

    const isConsultantVisible = (name: string) => {
      if (selectedConsultants.includes("Alle consultants")) {
        // Still subject to unit filter
        const c = allConsultantsList.find(x => x.fullName === name);
        if (!c) return true;
        return isUnitVisible(c.unit);
      }
      return selectedConsultants.includes(name);
    };

    const filterUnits = (rows: { unit: string }[]) => rows.filter(r => isUnitVisible(r.unit));

    return {
      jaar, setJaar,
      viewMode, setViewMode,
      selectedWeek, setSelectedWeek,
      selectedPeriode, setSelectedPeriode,
      customRange, setCustomRange,
      selectedUnits, setSelectedUnits,
      selectedConsultants, setSelectedConsultants,
      visibleColumnGroups, setVisibleColumnGroups,
      visibleSubKeys, setVisibleSubKeys,
      rotationSec, setRotationSec,
      filterUnits, isUnitVisible, isConsultantVisible,
    };
  }, [jaar, viewMode, selectedWeek, selectedPeriode, customRange, selectedUnits, selectedConsultants, visibleColumnGroups, visibleSubKeys, rotationSec]);

  return (
    <SalesFunnelFiltersContext.Provider value={value}>
      {children}
    </SalesFunnelFiltersContext.Provider>
  );
}

export function useSalesFunnelFilters() {
  const ctx = useContext(SalesFunnelFiltersContext);
  if (!ctx) throw new Error("useSalesFunnelFilters must be used within SalesFunnelFiltersProvider");
  return ctx;
}
