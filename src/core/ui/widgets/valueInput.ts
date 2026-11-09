import type { ActionKey } from '../../input/keymap.ts';
import { getOverlay } from '../dom.ts';
import { getMenuWindow } from '../popout.ts';
import { isUpdatingMenu, updateMenu } from '../render.ts';
import { widgetState } from '../widgetState.ts';
import { bindArrows, type ScrollHandler } from './scrollSelector.ts';

/**
 * Like appendScrollSelector, but the middle cell is a text input for typing a
 * value directly. Enter commits (`onCommit`; return false to reject the
 * input), Esc or clicking away discards.
 *
 * While the user types, the draft survives re-renders (incl. the 1 s timer)
 * in `widgetState.valueInputDrafts` under `inputKey` — scope the key to the
 * edited entity (e.g. `variable:12`) so a draft never leaks onto another one.
 */
export function appendValueInput(
  value: string,
  inputKey: string,
  onCommit: (text: string) => boolean | void,
  key1: ActionKey,
  key2: ActionKey,
  scrollHandler: ScrollHandler,
  showArrows = true,
): void {
  const drafts = widgetState.valueInputDrafts;
  const row = getOverlay().insertRow();
  row.className = 'scroll-selector-row';

  const leftButton = row.insertCell();
  leftButton.className = 'scroll-selector-buttons cheat-menu-cell';

  const cell = row.insertCell();
  cell.className = 'cheat-menu-cell';

  const rightButton = row.insertCell();
  rightButton.className = 'scroll-selector-buttons cheat-menu-cell';

  // a draft for another entity (selection changed) is dropped
  if (widgetState.activeValueInputKey !== inputKey) {
    for (const key in drafts) {
      if (key !== inputKey) delete drafts[key];
    }
  }
  const draft = drafts[inputKey];

  const input = document.createElement('input');
  input.type = 'text';
  input.autocomplete = 'off';
  input.spellcheck = false;
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
      const text = input.value;
      // onCommit returning false = rejected input: keep the draft and focus
      // so the user can fix it
      if (onCommit(text) === false) {
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

  cell.appendChild(input);

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

  if (!showArrows) return;

  bindArrows(leftButton, rightButton, key1, key2, scrollHandler);
}
