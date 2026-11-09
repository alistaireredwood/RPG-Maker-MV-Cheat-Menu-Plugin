import CheatMenu from '../CheatMenu';

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
let originalIsGameActive: (() => boolean) | null = null;

const isNwjs = () => typeof nw !== 'undefined' && !!nw?.Window?.open;

CheatMenu.isPoppedOut = false;

CheatMenu.getMenuDocument = () =>
  CheatMenu.isPoppedOut && popoutWin ? popoutWin.window.document : document;

// RPG Maker can pause/skip updates while its window is unfocused — clicking the
// pop-out would otherwise freeze the game. Report "active" while popped out.
const patchGameActive = () => {
  const sm = SceneManager as any;
  if (originalIsGameActive || typeof sm.isGameActive !== 'function') return;
  originalIsGameActive = sm.isGameActive;
  sm.isGameActive = () => true;
};

const restoreGameActive = () => {
  if (!originalIsGameActive) return;
  (SceneManager as any).isGameActive = originalIsGameActive;
  originalIsGameActive = null;
};

const setupPopoutDocument = (win: NWWindow) => {
  const popupWindow = win.window;
  const doc = popupWindow.document;

  doc.title = POPOUT_OPTIONS.title;
  doc.body.className = 'cheat-menu-popout';

  // styleCss.href is already resolved to an absolute URL, so it works
  // regardless of the popup's base URL (about:blank)
  const css = doc.createElement('link');
  css.rel = 'stylesheet';
  css.type = 'text/css';
  css.href = CheatMenu.styleCss.href;
  doc.head.appendChild(css);

  // the game's own keydown listener only sees the game window; route the
  // popup's key presses through the same handlers
  popupWindow.addEventListener('keydown', (event) => CheatMenu.onKeyDown(event));

  doc.body.appendChild(CheatMenu.overlay);
};

CheatMenu.openPopout = () => {
  if (CheatMenu.isPoppedOut) {
    popoutWin?.focus();
    return;
  }
  if (!isNwjs()) {
    console.warn('[CheatMenu] Pop-out window requires NW.js — staying in overlay mode.');
    return;
  }

  nw.Window.open('about:blank', POPOUT_OPTIONS, (win) => {
    let ready = false;
    const onReady = () => {
      if (ready) return;
      ready = true;
      try {
        popoutWin = win;
        CheatMenu.isPoppedOut = true;
        setupPopoutDocument(win);
        patchGameActive();
        CheatMenu.updateMenu();
      } catch (e) {
        console.error('[CheatMenu] Failed to set up pop-out window:', e);
        CheatMenu.closePopout(true);
      }
    };

    // closed via the window's X button → close the menu (F7 is the way to
    // dock back into the game window). Programmatic closes already cleared
    // popoutWin, so this is a no-op for them.
    win.on('closed', () => {
      if (popoutWin === win) {
        CheatMenu.closePopout(false);
      } else if (!ready && CheatMenu.isCheatMenuOpen) {
        // closed before it finished loading — put the overlay back in-game
        ready = true;
        document.body.appendChild(CheatMenu.overlay);
        CheatMenu.updateMenu();
      }
    });

    // about:blank may already be loaded by the time the callback runs
    if (win.window?.document?.readyState === 'complete') onReady();
    else win.on('loaded', onReady);
  });
};

/**
 * Closes the pop-out window and moves the overlay back into the game window.
 * `keepMenuOpen` decides whether the overlay reappears in-game (F7 dock) or
 * the whole menu closes (window X button / menu toggle key).
 */
CheatMenu.closePopout = (keepMenuOpen = false) => {
  const win = popoutWin;
  popoutWin = null;
  const wasPoppedOut = CheatMenu.isPoppedOut;
  CheatMenu.isPoppedOut = false;
  restoreGameActive();

  CheatMenu.overlay.remove();
  try {
    win?.close(true);
  } catch {
    // window already gone
  }

  if (!wasPoppedOut) return;

  if (keepMenuOpen && CheatMenu.isCheatMenuOpen) {
    document.body.appendChild(CheatMenu.overlay);
    CheatMenu.updateMenu();
  } else {
    CheatMenu.isCheatMenuOpen = false;
    CheatMenu.positionMenu(); // shows the in-game indicator again
  }
};

CheatMenu.togglePopout = () => {
  if (CheatMenu.isPoppedOut) {
    CheatMenu.closePopout(true);
  } else if (isNwjs()) {
    // overlay leaves the game window now; setupPopoutDocument re-attaches it
    CheatMenu.overlay.remove();
    CheatMenu.openPopout();
  } else {
    CheatMenu.openPopout(); // logs the "requires NW.js" warning
    return;
  }
  SoundManager.playSystemSound(0);
};

// F5 reload / game shutdown — don't leave an orphaned window behind holding
// references to the old context
window.addEventListener('beforeunload', () => CheatMenu.closePopout());
