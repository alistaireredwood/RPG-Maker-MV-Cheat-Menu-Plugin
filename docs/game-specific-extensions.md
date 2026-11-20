# Game-specific extensions

This document explains why the extension mechanism exists and why it is shaped the way it is. The rules themselves are summarized in [`ARCHITECTURE.md`](ARCHITECTURE.md#game-specific-extensions). This document is about the reasons behind them. Read it before changing the extension contract or the public `api`.

## Why extensions

Many useful cheats only make sense for one game: a custom currency kept in a variable, story flags worth flipping, a game's own stat system. Built into Cheat Menu, they would bloat it with code that is dead in every other game. Kept in a fork, they would drift away from the main plugin.

An extension is a separate plugin script (`Cheat_Menu.<name>.js`) that adds features to Cheat Menu at runtime. It is written against a published, versioned contract, so:

- Cheat Menu stays game-agnostic,
- an extension doesn't need a Cheat Menu rebuild, and keeps working across Cheat Menu updates as long as the contract's major version matches,
- installing and removing one is the same as for any plugin (a file + its `plugins.js` entry; the patcher picks up `Cheat_Menu.*.js` by itself).

An extension feature is a normal feature: the same `defineFeature` contract, lifecycle hooks, `MenuBuilder`, persistence and grid placement as a built-in. There is no second, weaker kind of feature to maintain.

## The contract

```ts
const extension: CheatMenuExtension = {
  name: 'example',          // shown in warnings and errors
  apiVersion: 1,            // API_VERSION the extension was written against
  setup: (api) => [/* features */],
  names: { /* dictionary sections, optional */ },
};

(window.CheatMenuExtensions = window.CheatMenuExtensions || []).push(extension);
```

`setup`, `names` or both must be present. `examples/extension-template/` is the reference implementation and must stay buildable against `release/types`.

## Decisions

### A global queue, not a dependency on load order

RPG Maker loads plugins in `plugins.js` order, and users (or the patcher) add entries in no particular order. An extension therefore can't assume Cheat Menu has already run.

`window.CheatMenuExtensions` works either way:

- **Extension first:** it finds no queue, creates a plain array and pushes into it. Cheat Menu drains the array at boot.
- **Cheat Menu first:** the array has already been replaced by a queue object whose `push` registers right away.

The one-liner `(window.CheatMenuExtensions = window.CheatMenuExtensions || []).push(...)` covers both cases, so extension authors never deal with ordering. A value that isn't an array at boot is ignored with a warning instead of breaking Cheat Menu.

### Registration closes at the first `Scene_Boot.start`

Pushes after that point are ignored with a warning.

- By `Scene_Boot.start`, every plugin script has run, so a correctly installed extension has already pushed.
- The hook runs *before* the original `start`, because `start` itself calls `DataManager.setupNewGame`. At that point nothing has been restored from a save and the menu can't be open.
- A feature registered later would start from its defaults after a restore, and the next save would overwrite its saved slice with them. Losing the player's data silently is worse than refusing a late extension loudly.

### Everything comes through `api`

`setup(api)` receives the only surface an extension can use. Extensions never import Cheat Menu values and never reach into its globals.

- **Separate bundles.** An extension is built on its own, so it can't share Cheat Menu's modules. At compile time it imports *types* only (`import type … from 'cheat-menu'`); at runtime the values arrive through `api`.
- **Narrow on purpose.** `api` exposes the building blocks a game-specific cheat needs (`defineFeature`, `defineInventoryFeature`, `patchMethod`, `updateMenu`, shared controls, game helpers, the shared actor / amount state). Internals (registry, persistence, input, layout) stay private, so they can change without breaking extensions.
- **Frozen.** `api` and its nested objects are frozen, so one extension can't swap a function under another.
- **Pinned.** `createApi.test.ts` pins the keys of `api`, so growing it is always a deliberate change, never a side effect of a refactor.
- `defineFeature` is an identity function. It exists so hooks and `render` get `state` type inference.

### One integer version, exact match

`API_VERSION` is a single major version. An extension whose `apiVersion` differs is skipped with a warning.

- **Additions keep the version.** A new function in `api` doesn't break old extensions, and a new extension that uses it on an older Cheat Menu fails at the call site, which is visible in the console.
- **Bump only on a breaking change** of `CheatMenuApi`: a removed or renamed member, or a changed signature or behavior that existing extensions rely on.
- An exact match is chosen over a range because a breaking change is the only reason to bump. An extension written for another major version is, by definition, not known to work.

### Ids start with `ext.`

Every feature id and menu id of an extension must start with `ext.` (by convention `ext.<extensionName>.<feature>`).

- Ids are persisted (the save slice key and the open menu), so a collision with a built-in would mix two features' data in one slice.
- The prefix keeps extensions clear of built-in ids present *and future*: a built-in feature added later can't take over an extension's saved data.
- Collisions between two extensions are caught by the registry's duplicate-id check.

### No `migrateV1`

v1 saves predate extensions, so an extension has nothing to migrate. `migrateV1` is rejected rather than ignored, so a mistake doesn't pass silently.

### All or nothing, isolated

An extension is validated and registered as a whole. Any error (wrong descriptor shape, version mismatch, `setup` throwing or not returning an array, a bad id, a duplicate id) rejects the entire extension and is logged with its `name`. Registration is atomic, so a rejected extension leaves no feature or menu behind.

- Half of an extension could leave features that depend on each other's state in an inconsistent state.
- A broken extension must never break Cheat Menu or other extensions. The `name` exists in the descriptor precisely so these messages can say which one failed, since feature ids are unknown until `setup` ran.

A registered extension's features get `onInit` immediately, because the boot-time `onInit` of the built-ins has already happened by then.

### The extension decides where its menus go

The registry order is the default grid order, and extensions are appended to it.

- `after: '<menu id>'` places the menus right after a given menu (a variable cheat next to the built-in Variables menu). The menus inherit that menu's group, including a group the user moved it to.
- An explicit `tier` wins over `after`.
- Without `after`, or with an anchor that doesn't exist (a newer or older Cheat Menu), the menus go to the end of Basic with a warning, instead of failing.

The user can still rearrange everything in the grid's edit mode. The extension only sets the default.

### Persistence is the same as for built-ins

An extension's `state` is saved in the save file under its feature id, like any built-in. Because writing keeps slices of features that aren't registered, removing an extension keeps its data in the saves, and adding it back restores it.

### `names` is a descriptor field, not an `api` call

An extension can provide labels for variables and switches (ids a game left unnamed, or translations of original names) in the same format as `Cheat_Menu.dictionary.json`. An extension may even consist of `names` only.

- **A field degrades gracefully.** A Cheat Menu that predates `names` ignores the field and still loads the extension's features. A call such as `api.names.add(...)` would throw on that older Cheat Menu and reject the whole extension.
- **Below every source the user controls.** The user's own renames and `Cheat_Menu.dictionary.json` override extension names, which only beat the game's `System.json`, and any future user-controlled source must override them too. The extension author knows the game, but the player has the final word.
- An error in `names` is logged and doesn't unregister the features already loaded.

### Typings are a release artifact

`release/types/` holds what an extension author compiles against:

- `Cheat_Menu.d.ts`, bundled from `src/api.ts` (`scripts/build-types.js`). `api.ts` imports implementation modules as types only, so the bundle has no runtime code and doesn't depend on Cheat Menu's internal layout.
- `engine/`, a copy of the ambient engine typings the plugin is written against, because the `api` refers to engine classes (`Game_Actor`, …) as globals.

The typings are bundled with plain rolldown + `rolldown-plugin-dts` rather than `vite build`, because Vite's app pipeline strips the entry's exports and minifies the declaration chunk, leaving an empty file. They are kept out of `release/www/`, which is copied into the game.

### How an extension is built

The template shows the expected output:

- an IIFE, because RPG Maker loads plugins as classic `<script>`s and an IIFE keeps every top-level name out of `window`;
- the same target as Cheat Menu (`chrome66`), for the same reason: MV 1.6's NW.js and no polyfills;
- a file name of `Cheat_Menu.<name>.js`, because the file name becomes the plugin name in `plugins.js` and the `Cheat_Menu.` prefix is how the patcher finds it.

## Changing the contract

When adding to `api`:

1. Add the member to `CheatMenuApi` in `src/api.ts` (type-only import of the implementation).
2. Add the value in `src/createApi.ts`, frozen like the rest.
3. Update the pinned keys in `src/createApi.test.ts`.
4. Keep `API_VERSION`. Show the new member in `examples/extension-template/` when it is something most extensions will want.
5. `pnpm build`, then `pnpm exec tsc -p examples/extension-template`.

A breaking change additionally bumps `API_VERSION`. Every published extension stops loading until it is updated, so prefer adding a new member next to the old one over changing the old one.

New optional data an extension can *provide* (like `names`) goes into the descriptor as a field rather than into `api`, so older Cheat Menus ignore it instead of rejecting the extension.
