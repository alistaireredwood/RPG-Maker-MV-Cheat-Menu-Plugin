import { patchMethod } from './patch.ts';

type WithIsGameActive = { isGameActive: () => boolean };

let restore: (() => void) | null = null;

/**
 * RPG Maker can pause/skip updates while its window is unfocused — clicking
 * the pop-out window would otherwise freeze the game.
 */
export function forceGameActive(): void {
  const sm = SceneManager as unknown as Partial<WithIsGameActive>;
  if (restore || typeof sm.isGameActive !== 'function') return;
  restore = patchMethod(
    sm as WithIsGameActive,
    'isGameActive',
    () => () => true,
  );
}

export function releaseGameActive(): void {
  restore?.();
  restore = null;
}
