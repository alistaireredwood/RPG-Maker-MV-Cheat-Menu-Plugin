// Pure save-format logic (no engine globals) — unit tested in persistence.test.ts.
//
// v2 layout of $gameSystem.CheatMenu:
//   { version: 2, core: { position, currentMenuId }, <featureId>: { ... }, ... }
//
// v1 (everything before v2) was a flat object of CheatMenu fields
// (`position`, `currentMenuIndex`, `itemSelection`, ...), without `version`.

export const SAVE_VERSION = 2;

export type CoreSlice = {
  position: number;
  currentMenuId: string | null;
};

export const CORE_DEFAULTS: Readonly<CoreSlice> = {
  position: 1,
  currentMenuId: null,
};

export type SaveData = {
  version: typeof SAVE_VERSION;
  core: Partial<CoreSlice>;
  [sliceId: string]: unknown;
};

export type MigrationSource = {
  id: string;
  migrateV1?: (v1: Readonly<Record<string, unknown>>) => object | undefined;
};

export type MigrationContext = {
  features: readonly MigrationSource[];
  /** Menu ids in the order the v1 menu used — maps `currentMenuIndex` to an id. */
  v1MenuOrder: readonly string[];
};

/** Deep copy for JSON-safe data — breaks aliasing between live state and saves. */
export const clone = <T>(value: T): T =>
  value !== null && typeof value === 'object'
    ? JSON.parse(JSON.stringify(value))
    : value;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export function isV2(raw: unknown): raw is SaveData {
  return isRecord(raw) && raw.version === SAVE_VERSION;
}

export function migrateV1(
  v1: Readonly<Record<string, unknown>>,
  ctx: MigrationContext,
): SaveData {
  const core: Partial<CoreSlice> = {};
  if (typeof v1.position === 'number') core.position = v1.position;
  if (typeof v1.currentMenuIndex === 'number') {
    core.currentMenuId = ctx.v1MenuOrder[v1.currentMenuIndex] ?? null;
  }

  const data: SaveData = { version: SAVE_VERSION, core };
  for (const feature of ctx.features) {
    if (!feature.migrateV1) continue;
    let slice: object | undefined;
    try {
      slice = feature.migrateV1(v1);
    } catch (e) {
      console.error(`[CheatMenu] v1 migration of "${feature.id}" failed:`, e);
      continue;
    }
    if (slice && Object.keys(slice).length > 0) data[feature.id] = clone(slice);
  }
  return data;
}

/**
 * Any stored value → v2 save data. `null` when there is nothing stored or the
 * format is unknown (e.g. written by a newer plugin version).
 */
export function migrate(raw: unknown, ctx: MigrationContext): SaveData | null {
  if (!isRecord(raw)) return null;
  if (isV2(raw)) return raw;
  if ('version' in raw) return null;
  return migrateV1(raw, ctx);
}

/**
 * Defaults overlaid with the saved values of *known* keys only: a save written
 * by another plugin version may carry fields that would clobber runtime state.
 */
export function readSlice<S extends object>(defaults: S, saved: unknown): S {
  const result = clone(defaults);
  if (!isRecord(saved)) return result;
  for (const key of Object.keys(result) as (keyof S & string)[]) {
    if (key in saved) result[key] = clone(saved[key]) as S[typeof key];
  }
  return result;
}

/**
 * New save data from the live slices. Slices of features that are not
 * registered right now are carried over, so removing a feature and adding it
 * back later doesn't lose its saved state.
 */
export function writeSave(
  previous: SaveData | null,
  core: CoreSlice,
  slices: Readonly<Record<string, object>>,
): SaveData {
  const data: SaveData = { ...(previous ? clone(previous) : {}) } as SaveData;
  data.version = SAVE_VERSION;
  data.core = clone(core);
  for (const id of Object.keys(slices)) data[id] = clone(slices[id]);
  return data;
}

export function renameV1Keys<S extends object>(
  v1: Readonly<Record<string, unknown>>,
  keys: { readonly [K in keyof S]?: string },
): Partial<S> {
  const slice: Partial<S> = {};
  for (const [sliceKey, v1Key] of Object.entries(keys) as [keyof S, string][]) {
    if (v1Key in v1) slice[sliceKey] = v1[v1Key] as S[keyof S];
  }
  return slice;
}
