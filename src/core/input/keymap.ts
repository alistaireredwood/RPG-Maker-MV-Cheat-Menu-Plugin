/** `KeyboardEvent.key` values the menu reacts to. */
export const KEYS = {
  KEY_0: '0',
  KEY_1: '1',
  KEY_2: '2',
  KEY_3: '3',
  KEY_4: '4',
  KEY_5: '5',
  KEY_6: '6',
  KEY_7: '7',
  KEY_8: '8',
  KEY_9: '9',
  MINUS: '-',
  EQUAL: '=',
  TILDE: '`',
  F1: 'F1',
  F7: 'F7',
  F8: 'F8',
  F9: 'F9',
} as const;

/** Key a sub-menu action can be bound to (shown as `[key]` in the menu). */
export type ActionKey = string | number;

const MAPPED_KEYS: ReadonlySet<string> = new Set(Object.values(KEYS));

export const isMappedKey = (key: string): boolean => MAPPED_KEYS.has(key);
