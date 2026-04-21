/**
 * Split-scale: lower 45% of the plot covers [yMin, 0], upper 55% covers [0, yMax].
 *
 * Real €-values are mapped to a synthetic display domain [-45, 55].
 *  - 0 always maps to display=0 (the boundary, where the break-even line sits).
 *  - Negatives are stretched (1 € of loss takes more vertical space than 1 € of profit).
 *  - The mapping is invertible and continuous at 0.
 */
export function makeSplitScale(yMin: number, yMax: number) {
  const negSpan = Math.max(1, Math.abs(yMin));
  const posSpan = Math.max(1, yMax);
  const NEG_DISPLAY = 45;
  const POS_DISPLAY = 55;
  const transform = (v: number): number => {
    if (v <= 0) return -(Math.abs(v) / negSpan) * NEG_DISPLAY;
    return (v / posSpan) * POS_DISPLAY;
  };
  const inverse = (d: number): number => {
    if (d <= 0) return -((-d) / NEG_DISPLAY) * negSpan;
    return (d / POS_DISPLAY) * posSpan;
  };
  return { transform, inverse, displayMin: -NEG_DISPLAY, displayMax: POS_DISPLAY };
}
