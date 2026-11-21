// Layout of the stored JSON: { version: 1, <preferenceKey>: { ... }, ... }

import { clone } from './persistence.ts';

export const PREFS_VERSION = 1;

export type PrefsData = Record<string, unknown>;

// Many MV games keep the default package.json name, and NW.js keys
// localStorage by that name — without the title, games would share settings.
export const prefsStorageKey = (gameTitle: string): string =>
  `Cheat_Menu.prefs.${gameTitle}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * `writable: false` for data written by a newer plugin version: overwriting
 * it would lose that version's settings when someone downgrades.
 */
export function parsePrefs(raw: string | null): {
  data: PrefsData;
  writable: boolean;
} {
  if (raw === null) return { data: {}, writable: true };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { data: {}, writable: true };
  }
  if (!isRecord(parsed) || typeof parsed.version !== 'number') {
    return { data: {}, writable: true };
  }
  if (parsed.version > PREFS_VERSION) return { data: {}, writable: false };
  if (parsed.version < PREFS_VERSION) return { data: {}, writable: true };

  const data: PrefsData = { ...parsed };
  delete data.version;
  return { data, writable: true };
}

export const serializePrefs = (data: PrefsData): string =>
  JSON.stringify({ ...data, version: PREFS_VERSION });

const kindOf = (value: unknown): string =>
  value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;

/**
 * Defaults overlaid with stored values of known keys of the same kind. Unlike
 * save files, localStorage is easy to edit by hand, so a value of the wrong
 * type falls back to its default instead of reaching the menu. A `null`
 * default accepts any value.
 */
export function readPrefSlice<S extends object>(
  defaults: S,
  stored: unknown,
): S {
  const result = clone(defaults);
  if (!isRecord(stored)) return result;
  for (const key of Object.keys(result) as (keyof S & string)[]) {
    if (!(key in stored)) continue;
    const fallback = kindOf(result[key]);
    if (fallback === 'null' || fallback === kindOf(stored[key])) {
      result[key] = clone(stored[key]) as S[typeof key];
    }
  }
  return result;
}
