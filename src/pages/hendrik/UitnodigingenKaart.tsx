import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { provinces } from "@/data/netherlandsProvinces";
import { uitnodigingEvents } from "@/data/uitnodigingenData";
import { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UitnodigingenKaart() {
  const [dotsVisible, setDotsVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDotsVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const hoveredEvent = hoveredId ? uitnodigingEvents.find((e) => e.id === hoveredId) : null;

  // Stats per city
  const cityStats = uitnodigingEvents.reduce<Record<string, number>>((acc, e) => {
    acc[e.city] = (acc[e.city] || 0) + 1;
    return acc;
  }, {});

  const sortedCities = Object.entries(cityStats).sort((a, b) => b[1] - a[1]);

  return (
    <ConsultantLayout title="Overzicht Actuele Uitnodigingen" subtitle="Uitnodigingen gerealiseerd in de afgelopen 3 weken — Operators">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Map */}
        <div
          ref={mapRef}
          className="flex-1 relative bg-card rounded-2xl border border-border p-6 overflow-hidden min-h-[500px]"
          onMouseMove={(e) => {
            if (mapRef.current) {
              const rect = mapRef.current.getBoundingClientRect();
              setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 40%, hsl(175, 60%, 50%), transparent 70%)" }}
          />

          <svg viewBox="0 0 613 724" className="w-full h-full max-h-[65vh]" preserveAspectRatio="xMidYMid meet">
            <defs>
              <style>{`
                @keyframes uit-pulse {
                  0% { r: 4; opacity: 0.6; }
                  100% { r: 22; opacity: 0; }
                }
              `}</style>
              <filter id="uit-glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Province paths */}
            {provinces.map((province) => (
              <path
                key={province.id}
                d={province.d}
                fill="hsla(220, 15%, 25%, 0.4)"
                stroke="hsla(220, 10%, 40%, 0.5)"
                strokeWidth={0.8}
                style={{ transition: "all 0.4s ease" }}
              />
            ))}

            {/* Pinpoints */}
            {uitnodigingEvents.map((event) => {
              const isHovered = hoveredId === event.id;
              const size = 5;
              return (
                <g
                  key={event.id}
                  onMouseEnter={() => setHoveredId(event.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Glow ring */}
                  <circle
                    cx={event.x}
                    cy={event.y}
                    r={dotsVisible ? size + 4 : 0}
                    fill="none"
                    stroke="hsl(175, 60%, 50%)"
                    strokeWidth={1.5}
                    opacity={dotsVisible ? (isHovered ? 0.6 : 0.2) : 0}
                    style={{
                      transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      transitionDelay: `${event.delayMs}ms`,
                    }}
                  />
                  {/* Pulse */}
                  {dotsVisible && (
                    <circle
                      cx={event.x}
                      cy={event.y}
                      r={size}
                      fill="none"
                      stroke="hsl(175, 60%, 50%)"
                      strokeWidth={1}
                      opacity={0}
                      style={{ animation: `uit-pulse 1.5s ease-out ${event.delayMs}ms` }}
                    />
                  )}
                  {/* Main dot */}
                  <circle
                    cx={event.x}
                    cy={event.y}
                    r={dotsVisible ? size : 0}
                    fill="hsl(175, 60%, 50%)"
                    opacity={dotsVisible ? (isHovered ? 1 : 0.85) : 0}
                    style={{
                      transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      transitionDelay: `${event.delayMs}ms`,
                      filter: isHovered ? "drop-shadow(0 0 6px hsl(175, 60%, 50%))" : "none",
                    }}
                  />
                  {/* Center highlight */}
                  <circle
                    cx={event.x}
                    cy={event.y}
                    r={dotsVisible ? size * 0.35 : 0}
                    fill="white"
                    opacity={dotsVisible ? 0.7 : 0}
                    style={{
                      transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      transitionDelay: `${event.delayMs + 100}ms`,
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {hoveredEvent && (
            <div
              className="absolute z-50 pointer-events-none rounded-md border bg-popover px-3 py-2 text-popover-foreground shadow-md"
              style={{ left: mousePos.x + 12, top: mousePos.y - 10, transform: "translateY(-100%)" }}
            >
              <div className="text-xs space-y-1">
                <p className="font-semibold">{hoveredEvent.city}</p>
                <p className="text-muted-foreground">{hoveredEvent.company}</p>
                <p className="text-muted-foreground">{hoveredEvent.consultant} • {hoveredEvent.date}</p>
                <p>
                  <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: "hsl(175, 60%, 50%)" }} />
                  Uitnodiging — {hoveredEvent.functie}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-72 flex flex-col gap-4">
          <AnimatedCard delay={0}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" />
                  Totaal Uitnodigingen
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-3xl font-bold text-foreground tabular-nums">{uitnodigingEvents.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Afgelopen 3 weken — Operators</p>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={80}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Per Stad</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {sortedCities.map(([city, count]) => (
                    <div key={city} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{city}</span>
                      <span className="font-bold tabular-nums">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={160}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recente Uitnodigingen</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  {uitnodigingEvents.slice(0, 5).map((e) => (
                    <div key={e.id} className="text-xs border-b border-border/40 pb-2">
                      <p className="font-medium">{e.company} — {e.city}</p>
                      <p className="text-muted-foreground">{e.consultant} • {e.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>
      </div>
    </ConsultantLayout>
  );
}
