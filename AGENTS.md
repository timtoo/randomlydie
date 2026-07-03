# Randomly/Die — Agent Guide

Single-package Quasar v2 PWA: Vue 3 + TypeScript + Vite. Package manager is **pnpm**.

## Everyday commands

Run everything from the repo root:

- `pnpm install` — installs deps and runs `quasar prepare` (postinstall), which generates `.quasar/` and the effective `tsconfig.json`.
- `pnpm quasar dev` — dev server bound to `0.0.0.0:9999` (`quasar.config.js`).
- `pnpm quasar build` — SPA build to `dist/spa`.
- `pnpm quasar build -m pwa` — PWA build to `dist/pwa`.
- `pnpm test` — runs `vitest run` over the suite in `src/lib/die.test.ts`.
- `pnpm exec vitest run <path>` — run a single test file.
- `pnpm lint` — ESLint over `src*/**/*.{ts,js,cjs,mjs,vue}` (root config files are not linted by this command).
- `pnpm format` — Prettier write over `**/*.{js,ts,vue,scss,html,md,json}` respecting `.gitignore`.
- `pnpm deploy` — builds PWA then runs `deploy.sh`, which force-publishes `dist/pwa` to the `gh-pages` branch.
- `pnpm android:build` — builds SPA, syncs to `android/`, and produces `android/app/build/outputs/apk/debug/app-debug.apk`.
- `pnpm android:build:release` — same as above, but builds the release APK.
- `node version-bump.js --patch --update` — bumps `package.json` and `android/app/build.gradle` version/versionCode together.

There is **no standalone `typecheck` script**; TypeScript is checked during Quasar build/dev.

## CI

- `.github/workflows/android-build.yml` builds the Android debug APK on pushes/PRs to `main` and on manual dispatch. It uses pnpm 11 (matching local development), JDK 21, and uploads `android/app/build/outputs/apk/debug/app-debug.apk` as a workflow artifact named `app-debug`.

## Android / Capacitor

- Capacitor config is in `capacitor.config.ts` (`webDir: 'dist/spa'`). The generated native project lives in `android/`.
- `android/capacitor.settings.gradle` references `@capacitor/android` from the root `node_modules` path; do not edit it by hand.
- Current Android target SDKs are in `android/variables.gradle`: `compileSdkVersion = 36`, `targetSdkVersion = 36`, `minSdkVersion = 24`.
- Gradle wrapper is pinned to 8.14.3 (`android/gradle/wrapper/gradle-wrapper.properties`). JDK 21 has been verified to work.
- `pnpm format` fails on generated `android/app/src/main/assets/public/index.html`; ignore those errors or exclude `android/` from formatting.
- Versioning is synced: `package.json`, `android/app/build.gradle`, and Fastlane changelogs should be updated together. `version-bump.js` handles the first two; `versionCode` uses the `50600` scheme (major*10000 + minor*100 + patch).

## F-Droid readiness

- License is `GPL-3.0-or-later`; see `LICENSE`.
- Fastlane metadata lives in `fastlane/metadata/android/en-US/`.
- Proprietary Firebase / Google Mobile Services dependencies have been removed from the Android build.
- For a new release: bump version, tag the commit, then open/refresh the merge request at `gitlab.com/fdroid/fdroiddata`.

## PWA subpackage

`src-pwa/` is its own isolated pnpm package (`package.json` + `pnpm-lock.yaml` + `pnpm-workspace.yaml`). The root `pnpm install` does **not** install its deps; run `pnpm install` inside `src-pwa` if you change service-worker/workbox dependencies there.

## Build / deploy gotchas

- `publicPath` defaults to `/randomly-die`; override with `APP_PUBLIC_PATH=...` (`quasar.config.js`).
- `deploy.sh` deletes the remote `gh-pages` branch before `git subtree push`, then cleans up the temporary `deploy-temp` branch.
- `capacitor.config.ts` points `webDir` at `dist/spa`.

## App architecture

- Entry page: `src/pages/IndexPage.vue` — large file that holds most of the UI logic.
- Routing: hash mode; dynamic route `/:mode?/:die?` in `src/router/routes.ts` is built from each mode's `name_stripped.slice(0, 3)`. When adding a mode, make sure its 3-letter prefix is unique.
- Modes: defined in `src/lib/modes.ts`; there are 8 — Number, Binary, Hexadecimal, Dice, Musical Note, Decision, Emoji, Games. Add any new mode to `all_modes`.
- Dice engine: `src/lib/die.ts`. Supports extended notation such as `3d6`, `3d6+2`, `3d6x5`, `4x(3d6+2)`, lower bound `1d6>3`, and flags `x` (exclusive) / `z` (zero-based). `die.roll()` fills `results` as `[total, die1, die2, ...]` per repeat and `result` as the grand total.
- State: persisted in `localStorage` via `@vueuse/core` `useStorage`; the stored options object is merged with defaults on load so new fields backfill cleanly.
- Theming: Quasar Dark plugin is used; light-mode overrides live in `src/css/app.scss`.

## Style / lint

- Prettier: single quotes, semicolons (`.prettierrc`).
- ESLint flat config (`eslint.config.js`) extends recommended JS/TS/Vue + Prettier.
- Relaxed rules: `no-unused-vars`, `no-explicit-any`, and `explicit-function-return-type` are off; `no-debugger` is an error only in production.
- Components use both `<script setup>` and Options API (`defineComponent`). Prefer `<script setup>` for new components.

## Testing

- `src/lib/die.test.ts` is the only test file.
- The suite includes a probabilistic randomness check that can theoretically flake.

## Security / randomness

- Entirely client-side; no auth or server APIs.
- Randomness comes from `Math.random()` and is **not cryptographically secure**.
