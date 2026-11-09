import { KEYS } from '../../input/keymap.ts';
import { findMenu, getMenus } from '../../registry.ts';
import { store } from '../../store.ts';
import { updateMenu } from '../render.ts';
import type { Direction } from './scrollSelector.ts';
import { appendScrollSelector } from './scrollSelector.ts';
import { appendTitle } from './text.ts';

/** Switches to the previous / next sub-menu (wraps around). */
export function scrollCheat(direction: Direction): void {
  const menus = getMenus();
  const len = menus.length;
  if (len === 0) return;
  const found = menus.findIndex((m) => m.id === store.currentMenuId);
  const current = found === -1 ? 0 : found;
  const next =
    direction === 'left'
      ? current <= 0
        ? len - 1
        : current - 1
      : current >= len - 1
        ? 0
        : current + 1;
  store.currentMenuId = menus[next].id;
  SoundManager.playSystemSound(0);
  updateMenu();
}

/** "Cheat" title with the current sub-menu name, ←[2] / [3]→ switch menus. */
export function appendCheatTitle(): void {
  const name = findMenu(store.currentMenuId)?.entry.name ?? '';
  appendTitle('Cheat');
  appendScrollSelector(name, KEYS.KEY_2, KEYS.KEY_3, scrollCheat);
}
