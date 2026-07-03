# Randomly/Die

I just wanted some random numbers the way I wanted random numbers, so...
_[here we are](https://randomly-die.vaults.ca)_.

This is the only random number app that has Sparkle Mode.

The app installable via browsers that fully support PWA (Chrome, Edge, Safari, etc),
and able to be cached and run offline by others, via this url:

https://randomly-die.vaults.ca

Have fun. Use randomness for good. Below are just some silly details
you need not worry about.

## License

Randomly/Die is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

See [LICENSE](LICENSE) for the full license text.

## About the console

I had the idea of implementing a game console inspired text input mode using
standard old Dungeons & Dragons dice notation. Just as a sort of joke. But it
could be useful? Turns out there's a Wikipedia
article on [dice notation](https://en.wikipedia.org/wiki/Dice_notation), which
maybe I really should do more than glance at... but then I may find I may need a
full blown _resursive descent parser_! Maybe just more fudges than anticipated,
would do? Yeah, yeah, RegEx is fine.

More importantly (?), is there some way to extend the notation to encapsulate
the other settings of this generator, so I can use this notation throughout the
app? Namely, the "zero base" and "exclusive" flags. Maybe just append `z` and/or
`x` at the end? where `d6` would be 1-6, `d6zx` would generate digits 0-5. That
seems simple enough? Also I need to specify a minimum value in addition the the
highest value (i.e the die number).

### Randomly/Die Extended Dice Notation

#### Standard notation:

- standard: `3d6`
- with optional multiplier: `3d6x5`
- with optional plus or minus modifier: `3d6+2` or `3d6x5-2`
- with optional repeat: `4x(3d6+2)`
- 1d6 is default, so these compact notations are equivalent: `d`, `d6`, `1d`

#### Extensions to standard notation:

The main addition is the ability to specify a lower bound (or a minimum value)
on a dice rather than the assumed value of 1. This may be imagined by a rule
stating that if any dice roles are below the given value those dice are
re-rolled until they meet or exceed the minimum value.

To optionally note this role, append immedately after the die number (ie. number
of sides, or maximum value) a greater than sign (closing angle bracket) followed
by the minimum value. For example:

- 3 to 6: `1d6>3`
- 8 to 12: `1d6>3`
- 8 to 12 minus 4 (effectively 4 to 8): `d12>8-4`
- 2 to 6: `d>2`

In addition we add the concept of flags to the end of the notation. A flag is a
single letter. There may be multiple flags, or no flags.

The flags are:

- exclusive mode: `x`
- zero based mode: `z`

_Exclusive mode_ means the upper bound (die number) is one more than the highest
possible number. _Zero based_ means we start counting at zero rather than one.
(These flags are redundant in that the range could be expressed in absolute
numbers, but they add semantic meaning for some uses.)

- 0 to 5: `1d6xz` or `1d6>0x` or `1d5>0`

Other notes:

- If the upper bound is is less than the lower, they will be swapped.
  So `1d20>10` is functionally the same as `1d10>20`
- You can use negative numbers for upper and/or lower bounds:
  `1d-1>-6` for a range between -1 and -6.
- zero flag will not override explictly specified lower bound. `1d6>1z` is still
  just `1d6` despite the zero base flag, but `1d6z` would be the range 0 to 6.

## Accessability

We are trying really hard with the accessibility elements. Hopefully it's not too bad.
