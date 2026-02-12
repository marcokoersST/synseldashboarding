import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { heatmapEvents, unitColors, getHeatmapStats, HeatmapUnit, HeatmapEvent, provinceVacancies, getProvinceVacancy, getTotalVacancies } from "@/data/heatmapData";
import { provinces } from "@/data/netherlandsProvinces";
import { MapPin } from "lucide-react";

interface DotProps {
  event: HeatmapEvent;
  visible: boolean;
  isHighlighted: boolean;
  onHover: (id: string | null) => void;
}

const AnimatedDot = React.forwardRef<SVGGElement, DotProps>(function AnimatedDot({ event, visible, isHighlighted, onHover, ...props }, ref) {
  const color = unitColors[event.unit];
  const size = event.type === "plaatsing" ? 6 : 4.5;
  const opacity = isHighlighted ? 1 : 0.85;

  return (
    <g
      ref={ref}
      onMouseEnter={() => onHover(event.id)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: "pointer" }}
      {...props}
    >
      <circle
        cx={event.lng}
        cy={event.lat}
        r={visible ? size + 4 : 0}
        fill="none"
        stroke={color.glow}
        strokeWidth={1.5}
        opacity={visible ? (isHighlighted ? 0.6 : 0.25) : 0}
        style={{
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transitionDelay: `${event.delayMs}ms`,
        }}
      />
      {visible && (
        <circle
          cx={event.lng}
          cy={event.lat}
          r={size}
          fill="none"
          stroke={color.glow}
          strokeWidth={1}
          opacity={0}
          style={{
            animation: `heatmap-pulse 1.5s ease-out ${event.delayMs}ms`,
          }}
        />
      )}
      <circle
        cx={event.lng}
        cy={event.lat}
        r={visible ? size : 0}
        fill={color.dot}
        opacity={visible ? opacity : 0}
        style={{
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transitionDelay: `${event.delayMs}ms`,
          filter: isHighlighted ? `drop-shadow(0 0 6px ${color.glow})` : "none",
        }}
      />
      <circle
        cx={event.lng}
        cy={event.lat}
        r={visible ? size * 0.35 : 0}
        fill="white"
        opacity={visible ? 0.7 : 0}
        style={{
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transitionDelay: `${event.delayMs + 100}ms`,
        }}
      />
    </g>
  );
});

interface FilterState {
  units: Set<HeatmapUnit>;
  type: "all" | "gesprek" | "plaatsing";
}

interface NetherlandsHeatmapProps {
  isTVMode?: boolean;
}

export function NetherlandsHeatmap({ isTVMode = false }: NetherlandsHeatmapProps) {
  const [dotsVisible, setDotsVisible] = useState(false);
  const [hoveredDotId, setHoveredDotId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [activeProvince, setActiveProvince] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    units: new Set<HeatmapUnit>(["operators", "monteurs", "engineering", "training"]),
    type: "all",
  });
  const cycleIndexRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setDotsVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // TV auto-cycle: only provinces with vacancies
  const provincesWithVacancies = useMemo(
    () => provinceVacancies.filter((p) => p.total > 0),
    []
  );

  useEffect(() => {
    if (!isTVMode || provincesWithVacancies.length === 0) {
      if (!isTVMode) setActiveProvince(null);
      return;
    }
    // Start immediately
    cycleIndexRef.current = 0;
    setActiveProvince(provincesWithVacancies[0].provinceId);

    const interval = setInterval(() => {
      cycleIndexRef.current = (cycleIndexRef.current + 1) % provincesWithVacancies.length;
      setActiveProvince(provincesWithVacancies[cycleIndexRef.current].provinceId);
    }, 15000);

    return () => clearInterval(interval);
  }, [isTVMode, provincesWithVacancies]);

  const filteredEvents = useMemo(() => {
    return heatmapEvents.filter((e) => {
      if (!filters.units.has(e.unit)) return false;
      if (filters.type !== "all" && e.type !== filters.type) return false;
      return true;
    });
  }, [filters]);

  const stats = useMemo(() => getHeatmapStats(filteredEvents), [filteredEvents]);
  const hoveredEvent = hoveredDotId ? heatmapEvents.find((e) => e.id === hoveredDotId) : null;

  const activeVacancy = activeProvince ? getProvinceVacancy(activeProvince) : null;
  const totalVacancies = useMemo(() => getTotalVacancies(), []);
  const activeProvinceData = activeProvince ? provinces.find((p) => p.id === activeProvince) : null;

  const toggleUnit = (unit: HeatmapUnit) => {
    setFilters((prev) => {
      const next = new Set(prev.units);
      if (next.has(unit)) {
        if (next.size > 1) next.delete(unit);
      } else {
        next.add(unit);
      }
      return { ...prev, units: next };
    });
  };

  const handleProvinceHover = useCallback((provinceId: string | null) => {
    if (!isTVMode) {
      setActiveProvince(provinceId);
    }
  }, [isTVMode]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Map area */}
      <div
        ref={mapContainerRef}
        className="flex-1 relative bg-card rounded-2xl border border-border p-6 overflow-hidden"
        onMouseMove={(e) => {
          if (mapContainerRef.current) {
            const rect = mapContainerRef.current.getBoundingClientRect();
            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 40%, hsl(175, 60%, 50%), transparent 70%)",
          }}
        />

          <svg viewBox="0 0 613 724" className="w-full h-full max-h-[70vh]" preserveAspectRatio="xMidYMid meet">
            <defs>
              <style>{`
                @keyframes heatmap-pulse {
                  0% { r: 4; opacity: 0.6; }
                  100% { r: 20; opacity: 0; }
                }
              `}</style>
              <filter id="province-glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Province paths */}
            {provinces.map((province) => {
              const isActive = activeProvince === province.id;
              const vacancy = getProvinceVacancy(province.id);
              const hasVacancies = vacancy && vacancy.total > 0;
              return (
                <path
                  key={province.id}
                  d={province.d}
                  fill={isActive ? "hsla(175, 60%, 50%, 0.18)" : "hsla(220, 15%, 25%, 0.4)"}
                  stroke={isActive ? "hsla(175, 60%, 50%, 0.7)" : "hsla(220, 10%, 40%, 0.5)"}
                  strokeWidth={isActive ? 2 : 0.8}
                  style={{
                    transition: "all 0.6s ease",
                    cursor: hasVacancies ? "pointer" : "default",
                    filter: isActive ? "url(#province-glow)" : "none",
                  }}
                  onMouseEnter={() => handleProvinceHover(province.id)}
                  onMouseLeave={() => handleProvinceHover(null)}
                />
              );
            })}

            {/* Dots */}
            {filteredEvents.map((event) => (
              <AnimatedDot
                key={event.id}
                event={event}
                visible={dotsVisible}
                isHighlighted={hoveredDotId === event.id}
                onHover={setHoveredDotId}
              />
            ))}
          </svg>

        {/* Custom HTML tooltip */}
        {hoveredEvent && (
          <div
            className="absolute z-50 pointer-events-none rounded-md border bg-popover px-3 py-2 text-popover-foreground shadow-md"
            style={{
              left: mousePos.x + 12,
              top: mousePos.y - 10,
              transform: "translateY(-100%)",
            }}
          >
            <div className="text-xs space-y-1">
              <p className="font-semibold">{hoveredEvent.city}</p>
              <p>
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: unitColors[hoveredEvent.unit].dot }}
                />
                {unitColors[hoveredEvent.unit].label} —{" "}
                {hoveredEvent.type === "gesprek" ? "Gesprek" : "Plaatsing"}
              </p>
              <p className="text-muted-foreground">
                {hoveredEvent.company} • {hoveredEvent.consultant}
              </p>
              <p className="text-muted-foreground">{hoveredEvent.date}</p>
            </div>
          </div>
        )}
      </div>

      {/* Side panel */}
      <div className="lg:w-80 flex flex-col gap-4">
        {/* Type filter */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Type
          </h3>
          <div className="flex gap-2">
            {(["all", "gesprek", "plaatsing"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilters((prev) => ({ ...prev, type: t }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  filters.type === t
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {t === "all" ? "Alles" : t === "gesprek" ? "Gesprekken" : "Plaatsingen"}
              </button>
            ))}
          </div>
        </div>

        {/* Unit filters + stats */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Units
          </h3>
          <div className="space-y-3">
            {(Object.keys(unitColors) as HeatmapUnit[]).map((unit) => {
              const active = filters.units.has(unit);
              const s = stats[unit];
              return (
                <button
                  key={unit}
                  onClick={() => toggleUnit(unit)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left ${
                    active
                      ? "bg-muted/60 ring-1 ring-border"
                      : "opacity-40 hover:opacity-70"
                  }`}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 transition-transform duration-300"
                    style={{
                      backgroundColor: unitColors[unit].dot,
                      boxShadow: active ? `0 0 8px ${unitColors[unit].glow}` : "none",
                      transform: active ? "scale(1)" : "scale(0.7)",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{unitColors[unit].label}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{s.gesprekken} gesprekken</span>
                      <span>{s.plaatsingen} plaatsingen</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Open Vacatures */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Open Vacatures
            </h3>
          </div>
          <div className="transition-all duration-300">
            {activeVacancy ? (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-foreground">{activeVacancy.name}</span>
                  <span className="text-xl font-bold text-foreground tabular-nums">{activeVacancy.total}</span>
                </div>
                <div className="space-y-1.5">
                  {(Object.keys(unitColors) as HeatmapUnit[]).map((unit) => (
                    <div key={unit} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: unitColors[unit].dot }}
                        />
                        <span className="text-muted-foreground">{unitColors[unit].label}</span>
                      </div>
                      <span className="text-foreground tabular-nums font-medium">{activeVacancy.byUnit[unit]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Landelijk totaal</span>
                  <span className="text-xl font-bold text-foreground tabular-nums">{totalVacancies.total}</span>
                </div>
                <div className="space-y-1.5">
                  {(Object.keys(unitColors) as HeatmapUnit[]).map((unit) => (
                    <div key={unit} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: unitColors[unit].dot }}
                        />
                        <span className="text-muted-foreground">{unitColors[unit].label}</span>
                      </div>
                      <span className="text-foreground tabular-nums font-medium">{totalVacancies.byUnit[unit]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Total counter */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Totaal events</span>
            <span className="text-2xl font-bold text-foreground tabular-nums">{filteredEvents.length}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Laatste 3 weken</p>
        </div>
      </div>
    </div>
  );
}
