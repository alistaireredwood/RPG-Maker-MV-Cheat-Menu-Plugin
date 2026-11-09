import { getMenus } from '../registry.ts';
import { store } from '../store.ts';
import { getOverlay } from './dom.ts';
import { getMenuDocument } from './popout.ts';
import { updateMenu } from './render.ts';

let gridFocusIndex = 0;

/** Next grid render focuses the first button (used when leaving a sub-menu). */
export function resetGridFocus(): void {
  gridFocusIndex = 0;
}

export function renderMainMenuGrid(): void {
  const overlay = getOverlay();
  overlay.innerHTML = '';
  overlay.className = '';

  const cell = overlay.insertRow().insertCell();
  cell.style.padding = '0';

  const grid = document.createElement('div');
  grid.className = 'cheat-menu-grid';
  cell.appendChild(grid);

  for (const menuEntry of getMenus()) {
    const button = document.createElement('button');
    button.className = 'cheat-menu-grid-button';
    button.textContent = menuEntry.name;

    button.onclick = () => {
      SoundManager.playSystemSound(0);
      store.currentMenuId = menuEntry.id;
      updateMenu();
    };

    grid.appendChild(button);
  }

  const buttons = Array.from(
    grid.querySelectorAll<HTMLElement>('.cheat-menu-grid-button'),
  );
  if (buttons.length) {
    gridFocusIndex = Math.min(gridFocusIndex, buttons.length - 1);
    buttons[gridFocusIndex].focus();
  }

  grid.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    event.stopPropagation();
    const idx = buttons.indexOf(getMenuDocument().activeElement as HTMLElement);
    const current = idx >= 0 ? idx : gridFocusIndex;
    const next = event.shiftKey
      ? current <= 0
        ? buttons.length - 1
        : current - 1
      : current >= buttons.length - 1
        ? 0
        : current + 1;
    gridFocusIndex = next;
    buttons[next].focus();
  });
}
