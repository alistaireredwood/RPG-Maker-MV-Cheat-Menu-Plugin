import { store } from '@src/core/store.ts';
import { getOverlay } from './dom.ts';
import { ICON_POP_IN, ICON_POP_OUT } from './icons.ts';
import { canPopout, togglePopout } from './popout.ts';
import { updateMenu } from './render.ts';

export function appendTopBar(): void {
  const row = getOverlay().insertRow(0);
  const cell = row.insertCell();
  cell.colSpan = 3;
  cell.className = 'cheat-menu-topbar-cell';

  const bar = document.createElement('div');
  bar.className = 'cheat-menu-topbar';
  cell.appendChild(bar);

  const title = document.createElement('span');
  title.className = 'cheat-menu-topbar-title';
  title.textContent = 'Cheat Menu';
  bar.appendChild(title);

  if (!canPopout()) return;

  const poppedOut = store.isPoppedOut;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'cheat-menu-topbar-button';
  button.title = poppedOut
    ? 'Pop in — back to game window [F7]'
    : 'Pop out to separate window [F7]';
  button.innerHTML = poppedOut ? ICON_POP_IN : ICON_POP_OUT;
  button.tabIndex = -1;
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    togglePopout();
  });
  bar.appendChild(button);
}

export function appendBackButton(): void {
  const backRow = getOverlay().insertRow(0);
  const backCell = backRow.insertCell();
  backCell.colSpan = 3;
  backCell.className = 'cheat-menu-back-button';
  backCell.innerHTML = `<span>&larr; Back to Main Menu</span>`;

  backCell.onclick = () => {
    SoundManager.playSystemSound(1);
    store.currentMenuId = null;
    updateMenu();
  };
}
