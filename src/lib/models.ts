import { Die } from 'src/lib/die';
import { MODE_ID } from 'src/lib/modes';

export type rollHistoryType = {
  label: string; // die.toString() - dice notation (used for URL/FAB/settings)
  chipLabel: string; // quick-button label for history chips (set-based modes)
  display: string; // strings displayed for each random item
  dice: { die: Die; mode: MODE_ID }[]; // canonical list of rolled dice
  die: Die; // deprecated: dice[0].die, kept for backwards compat
  mode: MODE_ID; // deprecated: dice[0].mode, kept for backwards compat
  isMulti: boolean; // true when dice.length > 1
  time: Date; // when did this roll take place
};

export type consoleDiceEntry = {
  die: Die;
  mode: MODE_ID;
};

export type consoleSubmitType = {
  label: string; // the raw console input
  mode: MODE_ID; // mode of the first die (fallback for the single-die UI)
  dice: consoleDiceEntry[]; // parsed dice, each with its resolved mode
  time: Date;
};

// export type saveStateDictType = {
//   [key: string]: Die;
// };

// export type stateType = {
//   die: Die;
//   rolls: rollHistoryType[]; // history of actual rolls (random results)
//   lastTime: Date;
//   history: rollHistoryType[]; // mode/range history
//   newQuantity: number;
//   needUpdate: number;
// };
