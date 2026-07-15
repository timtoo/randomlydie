# Changelog

## 6.1.1 (2026-07-15)

- Pin pnpm via Corepack and packageManager field for reproducible F-Droid builds.
- Update GitHub Actions workflows to use Corepack.

## 6.1.0 (2026-07-13)

- Dice modifier added to display and history.
- Console restricted to numeric modes.
- Several visual fixes.

## 6.0.0 (2026-07-04)

### New modes & content
- **Games mode** — quick rolls for Playing Cards, Mahjong, Dominoes, Chess, Xiangqi, and I Ching.
- **Emoji mode** — curated sets including Animals, Plants, Food, Sports, Religion, Weather, Math, Alchemy, Musical Symbols, Emoticons, and full Unicode; results shown as actual characters in history and clipboard.
- **Dice mode** — custom SVG faces for d8, d10, d12, d20, d30, and d100.
- **Musical Note mode** — key selection plus Pentatonic, Scale, and Chromatic quick buttons.

### Dice engine & notation
- Full dice notation is saved per mode and restored on restart.
- Roll totals are shown for numeric modes with modifiers or multiple dice, formatted in the mode's number base (binary/hex/decimal).

### UI/UX
- Complete responsive redesign with light/dark/auto themes.
- Generator settings dialog with editable bonus/modifier, mode picker, and live dice notation display.
- Collapsible roll histories, roll-count badges, and copy-to-clipboard for totals and notation.
- Auto-roll/slideshow with an adjustable 1–30 s delay and a prominent stop button.
- Customizable floating action button position (or hide it entirely).
- Optional **Sparkle mode** for colorful roll animations.
- Optional **Roll on start** so the current die rolls as soon as the app opens.

### Platforms & packaging
- Added PWA mode with a refresh-to-update notification.
- Added Android APK builds via Capacitor and prepared the app for F-Droid.

### Accessibility
- Keyboard shortcut (`r`) to roll.
- ARIA labels, landmarks, focus styles, and SVG descriptions throughout the app.
