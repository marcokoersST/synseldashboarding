import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";
import { cn } from "@/lib/utils";

interface AnimatedBarProps {
  height: number;
  maxHeight?: number;
  delay?: number;
  className?: string;
}

export function AnimatedBar({
  height,
  maxHeight = 100,
  delay = 0,
  className,
}: AnimatedBarProps) {
  const { ref, isVisible } = useAnimateOnMount({ delay });
  const percentage = Math.min((height / maxHeight) * 100, 100);

  return (
    <div
      ref={ref}
      className={cn(
        "w-full rounded-t-lg transition-all duration-700 ease-out origin-bottom",
        className
      )}
      style={{
        height: isVisible ? `${percentage}%` : "0%",
        transitionDelay: `${delay}ms`,
      }}
    />
  );
}
