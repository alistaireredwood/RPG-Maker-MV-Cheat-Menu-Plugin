import { CORE_DEFAULTS } from './persistence.ts';

export const store = {
  /** persisted state was restored since the last load / new game */
  restored: false,
  /** set once a game is loaded / started — the menu can't open on the title screen */
  isOverlayOpenable: false,
  isOpen: false,
  isPoppedOut: false,

  // persisted in the `core` slice
  position: CORE_DEFAULTS.position,
  /** id of the open sub-menu, `null` = main grid */
  currentMenuId: CORE_DEFAULTS.currentMenuId as string | null,
};
