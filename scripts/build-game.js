import { execSync } from 'child_process';
import { copyFileSync, existsSync, readdirSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { createInterface } from 'readline/promises';
import { fileURLToPath } from 'url';
import { build } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const extensionsDir = resolve(root, 'extensions');
const pluginsDir = resolve(root, 'release/www/js/plugins');
const DICTIONARY = 'Cheat_Menu.dictionary.json';
// the name ends up in a file name and in the game's plugins.js
const VALID_NAME = /^[A-Za-z0-9_-]+$/;

const isGame = (dir) =>
  existsSync(resolve(dir, 'src/index.ts')) ||
  existsSync(resolve(dir, DICTIONARY));

function available() {
  if (!existsSync(extensionsDir)) return [];
  return readdirSync(extensionsDir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        VALID_NAME.test(entry.name) &&
        isGame(resolve(extensionsDir, entry.name)),
    )
    .map((entry) => entry.name);
}

async function pickGame(names) {
  names.forEach((game, i) => console.log(`  ${i + 1}) ${game}`));
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    for (;;) {
      const answer = (await rl.question('Build which game? ')).trim();
      const picked =
        names[Number(answer) - 1] ?? names.find((n) => n === answer);
      if (picked) return picked;
      console.log(`  enter 1–${names.length} or a name from the list`);
    }
  } finally {
    rl.close();
  }
}

async function chooseGame() {
  const names = available();
  if (names.length === 0) fail('no games in extensions/');
  if (names.length === 1) return names[0];
  if (!process.stdin.isTTY) {
    fail('more than one game: pass one, e.g. pnpm build:game <name>');
  }
  return pickGame(names);
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

const name = process.argv[2] ?? (await chooseGame());
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
