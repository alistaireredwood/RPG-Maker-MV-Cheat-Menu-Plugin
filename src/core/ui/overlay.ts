import { clearKeyBindings } from '@src/core/input/keyListeners.ts';
import { findMenu, renderMenuEntry } from '@src/core/registry.ts';
import { store } from '@src/core/store.ts';
import { createMenuBuilder } from './builder.ts';
import {
  getIndicator,
  getOverlay,
  installIndicator,
  installStylesheet,
} from './dom.ts';
import { renderMainMenuGrid, resetGridFocus } from './grid.ts';
import { closePopout, getMenuDocument } from './popout.ts';
import { positionMenu } from './position.ts';
import { runUpdating, setRenderer } from './render.ts';
import { appendBackButton, appendTopBar } from './topBar.ts';
import { appendDescription, appendTitle } from './widgets/text.ts';

const RENDER_INTERVAL_MS = 1000;

let prevMenuId: string | null = null;
let renderTimer: ReturnType<typeof setInterval> | null = null;

function renderMenu(): void {
  runUpdating(() => {
    clearKeyBindings();

    // a stale/unknown id (e.g. restored from a save, feature removed) would
    // render an empty overlay — fall back to the main grid instead
    const menu = findMenu(store.currentMenuId);
    if (!menu) store.currentMenuId = null;

    const prev = prevMenuId;
    prevMenuId = store.currentMenuId;

    const overlay = getOverlay();
    if (!menu) {
      if (prev !== null) resetGridFocus();
      renderMainMenuGrid();
    } else {
      overlay.innerHTML = '';
      overlay.className = 'cheat-menu-text';

      appendBackButton();

      try {
        renderMenuEntry(menu.entry.id, createMenuBuilder());
      } catch (e) {
        // a game can override engine APIs a feature relies on — show the
        // failure inside the menu instead of leaving it half-rendered
        console.error(`[CheatMenu] "${menu.entry.name}" render failed:`, e);
        appendTitle(menu.entry.name);
        appendDescription(
          `<span class="error-text">Render failed: ${e instanceof Error ? e.message : e}<br>See console (F8) for details.</span>`,
        );
      }
    }

    appendTopBar();
    positionMenu();
  });
}

export function openMenu(): void {
  store.isOpen = true;
  getMenuDocument().body.appendChild(getOverlay());
  renderMenu();
  SoundManager.playSystemSound(1);
}

export function closeMenu(): void {
  if (store.isPoppedOut) closePopout();
  store.isOpen = false;
  getOverlay().remove();
  SoundManager.playSystemSound(2);
  const indicator = getIndicator();
  if (indicator) indicator.style.display = '';
}

/** Closes everything without sound — the game is being reset / reloaded. */
export function resetOverlay(): void {
  store.isOpen = false;
  closePopout();
  getOverlay().remove();
}

/**
 * Re-renders an open sub-menu every second so values changed by the game show
 * up. Skips the main grid (would re-trigger the hover pulse) and ticks where a
 * rebuild would destroy what the user is doing.
 */
export function startRenderTimer(): void {
  if (renderTimer) clearInterval(renderTimer);
  renderTimer = setInterval(() => {
    if (!store.isOpen || store.currentMenuId === null) return;

    const overlay = getOverlay();
    const menuDoc = getMenuDocument();

    // a periodic rebuild would wipe out any text the user is mid-selecting
    // (e.g. double-clicking a name to copy it)
    const selection = menuDoc.getSelection();
    const hasSelectionInMenu =
      !!selection &&
      !selection.isCollapsed &&
      !!selection.anchorNode &&
      overlay.contains(selection.anchorNode);

    // <input>/<textarea> selections (e.g. double-clicking the Amount
    // field) live in selectionStart/End, not in window.getSelection()
    const active = menuDoc.activeElement as HTMLInputElement | null;
    const hasInputSelection =
      !!active &&
      (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') &&
      overlay.contains(active) &&
      active.selectionStart !== active.selectionEnd;

    // rebuilding a focused <textarea> (code input) would reset its undo
    // history and scroll position every second
    const isEditingTextarea =
      !!active && active.tagName === 'TEXTAREA' && overlay.contains(active);

    if (hasSelectionInMenu || hasInputSelection || isEditingTextarea) return;

    renderMenu();
  }, RENDER_INTERVAL_MS);
}

export function installUi(): void {
  getOverlay();
  installStylesheet();
  installIndicator();
  setRenderer(renderMenu);
  // set initial indicator position/text before the menu is ever opened
  positionMenu();
  window.addEventListener('resize', () => positionMenu());
}
