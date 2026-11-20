import type { ActionKey } from '@src/core/input/keymap.ts';

export const keyHint = (key: ActionKey): string =>
  `<span class="cheat-menu-key">${key}</span>`;
