I found the remaining gap source: the Systeem Hygiene page is rendered inside `AppLayout`, where the persistent dark `TopBar` (`h-14`) sits above the page content. The earlier `-m-6` fix only removed the inner page padding, but it cannot remove the TopBar height, so the page header still starts below the very top of the viewport.

Plan:

1. Make Systeem Hygiene a true full-height concept page inside the app shell
   - Detect the `/concepts/systeem-hygiene` route in `AppLayout`.
   - For this route only, hide or collapse the persistent `TopBar` area so the Systeem Hygiene header can start at the top edge of the viewport.
   - Remove the default `p-6` and rounded top-left shell styling for this route only.

2. Clean up the page-level workaround
   - Replace the current `-m-6` wrapper in `SysteemHygiene.tsx` with a stable full-width/full-height wrapper.
   - Keep the header `sticky top-0` so it remains attached to the top while scrolling.
   - Remove `rounded-tl-2xl` from the Systeem Hygiene header, because the header should visually reach the top edge without a rounded/gapped corner.

3. Preserve stability requirements
   - Keep the redesigned two-row header and fixed-width filter controls.
   - Ensure selecting filters and collapsing/expanding the sidebar still does not change the header height or cause layout jumps.
   - Keep the page scroll contained in the main app content area.

Technical changes:

```tsx
// AppLayout.tsx
const isSysteemHygiene = pathname === "/concepts/systeem-hygiene";

{!isSysteemHygiene && <TopBar ... />}

<main
  className={cn(
    "flex-1 bg-background overflow-y-auto overflow-x-hidden ...",
    isSysteemHygiene ? "p-0 rounded-none" : "p-6 rounded-tl-2xl"
  )}
>
  <Outlet />
</main>
```

```tsx
// SysteemHygiene.tsx
<div className="min-h-full bg-background">
  <header className="sticky top-0 z-30 border-b border-border bg-background/95 ...">
    ...
  </header>
</div>
```

Files to edit after approval:
- `src/components/layout/AppLayout.tsx`
- `src/pages/concepts/SysteemHygiene.tsx`