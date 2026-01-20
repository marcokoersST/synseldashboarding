import { useCountUp } from "@/hooks/useCountUp";
import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  delay?: number;
  className?: string;
  formatFn?: (value: number) => string;
}

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1000,
  delay = 0,
  className,
  formatFn,
}: AnimatedNumberProps) {
  const { ref, isVisible } = useAnimateOnMount({ delay: 0 });
  const animatedValue = useCountUp({
    end: value,
    duration,
    delay,
    decimals,
    enabled: isVisible,
  });

  const formatted = formatFn 
    ? formatFn(animatedValue)
    : decimals > 0 
      ? animatedValue.toFixed(decimals)
      : animatedValue.toLocaleString();

  return (
    <span ref={ref} className={cn("tabular-nums transition-all duration-300 data-highlight", className)}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
