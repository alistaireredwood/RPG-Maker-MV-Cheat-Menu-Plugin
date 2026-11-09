import { KEYS } from '../input/keymap.ts';
import { store } from '../store.ts';
import { getIndicator, getOverlay } from './dom.ts';

const POSITIONS: [string, string, string, string][] = [
  // [left, top, right, bottom]
  ['50%', '50%', '', ''], // 0: center
  ['5px', '5px', '', ''], // 1: top-left
  ['', '5px', '5px', ''], // 2: top-right
  ['', '', '5px', '5px'], // 3: bottom-right
  ['5px', '', '', '5px'], // 4: bottom-left
];

/** Moves the menu to the next screen corner (tilde key). */
export function cyclePosition(): void {
  store.position =
    store.position >= POSITIONS.length - 1 ? 0 : store.position + 1;
}

export function positionMenu(): void {
  const pos = POSITIONS[store.position] ?? POSITIONS[1];
  const overlay = getOverlay();
  const indicator = getIndicator();

  if (store.isPoppedOut) {
    // the pop-out window lays the overlay out via .cheat-menu-popout CSS
    overlay.style.left =
      overlay.style.top =
      overlay.style.right =
      overlay.style.bottom =
        '';
    overlay.style.transform = '';
    if (indicator) indicator.style.display = 'none';
    return;
  }

  overlay.style.left = pos[0];
  overlay.style.top = pos[1];
  overlay.style.right = pos[2];
  overlay.style.bottom = pos[3];
  overlay.style.transform = store.position === 0 ? 'translate(-50%, -50%)' : '';

  if (indicator) {
    indicator.style.left = pos[0];
    indicator.style.top = pos[1];
    indicator.style.right = pos[2];
    indicator.style.bottom = pos[3];
    indicator.textContent = `[${KEYS.KEY_1}]`;
    indicator.style.display = store.isOpen ? 'none' : '';
  }
}
