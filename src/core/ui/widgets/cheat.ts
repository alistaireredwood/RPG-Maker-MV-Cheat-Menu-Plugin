import { bindKey } from '@src/core/input/keyListeners.ts';
import type { ActionKey } from '@src/core/input/keymap.ts';
import { getOverlay } from '@src/core/ui/dom.ts';
import { keyHint } from './keyHint.ts';

export function appendCheat(
  cheatText: string,
  statusText: string | number | boolean | null,
  key: ActionKey,
  clickHandler: (event?: MouseEvent) => void,
  value?: string | number,
): void {
  const cheatRow = getOverlay().insertRow();

  const cheatTitle = cheatRow.insertCell();
  cheatTitle.className = 'cheat-menu-cell';
  const valueCell = cheatRow.insertCell();
  valueCell.className = 'cheat-menu-cell';
  const cheat = cheatRow.insertCell();
  cheat.className = 'cheat-menu-buttons cheat-menu-cell';

  cheatTitle.innerHTML = cheatText;
  if (value !== undefined) valueCell.innerHTML = String(value);
  cheat.innerHTML = statusText + keyHint(key);

  cheat.addEventListener('mousedown', clickHandler);
  bindKey(key, clickHandler);
}
