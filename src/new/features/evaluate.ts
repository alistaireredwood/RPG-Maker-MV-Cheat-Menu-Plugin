import CheatMenu from '../CheatMenu.ts';

// Runs arbitrary JavaScript in the game's global scope — useful when a game
// blocks the F8 dev tools, or as a quick reusable macro. The script is kept in
// localStorage (not the save file), so it survives new games and other saves.

const STORAGE_KEY = 'Cheat_Menu.evaluateScript';
const MAX_RESULT_LENGTH = 2000;

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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatValue(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
  if (value !== null && typeof value === 'object') {
    try {
      // game objects can be circular or huge — fall back to their type name
      return JSON.stringify(value, null, 2) ?? String(value);
    } catch {
      return `[${value.constructor?.name ?? 'Object'}]`;
    }
  }
  return String(value);
}

function formatError(e: unknown): string {
  return e instanceof Error ? `${e.name}: ${e.message}` : formatValue(e);
}

function truncate(text: string): string {
  return text.length > MAX_RESULT_LENGTH
    ? `${text.slice(0, MAX_RESULT_LENGTH)}\n… (${text.length - MAX_RESULT_LENGTH} more chars, full result in console)`
    : text;
}

function setResult(result: Result): void {
  lastResult = result;
  CheatMenu.updateMenu();
}

CheatMenu.runEvaluate = function () {
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
      (resolved) => setResult({ ok: true, text: `Promise → ${formatValue(resolved)}` }),
      (e) => setResult({ ok: false, text: `Promise rejected → ${formatError(e)}` }),
    );
    return;
  }

  setResult({ ok: true, text: formatValue(value) });
};

const clearResult = () => {
  lastResult = null;
  SoundManager.playSystemSound(2);
  CheatMenu.updateMenu();
};

CheatMenu.appendEvaluate = function (key1, key2) {
  CheatMenu.appendTitle('Script');
  CheatMenu.appendCodeInput(
    'evaluate',
    script,
    (text) => {
      script = text;
      saveScript(text);
    },
    () => CheatMenu.runEvaluate(),
  );
  CheatMenu.appendCheat('Run (Ctrl+Enter in editor)', 'Activate', key1, CheatMenu.runEvaluate);

  if (lastResult) {
    CheatMenu.appendTitle('Result');
    CheatMenu.appendCheat('Clear result', 'Activate', key2, clearResult);
    const cls = lastResult.ok ? 'cheat-menu-eval-result' : 'cheat-menu-eval-result error-text';
    CheatMenu.appendWideDescription(`<span class="${cls}">${escapeHtml(truncate(lastResult.text))}</span>`);
  }
};

export const menu = {
  name: 'Evaluate',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendEvaluate(4, 5);
  },
};
