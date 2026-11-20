import { bindKey } from '@src/core/input/keyListeners.ts';
import type { ActionKey } from '@src/core/input/keymap.ts';
import { getOverlay } from '@src/core/ui/dom.ts';
import { keyHint } from './keyHint.ts';

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

export function bindArrows(
  leftButton: HTMLElement,
  rightButton: HTMLElement,
  key1: ActionKey,
  key2: ActionKey,
  scrollHandler: ScrollHandler,
): void {
  leftButton.innerHTML = '←' + keyHint(key1);
  rightButton.innerHTML = keyHint(key2) + '→';
  leftButton.addEventListener('mousedown', scrollHandler.bind(null, 'left'));
  rightButton.addEventListener('mousedown', scrollHandler.bind(null, 'right'));
  bindKey(key1, scrollHandler.bind(null, 'left'));
  bindKey(key2, scrollHandler.bind(null, 'right'));
}

export type ArrowRow = {
  left: HTMLElement;
  value: HTMLElement;
  right: HTMLElement;
};

export function appendArrowRow(): ArrowRow {
  const row = getOverlay().insertRow();
  row.className = 'scroll-selector-row';
  const cell = row.insertCell();
  cell.colSpan = 3;
  cell.className = 'cheat-menu-cell cheat-menu-arrow-cell';

  const box = document.createElement('div');
  box.className = 'cheat-menu-arrow-row';
  const left = document.createElement('span');
  left.className = 'scroll-selector-buttons';
  const value = document.createElement('div');
  value.className = 'cheat-menu-arrow-value';
  const right = document.createElement('span');
  right.className = 'scroll-selector-buttons';
  box.append(left, value, right);
  cell.appendChild(box);

  return { left, value, right };
}

export function appendScrollSelector(
  text: string | number,
  key1: ActionKey,
  key2: ActionKey,
  scrollHandler: ScrollHandler,
  selectable?: boolean,
  showArrows = true,
): HTMLElement {
  const {
    left: scrollLeftButton,
    value: scrollText,
    right: scrollRightButton,
  } = appendArrowRow();
  if (selectable) scrollText.classList.add('cheat-menu-selectable');

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

  if (showArrows) {
    bindArrows(scrollLeftButton, scrollRightButton, key1, key2, scrollHandler);
  }
  return scrollText;
}
