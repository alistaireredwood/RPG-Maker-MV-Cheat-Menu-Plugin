# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Dev server with hot reload
pnpm build      # TypeScript check + Vite bundle → www/js/plugins/
pnpm preview    # Preview production build
```

Build output goes to `www/js/plugins/Cheat_Menu.js` and `Cheat_Menu.css`.

## Architecture

This repo contains two independent plugin implementations:

- **`src/new/`** — active development, TypeScript + Vite (root `package.json` / `pnpm`)
- **`src/plus/`** — separate, more feature-rich implementation, TypeScript + Webpack (its own `package.json` / `npm`)

### `src/plus/` build

```bash
cd src/plus
npm run build:plugin        # full build (webpack + postbuild)
npm run build:plugin:legacy # legacy browser compat build
```

`src/plus/` uses a class-based `Renderer` pattern. `App.ts` is the root — it statically declares all modules and wires keyboard shortcuts. Each module in `src/plus/src/module/` extends `Renderer` and implements `render()` + a static `MyName` string.

### Module loading pattern

`src/new/Cheat_Menu.ts` is the entry point. It uses `import.meta.glob()` to eagerly load all files under `core/` and `features/`, then exposes `window.Cheat_Menu`. Each module has side effects on import — core modules hook into the game engine and feature modules register themselves into `CheatMenu.menus[]`.

### State (`src/new/CheatMenu.ts`)

Single singleton object holding all runtime state (current menu, position, amounts, saved coordinates, etc.) plus an `initialValues` snapshot used for save/load persistence.

### Core modules (`src/new/core/`)

- `state.ts` — hooks `DataManager.makeSaveContents` / `extractSaveContents` to persist `CheatMenu` state inside `$gameSystem.CheatMenu`
- `ui.ts` — creates/destroys the DOM overlay, injects CSS, handles positioning (5 positions cycled with tilde key)
- `listeners.ts` — keyboard event handlers; keys 0–9 dispatch to `CheatMenu.key_listeners`; tilde cycles position; F8/F9 open dev tools / debug menu

### Feature modules (`src/new/features/`)

Each feature file is self-contained and follows the same pattern:
1. Define the cheat logic (often monkey-patching RPG Maker globals like `$gameActors`, `$gamePlayer`, `$gameParty`)
2. Define a render function that generates the sub-menu HTML
3. Call `CheatMenu.menus.splice(index, 0, { name, render })` or `.push(...)` to register

Features interact with RPG Maker via its global objects (`$gameActors`, `$gamePlayer`, `$gameParty`, `$gameVariables`, `$gameSwitches`, `$gameMap`) using the engine's own APIs.

### Type definitions (`src/types/`)

- `CheatMenu.d.ts` — `CheatMenuT` interface and `MenuEntry` type
- `globals.d.ts` — ambient declarations extending RPG Maker classes
- `rpgmaker/mv/` — RPG Maker MV engine type stubs (core, data, managers, objects, windows)

### Adding a new feature (`src/new/`)

Create a new file in `src/new/features/`. It will be auto-loaded by `import.meta.glob`. Register to `CheatMenu.menus` with a name and render function. Use `CheatMenu.key_listeners` for keyboard shortcuts within the sub-menu.

### Adding a new module (`src/plus/`)

Create a class in `src/plus/src/module/` that extends `Renderer`, add a static `MyName` string, and manually import + add it to `App.Modules` in `src/plus/src/App.ts`.
