import { patchMethod } from './patch.ts';

export type SaveHookHandlers = {
  /** before the engine sets up a new game */
  beforeNewGame: () => void;
  /** before the engine loads a save file */
  beforeLoad: () => void;
  /** before the engine writes a save file */
  beforeSave: () => void;
};

let installed = false;

/**
 * Hooks DataManager. The handlers run *before* the original method and the
 * original's return value is passed through untouched (MV returns booleans,
 * other engines may return promises).
 */
export function installSaveHooks(handlers: SaveHookHandlers): void {
  if (installed) return;
  installed = true;

  patchMethod(
    DataManager,
    'setupNewGame',
    (original) =>
      function (this: typeof DataManager) {
        handlers.beforeNewGame();
        return original.call(this);
      },
  );

  patchMethod(
    DataManager,
    'loadGame',
    (original) =>
      function (this: typeof DataManager, savefileId: number) {
        handlers.beforeLoad();
        return original.call(this, savefileId);
      },
  );

  patchMethod(
    DataManager,
    'saveGame',
    (original) =>
      function (this: typeof DataManager, savefileId: number) {
        handlers.beforeSave();
        return original.call(this, savefileId);
      },
  );
}
