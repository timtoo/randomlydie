import {Die} from './die'

export enum MODE_ID {
  default = 0,
  binary = 1,
  dice = 2,
  hex = 3,
  decision = 4,
  note = 5,
  emoji = 6,
  games = 7,
}

interface override_interface {
  zerobase?: boolean;
  exclusive?: boolean;
  min?: number;
  max?: number;
}

class ModeBase {
  readonly id: number = -1; // enum
  readonly name: string = ''; // display string
  readonly material_icon: string = '';
  readonly override: override_interface = {}; // zerobase, inclusive, maybe min/max default settings
  readonly quick: number[] = []; // array of numbers to offer as quick buttons
  readonly default_max: number = -1; // default quick active button, essentially; also default mapping
  readonly number_base?: number = 10; // use 0 for modes where display is non-numeric
  readonly mappings?: { [max: number]: string[] }; // results to display rather than numbers
  readonly quick_label_prefix: string = ''; // used for hex/binary
  _quick_label: string[] = []; // optional labels to use instead of numbers on quick buttons

  configureDie(die: Die, quickValue: number): void {
    die.max = quickValue;
    die.min = die.zerobase ? 0 : 1;
  }

  getQuickValue(die: Die): number {
    return die.max;
  }

  // generate quick_label as needed
  get quick_label() {
    const length_diff = this.quick.length - this._quick_label.length;
    if (length_diff > 0) {
      //console.log(`creating ${length_diff} labels for ${this.name}`);
      for (let i = 0; i < length_diff; i++) {
        for (const i of this.quick) {
          this._quick_label.push(this.quick_label_prefix + this.formatValue(i));
        }
      }
    }
    return this._quick_label;
  }

  get name_stripped() {
    return this.name.replace(/\W+/g, '');
  }

  // turn the number into a formatted string; override as needed
  formatValue(v: number): string {
    if (this.number_base) {
      if (this.number_base === 10) {
        return v.toLocaleString();
      } else if (this.number_base >= 2 && this.number_base <= 36) {
        return v.toString(this.number_base).toUpperCase();
      }
    }
    return v.toString();
  }

  // Figure out if there are mappings and use those if they exist
  displayValue(v: number, max?: number, mod?: number): string {
    if (
      this.mappings &&
      max !== undefined &&
      Object.keys(this.mappings).includes(max.toString())
    ) {
      const mapping = this.mappings[max];
      if (!this.override.zerobase && v > 0) v--; // normalize for zerobase array
      //if (this.override.exclusive && max > 0) max--;
      if (v >= max) v = v % max; // make sure we're in range of the mapping
      return this.mappingChoice(mapping[v]);
    } else {
      return this.formatValue(v);
    }
  }

  // if a mapping string contains // then split and chose randomly
  mappingChoice(s: string) {
    if (s.indexOf('//') > -1) {
      const a = s.split('//');
      s = a[Math.floor(Math.random() * a.length)];
    }
    return s;
  }

  // override in case history string should be different from displayValue()
  historyValue(v: number, max?: number, mod?: number): string {
    return this.quick_label_prefix + this.displayValue(v, max, mod);
  }

  // if given multiple values, how to display them? depends on if they have a number_base != 0
  displayMulti(die: Die): string {
    if (this.number_base && die.getThrow().length > 1) {
      return this._displayMultiWithTotal(die);
    } else {
      return this._displayMultiValsOnly(die);
    }
  }

  // return formated total, with individual values in brackets after
  _displayMultiWithTotal(die: Die): string {
    // max is not needed as it is only used for mappings so is meaninless for a sum?
    const displayTotal = this.historyValue(die.getResult(), die.getResult());
    return displayTotal + ' (' + this._displayMultiValsOnly(die) + ')';
  }

  // alternate display without total
  _displayMultiValsOnly(die: Die): string {
    return die.getThrow().map((s) => this.historyValue(s, die.max, die.mod)).join('/');
  }
}

class ModeNormal extends ModeBase {
  id = MODE_ID.default;
  name = 'Number';
  material_icon = 'tag';
  override = {
    zerobase: false,
    exclusive: false,
  };
  quick = [
    2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 30, 50, 100, 256, 1000, 1000000,
  ];
  default_max = 10;
}

class ModeBinary extends ModeBase {
  id = MODE_ID.binary;
  name = 'Binary';
  material_icon = 'share';
  override = {
    zerobase: true,
    exclusive: false,
  };
  quick = [2, 4, 8, 16, 32, 64, 256, 256 * 256];
  quick_label_prefix = 'b';
  default_max = 256;
  number_base = 2;

  displayValue(v: number, max: number): string {
    // to avoid constant leading zero in exclusive mode, modify max when passing in like:
    // props.roll.die.max - (props.roll.die.exclusive ? 1 : 0)
    return this.formatValue(v).padStart(max.toString(2).length, '0');
  }
}

class ModeDice extends ModeBase {
  id = MODE_ID.dice;
  name = 'Dice';
  material_icon = 'casino';
  override = {
    zerobase: false,
    exclusive: false,
    min: 1,
  };
  quick = [2, 4, 6, 8, 10, 12, 20, 100];
  default_max = 6;
}

class ModeHex extends ModeBase {
  id = MODE_ID.hex;
  name = 'Hexidecimal';
  material_icon = 'hexagon';
  override = {
    min: 0,
    zerobase: true,
    exclusive: true,
  };
  quick = [
    16, 32, 64, 128, 256, 1024, 2048, 4096, 8192, 65536, 1048576, 16777216,
  ];
  quick_label_prefix = 'x';
  default_max = 256;
  number_base = 16;
}

class ModeDecision extends ModeBase {
  id = MODE_ID.decision;
  name = 'Decision';
  material_icon = 'help';
  override = {
    min: 0,
    max: 3,
    zerobase: true,
    exclusive: true,
  };
  mappings = {
    [2]: ['No', 'Yes'],
    [3]: ['No', 'Yes', 'Maybe'],
    [4]: ['No', 'Yes', 'Probably not', 'Probably'],
    [5]: ['Nah', 'Ok', 'Iffy', 'Could be', 'Whatever'],
  };
  quick = [2, 3, 4, 5];
  _quick_label = ['Yes/No', 'Maybe', 'Probably', 'Whatever'];
  default_max = 2;
  number_base = 0;
}

// Key labels with enharmonic equivalents for flat keys
const NOTE_KEY_LABELS: { [keyIndex: number]: string } = {
  0: 'C',
  2: 'D',
  4: 'E',
  5: 'F',
  7: 'G',
  9: 'A',
  11: 'B',
  1: 'C♯/D♭',
  3: 'D♯/E♭',
  6: 'F♯/G♭',
  8: 'G♯/A♭',
  10: 'A♯/B♭',
};

// Order: natural keys first, then enharmonic flat/sharp pairs
const NOTE_KEY_ORDER = [0, 2, 4, 5, 7, 9, 11, 1, 3, 6, 8, 10];

const CHROMATIC_NOTES = [
  'C', 'C♯//D♭', 'D', 'D♯//E♭', 'E', 'F',
  'F♯//G♭', 'G', 'G♯//A♭', 'A', 'A♯//B♭', 'B',
];

// Scale intervals (semitones from root)
const SCALE_INTERVALS: { [size: number]: number[] } = {
  5: [0, 2, 4, 7, 9],       // Major pentatonic
  7: [0, 2, 4, 5, 7, 9, 11], // Major diatonic (heptatonic)
  12: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // Chromatic
};

function buildScaleMapping(size: number, keyIndex: number): string[] {
  const intervals = SCALE_INTERVALS[size];
  if (!intervals) return [];
  return intervals.map((interval) => {
    const noteIndex = (keyIndex + interval) % 12;
    return CHROMATIC_NOTES[noteIndex];
  });
}

// Encode scale size and key index into a single quick value
function encodeNoteQuick(scaleSize: number, keyIndex: number): number {
  return scaleSize * 100 + keyIndex;
}

function decodeNoteQuick(quickValue: number): { scaleSize: number; keyIndex: number } {
  return {
    scaleSize: Math.floor(quickValue / 100),
    keyIndex: quickValue % 100,
  };
}

class ModeNote extends ModeBase {
  id = MODE_ID.note;
  name = 'Musical Note';
  material_icon = 'music_note';
  override = {
    zerobase: false,
    exclusive: false,
    min: 1,
    max: 12,
  };
  quick: number[] = [];
  _quick_label: string[] = [];
  default_max = encodeNoteQuick(7, 0); // C Scale
  number_base = 0;

  constructor() {
    super();
    // Pentatonic: only C
    this.quick.push(encodeNoteQuick(5, 0));
    this._quick_label.push('C Pentatonic');
    // Scale: natural keys first, then enharmonic pairs
    for (const k of NOTE_KEY_ORDER) {
      this.quick.push(encodeNoteQuick(7, k));
      this._quick_label.push(`${NOTE_KEY_LABELS[k]} Scale`);
    }
    // Chromatic: key-agnostic, just one
    this.quick.push(encodeNoteQuick(12, 0));
    this._quick_label.push('Chromatic');
  }

  configureDie(die: Die, quickValue: number): void {
    const { scaleSize, keyIndex } = decodeNoteQuick(quickValue);
    die.max = scaleSize;
    die.min = 1;
    die.mod = keyIndex;
    die.zerobase = false;
    die.exclusive = false;
  }

  getQuickValue(die: Die): number {
    return encodeNoteQuick(die.max, die.mod);
  }

  displayValue(v: number, max?: number, mod?: number): string {
    const scaleSize = max ?? 12;
    const keyIndex = mod ?? 0;
    const mapping = buildScaleMapping(scaleSize, keyIndex);
    if (!this.override.zerobase && v > 0) v--;
    if (v >= scaleSize) v = v % scaleSize;
    return this.mappingChoice(mapping[v]);
  }

  historyValue(v: number, max?: number, mod?: number): string {
    return this.displayValue(v, max, mod);
  }
}
// &#x266d; - flat
// &#x266f; - sharp

interface EmojiSet {
  name: string;
  codePoints: number[];
}

const EMOJI_SETS: EmojiSet[] = [
  {
    name: 'Alchemy',
    codePoints: Array.from({ length: 0x1f77f - 0x1f700 + 1 }, (_, i) => 0x1f700 + i),
  },
  {
    name: 'Animals',
    codePoints: [
      0x1F400, 0x1F401, 0x1F402, 0x1F403, 0x1F404, 0x1F405, 0x1F406,
      0x1F407, 0x1F408, 0x1F409, 0x1F40A, 0x1F40B, 0x1F40C, 0x1F40D,
      0x1F40E, 0x1F40F, 0x1F410, 0x1F411, 0x1F412, 0x1F413, 0x1F414,
      0x1F415, 0x1F416, 0x1F417, 0x1F418, 0x1F419, 0x1F41A, 0x1F41B,
      0x1F41C, 0x1F41D, 0x1F41E, 0x1F41F, 0x1F420, 0x1F421, 0x1F422,
      0x1F423, 0x1F424, 0x1F425, 0x1F426, 0x1F427, 0x1F428, 0x1F429,
      0x1F42A, 0x1F42B, 0x1F42C, 0x1F42D, 0x1F42E, 0x1F42F, 0x1F430,
      0x1F431, 0x1F432, 0x1F433, 0x1F434, 0x1F435, 0x1F436, 0x1F437,
      0x1F438, 0x1F439, 0x1F43A, 0x1F43B, 0x1F43C, 0x1F43D, 0x1F43E,
      0x1F43F, 0x1F54A, 0x1F577, 0x1F578, 0x1F648, 0x1F649, 0x1F64A,
      0x1F980, 0x1F981, 0x1F982, 0x1F983, 0x1F984, 0x1F985, 0x1F986,
      0x1F987, 0x1F988, 0x1F989, 0x1F98A, 0x1F98B, 0x1F98C, 0x1F98D,
      0x1F98E, 0x1F98F, 0x1F990, 0x1F991, 0x1F992, 0x1F993, 0x1F994,
      0x1F995, 0x1F996, 0x1F997, 0x1F998, 0x1F999, 0x1F99A, 0x1F99B,
      0x1F99C, 0x1F99D, 0x1F99E, 0x1F99F, 0x1F9A0, 0x1F9A1, 0x1F9A2,
      0x1F9A3, 0x1F9A4, 0x1F9A5, 0x1F9A6, 0x1F9A7, 0x1F9A8, 0x1F9A9,
      0x1F9AA, 0x1F9AB, 0x1F9AC, 0x1F9AD, 0x1F9AE, 0x1FAB0, 0x1FAB1,
      0x1FAB2, 0x1FAB3, 0x1FABC, 0x1FABD, 0x1FABE, 0x1FABF, 0x1FACE,
      0x1FACF,
    ],
  },
  {
    name: 'Dingbats',
    codePoints: Array.from({ length: 0x27bf - 0x2700 + 1 }, (_, i) => 0x2700 + i),
  },
  {
    name: 'Emoticons',
    codePoints: Array.from({ length: 0x1f64f - 0x1f600 + 1 }, (_, i) => 0x1f600 + i),
  },
  {
    name: 'Food',
    codePoints: [
      0x1F33D, 0x1F344, 0x1F345, 0x1F346, 0x1F347, 0x1F348, 0x1F349,
      0x1F34A, 0x1F34B, 0x1F34C, 0x1F34D, 0x1F34E, 0x1F34F, 0x1F350,
      0x1F351, 0x1F352, 0x1F353, 0x1F360, 0x1F361, 0x1F362, 0x1F363,
      0x1F364, 0x1F365, 0x1F366, 0x1F367, 0x1F368, 0x1F369, 0x1F36A,
      0x1F36B, 0x1F36C, 0x1F36D, 0x1F36E, 0x1F36F, 0x1F370, 0x1F371,
      0x1F372, 0x1F373, 0x1F374, 0x1F375, 0x1F376, 0x1F377, 0x1F378,
      0x1F379, 0x1F37A, 0x1F37B, 0x1F37C, 0x1F37D, 0x1F37E, 0x1F37F,
      0x1F382, 0x1F942, 0x1F943, 0x1F950, 0x1F951, 0x1F952, 0x1F953,
      0x1F954, 0x1F955, 0x1F956, 0x1F957, 0x1F958, 0x1F959, 0x1F95A,
      0x1F95B, 0x1F95C, 0x1F95D, 0x1F95E, 0x1F95F, 0x1F960, 0x1F961,
      0x1F962, 0x1F963, 0x1F964, 0x1F965, 0x1F966, 0x1F967, 0x1F968,
      0x1F969, 0x1F96A, 0x1F96B, 0x1F96C, 0x1F96D, 0x1F96E, 0x1F96F,
      0x1F9C0, 0x1F9C1, 0x1F9C2, 0x1F9C3, 0x1F9C4, 0x1F9C5, 0x1F9C6,
      0x1F9C7, 0x1F9C8, 0x1F9C9, 0x1F9CA, 0x1F9CB, 0x1F9CC, 0x1F9CD,
      0x1FAD0, 0x1FAD1, 0x1FAD2, 0x1FAD3, 0x1FAD4, 0x1FAD5, 0x1FAD6,
      0x1FAD7, 0x1FAD8, 0x1FAD9,
    ],
  },
  {
    name: 'Math',
    codePoints: Array.from({ length: 0x22ff - 0x2200 + 1 }, (_, i) => 0x2200 + i),
  },
  {
    name: 'Misc Symbols',
    codePoints: Array.from({ length: 0x1f5ff - 0x1f300 + 1 }, (_, i) => 0x1f300 + i),
  },
  {
    name: 'Musical Symbols',
    codePoints: Array.from({ length: 0x1d1ff - 0x1d100 + 1 }, (_, i) => 0x1d100 + i),
  },
  {
    name: 'Plants',
    codePoints: [
      0x1F331, 0x1F332, 0x1F333, 0x1F334, 0x1F335,
      0x1F33A, 0x1F33B, 0x1F33C, 0x1F33E, 0x1F33F,
      0x1F340, 0x1F341, 0x1F342, 0x1F343, 0x1F344,
      0x1F384, 0x1F38B, 0x1F38D, 0x1F3F5,
      0x1F490, 0x1F4AE, 0x1F940,
      0x1F952, 0x1F954, 0x1F955, 0x1F96C, 0x1F96D,
    ],
  },
  {
    name: 'Religion',
    codePoints: [
      0x0FD5, 0x0FD6, 0x0FD7, 0x0FD8, 0x2625,
      0x2626, 0x2627, 0x262A, 0x262F, 0x2638, 0x2670,
      0x2671, 0x269C, 0x26E4, 0x26E7, 0x26E9,
      0x26EA, 0x2719, 0x271D, 0x2720, 0x2721,
      0x1F47C, 0x1F4FF, 0x1F52E, 0x1F549, 0x1F54B,
      0x1F54C, 0x1F54D, 0x1F54E, 0x1F6D0, 0x1F9FF,
      0x1FA94, 0x1FAAC,
    ],
  },
  {
    name: 'Shapes',
    codePoints: Array.from({ length: 0x25ff - 0x25a0 + 1 }, (_, i) => 0x25a0 + i),
  },
  {
    name: 'Transport/Map',
    codePoints: Array.from({ length: 0x1f6ff - 0x1f680 + 1 }, (_, i) => 0x1f680 + i),
  },
  {
    name: 'Weather',
    codePoints: [
      0x2600, 0x2601, 0x2602, 0x2603, 0x2608, 0x2614, 0x2615,
      0x26A1, 0x26C4, 0x26C5, 0x26C8, 0x26F1,
      0x1F308, 0x1F30A, 0x1F324, 0x1F325, 0x1F326, 0x1F327,
      0x1F328, 0x1F329, 0x1F32A, 0x1F32B, 0x1F32C,
      0x1F4A6, 0x1F4A7, 0x1F4A8, 0x1F505, 0x1F506, 0x1F525, 0x1F9CA,
    ],
  },
];

class ModeEmoji extends ModeBase {
  id = MODE_ID.emoji;
  name = 'Emoji';
  material_icon = 'emoji_emotions';
  override = {
    zerobase: false,
    exclusive: false,
    min: 0,
  };
  quick = [...EMOJI_SETS.map((_r, i) => i), -2];
  _quick_label = [...EMOJI_SETS.map((r) => r.name), 'Unicode'];
  default_max = EMOJI_SETS.findIndex((s) => s.name === 'Emoticons');
  number_base = 0;

  private _findSetByIndex(index: number): EmojiSet | undefined {
    return EMOJI_SETS[index];
  }

  private _findSetByBounds(min: number, max: number): EmojiSet | undefined {
    return EMOJI_SETS.find((s) => s.codePoints[0] === min && s.codePoints[s.codePoints.length - 1] === max);
  }

  configureDie(die: Die, quickValue: number): void {
    if (quickValue === -2) {
      die.min = 0x21;
      die.max = 0x1f9ff;
      die.mod = -2;
      die.zerobase = false;
      die.exclusive = false;
      return;
    }
    const set = this._findSetByIndex(quickValue);
    if (set) {
      die.min = 0;
      die.max = set.codePoints.length - 1;
      die.mod = quickValue;
      die.zerobase = false;
      die.exclusive = false;
    } else {
      die.max = quickValue;
      die.min = 0;
      die.mod = 0;
    }
  }

  getQuickValue(die: Die): number {
    if (die.mod === -2) {
      return -2;
    }
    if (die.mod >= 0 && die.mod < EMOJI_SETS.length) {
      return die.mod;
    }
    const set = EMOJI_SETS.find((s) => s.codePoints.length === die.max + 1 && die.min === 0);
    if (set) {
      return EMOJI_SETS.indexOf(set);
    }
    return die.max;
  }

  formatValue(v: number): string {
    return String.fromCodePoint(v);
  }

  private _isPrintableCodePoint(cp: number): boolean {
    try {
      const char = String.fromCodePoint(cp);
      if (/\p{Control}/u.test(char)) return false;
      if (/\p{Format}/u.test(char)) return false;
      if (/\p{Surrogate}/u.test(char)) return false;
      if (/\p{Private_Use}/u.test(char)) return false;
      if (/\p{Unassigned}/u.test(char)) return false;
      return true;
    } catch {
      return false;
    }
  }

  private _getPrintableUnicode(v: number): number {
    // For Unicode mode: if the rolled code point is unprintable,
    // re-roll within the same range until we find a printable one.
    let cp = v;
    let attempts = 0;
    const min = 0x21;
    const max = 0x1f9ff;
    while (!this._isPrintableCodePoint(cp) && attempts < 100) {
      cp = Math.floor(Math.random() * (max - min + 1)) + min;
      attempts++;
    }
    return cp;
  }

  displayValue(v: number, max?: number, mod?: number): string {
    // mod is the authoritative set index for Emoji mode
    if (mod !== undefined && mod >= 0 && mod < EMOJI_SETS.length) {
      const set = EMOJI_SETS[mod];
      return this.formatValue(set.codePoints[v % set.codePoints.length]);
    }
    if (mod === -2) {
      return this.formatValue(this._getPrintableUnicode(v));
    }
    // Fallback: try to find set by length (legacy/URL parsing compatibility)
    const set = EMOJI_SETS.find((s) => s.codePoints.length === (max ?? 0) + 1);
    if (set) {
      return this.formatValue(set.codePoints[v % set.codePoints.length]);
    }
    return this.formatValue(this._getPrintableUnicode(v));
  }

  historyValue(v: number, max?: number, mod?: number): string {
    return this.displayValue(v, max, mod);
  }
}

interface GameSet {
  name: string;
  codePoints: number[];
}

const GAME_SETS: GameSet[] = [
  {
    name: 'Playing Cards',
    codePoints: (() => {
      const points: number[] = [];
      const suits = [0xA, 0xB, 0xC, 0xD];
      const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14];
      for (const suit of suits) {
        for (const rank of ranks) {
          points.push(0x1F000 + suit * 16 + rank);
        }
      }
      return points;
    })(),
  },
  {
    name: 'Mahjong',
    codePoints: Array.from({ length: 34 }, (_, i) => 0x1F000 + i),
  },
  {
    name: 'Dominoes',
    codePoints: Array.from({ length: 100 }, (_, i) => 0x1F030 + i),
  },
  {
    name: 'Chess',
    codePoints: Array.from({ length: 12 }, (_, i) => 0x2654 + i),
  },
  {
    name: 'Xiangqi',
    codePoints: Array.from({ length: 14 }, (_, i) => 0x1FA60 + i),
  },
  {
    name: 'I Ching',
    codePoints: Array.from({ length: 64 }, (_, i) => 0x4DC0 + i),
  },
];

class ModeGames extends ModeBase {
  id = MODE_ID.games;
  name = 'Games';
  material_icon = 'interests';
  override = {
    zerobase: false,
    exclusive: false,
    min: 0,
  };
  quick = GAME_SETS.map((_r, i) => i);
  _quick_label = GAME_SETS.map((r) => r.name);
  default_max = 0;
  number_base = 0;

  private _findSetByIndex(index: number): GameSet | undefined {
    return GAME_SETS[index];
  }

  private _findSetByBounds(min: number, max: number): GameSet | undefined {
    return GAME_SETS.find((s) => s.codePoints[0] === min && s.codePoints[s.codePoints.length - 1] === max);
  }

  configureDie(die: Die, quickValue: number): void {
    const set = this._findSetByIndex(quickValue);
    if (set) {
      die.min = 0;
      die.max = set.codePoints.length - 1;
      die.mod = quickValue;
      die.zerobase = false;
      die.exclusive = false;
    } else {
      die.max = quickValue;
      die.min = 0;
    }
  }

  getQuickValue(die: Die): number {
    const set = GAME_SETS.find((s) => s.codePoints.length === die.max + 1 && die.min === 0);
    if (set) {
      return GAME_SETS.indexOf(set);
    }
    return die.max;
  }

  formatValue(v: number): string {
    return String.fromCodePoint(v);
  }

  displayValue(v: number, max?: number, mod?: number): string {
    // mod is the authoritative set index for Games mode
    if (mod !== undefined && mod >= 0 && mod < GAME_SETS.length) {
      const set = GAME_SETS[mod];
      return this.formatValue(set.codePoints[v % set.codePoints.length]);
    }
    // Fallback: try to find set by length (legacy/URL parsing compatibility)
    const set = GAME_SETS.find((s) => s.codePoints.length === (max ?? 0) + 1);
    if (set) {
      return this.formatValue(set.codePoints[v % set.codePoints.length]);
    }
    return this.formatValue(v);
  }

  historyValue(v: number, max?: number, mod?: number): string {
    return this.displayValue(v, max, mod);
  }
}

const all_modes = [
  new ModeNormal(),
  new ModeBinary(),
  new ModeHex(),
  new ModeDice(),
  new ModeNote(),
  new ModeDecision(),
  new ModeEmoji(),
  new ModeGames(),
];

export const MODE: { [mode: number]: ModeBase } = Object.fromEntries(
  all_modes.map((m) => [m.id, m])
);

export function mode_by_name(s: string): ModeBase | void {
  const mode = Object.values(MODE).filter((m) => {
    return m.name_stripped.toLowerCase().startsWith(s.toLowerCase());
  });
  if (mode.length > 0) return mode[0];
}
