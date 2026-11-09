const STYLESHEET_URL = 'js/plugins/Cheat_Menu.css';
const INDICATOR_ID = 'cheat-menu-indicator';

let overlay: HTMLTableElement | null = null;
let stylesheet: HTMLLinkElement | null = null;

/** The menu's root element. It moves between the game and pop-out documents. */
export function getOverlay(): HTMLTableElement {
  if (!overlay) {
    overlay = document.createElement('table');
    overlay.id = 'cheat-menu-text';
    // clicks inside the menu must not reach the game (e.g. touch-to-move)
    overlay.addEventListener('mousedown', (event) => event.stopPropagation());
  }
  return overlay;
}

export function installStylesheet(): void {
  if (stylesheet) return;
  stylesheet = document.createElement('link');
  stylesheet.type = 'text/css';
  stylesheet.rel = 'stylesheet';
  stylesheet.href = STYLESHEET_URL;
  document.head.appendChild(stylesheet);
}

/** Absolute stylesheet URL — usable from documents with another base URL. */
export const getStylesheetHref = (): string =>
  stylesheet?.href ?? STYLESHEET_URL;

/** The small "[1]" hint shown in the game window while the menu is closed. */
export function installIndicator(): void {
  if (document.getElementById(INDICATOR_ID)) return;
  const indicator = document.createElement('div');
  indicator.id = INDICATOR_ID;
  document.body.appendChild(indicator);
}

export const getIndicator = (): HTMLElement | null =>
  document.getElementById(INDICATOR_ID);
