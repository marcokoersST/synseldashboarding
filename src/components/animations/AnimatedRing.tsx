import { useAnimateOnMount } from "@/hooks/useAnimateOnMount";
import { cn } from "@/lib/utils";

interface AnimatedRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  delay?: number;
  className?: string;
  strokeColor?: string;
  bgColor?: string;
}

export function AnimatedRing({
  value,
  max = 100,
  size = 112,
  strokeWidth = 8,
  delay = 0,
  className,
  strokeColor = "hsl(var(--teal))",
  bgColor = "hsl(var(--progress-bg))",
}: AnimatedRingProps) {
  const { ref, isVisible } = useAnimateOnMount({ delay });
  const percentage = Math.min((value / max) * 100, 100);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Animated progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={isVisible ? strokeDashoffset : circumference}
          className="transition-all duration-1000 ease-out"
          style={{ transitionDelay: `${delay}ms` }}
        />
      </svg>
    </div>
  );
}
