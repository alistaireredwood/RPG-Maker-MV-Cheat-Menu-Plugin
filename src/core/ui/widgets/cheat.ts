import { bindKey } from '@src/core/input/keyListeners.ts';
import type { ActionKey } from '@src/core/input/keymap.ts';
import { getOverlay } from '@src/core/ui/dom.ts';
import { keyHint } from './keyHint.ts';

export type CheatLayout =
  { value?: string | number; wide?: false } | { wide: true; value?: never };

export function appendCheat(
  cheatText: string,
  statusText: string | number | boolean | null,
  key: ActionKey,
  clickHandler: (event?: MouseEvent) => void,
  layout: CheatLayout = {},
): void {
  const cheatRow = getOverlay().insertRow();
  cheatRow.className = 'cheat-menu-cheat-row';

  const cheatTitle = cheatRow.insertCell();
  cheatTitle.className = 'cheat-menu-cell';
  cheatTitle.innerHTML = cheatText;

  if (!layout.wide) {
    const valueCell = cheatRow.insertCell();
    valueCell.className = 'cheat-menu-cell';
    if (layout.value !== undefined) valueCell.innerHTML = String(layout.value);
  }

  const cheat = cheatRow.insertCell();
  cheat.className = 'cheat-menu-buttons cheat-menu-cell';
  if (layout.wide) {
    cheat.colSpan = 2;
    cheat.classList.add('cheat-menu-status-wide');
  }
  const status = document.createElement('span');
  status.className = 'cheat-menu-status';
  status.innerHTML = statusText + keyHint(key);
  cheat.appendChild(status);

  cheat.addEventListener('mousedown', clickHandler);
  bindKey(key, clickHandler);
}
