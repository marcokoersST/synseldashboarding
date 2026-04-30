import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconSpec {
  icon: LucideIcon;
  className?: string;
}

interface TileHeaderProps {
  icons: IconSpec[];
  title: string;
  right?: ReactNode;
  compact?: boolean;
}

/**
 * Shared TV tile header. Gradient strip flush to card edges,
 * leading colored icons + title, optional right slot.
 *
 * Place as the first child of a tile that uses `p-3` (compact)
 * or `p-5` (overview) padding on the card shell.
 */
export function TileHeader({ icons, title, right, compact }: TileHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-t-xl bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border-b border-border/50",
        compact ? "-mx-3 -mt-3 mb-2 px-3 py-1.5" : "-mx-5 -mt-5 mb-3 px-5 py-2"
      )}
    >
      {icons.map((spec, i) => {
        const Icon = spec.icon;
        return (
          <Icon
            key={i}
            className={cn(spec.className ?? "text-primary", compact ? "w-3.5 h-3.5" : "w-4 h-4")}
          />
        );
      })}
      <h3 className={cn("font-semibold text-foreground flex-1", compact ? "text-xs" : "text-sm")}>
        {title}
      </h3>
      {right && <div className="ml-auto flex items-center gap-1.5">{right}</div>}
    </div>
  );
}
