import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";
import { cn } from "@/lib/utils";

interface AnimatedProgressProps {
  value: number;
  max?: number;
  delay?: number;
  className?: string;
  barClassName?: string;
  showGlow?: boolean;
}

export function AnimatedProgress({
  value,
  max = 100,
  delay = 0,
  className,
  barClassName,
  showGlow = false,
}: AnimatedProgressProps) {
  const { ref, isVisible } = useAnimateOnMount({ delay });
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div ref={ref} className={cn("h-2.5 bg-progress-bg rounded-full overflow-hidden", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-1000 ease-out",
          showGlow && "shadow-[0_0_10px_currentColor]",
          barClassName
        )}
        style={{
          width: isVisible ? `${percentage}%` : "0%",
          transitionDelay: `${delay}ms`,
        }}
      />
    </div>
  );
}
