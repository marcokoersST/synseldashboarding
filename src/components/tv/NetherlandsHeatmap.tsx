import { useState, useEffect, useMemo } from "react";
import { heatmapEvents, unitColors, getHeatmapStats, HeatmapUnit, HeatmapEvent } from "@/data/heatmapData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Simplified SVG path of the Netherlands outline
const NL_PATH = `M185,60 L195,55 L210,58 L225,52 L240,55 L258,48 L275,52 L290,50 
L305,58 L315,70 L320,85 L322,100 L318,120 L315,140 L312,160 L310,180 
L308,200 L310,215 L312,230 L305,240 L295,250 L285,260 L278,275 
L272,290 L268,305 L265,320 L270,340 L275,355 L270,370 L265,385 
L260,400 L255,415 L250,430 L245,440 L240,435 L235,425 L228,415 
L225,400 L220,385 L215,370 L210,355 L205,345 L195,340 L185,345 
L175,355 L165,365 L155,375 L145,385 L135,390 L128,385 L125,375 
L130,365 L135,355 L140,340 L145,325 L148,310 L150,295 L152,280 
L150,265 L148,250 L152,240 L155,230 L158,220 L162,210 L165,200 
L168,190 L170,178 L172,168 L175,155 L178,145 L180,132 L182,118 
L180,105 L178,92 L180,80 L183,68 Z`;

// Province boundaries (simplified decorative lines)
const PROVINCE_LINES = [
  "M210,170 L260,175 L280,200",
  "M155,230 L210,240 L260,245",
  "M148,310 L210,300 L260,305",
  "M175,355 L220,350 L260,355",
];

interface DotProps {
  event: HeatmapEvent;
  visible: boolean;
  isHighlighted: boolean;
  onHover: (id: string | null) => void;
}

function AnimatedDot({ event, visible, isHighlighted, onHover }: DotProps) {
  const color = unitColors[event.unit];
  const size = event.type === "plaatsing" ? 6 : 4.5;
  const opacity = isHighlighted ? 1 : 0.85;

  return (
    <TooltipTrigger asChild>
      <g
        onMouseEnter={() => onHover(event.id)}
        onMouseLeave={() => onHover(null)}
        style={{ cursor: "pointer" }}
      >
        {/* Glow ring */}
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
        {/* Pulse ring on appear */}
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
        {/* Main dot */}
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
        {/* Inner bright point */}
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
    </TooltipTrigger>
  );
}

interface FilterState {
  units: Set<HeatmapUnit>;
  type: "all" | "gesprek" | "plaatsing";
}

export function NetherlandsHeatmap() {
  const [dotsVisible, setDotsVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    units: new Set<HeatmapUnit>(["operators", "monteurs", "engineering", "training"]),
    type: "all",
  });

  useEffect(() => {
    const timer = setTimeout(() => setDotsVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const filteredEvents = useMemo(() => {
    return heatmapEvents.filter((e) => {
      if (!filters.units.has(e.unit)) return false;
      if (filters.type !== "all" && e.type !== filters.type) return false;
      return true;
    });
  }, [filters]);

  const stats = useMemo(() => getHeatmapStats(filteredEvents), [filteredEvents]);
  const hoveredEvent = hoveredId ? heatmapEvents.find((e) => e.id === hoveredId) : null;

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

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Map area */}
      <div className="flex-1 relative bg-card rounded-2xl border border-border p-6 overflow-hidden">
        {/* Subtle gradient background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 40%, hsl(175, 60%, 50%), transparent 70%)",
          }}
        />

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <svg viewBox="80 30 280 430" className="w-full h-full max-h-[70vh]" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="nl-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(220, 15%, 18%)" />
                  <stop offset="100%" stopColor="hsl(220, 15%, 14%)" />
                </linearGradient>
                <filter id="map-shadow">
                  <feDropShadow dx="2" dy="3" stdDeviation="4" floodColor="hsl(0,0%,0%)" floodOpacity="0.15" />
                </filter>
                <style>{`
                  @keyframes heatmap-pulse {
                    0% { r: 4; opacity: 0.6; }
                    100% { r: 20; opacity: 0; }
                  }
                `}</style>
              </defs>

              {/* Netherlands outline */}
              <path
                d={NL_PATH}
                fill="url(#nl-fill)"
                stroke="hsl(220, 15%, 30%)"
                strokeWidth="1.5"
                filter="url(#map-shadow)"
                className="transition-all duration-700"
              />

              {/* Province lines */}
              {PROVINCE_LINES.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="hsl(220, 15%, 22%)"
                  strokeWidth="0.5"
                  strokeDasharray="4,4"
                  opacity="0.5"
                />
              ))}

              {/* Dots */}
              {filteredEvents.map((event) => (
                <AnimatedDot
                  key={event.id}
                  event={event}
                  visible={dotsVisible}
                  isHighlighted={hoveredId === event.id}
                  onHover={setHoveredId}
                />
              ))}
            </svg>

            {hoveredEvent && (
              <TooltipContent side="top" className="z-50">
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
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
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
        <div className="bg-card rounded-xl border border-border p-4 flex-1">
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
