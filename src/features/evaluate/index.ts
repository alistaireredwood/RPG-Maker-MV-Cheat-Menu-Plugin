import { defineFeature } from '@src/core/feature.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import { escapeHtml, formatError, formatValue, truncate } from './format.ts';

// Runs arbitrary JavaScript in the game's global scope — useful when a game
// blocks the F8 dev tools, or as a quick reusable macro. The script is kept in
// localStorage (not the save file), so it survives new games and other saves.

const STORAGE_KEY = 'Cheat_Menu.evaluateScript';

type Result = { ok: boolean; text: string };

let script = loadScript();
let lastResult: Result | null = null;

function loadScript(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

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
  if (!script.trim()) {
    SoundManager.playBuzzer();
    return;
  }
  saveScript(script);

  let value: unknown;
  try {
    // indirect eval: runs in global scope, can't see this module's locals
    value = (0, eval)(script);
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

export default defineFeature({
  id: 'evaluate',
  menus: [
    {
      id: 'evaluate',
      name: 'Evaluate',
      render(ui) {
        ui.cheatTitle();
        ui.title('Script');
        ui.codeInput('evaluate', script, editScript, run);
        ui.cheat('Run (Ctrl+Enter in editor)', 'Activate', run);

        if (!lastResult) return;
        const cls = lastResult.ok
          ? 'cheat-menu-eval-result'
          : 'cheat-menu-eval-result error-text';
        ui.title('Result');
        ui.cheat('Clear result', 'Activate', clearResult);
        ui.wideDescription(
          `<span class="${cls}">${escapeHtml(truncate(lastResult.text))}</span>`,
        );
      },
    },
  ],
});
