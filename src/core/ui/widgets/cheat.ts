import { bindKey } from '../../input/keyListeners.ts';
import type { ActionKey } from '../../input/keymap.ts';
import { getOverlay } from '../dom.ts';

/** Row with a label and a clickable `status[key]` button. */
export function appendCheat(
  cheatText: string,
  statusText: string | number | boolean | null,
  key: ActionKey,
  clickHandler: (event?: MouseEvent) => void,
): void {
  const cheatRow = getOverlay().insertRow();

  const cheatTitle = cheatRow.insertCell();
  cheatTitle.className = 'cheat-menu-cell';
  const temp = cheatRow.insertCell();
  temp.className = 'cheat-menu-cell';
  const cheat = cheatRow.insertCell();
  cheat.className = 'cheat-menu-buttons cheat-menu-cell';

  cheatTitle.innerHTML = cheatText;
  cheat.innerHTML = statusText + '[' + key + ']';

  cheat.addEventListener('mousedown', clickHandler);
  bindKey(key, clickHandler);
}
