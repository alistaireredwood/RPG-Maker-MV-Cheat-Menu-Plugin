import type { ActionKey } from '@src/core/input/keymap.ts';
import { getOverlay } from './dom.ts';
import { createKeyAllocator } from './keyAllocator.ts';
import {
  appendButton,
  appendButtonRow,
  appendButtons,
  type ButtonRow,
  type RowButton,
} from './widgets/buttons.ts';
import { appendCheat, type CheatLayout } from './widgets/cheat.ts';
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
  type TitleOptions,
} from './widgets/text.ts';
import type { NumberAccept } from './widgets/numberText.ts';
import {
  appendValueInput,
  appendValueInputPair,
  type ValueField,
} from './widgets/valueInput.ts';

/**
 * What a sub-menu's `render` draws with. Widgets that react to keys take the
 * next free action key (4, 5, 6, …) — `render` never hard-codes key numbers.
 */
export type MenuBuilder = {
  nextKey: () => ActionKey;
  /** Leaves keys unused, e.g. so later rows keep their key when one is hidden. */
  skipKeys: (count?: number) => void;

  /** Sub-menu switcher: the previous / next menu at keys 2 / 3 (not allocated). */
  cheatTitle: () => void;
  /** Section title. `actions`: icon buttons on the right, mouse only, no keys. */
  title: (text: string, sideText?: string, options?: TitleOptions) => void;
  /** Text over the full width of the menu. */
  description: (html: string) => void;
  /** Same as `description`; kept so extensions calling it still work. */
  wideDescription: (html: string) => void;
  /**
   * Label + clickable status button. Takes 1 key, or `key` reserved earlier
   * with `nextKey()` (keeps it stable when rows above it come and go).
   * `value`: shown in the middle column, e.g. a count the button acts on.
   * `wide`: the button takes the middle column too, aligned right — for long
   * statuses such as map names.
   */
  cheat: (
    label: string,
    status: string | number | boolean | null,
    onActivate: (event?: MouseEvent) => void,
    options?: { key?: ActionKey } & CheatLayout,
  ) => ActionKey;
  /** One full-width button. Takes 1 key (or `key`). */
  button: (button: RowButton, options?: { key?: ActionKey }) => void;
  /** A wide main button + a side button in one row. Takes 2 keys (or `keys`). */
  buttons: (
    main: RowButton,
    side: RowButton,
    options?: { keys?: readonly [ActionKey, ActionKey] },
  ) => void;
  /**
   * 2 or 3 equal buttons, one per column, the outer ones at the menu's edges.
   * Takes 1 key per button, in order (or `keys`).
   */
  buttonRow: (
    buttons: ButtonRow,
    options?: { keys?: readonly ActionKey[] },
  ) => void;
  /** Adds `className` to every row drawn by `render`, e.g. for spacing. */
  section: (className: string, render: () => void) => void;
  /** `←  text  →` row. Takes 2 keys when it shows arrows. */
  scrollSelector: (
    text: string | number,
    onScroll: ScrollHandler,
    options?: { selectable?: boolean; showArrows?: boolean },
  ) => void;
  /**
   * Editable value with ←/→. Takes 2 keys when it shows arrows. `accept`
   * limits typing to the characters of a number. `wide`: the field takes the
   * full width instead of a value's narrow one — for text such as a name.
   */
  valueInput: (
    value: string,
    inputKey: string,
    onCommit: (text: string) => boolean | void,
    onScroll: ScrollHandler,
    options?: { showArrows?: boolean; accept?: NumberAccept; wide?: boolean },
  ) => void;
  /** Two inputs in one row, e.g. a min – max range. Takes no keys. */
  valueInputPair: (
    left: ValueField,
    right: ValueField,
    separator?: string,
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
    wideDescription: appendDescription,

    cheat(label, status, onActivate, options = {}) {
      const key = options.key ?? keys.next();
      appendCheat(label, status, key, onActivate, options);
      return key;
    },

    button(button, options = {}) {
      appendButton(button, options.key ?? keys.next());
    },

    buttons(main, side, options = {}) {
      const [mainKey, sideKey] = options.keys ?? [keys.next(), keys.next()];
      appendButtons(main, side, mainKey, sideKey);
    },

    buttonRow(buttons, options = {}) {
      appendButtonRow(buttons, options.keys ?? buttons.map(() => keys.next()));
    },

    section(className, render) {
      const rows = getOverlay().rows;
      const first = rows.length;
      render();
      for (let i = first; i < rows.length; i++) {
        rows[i].classList.add(className);
        if (i === first) rows[i].classList.add('cheat-menu-section-first');
        if (i === rows.length - 1) {
          rows[i].classList.add('cheat-menu-section-last');
        }
      }
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
      appendValueInput(value, inputKey, onCommit, left, right, onScroll, {
        showArrows,
        accept: options.accept,
        wide: options.wide,
      });
    },

    valueInputPair(left, right, separator = '–') {
      appendValueInputPair(left, right, separator);
    },

    codeInput: appendCodeInput,
    searchInput: appendSearchInput,
  };
}
