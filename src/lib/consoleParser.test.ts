import { expect, test } from 'vitest';
import { Die } from './die';
import { MODE_ID } from './modes';
import { parseDiceExpression } from './consoleParser';

const defaultDie = new Die();

function defaultDieResult(mode: MODE_ID, label = '') {
  return {
    mode,
    dice: [
      {
        die: expect.any(Die) as unknown as Die,
        mode,
      },
    ],
    label,
  };
}

test('empty input returns default die and default mode', () => {
  const result = parseDiceExpression('', MODE_ID.dice, defaultDie);
  expect(result).toEqual(defaultDieResult(MODE_ID.dice));
  expect(result?.dice[0].die.equals(defaultDie)).toBe(true);
  expect(result?.dice[0].die.operator).toBe('+');
});

test('mode-only input uses default die with parsed mode', () => {
  const result = parseDiceExpression('hex', MODE_ID.dice, defaultDie);
  expect(result).toEqual(defaultDieResult(MODE_ID.hex, 'hex'));
  expect(result?.dice[0].die.equals(defaultDie)).toBe(true);
  expect(result?.dice[0].mode).toBe(MODE_ID.hex);
});

test('single die with default mode', () => {
  const result = parseDiceExpression('2d6', MODE_ID.dice, defaultDie);
  expect(result).not.toBeNull();
  expect(result?.mode).toBe(MODE_ID.dice);
  expect(result?.dice.length).toBe(1);
  expect(result?.dice[0].die.toString()).toBe('2d6');
  expect(result?.dice[0].die.operator).toBe('+');
  expect(result?.dice[0].mode).toBe(MODE_ID.dice);
});

test('two dice with plus operator', () => {
  const result = parseDiceExpression('2d6 + 1d8', MODE_ID.dice, defaultDie);
  expect(result?.dice.length).toBe(2);
  expect(result?.dice[0].die.toString()).toBe('2d6');
  expect(result?.dice[0].die.operator).toBe('+');
  expect(result?.dice[1].die.toString()).toBe('1d8');
  expect(result?.dice[1].die.operator).toBe('+');
});

test('two dice with no operator', () => {
  const result = parseDiceExpression('2d6 1d8', MODE_ID.dice, defaultDie);
  expect(result?.dice.length).toBe(2);
  expect(result?.dice[0].die.toString()).toBe('2d6');
  expect(result?.dice[0].die.operator).toBe('+');
  expect(result?.dice[1].die.toString()).toBe('1d8');
  expect(result?.dice[1].die.operator).toBe('+');
});

test('two dice with minus operator', () => {
  const result = parseDiceExpression('2d6 - 1d8', MODE_ID.dice, defaultDie);
  expect(result?.dice.length).toBe(2);
  expect(result?.dice[0].die.operator).toBe('+');
  expect(result?.dice[1].die.operator).toBe('-');
});

test('mode prefix changes mode for subsequent dice', () => {
  const result = parseDiceExpression(
    'dice 2d6 + hex 1d16',
    MODE_ID.dice,
    defaultDie,
  );
  expect(result?.dice.length).toBe(2);
  expect(result?.dice[0].mode).toBe(MODE_ID.dice);
  expect(result?.dice[0].die.toString()).toBe('2d6');
  expect(result?.dice[1].mode).toBe(MODE_ID.hex);
  expect(result?.dice[1].die.toString()).toBe('1d16');
});

test('mode prefix applies to all dice until another mode is found', () => {
  const result = parseDiceExpression(
    'hex 2d6 + 1d8 - dice 1d4',
    MODE_ID.dice,
    defaultDie,
  );
  expect(result?.dice.length).toBe(3);
  expect(result?.dice[0].mode).toBe(MODE_ID.hex);
  expect(result?.dice[1].mode).toBe(MODE_ID.hex);
  expect(result?.dice[2].mode).toBe(MODE_ID.dice);
  expect(result?.dice[2].die.operator).toBe('-');
});

test('mode-only token applies to a following die, not parsed as a die', () => {
  const result = parseDiceExpression('d 2d6', MODE_ID.dice, defaultDie);
  expect(result?.dice.length).toBe(1);
  expect(result?.dice[0].mode).toBe(MODE_ID.dice);
  expect(result?.dice[0].die.toString()).toBe('2d6');
});

test('leading operator on first die', () => {
  const result = parseDiceExpression('-2d6 + 1d8', MODE_ID.dice, defaultDie);
  expect(result?.dice.length).toBe(2);
  expect(result?.dice[0].die.operator).toBe('-');
  expect(result?.dice[1].die.operator).toBe('+');
});

test('operators work without spaces between dice', () => {
  const plus = parseDiceExpression('2d6+1d8', MODE_ID.dice, defaultDie);
  expect(plus?.dice.length).toBe(2);
  expect(plus?.dice[1].die.operator).toBe('+');

  const minus = parseDiceExpression('2d6-1d8', MODE_ID.dice, defaultDie);
  expect(minus?.dice.length).toBe(2);
  expect(minus?.dice[1].die.operator).toBe('-');
});

test('single die with modifier is not split on embedded sign', () => {
  const result = parseDiceExpression('2d6-1', MODE_ID.dice, defaultDie);
  expect(result?.dice.length).toBe(1);
  expect(result?.dice[0].die.mod).toBe(-1);
});

test('single-letter mode prefix is not consumed by a following die', () => {
  const result = parseDiceExpression('d12  + d5', MODE_ID.dice, defaultDie);
  expect(result?.dice.length).toBe(2);
  expect(result?.dice[0].die.toString()).toBe('1d12');
  expect(result?.dice[0].die.operator).toBe('+');
  expect(result?.dice[1].die.toString()).toBe('1d5');
  expect(result?.dice[1].die.operator).toBe('+');
});

test('unknown words are ignored', () => {
  const result = parseDiceExpression('foo 2d6 bar', MODE_ID.dice, defaultDie);
  expect(result?.dice.length).toBe(1);
  expect(result?.dice[0].die.toString()).toBe('2d6');
  expect(result?.dice[0].mode).toBe(MODE_ID.dice);
});

test('completely invalid input returns null', () => {
  const result = parseDiceExpression('foo bar', MODE_ID.dice, defaultDie);
  expect(result).toBeNull();
});
