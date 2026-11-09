import {
  CORE_DEFAULTS,
  migrate,
  readSlice,
  writeSave,
  type MigrationContext,
} from './persistence.ts';
import {
  emit,
  getFeatures,
  restoreStates,
  snapshotStates,
} from './registry.ts';
import { store } from './store.ts';

let v1MenuOrder: readonly string[] = [];

export function configureSession(options: {
  v1MenuOrder: readonly string[];
}): void {
  v1MenuOrder = options.v1MenuOrder;
}

const migrationContext = (): MigrationContext => ({
  features: getFeatures(),
  v1MenuOrder,
});

/** What the current `$gameSystem` holds, as v2 (null = nothing / unknown format). */
const loadSaved = () =>
  migrate(
    typeof $gameSystem !== 'undefined' ? $gameSystem?.CheatMenu : undefined,
    migrationContext(),
  );

/**
 * Restores core + feature state from the current `$gameSystem` (defaults when
 * it holds nothing). Called lazily on the first menu open after a load / new
 * game, when the game objects already exist.
 */
export function restoreSession(): void {
  const saved = loadSaved();
  const core = readSlice({ ...CORE_DEFAULTS }, saved?.core);
  store.position = core.position;
  store.currentMenuId = core.currentMenuId;

  restoreStates(saved);
  emit('onStateRestored');
  store.restored = true;
}

/** Writes core + feature state into `$gameSystem` right before the engine saves. */
export function saveSession(): void {
  // never opened since the last load: live state still belongs to the previous
  // session — keep what the loaded save holds instead of overwriting it
  if (!store.restored) return;

  emit('onSave');
  $gameSystem.CheatMenu = writeSave(
    loadSaved(),
    { position: store.position, currentMenuId: store.currentMenuId },
    snapshotStates(),
  );
}
