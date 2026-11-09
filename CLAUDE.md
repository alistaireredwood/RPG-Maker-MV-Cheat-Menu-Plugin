# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build

Build output goes to `www/js/plugins/Cheat_Menu.js` and `Cheat_Menu.css`. `build:release` (scripts/build-release.js) assembles a distributable `release/` folder: the plugin files under `release/www/js/plugins/`, a `plugins_patch.go.txt` listing plugin names to inject, and the compiled patcher executable.

`pnpm build` runs `tsc`, then `eslint .`, then `vite build`; a lint error fails the build. `pnpm lint` / `pnpm format` run ESLint / Prettier on their own.

### TypeScript versions

The project compiles with TypeScript 7 (native). typescript-eslint still needs the classic `require('typescript')` JS API, which TS 7 no longer ships, so `.pnpmfile.cjs` swaps the `typescript` peer of `typescript-eslint` / `@typescript-eslint/*` / `ts-api-utils` for a pinned TS 6 dependency. Drop that hook once typescript-eslint supports TS 7.

### Architecture boundaries (ESLint)

`eslint-plugin-boundaries` (`eslint.config.js`) enforces the dependency direction:

- `core` (`src/core/`) → `core` only
- `shared` (`src/shared/`) → `core`, `shared`
- `feature` (`src/features/<name>/`) → `core`, `shared` and its own folder — never another feature
- `app` (`src/main.ts`, `src/features.ts`, `src/Cheat_Menu.ts`) → anything, but features only through `features/<name>/index.ts`
- `legacy` (`src/CheatMenu.ts`, `src/components/`) — the pre-refactor singleton, reachable from everywhere until it is removed

Boundary rules are at `warn` while the code is migrated to the folder-per-feature layout (flat `src/features/*.ts` files show up as `no-unknown-files`); switch `BOUNDARIES_SEVERITY` to `error` once the migration is done.

## Architecture

This repo contains the plugin and a patcher CLI:

- **`src/`** — the plugin, TypeScript + Vite (root `package.json` / `pnpm`)
- **`patcher/`** — Go CLI dropped into a game folder alongside the plugin; injects plugin entries into the game's `plugins.js` — see `patcher/CLAUDE.md`

### Module loading pattern

`src/Cheat_Menu.ts` is the entry point. It uses `import.meta.glob()` to eagerly load all files under `core/` and `features/`, then exposes `window.Cheat_Menu`. Core modules hook into the game engine as an import side effect. Feature modules export a `menu` object (`{ name, render }`) — or `menus` for multi-entry features — and `features/_menuOrder.ts` is the single source of truth for menu order: it imports every feature and pushes them into `CheatMenu.menus[]` in display order. Features do not register themselves.

### State (`src/CheatMenu.ts`)

Single singleton object holding all runtime state (current menu, position, amounts, saved coordinates, etc.) plus an `initialValues` snapshot used for save/load persistence.

### Core modules (`src/core/`)

- `state.ts` — hooks `DataManager` to persist `CheatMenu` state in `$gameSystem.CheatMenu`; runs a 1 s interval to re-render open sub-menus (skips main grid to avoid hover-pulse)
- `ui.ts` — creates/destroys the DOM overlay, injects CSS, handles positioning (5 positions cycled with tilde key); all `append*` helpers live here. `appendBackButton()` and `appendTopBar()` (title + pop-out/pop-in SVG icon button, hidden without NW.js) are injected automatically by `updateMenu()` — don't call them manually.
- `listeners.ts` — keyboard event handlers; keys 0–9 dispatch to `CheatMenu.keyListeners`; tilde cycles position; F8/F9 open dev tools / debug menu
- `popout.ts` — F7 moves the overlay into a separate always-on-top NW.js window (`nw.Window.open('about:blank')`, shared JS context) and back; use `CheatMenu.getMenuDocument()` instead of the global `document` for anything touching the overlay's DOM/focus/selection. Popup key presses are routed through `CheatMenu.onKeyDown`; `SceneManager.isGameActive` is forced to `true` while popped out
- `scrollable.ts` — factory helpers shared by list-based features: `makeScroll` (search-aware ←/→ scroll handler that skips entries not matching `CheatMenu.searchKeywords[stateKey]`), `makeApplyAmount` (left = subtract / right = add the selected amount), `appendInventorySection` (search input + title + item selector + count selector, used by Items/Weapons/Armors)

### Components (`src/components/`)

Reusable UI building blocks imported explicitly where needed (not auto-loaded by `import.meta.glob`, no side effects). `icons.ts` exports inline SVG icon strings (`ICON_POP_OUT`, `ICON_POP_IN`) that use `currentColor`.

### Re-render behaviour

`updateMenu()` tears down and rebuilds the entire sub-menu DOM on every call. Avoid storing DOM references across renders. The 1 s timer only fires when a sub-menu is open (`currentMenuIndex !== null`).

### Search inputs

Features with large lists (Items, Weapons, Armors, Variables, Switches) use `appendSearchInput`, which stops key propagation so typing doesn't trigger game/menu keys and restores focus across re-renders via `CheatMenu._activeSearchKey`. The scroll handler for each checks `CheatMenu.searchKeywords['<key>']` and skips non-matching entries. `onSearchChange` callback jumps to the first match when the keyword changes.

### State fields to know

- `CheatMenu.searchKeywords` — `Record<string, string>`, per-feature search terms (not persisted to save)
- `CheatMenu._activeSearchKey` — which search input currently owns focus; managed by `focus`/`blur` events and the `_updatingMenu` flag in `ui.ts`
- `CheatMenu._valueInputDrafts` / `_activeValueInputKey` — typed-but-not-applied text and focus owner for `appendValueInput` (editable value cell, Enter commits — `onCommit` returning `false` rejects and keeps the draft — Esc or blur discards; used by Variables, Items, Weapons, Armors, Gold, Stats; `makeSetExact` in `core/scrollable.ts` builds the integer onCommit); scope the `inputKey` to the edited entity (e.g. `variable:12`)
- `CheatMenu._activeCodeInput` — focus/caret/scroll of the `appendCodeInput` textarea (Evaluate); while a textarea in the overlay is focused, the 1 s re-render timer in `state.ts` is skipped
- `CheatMenu.initialValues` — keys listed here are persisted to `$gameSystem.CheatMenu` on save/load; do **not** add `searchKeywords` or `_activeSearchKey` here

### Adding a new feature (`src/`)

Create a new file in `src/features/`. It will be auto-loaded by `import.meta.glob`. Export a `menu` object (`{ name, render }`), then import it in `features/_menuOrder.ts` and add it at the desired position in the `CheatMenu.menus.push(...)` call. Use `CheatMenu.keyListeners` for keyboard shortcuts within the sub-menu.

If the feature scrolls through a large list, build the scroll handler with `makeScroll` from `core/scrollable.ts` (it handles search filtering) and add `appendSearchInput` before the title row — or use `appendInventorySection` if it follows the item/count shape.
