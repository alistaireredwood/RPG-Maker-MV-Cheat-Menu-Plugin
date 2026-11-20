import { store } from '@src/core/store.ts';
import { getOverlay } from './dom.ts';
import { isLayoutEditing, toggleLayoutEditing } from './grid.ts';
import { ICON_EDIT, ICON_POP_IN, ICON_POP_OUT } from './icons.ts';
import { canPopout, togglePopout } from './popout.ts';
import { updateMenu } from './render.ts';

function topBarButton(
  icon: string,
  title: string,
  active: boolean,
  onClick: () => void,
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = active
    ? 'cheat-menu-topbar-button active'
    : 'cheat-menu-topbar-button';
  button.title = title;
  button.innerHTML = icon;
  button.tabIndex = -1;
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    onClick();
  });
  return button;
}

export function appendTopBar(): void {
  const row = getOverlay().insertRow(0);
  const cell = row.insertCell();
  cell.colSpan = 3;
  cell.className = 'cheat-menu-topbar-cell';

  const bar = document.createElement('div');
  bar.className = 'cheat-menu-topbar';
  cell.appendChild(bar);

  const editing = store.currentMenuId === null && isLayoutEditing();
  if (store.currentMenuId === null) {
    const title = document.createElement('span');
    title.className = 'cheat-menu-topbar-title';
    title.textContent = editing ? 'Cheat Menu · edit layout' : 'Cheat Menu';
    bar.appendChild(title);
  } else {
    bar.appendChild(backButton());
  }

  const actions = document.createElement('div');
  actions.className = 'cheat-menu-topbar-actions';
  bar.appendChild(actions);

  if (store.currentMenuId === null) {
    actions.appendChild(
      topBarButton(
        ICON_EDIT,
        editing ? 'Done editing layout' : 'Edit layout: order, groups, hide',
        editing,
        toggleLayoutEditing,
      ),
    );
  }

  if (!canPopout()) return;

  const poppedOut = store.isPoppedOut;
  actions.appendChild(
    topBarButton(
      poppedOut ? ICON_POP_IN : ICON_POP_OUT,
      poppedOut
        ? 'Pop in — back to game window [F7]'
        : 'Pop out to separate window [F7]',
      false,
      togglePopout,
    ),
  );
}

function backButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'cheat-menu-back-button';
  button.innerHTML = '&larr; Back to Main Menu';
  button.tabIndex = -1;
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    SoundManager.playSystemSound(1);
    store.currentMenuId = null;
    updateMenu();
  });
  return button;
}
