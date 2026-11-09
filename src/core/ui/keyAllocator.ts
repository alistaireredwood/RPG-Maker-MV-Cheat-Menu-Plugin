import type { ActionKey } from '@src/core/input/keymap.ts';

/**
 * Keys handed out to a sub-menu's actions, in order. 1 toggles the menu and
 * 2/3 switch sub-menus, so actions start at 4.
 */
export const ACTION_KEYS: readonly ActionKey[] = [
  4,
  5,
  6,
  7,
  8,
  9,
  0,
  '-',
  '=',
];

export type KeyAllocator = {
  /** Next free key; throws when the menu has more actions than keys. */
  next: () => ActionKey;
  /** Leaves `count` keys unused (keeps a key stable when a row is hidden). */
  skip: (count?: number) => void;
};

export function createKeyAllocator(
  keys: readonly ActionKey[] = ACTION_KEYS,
): KeyAllocator {
  let index = 0;
  return {
    next() {
      if (index >= keys.length) {
        throw new Error(
          `[CheatMenu] menu needs more than ${keys.length} action keys`,
        );
      }
      return keys[index++];
    },
    skip(count = 1) {
      index += count;
    },
  };
}
