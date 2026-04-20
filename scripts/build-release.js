import { cpSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const releasePluginsDir = resolve(root, 'release/www/js/plugins');

mkdirSync(releasePluginsDir, { recursive: true });

for (const file of ['Cheat_Menu.js', 'Cheat_Menu.css']) {
  cpSync(resolve(root, 'www/js/plugins', file), resolve(releasePluginsDir, file));
  console.log(`✓ ${file}`);
}

writeFileSync(resolve(root, 'release/plugins_patch.go.txt'), 'Cheat_Menu\n');
console.log('✓ plugins_patch.go.txt');

const exeName = process.platform === 'win32' ? 'patcher.exe' : 'patcher';
const outPath = resolve(root, 'release', exeName).replace(/\\/g, '/');
execSync(`go build -o "${outPath}" .`, {
  cwd: resolve(root, 'patcher'),
  stdio: 'inherit',
});
console.log(`✓ ${exeName}`);
