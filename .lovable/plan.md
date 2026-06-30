Align the "Piekuur" and "Beste oppakratio" counters in `src/components/calldashboarding/tv/TVHourlyCallsTile.tsx`:

- Change the wrapping flex row from `flex items-center gap-4` to `flex items-start gap-4` so both labels start on the same baseline.
- To keep the big numbers visually aligned even though only "Piekuur" has a sub-line, add an invisible spacer (`<span className="text-xs invisible">.</span>`) under "Beste oppakratio" — or pass an empty `shareLabel=" "` if HeroCounter supports it — so both counters occupy the same vertical height.

No other styling changes.