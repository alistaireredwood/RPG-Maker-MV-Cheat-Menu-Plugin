import type { ActionKey } from '@src/core/input/keymap.ts';
import type { MenuBuilder } from '@src/core/ui/builder.ts';
import { getOverlay } from '@src/core/ui/dom.ts';
import { getMenuWindow } from '@src/core/ui/popout.ts';
import { isUpdatingMenu, updateMenu } from '@src/core/ui/render.ts';
import {
  bindArrows,
  type Direction,
  type ScrollHandler,
} from '@src/core/ui/widgets/scrollSelector.ts';
import { appendTitle } from '@src/core/ui/widgets/text.ts';
import {
  AMOUNTS,
  amountInput,
  currentAmount,
  sharedState,
} from '@src/shared/state.ts';

/**
 * Preset index an arrow press snaps a typed amount to: the next preset *in
 * that direction* — right goes to the next higher value, left to the next
 * lower one — rather than the closest value overall.
 */
export function snapToPreset(
  amounts: readonly number[],
  typed: number,
  direction: Direction,
): number {
  if (direction === 'right') {
    const idx = amounts.findIndex((value) => value > typed);
    return idx === -1 ? amounts.length - 1 : idx;
  }
  let idx = 0;
  for (let i = 0; i < amounts.length; i++) {
    if (amounts[i] < typed) idx = i;
    else break;
  }
  return idx;
}

export function scrollAmount(direction: Direction): void {
  // typed amount takes over from here; clear it so the display reverts to
  // the hardcoded amounts list on this and future renders
  amountInput.text = null;

  if (amountInput.custom !== null) {
    sharedState.amountIndex = snapToPreset(
      AMOUNTS,
      amountInput.custom,
      direction,
    );
    amountInput.custom = null;
    SoundManager.playSystemSound(direction === 'left' ? 2 : 1);
    updateMenu();
    return;
  }

  if (direction == 'left') {
    sharedState.amountIndex = Math.max(0, sharedState.amountIndex - 1);
    SoundManager.playSystemSound(2);
  } else {
    sharedState.amountIndex = Math.min(
      AMOUNTS.length - 1,
      sharedState.amountIndex + 1,
    );
    SoundManager.playSystemSound(1);
  }

  updateMenu();
}

export function makeApplyAmount(
  action: (amount: number) => void,
): ScrollHandler {
  return function (direction) {
    let amount = currentAmount();
    if (direction === 'left') {
      amount = -amount;
      SoundManager.playSystemSound(2);
    } else {
      SoundManager.playSystemSound(1);
    }
    action(amount);
    updateMenu();
  };
}

const ALLOWED_KEYS = [
  'Backspace',
  'Delete',
  'ArrowLeft',
  'ArrowRight',
  'Tab',
  'Home',
  'End',
];

export function appendAmountSelection(key1: ActionKey, key2: ActionKey): void {
  appendTitle('Amount');

  const row = getOverlay().insertRow();
  row.className = 'scroll-selector-row';

  const leftButton = row.insertCell();
  leftButton.className = 'scroll-selector-buttons cheat-menu-cell';

  const cell = row.insertCell();
  cell.className = 'cheat-menu-cell';

  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = 'numeric';
  input.autocomplete = 'off';
  input.className = 'cheat-menu-amount-input actor-name-highlight';
  input.value = amountInput.text ?? String(AMOUNTS[sharedState.amountIndex]);

  input.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      input.blur();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || ALLOWED_KEYS.includes(e.key))
      return;
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  });
  ['keyup', 'keypress'].forEach((evt) => {
    input.addEventListener(evt, (e) => e.stopPropagation());
  });
  input.addEventListener('mousedown', (e) => e.stopPropagation());

  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData?.getData('text') ?? '').replace(
      /[^0-9]/g,
      '',
    );
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    input.value = input.value.slice(0, start) + text + input.value.slice(end);
    input.setSelectionRange(start + text.length, start + text.length);
    input.dispatchEvent(new Event('input'));
  });

  input.addEventListener('focus', () => {
    amountInput.focused = true;
  });

  input.addEventListener('blur', () => {
    if (!isUpdatingMenu()) {
      amountInput.focused = false;
      // an empty/cleared field with no valid typed amount reverts to the
      // hardcoded value once the user clicks away
      if (amountInput.custom === null) {
        amountInput.text = null;
      }
    }
  });

  input.addEventListener('input', () => {
    const digitsOnly = input.value.replace(/[^0-9]/g, '');
    if (digitsOnly !== input.value) {
      const pos = input.selectionStart ?? digitsOnly.length;
      input.value = digitsOnly;
      input.setSelectionRange(pos, pos);
    }
    amountInput.text = digitsOnly;
    amountInput.custom = digitsOnly === '' ? null : parseInt(digitsOnly, 10);
    updateMenu();
  });

  cell.appendChild(input);

  if (amountInput.focused) {
    getMenuWindow().requestAnimationFrame(() => {
      input.focus();
      const len = input.value.length;
      input.setSelectionRange(len, len);
    });
  }

  const rightButton = row.insertCell();
  rightButton.className = 'scroll-selector-buttons cheat-menu-cell';

  bindArrows(leftButton, rightButton, key1, key2, scrollAmount);
}

/** Takes 2 keys. */
export function amountSelector(ui: MenuBuilder): void {
  appendAmountSelection(ui.nextKey(), ui.nextKey());
}
