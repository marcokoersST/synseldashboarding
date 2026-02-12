

## Province Click-to-Lock for Open Vacatures

### What Changes
Clicking a province on the map will **lock** the "Open Vacatures" sidebar to show that province's data. The province stays highlighted and the sidebar stays pinned, even when moving the mouse away. Clicking anywhere else on the map (empty area or another province) unlocks it and returns to the default hover behavior. A small lock icon appears next to the province name when locked.

### How It Works

**User flow:**
1. Hover over a province -- sidebar shows that province's vacancies (existing behavior)
2. Click a province -- sidebar **locks** to that province, lock icon appears next to name
3. Move mouse away -- province stays highlighted, sidebar stays pinned
4. Click the same province again OR click empty map area -- **unlocks**, returns to hover mode
5. Click a different province while locked -- switches lock to the new province

### Technical Details (1 file: `src/components/tv/NetherlandsHeatmap.tsx`)

**1. Add `lockedProvince` state**
- New state: `const [lockedProvince, setLockedProvince] = useState<string | null>(null)`
- `activeProvince` continues to track the visually highlighted province (hover or locked)

**2. Update `handleProvinceHover`**
- When `lockedProvince` is set, hover no longer changes `activeProvince` -- it stays locked
- When unlocked, hover works as before

**3. Add click handler on province paths**
- Clicking a province: if it's already locked to that province, unlock (set `lockedProvince` to null); otherwise lock to that province
- Uses a ref flag (`provinceClickedRef`) to prevent the container click handler from immediately unlocking

**4. Add click handler on map container**
- Clicking empty map area (not on a province): clears `lockedProvince` and `activeProvince`
- The `provinceClickedRef` flag ensures province clicks don't bubble up and trigger unlock

**5. Show lock icon in sidebar**
- Import `Lock` from lucide-react
- When `lockedProvince` is set, show a small lock icon next to the province name in the "Open Vacatures" card

**6. TV mode behavior**
- Locking is disabled in TV mode (auto-cycle takes priority) -- click handlers are no-ops when `isTVMode` is true

### Visual Indicator
- Locked province: same highlight styling as hover (teal fill + glow), plus a lock icon in the sidebar next to the province name
- No additional map-level visual change needed -- the persistent highlight itself signals the lock
