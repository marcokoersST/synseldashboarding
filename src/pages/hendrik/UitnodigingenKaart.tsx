import { ConsultantLayout } from "@/components/consultant/ConsultantLayout";
import { provinces } from "@/data/netherlandsProvinces";
import { uitnodigingEvents } from "@/data/uitnodigingenData";
import { useState, useEffect, useRef } from "react";
import { MapPin, Radio, Crosshair, Activity, Zap } from "lucide-react";
import { AnimatedCard } from "@/components/animations/AnimatedCard";

const GOLD = "hsl(45, 70%, 52%)";
const GOLD_DIM = "hsl(45, 50%, 38%)";
const GOLD_GLOW = "hsl(45, 80%, 60%)";

export default function UitnodigingenKaart() {
  const [dotsVisible, setDotsVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const [scanAngle, setScanAngle] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDotsVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  // Radar sweep animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanAngle((prev) => (prev + 1.2) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const hoveredEvent = hoveredId ? uitnodigingEvents.find((e) => e.id === hoveredId) : null;

  const cityStats = uitnodigingEvents.reduce<Record<string, number>>((acc, e) => {
    acc[e.city] = (acc[e.city] || 0) + 1;
    return acc;
  }, {});
  const sortedCities = Object.entries(cityStats).sort((a, b) => b[1] - a[1]);

  return (
    <ConsultantLayout title="Overzicht Actuele Uitnodigingen" subtitle="Uitnodigingen gerealiseerd in de afgelopen 3 weken — Operators">
      <div className="flex flex-col lg:flex-row gap-5">
        {/* ─── MAP PANEL ─── */}
        <div
          ref={mapRef}
          className="flex-1 relative rounded-2xl overflow-hidden min-h-[560px]"
          style={{
            background: "linear-gradient(160deg, hsl(220, 20%, 6%) 0%, hsl(220, 18%, 10%) 50%, hsl(220, 15%, 8%) 100%)",
            border: "1px solid hsla(45, 50%, 40%, 0.25)",
            boxShadow: "inset 0 1px 0 hsla(45, 60%, 50%, 0.08), 0 0 80px hsla(45, 60%, 45%, 0.06)",
          }}
          onMouseMove={(e) => {
            if (mapRef.current) {
              const rect = mapRef.current.getBoundingClientRect();
              setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }
          }}
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse at 50% 45%, hsla(45, 60%, 45%, 0.06), transparent 65%)",
          }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
            backgroundImage: `
              linear-gradient(hsla(45, 50%, 50%, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsla(45, 50%, 50%, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }} />

          {/* Top-left HUD label */}
          <div className="absolute top-4 left-5 z-10 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5" style={{ color: GOLD }} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD_DIM }}>
              Live Operationeel Overzicht
            </span>
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: GOLD }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: GOLD }} />
            </span>
          </div>

          {/* Top-right timestamp */}
          <div className="absolute top-4 right-5 z-10 text-[10px] font-mono uppercase tracking-wider" style={{ color: GOLD_DIM }}>
            <span className="opacity-60">STATUS:</span>{" "}
            <span style={{ color: GOLD }}>ACTIEF</span>{" "}
            <span className="opacity-40">|</span>{" "}
            <span className="opacity-60">{uitnodigingEvents.length} TARGETS</span>
          </div>

          {/* SVG Map */}
          <div className="p-6 pt-10">
            <svg viewBox="0 0 613 724" className="w-full h-full max-h-[58vh]" preserveAspectRatio="xMidYMid meet">
              <defs>
                <style>{`
                  @keyframes uit-pulse-gold {
                    0% { r: 5; opacity: 0.7; }
                    100% { r: 24; opacity: 0; }
                  }
                  @keyframes uit-beacon {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                  }
                `}</style>
                <filter id="gold-glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <radialGradient id="radar-sweep" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={GOLD} stopOpacity="0.12" />
                  <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Province paths - dark with gold borders */}
              {provinces.map((province) => (
                <path
                  key={province.id}
                  d={province.d}
                  fill="hsla(220, 18%, 12%, 0.7)"
                  stroke="hsla(45, 40%, 45%, 0.2)"
                  strokeWidth={0.6}
                  style={{ transition: "all 0.4s ease" }}
                />
              ))}

              {/* Radar sweep line */}
              <line
                x1="306"
                y1="362"
                x2={306 + Math.cos((scanAngle * Math.PI) / 180) * 400}
                y2={362 + Math.sin((scanAngle * Math.PI) / 180) * 400}
                stroke={GOLD}
                strokeWidth={0.5}
                opacity={0.15}
              />

              {/* Pinpoints */}
              {uitnodigingEvents.map((event) => {
                const isHovered = hoveredId === event.id;
                const size = isHovered ? 6.5 : 5;
                return (
                  <g
                    key={event.id}
                    onMouseEnter={() => setHoveredId(event.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Outer glow ring */}
                    <circle
                      cx={event.x}
                      cy={event.y}
                      r={dotsVisible ? size + 5 : 0}
                      fill="none"
                      stroke={GOLD_GLOW}
                      strokeWidth={isHovered ? 2 : 1}
                      opacity={dotsVisible ? (isHovered ? 0.7 : 0.15) : 0}
                      style={{
                        transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        transitionDelay: `${event.delayMs}ms`,
                      }}
                    />
                    {/* Pulse animation */}
                    {dotsVisible && (
                      <circle
                        cx={event.x}
                        cy={event.y}
                        r={size}
                        fill="none"
                        stroke={GOLD}
                        strokeWidth={1}
                        opacity={0}
                        style={{ animation: `uit-pulse-gold 2s ease-out ${event.delayMs}ms infinite` }}
                      />
                    )}
                    {/* Main dot */}
                    <circle
                      cx={event.x}
                      cy={event.y}
                      r={dotsVisible ? size : 0}
                      fill={GOLD}
                      opacity={dotsVisible ? (isHovered ? 1 : 0.9) : 0}
                      style={{
                        transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        transitionDelay: `${event.delayMs}ms`,
                        filter: isHovered ? `drop-shadow(0 0 10px ${GOLD_GLOW})` : `drop-shadow(0 0 3px ${GOLD_DIM})`,
                      }}
                    />
                    {/* Center highlight */}
                    <circle
                      cx={event.x}
                      cy={event.y}
                      r={dotsVisible ? size * 0.3 : 0}
                      fill="white"
                      opacity={dotsVisible ? 0.8 : 0}
                      style={{
                        transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        transitionDelay: `${event.delayMs + 100}ms`,
                      }}
                    />
                    {/* Crosshair lines on hover */}
                    {isHovered && dotsVisible && (
                      <>
                        <line x1={event.x - 14} y1={event.y} x2={event.x - 8} y2={event.y} stroke={GOLD} strokeWidth={0.8} opacity={0.6} />
                        <line x1={event.x + 8} y1={event.y} x2={event.x + 14} y2={event.y} stroke={GOLD} strokeWidth={0.8} opacity={0.6} />
                        <line x1={event.x} y1={event.y - 14} x2={event.x} y2={event.y - 8} stroke={GOLD} strokeWidth={0.8} opacity={0.6} />
                        <line x1={event.x} y1={event.y + 8} x2={event.x} y2={event.y + 14} stroke={GOLD} strokeWidth={0.8} opacity={0.6} />
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom-left classification badge */}
          <div className="absolute bottom-4 left-5 z-10 flex items-center gap-2 px-3 py-1.5 rounded-md"
            style={{ background: "hsla(45, 50%, 40%, 0.12)", border: "1px solid hsla(45, 50%, 40%, 0.2)" }}
          >
            <Crosshair className="w-3 h-3" style={{ color: GOLD_DIM }} />
            <span className="text-[9px] font-bold uppercase tracking-[0.25em]" style={{ color: GOLD_DIM }}>
              Functieprofiel: Operators
            </span>
          </div>

          {/* Tooltip */}
          {hoveredEvent && (
            <div
              className="absolute z-50 pointer-events-none rounded-lg px-4 py-3 shadow-2xl"
              style={{
                left: mousePos.x + 14,
                top: mousePos.y - 12,
                transform: "translateY(-100%)",
                background: "hsla(220, 20%, 8%, 0.95)",
                border: `1px solid hsla(45, 50%, 45%, 0.35)`,
                backdropFilter: "blur(12px)",
                boxShadow: `0 0 20px hsla(45, 60%, 45%, 0.15)`,
              }}
            >
              <div className="text-xs space-y-1.5">
                <p className="font-bold text-sm" style={{ color: GOLD }}>{hoveredEvent.city}</p>
                <p style={{ color: "hsl(0, 0%, 70%)" }}>{hoveredEvent.company}</p>
                <p style={{ color: "hsl(0, 0%, 50%)" }}>{hoveredEvent.consultant} • {hoveredEvent.date}</p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: GOLD, boxShadow: `0 0 6px ${GOLD_GLOW}` }} />
                  <span style={{ color: GOLD_DIM }}>Uitnodiging — {hoveredEvent.functie}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── SIDEBAR ─── */}
        <div className="lg:w-72 flex flex-col gap-4">
          {/* Total counter */}
          <AnimatedCard delay={0}>
            <div className="rounded-xl p-5 relative overflow-hidden"
              style={{
                background: "linear-gradient(145deg, hsl(220, 18%, 8%), hsl(220, 15%, 11%))",
                border: "1px solid hsla(45, 50%, 40%, 0.2)",
                boxShadow: "0 0 30px hsla(45, 60%, 45%, 0.06)",
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                style={{ background: `radial-gradient(circle at 100% 0%, hsla(45, 60%, 50%, 0.08), transparent 70%)` }}
              />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsla(45, 50%, 45%, 0.12)" }}>
                  <Zap className="w-4 h-4" style={{ color: GOLD }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: GOLD_DIM }}>
                  Actieve Targets
                </span>
              </div>
              <p className="text-4xl font-black tabular-nums" style={{ color: GOLD }}>
                {uitnodigingEvents.length}
              </p>
              <p className="text-[11px] mt-1.5" style={{ color: "hsl(220, 10%, 45%)" }}>
                Afgelopen 3 weken — Operators
              </p>
            </div>
          </AnimatedCard>

          {/* Per city */}
          <AnimatedCard delay={100}>
            <div className="rounded-xl p-4"
              style={{
                background: "linear-gradient(145deg, hsl(220, 18%, 8%), hsl(220, 15%, 11%))",
                border: "1px solid hsla(45, 50%, 40%, 0.15)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-3.5 h-3.5" style={{ color: GOLD_DIM }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: GOLD_DIM }}>
                  Per Locatie
                </span>
              </div>
              <div className="space-y-2">
                {sortedCities.map(([city, count], i) => (
                  <div key={city} className="flex items-center justify-between text-sm group">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full" style={{
                        backgroundColor: GOLD,
                        opacity: 0.3 + (1 - i / sortedCities.length) * 0.7,
                      }} />
                      <span style={{ color: "hsl(220, 10%, 60%)" }}>{city}</span>
                    </div>
                    <span className="font-bold tabular-nums" style={{ color: GOLD }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedCard>

          {/* Recent feed */}
          <AnimatedCard delay={200}>
            <div className="rounded-xl p-4"
              style={{
                background: "linear-gradient(145deg, hsl(220, 18%, 8%), hsl(220, 15%, 11%))",
                border: "1px solid hsla(45, 50%, 40%, 0.15)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-3.5 h-3.5" style={{ color: GOLD_DIM }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: GOLD_DIM }}>
                  Recente Activiteit
                </span>
              </div>
              <div className="space-y-3">
                {uitnodigingEvents.slice(0, 5).map((e) => (
                  <div key={e.id} className="pb-2.5" style={{ borderBottom: "1px solid hsla(45, 30%, 40%, 0.1)" }}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GOLD, boxShadow: `0 0 4px ${GOLD_DIM}` }} />
                      <span className="text-xs font-semibold" style={{ color: "hsl(0, 0%, 80%)" }}>{e.company}</span>
                      <span className="text-[10px]" style={{ color: "hsl(220, 10%, 40%)" }}>— {e.city}</span>
                    </div>
                    <p className="text-[11px] ml-3" style={{ color: "hsl(220, 10%, 40%)" }}>{e.consultant} • {e.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </ConsultantLayout>
  );
}
