import { Die, DieRegExp } from './die';
import { mode_by_name, MODE_ID } from './modes';

export interface ParsedConsoleInput {
  mode: MODE_ID;
  dice: { die: Die; mode: MODE_ID }[];
  label: string;
}

function cloneDefaultDie(defaultDie: Die): Die {
  const die = defaultDie.clone();
  die.operator = '+';
  return die;
}

export function parseDiceExpression(
  input: string,
  defaultMode: MODE_ID,
  defaultDie: Die,
): ParsedConsoleInput | null {
  const text = input.trim();

  const singleDieResult = (die: Die, mode: MODE_ID): ParsedConsoleInput => ({
    mode,
    dice: [{ die, mode }],
    label: text,
  });

  if (!text) {
    return singleDieResult(cloneDefaultDie(defaultDie), defaultMode);
  }

  const dice: { die: Die; mode: MODE_ID }[] = [];
  let currentMode = defaultMode;
  let operator: '+' | '-' = '+';
  let pos = 0;
  let foundMode = false;

  const skipWhitespace = () => {
    while (pos < text.length && /\s/.test(text[pos])) pos++;
  };

  while (pos < text.length) {
    skipWhitespace();

    if (pos >= text.length) break;

    const wordMatch = text.slice(pos).match(/^[A-Za-z]+(?![0-9])/);
    if (wordMatch) {
      const word = wordMatch[0];
      const mode = mode_by_name(word);
      pos += word.length;
      if (mode) {
        currentMode = mode.id;
        foundMode = true;
      }
      continue;
    }

    if (text[pos] === '+' || text[pos] === '-') {
      operator = text[pos] as '+' | '-';
      pos++;
      continue;
    }

    const remaining = text.slice(pos);
    const match = new RegExp(DieRegExp.source).exec(remaining);
    if (match) {
      const die = new Die(match[0]);
      die.operator = operator;
      dice.push({ die, mode: currentMode });
      pos += match[0].length;
      operator = '+';
      continue;
    }

    pos++;
  }

  if (dice.length === 0) {
    if (foundMode) {
      return singleDieResult(cloneDefaultDie(defaultDie), currentMode);
    }
    return null;
  }

  return {
    mode: dice[0].mode,
    dice,
    label: text,
  };
}
