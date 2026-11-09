import CheatMenu from '../../CheatMenu.ts';
import type { ActionKey } from '../../core/input/keymap.ts';
import { getOverlay } from '../../core/ui/dom.ts';
import { getMenuWindow } from '../../core/ui/popout.ts';
import { isUpdatingMenu, updateMenu } from '../../core/ui/render.ts';
import {
  bindArrows,
  type Direction,
} from '../../core/ui/widgets/scrollSelector.ts';
import { appendTitle } from '../../core/ui/widgets/text.ts';

// amount state lives in CheatMenu (amounts, amountIndex, customAmount,
// amountInputText, _activeAmountInput) until shared/state.ts exists

export function scrollAmount(direction: Direction): void {
  // typed amount takes over from here; clear it so the display reverts to
  // the hardcoded amounts list on this and future renders
  CheatMenu.amountInputText = null;

  if (CheatMenu.customAmount !== null) {
    // arrows snap a typed value to the nearest hardcoded amount *in that
    // direction* — right goes to the next higher value, left to the next
    // lower one — rather than the closest value overall
    const current = CheatMenu.customAmount;
    let targetIdx: number;
    if (direction === 'right') {
      targetIdx = CheatMenu.amounts.findIndex((value) => value > current);
      if (targetIdx === -1) targetIdx = CheatMenu.amounts.length - 1;
    } else {
      targetIdx = 0;
      for (let i = 0; i < CheatMenu.amounts.length; i++) {
        if (CheatMenu.amounts[i] < current) {
          targetIdx = i;
        } else {
          break;
        }
      }
    }
    CheatMenu.amountIndex = targetIdx;
    CheatMenu.customAmount = null;
    SoundManager.playSystemSound(direction === 'left' ? 2 : 1);
    updateMenu();
    return;
  }

  if (direction == 'left') {
    CheatMenu.amountIndex--;
    if (CheatMenu.amountIndex < 0) {
      CheatMenu.amountIndex = 0;
    }
    SoundManager.playSystemSound(2);
  } else {
    CheatMenu.amountIndex++;
    if (CheatMenu.amountIndex >= CheatMenu.amounts.length) {
      CheatMenu.amountIndex = CheatMenu.amounts.length - 1;
    }
    SoundManager.playSystemSound(1);
  }

  updateMenu();
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

/** "Amount" title + ←/→ through the preset amounts, or type a custom one. */
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
  input.value =
    CheatMenu.amountInputText ??
    String(CheatMenu.amounts[CheatMenu.amountIndex]);

  input.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      input.blur();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || ALLOWED_KEYS.includes(e.key))
      return;
    // only whole digits — blocks commas, dots, minus signs, letters, etc.
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
    CheatMenu._activeAmountInput = true;
  });

  input.addEventListener('blur', () => {
    if (!isUpdatingMenu()) {
      CheatMenu._activeAmountInput = false;
      // an empty/cleared field with no valid typed amount reverts to the
      // hardcoded value once the user clicks away
      if (CheatMenu.customAmount === null) {
        CheatMenu.amountInputText = null;
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
    CheatMenu.amountInputText = digitsOnly;
    CheatMenu.customAmount =
      digitsOnly === '' ? null : parseInt(digitsOnly, 10);
    updateMenu();
  });

  cell.appendChild(input);

  if (CheatMenu._activeAmountInput) {
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
