# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev           # Dev server with hot reload
pnpm build         # TypeScript check + Vite bundle → www/js/plugins/
pnpm build:release # pnpm build + copy plugin/css + compile Go patcher → release/
pnpm preview       # Preview production build
```

Build output goes to `www/js/plugins/Cheat_Menu.js` and `Cheat_Menu.css`. `build:release` (scripts/build-release.js) assembles a distributable `release/` folder: the plugin files under `release/www/js/plugins/`, a `plugins_patch.go.txt` listing plugin names to inject, and the compiled patcher executable.

## Architecture

This repo contains two independent plugin implementations plus a patcher CLI:

- **`src/new/`** — active development, TypeScript + Vite (root `package.json` / `pnpm`)
- **`src/plus/`** — separate, more feature-rich implementation, TypeScript + Webpack (its own `package.json` / `npm`, plus its own copy of the patcher)
- **`patcher/`** — Go CLI dropped into a game folder alongside the plugin; injects plugin entries into the game's `plugins.js`
- **`src/old/`** — legacy JS plugin and C++ MVPluginPatcher, kept for reference only

### Patcher (`patcher/`)

Interactive CLI (promptui). Reads plugin names from `plugins_patch.go.txt` (one per line), prompts whether to back up `plugins.js`, then prompts for engine type. Engine detection is by `plugins.js` location: MV = `www/js/plugins.js`, MZ = `js/plugins.js`; **Auto** probes those paths and runs only the matching engine. `InjectPatchPlugin` parses `plugins.js` with the otto JS parser and splices a plugin entry into the `$plugins` array; an already-present plugin is a yellow "skipping" warning, not an error. `plugins.js.bak` is written at most once, before the first successful write. MZ additionally copies the plugin file from `www/js/plugins/` to `js/plugins/` (`PostPatch`) — this also runs when the plugin entry already exists, so re-running the patcher refreshes an updated plugin file. Build with `go build` in `patcher/` (or via `pnpm build:release`).

### `src/plus/` build

```bash
cd src/plus
npm run build:plugin        # full build (webpack + postbuild)
npm run build:plugin:legacy # legacy browser compat build
```

`src/plus/` uses a class-based `Renderer` pattern. `App.ts` is the root — it statically declares all modules and wires keyboard shortcuts. Each module in `src/plus/src/module/` extends `Renderer` and implements `render()` + a static `MyName` string.

### Module loading pattern

`src/new/Cheat_Menu.ts` is the entry point. It uses `import.meta.glob()` to eagerly load all files under `core/` and `features/`, then exposes `window.Cheat_Menu`. Core modules hook into the game engine as an import side effect. Feature modules export a `menu` object (`{ name, render }`) — or `menus` for multi-entry features — and `features/_menuOrder.ts` is the single source of truth for menu order: it imports every feature and pushes them into `CheatMenu.menus[]` in display order. Features do not register themselves.

### State (`src/new/CheatMenu.ts`)

Single singleton object holding all runtime state (current menu, position, amounts, saved coordinates, etc.) plus an `initialValues` snapshot used for save/load persistence.

### Core modules (`src/new/core/`)

- `state.ts` — hooks `DataManager` to persist `CheatMenu` state in `$gameSystem.CheatMenu`; runs a 1 s interval to re-render open sub-menus (skips main grid to avoid hover-pulse)
- `ui.ts` — creates/destroys the DOM overlay, injects CSS, handles positioning (5 positions cycled with tilde key); all `append*` helpers live here
- `listeners.ts` — keyboard event handlers; keys 0–9 dispatch to `CheatMenu.keyListeners`; tilde cycles position; F8/F9 open dev tools / debug menu
- `scrollable.ts` — factory helpers shared by list-based features: `makeScroll` (search-aware ←/→ scroll handler that skips entries not matching `CheatMenu.searchKeywords[stateKey]`), `makeApplyAmount` (left = subtract / right = add the selected amount), `appendInventorySection` (search input + title + item selector + count selector, used by Items/Weapons/Armors)

### Feature modules (`src/new/features/`)

Each feature file is self-contained and follows the same pattern:
1. Define the cheat logic (often monkey-patching RPG Maker globals like `$gameActors`, `$gamePlayer`, `$gameParty`)
2. Define a render function that generates the sub-menu HTML
3. Export `const menu = { name, render }` (or `menus` for multiple entries) — registration happens centrally in `_menuOrder.ts`

Features interact with RPG Maker via its global objects (`$gameActors`, `$gamePlayer`, `$gameParty`, `$gameVariables`, `$gameSwitches`, `$gameMap`) using the engine's own APIs.

### Type definitions (`src/types/`)

- `CheatMenu.d.ts` — `CheatMenuT` interface and `MenuEntry` type
- `globals.d.ts` — ambient declarations extending RPG Maker classes
- `rpgmaker/mv/` — RPG Maker MV engine type stubs (core, data, managers, objects, windows)

### UI helpers (`src/new/core/ui.ts`)

Key `append*` functions available inside any `render()`:

| Helper | Purpose |
|---|---|
| `appendCheatTitle()` | Top row with current menu name + left/right nav |
| `appendTitle(text)` | Section header row |
| `appendScrollSelector(text, key1, key2, handler)` | ← value → row with key bindings |
| `appendCheat(label, status, key, handler)` | Label + status + action button row |
| `appendSearchInput(placeholder, stateKey, onSearchChange?)` | Text filter input; stops key propagation so typing doesn't trigger game/menu keys; persists keyword in `CheatMenu.searchKeywords[stateKey]`; restores focus across re-renders via `CheatMenu._activeSearchKey` |
| `appendAmountSelection(key1, key2)` | Amount selector (uses `CheatMenu.amounts` / `amountIndex`) |
| `appendActorSelection(key1, key2)` | Actor selector |
| `appendBackButton()` | Injected automatically by `updateMenu()` — don't call manually |

### Re-render behaviour

`updateMenu()` tears down and rebuilds the entire sub-menu DOM on every call. Avoid storing DOM references across renders. The 1 s timer only fires when a sub-menu is open (`currentMenuIndex !== null`).

### Search inputs

Features with large lists (Items, Weapons, Armors, Variables, Switches) use `appendSearchInput`. The scroll handler for each checks `CheatMenu.searchKeywords['<key>']` and skips non-matching entries. `onSearchChange` callback jumps to the first match when the keyword changes.

### State fields to know

- `CheatMenu.searchKeywords` — `Record<string, string>`, per-feature search terms (not persisted to save)
- `CheatMenu._activeSearchKey` — which search input currently owns focus; managed by `focus`/`blur` events and the `_updatingMenu` flag in `ui.ts`
- `CheatMenu.initialValues` — keys listed here are persisted to `$gameSystem.CheatMenu` on save/load; do **not** add `searchKeywords` or `_activeSearchKey` here

### Adding a new feature (`src/new/`)

Create a new file in `src/new/features/`. It will be auto-loaded by `import.meta.glob`. Export a `menu` object (`{ name, render }`), then import it in `features/_menuOrder.ts` and add it at the desired position in the `CheatMenu.menus.push(...)` call. Use `CheatMenu.keyListeners` for keyboard shortcuts within the sub-menu.

If the feature scrolls through a large list, build the scroll handler with `makeScroll` from `core/scrollable.ts` (it handles search filtering) and add `appendSearchInput` before the title row — or use `appendInventorySection` if it follows the item/count shape.

### Adding a new module (`src/plus/`)

Create a class in `src/plus/src/module/` that extends `Renderer`, add a static `MyName` string, and manually import + add it to `App.Modules` in `src/plus/src/App.ts`.
