

# TV Mode Animations for Ranglijsten

## Changes

### 1. Top 3 wave animation (TV mode only)
Add a CSS keyframe `tv-wave` that gently translates the rank icon (Trophy/Medal) up and down by ~2px. Each of the 3 top rows gets a staggered `animation-delay` (0s, 0.3s, 0.6s) to create a wave effect. The animation uses `ease-in-out` with a long duration (~3s) and plays intermittently using a keyframe that holds still for most of the cycle:

```
@keyframes tv-wave {
  0%, 20%, 100% { transform: translateY(0); }
  10% { transform: translateY(-2px); }
}
```

Duration: ~4s, so the icon bobs gently once then rests for ~3s before repeating. Applied only to `.tv-mode .tv-wave-1`, `.tv-wave-2`, `.tv-wave-3` classes on the RankIcon wrapper.

### 2. Fire icon smolder animation (TV mode only)
Add a CSS keyframe `tv-fire` that subtly scales and adjusts opacity of the Flame icon to simulate a smoldering effect. Runs continuously but smoothly:

```
@keyframes tv-fire {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  33% { transform: scale(1.1) rotate(-3deg); opacity: 1; }
  66% { transform: scale(0.95) rotate(2deg); opacity: 0.8; }
}
```

Duration: ~2s, infinite, `ease-in-out`. Applied via `.tv-mode .tv-fire` class on the Flame icon. The icon stays within row bounds since scale is small (0.95-1.1).

### Files changed

**`src/index.css`** — Add `@keyframes tv-wave` and `@keyframes tv-fire` plus `.tv-mode .tv-wave-*` and `.tv-mode .tv-fire` classes in the components layer.

**`src/pages/TVRanglijsten.tsx`** — 
- In `RankIcon`: wrap the icon in a span with class `tv-wave-{rank}` 
- In `EntryRow`: add class `tv-fire` to the Flame icon
- Both classes are inert outside `.tv-mode` (no CSS rules match), so non-TV mode is unaffected

