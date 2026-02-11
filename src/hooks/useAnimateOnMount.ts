import { useState, useEffect, useRef } from "react";

interface UseAnimateOnMountOptions {
  delay?: number;
  threshold?: number;
}

export function useAnimateOnMount({ delay = 0, threshold = 0.1 }: UseAnimateOnMountOptions = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
          }, delay);
        }
      },
      { threshold }
    );

    observer.observe(element);

    const fallbackTimer = setTimeout(() => {
      if (!hasAnimated) {
        setIsVisible(true);
        setHasAnimated(true);
      }
    }, delay + 2000);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, [delay, threshold, hasAnimated]);

  return { ref, isVisible };
}

// Calculate stagger delay for lists
export function getStaggerDelay(index: number, baseDelay: number = 50): number {
  return index * baseDelay;
}
