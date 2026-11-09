# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository

- **`src/`** — the plugin, TypeScript + Vite (root `package.json` / `pnpm`)
- **`patcher/`** — Go CLI dropped into a game folder alongside the plugin; injects plugin entries into the game's `plugins.js` — see `patcher/CLAUDE.md`
- **`docs/`** — `ARCHITECTURE.md` (how the plugin is built), `game-specific-extensions.md` (planned public extension API)

## Architecture

**Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) before adding or changing a feature** — it is the source of truth for the layer rules, the `defineFeature` contract, lifecycle hooks, persistence / save compatibility, the render model and `MenuBuilder` keys, engine patching, shared building blocks and the new-feature checklist. Keep it up to date when the architecture changes.

Rules that are easy to break:

- One folder per feature in `src/features/<name>/`, registered in `src/features.ts`; a feature never imports another feature (shared code goes to `src/shared/`).
- No eager imports / no import-time side effects: modules only declare things; anything touching the DOM, the engine, timers or storage runs from `bootstrap()`, a lifecycle hook, or lazily on first use. No `import.meta.glob`.
- Imports leaving the file's directory use `@src/...`, never `../`; same-directory imports stay `./`.
- `feature.id` / `menu.id` are persisted in saves — never rename them.
- Engine patches only via `patchMethod`; never store flags on engine objects (they end up in save files).
- Draw menus only through the `MenuBuilder` (`ui.*` + `shared/controls`), never with hard-coded key numbers.
- Comments explain *why*, never *what*.

## Verification

After code changes run `pnpm typecheck` and `pnpm lint` (no `--fix`; lint is at 0 warnings and 0 errors — keep it there, boundary violations are errors). Run `pnpm test` when touching code covered by `*.test.ts` or adding pure logic. Lint does not check formatting and there is no pre-commit hook — run `pnpm exec prettier --write <files>`. `pnpm build` runs all of the above and bundles into `release/`. Other scripts: `package.json`.
