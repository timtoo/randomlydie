// vitest test file for mode logic
import { expect, test, describe } from 'vitest';
import { Die } from './die';
import { MODE, MODE_ID, mode_by_name } from './modes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDie(min: number, max: number, mod: number, dice = 1): Die {
  const d = new Die(min, max, dice, mod);
  d.zerobase = false;
  d.exclusive = false;
  return d;
}

// ---------------------------------------------------------------------------
// Mode lookup
// ---------------------------------------------------------------------------

describe('mode_by_name', () => {
  test('finds modes by prefix', () => {
    expect(mode_by_name('num')?.id).toBe(MODE_ID.default);
    expect(mode_by_name('dice')?.id).toBe(MODE_ID.dice);
    expect(mode_by_name('hex')?.id).toBe(MODE_ID.hex);
    expect(mode_by_name('emoji')?.id).toBe(MODE_ID.emoji);
    expect(mode_by_name('games')?.id).toBe(MODE_ID.games);
    expect(mode_by_name('decision')?.id).toBe(MODE_ID.decision);
    expect(mode_by_name('mus')?.id).toBe(MODE_ID.note); // 'Musical Note'
    expect(mode_by_name('binary')?.id).toBe(MODE_ID.binary);
  });

  test('returns undefined for unknown mode', () => {
    expect(mode_by_name('xyz')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Emoji mode
// ---------------------------------------------------------------------------

describe('ModeEmoji', () => {
  const emoji = MODE[MODE_ID.emoji];

  test('has expected quick button labels', () => {
    expect(emoji.quick_label).toContain('Alchemy');
    expect(emoji.quick_label).toContain('Animals');
    expect(emoji.quick_label).toContain('Dingbats');
    expect(emoji.quick_label).toContain('Emoticons');
    expect(emoji.quick_label).toContain('Math');
    expect(emoji.quick_label).toContain('Misc Symbols');
    expect(emoji.quick_label).toContain('Musical Symbols');
    expect(emoji.quick_label).toContain('Plants');
    expect(emoji.quick_label).toContain('Religion');
    expect(emoji.quick_label).toContain('Shapes');
    expect(emoji.quick_label).toContain('Transport/Map');
    expect(emoji.quick_label).toContain('Weather');
    expect(emoji.quick_label).toContain('Unicode');
  });

  test('quick buttons are alphabetically sorted (except Unicode last)', () => {
    const labels = emoji.quick_label;
    const unicodeIndex = labels.indexOf('Unicode');
    expect(unicodeIndex).toBe(labels.length - 1);

    const nonUnicode = labels.slice(0, -1);
    const sorted = [...nonUnicode].sort((a, b) => a.localeCompare(b));
    expect(nonUnicode).toEqual(sorted);
  });

  test('configureDie sets mod as set index for named sets', () => {
    const d = new Die();
    emoji.configureDie(d, 0); // Alchemy
    expect(d.mod).toBe(0);
    expect(d.min).toBe(0);
    expect(d.max).toBe(128 - 1); // Alchemy block size
    expect(d.zerobase).toBe(false);
    expect(d.exclusive).toBe(false);
  });

  test('configureDie sets mod = -2 for Unicode mode', () => {
    const d = new Die();
    emoji.configureDie(d, -2);
    expect(d.mod).toBe(-2);
    expect(d.min).toBe(0x21);
    expect(d.max).toBe(0x1f9ff);
  });

  test('getQuickValue returns mod when it is a valid set index', () => {
    const d = makeDie(0, 114, 1); // Animals set
    expect(emoji.getQuickValue(d)).toBe(1);
  });

  test('getQuickValue returns -2 for Unicode mode', () => {
    const d = makeDie(0x21, 0x1f9ff, -2);
    expect(emoji.getQuickValue(d)).toBe(-2);
  });

  test('getQuickValue falls back to length-based lookup when mod is invalid', () => {
    // Plants set has 27 code points, so max = 26; no other set has this length
    const d = makeDie(0, 26, 999);
    expect(emoji.getQuickValue(d)).toBe(emoji.quick_label.indexOf('Plants'));
  });

  test('displayValue uses mod as authoritative set index', () => {
    // Emoticons set (mod=3), value 0 should be U+1F600 😀
    const result = emoji.displayValue(0, 79, 3);
    expect(result).toBe('😀');
  });

  test('displayValue falls back to length-based lookup when mod omitted', () => {
    // Shapes set has 96 code points (0x25a0..0x25ff), max = 95
    const result = emoji.displayValue(0, 95);
    expect(result).toBe('■');
  });

  test('displayValue returns raw code point for Unicode mode (mod = -2)', () => {
    const result = emoji.displayValue(0x2638, 0x1f9ff, -2);
    expect(result).toBe('☸');
  });

  test('displayValue wraps with modulo for out-of-bounds index', () => {
    // Animals has 127 items; index 127 should wrap to 0
    const result = emoji.displayValue(127, 126, 1);
    expect(result).toBe('🐀');
  });

  test('rolling and displaying through full flow works', () => {
    const d = new Die();
    emoji.configureDie(d, 7); // Plants set
    d.roll();
    const throwVal = d.getThrow()[0];
    const displayed = emoji.displayValue(throwVal, d.max, d.mod);
    // Should be a valid plant emoji, not a number
    expect(displayed.codePointAt(0)).toBeGreaterThan(0x1f300);
  });
});

// ---------------------------------------------------------------------------
// Games mode
// ---------------------------------------------------------------------------

describe('ModeGames', () => {
  const games = MODE[MODE_ID.games];

  test('has expected quick button labels', () => {
    expect(games.quick_label).toContain('Playing Cards');
    expect(games.quick_label).toContain('Mahjong');
    expect(games.quick_label).toContain('Dominoes');
    expect(games.quick_label).toContain('Chess');
    expect(games.quick_label).toContain('Xiangqi');
    expect(games.quick_label).toContain('I Ching');
  });

  test('configureDie sets correct bounds for each set', () => {
    const d = new Die();
    games.configureDie(d, 0); // Playing Cards
    expect(d.min).toBe(0);
    expect(d.max).toBe(51); // 4 suits × 13 ranks - 1

    games.configureDie(d, 3); // Chess
    expect(d.max).toBe(11); // 12 pieces - 1

    games.configureDie(d, 5); // I Ching
    expect(d.max).toBe(63); // 64 hexagrams - 1
  });

  test('getQuickValue returns set index by length when mod is not set', () => {
    // Dominoes has 100 code points, max = 99
    const d = makeDie(0, 99, -1);
    expect(games.getQuickValue(d)).toBe(2); // Dominoes index
  });

  test('displayValue uses mod as authoritative set index', () => {
    // Chess set (mod=3), value 0 should be white king U+2654 ♔
    const result = games.displayValue(0, 11, 3);
    expect(result).toBe('♔');
  });

  test('displayValue falls back to length-based lookup when mod omitted', () => {
    // Mahjong has 34 tiles, max = 33
    const result = games.displayValue(0, 33);
    expect(result).toBe('🀀');
  });

  test('Playing Cards generates valid card symbols', () => {
    const d = new Die();
    games.configureDie(d, 0);
    d.roll();
    const throwVal = d.getThrow()[0];
    const displayed = games.displayValue(throwVal, d.max, d.mod);
    // Should be in playing card range U+1F0A1..U+1F0DF
    const cp = displayed.codePointAt(0) ?? 0;
    expect(cp).toBeGreaterThanOrEqual(0x1f0a1);
    expect(cp).toBeLessThanOrEqual(0x1f0df);
  });
});

// ---------------------------------------------------------------------------
// Cross-mode: ensure no set length collisions exist
// ---------------------------------------------------------------------------

describe('set length uniqueness', () => {
  test('Emoji sets: known length collisions exist but mod is authoritative', () => {
    // Some sets share lengths (Math/Musical Symbols = 256, Alchemy/Transport/Map = 128)
    // This is OK because we use die.mod as the authoritative set selector.
    // This test documents the collisions so future changes are aware.
    const emoji = MODE[MODE_ID.emoji];
    const lengths = new Map<number, string>();
    const collisions: string[] = [];
    for (const qv of emoji.quick) {
      if (qv < 0) continue; // skip Unicode
      const d = new Die();
      emoji.configureDie(d, qv);
      const len = d.max + 1;
      const name = emoji.quick_label[emoji.quick.indexOf(qv)];
      if (lengths.has(len)) {
        collisions.push(`${lengths.get(len)} & ${name} = ${len}`);
      } else {
        lengths.set(len, name);
      }
    }
    // Document known collisions — if this changes, the fallback logic may need review
    expect(collisions.sort()).toEqual([
      'Alchemy & Transport/Map = 128',
      'Math & Musical Symbols = 256',
    ]);
  });

  test('Games sets have unique lengths', () => {
    const games = MODE[MODE_ID.games];
    const lengths = new Set<number>();
    for (const qv of games.quick) {
      const d = new Die();
      games.configureDie(d, qv);
      const len = d.max + 1;
      expect(lengths.has(len)).toBe(false);
      lengths.add(len);
    }
  });

  test('Emoji and Games sets do not share lengths', () => {
    const emoji = MODE[MODE_ID.emoji];
    const games = MODE[MODE_ID.games];
    const emojiLengths = new Set<number>();
    const gamesLengths = new Set<number>();

    for (const qv of emoji.quick) {
      if (qv < 0) continue;
      const d = new Die();
      emoji.configureDie(d, qv);
      emojiLengths.add(d.max + 1);
    }

    for (const qv of games.quick) {
      const d = new Die();
      games.configureDie(d, qv);
      gamesLengths.add(d.max + 1);
    }

    for (const len of emojiLengths) {
      expect(gamesLengths.has(len)).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// Legacy / URL parsing compatibility
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Note mode
// ---------------------------------------------------------------------------

describe('ModeNote', () => {
  const note = MODE[MODE_ID.note];

  test('has 14 quick buttons (1 pentatonic + 12 scale + 1 chromatic)', () => {
    expect(note.quick.length).toBe(14);
    expect(note.quick_label.length).toBe(14);
  });

  test('quick labels include key names', () => {
    expect(note.quick_label).toContain('C Scale');
    expect(note.quick_label).toContain('D♭/C♯ Scale');
    expect(note.quick_label).toContain('G Scale');
    expect(note.quick_label).toContain('C Pentatonic');
    expect(note.quick_label).toContain('Chromatic');
    expect(note.quick_label).not.toContain('C Chromatic');
  });

  test('natural keys come before enharmonic pairs in quick buttons', () => {
    const scaleLabels = note.quick_label.filter((l) => l.endsWith(' Scale'));
    expect(scaleLabels[0]).toBe('C Scale');
    expect(scaleLabels[1]).toBe('D Scale');
    expect(scaleLabels[2]).toBe('E Scale');
    expect(scaleLabels[3]).toBe('F Scale');
    expect(scaleLabels[4]).toBe('G Scale');
    expect(scaleLabels[5]).toBe('A Scale');
    expect(scaleLabels[6]).toBe('B Scale');
    expect(scaleLabels[7]).toBe('D♭/C♯ Scale');
    expect(scaleLabels[8]).toBe('E♭/D♯ Scale');
    expect(scaleLabels[9]).toBe('G♭/F♯ Scale');
    expect(scaleLabels[10]).toBe('A♭/G♯ Scale');
    expect(scaleLabels[11]).toBe('B♭/A♯ Scale');
  });

  test('configureDie encodes scale and key in max and mod', () => {
    const d = new Die();
    // C Heptatonic = 7 * 100 + 0 = 700
    note.configureDie(d, 700);
    expect(d.max).toBe(7);
    expect(d.mod).toBe(0);
    expect(d.min).toBe(1);

    // D♭ Pentatonic = 5 * 100 + 1 = 501
    note.configureDie(d, 501);
    expect(d.max).toBe(5);
    expect(d.mod).toBe(1);
  });

  test('getQuickValue returns encoded value', () => {
    const d = new Die();
    note.configureDie(d, 709); // A Heptatonic
    expect(note.getQuickValue(d)).toBe(709);
  });

  test('displayValue returns correct notes for C Heptatonic', () => {
    // C Heptatonic: C, D, E, F, G, A, B
    expect(note.displayValue(1, 7, 0)).toBe('C');
    expect(note.displayValue(2, 7, 0)).toBe('D');
    expect(note.displayValue(3, 7, 0)).toBe('E');
    expect(note.displayValue(4, 7, 0)).toBe('F');
    expect(note.displayValue(5, 7, 0)).toBe('G');
    expect(note.displayValue(6, 7, 0)).toBe('A');
    expect(note.displayValue(7, 7, 0)).toBe('B');
  });

  test('displayValue returns correct notes for D Scale', () => {
    // D Scale: D, E, F♯//G♭, G, A, B, C♯//D♭
    expect(note.displayValue(1, 7, 2)).toBe('D');
    expect(note.displayValue(2, 7, 2)).toBe('E');
    const note3 = note.displayValue(3, 7, 2);
    expect(['F♯', 'G♭']).toContain(note3);
    const note7 = note.displayValue(7, 7, 2);
    expect(['C♯', 'D♭']).toContain(note7);
  });

  test('displayValue returns correct notes for G♭ Pentatonic', () => {
    // G♭ Pentatonic: F♯//G♭, G♯//A♭, A♯//B♭, C♯//D♭, D♯//E♭
    const note1 = note.displayValue(1, 5, 6);
    expect(['F♯', 'G♭']).toContain(note1);
    const note2 = note.displayValue(2, 5, 6);
    expect(['G♯', 'A♭']).toContain(note2);
    const note5 = note.displayValue(5, 5, 6);
    expect(['D♯', 'E♭']).toContain(note5);
  });

  test('mappingChoice randomly selects from // options', () => {
    const result = note.displayValue(3, 7, 2); // F♯//G♭
    expect(['F♯', 'G♭']).toContain(result);
  });

  test('displayValue wraps with modulo for out-of-bounds index', () => {
    // index 8 in 7-note scale wraps to 1
    expect(note.displayValue(8, 7, 0)).toBe('C');
  });
});

// ---------------------------------------------------------------------------
// Legacy / URL parsing compatibility
// ---------------------------------------------------------------------------

describe('legacy compatibility', () => {
  test('Emoji displayValue works without mod (length fallback)', () => {
    const emoji = MODE[MODE_ID.emoji];
    // Dingbats: 192 code points, max = 191
    const result = emoji.displayValue(0, 191);
    expect(result).toBe('✀');
  });

  test('Games displayValue works without mod (length fallback)', () => {
    const games = MODE[MODE_ID.games];
    // Xiangqi: 14 code points, max = 13
    const result = games.displayValue(0, 13);
    expect(result).toBe('🩠');
  });
});
