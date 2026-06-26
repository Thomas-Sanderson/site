/** Linear interpolation between a and b, with t clamped to 0–1. */
export function lerp(a: number, b: number, t: number) {
  const tc = Math.max(0, Math.min(1, t));
  return a + (b - a) * tc;
}
