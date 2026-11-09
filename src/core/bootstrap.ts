import { installSaveHooks } from './engine/saveHooks.ts';
import type { Feature } from './feature.ts';
import { installKeyboard, onKeyDown } from './input/keyboard.ts';
import { emit, registerFeatures } from './registry.ts';
import { configureSession, saveSession } from './session.ts';
import { store } from './store.ts';
import { resetOverlay, startRenderTimer, installUi } from './ui/overlay.ts';
import { installPopout } from './ui/popout.ts';

export type BootstrapOptions = {
  /** Menu ids in the order of the pre-v2 menu (save migration of the open menu). */
  v1MenuOrder: readonly string[];
};

/** A game is (re)starting: close the menu, state gets restored on next open. */
function resetSession(): void {
  store.isOverlayOpenable = true;
  store.restored = false;
  resetOverlay();
  startRenderTimer();
}

let booted = false;

/** Starts the plugin. `features` order = order in the main menu grid. */
export function bootstrap(
  features: readonly Feature<object>[],
  options: BootstrapOptions,
): void {
  if (booted) throw new Error('[CheatMenu] bootstrap() called twice');
  booted = true;

  registerFeatures(features);
  configureSession(options);

  installUi();
  installPopout({ onKeyDown });
  installKeyboard();
  installSaveHooks({
    beforeNewGame: () => {
      resetSession();
      emit('onNewGame');
    },
    beforeLoad: () => {
      resetSession();
      emit('onLoad');
    },
    beforeSave: saveSession,
  });

  emit('onInit');
}
