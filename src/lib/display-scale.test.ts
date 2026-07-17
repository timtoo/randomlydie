import { describe, it, expect } from 'vitest';
import { computeDisplayScale, computeEffectiveScale } from './display-scale';

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

describe('computeEffectiveScale', () => {
  it('uses the base percent for low counts', () => {
    expect(computeEffectiveScale(1, 75)).toBe(0.75);
    expect(computeEffectiveScale(2, 100)).toBe(1);
    expect(computeEffectiveScale(1, 125)).toBe(1.25);
  });

  it('multiplies the dynamic curve by the base', () => {
    expect(computeEffectiveScale(8, 100)).toBe(0.5);
    expect(computeEffectiveScale(7, 75)).toBeCloseTo(0.4375);
    expect(computeEffectiveScale(8, 125)).toBe(0.625);
  });

  it('enforces the absolute 40% floor', () => {
    expect(computeEffectiveScale(8, 75)).toBe(0.4);
    expect(computeEffectiveScale(9, 100)).toBe(0.4);
    expect(computeEffectiveScale(20, 75)).toBe(0.4);
  });
});
