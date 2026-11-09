// Adapter for feature files that are not migrated to src/features/<name>/
// yet: their state lives on the CheatMenu singleton; the adapter mirrors it
// into / out of the feature's persisted slice. Remove with CheatMenu.ts.
import CheatMenu from './CheatMenu.ts';
import type { Feature } from './core/feature.ts';
import { clone } from './core/persistence.ts';
import type { CheatMenuT, LegacyMenu } from './types/CheatMenu';

type LegacyKey = keyof CheatMenuT & string;
export type LegacyState = Record<string, unknown>;

const legacy = CheatMenu as unknown as Record<string, unknown>;

/**
 * Wraps a not-yet-migrated feature file.
 * `fields`: slice key → [CheatMenu field it mirrors, default value].
 */
export function legacyFeature(def: {
  id: string;
  menus: readonly (readonly [menuId: string, menu: LegacyMenu])[];
  fields?: Record<string, readonly [LegacyKey, unknown]>;
  onNewGame?: () => void;
  onLoad?: () => void;
  onStateRestored?: () => void;
}): Feature<LegacyState> {
  const fields = Object.entries(def.fields ?? {});
  const defaults: LegacyState | undefined = def.fields
    ? Object.fromEntries(fields.map(([key, [, value]]) => [key, value]))
    : undefined;

  return {
    id: def.id,
    state: defaults,
    menus: def.menus.map(([id, menu]) => ({
      id,
      name: menu.name,
      render: () => menu.render(),
    })),
    onNewGame: def.onNewGame,
    onLoad: def.onLoad,
    onStateRestored(state) {
      for (const [key, [legacyKey]] of fields) {
        legacy[legacyKey] = clone(state[key]);
      }
      def.onStateRestored?.();
    },
    onSave(state) {
      for (const [key, [legacyKey]] of fields) {
        state[key] = clone(legacy[legacyKey]);
      }
    },
    migrateV1(v1) {
      const slice: LegacyState = {};
      for (const [key, [legacyKey]] of fields) {
        if (legacyKey in v1) slice[key] = v1[legacyKey];
      }
      return slice;
    },
  };
}
