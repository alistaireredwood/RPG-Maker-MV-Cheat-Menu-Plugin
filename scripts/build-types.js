// Bundles the public api (src/api.ts) into one declaration file for
// extension authors. Kept out of release/www, which is copied into the game.
//
// Plain rolldown instead of `vite build`: Vite's app pipeline strips the entry
// exports and minifies the declaration chunk, leaving an empty file.
import { cpSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { rolldown } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'release/types');
const tsconfig = resolve(root, 'tsconfig.json');

rmSync(outDir, { recursive: true, force: true });

const bundle = await rolldown({
  cwd: root,
  input: { Cheat_Menu: resolve(root, 'src/api.ts') },
  tsconfig,
  plugins: [dts({ emitDtsOnly: true, tsconfig })],
});
await bundle.write({ dir: outDir });
await bundle.close();
console.log('✓ types/Cheat_Menu.d.ts');

// the api refers to engine classes (Game_Actor, …) as globals, so authors
// need the same ambient typings the plugin is written against
cpSync(resolve(root, 'src/types'), resolve(outDir, 'engine'), {
  recursive: true,
});
console.log('✓ types/engine/');
