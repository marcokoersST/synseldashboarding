// Animation utility functions and constants

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  chart: 1000,
};

export const ANIMATION_DELAY = {
  stagger: 50,
  card: 100,
  chart: 200,
};

// CSS classes for animations
export const animationClasses = {
  fadeInUp: "animate-fade-in-up",
  fadeInDown: "animate-fade-in-down",
  scaleIn: "animate-scale-in",
  slideUp: "animate-slide-up",
  float: "animate-float",
  pulse: "animate-pulse-subtle",
  shimmer: "animate-shimmer",
  growWidth: "animate-grow-width",
  drawCircle: "animate-draw-circle",
};

// Hover effect classes
export const hoverClasses = {
  lift: "hover-lift",
  scale: "hover-scale",
  glow: "hover-glow",
};

// Generate animation delay style
export function getAnimationDelay(index: number, baseDelay: number = ANIMATION_DELAY.stagger): React.CSSProperties {
  return {
    animationDelay: `${index * baseDelay}ms`,
    animationFillMode: "both",
  };
}

// Format number with animation-friendly output
export function formatAnimatedNumber(
  value: number,
  options: { prefix?: string; suffix?: string; decimals?: number } = {}
): string {
  const { prefix = "", suffix = "", decimals = 0 } = options;
  const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  return `${prefix}${formatted}${suffix}`;
}
