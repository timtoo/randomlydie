import { describe, it, expect } from 'vitest';
import { computeDisplayScale } from './display-scale';

describe('computeDisplayScale', () => {
  it('leaves 1-2 items at full size', () => {
    expect(computeDisplayScale(1)).toBe(1);
    expect(computeDisplayScale(2)).toBe(1);
  });

  it('scales linearly from 1.0 at 2 items to 0.5 at 8 items', () => {
    expect(computeDisplayScale(3)).toBeCloseTo(1 - 1 * (0.5 / 6));
    expect(computeDisplayScale(5)).toBeCloseTo(1 - 3 * (0.5 / 6));
    expect(computeDisplayScale(8)).toBe(0.5);
  });

  it('clamps at 0.4 for 9 or more items', () => {
    expect(computeDisplayScale(9)).toBe(0.4);
    expect(computeDisplayScale(20)).toBe(0.4);
  });
});
