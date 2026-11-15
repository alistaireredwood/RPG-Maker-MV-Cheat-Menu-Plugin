// Settings that belong to the game, not to a save slot (display names, menu
// layout): a new game or another save must not reset them, so they live in
// localStorage instead of $gameSystem.

import { clone } from './persistence.ts';
import {
  parsePrefs,
  prefsStorageKey,
  readPrefSlice,
  serializePrefs,
  type PrefsData,
} from './preferencesFormat.ts';

type Loaded = {
  /** `null` while no game data is loaded: kept in memory only */
  storageKey: string | null;
  data: PrefsData;
  writable: boolean;
};

let loaded: Loaded | null = null;

function currentStorageKey(): string | null {
  const title =
    typeof $dataSystem !== 'undefined' ? $dataSystem?.gameTitle : undefined;
  return typeof title === 'string' ? prefsStorageKey(title) : null;
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function load(): Loaded {
  const storageKey = currentStorageKey();
  if (loaded?.storageKey !== storageKey) {
    const raw = storageKey === null ? null : readStorage(storageKey);
    loaded = { storageKey, ...parsePrefs(raw) };
  }
  return loaded;
}

function persist(doc: Loaded, key: string, value: object): void {
  doc.data[key] = clone(value);
  if (doc.storageKey === null || !doc.writable) return;
  try {
    localStorage.setItem(doc.storageKey, serializePrefs(doc.data));
  } catch {
    // storage unavailable — the change lasts until the game is closed
  }
}

export type Preference<T extends object> = {
  /** The live value: the same object until the game data changes. */
  get: () => Readonly<T>;
  /** Mutates the live value and writes it right away. */
  update: (change: (value: T) => void) => void;
  reset: () => void;
};

/**
 * Only declares the preference — storage is read on the first `get` /
 * `update`, so this is safe at module scope.
 */
export function definePreference<T extends object>(
  key: string,
  defaults: T,
): Preference<T> {
  const initial = clone(defaults);
  let live: T | null = null;
  let liveFrom: Loaded | null = null;

  const current = (): { doc: Loaded; value: T } => {
    const doc = load();
    if (live === null || liveFrom !== doc) {
      live = readPrefSlice(initial, doc.data[key]);
      liveFrom = doc;
    }
    return { doc, value: live };
  };

  return {
    get: () => current().value,
    update(change) {
      const { doc, value } = current();
      change(value);
      persist(doc, key, value);
    },
    reset() {
      const { doc, value } = current();
      const fresh = clone(initial) as Record<string, unknown>;
      const target = value as Record<string, unknown>;
      for (const k of Object.keys(target)) delete target[k];
      Object.assign(target, fresh);
      persist(doc, key, value);
    },
  };
}
