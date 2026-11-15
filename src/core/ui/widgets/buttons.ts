import { bindKey } from '@src/core/input/keyListeners.ts';
import type { ActionKey } from '@src/core/input/keymap.ts';
import { getOverlay } from '@src/core/ui/dom.ts';

export type RowButton = {
  label: string;
  onActivate: (event?: MouseEvent) => void;
};

function fillButton(cell: HTMLElement, button: RowButton, key: ActionKey) {
  const inner = document.createElement('span');
  inner.className = 'cheat-menu-row-button';
  inner.innerHTML = `${button.label}[${key}]`;
  cell.appendChild(inner);
  cell.addEventListener('mousedown', button.onActivate);
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
 * Equal buttons, one per column: two sit at the left and right edge, a third
 * goes in the middle (Apply / Reset / Cancel). `keys` are in button order.
 */
export function appendButtonRow(
  buttons: ButtonRow,
  keys: readonly ActionKey[],
): void {
  const row = getOverlay().insertRow();
  const cells = buttons.length === 2 ? [0, null, 1] : [0, 1, 2];
  for (const index of cells) {
    const cell = row.insertCell();
    cell.className = 'cheat-menu-cell cheat-menu-button-cell';
    if (index === null) continue;
    cell.classList.add('cheat-menu-buttons');
    fillButton(cell, buttons[index], keys[index]);
  }
}
