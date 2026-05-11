import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

interface Ctx {
  /** Number of active collapse requests (>0 means forced collapsed) */
  forcedCount: number;
  requestCollapse: () => () => void;
}

const SidebarCollapseContext = createContext<Ctx | null>(null);

export function SidebarCollapseProvider({ children }: { children: ReactNode }) {
  const [forcedCount, setForcedCount] = useState(0);
  const requestCollapse = useCallback(() => {
    setForcedCount((n) => n + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      setForcedCount((n) => Math.max(0, n - 1));
    };
  }, []);
  return (
    <SidebarCollapseContext.Provider value={{ forcedCount, requestCollapse }}>
      {children}
    </SidebarCollapseContext.Provider>
  );
}

export function useSidebarCollapse() {
  const ctx = useContext(SidebarCollapseContext);
  if (!ctx) throw new Error("useSidebarCollapse must be inside SidebarCollapseProvider");
  return ctx;
}

/** Hook: while `active` is true, force-collapse the sidebar. Restores on cleanup. */
export function useForceSidebarCollapse(active: boolean) {
  const { requestCollapse } = useSidebarCollapse();
  const releaseRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (active && !releaseRef.current) {
      releaseRef.current = requestCollapse();
    } else if (!active && releaseRef.current) {
      releaseRef.current();
      releaseRef.current = null;
    }
    return () => {
      if (releaseRef.current) {
        releaseRef.current();
        releaseRef.current = null;
      }
    };
  }, [active, requestCollapse]);
}
