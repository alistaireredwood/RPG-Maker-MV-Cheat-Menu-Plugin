import { bindKey } from '@src/core/input/keyListeners.ts';
import type { ActionKey } from '@src/core/input/keymap.ts';
import { getOverlay } from '@src/core/ui/dom.ts';
import { keyHint } from './keyHint.ts';

export type RowButton = {
  label: string;
  onActivate: (event?: MouseEvent) => void;
};

function fillButton(target: HTMLElement, button: RowButton, key: ActionKey) {
  const inner = document.createElement('span');
  inner.className = 'cheat-menu-row-button';
  inner.innerHTML = button.label + keyHint(key);
  target.appendChild(inner);
  target.addEventListener('mousedown', button.onActivate);
  bindKey(key, button.onActivate);
}

export function appendButton(button: RowButton, key: ActionKey): void {
  const cell = getOverlay().insertRow().insertCell();
  cell.colSpan = 3;
  cell.className =
    'cheat-menu-cell cheat-menu-buttons cheat-menu-button-cell cheat-menu-button-cell-wide';
  fillButton(cell, button, key);
}

export function appendButtons(
  main: RowButton,
  side: RowButton,
  mainKey: ActionKey,
  sideKey: ActionKey,
): void {
  const row = getOverlay().insertRow();

  const mainCell = row.insertCell();
  mainCell.colSpan = 2;
  mainCell.className =
    'cheat-menu-cell cheat-menu-buttons cheat-menu-button-cell cheat-menu-button-cell-wide';
  fillButton(mainCell, main, mainKey);

  const sideCell = row.insertCell();
  sideCell.className =
    'cheat-menu-cell cheat-menu-buttons cheat-menu-button-cell';
  fillButton(sideCell, side, sideKey);
}

export type ButtonRow =
  readonly [RowButton, RowButton] | readonly [RowButton, RowButton, RowButton];

/**
 * Equal buttons at the menu's edges: three take one column each (Apply /
 * Reset / Cancel), two split the full width. `keys` are in button order.
 */
export function appendButtonRow(
  buttons: ButtonRow,
  keys: readonly ActionKey[],
): void {
  const row = getOverlay().insertRow();

  if (buttons.length === 2) {
    const cell = row.insertCell();
    cell.colSpan = 3;
    cell.className =
      'cheat-menu-cell cheat-menu-button-cell cheat-menu-button-cell-wide';
    const pair = document.createElement('div');
    pair.className = 'cheat-menu-button-pair';
    buttons.forEach((button, index) => {
      const slot = document.createElement('span');
      slot.className = 'cheat-menu-buttons';
      fillButton(slot, button, keys[index]);
      pair.appendChild(slot);
    });
    cell.appendChild(pair);
    return;
  }

  for (const [index, button] of buttons.entries()) {
    const cell = row.insertCell();
    cell.className =
      'cheat-menu-cell cheat-menu-button-cell cheat-menu-buttons';
    fillButton(cell, button, keys[index]);
  }
}
