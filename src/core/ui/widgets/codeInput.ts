import { getOverlay } from '@src/core/ui/dom.ts';
import { getMenuWindow } from '@src/core/ui/popout.ts';
import { isUpdatingMenu } from '@src/core/ui/render.ts';
import { widgetState } from '@src/core/ui/widgetState.ts';

export function appendCodeInput(
  inputKey: string,
  value: string,
  onChange: (text: string) => void,
  onSubmit: (text: string) => void,
  rows = 6,
): void {
  const row = getOverlay().insertRow();
  const cell = row.insertCell();
  cell.colSpan = 3;
  cell.className = 'cheat-menu-cell cheat-menu-search-cell';

  const textarea = document.createElement('textarea');
  textarea.className = 'cheat-menu-search-input cheat-menu-code-input';
  textarea.rows = rows;
  textarea.spellcheck = false;
  textarea.autocomplete = 'off';
  textarea.value = value;
  textarea.placeholder = 'Ctrl+Enter: run';

  const remember = () => {
    widgetState.activeCodeInput = {
      key: inputKey,
      caret: textarea.selectionStart ?? textarea.value.length,
      scroll: textarea.scrollTop,
    };
  };

  textarea.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      remember();
      onSubmit(textarea.value);
    } else if (e.key === 'Tab') {
      // insert indentation instead of moving focus out of the editor
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.setRangeText('  ', start, end, 'end');
      onChange(textarea.value);
    }
  });
  ['keyup', 'keypress'].forEach((evt) => {
    textarea.addEventListener(evt, (e) => e.stopPropagation());
  });
  textarea.addEventListener('mousedown', (e) => e.stopPropagation());

  textarea.addEventListener('focus', remember);
  textarea.addEventListener('blur', () => {
    if (!isUpdatingMenu() && widgetState.activeCodeInput?.key === inputKey) {
      widgetState.activeCodeInput = null;
    }
  });
  textarea.addEventListener('input', () => onChange(textarea.value));

  cell.appendChild(textarea);

  const active = widgetState.activeCodeInput;
  if (active?.key === inputKey) {
    getMenuWindow().requestAnimationFrame(() => {
      textarea.focus();
      const pos = Math.min(active.caret, textarea.value.length);
      textarea.setSelectionRange(pos, pos);
      textarea.scrollTop = active.scroll;
    });
  }
}
