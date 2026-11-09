import { forceGameActive, releaseGameActive } from '../engine/gameActive.ts';
import { store } from '../store.ts';
import { getOverlay, getStylesheetHref } from './dom.ts';
import { positionMenu } from './position.ts';
import { updateMenu } from './render.ts';

// Pop-out mode: moves the cheat menu overlay into a separate native NW.js
// window so it no longer covers the game screen. The window shares the game's
// JS context (new_instance: false), so every feature keeps working unchanged —
// only the overlay's host document differs.

const POPOUT_OPTIONS = {
  title: 'Cheat Menu',
  width: 380,
  height: 640,
  min_width: 260,
  min_height: 200,
  always_on_top: true,
  focus: true,
  new_instance: false,
};

let popoutWin: NWWindow | null = null;
let onPopupKeyDown: (event: KeyboardEvent) => void = () => {};

const isNwjs = () => typeof nw !== 'undefined' && !!nw?.Window?.open;

export const canPopout = isNwjs;

/** Document currently hosting the overlay — use it instead of the global `document`. */
export const getMenuDocument = (): Document =>
  store.isPoppedOut && popoutWin ? popoutWin.window.document : document;

export const getMenuWindow = (): Window =>
  getMenuDocument().defaultView ?? window;

const SETUP_MARK = '__cheatMenuPopoutReady';
const WATCH_INTERVAL_MS = 200;
const ATTACH_TIMEOUT_MS = 5000;

let watchTimer: ReturnType<typeof setInterval> | null = null;

const stopWatch = () => {
  if (watchTimer) clearInterval(watchTimer);
  watchTimer = null;
};

// Builds the popup page once per *document*. The document can be swapped out
// after nw.Window.open's callback (the initial empty document gets replaced
// when about:blank commits), so this must be re-runnable on a fresh one.
const setupPopoutDocument = (popupWindow: Window, doc: Document) => {
  // doc.write gives a standards-mode page with a guaranteed <head>/<body>
  // (a bare about:blank is quirks mode and may not have them yet)
  doc.open();
  doc.write(
    '<!doctype html><html><head><meta charset="utf-8"></head>' +
      '<body class="cheat-menu-popout"></body></html>',
  );
  doc.close();

  doc.title = POPOUT_OPTIONS.title;

  // the stylesheet href is already resolved to an absolute URL, so it works
  // regardless of the popup's base URL (about:blank)
  const css = doc.createElement('link');
  css.rel = 'stylesheet';
  css.type = 'text/css';
  css.href = getStylesheetHref();
  doc.head.appendChild(css);

  // the game's own keydown listener only sees the game window; route the
  // popup's key presses through the same handlers
  popupWindow.addEventListener('keydown', (event) => onPopupKeyDown(event));

  (doc as unknown as Record<string, boolean>)[SETUP_MARK] = true;
  console.log(
    `[CheatMenu] Pop-out document ready (${doc.URL}, ${doc.readyState})`,
  );
};

/**
 * Makes sure the live popup document is set up and hosts the overlay.
 * Returns false while the popup isn't reachable yet.
 */
const ensureAttached = (): boolean => {
  if (!popoutWin) return false;

  let popupWindow: Window | undefined;
  let doc: Document | undefined;
  try {
    popupWindow = popoutWin.window;
    doc = popupWindow?.document;
  } catch (e) {
    // cross-origin access denied — retrying won't help
    console.error('[CheatMenu] Cannot access pop-out document:', e);
    closePopout(true);
    return false;
  }
  if (!popupWindow || !doc) return false;

  if (!(doc as unknown as Record<string, boolean>)[SETUP_MARK]) {
    setupPopoutDocument(popupWindow, doc);
  }
  if (!doc.body) return false;

  const overlay = getOverlay();
  if (store.isOpen && overlay.parentNode !== doc.body) {
    doc.body.appendChild(overlay);
    updateMenu();
  }
  return true;
};

export function openPopout(): void {
  if (store.isPoppedOut) {
    popoutWin?.focus();
    return;
  }
  if (!isNwjs()) {
    console.warn(
      '[CheatMenu] Pop-out window requires NW.js — staying in overlay mode.',
    );
    return;
  }

  nw.Window.open('about:blank', POPOUT_OPTIONS, (win) => {
    popoutWin = win;
    store.isPoppedOut = true;
    forceGameActive();

    // closed via the window's X button → close the menu (F7 is the way to
    // dock back into the game window). Programmatic closes already cleared
    // popoutWin, so this is a no-op for them.
    win.on('closed', () => {
      if (popoutWin === win) closePopout(false);
    });
    win.on('loaded', () => ensureAttached());

    // don't rely on event ordering: keep re-checking while popped out, which
    // also re-attaches the overlay if the popup's document gets replaced
    let attachedOnce = false;
    const startedAt = Date.now();
    stopWatch();
    watchTimer = setInterval(() => {
      if (ensureAttached()) {
        attachedOnce = true;
      } else if (!attachedOnce && Date.now() - startedAt > ATTACH_TIMEOUT_MS) {
        console.error(
          '[CheatMenu] Pop-out window never became ready — docking back.',
        );
        closePopout(true);
      }
    }, WATCH_INTERVAL_MS);
    ensureAttached();
  });
}

/**
 * Closes the pop-out window and moves the overlay back into the game window.
 * `keepMenuOpen` decides whether the overlay reappears in-game (F7 dock) or
 * the whole menu closes (window X button / menu toggle key).
 */
export function closePopout(keepMenuOpen = false): void {
  const win = popoutWin;
  popoutWin = null;
  const wasPoppedOut = store.isPoppedOut;
  store.isPoppedOut = false;
  stopWatch();
  releaseGameActive();

  const overlay = getOverlay();
  overlay.remove();
  try {
    win?.close(true);
  } catch {
    // window already gone
  }

  if (!wasPoppedOut) return;

  if (keepMenuOpen && store.isOpen) {
    document.body.appendChild(overlay);
    updateMenu();
  } else {
    store.isOpen = false;
    positionMenu(); // shows the in-game indicator again
  }
}

export function togglePopout(): void {
  if (store.isPoppedOut) {
    closePopout(true);
  } else if (isNwjs()) {
    // overlay leaves the game window now; setupPopoutDocument re-attaches it
    getOverlay().remove();
    openPopout();
  } else {
    openPopout(); // logs the "requires NW.js" warning
    return;
  }
  SoundManager.playSystemSound(0);
}

export function installPopout(options: {
  onKeyDown: (event: KeyboardEvent) => void;
}): void {
  onPopupKeyDown = options.onKeyDown;
  // F5 reload / game shutdown — don't leave an orphaned window behind holding
  // references to the old context
  window.addEventListener('beforeunload', () => closePopout());
}
