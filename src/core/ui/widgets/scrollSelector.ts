import { bindKey } from '../../input/keyListeners.ts';
import type { ActionKey } from '../../input/keymap.ts';
import { getOverlay } from '../dom.ts';

export type Direction = 'left' | 'right';
export type ScrollHandler = (direction: Direction, event?: MouseEvent) => void;

const CJK_RE =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

function wrapWords(el: HTMLElement): void {
  const doc = el.ownerDocument;
  const walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  for (const node of textNodes) {
    const fragment = doc.createDocumentFragment();
    for (const part of (node.textContent ?? '').split(/(\s+)/)) {
      if (part === '') continue;
      if (/^\s+$/.test(part) || CJK_RE.test(part)) {
        fragment.appendChild(doc.createTextNode(part));
      } else {
        const word = doc.createElement('span');
        word.className = 'cheat-menu-word';
        word.textContent = part;
        fragment.appendChild(word);
      }
    }
    node.replaceWith(fragment);
  }
}

/** Binds ←/→ buttons and their keys to `scrollHandler('left' | 'right')`. */
export function bindArrows(
  leftButton: HTMLElement,
  rightButton: HTMLElement,
  key1: ActionKey,
  key2: ActionKey,
  scrollHandler: ScrollHandler,
): void {
  leftButton.innerHTML = '←[' + key1 + ']';
  rightButton.innerHTML = '[' + key2 + ']→';
  leftButton.addEventListener('mousedown', scrollHandler.bind(null, 'left'));
  rightButton.addEventListener('mousedown', scrollHandler.bind(null, 'right'));
  bindKey(key1, scrollHandler.bind(null, 'left'));
  bindKey(key2, scrollHandler.bind(null, 'right'));
}

/** `←[key1]  text  [key2]→` row. */
export function appendScrollSelector(
  text: string | number,
  key1: ActionKey,
  key2: ActionKey,
  scrollHandler: ScrollHandler,
  selectable?: boolean,
  showArrows = true,
): void {
  const scrollSelector = getOverlay().insertRow();
  scrollSelector.className = 'scroll-selector-row';

  const scrollLeftButton = scrollSelector.insertCell();
  scrollLeftButton.className = 'scroll-selector-buttons cheat-menu-cell';

  const scrollText = scrollSelector.insertCell();
  scrollText.className = selectable
    ? 'cheat-menu-cell cheat-menu-selectable'
    : 'cheat-menu-cell';

  const scrollRightButton = scrollSelector.insertCell();
  scrollRightButton.className = 'scroll-selector-buttons cheat-menu-cell';

  if (selectable) {
    const box = document.createElement('div');
    box.className = 'cheat-menu-name';
    const inner = document.createElement('div');
    inner.className = 'cheat-menu-name-text';
    inner.innerHTML = text + '';
    wrapWords(inner);
    box.title = inner.textContent ?? '';
    box.appendChild(inner);
    scrollText.appendChild(box);
  } else {
    scrollText.innerHTML = text + '';
  }

  if (!showArrows) return;

  bindArrows(scrollLeftButton, scrollRightButton, key1, key2, scrollHandler);
}
