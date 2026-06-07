import {Die} from './die'

export enum MODE_ID {
  default = 0,
  binary = 1,
  dice = 2,
  hex = 3,
  decision = 4,
  note = 5,
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
  displayValue(v: number, max?: number): string {
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
  historyValue(v: number, max?: number): string {
    return this.quick_label_prefix + this.displayValue(v, max);
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
    return die.getThrow().map((s) => this.historyValue(s, die.max)).join('/');
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
  mappings = {
    [5]: ['A', 'C', 'D', 'E', 'G'],
    [7]: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    [12]: [
      'A',
      'A♯//B♭',
      'B',
      'C',
      'C♯//D♭',
      'D',
      'D♯//E♭',
      'E',
      'F',
      'F♯//G♭',
      'G',
      'G♯//A♭',
    ],
  };
  quick = [5, 7, 12];
  _quick_label = ['Pentatonic', 'Heptatonic', 'Chromatic'];
  default_max = 2;
  number_base = 0;
}
// &#x266d; - flat
// &#x266f; - sharp

const all_modes = [
  new ModeNormal(),
  new ModeBinary(),
  new ModeHex(),
  new ModeDice(),
  new ModeNote(),
  new ModeDecision(),
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
