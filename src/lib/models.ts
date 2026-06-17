import { Die } from 'src/lib/die';
import { MODE_ID } from 'src/lib/modes'

export type rollHistoryType = {
  label: string;      // die.toString() - dice notation (used for URL/FAB/settings)
  chipLabel: string;  // quick-button label for history chips (set-based modes)
  display: string;  // strings displayed for each random item
  die: Die;           // die object with .roll() already called
  mode: MODE_ID;      // what mode was used for display/processing
  time: Date;         // when did this roll take place
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
