import { bindKey } from '@src/core/input/keyListeners.ts';
import { KEYS, type ActionKey } from '@src/core/input/keymap.ts';
import { findMenu } from '@src/core/registry.ts';
import { store } from '@src/core/store.ts';
import { getOverlay } from '@src/core/ui/dom.ts';
import { navigationMenuIds } from '@src/core/ui/menuLayout.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import { keyHint } from './keyHint.ts';
import type { Direction } from './scrollSelector.ts';

function adjacentMenuId(direction: Direction): string | null {
  const ids = navigationMenuIds();
  const len = ids.length;
  if (len === 0) return null;
  const step = direction === 'left' ? -1 : 1;
  // a Hidden menu can still be open (hidden while it was open)
  const found = ids.indexOf(store.currentMenuId ?? '');
  const next =
    found === -1 ? (step > 0 ? 0 : len - 1) : (found + step + len) % len;
  return ids[next];
}

function scrollCheat(direction: Direction): void {
  const id = adjacentMenuId(direction);
  if (id === null) return;
  store.currentMenuId = id;
  SoundManager.playSystemSound(0);
  updateMenu();
}

function navLink(direction: Direction, key: ActionKey): HTMLElement {
  const link = document.createElement('span');
  link.className = 'scroll-selector-buttons cheat-menu-nav-link';

  const name = document.createElement('span');
  name.className = 'cheat-menu-nav-name';
  name.textContent = findMenu(adjacentMenuId(direction))?.entry.name ?? '';

  if (direction === 'left') {
    link.innerHTML = '←' + keyHint(key);
    link.appendChild(name);
  } else {
    link.appendChild(name);
    link.insertAdjacentHTML('beforeend', keyHint(key) + '→');
  }

  const scroll = () => scrollCheat(direction);
  link.addEventListener('mousedown', scroll);
  bindKey(key, scroll);
  return link;
}

export function appendCheatTitle(): void {
  const cell = getOverlay().insertRow().insertCell();
  cell.colSpan = 3;
  cell.className = 'cheat-menu-cell cheat-menu-arrow-cell';

  const nav = document.createElement('div');
  nav.className = 'cheat-menu-nav';
  nav.append(navLink('left', KEYS.KEY_2), navLink('right', KEYS.KEY_3));
  cell.appendChild(nav);
}
