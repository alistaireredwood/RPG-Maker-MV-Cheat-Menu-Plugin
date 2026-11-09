import { getOverlay } from '@src/core/ui/dom.ts';
import { getMenuWindow } from '@src/core/ui/popout.ts';
import { isUpdatingMenu, updateMenu } from '@src/core/ui/render.ts';
import { widgetState } from '@src/core/ui/widgetState.ts';

export function appendSearchInput(
  placeholder: string,
  stateKey: string,
  onSearchChange?: (keyword: string) => void,
): void {
  const row = getOverlay().insertRow();
  const cell = row.insertCell();
  cell.colSpan = 3;
  cell.className = 'cheat-menu-cell cheat-menu-search-cell';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.value = widgetState.searchKeywords[stateKey] || '';
  input.className = 'cheat-menu-search-input';

  ['keydown', 'keyup', 'keypress'].forEach((evt) => {
    input.addEventListener(evt, (e) => e.stopPropagation());
  });
  input.addEventListener('mousedown', (e) => e.stopPropagation());

  input.addEventListener('focus', () => {
    widgetState.activeSearchKey = stateKey;
  });

  input.addEventListener('blur', () => {
    if (!isUpdatingMenu() && widgetState.activeSearchKey === stateKey) {
      widgetState.activeSearchKey = null;
    }
  });

  input.addEventListener('input', () => {
    const keyword = input.value.toLowerCase();
    widgetState.searchKeywords[stateKey] = keyword;
    onSearchChange?.(keyword);
    updateMenu();
  });

  cell.appendChild(input);

  if (widgetState.activeSearchKey === stateKey) {
    getMenuWindow().requestAnimationFrame(() => {
      input.focus();
      const len = input.value.length;
      input.setSelectionRange(len, len);
    });
  }
}
