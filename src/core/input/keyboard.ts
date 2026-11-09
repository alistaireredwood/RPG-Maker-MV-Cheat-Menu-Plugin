import { restoreSession } from '../session.ts';
import { store } from '../store.ts';
import { closeMenu, openMenu } from '../ui/overlay.ts';
import { togglePopout } from '../ui/popout.ts';
import { cyclePosition } from '../ui/position.ts';
import { updateMenu } from '../ui/render.ts';
import { dispatchBoundKey } from './keyListeners.ts';
import { KEYS } from './keymap.ts';

// F8: open dev tools, also in games that block them outside playtest
function handleShowDevTools(event: KeyboardEvent): void {
  if (
    !event.ctrlKey &&
    !event.altKey &&
    event.key === KEYS.F8 &&
    $gameTemp &&
    !$gameTemp.isPlaytest()
  ) {
    event.stopPropagation();
    event.preventDefault();
    try {
      // NW.js runtime module, not bundled
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const gui = require('nw.gui');

      gui.Window.get().showDevTools();
    } catch (e) {
      console.warn("[CheatMenu] Failed to load 'nw.gui' for DevTools:", e);
    }
  }
}

// F9: the engine opens its debug menu only in playtest — fake it briefly
function handleShowRpgMakerDebug(event: KeyboardEvent): void {
  if (
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    event.key === KEYS.F9 &&
    $gameTemp &&
    !$gameTemp.isPlaytest()
  ) {
    const temp = $gameTemp as unknown as { _isPlaytest: boolean };
    temp._isPlaytest = true;

    setTimeout(function () {
      temp._isPlaytest = false;
    }, 100);
  }
}

function handleMenuKeys(event: KeyboardEvent): void {
  if (
    !store.isOverlayOpenable ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  ) {
    return;
  }

  if (event.key === KEYS.KEY_1) {
    if (!store.restored) restoreSession();

    if (!store.isOpen) openMenu();
    else closeMenu();
    return;
  }

  if (!store.isOpen) return;

  if (event.key === KEYS.F7) {
    event.preventDefault();
    togglePopout();
  } else if (event.key === KEYS.TILDE) {
    // screen positions are meaningless inside the pop-out window
    if (store.isPoppedOut) return;
    cyclePosition();
    updateMenu();
  } else {
    dispatchBoundKey(event);
  }
}

/** Shared by the game window and the pop-out window. */
export function onKeyDown(event: KeyboardEvent): void {
  handleShowDevTools(event);
  handleShowRpgMakerDebug(event);
  handleMenuKeys(event);
}

export function installKeyboard(): void {
  window.addEventListener('keydown', (event) => onKeyDown(event));
}
