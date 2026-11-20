# Architecture

This document defines how the plugin is built and how its code is written. It is the source of truth: the code follows from it, not the other way round. When a change needs a rule that isn't here, or breaks one that is, update this document in the same change.

The plugin ships as a single classic `<script>` plugin for RPG Maker MV/MZ (`Cheat_Menu.js` + `Cheat_Menu.css`), bundled from TypeScript in `src/`. `release/` is the only build output and must always be the complete distributable (plugin, patcher, typings).

## Goal

**Every cheat is a self-contained feature folder.** Removing a feature means deleting its folder and its line in `src/features.ts`. Nothing else may break. Every rule below serves this goal or the safety of the player's save.

## Layers

Every file in `src/` belongs to exactly one layer. A file loose in `src/` outside the app layer is an error.

| Layer | Holds | Never holds |
|---|---|---|
| **app**: `main.ts`, `features.ts`, `api.ts`, `createApi.ts` | Assembly: the entry point, the one list of features (array order = default grid order), the public extension API | Feature logic, UI widgets |
| **core** | The menu as a mechanism: feature registry and lifecycle, persistence and preferences, input, UI rendering and widgets, engine patching | Knowledge of any concrete feature or cheat |
| **shared** | Building blocks used by two or more features: `controls/` for UI, `game/` for engine logic | Anything used by a single feature only |
| **features/&lt;name&gt;** | One cheat. `index.ts` (`export default defineFeature({...})`) is its only public file; everything else is private to the folder | Code another feature needs |
| **types** | Ambient typings (RPG Maker, NW.js, globals) | Runtime code |

Dependencies point one way:

```
app ──► features/<name>/index.ts ──► shared ──► core
 └───────────────────────────────►┘
```

| From | May import |
|---|---|
| `core` | `core` |
| `shared` | `core`, `shared` |
| `features/<name>` | `core`, `shared`, its own folder |
| `app` | everything, but a feature only through its `index.ts` |

- A feature **never** imports another feature. Logic needed by two features moves to `shared/`.
- `core` never imports `shared` or `features`. Core reaches features only through the hooks of the `Feature` contract.

`eslint-plugin-boundaries` (`eslint.config.js`) enforces these rules as errors, so `pnpm build` fails on a violation. A new layer or folder kind needs a boundaries rule first.

## Modules and imports

- **No eager imports and no import-time side effects.** Importing a module must not touch the DOM, the engine (`$game*`, prototypes, `DataManager`), timers or `localStorage`. Module scope may only declare constants, types, state objects and pure factories (`makeScroll(...)`, `makeApplyAmount(...)`). Anything that *does* something runs from `bootstrap()`, from a lifecycle hook, or lazily on first use (Evaluate, for example, reads its saved script on the first render, not on import).
  - Why: start order stays explicit (`bootstrap()` is the single place that installs anything), and every module can be imported in unit tests without an engine or a DOM.
- **No `import.meta.glob` or auto-discovery.** Features are imported explicitly in `src/features.ts`.
  - Why: a typo fails the build instead of silently dropping a menu, and menu order is defined in one place.
- **Import paths:** anything outside the file's own directory goes through the `@src/...` alias (`tsconfig.json` `paths`), never `../`. Imports from the file's own directory or its subdirectories stay relative (`./godMode.ts`).
  - Why: a feature folder can be moved or renamed without editing its files.
- **Explicit `.ts` extensions** in import paths.

## Lifecycle

`bootstrap(features, options)` is called once by `main.ts` and is the only place that installs anything (UI, input, engine hooks). Features act only through lifecycle hooks, which come with these guarantees:

| Hook | Runs | Use it for |
|---|---|---|
| `onInit` | once at boot, after all built-in features are registered; for an extension, as soon as it is registered | prototype patches via `patchMethod` |
| `onNewGame` / `onLoad` | *before* the engine replaces its game objects | resetting runtime data tied to the old game objects |
| `onStateRestored` | after state was restored from the save (or reset to defaults) | re-applying state to game objects: per-object patches, validating nested state |
| `onSave` | right before state is written into the save | flushing runtime data into `state` |

- **Restoring is lazy**: state is restored on the first menu open after a new game or a load, not when the load happens. Why: game objects (`$gameActors`, `$gamePlayer`, …) only exist once a game is running. So never assume restored state in `onInit`, `onNewGame` or `onLoad`.
- **A save never touches data the menu didn't restore.** If the menu wasn't opened since the last load, nothing is written, so the loaded data stays as it was.
- **Isolation:** a throwing hook is logged and skipped, and the other features still run. A hook must not rely on another feature's hook having run.

## Feature contract

```ts
export default defineFeature({
  id: 'godMode',                 // persisted slice key — never rename
  state: godModeState,           // live persisted state (initial values = defaults)
  onInit() {},
  onStateRestored() {},
  migrateV1: (v1) => renameV1Keys(v1, { actors: 'godModeActors' }),
  menus: [
    { id: 'godMode', name: 'God Mode', render(ui, state) { /* … */ } },
  ],
});
```

- **`state`** is a plain, JSON-serializable object owned by the feature module. It is the *live* object: saves are restored into it in place, so module code may keep a reference to it. Mutate it, never replace it. Its values at registration are the defaults.
- **Runtime-only data** (timers, caches, "patch installed" flags, multipliers) lives in module variables, never in `state`. Reset it in `onNewGame` / `onLoad` when it is tied to game objects.
- **Ids are persisted.** `feature.id` is the save slice key and `menu.id` is stored as the open menu, so renaming either loses saved data. Pick a stable camelCase id once.
- **A feature may have several menus or none.** Group menus that share state in one feature (Party HP / MP / TP). A feature with no menu may exist only to own shared state.
- **`after`** places a feature's menus right after a given menu id. It is for extensions only; built-ins are ordered by `features.ts`.
- **`menu.tier: 'advanced'`** is for tools that act on the game's internals and can break events or a save when used carelessly (Switches, Variables, Evaluate, Teleport). Everything else is Basic (the default). `features.test.ts` pins the built-in split, so changing a tier is a deliberate change.
- **`migrateV1`** exists only for state that already lived in the pre-v2 save format. New features never add it.

## Persistence

Per-save state lives in `$gameSystem.CheatMenu`, saved by the engine with the game, as one slice per feature id plus a core slice.

- **Pure format, thin glue.** Reading, writing and migrating the format is pure code with unit tests (`core/persistence.ts`). Only a thin layer (`core/session.ts`) touches `$gameSystem`.
- **Reading is defensive.** Only keys present in a feature's defaults are taken (`readSlice`), so a save from another plugin version can't inject fields. Values are copied as they are, so a feature whose state holds nested objects validates them in `onStateRestored` (Variables' `normalizeFilter`).
- **Writing preserves the unknown.** Slices of features that aren't registered are carried over, so removing a feature and adding it back doesn't lose its data.
- **v1 saves stay loadable.** Each feature maps its own old keys (`migrateV1`), and `V1_MENU_ORDER` in `features.ts` maps the old open-menu index to a menu id. `V1_MENU_ORDER` is frozen. `src/features.test.ts` pins the migration of a full v1 save; extend it whenever a feature that existed in v1 gains state.

### Per-save state vs per-game preferences

Ask: **"should a new game reset this?"** If yes, it goes in the feature's `state`. If no (display names, menu layout), it is a per-game preference declared with `definePreference(key, defaults)` (`core/preferences.ts`).

- Preferences live in `localStorage` under a key that includes the game title. Why: many MV games keep the default `package.json` name, and NW.js shares `localStorage` between apps with the same name.
- `definePreference` only declares; storage is read on first use, so it may be called at module scope.
- Reading takes only known keys whose value has the same kind as the default (`readPrefSlice`). Why: `localStorage` is easy to edit by hand.
- Slices of preferences not defined right now are kept on write, and data from a newer format version is never overwritten.
- The preference key is persisted like a feature id: never rename it.

## UI

### Render model

- **The overlay is rebuilt from scratch on every render.** No DOM reference may outlive a render. State that must survive one (focus, caret, typed drafts, search terms) lives in `core/ui/widgetState.ts`, keyed by something stable, never by DOM identity or index.
  - Why: an open menu re-renders every second so values changed by the game show up, and any click may rebuild it. The tick is skipped while text is selected or a textarea is focused, so the user's interaction isn't destroyed.
- **Key bindings are re-bound on every render** by the widgets that draw them.
- **A render may fail without breaking the menu.** A throwing `render` shows an error inside the menu.
- **Never use the global `document` / `window` for overlay work** (focus, selection, `requestAnimationFrame`). Use `getMenuDocument()` / `getMenuWindow()` from `core/ui/popout.ts`. Why: the overlay can be moved into an always-on-top NW.js pop-out window (F7) that shares the game's JS context but has its own document.

### Drawing menus and keys

- `render(ui)` draws **only** through the `MenuBuilder` (`core/ui/builder.ts`, each method documented there) and `shared/controls`. The low-level `core/ui/widgets/append*` functions are the builder's building blocks; features never call them.
- **Every menu starts with `ui.cheatTitle()`** (the sub-menu switcher).
- **Keys are never hard-coded.** Action keys (`4 5 6 7 8 9 0 - =`) are handed out in row order, so reordering rows changes their keys. To keep keys stable:
  - when a row is conditionally hidden, `ui.skipKeys(n)` reserves its keys;
  - a row drawn *below* optional rows reserves its key first (`const key = ui.nextKey()` at the top of `render`, then `ui.cheat(…, { key })`).
- **Mouse-only controls take no keys** (icon buttons in titles), so adding or removing one never shifts the keys of later rows.
- **Text inputs stop key propagation**, so typing never triggers menu or game keys. Numeric inputs restrict typed characters (`accept: 'integer' | 'decimal'`), but their commit handler still validates.
- **Text from the user or the game goes through `escapeHtml`** (`shared/html.ts`) before it reaches `innerHTML`.
- **Reserved keys**, never used by a feature: 1 (toggle menu), 2 / 3 (switch sub-menu), `` ` `` (move menu), F7 (pop-out), F8 (dev tools), F9 (engine debug menu).

### Main grid layout

- **The registry order never changes** at runtime. Why: extensions' `after` relies on it. The user's layout (order, groups, collapsed state) is computed on top of it by pure, unit-tested functions (`core/ui/layout.ts`) and stored as a per-game preference.
- **Store only deviations from the defaults.** A menu's group is saved only when the user moved it out of its default `tier`, so a later change of a default still reaches it.
- **The layout tolerates change.** A menu missing from the saved layout (new feature or extension) appears after its registry predecessor, in its default group. Unknown ids are ignored.
- **The extension decides where its menus go.** `after` inherits the group of the anchor menu (including one the user moved it to) and follows chains of `after`. An explicit `tier` wins over `after`. An extension menu without a known anchor goes to the end of Basic.
- **Focus survives a rebuild through a stable per-button key**, not the button's index, so a button keeps focus after it was moved.

## Engine patches

- **Every patch of an engine method goes through `patchMethod(target, name, original => wrapper)`** (`core/engine/patch.ts`). Its `restore()` won't undo someone else's later patch.
- **Prototype patches** are installed once in `onInit` and check the feature's state on every call, so turning a cheat off needs no un-patching.
- **Per-object patches** (god mode on one actor) are installed in `onStateRestored` or on demand, and tracked in a `WeakMap`. **Never store flags or data on engine objects.** Why: engine objects are saved by `JsonEx`, so anything on them ends up in save files.
- **Engine APIs that games commonly override are called defensively**: `try/catch`, then show a placeholder (`?`, `NULL`) instead of breaking the whole menu.

## Shared code

- Before writing a helper, check `src/shared/` and the `MenuBuilder`. Reuse wins over a local variant; extend the shared block if it almost fits.
- When a second feature needs something a feature folder has, move it to `shared/` (`controls/` for UI, `game/` for engine logic) instead of importing across features.
- Examples of what belongs there: the shared actor picker (`actorSelector`), the amount picker with its ±amount applier (`makeApplyAmount`), and a factory for a whole family of similar features (`defineInventoryFeature` for Items / Weapons / Armors).

## Game-specific extensions

Separate scripts (`Cheat_Menu.<name>.js`) can add features without rebuilding the plugin. Background and the reasons behind each rule: [`game-specific-extensions.md`](game-specific-extensions.md). A working example lives in `examples/extension-template/`.

- **One entry point.** An extension pushes `{ name, apiVersion, setup?(api) => features[], names? }` (at least one of `setup` / `names`) onto `window.CheatMenuExtensions`. It works whatever the `plugins.js` order: pushes made before the plugin loads are drained at boot, later ones register on `push`.
- **Registration closes at the first `Scene_Boot.start`.** Later pushes are ignored with a warning. Why: by then all plugin scripts have run and nothing has been restored yet; a feature registered after a restore would start from defaults and overwrite its saved slice.
- **Validation is all-or-nothing.** `apiVersion` must match, `setup` must return an array, every feature and menu id must start with `ext.`, and `migrateV1` isn't allowed. Any error rejects the whole extension (logged with its `name`) and leaves no trace in the registry.
- **`api` is the only surface extensions see.** It is frozen, and `createApi.test.ts` pins its keys, so growing it is a deliberate change. `api.ts` imports implementation modules as types only; it is the entry of the published typings (`release/types/`).
- **Bump `API_VERSION` only on a breaking change** of `CheatMenuApi`. Additions keep it.
- **Data an extension provides goes into the descriptor, not into `api`** (as `names` does), so an older Cheat Menu ignores the field instead of rejecting the extension.

## Code style

- **Target is Chromium 65** (MV 1.6's NW.js). Vite transpiles syntax but adds no polyfills, so newer built-ins (`Array.prototype.flatMap` / `flat` / `at`, `Object.fromEntries`, `structuredClone`, …) must not be used outside tests. `tsconfig` `lib` is ES2020, so the type checker doesn't catch all of them.
- **Comments explain why, never what.** Engine quirks, MV / MZ differences, save-compatibility reasons and rejected alternatives deserve a comment. What the code does should be readable from names and small functions.
- **Pure logic goes in its own file** (`format.ts`, `parseVariableInput.ts`) so it can be unit-tested without the engine.
- Prettier formats everything (`pnpm format`). ESLint (`typescript-eslint` recommended + boundaries) stays at 0 warnings and 0 errors and runs as part of the build.

## Testing

- `pnpm test` (Vitest, Node environment) runs `src/**/*.test.ts` and is part of `pnpm build`.
- Unit-test pure logic directly. Test engine-dependent logic with small fakes and `vi.stubGlobal` (as in `features/godMode/godMode.test.ts`: a fake actor plus fake timers), never with a real engine.
- `features.test.ts` guards feature / menu id uniqueness, the Basic / Advanced split and v1 save compatibility.
- UI rendering isn't unit-tested. Verify it in the game (or with a DOM smoke test of the built bundle).

## Adding a feature: checklist

1. Create `src/features/<name>/index.ts` exporting `defineFeature({...})`. Pick a stable camelCase `id` (and menu `id`).
2. Add the import and the array entry in `src/features.ts` at the desired grid position. Set `tier: 'advanced'` if the menu acts on game internals.
3. Persisted values go in a module-level `state` object. Runtime-only values go in module variables. Per-game settings use `definePreference`.
4. Draw with `ui.cheatTitle()` first, then `MenuBuilder` widgets and `shared/controls`. No hard-coded keys.
5. Engine patches: `patchMethod` in `onInit` (prototypes) or `onStateRestored` (game objects). Nothing at import time.
6. Shared needs go to `shared/`, never an import from another feature.
7. Pure logic in its own file + `*.test.ts`. If the feature replaces v1 state, add `migrateV1` and extend `features.test.ts`.
8. `pnpm build` must pass (types, boundaries, tests, bundle).
