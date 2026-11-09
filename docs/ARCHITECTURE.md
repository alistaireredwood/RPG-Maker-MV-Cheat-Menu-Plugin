# Architecture

The plugin is a single script (`Cheat_Menu.js` + `Cheat_Menu.css`) loaded by RPG Maker MV/MZ as a classic `<script>` plugin. The source is TypeScript in `src/`, bundled by Vite into `release/www/js/plugins/`; `pnpm build:release` adds the patcher (`patcher/`, Go) and `plugins_patch.go.txt`, so `release/` is the complete distributable and the only build output.

The design has one goal: **every cheat is a self-contained feature folder**. Removing a feature means deleting its folder and its line in `src/features.ts`. Nothing else may break.

## Layout

```
src/
  main.ts              entry: bootstrap(features, { v1MenuOrder })
  features.ts          the only list of features (array order = grid order)

  core/                the menu itself; knows no concrete feature
    bootstrap.ts       registers features, installs UI / input / engine hooks
    feature.ts         defineFeature(), Feature / MenuEntry types, lifecycle hooks
    registry.ts        registered features, menu list, live state, emit(hook)
    persistence.ts     pure save-format logic (v2 format, v1 migration)
    session.ts         restore / save of core + feature state
    store.ts           menu runtime state (open, position, current menu, …)
    engine/            patchMethod, DataManager hooks, SceneManager.isGameActive
    input/             key map, key bindings, keyboard handling (1, `, F7, F8, F9)
    ui/                overlay, renderer, MenuBuilder, widgets, pop-out window, CSS

  shared/              building blocks used by several features
    state.ts           selected actor + amount (persisted as the `shared` slice)
    controls/          actorSelector, amountSelector, listSelector,
                       inventorySection, resourceCheats, status labels
    game/              teleport, numbers, resources (HP/MP/TP changes)
    inventoryFeature.ts  factory for the Items / Weapons / Armors features

  features/<name>/     one folder per cheat
    index.ts           export default defineFeature({...}) — the only public file
    *.ts               private logic of the feature (+ *.test.ts)

  types/               ambient typings: RPG Maker MV, NW.js, globals
```

## Layers and dependency rules

```
app (main.ts, features.ts) ──► features/<name>/index.ts ──► shared ──► core
                                         └──────────────────────────────►┘
```

| From | May import |
|---|---|
| `core` | `core` |
| `shared` | `core`, `shared` |
| `features/<name>` | `core`, `shared`, its own folder |
| `app` | everything, but a feature only through its `index.ts` |

- A feature **never** imports another feature. Logic needed by two features moves to `shared/`.
- `core` never imports `shared` or `features`. Core reaches features only through the hooks of the `Feature` contract.
- Every file belongs to one of these layers. A file loose in `src/` (other than `main.ts` / `features.ts`) is an error.

`eslint-plugin-boundaries` (`eslint.config.js`) enforces all of this as errors, and `pnpm build` fails on a violation.

## Modules and imports

- **No eager imports and no import-time side effects.** Importing a module must not touch the DOM, the engine (`$game*`, prototypes, `DataManager`), timers or `localStorage`. Module scope may only declare constants, types, state objects and pure factories (`makeScroll(...)`, `makeApplyAmount(...)`). Everything that *does* something runs from `bootstrap()` or from a lifecycle hook (`onInit`, …), or lazily on first use (e.g. Evaluate reads its script from `localStorage` on the first render, not on import).
  - Why: it keeps the start order explicit (`bootstrap()` is the single place that installs anything), and it keeps modules importable in unit tests without an engine or a DOM.
- **No `import.meta.glob` / auto-discovery.** Features are imported explicitly in `src/features.ts`. A typo then fails the build instead of silently dropping a menu, and menu order is defined in one place.
- **Import paths:** anything outside the file's own directory is imported through the `@src/...` alias (`import { defineFeature } from '@src/core/feature.ts'`), never `../`. Imports of the own directory or its subdirectories stay relative (`./godMode.ts`), so a feature folder can be moved or renamed without editing its files. The alias is defined once, in `tsconfig.json` `paths`.
- **Explicit `.ts` extensions** in import paths (`allowImportingTsExtensions`, bundler resolution).

## Start-up and lifecycle

`main.ts` calls `bootstrap(features, { v1MenuOrder })` once, when RPG Maker loads the plugin:

1. `registerFeatures(features)`: validates unique feature / menu ids and snapshots each `state` as its defaults.
2. Installs the UI (overlay, stylesheet, `[1]` indicator), the pop-out support, keyboard handling and the `DataManager` hooks.
3. `emit('onInit')`: features install their engine patches.

At runtime:

| Event | What happens |
|---|---|
| `DataManager.setupNewGame` / `loadGame` | menu closes, `onNewGame` / `onLoad` hooks run *before* the engine replaces its game objects; state is marked "not restored" |
| first `[1]` press after that | `restoreSession()`: core + feature state are read from `$gameSystem.CheatMenu` (or reset to defaults), then `onStateRestored` |
| `DataManager.saveGame` | `onSave`, then state is written to `$gameSystem.CheatMenu`; skipped if the menu wasn't opened since the last load, so the loaded data stays untouched |

Restoring is lazy because the game objects (`$gameActors`, `$gamePlayer`, …) only exist once a game is running. Hooks that re-install per-object patches (god mode, speed lock) belong in `onStateRestored`.

A throwing hook is logged and skipped. The other features still run.

## Feature contract

```ts
export default defineFeature({
  id: 'godMode',                 // persisted slice key — never rename
  state: godModeState,           // live persisted state (initial values = defaults)
  onInit() {},                   // once at boot: prototype patches via patchMethod
  onNewGame() {}, onLoad() {},   // a game is about to be (re)created
  onStateRestored() {},          // state restored from the save: re-apply to game objects
  onSave() {},                   // right before the save is written
  migrateV1: (v1) => renameV1Keys(v1, { actors: 'godModeActors' }),
  menus: [
    { id: 'godMode', name: 'God Mode', render(ui, state) { /* … */ } },
  ],
});
```

- **`state`** is a plain, JSON-serializable object owned by the feature module. It is the *live* object: the registry restores saves into it in place, so module code may keep a reference (`state.selection = idx`). Mutate it, never replace it. Values at registration are the defaults.
- **Runtime-only data** (timers, caches, "lock installed" flags, the Game Speed multiplier) lives in module variables, not in `state`, and is reset in `onLoad` / `onNewGame` when it is tied to game objects.
- **Ids** (`feature.id`, `menu.id`) are persisted: the feature id is the save slice key, and the menu id is stored as the open menu. Renaming one loses saved data.
- **A feature may have several menus** (Party HP / MP / TP) or none (`sharedFeature`).
- **`migrateV1`** exists only for state that already lived in the pre-v2 flat save format. New features don't need it.

## Persistence

`$gameSystem.CheatMenu` (saved by the engine with the game):

```
{ version: 2, core: { position, currentMenuId }, <featureId>: { …state }, … }
```

- `persistence.ts` is pure and unit-tested. `session.ts` connects it to `$gameSystem`.
- **Reading** takes only the keys present in the feature's defaults (`readSlice`), so a save from another plugin version can't inject fields.
- **Writing** carries over slices of features that are not registered, so removing a feature and adding it back doesn't lose its data.
- **v1 saves** (flat object, no `version`) are migrated on first restore: each feature maps its own old keys (`migrateV1`), and `V1_MENU_ORDER` in `features.ts` maps the old open-menu index to an id. `V1_MENU_ORDER` is frozen.
- `src/features.test.ts` pins the migration of a full v1 save. Extend it when a feature that existed in v1 gains state.

## UI

### Render model

The overlay (`<table id="cheat-menu-text">`) is **torn down and rebuilt on every `updateMenu()`**:

- No DOM references survive a render. State that must survive (focus, caret, typed drafts, search terms) lives in `core/ui/widgetState.ts`.
- Key bindings are cleared and re-bound by the widgets on every render.
- An open sub-menu re-renders every second so values changed by the game show up. The tick is skipped while text is selected or a textarea is focused.
- A `render` that throws shows "Render failed" inside the menu instead of breaking it.

### MenuBuilder and keys

`render(ui)` draws only through the `MenuBuilder` (`core/ui/builder.ts`):

- `ui.cheatTitle()` draws the sub-menu switcher on keys 2 / 3. Every menu starts with it.
- `ui.title`, `ui.description`, `ui.wideDescription`: plain rows.
- `ui.cheat(label, status, onActivate)` takes 1 key. `ui.scrollSelector(text, onScroll)` and `ui.valueInput(...)` take 2 keys (←/→) when they show arrows.
- `ui.codeInput`, `ui.searchInput`: text inputs. They stop key propagation, so typing never triggers menu or game keys.

Action keys are allocated in order: `4 5 6 7 8 9 0 - =`. A feature never hard-codes key numbers. Changing the order of rows changes their keys, and `ui.skipKeys(n)` keeps later keys stable when a row is conditionally hidden. Fixed keys are 1 (toggle menu), 2 / 3 (switch sub-menu), `` ` `` (move menu), F7 (pop-out), F8 (dev tools), F9 (engine debug menu).

The `core/ui/widgets/append*(…, key1, key2)` functions with explicit keys are the builder's building blocks. Features don't call them.

### Pop-out window

F7 moves the overlay into an always-on-top NW.js window that shares the game's JS context. Code touching the overlay's document (focus, selection, `requestAnimationFrame`) must use `getMenuDocument()` / `getMenuWindow()` from `core/ui/popout.ts`, never the global `document` / `window`.

## Engine patches

- Every patch of an engine method goes through `patchMethod(target, name, original => wrapper)` (`core/engine/patch.ts`). It returns `restore()`, which won't undo someone else's later patch.
- Prototype patches (`Game_Player.prototype.moveByInput`, `SceneManager.updateScene`) are installed in `onInit` and check the feature's state on every call, so turning a cheat off needs no un-patching.
- Per-object patches (god mode on one actor) are installed in `onStateRestored` / on demand, tracked in a `WeakMap`, and never stored on the object. Engine objects are saved by `JsonEx`, so flags on them would end up in save files.
- Code calling engine APIs that games commonly override wraps the call (`try/catch` → show `?` / `NULL`) instead of breaking the whole menu.

## Shared building blocks

Prefer these over re-implementing:

| Need | Use |
|---|---|
| actor picker (shared selection) | `actorSelector(ui)` → selected `Game_Actor` |
| amount picker + apply ±amount | `amountSelector(ui)` + `makeApplyAmount(fn)` |
| typed exact value for a counter | `ui.valueInput(…, makeSetExact(get, applyDelta), …)` |
| scroll / search an RPG Maker data array | `makeScroll`, `getIndexInfo`, `nameMatches` + `ui.searchInput` |
| item / weapon / armor style feature | `defineInventoryFeature({...})` |
| HP / MP / TP to 0 / 1 / half / full | `resourceCheats(ui, who, resource, apply)` + `changeResource` |
| on/off status + toggle sound | `onOffLabel(on)`, `playToggleSound(on)` |
| move the player | `teleport(mapId, x, y)` |

When a second feature needs something a feature folder has, move it to `shared/` (`controls/` for UI, `game/` for engine logic) instead of importing across features.

## Code style

- **Comments explain why, never what.** Engine quirks, MV / MZ differences, save-compatibility reasons and rejected alternatives deserve a comment. What the code does should be readable from names and small functions.
- Pure logic goes in its own file (`format.ts`, `parseVariableInput.ts`, `resources.ts`) so it can be unit-tested without the engine.
- Prettier formats everything (`pnpm format`), and ESLint (`typescript-eslint` recommended + boundaries) runs as part of the build.

## Testing

- `pnpm test` (Vitest, Node environment) runs `src/**/*.test.ts` and is part of `pnpm build`.
- Unit-test pure logic directly. Engine-dependent logic is tested with small fakes and `vi.stubGlobal` (see `features/godMode/godMode.test.ts`: fake actor + fake timers).
- `features.test.ts` guards feature / menu id uniqueness and v1 save compatibility.
- UI rendering isn't unit-tested. Verify it in the game (or a DOM smoke test of the built bundle).

## Adding a feature: checklist

1. Create `src/features/<name>/index.ts` exporting `defineFeature({...})`. Pick a stable camelCase `id` (and menu `id`).
2. Add the import and the array entry in `src/features.ts` at the desired grid position.
3. Persisted values go in a module-level `state` object. Runtime-only values go in module variables.
4. Draw with `ui.cheatTitle()` first, then `MenuBuilder` widgets and `shared/controls`. No hard-coded keys.
5. Engine patches: `patchMethod` in `onInit` (prototypes) or `onStateRestored` (game objects). Nothing at import time.
6. Shared needs → `shared/`, never an import from another feature.
7. Pure logic in its own file + `*.test.ts`. If the feature replaces v1 state, add `migrateV1` and extend `features.test.ts`.
8. `pnpm build` must pass (types, boundaries, tests, bundle).
