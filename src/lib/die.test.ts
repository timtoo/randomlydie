// vitest test file
import { expect, test } from 'vitest';
import { Die } from './die';
import { MULTIPY_CHARS, DIVIDE_CHARS } from './die';

// [string to parse]: [expecte dice object], [expected string], [compact string]
const test_dice: { [key: string]: [Die, string, string?] } = {
  d: [new Die(), '1d6', 'd'],
  D6: [new Die(), '1d6', 'd'],
  '1d6': [new Die(1, 6, 1), '1d6', 'd'],
  '2D6': [new Die(1, 6, 2), '2d6', '2d'],
  '5d20': [new Die(1, 20, 5), ''],
  '3d12': [new Die(1, 12, 3), ''],
  '3d12+4': [new Die(1, 12, 3, 4), ''],
  '3d12-5': [new Die(1, 12, 3, -5), ''],
  '4d8x3': [new Die(1, 8, 4, 0, 3), `4d8${MULTIPY_CHARS[0]}3`],
  '4d8×3': [new Die(1, 8, 4, 0, 3), `4d8${MULTIPY_CHARS[0]}3`],
  '4d8*3': [new Die(1, 8, 4, 0, 3), `4d8${MULTIPY_CHARS[0]}3`],
  'd8/2': [new Die(1, 8, 1, 0, 0.5), `1d8${DIVIDE_CHARS[0]}2`],
  '2d8÷2': [new Die(1, 8, 2, 0, 0.5), `2d8${DIVIDE_CHARS[0]}2`],
  'd/3': [new Die(1, 6, 1, 0, 1 / 3), `1d6${DIVIDE_CHARS[0]}3`],
  '10d100/4+5': [new Die(1, 100, 10, 5, 0.25), `10d100${DIVIDE_CHARS[0]}4+5`],
  '4x(10d100/4+5)': [new Die(1, 100, 10, 5, 0.25, 4), `4x(10d100${DIVIDE_CHARS[0]}4+5)`],
  '4X(10d100/4+5)': [new Die(1, 100, 10, 5, 0.25, 4), `4x(10d100${DIVIDE_CHARS[0]}4+5)`],
  '4×(10d100/4+5)': [new Die(1, 100, 10, 5, 0.25, 4), `4x(10d100${DIVIDE_CHARS[0]}4+5)`],
  '4*(10d100/4+5)': [new Die(1, 100, 10, 5, 0.25, 4), `4x(10d100${DIVIDE_CHARS[0]}4+5)`],
  '4x(10d100+5/4)': [new Die(1, 100, 10, 5, 0.25, 4), `4x(10d100${DIVIDE_CHARS[0]}4+5)`],
  '2X(3d6)/2+3': [new Die(1, 6, 3, 0, 1, 2, false, false), '2x(3d6)'], // typo result
  '3xd': [new Die(1, 6, 1, 0, 1, 3), '3x(1d6)'],
  '1d6>2': [new Die(2, 6), '', 'd>2'],
  '1D5>0': [new Die(0, 5), '1d5>0', 'd>5'],
  '1D6>0x': [new Die(0, 6, 1, 0, 1, 1, true, false), '1d6>0x', 'd6>0x'],
  '1d6xz': [new Die(0, 6, 1, 0, 1, 1, true, true), '', 'd6xz'],
  '1d6>1z': [new Die(1, 6, 1, 0, 1, 1, false, false), '1d6', 'd'], // zero mode ignored due to >1
  '3d6z': [new Die(0, 6, 3, 0, 1, 1, false, true), '3d6z', '3dz'],
  '1d6>3': [new Die(3, 6, 1, 0, 1, 1, false, false), '', 'd6>3'],
  'd12>8-4': [new Die(8, 12, 1, -4, 1, 1, false, false), '1d12>8-4'],
  'd>2': [new Die(2, 6, 1, 0, 1, 1, false, false), '1d6>2', 'd>2'],
  'd-6>10': [new Die(-6, 10, 1, 0, 1, 1, false, false), '1d10>-6', 'd10>-6'],
  'd-6>-10': [
    new Die(-10, -6, 1, 0, 1, 1, false, false),
    '1d-6>-10',
    'd-6>-10',
  ],
  'd6>-10x': [new Die(-10, 6, 1, 0, 1, 1, true, false), '1d6>-10x', 'd>-10x'],
  'd2/2': [new Die(1, 2, 1, 0, 0.5, 1, false, false, '/'), `1d2${DIVIDE_CHARS[0]}2`],
};

expect.extend({
  toEqualWithMessage(recieved, target, message='') {
    const pass = recieved === target;
    if (pass) {
      return {
        message: () =>
          `expected ${recieved} not to equal ${target}: ${message}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${recieved} to equal ${target}: ${message}`,
        pass: false,
      };
    }
  },
});

expect.extend({
  // generator = random number generating function
  // target = number that we are looking for
  // tries = max number of numbers to generate before failing
  toGenerateRandomly(target, generator: () => any, tries = 1000) {
    let pass = false;
    const fail = `did not generate a ${target} in ${tries} attempts`;
    for (let i = 0; i < tries; i++) {
      if (generator() === target) {
        pass = true;
        break;
      }
    }

    return {
      message: () => fail,
      pass: pass,
    };
  },
});

test('test dice constructor and parser', () => {
  for (const ds in test_dice) {
    const d = new Die(ds);
    //console.log(ds, ' : ', test_dice[ds][1] || ds, " = ", d.toString(), " ", JSON.stringify(ds))
    expect(test_dice[ds][1] || ds).toEqualWithMessage(
      d.toString(),
      'key:' + ds,
      ''
    );
    expect(d.equals(test_dice[ds][0])).toEqualWithMessage(
      true,
      ds + ' ' + JSON.stringify(d) + ' != ' + JSON.stringify(test_dice[ds][0]),
      ''
    );
  }
});

test('test functions for expected results', () => {
  const d = new Die();
  expect(d.getResult()).toEqualWithMessage(
    -1,
    'unrolled result should always be -1',
    ''
  );
  d.roll();
  expect(d.getResult()).not.toEqual(-1);
  expect(new Die().roll()).not.toEqual(-1);
});

test('rolling produces result data', () => {
  let d = new Die('1d6');
  expect(d.result).toBeNull();
  expect(d.results.length).toEqual(0);
  d.roll();
  expect(d).toBeInstanceOf(Die);
  expect(d.result).not.toBeNull();
  expect(d.results.length).toEqual(1);
  expect(d.results[0].length).toEqual(2); // total and single die roll
  expect(d.result).toEqual(d.results[0][0]);
  expect(d.getResult()).toEqual(d.result);
  expect(d.result).toBeGreaterThanOrEqual(1);
  expect(d.result).toBeLessThanOrEqual(6);
  expect(d.getThrow()[0]).toEqual(d.result); // since 1 repeat, first element is result

  d = new Die('2d6').roll();
  expect(d.results.length).toEqual(1);
  expect(d.results[0].length).toEqual(3); // total and two die rolls
  expect(d.results[0][0]).toEqual(d.result); // since 1 repeat, first element is result

  d = new Die('3x(2d6)').roll();
  expect(d.results.length).toEqual(3);
  expect(d.results[2].length).toEqual(3); // total and two die rolls for last repeat
  expect(d.results[0][0]).not.toEqual(d.result); // since ?1 repeat, first element is not result
});

test('do possible ranges look reasonable?', () => {
  let min: number, max: number;
  let d = new Die('1d6');
  [min, max] = d.getRange();
  expect(min).toEqual(1);
  expect(max).toEqual(6);

  d = new Die('2d6');
  [min, max] = d.getRange();
  expect(min).toEqual(2);
  expect(max).toEqual(12);
  [min, max] = d.getRange(true);
  expect(min).toEqual(1);
  expect(max).toEqual(6);

  d = new Die('2X(3d6)');
  [min, max] = d.getRange();
  expect(min).toEqual(6);
  expect(max).toEqual(36);
  [min, max] = d.getRange(true);
  expect(min).toEqual(1);
  expect(max).toEqual(6);

  d = new Die('2X(3d6/2+3)');
  [min, max] = d.getRange();
  expect(min).toEqual(10);
  expect(max).toEqual(24);
  [min, max] = d.getRange(true);
  expect(min).toEqual(1);
  expect(max).toEqual(6);

  // test those round ups
  d = new Die('2d5/3+2');
  [min, max] = d.getRange();
  expect(min).toEqual(3);
  expect(max).toEqual(6);

  // TODO: could use some more complicated tests here
});

test('test randomness (sort of?? PROBABLY will work? theoretically could fail)', () => {
  let r: number[];
  let d: Die;

  d = new Die('1d3');
  // fill array with 120 dice roll results
  r = [...Array(120)].map((e) => d.roll().getResult());
  expect(r).toContain(1);
  expect(r).toContain(2);
  expect(r).toContain(3);
  expect(r).not.toContain(0);
  expect(r).not.toContain(4);

  d = new Die('1d3z');
  // fill array with 120 didce roll results
  r = [...Array(120)].map((e) => d.roll().getResult());
  expect(r).toContain(0);
  expect(r).toContain(1);
  expect(r).toContain(2);
  expect(r).toContain(3);
  expect(r).not.toContain(-1);
  expect(r).not.toContain(4);

  d = new Die('1d3xz');
  // fill array with 120 dice roll results
  r = [...Array(120)].map((e) => d.roll().getResult());
  expect(r).toContain(0);
  expect(r).toContain(1);
  expect(r).toContain(2);
  expect(r).not.toContain(-1);
  expect(r).not.toContain(3);

  d = new Die('2d5/3+2'); // 1-4
});

test('Should return 1', () => {
  const d = new Die('1d1/2');
  expect(d.roll().getResult()).toEqual(1);
  expect(d.roll().getResult()).toEqual(1);
  expect(d.roll().getResult()).toEqual(1);
  expect(d.roll().getResult()).toEqual(1);
  expect(d.roll().getResult()).toEqual(1);
});

