import { CORE_DEFAULTS } from './persistence.ts';

export const store = {
  restored: false,
  isOverlayOpenable: false,
  isOpen: false,
  isPoppedOut: false,
  position: CORE_DEFAULTS.position,
  currentMenuId: CORE_DEFAULTS.currentMenuId as string | null,
};
