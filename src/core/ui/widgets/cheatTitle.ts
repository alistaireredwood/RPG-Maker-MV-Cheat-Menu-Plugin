import { KEYS } from '@src/core/input/keymap.ts';
import { findMenu } from '@src/core/registry.ts';
import { store } from '@src/core/store.ts';
import { navigationMenuIds } from '@src/core/ui/menuLayout.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import type { Direction } from './scrollSelector.ts';
import { appendScrollSelector } from './scrollSelector.ts';
import { appendTitle } from './text.ts';

export function scrollCheat(direction: Direction): void {
  const ids = navigationMenuIds();
  const len = ids.length;
  if (len === 0) return;
  const step = direction === 'left' ? -1 : 1;
  // a Hidden menu can still be open (hidden while it was open)
  const found = ids.indexOf(store.currentMenuId ?? '');
  const next =
    found === -1 ? (step > 0 ? 0 : len - 1) : (found + step + len) % len;
  store.currentMenuId = ids[next];
  SoundManager.playSystemSound(0);
  updateMenu();
}

export function appendCheatTitle(): void {
  const name = findMenu(store.currentMenuId)?.entry.name ?? '';
  appendTitle('Cheat');
  appendScrollSelector(name, KEYS.KEY_2, KEYS.KEY_3, scrollCheat).classList.add(
    'cheat-menu-current',
  );
}
