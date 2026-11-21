import { execSync } from 'child_process';
import { copyFileSync, existsSync, readdirSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { build } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const extensionsDir = resolve(root, 'extensions');
const pluginsDir = resolve(root, 'release/www/js/plugins');
const DICTIONARY = 'Cheat_Menu.dictionary.json';
// the name ends up in a file name and in the game's plugins.js
const VALID_NAME = /^[A-Za-z0-9_-]+$/;

function available() {
  if (!existsSync(extensionsDir)) return [];
  return readdirSync(extensionsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && VALID_NAME.test(entry.name))
    .map((entry) => entry.name);
}

function fail(message) {
  const names = available();
  console.error(`✗ ${message}`);
  console.error(
    names.length > 0
      ? `  available: ${names.join(', ')}`
      : '  no games in extensions/ yet, see extensions/README.md',
  );
  process.exit(1);
}

const name = process.argv[2];
if (!name) fail('usage: pnpm build:game <name>');
if (!VALID_NAME.test(name)) fail(`"${name}" is not a valid name`);

const gameDir = resolve(extensionsDir, name);
if (!existsSync(gameDir)) fail(`extensions/${name} does not exist`);

const entry = resolve(gameDir, 'src/index.ts');
const dictionary = resolve(gameDir, DICTIONARY);
const hasScript = existsSync(entry);
const hasDictionary = existsSync(dictionary);
if (!hasScript && !hasDictionary) {
  fail(`extensions/${name} has neither src/index.ts nor ${DICTIONARY}`);
}

// a broken dictionary would only show up as a console warning in the game
if (hasDictionary) {
  try {
    JSON.parse(readFileSync(dictionary, 'utf8'));
  } catch (e) {
    fail(`extensions/${name}/${DICTIONARY} is not valid JSON: ${e.message}`);
  }
}

// also empties release/www/js/plugins, dropping the files of the last game
execSync('pnpm build:release', { cwd: root, stdio: 'inherit' });

const pluginFile = `Cheat_Menu.${name}.js`;
if (hasScript) {
  execSync(`pnpm exec tsc -p "extensions/${name}"`, {
    cwd: root,
    stdio: 'inherit',
  });
  await build({
    configFile: false,
    root: gameDir,
    logLevel: 'warn',
    build: {
      target: 'chrome66',
      outDir: pluginsDir,
      emptyOutDir: false,
      lib: {
        entry,
        // a classic <script>: the IIFE keeps every top-level name out of window
        formats: ['iife'],
        name: `CheatMenu_${name.replace(/-/g, '_')}`,
        fileName: () => pluginFile,
      },
    },
  });
  console.log(`✓ ${pluginFile}`);
}

if (hasDictionary) {
  copyFileSync(dictionary, resolve(pluginsDir, DICTIONARY));
  console.log(`✓ ${DICTIONARY}`);
}

console.log(
  `\nrelease/ is ready for ${name}: copy www/, patcher.exe and ` +
    'plugins_patch.go.txt into the game folder and run the patcher there.',
);
