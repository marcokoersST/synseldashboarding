

# Sales Funnel Detail Mode - Graph + Table

## Current Behavior
In detail mode, the funnel bar graph is **replaced** by the consultant table. The user wants **both** visible simultaneously.

## Change

### File: `src/components/manager/ManagerSalesFunnel.tsx`

**Line 222** — Replace the conditional render (`displayMode ? table : graph`) with:
- **Overview mode**: Show only the funnel graph (unchanged)
- **Detail mode**: Show the funnel graph in a **compact version** (smaller bars, reduced spacing) at the top, followed by a separator, then the consultant table below

The compact funnel in detail mode will use `h-4` bars instead of `h-6`, `space-y-1.5` instead of `space-y-3`, and hide the optional steps + total conversion footer to keep it concise. This gives context while the table provides the drill-down.

### Layout in detail mode:
```text
┌─────────────────────────────────────┐
│ Sales Funnel          [minimize]    │
│ Conversies per consultant           │
│                                     │
│  Toegewezen    ████████████████ 540  │
│  Inschrijvingen ██████████ 291  54% │
│  Acquisities   ████████ 226    78% │
│  ...           (compact bars)       │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  🔍 Zoek consultant...              │
│  Consultant | Toegew. | Inschr. ... │
│  Anna Visser | 55 | 28 | ...       │
│  ...                                │
└─────────────────────────────────────┘
```

### Implementation details:
- Add an optional `compact` prop to `FunnelOverview` that reduces bar height, spacing, and hides optional steps + footer
- In the main render: when `displayMode` is true, render `<FunnelOverview compact />` + `<Separator />` + `<FunnelDetailTable />`
- When `displayMode` is false, render `<FunnelOverview />` only (unchanged)

