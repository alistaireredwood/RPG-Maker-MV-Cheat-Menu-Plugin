import type { Feature, FeatureHook, MenuEntry } from './feature.ts';
import { clone, readSlice } from './persistence.ts';

type Registered = {
  feature: Feature<object>;
  /** live state object — mutated in place, never replaced */
  state: object;
};

const registered: Registered[] = [];
const menus: { entry: MenuEntry<object>; owner: Registered }[] = [];

export function registerFeatures(features: readonly Feature<object>[]): void {
  const featureIds = new Set(registered.map((r) => r.feature.id));
  const menuIds = new Set(menus.map((m) => m.entry.id));

  for (const feature of features) {
    if (featureIds.has(feature.id) || feature.id === 'core') {
      throw new Error(`[CheatMenu] duplicate feature id "${feature.id}"`);
    }
    featureIds.add(feature.id);

    const owner: Registered = { feature, state: clone(feature.state ?? {}) };
    registered.push(owner);

    for (const entry of feature.menus) {
      if (menuIds.has(entry.id)) {
        throw new Error(`[CheatMenu] duplicate menu id "${entry.id}"`);
      }
      menuIds.add(entry.id);
      menus.push({ entry, owner });
    }
  }
}

export const getFeatures = (): readonly Feature<object>[] =>
  registered.map((r) => r.feature);

/** Menu entries in display order. */
export const getMenus = (): readonly MenuEntry<object>[] =>
  menus.map((m) => m.entry);

export const findMenu = (id: string | null) =>
  id === null ? undefined : menus.find((m) => m.entry.id === id);

/** Runs `render` of a menu with its owner's live state. */
export function renderMenuEntry(
  id: string,
  ui: Parameters<MenuEntry['render']>[0],
): void {
  const menu = findMenu(id);
  if (menu) menu.entry.render(ui, menu.owner.state);
}

/** Calls `hook` on every feature; one failing feature doesn't stop the rest. */
export function emit(hook: FeatureHook): void {
  for (const { feature, state } of registered) {
    try {
      feature[hook]?.(state);
    } catch (e) {
      console.error(`[CheatMenu] ${feature.id}.${hook} failed:`, e);
    }
  }
}

/** Replaces every live state with defaults overlaid by `saved[featureId]`. */
export function restoreStates(saved: Readonly<Record<string, unknown>> | null) {
  for (const { feature, state } of registered) {
    const fresh = readSlice(feature.state ?? {}, saved?.[feature.id]);
    const live = state as Record<string, unknown>;
    for (const key of Object.keys(live)) delete live[key];
    Object.assign(live, fresh);
  }
}

/** Current live states keyed by feature id (only features that have state). */
export function snapshotStates(): Record<string, object> {
  const result: Record<string, object> = {};
  for (const { feature, state } of registered) {
    if (feature.state) result[feature.id] = state;
  }
  return result;
}
