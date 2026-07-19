/* Handle dice notation parsing and rolls 

Most basic use for a number between 1 and 10:

`const random_number = new Die(1,10).roll().result`

Roll three six sided dice:

`const die = new Die('3d6').roll()`

Then `die.result` will hold the rolled total, and `die.results` is an array with individual values.

See: [Dice notation](https://en.wikipedia.org/wiki/Dice_notation)

For details on our extensions, see README.md

Note on `results` array. 

- Each row represents the results of one throw (one repeat). 
- Each row contains: `[total with modifier/multiplier, die 1, die 2, die 3, ...]`
- the `result` variable will have a sum of the totals

*/

const DEFAULT_MIN = 1;
const DEFAULT_MAX = 6;
const DEFAULT_DICE = 1;
const DEFAULT_MULT = 1;
const DEFAULT_MOD = 0;
const DEFAULT_REPEAT = 1;

// the first char is used for official formatting, the last char is common ascii/typed character.
const MULTIPY_CHARS = '×X*⋅x';
const DIVIDE_CHARS = '/⁄÷∕/'; // solidus, fraction slash, division slash, division sign, forward slash

const DieRegExp = new RegExp(
  `\\b((?<repeat>\\d+)[${MULTIPY_CHARS}]\\(?)?(?<rolls>\\d*)[dD](?<max>-?\\d*)(>(?<min>-?\\d+))?((?<mult>[${MULTIPY_CHARS}${DIVIDE_CHARS}]\\d+)(?<mod>[+-]\\d+)|(?<mod1>[+-]\\d+)(?<mult1>[${MULTIPY_CHARS}${DIVIDE_CHARS}]\\d+)|(?<mod2>[+-]\\d+)|(?<mult2>[${MULTIPY_CHARS}${DIVIDE_CHARS}]\\d+))?(?<flag1>[xXzZ])?(?<flag2>[xXzZ])?\\b`,
);

class Die {
  min: number;
  max: number;
  dice: number;
  mod: number;
  mult: number;
  repeat: number;
  zerobase: boolean;
  exclusive: boolean;
  operator: string;

  parsedText: string;
  result: number | null;
  results: number[][];
  rid: number;

  constructor(
    min: number | string = DEFAULT_MIN,
    max = DEFAULT_MAX,
    dice = DEFAULT_DICE,
    mod = DEFAULT_MOD,
    mult = DEFAULT_MULT,
    repeat = DEFAULT_REPEAT,
    exclusive = false,
    zerobase = false,
    operator = '+',
  ) {
    this.min = DEFAULT_MIN; // default minimum allowed
    this.max = max; // sides of dice
    this.dice = dice; // number of times to roll dice
    this.mod = mod; // positive or negative modifier
    this.mult = mult; // multiplier (decimal to divide)
    this.repeat = repeat; // how many times to roll the above

    this.zerobase = zerobase; // zero is lowest instead of one
    this.exclusive = exclusive; // subtract 1 from highest dice number
    this.operator = operator; // is the total positive or negative (for aggregation)

    this.result = null; // total value of last roll
    this.results = []; // [total, die 1, die 2, die 3, ...]
    this.parsedText = '';

    if (typeof min === 'string') {
      const result = this.parse(min);
      if (result === null) throw new Error('Invalid dice notation');
    } else {
      this.min = min;
    }

    this.rid = Math.random(); // meaningless random number
  }

  // always returns a number for last roll result; -1 if not yet rolled
  getResult(): number {
    return this.result === null ? -1 : this.result;
  }

  // return just the dice values for the given throw (note: 1-based)
  getThrow(repeat = 1): number[] {
    if (this.results.length >= repeat) return this.results[repeat - 1].slice(1);
    return [];
  }

  // the actual possible range to roll
  // note: probabilty distribution may not be even if repeats?
  // single: single die only (if more than one)
  getRange(single = false): [number, number] {
    let min = this.min;
    let max = this.max;
    if (!single) {
      min = (Math.ceil(this.dice * this.mult) + this.mod) * this.repeat;
      max =
        (Math.ceil(this.max * this.dice * this.mult) + this.mod) * this.repeat;
    }
    if (this.exclusive) max--;
    return [min, max];
  }

  // single: range for just a single die only,
  // absolute: actual range, don't use exclusive indicator
  getRangeString(single = false, separator = ',', absolute = false): string {
    const [min, max] = this.getRange(single);
    return (
      '[' +
      min +
      separator +
      (absolute || !this.exclusive ? '' + max + ']' : '' + (max + 1) + ')')
    );
  }

  // throw the dice, just once, return results in array [total, die 1, die 2, ...]
  throw(): number[] {
    const row: number[] = [0];
    const upper = this.exclusive ? this.max : this.max + 1;

    for (let i = 0; i < this.dice; i++) {
      row.push(Math.floor(Math.random() * (upper - this.min)) + this.min);
      row[0] += row[row.length - 1];
    }

    row[0] = Math.ceil(row[0] * this.mult); // D&D manaul says round up?
    row[0] += this.mod;

    return row;
  }

  // throw the dice as many times as needed, update object with results, return object
  roll(): Die {
    this.results = [this.throw()];
    this.result = this.results[0][0];
    if (this.repeat > 1) {
      for (let i = 1; i < this.repeat; i++) {
        this.results.push(this.throw());
        this.result += this.results[this.results.length - 1][0];
      }
    }
    return this;
  }

  // return a new dice object with same settings, with optional overrides
  clone(
    min?: number,
    max?: number,
    dice?: number,
    mod?: number,
    mult?: number,
    repeat?: number,
    exclusive?: boolean,
    zerobase?: boolean,
    operator?: string,
  ) {
    const d = new Die(
      min || this.min,
      max || this.max,
      dice || this.dice,
      mod || this.mod,
      mult || this.mult,
      repeat || this.repeat,
      exclusive || this.exclusive,
      zerobase || this.zerobase,
    );
    d.operator = operator !== undefined ? operator : this.operator;
    return d;
  }

  equals(d: Die) {
    return (
      this.min === d.min &&
      this.max === d.max &&
      this.dice === d.dice &&
      this.mod === d.mod &&
      this.mult === d.mult &&
      this.repeat === d.repeat &&
      this.exclusive === d.exclusive &&
      this.zerobase === d.zerobase
    );
  }

  get_mod_operator(): string {
    if (this.mod !== 0) {
      return this.mod > 0 ? '+' : '-';
    }
    return '';
  }

  get_mod_value(): number {
    return this.mod > 0 ? this.mod : Math.abs(this.mod);
  }

  // the number to put after the operator
  get_mult_operator(): string {
    if (this.mult === 1) return '';
    return this.mult > 1 || this.mult === 0
      ? MULTIPY_CHARS[0]
      : DIVIDE_CHARS[0];
  }

  // the number to put after the operator
  get_mult_value(): number {
    return this.mult > 1 || this.mult === 0
      ? this.mult
      : Math.round(1 / this.mult);
  }

  // format any multiplier to how it should look as part of dice notation
  toString_format_mult(): string {
    if (this.mult === 1) return '';
    return this.get_mult_operator() + this.get_mult_value();
  }

  toString_format_mod(): string {
    if (this.mod === 0) return '';
    return this.get_mod_operator() + this.get_mod_value();
  }

  toString_format_mult_mod(): string {
    return this.toString_format_mult() + this.toString_format_mod();
  }

  // dice notation git push --force-with-lease origin multid
  toString(compact = false): string {
    let value = `${this.dice}d${this.max}`;

    //if (this.min !== 1) value += ">" + this.min;
    //if (this.min !== 1 || (this.min === 0 && (! this.zerobase))) value += ">" + this.min;
    if (this.min !== 1) {
      if (!(this.min === 0 && this.zerobase)) value += '>' + this.min;
    }

    value += this.toString_format_mult_mod();

    if (this.repeat > 1) value = `${this.repeat}x(${value})`;

    if (compact) {
      if (this.max === 6) value = value.replace('d6', 'd');
      if (this.dice === 1) value = value.replace('1d', 'd');
    }

    if (this.exclusive) value += 'x';
    if (this.min === 0 && this.zerobase) value += 'z';

    return value;
  }

  parse(s: string): Die | null {
    const match = DieRegExp.exec(s);

    if (match) {
      //console.log(match.groups);
      this.parsedText = s;
      this.repeat = match.groups?.repeat
        ? +match.groups.repeat
        : DEFAULT_REPEAT;
      this.dice = match.groups?.rolls ? +match.groups.rolls : DEFAULT_DICE;
      this.mod = +(
        match.groups?.mod2 ||
        match.groups?.mod1 ||
        match.groups?.mod ||
        DEFAULT_MOD
      );
      this.max = match.groups?.max ? +match.groups.max : DEFAULT_MAX;
      this.min = match.groups?.min ? +match.groups.min : DEFAULT_MIN;

      if (this.min > this.max) [this.min, this.max] = [this.max, this.min];

      this.mult = DEFAULT_MULT;
      const mult: string | undefined =
        match.groups?.mult2 || match.groups?.mult1 || match.groups?.mult;
      if (mult) {
        if (DIVIDE_CHARS.indexOf(mult[0]) >= 0) {
          this.mult = 1 / +mult.slice(1);
        } else {
          this.mult = +mult.slice(1);
        }
      }

      this.exclusive = false;
      this.zerobase = false;

      [match.groups?.flag1, match.groups?.flag2].map((e) => {
        if (e) {
          if (e.toLowerCase() === 'x') this.exclusive = true;
          // zero base is ignored if any non-zero min is explictly set
          if (
            e.toLowerCase() === 'z' &&
            (match.groups?.min === undefined || this.min === 0)
          ) {
            this.zerobase = true;
            this.min = 0;
          }
        }
        return e;
      });

      this.rid = Math.random();
      return this;
    }
    return null;
  }
}

export { Die, DieRegExp, MULTIPY_CHARS, DIVIDE_CHARS };
