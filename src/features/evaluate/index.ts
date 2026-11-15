import { defineFeature } from '@src/core/feature.ts';
import type { ActionKey } from '@src/core/input/keymap.ts';
import type { MenuBuilder } from '@src/core/ui/builder.ts';
import { ICON_INFO } from '@src/core/ui/icons.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import type { ScrollHandler } from '@src/core/ui/widgets/scrollSelector.ts';
import { escapeHtml, formatError, formatValue, truncate } from './format.ts';
import {
  activePlugins,
  insertSnippet,
  pluginParametersSnippet,
  SNIPPET_GROUPS,
} from './snippets.ts';

// Runs arbitrary JavaScript in the game's global scope — useful when a game
// blocks the F8 dev tools, or as a quick reusable macro. The script is kept in
// localStorage (not the save file), so it survives new games and other saves.

const STORAGE_KEY = 'Cheat_Menu.evaluateScript';

type Result = { ok: boolean; text: string };

let script: string | null = null;
let lastResult: Result | null = null;

function loadScript(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

const currentScript = (): string => (script ??= loadScript());

function saveScript(value: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // storage unavailable — the script just won't persist
  }
}

function setResult(result: Result): void {
  lastResult = result;
  updateMenu();
}

function run(): void {
  const code = currentScript();
  if (!code.trim()) {
    SoundManager.playBuzzer();
    return;
  }
  saveScript(code);

  let value: unknown;
  try {
    // indirect eval: runs in global scope, can't see this module's locals
    value = (0, eval)(code);
  } catch (e) {
    console.error('[Cheat_Menu] Evaluate:', e);
    SoundManager.playBuzzer();
    setResult({ ok: false, text: formatError(e) });
    return;
  }

  console.log('[Cheat_Menu] Evaluate:', value);
  SoundManager.playSystemSound(1);

  if (value instanceof Promise) {
    setResult({ ok: true, text: 'Promise (pending)…' });
    value.then(
      (resolved) =>
        setResult({ ok: true, text: `Promise → ${formatValue(resolved)}` }),
      (e) =>
        setResult({ ok: false, text: `Promise rejected → ${formatError(e)}` }),
    );
    return;
  }

  setResult({ ok: true, text: formatValue(value) });
}

function clearResult(): void {
  lastResult = null;
  SoundManager.playSystemSound(2);
  updateMenu();
}

function editScript(text: string): void {
  script = text;
  saveScript(text);
}

function clearScript(): void {
  if (!currentScript()) {
    SoundManager.playBuzzer();
    return;
  }
  editScript('');
  SoundManager.playSystemSound(2);
  updateMenu();
}

function insert(code: string): void {
  editScript(insertSnippet(currentScript(), code));
  SoundManager.playSystemSound(1);
  updateMenu();
}

let helpOpen = false;
let groupIdx = 0;
let pluginIdx = 0;

// after the static groups: what a game adds can only be discovered at runtime
const PLUGINS_GROUP = 'This game: plugins';
const groupCount = SNIPPET_GROUPS.length + 1;

function toggleHelp(): void {
  helpOpen = !helpOpen;
  SoundManager.playSystemSound(0);
  updateMenu();
}

const wrap = (idx: number, len: number) => ((idx % len) + len) % len;

const scrollGroup: ScrollHandler = (direction) => {
  groupIdx = wrap(groupIdx + (direction === 'left' ? -1 : 1), groupCount);
  SoundManager.playSystemSound(0);
  updateMenu();
};

const makePluginScroll =
  (count: number): ScrollHandler =>
  (direction) => {
    pluginIdx = wrap(pluginIdx + (direction === 'left' ? -1 : 1), count);
    SoundManager.playSystemSound(0);
    updateMenu();
  };

function renderResult(
  ui: MenuBuilder,
  result: Result,
  clearKey: ActionKey,
): void {
  const cls = result.ok
    ? 'cheat-menu-eval-result'
    : 'cheat-menu-eval-result error-text';
  ui.section('cheat-menu-eval-result-section', () => {
    ui.title('Result');
    ui.wideDescription(
      `<span class="${cls}">${escapeHtml(truncate(result.text))}</span>`,
    );
    ui.button(
      { label: 'Clear result', onActivate: clearResult },
      { key: clearKey },
    );
  });
}

function renderPlugins(ui: MenuBuilder): void {
  const plugins = activePlugins(
    typeof $plugins !== 'undefined' ? $plugins : undefined,
  );
  if (plugins.length === 0) {
    ui.description('No active plugins');
    return;
  }
  pluginIdx = wrap(pluginIdx, plugins.length);
  const plugin = plugins[pluginIdx];

  ui.title('Plugin', `${pluginIdx + 1}/${plugins.length}`);
  ui.scrollSelector(escapeHtml(plugin.name), makePluginScroll(plugins.length), {
    selectable: true,
  });
  if (plugin.description) ui.wideDescription(escapeHtml(plugin.description));
  ui.cheat('Its parameters', 'Insert', () =>
    insert(pluginParametersSnippet(plugin.name)),
  );
}

function renderHelp(ui: MenuBuilder): void {
  const group = SNIPPET_GROUPS[groupIdx];
  ui.title('Help', `${groupIdx + 1}/${groupCount}`);
  ui.wideDescription(
    'Insert appends a snippet to the script; edit the ids, then Run. ' +
      'The last expression is shown as the result.',
  );
  ui.scrollSelector(group ? group.name : PLUGINS_GROUP, scrollGroup);

  if (!group) {
    renderPlugins(ui);
    return;
  }
  for (const snippet of group.snippets) {
    ui.cheat(snippet.label, 'Insert', () => insert(snippet.code));
  }
}

export default defineFeature({
  id: 'evaluate',
  menus: [
    {
      id: 'evaluate',
      name: 'Evaluate',
      tier: 'advanced',
      render(ui) {
        // reserved before the help is drawn above them, so they never move
        const runKey = ui.nextKey();
        const clearScriptKey = ui.nextKey();
        const clearResultKey = ui.nextKey();

        ui.cheatTitle();
        ui.title('Script', undefined, {
          actions: [
            {
              icon: ICON_INFO,
              title: helpOpen ? 'Hide help' : 'Help: example commands',
              active: helpOpen,
              onClick: toggleHelp,
            },
          ],
        });
        if (helpOpen) {
          ui.section('cheat-menu-help-section', () => renderHelp(ui));
        }
        ui.codeInput('evaluate', currentScript(), editScript, run);
        ui.buttons(
          { label: 'Run (Ctrl+Enter)', onActivate: run },
          { label: 'Clear', onActivate: clearScript },
          { keys: [runKey, clearScriptKey] },
        );

        if (lastResult) renderResult(ui, lastResult, clearResultKey);
      },
    },
  ],
});
