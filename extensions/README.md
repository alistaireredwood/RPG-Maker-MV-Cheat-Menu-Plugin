# Game-specific extensions

One folder per game. Everything except this README and `tsconfig.base.json` is
git-ignored, so the folders stay local.

```
extensions/<name>/
  src/index.ts                  optional: the extension script
  Cheat_Menu.dictionary.json    optional: names / translations
  tsconfig.json                 needed with src/
  ...                           anything else (notes, analysis) is ignored by the build
```

`<name>` (letters, digits, `_`, `-`) becomes the plugin name: the script is
built as `Cheat_Menu.<name>.js`, and that name ends up in the game's
`plugins.js`. Renaming the folder later leaves a dead entry for the old name in
`plugins.js`, which you have to remove by hand.

`tsconfig.json` for a folder with `src/`:

```json
{
  "extends": "../tsconfig.base.json",
  "include": ["src", "../../release/types/engine"]
}
```

`examples/extension-template/` has the same layout (`src/` and a sample
`Cheat_Menu.dictionary.json`), so copying it here is a quick start. Its
`package.json` and `vite.config.ts` are only for building outside this repo.

The extension code follows `examples/extension-template/src/` and
`docs/game-specific-extensions.md`. No `vite.config.ts` is needed: the build
script sets the output.

## Building for a game

```sh
pnpm build:game <name>
```

This rebuilds `release/` with Cheat Menu, the patcher and the files of that one
game. Then copy `www/`, `patcher.exe` and `plugins_patch.go.txt` from
`release/` into the game folder (next to `Game.exe`) and run `patcher.exe`
there. `release/types/` is for extension authors only.

`pnpm build:release` builds Cheat Menu alone, without any game files.
