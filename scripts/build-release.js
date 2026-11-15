import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
writeFileSync(resolve(root, 'release/plugins_patch.go.txt'), 'Cheat_Menu\n');
console.log('✓ plugins_patch.go.txt');

const exeName = process.platform === 'win32' ? 'patcher.exe' : 'patcher';
const outPath = resolve(root, 'release', exeName).replace(/\\/g, '/');
execSync(`go build -o "${outPath}" .`, {
  cwd: resolve(root, 'patcher'),
  stdio: 'inherit',
});
console.log(`✓ ${exeName}`);
