import type { ActionKey } from '@src/core/input/keymap.ts';
import { createKeyAllocator } from './keyAllocator.ts';
import { appendCheat } from './widgets/cheat.ts';
import { appendCheatTitle } from './widgets/cheatTitle.ts';
import { appendCodeInput } from './widgets/codeInput.ts';
import {
  appendScrollSelector,
  type ScrollHandler,
} from './widgets/scrollSelector.ts';
import { appendSearchInput } from './widgets/searchInput.ts';
import {
  appendDescription,
  appendTitle,
  appendWideDescription,
} from './widgets/text.ts';
import { appendValueInput } from './widgets/valueInput.ts';

/**
 * What a sub-menu's `render` draws with. Widgets that react to keys take the
 * next free action key (4, 5, 6, …) — `render` never hard-codes key numbers.
 */
export type MenuBuilder = {
  nextKey: () => ActionKey;
  /** Leaves keys unused, e.g. so later rows keep their key when one is hidden. */
  skipKeys: (count?: number) => void;

  /** "Cheat" title + sub-menu switcher (keys 2/3, not allocated). */
  cheatTitle: () => void;
  title: (text: string, sideText?: string) => void;
  description: (html: string) => void;
  wideDescription: (html: string) => void;
  /** Label + clickable status button. Takes 1 key. */
  cheat: (
    label: string,
    status: string | number | boolean | null,
    onActivate: (event?: MouseEvent) => void,
  ) => ActionKey;
  /** `←  text  →` row. Takes 2 keys when it shows arrows. */
  scrollSelector: (
    text: string | number,
    onScroll: ScrollHandler,
    options?: { selectable?: boolean; showArrows?: boolean },
  ) => void;
  /** Editable value with ←/→. Takes 2 keys when it shows arrows. */
  valueInput: (
    value: string,
    inputKey: string,
    onCommit: (text: string) => boolean | void,
    onScroll: ScrollHandler,
    options?: { showArrows?: boolean },
  ) => void;
  codeInput: (
    inputKey: string,
    value: string,
    onChange: (text: string) => void,
    onSubmit: (text: string) => void,
    rows?: number,
  ) => void;
  searchInput: (
    placeholder: string,
    stateKey: string,
    onSearchChange?: (keyword: string) => void,
  ) => void;
};

export function createMenuBuilder(): MenuBuilder {
  const keys = createKeyAllocator();

  return {
    nextKey: keys.next,
    skipKeys: keys.skip,

    cheatTitle: appendCheatTitle,
    title: appendTitle,
    description: appendDescription,
    wideDescription: appendWideDescription,

    cheat(label, status, onActivate) {
      const key = keys.next();
      appendCheat(label, status, key, onActivate);
      return key;
    },

    scrollSelector(text, onScroll, options = {}) {
      const showArrows = options.showArrows ?? true;
      const [left, right] = showArrows ? [keys.next(), keys.next()] : ['', ''];
      appendScrollSelector(
        text,
        left,
        right,
        onScroll,
        options.selectable,
        showArrows,
      );
    },

    valueInput(value, inputKey, onCommit, onScroll, options = {}) {
      const showArrows = options.showArrows ?? true;
      const [left, right] = showArrows ? [keys.next(), keys.next()] : ['', ''];
      appendValueInput(
        value,
        inputKey,
        onCommit,
        left,
        right,
        onScroll,
        showArrows,
      );
    },

    codeInput: appendCodeInput,
    searchInput: appendSearchInput,
  };
}
