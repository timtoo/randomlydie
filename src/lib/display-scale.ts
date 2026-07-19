export function computeDisplayScale(count: number): number {
  if (count <= 2) return 1;
  if (count <= 8) return 1 - (count - 2) * (0.5 / 6);
  return 0.4;
}

export function computeEffectiveScale(count: number, basePercent = 100): number {
  const base = basePercent / 100;
  return Math.max(0.4, base * computeDisplayScale(count));
}
