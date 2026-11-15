import { patchMethod } from './patch.ts';

/**
 * `Scene_Boot.start` is the first point where every plugin script has run,
 * and it calls `DataManager.setupNewGame` itself — the handler goes before it,
 * while the menu still can't be opened.
 */
export function installBootHook(handler: () => void): void {
  let booted = false;
  patchMethod(
    Scene_Boot.prototype,
    'start',
    (original) =>
      function (this: Scene_Boot) {
        if (!booted) {
          booted = true;
          handler();
        }
        return original.call(this);
      },
  );
}
