import type { ActionKey } from '@src/core/input/keymap.ts';
import { getOverlay } from '@src/core/ui/dom.ts';
import { getMenuWindow } from '@src/core/ui/popout.ts';
import { isUpdatingMenu, updateMenu } from '@src/core/ui/render.ts';
import {
  markValueInputRendered,
  widgetState,
} from '@src/core/ui/widgetState.ts';
import { sanitizeNumberText, type NumberAccept } from './numberText.ts';
import {
  appendArrowRow,
  bindArrows,
  type ScrollHandler,
} from './scrollSelector.ts';

export type ValueField = {
  value: string;
  /**
   * The draft survives re-renders under this key — scope it to the edited
   * entity (e.g. `variable:12`) so a draft never leaks onto another one.
   */
  inputKey: string;
  /** `false` = rejected: the draft and focus stay so the user can fix it */
  onCommit: (text: string) => boolean | void;
  /** only characters of such a number can be typed or pasted */
  accept?: NumberAccept;
  placeholder?: string;
};

export type ValueInputOptions = {
  showArrows?: boolean;
  accept?: NumberAccept;
};

function createValueInput(field: ValueField): HTMLInputElement {
  const { value, inputKey, onCommit, accept } = field;
  const drafts = widgetState.valueInputDrafts;
  markValueInputRendered(inputKey);
  const draft = drafts[inputKey];

  const input = document.createElement('input');
  input.type = 'text';
  input.autocomplete = 'off';
  input.spellcheck = false;
  if (accept) input.inputMode = accept === 'integer' ? 'numeric' : 'decimal';
  if (field.placeholder) input.placeholder = field.placeholder;
  input.className = 'cheat-menu-amount-input cheat-menu-value-input';
  input.title = 'Enter: apply, Esc: cancel';
  input.value = draft ? draft.text : value;
  if (draft && draft.text !== value) input.classList.add('is-dirty');

  const discard = () => {
    delete drafts[inputKey];
    widgetState.activeValueInputKey = null;
  };

  input.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      if (onCommit(input.value) === false) {
        SoundManager.playBuzzer();
        input.classList.add('is-invalid');
        return;
      }
      discard();
      input.blur();
      updateMenu();
    } else if (e.key === 'Escape') {
      discard();
      input.blur();
      updateMenu();
    }
  });
  ['keyup', 'keypress'].forEach((evt) => {
    input.addEventListener(evt, (e) => e.stopPropagation());
  });
  input.addEventListener('mousedown', (e) => e.stopPropagation());

  input.addEventListener('focus', () => {
    widgetState.activeValueInputKey = inputKey;
  });

  input.addEventListener('blur', () => {
    // a re-render removes the element (and blurs it) — keep the draft then
    if (!isUpdatingMenu() && widgetState.activeValueInputKey === inputKey) {
      discard();
      updateMenu();
    }
  });

  input.addEventListener('input', () => {
    // filtered on `input` rather than `keydown`, so paste, drag-and-drop and
    // IME text are covered too
    if (accept) {
      const caret = input.selectionStart ?? input.value.length;
      const clean = sanitizeNumberText(input.value, accept);
      if (clean !== input.value) {
        const pos = sanitizeNumberText(
          input.value.slice(0, caret),
          accept,
        ).length;
        input.value = clean;
        input.setSelectionRange(pos, pos);
      }
    }
    drafts[inputKey] = {
      text: input.value,
      caret: input.selectionStart ?? input.value.length,
    };
    input.classList.toggle('is-dirty', input.value !== value);
    input.classList.remove('is-invalid');
  });
  // keep the caret where the user left it across re-renders
  ['keyup', 'click', 'select'].forEach((evt) => {
    input.addEventListener(evt, () => {
      const d = drafts[inputKey];
      if (d) d.caret = input.selectionStart ?? d.caret;
    });
  });

  if (widgetState.activeValueInputKey === inputKey) {
    getMenuWindow().requestAnimationFrame(() => {
      input.focus();
      const pos = Math.min(
        draft?.caret ?? input.value.length,
        input.value.length,
      );
      input.setSelectionRange(pos, pos);
    });
  }

  return input;
}

export function appendValueInput(
  value: string,
  inputKey: string,
  onCommit: (text: string) => boolean | void,
  key1: ActionKey,
  key2: ActionKey,
  scrollHandler: ScrollHandler,
  options: ValueInputOptions = {},
): void {
  const {
    left: leftButton,
    value: cell,
    right: rightButton,
  } = appendArrowRow();
  cell.appendChild(
    createValueInput({ value, inputKey, onCommit, accept: options.accept }),
  );

  if (options.showArrows ?? true) {
    bindArrows(leftButton, rightButton, key1, key2, scrollHandler);
  }
}

/** Two inputs in the outer columns of one row, e.g. a min – max range. */
export function appendValueInputPair(
  left: ValueField,
  right: ValueField,
  separator: string,
): void {
  const row = getOverlay().insertRow();
  row.className = 'scroll-selector-row';

  const leftCell = row.insertCell();
  leftCell.className = 'cheat-menu-cell';
  leftCell.appendChild(createValueInput(left));

  const middle = row.insertCell();
  middle.className = 'cheat-menu-cell';
  middle.innerHTML = separator;

  const rightCell = row.insertCell();
  rightCell.className = 'cheat-menu-cell';
  rightCell.appendChild(createValueInput(right));
}
