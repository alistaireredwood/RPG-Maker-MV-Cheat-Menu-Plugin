import { patchMethod } from './patch.ts';

export type SaveHookHandlers = {
  beforeNewGame: () => void;
  beforeLoad: () => void;
  beforeSave: () => void;
};

let installed = false;

/**
 * Handlers run *before* the original method and its return value is passed
 * through untouched: MV returns booleans, other engines may return promises.
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
