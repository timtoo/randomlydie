# Randomly/Die — Agent Guide

Randomly/Die is a progressive web app (PWA) for generating random numbers, rolling dice, and producing formatted random values (hex, binary, musical notes, yes/no decisions). It is built with **Quasar Framework v2** on top of **Vue 3**, **TypeScript**, and **Vite**.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Quasar v2 (Vue 3, Composition API) |
| Build Tool | `@quasar/app-vite` (Vite-based Quasar CLI) |
| Language | TypeScript |
| Styling | SCSS (Quasar variables + custom CSS custom properties for theming) |
| Router | Vue Router 5 (hash mode) |
| State / Storage | `@vueuse/core` (`useStorage` for localStorage persistence) |
| UI Library | Quasar components + Material Icons |
| PWA | Workbox (GenerateSW mode), `register-service-worker` |
| Package Manager | pnpm |
| Test Runner | Vitest |
| Linting | ESLint (flat config) + Prettier |

## Project Structure

```
src/
  lib/
    die.ts          # Core dice notation parser and roller (Die class)
    die.test.ts     # Vitest tests for die parsing and rolling
    modes.ts        # Mode definitions (Number, Binary, Hex, Dice, Note, Decision)
  components/
    RollDisplay.vue       # Hero result display with SVG dice visuals
    QuickButtons.vue      # Mode-specific quick-range pill buttons
    PreviousRolls.vue     # Inline previous-roll gradient text
    HistoryList.vue       # Collapsible history chips
    SettingsDialog.vue    # Popup dialog wrapping AdvancedForm
    AdvancedForm.vue      # Min/max/dice count/mode/exclusive/zerobase form
    DieConsole.vue        # Bottom console for text dice-notation input
    TimerBar.vue          # Auto-roll (slideshow) countdown bar
    DebugDie.vue          # Debug overlay toggle
    ModePickerDialog.vue  # Mode selection dialog
    SvgDie*.vue           # SVG die face components (6, 10, 12, 20, 100)
    InputNumber.vue       # Custom numeric input component
    models.ts             # Shared TypeScript types (rollHistoryType)
  pages/
    IndexPage.vue         # Main app page (hero, controls, history, FAB)
    ModePage.vue          # Static mode info/reference page
    TestPage.vue          # Scratch page for testing interactions
    ErrorNotFound.vue     # 404 page
  layouts/
    MainLayout.vue        # Minimal header with settings menu and dark-mode toggle
  router/
    index.ts              # Router factory
    routes.ts             # Route definitions with dynamic mode/die params
  composables/
    useLastRoll.ts        # Global ref for last roll display string
  css/
    app.scss              # Global SCSS, CSS custom properties, layout utilities
    quasar.variables.scss # Quasar Sass variables (colors)
src-pwa/
  manifest.json             # PWA manifest
  custom-service-worker.ts  # Workbox service worker (InjectManifest-ready)
  register-service-worker.ts# Registration + update notification
public/
  icons/                    # PWA icon set
```

## Build and Development Commands

All commands use **pnpm**:

```bash
# Install dependencies
pnpm install

# Start development server (host 0.0.0.0, port 9999)
pnpm quasar dev

# Build for production (SPA)
pnpm quasar build

# Build PWA (outputs to dist/pwa)
pnpm quasar build -m pwa

# Run tests
pnpm test

# Lint
pnpm lint

# Format
pnpm format

# Deploy to GitHub Pages (pushes dist/pwa to gh-pages branch)
pnpm deploy
```

The production app is deployed to GitHub Pages at `https://timtoo.github.io/randomly-die/` (`publicPath: '/randomly-die'`).

## Key Architecture Details

### Dice Engine (`src/lib/die.ts`)

- The `Die` class parses **extended dice notation** via a RegExp.
- Standard notation: `3d6`, `3d6+2`, `3d6x5`, `4x(3d6+2)`.
- Extensions: lower bound with `>`, e.g. `1d6>3`; flags `x` (exclusive) and `z` (zero-based).
- `die.roll()` populates `results` (array of `[total, die1, die2, ...]` per repeat) and `result` (grand total).
- Constructor accepts either a notation string or numeric parameters.

### Modes (`src/lib/modes.ts`)

- `ModeBase` and subclasses define six generator modes:
  - **Number** — plain integers
  - **Binary** — binary display, zero-based
  - **Hexadecimal** — hex display, zero-based, exclusive
  - **Dice** — standard polyhedral dice
  - **Musical Note** — mapped to A–G / sharps / flats
  - **Decision** — mapped to Yes/No/Maybe/etc.
- Each mode specifies quick buttons, formatting base, optional value mappings, and default overrides.

### Routing

- Hash router (`vueRouterMode: 'hash'`).
- Dynamic route: `/:mode?/:die?`.
- Changing the mode or die via UI updates the URL so rolls are shareable.

### Theming

- Uses Quasar Dark plugin + CSS custom properties for light/dark modes.
- Dark is the historical default; light mode was added via `body.body--light` overrides in `app.scss`.
- Colors are defined in `quasar.variables.scss` and overridden via CSS custom properties in `app.scss`.

### State Persistence

- User preferences (dark mode, panel visibility, slideshow delay, FAB position, sparkle mode, etc.) are stored in `localStorage` via `@vueuse/core` `useStorage`.
- The options object is merged with defaults on load so new settings fields are backfilled for returning users.

## Code Style Guidelines

- **Prettier**: single quotes, semicolons.
- **ESLint**: flat config (`eslint.config.js`). Extends `@eslint/js/recommended`, `typescript-eslint/recommended`, `eslint-plugin-vue/flat/essential`, and `prettier`.
- Vue components use both `<script lang="ts">` (Options API style) and `<script setup lang="ts">` (Composition API) depending on the file.
- Prefer `defineComponent` when using Options API style; prefer `script setup` for new components.
- Relaxed rules in place:
  - `@typescript-eslint/explicit-function-return-type: off`
  - `@typescript-eslint/no-unused-vars: off`
  - `@typescript-eslint/no-explicit-any: off`
  - `no-debugger` is an error only in production.

## Testing Instructions

Tests are in `src/lib/die.test.ts` and run with **Vitest**:

```bash
pnpm test
```

The test suite covers:
- Dice notation parsing for many notation variants
- Constructor behavior and expected defaults
- Rolling produces correct result data structures
- Range calculations (single and multi-die)
- A probabilistic randomness smoke test (may theoretically flake)

Custom Vitest matchers defined in the test file:
- `toEqualWithMessage(received, target, message)`
- `toGenerateRandomly(target, generator, tries)`

## Security Considerations

- The app is entirely client-side. No server-side API calls, authentication, or sensitive data handling.
- Randomness comes from `Math.random()` — sufficient for casual gaming and general use, **not** cryptographically secure. Do not use for security or cryptographic purposes.
- Service worker precaches assets; update notifications are shown via Quasar Notify when a new version is available.

## Common Development Notes

- When adding a new mode, extend `ModeBase` in `src/lib/modes.ts`, add it to `all_modes`, and ensure the route regex in `src/router/routes.ts` still matches its stripped name.
- The FAB position is computed with a CSS `max()` expression to stay within a 720px centered container on desktop.
- `IndexPage.vue` is large (~650 lines) and holds most of the application logic. Keep component extractions in mind when adding major features.
- SVG die components (`SvgDie6`, `SvgDie10`, etc.) are used only in Dice mode within `RollDisplay.vue`.
- Console input (`DieConsole.vue`) accepts space-separated tokens and attempts to match a mode name and a dice notation string.
