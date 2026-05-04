import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FunnelQualityFiltersProvider } from "@/contexts/FunnelQualityFiltersContext";
import { FilterBar } from "./FilterBar";
import { cn } from "@/lib/utils";
import {
  TrendingDown, Activity, Sliders, Layers, FlaskConical,
} from "lucide-react";

const tabs = [
  { path: "/barend/funnel-quality/trend", label: "Trend & Stagnatie", icon: TrendingDown },
  { path: "/barend/funnel-quality/survival", label: "Cohort Survival", icon: Activity },
  { path: "/barend/funnel-quality/mix-impact", label: "Mix-impact", icon: Sliders },
  { path: "/barend/funnel-quality/segmentatie", label: "Segmentatie", icon: Layers },
  { path: "/barend/funnel-quality/stats", label: "Statistische Output", icon: FlaskConical },
];

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function FunnelQualityLayout({ title, subtitle, children }: Props) {
  const { pathname } = useLocation();
  return (
    <FunnelQualityFiltersProvider>
      <div
        className="@container space-y-[clamp(0.75rem,1.2cqi,1.25rem)] p-[clamp(0.75rem,1.2cqi,1.5rem)]"
        style={{ containerType: "inline-size" } as React.CSSProperties}
      >
        <header className="space-y-1">
          <p className="text-[clamp(0.7rem,0.9cqi,0.85rem)] font-medium text-muted-foreground uppercase tracking-wider">
            Funnel Quality Dashboard
          </p>
          <h1 className="text-[clamp(1.25rem,2.2cqi,2rem)] font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-[clamp(0.8rem,1cqi,0.95rem)] text-muted-foreground">{subtitle}</p>}
        </header>

        {/* Sub-tabs */}
        <nav className="flex flex-wrap gap-1 p-1 rounded-lg bg-muted/40 border border-border">
          {tabs.map((t) => {
            const active = pathname === t.path;
            return (
              <NavLink
                key={t.path}
                to={t.path}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[clamp(0.7rem,0.95cqi,0.85rem)] font-medium transition-colors",
                  active
                    ? "bg-background text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                )}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </NavLink>
            );
          })}
        </nav>

        <FilterBar />

        <div className="space-y-[clamp(0.75rem,1.2cqi,1.25rem)]">{children}</div>
      </div>
    </FunnelQualityFiltersProvider>
  );
}
