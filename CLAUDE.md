# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build

Build output goes to `www/js/plugins/Cheat_Menu.js` and `Cheat_Menu.css`. `build:release` (scripts/build-release.js) assembles a distributable `release/` folder: the plugin files under `release/www/js/plugins/`, a `plugins_patch.go.txt` listing plugin names to inject, and the compiled patcher executable.

`pnpm build` runs `tsc`, `eslint .`, `vitest run`, then `vite build`; a lint error or failing test fails the build. `pnpm lint` / `pnpm test` / `pnpm format` run ESLint / Vitest / Prettier on their own. Unit tests (`src/**/*.test.ts`) run in Node without the engine — keep tested logic free of RPG Maker globals and DOM at import time.

### Import alias

`@src/*` → `src/*` (e.g. `import { defineFeature } from '@src/core/feature.ts'`). Defined only in `tsconfig.json` `paths`; tsc, the ESLint import resolver (so boundaries classify aliased imports too) and Vite / Vitest (`resolve.tsconfigPaths`) all read it from there.

### TypeScript versions

The project compiles with TypeScript 7 (native). typescript-eslint still needs the classic `require('typescript')` JS API, which TS 7 no longer ships, so `.pnpmfile.cjs` swaps the `typescript` peer of `typescript-eslint` / `@typescript-eslint/*` / `ts-api-utils` for a pinned TS 6 dependency. Drop that hook once typescript-eslint supports TS 7.

### Architecture boundaries (ESLint)

`eslint-plugin-boundaries` (`eslint.config.js`) enforces the dependency direction:

- `core` (`src/core/`) → `core` only
- `shared` (`src/shared/`) → `core`, `shared`
- `feature` (`src/features/<name>/`) → `core`, `shared` and its own folder — never another feature
- `app` (`src/main.ts`, `src/features.ts`, `src/legacyBridge.ts`, `src/legacyFeature.ts`) → anything, but features only through `features/<name>/index.ts`
- `legacy` (`src/CheatMenu.ts`) — the pre-refactor singleton, reachable from everywhere until it is removed

Boundary rules are at `warn` while the code is migrated to the folder-per-feature layout (flat `src/features/*.ts` files show up as `no-unknown-files`); switch `BOUNDARIES_SEVERITY` to `error` once the migration is done.

## Architecture

This repo contains the plugin and a patcher CLI:

- **`src/`** — the plugin, TypeScript + Vite (root `package.json` / `pnpm`)
- **`patcher/`** — Go CLI dropped into a game folder alongside the plugin; injects plugin entries into the game's `plugins.js` — see `patcher/CLAUDE.md`

### Entry and feature list

- `src/main.ts` — entry: imports `legacyBridge.ts` first, then calls `bootstrap(features, { v1MenuOrder })` and exposes `window.Cheat_Menu`.
- `src/features.ts` — **the single list of features**; array order = main grid order. Removing a feature = deleting its file/folder + its entry here. Also holds `V1_MENU_ORDER` (frozen menu order of the pre-v2 save format — never edit).
- `src/core/bootstrap.ts` — registers features, installs UI / pop-out / keyboard / DataManager hooks, emits `onInit`. Core modules have **no import side effects**; everything is installed from here.

### Feature contract (`src/core/feature.ts`)

`defineFeature({ id, state?, menus: [{ id, name, render(ui, state) }], onInit?, onNewGame?, onLoad?, onStateRestored?, onSave?, migrateV1? })`. Core never references a concrete feature — engine/lifecycle work goes into the hooks:

- `state` is the live persisted object — its values at registration are the defaults, later it is restored *in place*, so module code may hold a reference to it (mutate, never replace). Hooks and `render` get the same object. Saved as `$gameSystem.CheatMenu[featureId]`.
- `onNewGame` / `onLoad` — before the engine sets up a new game / loads a save (game objects are about to be replaced).
- `onStateRestored` — after `state` is restored from the save; runs lazily on the first menu open after a load / new game (re-install patches on fresh game objects here).
- `onSave` — right before `state` is written into the save.
- `migrateV1` — maps the old flat save format (`itemSelection`, …) to this feature's state.
- Feature `id` and menu `id`s are persisted — don't rename them.

`render(ui)` receives a `MenuBuilder` (`core/ui/builder.ts`): `ui.cheat()`, `ui.scrollSelector()`, `ui.valueInput()` take the next free action key (4, 5, 6, … `0`, `-`, `=`) — no hard-coded key numbers. `ui.cheatTitle()` draws the sub-menu switcher (keys 2/3).

### Legacy features (transitional)

The flat `src/features/*.ts` files predate the contract: they export `menu` / `menus` (`{ name, render }`), keep their state on the `CheatMenu` singleton (`src/CheatMenu.ts`) and call `CheatMenu.appendX(...)` with explicit keys. `legacyBridge.ts` puts the core widgets onto the singleton; `legacyFeature()` (`legacyFeature.ts`, used in `features.ts`) wraps such a file into a `Feature` and mirrors its singleton fields into / out of the persisted slice (`fields: { sliceKey: ['CheatMenuField', default] }`). New code should not add to the singleton.

### Persistence (`src/core/persistence.ts`, `session.ts`)

Save format v2: `{ version: 2, core: { position, currentMenuId }, <featureId>: {...} }`. Older saves (flat, no `version`) are migrated on load via each feature's `migrateV1` + `V1_MENU_ORDER`. Restoring takes only keys present in the defaults; slices of unregistered features are carried over on save. Saving before the menu was opened since the last load keeps the loaded data untouched. `persistence.ts` is pure and unit-tested.

### Core modules (`src/core/`)

- `registry.ts` — registered features, menu list, live state, `emit(hook)` (a throwing hook is logged, others still run)
- `store.ts` — menu runtime state: `isOpen`, `isPoppedOut`, `position`, `currentMenuId`, `restored`, `isOverlayOpenable`
- `engine/patch.ts` — `patchMethod(obj, name, original => wrapper)` returns `restore()`; use it for every engine patch. `engine/saveHooks.ts` (DataManager), `engine/gameActive.ts` (`SceneManager.isGameActive` while popped out)
- `input/` — `keymap.ts` (`KEYS`), `keyListeners.ts` (`bindKey` — bindings are cleared on every render), `keyboard.ts` (1 toggles, tilde cycles position, F7 pop-out, F8 dev tools, F9 debug menu, other mapped keys → bound actions)
- `ui/overlay.ts` — `renderMenu()` (grid or sub-menu + back button + top bar), open/close, 1 s re-render timer (only for an open sub-menu; skipped while text is selected or a textarea is focused)
- `ui/render.ts` — `updateMenu()` (request a full re-render) and `isUpdatingMenu()` (blur handlers use it to tell a re-render from the user clicking away)
- `ui/popout.ts` — F7 moves the overlay into an always-on-top NW.js window (shared JS context) and back; use `getMenuDocument()` / `getMenuWindow()` instead of the global `document` / `window` for anything touching the overlay's focus/selection/rAF
- `ui/widgets/` — `appendTitle`, `appendDescription`, `appendWideDescription`, `appendCheat`, `appendScrollSelector`, `appendValueInput`, `appendCodeInput`, `appendSearchInput`, `appendCheatTitle`; `ui/widgetState.ts` holds their cross-render state (search keywords, value-input drafts, focus owners — not persisted)
- `ui/dom.ts` (overlay element, stylesheet, `[1]` indicator), `ui/position.ts`, `ui/grid.ts`, `ui/topBar.ts`, `ui/icons.ts`, `ui/Cheat_Menu.css`

### Shared (`src/shared/`)

Building blocks for several features; may import `core/`, never `features/` or the singleton.

- `state.ts` — `sharedState` (`selectedActor`, `amountIndex`; persisted via the menu-less `sharedFeature`, registered first in `features.ts`), `AMOUNTS`, `amountInput` (typed amount, runtime only), `currentAmount()`, `getSelectedActor()`
- `controls/actorSelector.ts` — `appendActorSelection(k1, k2)` / `actorSelector(ui)`
- `controls/amountSelector.ts` — `appendAmountSelection(k1, k2)` / `amountSelector(ui)`, `makeApplyAmount(action)` (left = subtract / right = add the current amount), `snapToPreset`
- `controls/listSelector.ts` — `makeScroll` (search-aware ←/→ over an RPG Maker data array), `findNextIndex`, `getIndexInfo`, `nameMatches`
- `controls/inventorySection.ts` — `appendInventorySection(config, k1..k4)` / `inventorySection(ui, config)`: search + title + item + editable count (Items/Weapons/Armors)
- `game/numbers.ts` — `parseIntegerInput`, `makeSetExact` (integer `onCommit` for value inputs)
- `game/teleport.ts` — `teleport(mapId, x, y)`

The `append*(…keys)` forms are for legacy feature files; new features use the `MenuBuilder` forms (`actorSelector(ui)` etc.), which take their keys from the builder.

### Re-render behaviour

`updateMenu()` tears down and rebuilds the entire overlay on every call. Avoid storing DOM references across renders.

### Widget notes

- Search inputs (`appendSearchInput`) stop key propagation so typing doesn't trigger game/menu keys and restore focus across re-renders; lists read the keyword with `getSearchKeyword(stateKey)`. `onSearchChange` jumps to the first match.
- Value inputs (`appendValueInput`): Enter commits (`onCommit` returning `false` rejects and keeps the draft), Esc or blur discards; scope the `inputKey` to the edited entity (e.g. `variable:12`).
- Code input (`appendCodeInput`, Evaluate): Ctrl+Enter submits, Tab indents; while it is focused the 1 s re-render is skipped.

### Adding a new feature

1. Create `src/features/<name>/index.ts` with `export default defineFeature({...})`; private logic goes in other files of the same folder (import only `core/`, `shared/` and the own folder — ESLint boundaries enforce it).
2. Add it to the `features` array in `src/features.ts` (array position = grid position).
3. Keep persisted state in a module-level object passed as `state` (and `migrateV1` if it replaces old singleton fields), engine patches in `onInit` / per-object patches via `patchMethod`, re-installation after a load in `onStateRestored`, and draw with the `MenuBuilder` + `shared/controls` (`actorSelector(ui)`, `amountSelector(ui)`, `inventorySection(ui, …)`, `onOffLabel`).

Reference implementations (migrated pilots): `features/noClip/` (stateless toggle), `features/godMode/` (persisted state, per-actor `patchMethod` overrides, `onStateRestored`, unit tests with a fake actor), `features/items/` (list + search + amount + editable count).
