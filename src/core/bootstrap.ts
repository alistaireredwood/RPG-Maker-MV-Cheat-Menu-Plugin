import { installBootHook } from './engine/bootHook.ts';
import { installSaveHooks } from './engine/saveHooks.ts';
import { installExtensions, type ExtensionOptions } from './extensions.ts';
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
  /** Public api handed to game-specific extensions (`window.CheatMenuExtensions`). */
  extensions?: ExtensionOptions<unknown>;
};

function resetSession(): void {
  store.isOverlayOpenable = true;
  store.restored = false;
  resetOverlay();
  startRenderTimer();
}

let booted = false;

/** `features` order = order in the main menu grid. */
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

  if (options.extensions) {
    const host = installExtensions(window, options.extensions);
    // once the game boots, saves may be restored — a feature registered
    // after that would start from defaults and overwrite its saved slice
    installBootHook(host.close);
  }
}
