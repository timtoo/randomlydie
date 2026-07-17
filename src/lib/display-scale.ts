export function computeDisplayScale(count: number): number {
  if (count <= 2) return 1;
  if (count <= 8) return 1 - (count - 2) * (0.5 / 6);
  return 0.4;
}
