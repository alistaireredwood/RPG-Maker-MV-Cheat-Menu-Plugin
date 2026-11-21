# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository

- **`src/`** — the plugin, TypeScript + Vite (root `package.json` / `pnpm`)
- **`patcher/`** — Go CLI dropped into a game folder alongside the plugin; injects plugin entries into the game's `plugins.js` — see `patcher/CLAUDE.md`
- **`extensions/<name>/`** — local, git-ignored game-specific extensions (script and/or dictionary); `pnpm build:game <name>` builds `release/` for that one game — see `extensions/README.md`
- **`examples/extension-template/`** — minimal game-specific extension built against `release/types` (`pnpm exec tsc -p examples/extension-template` after `pnpm build`)
- **`docs/`** — `ARCHITECTURE.md` (rules for the architecture and the code), `game-specific-extensions.md` (public extension API: background and the reasons behind its rules)

## Architecture

**Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) before adding or changing a feature** — it defines the rules the code follows: layers and import boundaries, the `defineFeature` contract, lifecycle hooks, persistence / save compatibility, the render model and `MenuBuilder` keys, engine patching, shared code and the new-feature checklist. It describes rules, not the current state of the code: when a change needs a new rule or breaks one, update it in the same change.

**Read [`docs/game-specific-extensions.md`](docs/game-specific-extensions.md) before changing the extension contract or the public `api`** (`src/api.ts`, `src/createApi.ts`, `src/core/extensions.ts`).

Rules that are easy to break:

- One folder per feature in `src/features/<name>/`, registered in `src/features.ts`; a feature never imports another feature (shared code goes to `src/shared/`).
- No eager imports / no import-time side effects: modules only declare things; anything touching the DOM, the engine, timers or storage runs from `bootstrap()`, a lifecycle hook, or lazily on first use. No `import.meta.glob`.
- Imports leaving the file's directory use `@src/...`, never `../`; same-directory imports stay `./`.
- `feature.id` / `menu.id` are persisted in saves — never rename them.
- Engine patches only via `patchMethod`; never store flags on engine objects (they end up in save files).
- Draw menus only through the `MenuBuilder` (`ui.*` + `shared/controls`), never with hard-coded key numbers.
- Growing `api` is deliberate: update `createApi.test.ts`, keep `API_VERSION` (bump it only on a breaking change).
- Comments explain *why*, never *what*.

## Verification

After code changes run `pnpm typecheck` and `pnpm lint` (no `--fix`; lint is at 0 warnings and 0 errors — keep it there, boundary violations are errors). Run `pnpm test` when touching code covered by `*.test.ts` or adding pure logic. Lint does not check formatting and there is no pre-commit hook — run `pnpm exec prettier --write <files>`. `pnpm build` runs all of the above and bundles into `release/`. Other scripts: `package.json`.
